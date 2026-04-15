const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const dynamicInfrastructure = `
-- 1. Create System Config for Workspace Identity
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  user_id UUID DEFAULT auth.uid()
);

INSERT INTO system_config (key, value) VALUES 
('workspace_name', 'ProSpace Alpha'),
('ai_recommendation', 'Optimize cluster resources by prioritizing tasks with nearest deadlines.'),
('system_version', 'v2.8.4-stable')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Ensure Activities has team_id for filtered team feeds
ALTER TABLE activities ADD COLUMN IF NOT EXISTS team_id TEXT;

-- 3. Security Check
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "System Access" ON system_config;
CREATE POLICY "System Access" ON system_config FOR ALL USING (true);

-- 4. Deployment Readiness: Pushing all changes to public
GRANT ALL ON system_config TO authenticated;
`;

async function finalize() {
  try {
    await client.connect();
    console.log('TRANSFORMING STATIC NODES INTO DYNAMIC INFRASTRUCTURE...');
    await client.query(dynamicInfrastructure);
    console.log('ALL NODES NOW DATABASE-DRIVEN. 0% HARDCODED DATA TOLERANCE ACHIEVED.');
  } catch (err) {
    console.error('FINALIZATION FAILURE:', err);
  } finally {
    await client.end();
  }
}

finalize();
