const express = require('express');
const { protect, authorize, requireVerification } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const logger = require('../utils/logger');
const crypto = require('crypto');

const router = express.Router();

// @desc    Get patient's complete medical timeline
// @route   GET /api/medical-records/patient/:patientId/timeline
// @access  Private (Patient, Doctor, Emergency Personnel)
router.get('/patient/:patientId/timeline', protect, requireVerification, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10, startDate, endDate, visitType } = req.query;

    // Build query filters
    const filters = { patient: patientId, isValid: true };
    
    if (startDate || endDate) {
      filters.visitDate = {};
      if (startDate) filters.visitDate.$gte = new Date(startDate);
      if (endDate) filters.visitDate.$lte = new Date(endDate);
    }
    
    if (visitType) filters.visitType = visitType;

    // Check access permissions
    const hasAccess = await checkPatientAccess(patientId, req.user.id, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to patient records'
      });
    }

    // Get records with pagination
    const records = await MedicalRecord.find(filters)
      .populate('doctor', 'firstName lastName specialization')
      .populate('patient', 'firstName lastName dateOfBirth bloodGroup')
      .sort({ visitDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const total = await MedicalRecord.countDocuments(filters);

    // Add audit trail entry
    await Promise.all(records.map(record => 
      MedicalRecord.findByIdAndUpdate(record._id, {
        $push: {
          auditTrail: {
            action: 'viewed',
            performedBy: req.user.id,
            timestamp: new Date(),
            details: 'Timeline accessed',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          }
        }
      })
    ));

    res.status(200).json({
      success: true,
      data: {
        records,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get patient timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient timeline'
    });
  }
});

// @desc    Create new medical record with version control
// @route   POST /api/medical-records/create
// @access  Private (Doctor only)
router.post('/create', protect, authorize('doctor'), requireVerification, async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      doctor: req.user.id,
      digitalSignature: {
        doctorSignature: generateDigitalSignature(req.body, req.user.id),
        signatureDate: new Date(),
        verificationHash: generateVerificationHash(req.body)
      },
      auditTrail: [{
        action: 'created',
        performedBy: req.user.id,
        timestamp: new Date(),
        details: 'Medical record created',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }]
    };

    const record = await MedicalRecord.create(recordData);
    
    await record.populate([
      { path: 'patient', select: 'firstName lastName dateOfBirth' },
      { path: 'doctor', select: 'firstName lastName specialization' }
    ]);

    logger.info(`Medical record created: ${record._id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: record
    });

  } catch (error) {
    logger.error('Create medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create medical record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update medical record (creates new version)
// @route   PUT /api/medical-records/:recordId/update
// @access  Private (Doctor only)
router.put('/:recordId/update', protect, authorize('doctor'), requireVerification, async (req, res) => {
  try {
    const { recordId } = req.params;
    const { changeReason } = req.body;

    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check if doctor has permission to update
    if (!record.doctor.equals(req.user.id) && !record.hasAccess(req.user.id, 'write')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to update this record'
      });
    }

    // Store current version before update
    const currentVersion = record.toObject();
    record.previousVersions.push({
      versionNumber: record.version,
      data: currentVersion,
      modifiedBy: req.user.id,
      modifiedDate: new Date(),
      changeReason: changeReason || 'Record updated'
    });

    // Update record with new data
    Object.assign(record, req.body);
    record.version += 1;
    record.updatedBy = req.user.id;
    record.digitalSignature = {
      doctorSignature: generateDigitalSignature(req.body, req.user.id),
      signatureDate: new Date(),
      verificationHash: generateVerificationHash(req.body)
    };

    // Add audit trail entry
    record.auditTrail.push({
      action: 'updated',
      performedBy: req.user.id,
      timestamp: new Date(),
      details: `Record updated to version ${record.version}. Reason: ${changeReason || 'Not specified'}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await record.save();
    await record.populate([
      { path: 'patient', select: 'firstName lastName' },
      { path: 'doctor', select: 'firstName lastName' }
    ]);

    logger.info(`Medical record updated: ${recordId} to version ${record.version} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: `Medical record updated to version ${record.version}`,
      data: record
    });

  } catch (error) {
    logger.error('Update medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medical record'
    });
  }
});

// @desc    Get record version history
// @route   GET /api/medical-records/:recordId/versions
// @access  Private (Doctor, Patient)
router.get('/:recordId/versions', protect, requireVerification, async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await MedicalRecord.findById(recordId)
      .populate('previousVersions.modifiedBy', 'firstName lastName')
      .select('version previousVersions patient doctor');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check access permissions
    const hasAccess = await checkRecordAccess(record, req.user.id, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to record versions'
      });
    }

    // Add audit trail entry
    await MedicalRecord.findByIdAndUpdate(recordId, {
      $push: {
        auditTrail: {
          action: 'viewed',
          performedBy: req.user.id,
          timestamp: new Date(),
          details: 'Version history accessed',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        currentVersion: record.version,
        versionHistory: record.previousVersions.map(version => ({
          version: version.versionNumber,
          modifiedBy: version.modifiedBy,
          modifiedDate: version.modifiedDate,
          changeReason: version.changeReason
        }))
      }
    });

  } catch (error) {
    logger.error('Get version history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve version history'
    });
  }
});

// @desc    Get specific version of a record
// @route   GET /api/medical-records/:recordId/versions/:versionNumber
// @access  Private (Doctor, Patient)
router.get('/:recordId/versions/:versionNumber', protect, requireVerification, async (req, res) => {
  try {
    const { recordId, versionNumber } = req.params;

    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check access permissions
    const hasAccess = await checkRecordAccess(record, req.user.id, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to record version'
      });
    }

    let versionData;
    if (parseInt(versionNumber) === record.version) {
      // Current version
      versionData = record.toObject();
    } else {
      // Previous version
      const previousVersion = record.previousVersions.find(
        v => v.versionNumber === parseInt(versionNumber)
      );
      
      if (!previousVersion) {
        return res.status(404).json({
          success: false,
          message: 'Version not found'
        });
      }
      
      versionData = previousVersion.data;
    }

    // Add audit trail entry
    await MedicalRecord.findByIdAndUpdate(recordId, {
      $push: {
        auditTrail: {
          action: 'viewed',
          performedBy: req.user.id,
          timestamp: new Date(),
          details: `Version ${versionNumber} accessed`,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      }
    });

    res.status(200).json({
      success: true,
      data: versionData
    });

  } catch (error) {
    logger.error('Get specific version error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve record version'
    });
  }
});

// @desc    Share record with another healthcare provider
// @route   POST /api/medical-records/:recordId/share
// @access  Private (Doctor, Patient)
router.post('/:recordId/share', protect, requireVerification, async (req, res) => {
  try {
    const { recordId } = req.params;
    const { userId, accessLevel, purpose, expiryDate } = req.body;

    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check if user has permission to share
    const canShare = record.patient.equals(req.user.id) || 
                    record.doctor.equals(req.user.id) || 
                    record.hasAccess(req.user.id, 'full');

    if (!canShare) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to share this record'
      });
    }

    // Verify the user to share with exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    // Grant access
    await record.grantAccess(userId, accessLevel, req.user.id, purpose, expiryDate);

    // Add audit trail entry
    record.auditTrail.push({
      action: 'shared',
      performedBy: req.user.id,
      timestamp: new Date(),
      details: `Record shared with ${targetUser.firstName} ${targetUser.lastName} (${accessLevel} access)`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await record.save();

    logger.info(`Medical record ${recordId} shared with ${targetUser.email} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Record shared successfully',
      data: {
        sharedWith: {
          id: targetUser._id,
          name: `${targetUser.firstName} ${targetUser.lastName}`,
          email: targetUser.email
        },
        accessLevel,
        expiryDate
      }
    });

  } catch (error) {
    logger.error('Share record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share record'
    });
  }
});

// @desc    Emergency access to critical patient information
// @route   GET /api/medical-records/emergency/:qrCode
// @access  Public (Emergency Personnel only)
router.get('/emergency/:qrCode', async (req, res) => {
  try {
    const { qrCode } = req.params;

    // Decode QR code to get patient ID
    const patientId = decodeEmergencyQR(qrCode);
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid emergency QR code'
      });
    }

    // Get emergency-accessible records
    const emergencyRecords = await MedicalRecord.getEmergencyRecords(patientId);
    
    if (!emergencyRecords.length) {
      return res.status(404).json({
        success: false,
        message: 'No emergency records found'
      });
    }

    // Log emergency access
    await Promise.all(emergencyRecords.map(record => 
      MedicalRecord.findByIdAndUpdate(record._id, {
        $push: {
          auditTrail: {
            action: 'emergency_access',
            performedBy: null, // Anonymous emergency access
            timestamp: new Date(),
            details: 'Emergency QR code access',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          }
        }
      })
    ));

    logger.info(`Emergency access to patient ${patientId} via QR code from ${req.ip}`);

    res.status(200).json({
      success: true,
      data: {
        patient: emergencyRecords[0].patient,
        emergencyInfo: emergencyRecords.map(record => ({
          bloodGroup: record.emergencyInfo.bloodGroup,
          allergies: record.allergies,
          chronicConditions: record.emergencyInfo.chronicConditions,
          currentMedications: record.emergencyInfo.currentMedications,
          medicalAlerts: record.emergencyInfo.medicalAlerts,
          lastUpdated: record.updatedAt
        }))
      }
    });

  } catch (error) {
    logger.error('Emergency access error:', error);
    res.status(500).json({
      success: false,
      message: 'Emergency access failed'
    });
  }
});

// Helper Functions

async function checkPatientAccess(patientId, userId, userRole) {
  // Patient can access their own records
  if (patientId === userId) return true;
  
  // Admin has access to all records
  if (userRole === 'admin') return true;
  
  // Check if user has explicit access permission
  const hasPermission = await MedicalRecord.findOne({
    patient: patientId,
    'accessPermissions.user': userId,
    $or: [
      { 'accessPermissions.expiryDate': { $exists: false } },
      { 'accessPermissions.expiryDate': { $gt: new Date() } }
    ]
  });
  
  return !!hasPermission;
}

async function checkRecordAccess(record, userId, userRole) {
  // Patient can access their own records
  if (record.patient.equals(userId)) return true;
  
  // Doctor who created the record has access
  if (record.doctor.equals(userId)) return true;
  
  // Admin has access to all records
  if (userRole === 'admin') return true;
  
  // Check explicit permissions
  return record.hasAccess(userId, 'read');
}

function generateDigitalSignature(data, doctorId) {
  const dataString = JSON.stringify(data) + doctorId + new Date().toISOString();
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

function generateVerificationHash(data) {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

function decodeEmergencyQR(qrCode) {
  try {
    // Simple base64 decode for demo - in production use proper encryption
    const decoded = Buffer.from(qrCode, 'base64').toString('utf-8');
    const data = JSON.parse(decoded);
    return data.patientId;
  } catch (error) {
    return null;
  }
}

module.exports = router;
