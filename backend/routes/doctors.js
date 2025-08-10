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

// @desc    Get doctor analytics
// @route   GET /api/doctors/analytics
// @access  Private (Doctor only)
router.get('/analytics', protect, authorize('doctor'), requireVerification, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { timeRange = '30d' } = req.query; // Default to last 30 days

    let startDate = new Date();
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate = new Date(0); // Epoch time for "all time"
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Total patients seen by this doctor
    const uniquePatientIds = await MedicalRecord.distinct('patient', { doctor: doctorId });
    const totalPatients = uniquePatientIds.length;

    // Medical records created by this doctor within the time range
    const recordsInTimeRange = await MedicalRecord.find({
      doctor: doctorId,
      createdAt: { $gte: startDate }
    }).populate('patient', 'dateOfBirth gender');

    const totalRecords = recordsInTimeRange.length;

    // New patients within the time range
    const newPatients = await User.countDocuments({
      _id: { $in: uniquePatientIds },
      createdAt: { $gte: startDate }
    });

    // Appointments today (based on visitDate)
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const appointmentsToday = await MedicalRecord.countDocuments({
      doctor: doctorId,
      visitDate: { $gte: todayStart, $lt: todayEnd }
    });

    // Common Diagnoses
    const commonDiagnoses = await MedicalRecord.aggregate([
      { $match: { doctor: new mongoose.Types.ObjectId(doctorId), 'diagnosis.primary': { $exists: true, $ne: null } } },
      { $group: { _id: '$diagnosis.primary', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Patient Demographics (Age and Gender)
    const patientAges = recordsInTimeRange.map(record => {
      if (record.patient && record.patient.dateOfBirth) {
        return new Date().getFullYear() - new Date(record.patient.dateOfBirth).getFullYear();
      }
      return null;
    }).filter(age => age !== null);

    const ageRanges = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };
    patientAges.forEach(age => {
      if (age <= 18) ageRanges['0-18']++;
      else if (age <= 35) ageRanges['19-35']++;
      else if (age <= 50) ageRanges['36-50']++;
      else if (age <= 65) ageRanges['51-65']++;
      else ageRanges['65+']++;
    });

    const genderDistribution = { Male: 0, Female: 0, Other: 0 };
    recordsInTimeRange.forEach(record => {
      if (record.patient && record.patient.gender) {
        if (record.patient.gender === 'male') genderDistribution.Male++;
        else if (record.patient.gender === 'female') genderDistribution.Female++;
        else genderDistribution.Other++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        patientCount: totalPatients,
        newPatients: newPatients,
        appointmentsToday: appointmentsToday,
        totalRecords: totalRecords,
        commonDiagnoses: commonDiagnoses.map(d => ({ name: d._id, count: d.count })),
        patientDemographics: {
          age: Object.entries(ageRanges).map(([range, count]) => ({ range, count })),
          gender: Object.entries(genderDistribution).map(([name, count]) => ({ name, count }))
        },
        // Placeholder for appointment stats - needs more complex logic to track completed/cancelled
        appointmentStats: {
          total: appointmentsToday, // For now, just total today's
          completed: 0,
          cancelled: 0,
          noShow: 0
        }
      }
    });

  } catch (error) {
    logger.error('Get doctor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve doctor analytics'
    });
  }
});

module.exports = router;
