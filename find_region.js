const { Client } = require('pg');

async function testOldPooler() {
  const url = `postgresql://postgres:zX70oOfCtmYFTimy@db.qterfftaebnoawnzkfgu.supabase.co:6543/postgres?sslmode=no-verify`;
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log(`✅ SUCCESS: Connected to old pooler!`);
    await client.end();
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }
}

testOldPooler();
