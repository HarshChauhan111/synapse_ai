// Run database migration for marketplace feature
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'synapse_ai',
  user: 'postgres',
  password: '1234',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Running marketplace migration...\n');
    
    // Add is_public column
    try {
      await client.query('ALTER TABLE courses ADD COLUMN is_public BOOLEAN DEFAULT FALSE');
      console.log('✅ Added is_public column');
    } catch (e) {
      if (e.code === '42701') console.log('ℹ️  is_public column already exists');
      else throw e;
    }
    
    // Add view_count column
    try {
      await client.query('ALTER TABLE courses ADD COLUMN view_count INTEGER DEFAULT 0');
      console.log('✅ Added view_count column');
    } catch (e) {
      if (e.code === '42701') console.log('ℹ️  view_count column already exists');
      else throw e;
    }
    
    // Add tags column
    try {
      await client.query("ALTER TABLE courses ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[]");
      console.log('✅ Added tags column');
    } catch (e) {
      if (e.code === '42701') console.log('ℹ️  tags column already exists');
      else throw e;
    }
    
    // Add category column
    try {
      await client.query('ALTER TABLE courses ADD COLUMN category VARCHAR(100)');
      console.log('✅ Added category column');
    } catch (e) {
      if (e.code === '42701') console.log('ℹ️  category column already exists');
      else throw e;
    }
    
    // Create index
    try {
      await client.query('CREATE INDEX IF NOT EXISTS idx_courses_is_public ON courses(is_public)');
      console.log('✅ Created index on is_public');
    } catch (e) {
      console.log('ℹ️  Index already exists');
    }
    
    // Verify columns
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      AND column_name IN ('is_public', 'view_count', 'tags', 'category')
    `);
    
    console.log('\n📊 Verified columns:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    console.log('🚀 You can now restart your backend and publish courses to the marketplace.\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
