const express = require('express');
const { protect, authorize, requireVerification } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get audit logs for medical records
// @route   GET /api/audit/medical-records/:recordId
// @access  Private (Admin or record owner)
router.get('/medical-records/:recordId', protect, requireVerification, async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await MedicalRecord.findById(recordId)
      .populate('auditTrail.performedBy', 'firstName lastName email role')
      .select('auditTrail patient doctor');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check access permissions
    let hasAccess = false;
    
    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (req.user.role === 'patient' && record.patient.equals(req.user.id)) {
      hasAccess = true;
    } else if (req.user.role === 'doctor' && record.doctor.equals(req.user.id)) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to audit logs'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        recordId,
        auditTrail: record.auditTrail
      }
    });

  } catch (error) {
    logger.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs'
    });
  }
});

// @desc    Get system audit logs
// @route   GET /api/audit/system
// @access  Private (Admin only)
router.get('/system', protect, authorize('admin'), requireVerification, async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId, startDate, endDate } = req.query;

    // Build aggregation pipeline
    const pipeline = [
      { $unwind: '$auditTrail' },
      {
        $lookup: {
          from: 'users',
          localField: 'auditTrail.performedBy',
          foreignField: '_id',
          as: 'auditTrail.user'
        }
      },
      { $unwind: '$auditTrail.user' },
      {
        $project: {
          recordId: '$_id',
          action: '$auditTrail.action',
          performedBy: {
            id: '$auditTrail.performedBy',
            name: { $concat: ['$auditTrail.user.firstName', ' ', '$auditTrail.user.lastName'] },
            email: '$auditTrail.user.email',
            role: '$auditTrail.user.role'
          },
          timestamp: '$auditTrail.timestamp',
          details: '$auditTrail.details',
          ipAddress: '$auditTrail.ipAddress',
          userAgent: '$auditTrail.userAgent'
        }
      }
    ];

    // Add filters
    const matchConditions = {};
    
    if (action) {
      matchConditions.action = action;
    }
    
    if (userId) {
      matchConditions['performedBy.id'] = userId;
    }
    
    if (startDate || endDate) {
      matchConditions.timestamp = {};
      if (startDate) {
        matchConditions.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        matchConditions.timestamp.$lte = new Date(endDate);
      }
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Add sorting and pagination
    pipeline.push(
      { $sort: { timestamp: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    );

    const auditLogs = await MedicalRecord.aggregate(pipeline);

    // Get total count
    const countPipeline = [...pipeline.slice(0, -2)];
    countPipeline.push({ $count: 'total' });
    const countResult = await MedicalRecord.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      count: auditLogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: auditLogs
    });

  } catch (error) {
    logger.error('Get system audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system audit logs'
    });
  }
});

// @desc    Get user activity logs
// @route   GET /api/audit/user/:userId
// @access  Private (Admin or self)
router.get('/user/:userId', protect, requireVerification, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check access permissions
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to user activity logs'
      });
    }

    const pipeline = [
      { $unwind: '$auditTrail' },
      { $match: { 'auditTrail.performedBy': userId } },
      {
        $lookup: {
          from: 'users',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      { $unwind: '$patientInfo' },
      {
        $project: {
          recordId: '$_id',
          action: '$auditTrail.action',
          timestamp: '$auditTrail.timestamp',
          details: '$auditTrail.details',
          patient: {
            id: '$patient',
            name: { $concat: ['$patientInfo.firstName', ' ', '$patientInfo.lastName'] }
          },
          ipAddress: '$auditTrail.ipAddress'
        }
      },
      { $sort: { timestamp: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ];

    const userActivity = await MedicalRecord.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: userActivity.length,
      page: parseInt(page),
      data: userActivity
    });

  } catch (error) {
    logger.error('Get user activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user activity logs'
    });
  }
});

module.exports = router;
