const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// PDF upload and processing
router.post('/upload', pdfController.uploadPdf);
router.get('/uploads', pdfController.getUserUploads);
router.delete('/uploads/:id', pdfController.deleteUpload);

// Generate course from PDF
router.post('/generate-structure', pdfController.generateCourseFromPdf);

module.exports = router;
