const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize, requireVerification } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Create new medical record
// @route   POST /api/medical-records
// @access  Private (Doctor only)
router.post('/', protect, authorize('doctor'), requireVerification, [
  body('patient').isMongoId().withMessage('Valid patient ID is required'),
  body('visitType').isIn(['consultation', 'emergency', 'surgery', 'follow_up', 'diagnostic', 'vaccination', 'checkup']).withMessage('Valid visit type is required'),
  body('chiefComplaint').trim().notEmpty().withMessage('Chief complaint is required'),
  body('diagnosis.primary').trim().notEmpty().withMessage('Primary diagnosis is required'),
  body('hospital.name').trim().notEmpty().withMessage('Hospital name is required'),
  body('hospital.registrationNumber').trim().notEmpty().withMessage('Hospital registration number is required')
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

    // Verify patient exists
    const patient = await User.findById(req.body.patient);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Create medical record
    const recordData = {
      ...req.body,
      doctor: req.user.id,
      digitalSignature: {
        doctorSignature: `${req.user.firstName} ${req.user.lastName}`,
        signatureDate: new Date(),
        verificationHash: 'mock_hash_' + Date.now() // In production, use proper digital signature
      }
    };

    const medicalRecord = await MedicalRecord.create(recordData);

    // Add audit trail entry
    await medicalRecord.addAuditEntry(
      'created',
      req.user.id,
      'Medical record created',
      req.ip,
      req.get('User-Agent')
    );

    // Populate the record for response
    await medicalRecord.populate('patient doctor');

    logger.info(`Medical record created by doctor ${req.user.email} for patient ${patient.email}`);

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: medicalRecord
    });

  } catch (error) {
    logger.error('Create medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create medical record'
    });
  }
});

// @desc    Get medical records
// @route   GET /api/medical-records
// @access  Private
router.get('/', protect, requireVerification, async (req, res) => {
  try {
    const { patientId, page = 1, limit = 10 } = req.query;
    let query = {};

    // Role-based access control
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      if (patientId) {
        // Doctor accessing specific patient's records
        query.patient = patientId;
        // TODO: Add check if doctor has permission to access this patient
      } else {
        // Doctor accessing their own created records
        query.doctor = req.user.id;
      }
    } else if (req.user.role === 'admin') {
      // Admin can access all records
      if (patientId) {
        query.patient = patientId;
      }
    }

    const records = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName email dateOfBirth')
      .populate('doctor', 'firstName lastName email')
      .sort({ visitDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MedicalRecord.countDocuments(query);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: records
    });

  } catch (error) {
    logger.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve medical records'
    });
  }
});

// @desc    Get single medical record
// @route   GET /api/medical-records/:id
// @access  Private
router.get('/:id', protect, requireVerification, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'firstName lastName email dateOfBirth phoneNumber address emergencyContact')
      .populate('doctor', 'firstName lastName email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check access permissions
    let hasAccess = false;
    
    if (req.user.role === 'patient' && record.patient._id.equals(req.user.id)) {
      hasAccess = true;
    } else if (req.user.role === 'doctor' && record.doctor._id.equals(req.user.id)) {
      hasAccess = true;
    } else if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (record.hasAccess(req.user.id, 'read')) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this medical record'
      });
    }

    // Add audit trail entry for viewing
    await record.addAuditEntry(
      'viewed',
      req.user.id,
      'Medical record viewed',
      req.ip,
      req.get('User-Agent')
    );

    res.status(200).json({
      success: true,
      data: record
    });

  } catch (error) {
    logger.error('Get medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve medical record'
    });
  }
});

// @desc    Update medical record
// @route   PUT /api/medical-records/:id
// @access  Private (Doctor only)
router.put('/:id', protect, authorize('doctor'), requireVerification, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check if doctor has permission to update
    if (!record.doctor.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this record'
      });
    }

    // Update record
    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('patient doctor');

    // Add audit trail entry
    await updatedRecord.addAuditEntry(
      'updated',
      req.user.id,
      'Medical record updated',
      req.ip,
      req.get('User-Agent')
    );

    logger.info(`Medical record ${req.params.id} updated by doctor ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Medical record updated successfully',
      data: updatedRecord
    });

  } catch (error) {
    logger.error('Update medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medical record'
    });
  }
});

module.exports = router;
