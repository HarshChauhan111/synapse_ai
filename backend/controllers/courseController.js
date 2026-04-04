const db = require('../db');

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
      `INSERT INTO courses (
        user_id, title, description, chapter_duration, difficulty_level,
        target_audience, thumbnail_url, thumbnail_photographer, thumbnail_source,
        selected_chapter_count, chapters_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId, title, description, chapterDuration, difficultyLevel,
        targetAudience, thumbnailUrl, thumbnailPhotographer, thumbnailSource,
        selectedChapterCount, JSON.stringify(chaptersData || {})
      ]
    );

    const course = courseResult.rows[0];

    // Create initial progress record
    await client.query(
      `INSERT INTO course_progress (course_id, current_chapter_index, visited_chapters)
       VALUES ($1, 0, ARRAY[0])`,
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
      `SELECT * FROM course_summary 
       WHERE user_id = $1 
       ORDER BY last_accessed_at DESC NULLS LAST, created_at DESC`,
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
      `SELECT c.*, cp.current_chapter_index, cp.visited_chapters, 
              cp.completed, cp.last_accessed_at
       FROM courses c
       LEFT JOIN course_progress cp ON c.id = cp.course_id
       WHERE c.id = $1 AND c.user_id = $2`,
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
      `UPDATE courses SET chapters_data = $1 WHERE id = $2 RETURNING *`,
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
      `UPDATE course_progress 
       SET current_chapter_index = COALESCE($1, current_chapter_index),
           visited_chapters = COALESCE($2, visited_chapters),
           completed = COALESCE($3, completed),
           completed_at = CASE WHEN $3 = true THEN NOW() ELSE completed_at END,
           last_accessed_at = NOW()
       WHERE course_id = $4
       RETURNING *`,
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
    createdAt: row.created_at,
    isPublic: row.is_public || false,
    viewCount: row.view_count || 0,
    tags: row.tags || [],
    category: row.category
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
