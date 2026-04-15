const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function check() {
  try {
    await client.connect();
    const tables = ['tasks', 'projects', 'activities', 'members', 'teams'];
    for (const table of tables) {
      const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
      console.log(`--- ${table} ---`);
      console.table(res.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
