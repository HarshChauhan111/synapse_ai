/**
 * Database Migration Script
 * Run: npm run db:migrate
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'synapse_ai',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  console.log('🔄 Starting database migration...');
  
  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('✅ Database migration completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - courses');
    console.log('   - course_progress');
    console.log('   - quiz_history');
    console.log('   - course_summary (view)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
