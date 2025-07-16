require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkDatabase() {
  console.log('🔍 Checking database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');

    // Test if we can query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database query successful:', result.rows[0]);

    client.release();
    await pool.end();
    console.log('✅ Database check complete');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🛠️  Troubleshooting steps:');
    console.log('1. Ensure PostgreSQL is running');
    console.log('2. Check if Docker container is up: docker ps');
    console.log('3. Start database: docker-compose up -d');
    console.log('4. Verify DATABASE_URL in .env.local');
    process.exit(1);
  }
}

checkDatabase();
