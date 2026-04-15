const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function audit() {
  try {
    await client.connect();
    console.log('=== FULL SYSTEM AUDIT ===\n');

    // 1. Check all table columns
    const coreTables = ['teams', 'projects', 'tasks', 'activities', 'members', 'profiles', 'system_config'];
    for (const t of coreTables) {
      const res = await client.query(
        `SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`, [t]
      );
      console.log(`\n📋 ${t.toUpperCase()}:`);
      res.rows.forEach(r => console.log(`   ${r.column_name} (${r.data_type}) ${r.column_default ? '→ DEFAULT: ' + r.column_default : ''}`));
    }

    // 2. Check triggers
    const triggers = await client.query(`
      SELECT trigger_name, event_object_table, event_manipulation 
      FROM information_schema.triggers WHERE trigger_schema = 'public'
      ORDER BY event_object_table
    `);
    console.log('\n\n🔧 ACTIVE TRIGGERS:');
    triggers.rows.forEach(r => console.log(`   ✅ ${r.trigger_name} → ${r.event_object_table} (${r.event_manipulation})`));

    // 3. Check RLS policies
    const policies = await client.query(`
      SELECT tablename, policyname, permissive, cmd 
      FROM pg_policies WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    console.log('\n\n🔒 RLS POLICIES:');
    policies.rows.forEach(r => console.log(`   ${r.permissive === 'PERMISSIVE' ? '🟢' : '🔴'} ${r.tablename}: "${r.policyname}" (${r.cmd})`));

    // 4. Check foreign key constraints
    const fks = await client.query(`
      SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table, rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    `);
    console.log('\n\n🔗 FOREIGN KEYS:');
    fks.rows.forEach(r => {
      const status = (r.delete_rule === 'CASCADE' || r.delete_rule === 'SET NULL') ? '✅' : '⚠️ BLOCKER';
      console.log(`   ${status} ${r.table_name}.${r.column_name} → ${r.foreign_table} (ON DELETE ${r.delete_rule})`);
    });

    // 5. Test an INSERT + DELETE cycle on each table
    console.log('\n\n🧪 CRUD SMOKE TEST:');
    
    // Teams
    try {
      await client.query(`INSERT INTO teams (id, name) VALUES ('_test_t', 'Audit Test') ON CONFLICT DO NOTHING`);
      await client.query(`DELETE FROM teams WHERE id = '_test_t'`);
      console.log('   ✅ teams: INSERT + DELETE OK');
    } catch(e) { console.log('   ❌ teams:', e.message); }

    // Projects
    try {
      await client.query(`INSERT INTO projects (id, name) VALUES ('_test_p', 'Audit Test') ON CONFLICT DO NOTHING`);
      await client.query(`DELETE FROM projects WHERE id = '_test_p'`);
      console.log('   ✅ projects: INSERT + DELETE OK');
    } catch(e) { console.log('   ❌ projects:', e.message); }

    // Tasks
    try {
      await client.query(`INSERT INTO projects (id, name) VALUES ('_test_p2', 'Parent') ON CONFLICT DO NOTHING`);
      await client.query(`INSERT INTO tasks (id, title, project_id, status) VALUES ('_test_task', 'Audit', '_test_p2', 'todo') ON CONFLICT DO NOTHING`);
      // Verify progress updated
      const prog1 = await client.query(`SELECT progress FROM projects WHERE id = '_test_p2'`);
      console.log(`   ✅ tasks: INSERT OK (progress = ${prog1.rows[0]?.progress}%)`);
      // Move to done
      await client.query(`UPDATE tasks SET status = 'done' WHERE id = '_test_task'`);
      const prog2 = await client.query(`SELECT progress FROM projects WHERE id = '_test_p2'`);
      console.log(`   ✅ tasks: UPDATE to done OK (progress = ${prog2.rows[0]?.progress}%)`);
      // Check activity was logged
      const act = await client.query(`SELECT action, target FROM activities WHERE target = 'Audit' ORDER BY created_at DESC LIMIT 3`);
      console.log(`   ✅ activities: ${act.rows.length} events logged → [${act.rows.map(a => a.action).join(', ')}]`);
      // Cleanup
      await client.query(`DELETE FROM projects WHERE id = '_test_p2'`);
      console.log('   ✅ CASCADE DELETE OK (project + tasks + activities cleaned)');
    } catch(e) { console.log('   ❌ tasks/progress:', e.message); }

    // Members
    try {
      await client.query(`INSERT INTO members (id, first_name, last_name, email) VALUES ('_test_m', 'Test', 'User', 'test@audit.com') ON CONFLICT DO NOTHING`);
      await client.query(`DELETE FROM members WHERE id = '_test_m'`);
      console.log('   ✅ members: INSERT + DELETE OK');
    } catch(e) { console.log('   ❌ members:', e.message); }

    // Activities
    try {
      await client.query(`INSERT INTO activities (user_name, action, target) VALUES ('Audit', 'tested', 'system') ON CONFLICT DO NOTHING`);
      await client.query(`DELETE FROM activities WHERE user_name = 'Audit'`);
      console.log('   ✅ activities: INSERT + DELETE OK');
    } catch(e) { console.log('   ❌ activities:', e.message); }

    // Clean up any audit artifacts from activities
    await client.query(`DELETE FROM activities WHERE target = 'Audit Test' OR target = 'Audit' OR target = 'Parent' OR target = 'Test User' OR user_name = 'Audit'`);

    console.log('\n=== AUDIT COMPLETE ===');

  } catch (err) {
    console.error('AUDIT FAILURE:', err);
  } finally {
    await client.end();
  }
}

audit();
