const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const progressLogic = `
-- Function to calculate project progress
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_tasks INT;
  completed_tasks INT;
  progress_percent INT;
  pid TEXT;
BEGIN
  -- Determine the project ID
  IF TG_OP = 'DELETE' THEN
    pid := OLD.project_id;
  ELSE
    pid := NEW.project_id;
  END IF;

  -- Count tasks
  SELECT COUNT(*) INTO total_tasks FROM tasks WHERE project_id = pid;
  
  IF total_tasks = 0 THEN
    progress_percent := 0;
  ELSE
    SELECT COUNT(*) INTO completed_tasks FROM tasks WHERE project_id = pid AND status = 'done';
    progress_percent := (completed_tasks * 100) / total_tasks;
  END IF;

  -- Update project table
  UPDATE projects SET progress = progress_percent WHERE id = pid;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run after any task modification
DROP TRIGGER IF EXISTS tr_task_changed ON tasks;
CREATE TRIGGER tr_task_changed
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_project_progress();
`;

async function setup() {
  try {
    console.log('Connecting to Supabase Postgres...');
    await client.connect();
    console.log('Connected.');

    console.log('Injecting automated progress logic (Triggers)...');
    await client.query(progressLogic);
    console.log('Automated progress logic active.');

    // Recalculate for all existing projects once
    const updateQuery = `
      UPDATE projects p
      SET progress = COALESCE(
        (SELECT (COUNT(*) FILTER (WHERE status = 'done') * 100) / NULLIF(COUNT(*), 0)
         FROM tasks t WHERE t.project_id = p.id),
        0
      );
    `;
    await client.query(updateQuery);
    console.log('Existing projects progress recalculated.');

  } catch (err) {
    console.error('Error injecting progress logic:', err);
  } finally {
    await client.end();
  }
}

setup();
