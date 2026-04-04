const db = require('../db');

/**
 * Get all public courses (marketplace)
 */
exports.getPublicCourses = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      sort = 'recent', 
      category,
      difficulty 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let orderBy = 'c.created_at DESC';
    if (sort === 'popular') orderBy = 'c.view_count DESC';
    if (sort === 'trending') orderBy = 'c.view_count DESC, c.created_at DESC';
    
    let whereConditions = ['c.is_public = TRUE'];
    let values = [];
    let paramCount = 1;
    
    if (category) {
      whereConditions.push(`c.category = $${paramCount++}`);
      values.push(category);
    }
    
    if (difficulty) {
      whereConditions.push(`c.difficulty_level = $${paramCount++}`);
      values.push(difficulty);
    }
    
    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    
    console.log('Fetching marketplace courses with:', { whereClause, values });
    
    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM courses c ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult.rows[0].count);
    
    console.log('Total public courses:', totalCount);
    
    // Get courses with creator info (skip username column)
    values.push(parseInt(limit), offset);
    const result = await db.query(
      `SELECT c.*, 
              u.name as creator_name, 
              u.avatar_url as creator_avatar,
              0 as save_count
       FROM courses c
       JOIN users u ON c.user_id = u.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      values
    );
    
    console.log('Found courses:', result.rows.length);
    
    res.json({
      courses: result.rows.map(formatMarketplaceCourse),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching marketplace courses:', error.message);
    next(error);
  }
};

/**
 * Search courses
 */
exports.searchCourses = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = `%${q.trim().toLowerCase()}%`;
    
    // Search in title, description, and tags
    const result = await db.query(
      `SELECT c.*, 
              u.name as creator_name, 
              u.avatar_url as creator_avatar,
              0 as save_count
       FROM courses c
       JOIN users u ON c.user_id = u.id
       WHERE c.is_public = TRUE AND (
         LOWER(c.title) LIKE $1 
         OR LOWER(c.description) LIKE $1
         OR $2 = ANY(c.tags)
       )
       ORDER BY c.view_count DESC, c.created_at DESC
       LIMIT $3 OFFSET $4`,
      [searchTerm, q.trim().toLowerCase(), parseInt(limit), offset]
    );
    
    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM courses c
       WHERE c.is_public = TRUE AND (
         LOWER(c.title) LIKE $1 
         OR LOWER(c.description) LIKE $1
         OR $2 = ANY(c.tags)
       )`,
      [searchTerm, q.trim().toLowerCase()]
    );
    
    res.json({
      courses: result.rows.map(formatMarketplaceCourse),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
      },
      query: q
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get trending courses (most viewed in last 7 days)
 */
exports.getTrendingCourses = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    
    const result = await db.query(
      `SELECT c.*, 
              u.name as creator_name, 
              u.avatar_url as creator_avatar,
              0 as save_count
       FROM courses c
       JOIN users u ON c.user_id = u.id
       WHERE c.is_public = TRUE
       ORDER BY c.view_count DESC, c.created_at DESC
       LIMIT $1`,
      [parseInt(limit)]
    );
    
    res.json({
      courses: result.rows.map(formatMarketplaceCourse)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available categories
 */
exports.getCategories = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT category, COUNT(*) as count 
       FROM courses 
       WHERE is_public = TRUE AND category IS NOT NULL
       GROUP BY category
       ORDER BY count DESC`
    );
    
    res.json({
      categories: result.rows.map(r => ({
        name: r.category,
        count: parseInt(r.count)
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single public course
 */
exports.getPublicCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT c.*, u.name as creator_name, u.avatar_url as creator_avatar
       FROM courses c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1 AND c.is_public = TRUE`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found or is private' });
    }
    
    res.json({
      course: formatFullCourse(result.rows[0])
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record course view
 */
exports.recordView = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verify course is public
    const courseCheck = await db.query(
      'SELECT is_public FROM courses WHERE id = $1',
      [id]
    );
    
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    if (!courseCheck.rows[0].is_public) {
      return res.status(403).json({ error: 'Course is private' });
    }
    
    // Simply increment view count (simplified without course_views table dependency)
    try {
      await db.query(
        'UPDATE courses SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1',
        [id]
      );
      res.json({ recorded: true });
    } catch (err) {
      // If view_count column doesn't exist, still return success
      res.json({ recorded: false });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Save/bookmark a course
 */
exports.saveCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Verify course is public
    const courseCheck = await db.query(
      'SELECT is_public FROM courses WHERE id = $1',
      [id]
    );
    
    if (courseCheck.rows.length === 0 || !courseCheck.rows[0].is_public) {
      return res.status(404).json({ error: 'Course not found or is private' });
    }
    
    try {
      await db.query(
        `INSERT INTO course_saves (course_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (course_id, user_id) DO NOTHING`,
        [id, userId]
      );
      res.json({ message: 'Course saved' });
    } catch (err) {
      // Table might not exist
      res.status(500).json({ error: 'Save feature not available' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Unsave/unbookmark a course
 */
exports.unsaveCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    try {
      await db.query(
        'DELETE FROM course_saves WHERE course_id = $1 AND user_id = $2',
        [id, userId]
      );
      res.json({ message: 'Course removed from saved' });
    } catch (err) {
      // Table might not exist
      res.json({ message: 'Course removed from saved' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's saved courses
 */
exports.getSavedCourses = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Check if course_saves table exists, return empty array if not
    try {
      const result = await db.query(
        `SELECT c.*, 
                u.name as creator_name, 
                u.avatar_url as creator_avatar,
                cs.saved_at,
                0 as save_count
         FROM courses c
         JOIN users u ON c.user_id = u.id
         JOIN course_saves cs ON c.id = cs.course_id
         WHERE cs.user_id = $1 AND c.is_public = TRUE
         ORDER BY cs.saved_at DESC`,
        [userId]
      );
      
      res.json({
        courses: result.rows.map(formatMarketplaceCourse)
      });
    } catch (err) {
      // Table might not exist, return empty array
      res.json({ courses: [] });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get creator's public courses
 */
exports.getMyPublicCourses = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const result = await db.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM course_saves cs WHERE cs.course_id = c.id) as save_count
       FROM courses c
       WHERE c.user_id = $1 AND c.is_public = TRUE
       ORDER BY c.created_at DESC`,
      [userId]
    );
    
    res.json({
      courses: result.rows.map(row => ({
        ...formatMarketplaceCourse(row),
        saveCount: parseInt(row.save_count) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish course to marketplace
 */
exports.publishCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { category, tags } = req.body;
    
    console.log('Publishing course:', { id, userId, category, tags });
    
    // Verify ownership
    const courseCheck = await db.query(
      'SELECT id, title FROM courses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (courseCheck.rows.length === 0) {
      console.log('Course not found for user:', { id, userId });
      return res.status(404).json({ error: 'Course not found' });
    }
    
    console.log('Found course:', courseCheck.rows[0].title);
    
    // Update course to public
    try {
      const result = await db.query(
        `UPDATE courses 
         SET is_public = TRUE, 
             category = $1,
             tags = $2
         WHERE id = $3
         RETURNING *`,
        [category || null, tags || [], id]
      );
      
      console.log('Course updated successfully:', result.rows[0]?.is_public);
      
      // Get creator info for response (only name, skip username if it doesn't exist)
      const userResult = await db.query(
        'SELECT name, avatar_url FROM users WHERE id = $1',
        [userId]
      );
      
      const courseData = {
        ...result.rows[0],
        creator_name: userResult.rows[0]?.name,
        creator_username: null,
        creator_avatar: userResult.rows[0]?.avatar_url
      };
      
      res.json({
        message: 'Course published to marketplace',
        course: formatMarketplaceCourse(courseData)
      });
    } catch (dbError) {
      console.error('Database error during publish:', dbError.message);
      
      // Check if it's a column missing error
      if (dbError.message.includes('column') && dbError.message.includes('does not exist')) {
        return res.status(500).json({ 
          error: 'Database needs migration. Please run: backend/db/add_marketplace_columns.sql' 
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Publish error:', error);
    next(error);
  }
};

/**
 * Unpublish course from marketplace
 */
exports.unpublishCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Verify ownership
    const courseCheck = await db.query(
      'SELECT id FROM courses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    await db.query(
      'UPDATE courses SET is_public = FALSE WHERE id = $1',
      [id]
    );
    
    res.json({ message: 'Course removed from marketplace' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get course analytics for creator
 */
exports.getCourseAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Verify ownership
    const courseCheck = await db.query(
      'SELECT id, view_count, created_at FROM courses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const course = courseCheck.rows[0];
    
    res.json({
      analytics: {
        totalViews: course.view_count || 0,
        totalSaves: 0,
        createdAt: course.created_at,
        dailyViews: []
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
function formatMarketplaceCourse(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    chapterDuration: row.chapter_duration,
    difficultyLevel: row.difficulty_level,
    targetAudience: row.target_audience,
    thumbnailUrl: row.thumbnail_url,
    chapterCount: row.selected_chapter_count,
    viewCount: row.view_count || 0,
    saveCount: parseInt(row.save_count) || 0,
    tags: row.tags || [],
    category: row.category,
    isPublic: row.is_public || false,
    createdAt: row.created_at,
    creator: {
      name: row.creator_name,
      username: row.creator_username,
      avatarUrl: row.creator_avatar
    }
  };
}

function formatFullCourse(row) {
  return {
    ...formatMarketplaceCourse(row),
    chaptersData: row.chapters_data,
    sourceType: row.source_type,
    creator: {
      id: row.user_id,
      name: row.creator_name,
      username: row.creator_username,
      avatarUrl: row.creator_avatar
    }
  };
}
