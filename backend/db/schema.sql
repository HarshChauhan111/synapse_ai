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
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

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
