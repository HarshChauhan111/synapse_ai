const express = require('express');
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
