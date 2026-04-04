const db = require('../db');

/**
 * Upload and store PDF metadata with extracted text
 */
exports.uploadPdf = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { fileName, extractedText, pageCount } = req.body;
    
    if (!fileName || !extractedText) {
      return res.status(400).json({ error: 'File name and extracted text are required' });
    }
    
    // Store PDF metadata and extracted text
    const result = await db.query(
      `INSERT INTO pdf_uploads (user_id, file_name, extracted_text, page_count)
       VALUES ($1, $2, $3, $4)
       RETURNING id, file_name, page_count, created_at`,
      [userId, fileName, extractedText, pageCount || null]
    );
    
    res.status(201).json({
      message: 'PDF uploaded successfully',
      pdf: {
        id: result.rows[0].id,
        fileName: result.rows[0].file_name,
        pageCount: result.rows[0].page_count,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's uploaded PDFs
 */
exports.getUserUploads = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const result = await db.query(
      `SELECT id, file_name, page_count, created_at
       FROM pdf_uploads
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    
    res.json({
      uploads: result.rows.map(row => ({
        id: row.id,
        fileName: row.file_name,
        pageCount: row.page_count,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete uploaded PDF
 */
exports.deleteUpload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const result = await db.query(
      'DELETE FROM pdf_uploads WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    res.json({ message: 'PDF deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate course structure from PDF content
 * The actual course generation is done client-side using Gemini
 * This endpoint stores the association between PDF and course
 */
exports.generateCourseFromPdf = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { pdfIds, courseSettings } = req.body;
    
    if (!pdfIds || !Array.isArray(pdfIds) || pdfIds.length === 0) {
      return res.status(400).json({ error: 'At least one PDF ID is required' });
    }
    
    // Get PDF content
    const pdfsResult = await db.query(
      `SELECT id, file_name, extracted_text 
       FROM pdf_uploads 
       WHERE id = ANY($1) AND user_id = $2`,
      [pdfIds, userId]
    );
    
    if (pdfsResult.rows.length === 0) {
      return res.status(404).json({ error: 'PDFs not found' });
    }
    
    // Combine all PDF text
    const combinedText = pdfsResult.rows
      .map(pdf => `--- Content from: ${pdf.file_name} ---\n${pdf.extracted_text}`)
      .join('\n\n');
    
    const fileNames = pdfsResult.rows.map(pdf => pdf.file_name);
    
    res.json({
      sourceText: combinedText,
      sourceType: 'pdf',
      sourcePdfNames: fileNames,
      pdfIds: pdfIds
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get PDF content for course regeneration
 */
exports.getPdfContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const result = await db.query(
      'SELECT extracted_text, file_name FROM pdf_uploads WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    res.json({
      fileName: result.rows[0].file_name,
      content: result.rows[0].extracted_text
    });
  } catch (error) {
    next(error);
  }
};
