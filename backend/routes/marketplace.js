const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { auth, optionalAuth } = require('../middleware/auth');

// Public routes (no auth required, but optional auth for tracking)
router.get('/', optionalAuth, marketplaceController.getPublicCourses);
router.get('/search', optionalAuth, marketplaceController.searchCourses);
router.get('/categories', marketplaceController.getCategories);
router.get('/trending', optionalAuth, marketplaceController.getTrendingCourses);
router.get('/course/:id', optionalAuth, marketplaceController.getPublicCourse);

// View tracking (allow unauthenticated views with IP tracking)
router.post('/course/:id/view', optionalAuth, marketplaceController.recordView);

// Protected routes - require authentication
router.post('/course/:id/save', auth, marketplaceController.saveCourse);
router.delete('/course/:id/save', auth, marketplaceController.unsaveCourse);
router.get('/saved', auth, marketplaceController.getSavedCourses);

// Creator routes
router.get('/my-courses', auth, marketplaceController.getMyPublicCourses);
router.post('/course/:id/publish', auth, marketplaceController.publishCourse);
router.post('/course/:id/unpublish', auth, marketplaceController.unpublishCourse);
router.get('/course/:id/analytics', auth, marketplaceController.getCourseAnalytics);

module.exports = router;
