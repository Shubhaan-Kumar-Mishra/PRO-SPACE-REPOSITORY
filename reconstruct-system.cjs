const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const reconstruct = `
-- 1. DROP and RECREATE activities with correct professional schema
DROP TABLE IF EXISTS activities CASCADE;

CREATE TABLE activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure RLS is enabled and public policy is robust
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access Policy" ON activities;
CREATE POLICY "Public Access Policy" ON activities FOR ALL USING (true) WITH CHECK (true);

-- 3. Fix all existing FKs across the system to ensure NO deletion blockers
-- Tasks
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES members(id) ON DELETE SET NULL;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_team_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Members
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_team_id_fkey;
ALTER TABLE members ADD CONSTRAINT members_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- 4. Re-inject Logging Triggers
CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activities (user_name, action, target, project_id)
    VALUES ('System', 'created task', NEW.title, NEW.project_id);
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO activities (user_name, action, target, project_id)
    VALUES ('System', 'moved task to ' || NEW.status, NEW.title, NEW.project_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_log_task ON tasks;
CREATE TRIGGER tr_log_task AFTER INSERT OR UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION log_task_activity();

CREATE OR REPLACE FUNCTION log_project_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activities (user_name, action, target, project_id)
    VALUES ('System', 'initiated project', NEW.name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_log_project ON projects;
CREATE TRIGGER tr_log_project AFTER INSERT ON projects FOR EACH ROW EXECUTE FUNCTION log_project_activity();
`;

async function setup() {
  try {
    await client.connect();
    console.log('Reconstructing activities and fixing system constraints...');
    await client.query(reconstruct);
    console.log('System reconstruction complete.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

setup();
