// Load environment variables first
require('dotenv').config({ path: '.env.local' });

console.log('✅ Environment loaded, DATABASE_URL:', !!process.env.DATABASE_URL);

// Import the compiled TypeScript
const { execSync } = require('child_process');

try {
  console.log('🌱 Running database seed...');
  execSync('npx tsx src/db/seed.ts', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('✅ Seed completed successfully');
} catch (error) {
  console.error('❌ Seed failed:', error.message);
  process.exit(1);
}