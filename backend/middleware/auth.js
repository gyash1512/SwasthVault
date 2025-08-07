const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      next();
    } catch (error) {
      logger.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address to access this resource'
    });
  }

  next();
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token is invalid, but we continue without user
      req.user = null;
    }
  }

  next();
};

// Emergency access middleware - for emergency personnel
const emergencyAccess = async (req, res, next) => {
  try {
    // Check if user has emergency role
    if (!req.user || req.user.role !== 'emergency_personnel') {
      return res.status(403).json({
        success: false,
        message: 'Emergency access required'
      });
    }

    // Log emergency access attempt
    logger.warn(`Emergency access attempted by: ${req.user.email} for patient: ${req.params.patientId || 'unknown'}`);

    next();
  } catch (error) {
    logger.error('Emergency access error:', error);
    res.status(500).json({
      success: false,
      message: 'Emergency access verification failed'
    });
  }
};

// Rate limiting for sensitive operations
const sensitiveOperation = (req, res, next) => {
  // This could be enhanced with Redis-based rate limiting
  // For now, we'll just log the operation
  logger.info(`Sensitive operation attempted by: ${req.user?.email || 'unknown'} - ${req.method} ${req.originalUrl}`);
  next();
};

module.exports = {
  protect,
  authorize,
  requireVerification,
  optionalAuth,
  emergencyAccess,
  sensitiveOperation
};
