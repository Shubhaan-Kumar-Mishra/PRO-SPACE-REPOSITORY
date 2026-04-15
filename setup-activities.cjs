const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const logic = `
-- Activity Tracking Table
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE
);

-- Policy
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access" ON activities;
CREATE POLICY "Public access" ON activities FOR ALL USING (true) WITH CHECK (true);

-- Function to automatically log activity for tasks
CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
DECLARE
  pname TEXT;
BEGIN
  SELECT name INTO pname FROM projects WHERE id = NEW.project_id;
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activities (user_name, action, target, project_id)
    VALUES ('System', 'created task', NEW.title, NEW.project_id);
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO activities (user_name, action, target, project_id)
    VALUES ('System', 'moved to ' || NEW.status, NEW.title, NEW.project_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task activity
DROP TRIGGER IF EXISTS tr_log_task ON tasks;
CREATE TRIGGER tr_log_task
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION log_task_activity();

-- Function to automatically log activity for projects
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

-- Trigger for project activity
DROP TRIGGER IF EXISTS tr_log_project ON projects;
CREATE TRIGGER tr_log_project
AFTER INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION log_project_activity();
`;

async function setup() {
  try {
    await client.connect();
    await client.query(logic);
    console.log('Activity logging system established.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

setup();
