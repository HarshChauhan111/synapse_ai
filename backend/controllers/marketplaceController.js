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
    
    let orderBy = 'created_at DESC';
    if (sort === 'popular') orderBy = 'view_count DESC';
    if (sort === 'trending') orderBy = 'view_count DESC, created_at DESC';
    
    let whereConditions = [];
    let values = [];
    let paramCount = 1;
    
    if (category) {
      whereConditions.push(`category = $${paramCount++}`);
      values.push(category);
    }
    
    if (difficulty) {
      whereConditions.push(`difficulty_level = $${paramCount++}`);
      values.push(difficulty);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM marketplace_courses ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Get courses
    values.push(parseInt(limit), offset);
    const result = await db.query(
      `SELECT * FROM marketplace_courses 
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      values
    );
    
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
      `SELECT * FROM marketplace_courses 
       WHERE LOWER(title) LIKE $1 
          OR LOWER(description) LIKE $1
          OR $2 = ANY(tags)
       ORDER BY view_count DESC, created_at DESC
       LIMIT $3 OFFSET $4`,
      [searchTerm, q.trim().toLowerCase(), parseInt(limit), offset]
    );
    
    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM marketplace_courses 
       WHERE LOWER(title) LIKE $1 
          OR LOWER(description) LIKE $1
          OR $2 = ANY(tags)`,
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
      `SELECT mc.*, 
              (SELECT COUNT(*) FROM course_views cv 
               WHERE cv.course_id = mc.id 
               AND cv.viewed_at > NOW() - INTERVAL '7 days') as recent_views
       FROM marketplace_courses mc
       ORDER BY recent_views DESC, view_count DESC
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
      `SELECT c.*, u.name as creator_name, u.username as creator_username, u.avatar_url as creator_avatar
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
    const viewerId = req.user?.userId || null;
    const viewerIp = req.ip || req.connection.remoteAddress;
    
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
    
    // Use the database function to record view
    const result = await db.query(
      'SELECT increment_course_view($1, $2, $3) as is_new_view',
      [id, viewerId, viewerId ? null : viewerIp]
    );
    
    res.json({
      recorded: result.rows[0].is_new_view
    });
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
    
    await db.query(
      `INSERT INTO course_saves (course_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (course_id, user_id) DO NOTHING`,
      [id, userId]
    );
    
    res.json({ message: 'Course saved' });
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
    
    await db.query(
      'DELETE FROM course_saves WHERE course_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    res.json({ message: 'Course removed from saved' });
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
    
    const result = await db.query(
      `SELECT mc.*, cs.saved_at
       FROM marketplace_courses mc
       JOIN course_saves cs ON mc.id = cs.course_id
       WHERE cs.user_id = $1
       ORDER BY cs.saved_at DESC`,
      [userId]
    );
    
    res.json({
      courses: result.rows.map(formatMarketplaceCourse)
    });
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
    
    // Verify ownership
    const courseCheck = await db.query(
      'SELECT id FROM courses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Update course to public
    const result = await db.query(
      `UPDATE courses 
       SET is_public = TRUE, 
           category = COALESCE($1, category),
           tags = COALESCE($2, tags)
       WHERE id = $3
       RETURNING *`,
      [category, tags, id]
    );
    
    res.json({
      message: 'Course published to marketplace',
      course: formatMarketplaceCourse(result.rows[0])
    });
  } catch (error) {
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
    
    // Get daily views for last 30 days
    const dailyViews = await db.query(
      `SELECT DATE(viewed_at) as date, COUNT(*) as views
       FROM course_views
       WHERE course_id = $1 AND viewed_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(viewed_at)
       ORDER BY date ASC`,
      [id]
    );
    
    // Get save count
    const saveCount = await db.query(
      'SELECT COUNT(*) FROM course_saves WHERE course_id = $1',
      [id]
    );
    
    res.json({
      analytics: {
        totalViews: course.view_count,
        totalSaves: parseInt(saveCount.rows[0].count),
        createdAt: course.created_at,
        dailyViews: dailyViews.rows.map(r => ({
          date: r.date,
          views: parseInt(r.views)
        }))
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
