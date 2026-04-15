const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const schema = `
-- Drop existing tables if needed (optional, for clean setup)
-- DROP TABLE IF EXISTS activities, notifications, tasks, projects, members, teams CASCADE;

-- Create Teams table
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  color_class TEXT,
  bg TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Members table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  team_id TEXT REFERENCES teams(id),
  role TEXT,
  img TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  color_class TEXT,
  start_date DATE,
  end_date DATE,
  team_id TEXT REFERENCES teams(id),
  status TEXT DEFAULT 'In Progress',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create Public Policies (Allow everything for now to ENSURE it works as requested)
DROP POLICY IF EXISTS "Public access" ON teams;
CREATE POLICY "Public access" ON teams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access" ON members;
CREATE POLICY "Public access" ON members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access" ON projects;
CREATE POLICY "Public access" ON projects FOR ALL USING (true) WITH CHECK (true);
`;

const seedData = `
INSERT INTO teams (id, name, icon, description, color_class, bg) VALUES 
('t1', 'Engineering', 'ph-code', 'Core architecture and application development.', 'accent-blue', 'rgba(59, 130, 246, 0.1)'),
('t2', 'Product Design', 'ph-bezier-curve', 'UI/UX and branding operations.', 'accent-purple', 'rgba(139, 92, 246, 0.1)'),
('t3', 'Marketing', 'ph-megaphone', 'Growth and content strategy.', 'accent-orange', 'rgba(245, 158, 11, 0.1)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, name, progress, color_class, team_id, status) VALUES
('p1', 'Vision Pro Integration', 85, 'bg-blue-500', 't1', 'In Progress'),
('p2', 'Refactor Core Engine', 45, 'bg-violet-500', 't1', 'Delayed'),
('p3', 'AI Agent Dashboard', 20, 'bg-amber-500', 't2', 'In Progress')
ON CONFLICT (id) DO NOTHING;
`;

async function setup() {
  try {
    console.log('Connecting to Supabase Postgres...');
    await client.connect();
    console.log('Connected.');

    console.log('Applying schema and RLS policies...');
    await client.query(schema);
    console.log('Schema and policies applied.');

    console.log('Seeding initial data...');
    await client.query(seedData);
    console.log('Data seeded.');

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await client.end();
  }
}

setup();
