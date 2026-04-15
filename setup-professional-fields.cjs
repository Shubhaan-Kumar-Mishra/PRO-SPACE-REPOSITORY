const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const schema = `
-- Update tasks table with advanced professional fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'low';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS team_id TEXT REFERENCES teams(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimate INTEGER DEFAULT 1;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;

-- Enable RLS (already enabled but ensuring policies)
DROP POLICY IF EXISTS "Public access" ON tasks;
CREATE POLICY "Public access" ON tasks FOR ALL USING (true) WITH CHECK (true);
`;

async function setup() {
  try {
    console.log('Connecting to Supabase Postgres...');
    await client.connect();
    console.log('Connected.');

    console.log('Upgrading tasks schema for advanced professional features...');
    await client.query(schema);
    console.log('Schema upgraded.');

  } catch (err) {
    console.error('Error upgrading database:', err);
  } finally {
    await client.end();
  }
}

setup();
