const express = require('express');
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
