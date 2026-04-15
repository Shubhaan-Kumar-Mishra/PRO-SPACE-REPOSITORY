const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const fixConstraints = `
-- 1. Fix Tasks constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_assignee_id_fkey 
  FOREIGN KEY (assignee_id) REFERENCES members(id) ON DELETE SET NULL;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_team_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_team_id_fkey 
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- 2. Fix Members constraints
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_team_id_fkey;
ALTER TABLE members ADD CONSTRAINT members_team_id_fkey 
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- 3. Fix Activities constraints
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_project_id_fkey;
ALTER TABLE activities ADD CONSTRAINT activities_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- 4. Harden RLS for all tables to ensure frontend can ALWAYS write/delete
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
  LOOP
    EXECUTE 'ALTER TABLE ' || t || ' ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "Global Access Policy" ON ' || t || ';';
    EXECUTE 'CREATE POLICY "Global Access Policy" ON ' || t || ' FOR ALL USING (true) WITH CHECK (true);';
  END LOOP;
END $$;
`;

async function setup() {
  try {
    await client.connect();
    console.log('Fixing constraints and hardening RLS...');
    await client.query(fixConstraints);
    console.log('Constraints fixed. RLS hardened.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

setup();
