const express = require('express');
const qrcode = require('qrcode');
const { protect, emergencyAccess } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get emergency medical information
// @route   GET /api/emergency/:patientId
// @access  Private (Emergency personnel only)
router.get('/:patientId', protect, emergencyAccess, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Get emergency records
    const emergencyRecords = await MedicalRecord.getEmergencyRecords(patientId);

    if (!emergencyRecords || emergencyRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No emergency medical information found for this patient'
      });
    }

    // Log emergency access
    logger.warn(`Emergency access granted to ${req.user.email} for patient ${patientId}`);

    // Add audit trail to all accessed records
    for (const record of emergencyRecords) {
      await record.addAuditEntry(
        'viewed',
        req.user.id,
        'Emergency access - medical record viewed',
        req.ip,
        req.get('User-Agent')
      );
    }

    res.status(200).json({
      success: true,
      message: 'Emergency medical information retrieved',
      data: {
        patient: emergencyRecords[0].patient,
        emergencyInfo: emergencyRecords.map(record => ({
          recordId: record._id,
          visitDate: record.visitDate,
          emergencyInfo: record.emergencyInfo,
          allergies: record.allergies,
          primaryDiagnosis: record.diagnosis.primary,
          bloodGroup: record.vitalSigns?.bloodGroup || record.emergencyInfo?.bloodGroup
        })),
        accessedBy: {
          name: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email,
          role: req.user.role
        },
        accessTime: new Date()
      }
    });

  } catch (error) {
    logger.error('Emergency access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve emergency medical information'
    });
  }
});

// @desc    Generate emergency QR code for patient
// @route   GET /api/emergency/qr/:patientId
// @access  Private (Patient or Doctor)
router.get('/qr/:patientId', protect, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check if user has permission to generate QR code
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get patient information
    const patient = await User.findById(patientId).select('firstName lastName dateOfBirth emergencyContact');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get latest emergency information
    const latestRecord = await MedicalRecord.findOne({
      patient: patientId,
      isEmergencyAccessible: true
    }).sort({ visitDate: -1 }).select('emergencyInfo allergies diagnosis.primary');

    // Create emergency data for QR code
    const emergencyData = {
      patientId,
      name: `${patient.firstName} ${patient.lastName}`,
      dob: patient.dateOfBirth,
      emergencyContact: patient.emergencyContact,
      bloodGroup: latestRecord?.emergencyInfo?.bloodGroup,
      allergies: latestRecord?.allergies?.map(allergy => ({
        allergen: allergy.allergen,
        severity: allergy.severity
      })) || [],
      chronicConditions: latestRecord?.emergencyInfo?.chronicConditions || [],
      currentMedications: latestRecord?.emergencyInfo?.currentMedications || [],
      lastDiagnosis: latestRecord?.diagnosis?.primary,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + (process.env.EMERGENCY_QR_EXPIRY || 3600) * 1000)
    };

    // Generate QR code
    const qrCodeData = JSON.stringify(emergencyData);
    const qrCodeUrl = await qrcode.toDataURL(qrCodeData);

    logger.info(`Emergency QR code generated for patient ${patientId} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Emergency QR code generated successfully',
      data: {
        qrCode: qrCodeUrl,
        emergencyData,
        instructions: 'This QR code contains emergency medical information. Show to emergency personnel when needed.'
      }
    });

  } catch (error) {
    logger.error('Generate emergency QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate emergency QR code'
    });
  }
});

// @desc    Scan emergency QR code
// @route   POST /api/emergency/scan
// @access  Private (Emergency personnel only)
router.post('/scan', protect, emergencyAccess, async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // Parse QR code data
    let emergencyData;
    try {
      emergencyData = JSON.parse(qrData);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format'
      });
    }

    // Check if QR code has expired
    if (emergencyData.expiresAt && new Date() > new Date(emergencyData.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'QR code has expired'
      });
    }

    // Log emergency QR scan
    logger.warn(`Emergency QR code scanned by ${req.user.email} for patient ${emergencyData.patientId}`);

    // Get additional recent medical information
    const recentRecords = await MedicalRecord.find({
      patient: emergencyData.patientId,
      isEmergencyAccessible: true
    }).sort({ visitDate: -1 }).limit(3).select('visitDate diagnosis.primary emergencyInfo');

    res.status(200).json({
      success: true,
      message: 'Emergency QR code scanned successfully',
      data: {
        ...emergencyData,
        recentMedicalHistory: recentRecords,
        scannedBy: {
          name: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email,
          role: req.user.role
        },
        scanTime: new Date()
      }
    });

  } catch (error) {
    logger.error('Scan emergency QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scan emergency QR code'
    });
  }
});

// @desc    Search patient by Aadhaar for emergency access
// @route   POST /api/emergency/search
// @access  Private (Emergency personnel only)
router.post('/search', protect, emergencyAccess, async (req, res) => {
  try {
    const { aadhaarNumber, phoneNumber } = req.body;

    if (!aadhaarNumber && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar number or phone number is required'
      });
    }

    // Search for patient
    const searchQuery = {};
    if (aadhaarNumber) {
      searchQuery.aadhaarNumber = aadhaarNumber;
    }
    if (phoneNumber) {
      searchQuery.phoneNumber = phoneNumber;
    }

    const patient = await User.findOne({
      $or: [searchQuery],
      role: 'patient'
    }).select('firstName lastName dateOfBirth phoneNumber emergencyContact');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Log emergency search
    logger.warn(`Emergency patient search by ${req.user.email} for ${aadhaarNumber || phoneNumber}`);

    res.status(200).json({
      success: true,
      message: 'Patient found',
      data: {
        patientId: patient._id,
        name: `${patient.firstName} ${patient.lastName}`,
        dateOfBirth: patient.dateOfBirth,
        phoneNumber: patient.phoneNumber,
        emergencyContact: patient.emergencyContact
      }
    });

  } catch (error) {
    logger.error('Emergency patient search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search for patient'
    });
  }
});

module.exports = router;
