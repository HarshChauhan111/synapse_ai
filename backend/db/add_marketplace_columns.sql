-- SYNAPSE AI - Marketplace Migration
-- Run this in your PostgreSQL database (pgAdmin or psql)
-- This adds the required columns for the marketplace feature

-- Step 1: Add marketplace columns to courses table
DO $$
BEGIN
    -- Add is_public column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='is_public') THEN
        ALTER TABLE courses ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_public column';
    ELSE
        RAISE NOTICE 'is_public column already exists';
    END IF;
    
    -- Add view_count column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='view_count') THEN
        ALTER TABLE courses ADD COLUMN view_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added view_count column';
    ELSE
        RAISE NOTICE 'view_count column already exists';
    END IF;
    
    -- Add tags column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='tags') THEN
        ALTER TABLE courses ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Added tags column';
    ELSE
        RAISE NOTICE 'tags column already exists';
    END IF;
    
    -- Add category column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='category') THEN
        ALTER TABLE courses ADD COLUMN category VARCHAR(100);
        RAISE NOTICE 'Added category column';
    ELSE
        RAISE NOTICE 'category column already exists';
    END IF;
END $$;

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_courses_is_public ON courses(is_public);

-- Step 3: Verify the columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND column_name IN ('is_public', 'view_count', 'tags', 'category');

-- Done!
SELECT 'Migration completed! You can now publish courses to the marketplace.' as status;
