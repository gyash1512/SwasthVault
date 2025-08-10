const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize, requireVerification } = require('../middleware/auth');
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get users (with role filtering)
// @route   GET /api/users
// @access  Private
router.get('/', protect, requireVerification, async (req, res) => {
  try {
    const { role, page = 1, limit = 50, search } = req.query;
    
    let query = { isActive: true };
    
    // Filter by role if specified
    if (role) {
      query.role = role;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('firstName lastName email role dateOfBirth phoneNumber isVerified createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
    
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Doctor, Admin, or own profile)
router.get('/:id', protect, requireVerification, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -twoFactorSecret -passwordResetToken -emailVerificationToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check access permissions
    const hasAccess = req.user.id === req.params.id || 
                     req.user.role === 'admin' || 
                     req.user.role === 'doctor';
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
    
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or own profile)
router.put('/:id', protect, requireVerification, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phoneNumber').optional().matches(/^\+91[6-9]\d{9}$/).withMessage('Please provide a valid Indian phone number'),
  body('address.street').optional().trim().notEmpty().withMessage('Street address is required'),
  body('address.city').optional().trim().notEmpty().withMessage('City is required'),
  body('address.state').optional().trim().notEmpty().withMessage('State is required'),
  body('address.pincode').optional().matches(/^\d{6}$/).withMessage('Pincode must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    // Check if user can update this profile
    const canUpdate = req.user.id === req.params.id || req.user.role === 'admin';
    
    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user fields
    const allowedFields = [
      'firstName', 'lastName', 'email', 'phoneNumber', 'address', 
      'emergencyContact', 'profilePicture'
    ];
    
    // Admin can update additional fields
    if (req.user.role === 'admin') {
      allowedFields.push('role', 'isActive', 'isVerified');
    }
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });
    
    user.updatedBy = req.user.id;
    await user.save();
    
    // Remove sensitive fields from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.twoFactorSecret;
    delete userResponse.passwordResetToken;
    delete userResponse.emailVerificationToken;
    
    logger.info(`User ${req.params.id} updated by ${req.user.email}`);
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
    
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// @desc    Delete/Deactivate user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), requireVerification, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Soft delete - deactivate user instead of removing
    user.isActive = false;
    user.updatedBy = req.user.id;
    await user.save();
    
    logger.info(`User ${req.params.id} deactivated by admin ${req.user.email}`);
    
    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
    
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
router.get('/stats/overview', protect, authorize('admin'), requireVerification, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalPatients = await User.countDocuments({ role: 'patient', isActive: true });
    const totalDoctors = await User.countDocuments({ role: 'doctor', isActive: true });
    const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true, isActive: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false, isActive: true });
    
    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalAdmins,
        verifiedUsers,
        unverifiedUsers,
        recentRegistrations
      }
    });
    
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics'
    });
  }
});

module.exports = router;
