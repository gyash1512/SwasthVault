const express = require('express');
const { protect, authorize, requireVerification } = require('../middleware/auth');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Private (Patient only)
router.get('/profile', protect, authorize('patient'), requireVerification, async (req, res) => {
  try {
    const patient = await User.findById(req.user.id).select('-password');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    logger.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient profile'
    });
  }
});

// @desc    Get patient medical records
// @route   GET /api/patients/medical-records
// @access  Private (Patient only)
router.get('/medical-records', protect, authorize('patient'), requireVerification, async (req, res) => {
  try {
    const records = await MedicalRecord.findByPatientWithAccess(req.user.id, req.user.id);
    
    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    logger.error('Get patient medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve medical records'
    });
  }
});

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private (Patient only)
router.put('/profile', protect, authorize('patient'), requireVerification, async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'phoneNumber', 'address', 'emergencyContact'];
    const updates = {};
    
    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const patient = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    logger.info(`Patient profile updated: ${patient.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: patient
    });
  } catch (error) {
    logger.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

module.exports = router;
