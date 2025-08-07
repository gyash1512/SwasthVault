const express = require('express');
const { protect, authorize, requireVerification } = require('../middleware/auth');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get doctor profile
// @route   GET /api/doctors/profile
// @access  Private (Doctor only)
router.get('/profile', protect, authorize('doctor'), requireVerification, async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id).select('-password');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    logger.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve doctor profile'
    });
  }
});

// @desc    Get patients assigned to doctor
// @route   GET /api/doctors/patients
// @access  Private (Doctor only)
router.get('/patients', protect, authorize('doctor'), requireVerification, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ doctor: req.user.id })
      .populate('patient', 'firstName lastName email phoneNumber dateOfBirth')
      .select('patient visitDate visitType diagnosis.primary')
      .sort({ visitDate: -1 });

    // Get unique patients
    const uniquePatients = [];
    const patientIds = new Set();

    records.forEach(record => {
      if (!patientIds.has(record.patient._id.toString())) {
        patientIds.add(record.patient._id.toString());
        uniquePatients.push({
          patient: record.patient,
          lastVisit: record.visitDate,
          lastDiagnosis: record.diagnosis.primary
        });
      }
    });

    res.status(200).json({
      success: true,
      count: uniquePatients.length,
      data: uniquePatients
    });
  } catch (error) {
    logger.error('Get doctor patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patients'
    });
  }
});

module.exports = router;
