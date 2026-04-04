const jwt = require('jsonwebtoken');

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
