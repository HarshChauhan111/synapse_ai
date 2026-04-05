-- Synapse AI Database Schema
-- PostgreSQL Migration Script

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Backward compatibility for older databases created before profile columns existed
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  chapter_duration VARCHAR(50),
  difficulty_level VARCHAR(50),
  target_audience TEXT,
  thumbnail_url TEXT,
  thumbnail_photographer VARCHAR(255),
  thumbnail_source VARCHAR(50),
  selected_chapter_count INTEGER NOT NULL,
  chapters_data JSONB DEFAULT '{}',
  -- Marketplace fields
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  category VARCHAR(100),
  -- PDF source fields
  source_type VARCHAR(20) DEFAULT 'topic', -- 'topic' or 'pdf'
  source_pdf_names TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- Course progress table
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID UNIQUE NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  current_chapter_index INTEGER DEFAULT 0,
  visited_chapters INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on course_id
CREATE INDEX IF NOT EXISTS idx_progress_course_id ON course_progress(course_id);

-- Quiz history table
CREATE TABLE IF NOT EXISTS quiz_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapters_quizzed INTEGER[] NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  answers_data JSONB DEFAULT '[]',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quiz lookups
CREATE INDEX IF NOT EXISTS idx_quiz_course_id ON quiz_history(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_user_id ON quiz_history(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_completed_at ON quiz_history(completed_at DESC);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to courses table
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for course summary with progress
DROP VIEW IF EXISTS course_summary CASCADE;
CREATE OR REPLACE VIEW course_summary AS
SELECT 
  c.id,
  c.user_id,
  c.title,
  c.description,
  c.chapter_duration,
  c.difficulty_level,
  c.selected_chapter_count,
  c.thumbnail_url,
  c.is_public,
  c.view_count,
  c.tags,
  c.category,
  c.created_at,
  c.updated_at,
  cp.current_chapter_index,
  cp.visited_chapters,
  cp.completed,
  cp.last_accessed_at,
  COALESCE(array_length(cp.visited_chapters, 1), 0) as chapters_completed,
  CASE 
    WHEN c.selected_chapter_count > 0 
    THEN ROUND((COALESCE(array_length(cp.visited_chapters, 1), 0)::DECIMAL / c.selected_chapter_count) * 100, 1)
    ELSE 0 
  END as progress_percentage
FROM courses c
LEFT JOIN course_progress cp ON c.id = cp.course_id;

-- =============================================
-- MARKETPLACE TABLES
-- =============================================

-- Course views tracking (for unique views)
CREATE TABLE IF NOT EXISTS course_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  viewer_ip VARCHAR(45), -- For anonymous tracking
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for course views
CREATE INDEX IF NOT EXISTS idx_course_views_course_id ON course_views(course_id);
CREATE INDEX IF NOT EXISTS idx_course_views_viewer_id ON course_views(viewer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_views_unique_user ON course_views(course_id, viewer_id) WHERE viewer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_views_unique_ip ON course_views(course_id, viewer_ip) WHERE viewer_ip IS NOT NULL AND viewer_id IS NULL;

-- Index for marketplace queries (public courses)
CREATE INDEX IF NOT EXISTS idx_courses_public ON courses(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_courses_view_count ON courses(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- PDF uploads table
CREATE TABLE IF NOT EXISTS pdf_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  file_name VARCHAR(500) NOT NULL,
  file_size INTEGER,
  page_count INTEGER,
  extracted_text TEXT,
  upload_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pdf_uploads_user_id ON pdf_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_uploads_course_id ON pdf_uploads(course_id);

-- Course likes/saves (optional - for future)
CREATE TABLE IF NOT EXISTS course_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_saves_user ON course_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_course_saves_course ON course_saves(course_id);

-- View for marketplace courses (public courses with creator info)
DROP VIEW IF EXISTS marketplace_courses CASCADE;
CREATE OR REPLACE VIEW marketplace_courses AS
SELECT 
  c.id,
  c.user_id,
  c.title,
  c.description,
  c.chapter_duration,
  c.difficulty_level,
  c.target_audience,
  c.thumbnail_url,
  c.selected_chapter_count,
  c.view_count,
  c.tags,
  c.category,
  c.created_at,
  u.name as creator_name,
  u.username as creator_username,
  u.avatar_url as creator_avatar,
  (SELECT COUNT(*) FROM course_saves cs WHERE cs.course_id = c.id) as save_count
FROM courses c
JOIN users u ON c.user_id = u.id
WHERE c.is_public = TRUE;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_course_view(
  p_course_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_viewer_ip VARCHAR DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  already_viewed BOOLEAN;
BEGIN
  -- Check if already viewed by this user/IP
  IF p_viewer_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM course_views 
      WHERE course_id = p_course_id AND viewer_id = p_viewer_id
    ) INTO already_viewed;
  ELSIF p_viewer_ip IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM course_views 
      WHERE course_id = p_course_id AND viewer_ip = p_viewer_ip AND viewer_id IS NULL
    ) INTO already_viewed;
  ELSE
    already_viewed := FALSE;
  END IF;

  IF NOT already_viewed THEN
    -- Insert view record
    INSERT INTO course_views (course_id, viewer_id, viewer_ip)
    VALUES (p_course_id, p_viewer_id, p_viewer_ip)
    ON CONFLICT DO NOTHING;
    
    -- Increment view count
    UPDATE courses SET view_count = view_count + 1 WHERE id = p_course_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
