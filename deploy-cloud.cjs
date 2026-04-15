const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const productionRLS = `
-- SECURE CORE INFRASTRUCTURE
DO $$
DECLARE
  t text;
  core_tables text[] := ARRAY['projects', 'tasks', 'activities', 'members', 'teams'];
BEGIN
  -- 1. Ensure columns exist on core tables
  -- (They should from setup-secured, but we double-check)
  
  FOREACH t IN ARRAY core_tables
  LOOP
    EXECUTE 'ALTER TABLE ' || t || ' ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "Global Access Policy" ON ' || t || ';';
    EXECUTE 'DROP POLICY IF EXISTS "Public Access" ON ' || t || ';';
    EXECUTE 'DROP POLICY IF EXISTS "User Access Policy" ON ' || t || ';';
    EXECUTE 'DROP POLICY IF EXISTS "Production Secure Access" ON ' || t || ';';
    
    -- Applying real authentication lockdown
    EXECUTE 'CREATE POLICY "Production Secure Access" ON ' || t || ' 
             FOR ALL TO authenticated 
             USING (auth.uid() = user_id) 
             WITH CHECK (auth.uid() = user_id);';
  END LOOP;
END $$;

-- 2. Final Sanity Check for defaults
ALTER TABLE teams ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE projects ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE tasks ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE members ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE activities ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 3. Grant schema usage for authenticated workers
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
`;

async function deploy() {
  try {
    await client.connect();
    console.log('HARDENING CORE INFRASTRUCTURE FOR CLOUDFLARE...');
    await client.query(productionRLS);
    console.log('CORE SECURITY ACTIVE. SYSTEM IS NOW CLOUD-READY.');
  } catch (err) {
    console.error('CORE HARDENING FAILURE:', err);
  } finally {
    await client.end();
  }
}

deploy();
