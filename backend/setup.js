/**
 * Backend Setup Script
 * Run: node setup.js
 * This creates all necessary folders and files for the backend
 */

const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

// Folders to create
const folders = [
  'db',
  'routes',
  'middleware',
  'controllers'
];

// Create folders
folders.forEach(folder => {
  const folderPath = path.join(baseDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`✅ Created folder: ${folder}`);
  }
});

// ============================================
// DB FILES
// ============================================

// db/index.js
const dbIndex = `const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Or use individual params if DATABASE_URL not set
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'synapse_ai',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Query helper
const query = (text, params) => pool.query(text, params);

// Transaction helper
const getClient = () => pool.connect();

module.exports = {
  query,
  getClient,
  pool
};
`;

fs.writeFileSync(path.join(baseDir, 'db', 'index.js'), dbIndex);
console.log('✅ Created db/index.js');

// db/schema.sql
const schema = `-- Synapse AI Database Schema
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
`;

fs.writeFileSync(path.join(baseDir, 'db', 'schema.sql'), schema);
console.log('✅ Created db/schema.sql');

// db/migrate.js
const migrate = `/**
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
`;

fs.writeFileSync(path.join(baseDir, 'db', 'migrate.js'), migrate);
console.log('✅ Created db/migrate.js');

// ============================================
// MIDDLEWARE FILES
// ============================================

// middleware/auth.js
const authMiddleware = `const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * Optional auth middleware
 * Attaches user if token exists, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    }
    next();
  } catch (error) {
    // Token invalid, but continue without user
    next();
  }
};

module.exports = { auth, optionalAuth };
`;

fs.writeFileSync(path.join(baseDir, 'middleware', 'auth.js'), authMiddleware);
console.log('✅ Created middleware/auth.js');

// ============================================
// CONTROLLER FILES
// ============================================

// controllers/authController.js
const authController = `const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

/**
 * Register new user
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.query(
      \`INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, avatar_url, created_at\`,
      [email.toLowerCase(), passwordHash, name]
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await db.query(
      'SELECT id, email, password_hash, name, avatar_url, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
exports.me = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatarUrl } = req.body;
    const userId = req.user.userId;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(\`name = $\${paramCount++}\`);
      values.push(name);
    }

    if (avatarUrl !== undefined) {
      updates.push(\`avatar_url = $\${paramCount++}\`);
      values.push(avatarUrl);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);

    const result = await db.query(
      \`UPDATE users SET \${updates.join(', ')} WHERE id = $\${paramCount} 
       RETURNING id, email, name, avatar_url, created_at\`,
      values
    );

    const user = result.rows[0];

    res.json({
      message: 'Profile updated',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};
`;

fs.writeFileSync(path.join(baseDir, 'controllers', 'authController.js'), authController);
console.log('✅ Created controllers/authController.js');

// controllers/courseController.js
const courseController = `const db = require('../db');

/**
 * Create new course
 */
exports.createCourse = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    const userId = req.user.userId;
    const {
      title,
      description,
      chapterDuration,
      difficultyLevel,
      targetAudience,
      thumbnailUrl,
      thumbnailPhotographer,
      thumbnailSource,
      selectedChapterCount,
      chaptersData
    } = req.body;

    // Validation
    if (!title || !selectedChapterCount) {
      return res.status(400).json({ error: 'Title and chapter count are required' });
    }

    await client.query('BEGIN');

    // Create course
    const courseResult = await client.query(
      \`INSERT INTO courses (
        user_id, title, description, chapter_duration, difficulty_level,
        target_audience, thumbnail_url, thumbnail_photographer, thumbnail_source,
        selected_chapter_count, chapters_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *\`,
      [
        userId, title, description, chapterDuration, difficultyLevel,
        targetAudience, thumbnailUrl, thumbnailPhotographer, thumbnailSource,
        selectedChapterCount, JSON.stringify(chaptersData || {})
      ]
    );

    const course = courseResult.rows[0];

    // Create initial progress record
    await client.query(
      \`INSERT INTO course_progress (course_id, current_chapter_index, visited_chapters)
       VALUES ($1, 0, ARRAY[0])\`,
      [course.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Course created successfully',
      course: formatCourse(course)
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Get all courses for user
 */
exports.getCourses = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      \`SELECT * FROM course_summary 
       WHERE user_id = $1 
       ORDER BY last_accessed_at DESC NULLS LAST, created_at DESC\`,
      [userId]
    );

    res.json({
      courses: result.rows.map(formatCourseSummary)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single course with full data
 */
exports.getCourse = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await db.query(
      \`SELECT c.*, cp.current_chapter_index, cp.visited_chapters, 
              cp.completed, cp.last_accessed_at
       FROM courses c
       LEFT JOIN course_progress cp ON c.id = cp.course_id
       WHERE c.id = $1 AND c.user_id = $2\`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Update last accessed
    await db.query(
      'UPDATE course_progress SET last_accessed_at = NOW() WHERE course_id = $1',
      [id]
    );

    res.json({
      course: formatCourseWithProgress(result.rows[0])
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update course chapters data
 */
exports.updateCourse = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { chaptersData } = req.body;

    // Verify ownership
    const checkResult = await db.query(
      'SELECT id FROM courses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Update chapters data
    const result = await db.query(
      \`UPDATE courses SET chapters_data = $1 WHERE id = $2 RETURNING *\`,
      [JSON.stringify(chaptersData), id]
    );

    res.json({
      message: 'Course updated',
      course: formatCourse(result.rows[0])
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update course progress
 */
exports.updateProgress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { currentChapterIndex, visitedChapters, completed, chaptersData } = req.body;

    // Verify ownership
    const checkResult = await db.query(
      'SELECT id, selected_chapter_count FROM courses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Update progress
    const progressResult = await db.query(
      \`UPDATE course_progress 
       SET current_chapter_index = COALESCE($1, current_chapter_index),
           visited_chapters = COALESCE($2, visited_chapters),
           completed = COALESCE($3, completed),
           completed_at = CASE WHEN $3 = true THEN NOW() ELSE completed_at END,
           last_accessed_at = NOW()
       WHERE course_id = $4
       RETURNING *\`,
      [currentChapterIndex, visitedChapters, completed, id]
    );

    // Update chapters data if provided
    if (chaptersData) {
      await db.query(
        'UPDATE courses SET chapters_data = $1 WHERE id = $2',
        [JSON.stringify(chaptersData), id]
      );
    }

    res.json({
      message: 'Progress updated',
      progress: {
        currentChapterIndex: progressResult.rows[0].current_chapter_index,
        visitedChapters: progressResult.rows[0].visited_chapters,
        completed: progressResult.rows[0].completed,
        lastAccessedAt: progressResult.rows[0].last_accessed_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete course
 */
exports.deleteCourse = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM courses WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Helper functions
function formatCourse(course) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    chapterDuration: course.chapter_duration,
    difficultyLevel: course.difficulty_level,
    targetAudience: course.target_audience,
    thumbnailUrl: course.thumbnail_url,
    thumbnailPhotographer: course.thumbnail_photographer,
    thumbnailSource: course.thumbnail_source,
    selectedChapterCount: course.selected_chapter_count,
    chaptersData: course.chapters_data,
    createdAt: course.created_at,
    updatedAt: course.updated_at
  };
}

function formatCourseSummary(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    chapterDuration: row.chapter_duration,
    difficultyLevel: row.difficulty_level,
    selectedChapterCount: row.selected_chapter_count,
    thumbnailUrl: row.thumbnail_url,
    currentChapterIndex: row.current_chapter_index || 0,
    visitedChapters: row.visited_chapters || [],
    chaptersCompleted: row.chapters_completed || 0,
    progressPercentage: parseFloat(row.progress_percentage) || 0,
    completed: row.completed || false,
    lastAccessedAt: row.last_accessed_at,
    createdAt: row.created_at
  };
}

function formatCourseWithProgress(row) {
  return {
    ...formatCourse(row),
    progress: {
      currentChapterIndex: row.current_chapter_index || 0,
      visitedChapters: row.visited_chapters || [],
      completed: row.completed || false,
      lastAccessedAt: row.last_accessed_at
    }
  };
}
`;

fs.writeFileSync(path.join(baseDir, 'controllers', 'courseController.js'), courseController);
console.log('✅ Created controllers/courseController.js');

// controllers/quizController.js
const quizController = `const db = require('../db');

/**
 * Save quiz result
 */
exports.saveQuizResult = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      courseId,
      chaptersQuizzed,
      score,
      totalQuestions,
      answersData
    } = req.body;

    // Validation
    if (!courseId || !chaptersQuizzed || score === undefined || !totalQuestions) {
      return res.status(400).json({ error: 'Missing required quiz data' });
    }

    // Verify course ownership
    const courseCheck = await db.query(
      'SELECT id FROM courses WHERE id = $1 AND user_id = $2',
      [courseId, userId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const percentage = (score / totalQuestions) * 100;

    // Save quiz result
    const result = await db.query(
      \`INSERT INTO quiz_history (
        course_id, user_id, chapters_quizzed, score, total_questions, 
        percentage, answers_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *\`,
      [
        courseId, userId, chaptersQuizzed, score, totalQuestions,
        percentage, JSON.stringify(answersData || [])
      ]
    );

    const quiz = result.rows[0];

    res.status(201).json({
      message: 'Quiz result saved',
      quiz: {
        id: quiz.id,
        courseId: quiz.course_id,
        chaptersQuizzed: quiz.chapters_quizzed,
        score: quiz.score,
        totalQuestions: quiz.total_questions,
        percentage: parseFloat(quiz.percentage),
        completedAt: quiz.completed_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get quiz history for a course
 */
exports.getCourseQuizzes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.params;

    // Verify course ownership
    const courseCheck = await db.query(
      'SELECT id FROM courses WHERE id = $1 AND user_id = $2',
      [courseId, userId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const result = await db.query(
      \`SELECT * FROM quiz_history 
       WHERE course_id = $1 
       ORDER BY completed_at DESC\`,
      [courseId]
    );

    res.json({
      quizzes: result.rows.map(quiz => ({
        id: quiz.id,
        chaptersQuizzed: quiz.chapters_quizzed,
        score: quiz.score,
        totalQuestions: quiz.total_questions,
        percentage: parseFloat(quiz.percentage),
        answersData: quiz.answers_data,
        completedAt: quiz.completed_at
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all quiz history for user
 */
exports.getAllQuizzes = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      \`SELECT qh.*, c.title as course_title 
       FROM quiz_history qh
       JOIN courses c ON qh.course_id = c.id
       WHERE qh.user_id = $1 
       ORDER BY qh.completed_at DESC
       LIMIT 50\`,
      [userId]
    );

    res.json({
      quizzes: result.rows.map(quiz => ({
        id: quiz.id,
        courseId: quiz.course_id,
        courseTitle: quiz.course_title,
        chaptersQuizzed: quiz.chapters_quizzed,
        score: quiz.score,
        totalQuestions: quiz.total_questions,
        percentage: parseFloat(quiz.percentage),
        completedAt: quiz.completed_at
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get quiz stats for user
 */
exports.getQuizStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      \`SELECT 
        COUNT(*) as total_quizzes,
        AVG(percentage) as average_score,
        MAX(percentage) as best_score,
        SUM(total_questions) as total_questions_answered
       FROM quiz_history 
       WHERE user_id = $1\`,
      [userId]
    );

    const stats = result.rows[0];

    res.json({
      stats: {
        totalQuizzes: parseInt(stats.total_quizzes) || 0,
        averageScore: parseFloat(stats.average_score)?.toFixed(1) || 0,
        bestScore: parseFloat(stats.best_score) || 0,
        totalQuestionsAnswered: parseInt(stats.total_questions_answered) || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
`;

fs.writeFileSync(path.join(baseDir, 'controllers', 'quizController.js'), quizController);
console.log('✅ Created controllers/quizController.js');

// ============================================
// ROUTE FILES
// ============================================

// routes/auth.js
const authRoutes = `const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', auth, authController.me);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
`;

fs.writeFileSync(path.join(baseDir, 'routes', 'auth.js'), authRoutes);
console.log('✅ Created routes/auth.js');

// routes/courses.js
const courseRoutes = `const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Course CRUD
router.post('/', courseController.createCourse);
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

// Progress
router.put('/:id/progress', courseController.updateProgress);

module.exports = router;
`;

fs.writeFileSync(path.join(baseDir, 'routes', 'courses.js'), courseRoutes);
console.log('✅ Created routes/courses.js');

// routes/quiz.js
const quizRoutes = `const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Quiz endpoints
router.post('/', quizController.saveQuizResult);
router.get('/stats', quizController.getQuizStats);
router.get('/all', quizController.getAllQuizzes);
router.get('/course/:courseId', quizController.getCourseQuizzes);

module.exports = router;
`;

fs.writeFileSync(path.join(baseDir, 'routes', 'quiz.js'), quizRoutes);
console.log('✅ Created routes/quiz.js');

console.log('\n✨ Backend setup complete!');
console.log('\nNext steps:');
console.log('1. Copy .env.example to .env and configure your database');
console.log('2. Create PostgreSQL database: CREATE DATABASE synapse_ai;');
console.log('3. Run: npm install');
console.log('4. Run: npm run db:migrate');
console.log('5. Run: npm run dev');
