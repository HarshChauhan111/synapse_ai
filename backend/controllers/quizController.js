const db = require('../db');

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
      `INSERT INTO quiz_history (
        course_id, user_id, chapters_quizzed, score, total_questions, 
        percentage, answers_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
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
      `SELECT * FROM quiz_history 
       WHERE course_id = $1 
       ORDER BY completed_at DESC`,
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
      `SELECT qh.*, c.title as course_title 
       FROM quiz_history qh
       JOIN courses c ON qh.course_id = c.id
       WHERE qh.user_id = $1 
       ORDER BY qh.completed_at DESC
       LIMIT 50`,
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
      `SELECT 
        COUNT(*) as total_quizzes,
        AVG(percentage) as average_score,
        MAX(percentage) as best_score,
        SUM(total_questions) as total_questions_answered
       FROM quiz_history 
       WHERE user_id = $1`,
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
