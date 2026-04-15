const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const triggerSQL = `
-- ============================================================
-- FULL TRIGGER REBUILD: Progress + Activity Logging
-- ============================================================

-- 1. DROP ALL EXISTING TRIGGERS (Clean slate, no conflicts)
DROP TRIGGER IF EXISTS tr_task_progress ON tasks;
DROP TRIGGER IF EXISTS tr_task_changed ON tasks;
DROP TRIGGER IF EXISTS tr_log_task ON tasks;
DROP TRIGGER IF EXISTS tr_log_project ON projects;
DROP TRIGGER IF EXISTS tr_log_member ON members;
DROP FUNCTION IF EXISTS fn_update_progress() CASCADE;
DROP FUNCTION IF EXISTS fn_omni_logger() CASCADE;
DROP FUNCTION IF EXISTS fn_log_activity() CASCADE;

-- ============================================================
-- 2. PROGRESS AUTOMATION
-- Calculates project progress based on completed tasks ratio
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_progress() RETURNS TRIGGER AS $$
DECLARE
  pid TEXT;
  total INT;
  completed INT;
  new_progress INT;
BEGIN
  -- Determine which project to update
  pid := COALESCE(NEW.project_id, OLD.project_id);
  
  IF pid IS NULL THEN
    RETURN NULL;
  END IF;

  -- Count tasks
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'done')
  INTO total, completed
  FROM tasks
  WHERE project_id = pid;

  -- Calculate percentage
  IF total = 0 THEN
    new_progress := 0;
  ELSE
    new_progress := ROUND((completed::NUMERIC / total::NUMERIC) * 100);
  END IF;

  -- Update the project
  UPDATE projects SET progress = new_progress WHERE id = pid;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_task_progress
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION fn_update_progress();

-- ============================================================
-- 3. OMNI-LOGGER: Captures every mutation as an activity
-- ============================================================
CREATE OR REPLACE FUNCTION fn_omni_logger() RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'projects' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO activities (user_name, action, target, project_id)
      VALUES ('System', 'initiated project', NEW.name, NEW.id);
    ELSIF TG_OP = 'DELETE' THEN
      INSERT INTO activities (user_name, action, target)
      VALUES ('System', 'archived project', OLD.name);
    END IF;

  ELSIF TG_TABLE_NAME = 'tasks' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO activities (user_name, action, target, project_id)
      VALUES ('System', 'deployed task', NEW.title, NEW.project_id);
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO activities (user_name, action, target, project_id)
      VALUES ('System', 'moved "' || NEW.title || '" to ' || NEW.status, NEW.title, NEW.project_id);
    ELSIF TG_OP = 'DELETE' THEN
      INSERT INTO activities (user_name, action, target, project_id)
      VALUES ('System', 'purged task', OLD.title, OLD.project_id);
    END IF;

  ELSIF TG_TABLE_NAME = 'members' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO activities (user_name, action, target)
      VALUES ('System', 'enlisted member', NEW.first_name || ' ' || NEW.last_name);
    ELSIF TG_OP = 'DELETE' THEN
      INSERT INTO activities (user_name, action, target)
      VALUES ('System', 'removed member', OLD.first_name || ' ' || OLD.last_name);
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_log_project
  AFTER INSERT OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION fn_omni_logger();

CREATE TRIGGER tr_log_task
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION fn_omni_logger();

CREATE TRIGGER tr_log_member
  AFTER INSERT OR DELETE ON members
  FOR EACH ROW EXECUTE FUNCTION fn_omni_logger();
`;

async function rebuild() {
  try {
    await client.connect();
    console.log('REBUILDING ALL TRIGGERS...');
    await client.query(triggerSQL);

    // Verify triggers exist
    const res = await client.query(`
      SELECT trigger_name, event_object_table, action_timing, event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);
    
    console.log('\n--- ACTIVE TRIGGERS ---');
    res.rows.forEach(r => {
      console.log(`  ✅ ${r.trigger_name} → ${r.event_object_table} (${r.action_timing} ${r.event_manipulation})`);
    });

    // Recalculate progress for all existing projects
    const projects = await client.query(`SELECT id FROM projects`);
    for (const p of projects.rows) {
      await client.query(`
        UPDATE projects SET progress = COALESCE(
          (SELECT (COUNT(*) FILTER (WHERE status = 'done') * 100) / NULLIF(COUNT(*), 0)
           FROM tasks WHERE project_id = $1), 0
        ) WHERE id = $1
      `, [p.id]);
    }
    console.log(`\n✅ Recalculated progress for ${projects.rows.length} projects.`);
    console.log('ALL TRIGGERS OPERATIONAL. PROGRESS + NOTIFICATIONS ACTIVE.');
  } catch (err) {
    console.error('TRIGGER REBUILD FAILURE:', err);
  } finally {
    await client.end();
  }
}

rebuild();
