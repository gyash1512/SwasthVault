const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize, requireVerification } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on file type
    if (file.fieldname === 'medicalReport') {
      uploadPath += 'medical-reports/';
    } else if (file.fieldname === 'prescription') {
      uploadPath += 'prescriptions/';
    } else if (file.fieldname === 'labResult') {
      uploadPath += 'lab-results/';
    } else {
      uploadPath += 'other/';
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, and DOCX files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files per request
  }
});

// @desc    Upload medical documents
// @route   POST /api/upload/medical-documents/:recordId
// @access  Private (Doctor only)
router.post('/medical-documents/:recordId', 
  protect, 
  authorize('doctor'), 
  requireVerification,
  upload.array('documents', 5),
  async (req, res) => {
    try {
      const { recordId } = req.params;
      const { category, description } = req.body;

      // Find medical record
      const record = await MedicalRecord.findById(recordId);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Medical record not found'
        });
      }

      // Check if doctor has permission to upload
      if (!record.doctor.equals(req.user.id) && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to upload documents to this record'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Process uploaded files
      const uploadedFiles = req.files.map(file => ({
        fileName: file.filename,
        originalName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        category: category || 'other',
        description: description || '',
        uploadDate: new Date()
      }));

      // Add files to medical record
      record.attachments.push(...uploadedFiles);
      await record.save();

      // Add audit trail entry
      await record.addAuditEntry(
        'updated',
        req.user.id,
        `${uploadedFiles.length} document(s) uploaded`,
        req.ip,
        req.get('User-Agent')
      );

      logger.info(`${uploadedFiles.length} documents uploaded to record ${recordId} by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Documents uploaded successfully',
        data: {
          recordId,
          uploadedFiles: uploadedFiles.map(file => ({
            fileName: file.fileName,
            originalName: file.originalName,
            fileSize: file.fileSize,
            category: file.category
          }))
        }
      });

    } catch (error) {
      // Clean up uploaded files if there's an error
      if (req.files) {
        req.files.forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) logger.error('Error deleting file:', err);
          });
        });
      }

      logger.error('Upload medical documents error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload documents'
      });
    }
  }
);

// @desc    Upload profile picture
// @route   POST /api/upload/profile-picture
// @access  Private
router.post('/profile-picture',
  protect,
  requireVerification,
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No profile picture uploaded'
        });
      }

      // Update user profile picture
      const User = require('../models/User');
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { profilePicture: req.file.filename },
        { new: true }
      ).select('-password');

      logger.info(`Profile picture updated for user ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          profilePicture: req.file.filename,
          user
        }
      });

    } catch (error) {
      // Clean up uploaded file if there's an error
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) logger.error('Error deleting file:', err);
        });
      }

      logger.error('Upload profile picture error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile picture'
      });
    }
  }
);

// @desc    Get uploaded file
// @route   GET /api/upload/file/:filename
// @access  Private
router.get('/file/:filename', protect, async (req, res) => {
  try {
    const { filename } = req.params;

    // Find which medical record this file belongs to
    const record = await MedicalRecord.findOne({
      'attachments.fileName': filename
    }).populate('patient doctor');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
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
        message: 'Access denied to this file'
      });
    }

    // Find the file attachment
    const attachment = record.attachments.find(att => att.fileName === filename);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'File attachment not found'
      });
    }

    // Determine file path based on category
    let filePath;
    if (attachment.category === 'prescription') {
      filePath = path.join('uploads/prescriptions', filename);
    } else if (attachment.category === 'lab_report') {
      filePath = path.join('uploads/lab-results', filename);
    } else {
      filePath = path.join('uploads/medical-reports', filename);
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Add audit trail entry for file access
    await record.addAuditEntry(
      'viewed',
      req.user.id,
      `File accessed: ${attachment.originalName}`,
      req.ip,
      req.get('User-Agent')
    );

    // Set appropriate headers
    res.setHeader('Content-Type', attachment.fileType);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.originalName}"`);

    // Send file
    res.sendFile(path.resolve(filePath));

  } catch (error) {
    logger.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve file'
    });
  }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/delete/:recordId
// @access  Private (Doctor only)
router.delete('/delete/:recordId', 
  protect, 
  authorize('doctor'), 
  requireVerification, 
  async (req, res) => {
    try {
      const { recordId } = req.params;
      const { filename } = req.body;

      if (!filename) {
        return res.status(400).json({
          success: false,
          message: 'Filename is required in request body'
        });
      }

      const record = await MedicalRecord.findById(recordId);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Medical record not found'
        });
      }

      // Check if doctor has permission
      if (!record.doctor.equals(req.user.id) && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete files from this record'
        });
      }

      // Find and remove attachment
      const attachmentIndex = record.attachments.findIndex(att => att.fileName === filename);
      if (attachmentIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'File attachment not found'
        });
      }

      const attachment = record.attachments[attachmentIndex];
      record.attachments.splice(attachmentIndex, 1);
      await record.save();

      // Delete physical file
      let filePath;
      if (attachment.category === 'prescription') {
        filePath = path.join('uploads/prescriptions', filename);
      } else if (attachment.category === 'lab_report') {
        filePath = path.join('uploads/lab-results', filename);
      } else {
        filePath = path.join('uploads/medical-reports', filename);
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Add audit trail entry
      await record.addAuditEntry(
        'updated',
        req.user.id,
        `File deleted: ${attachment.originalName}`,
        req.ip,
        req.get('User-Agent')
      );

      logger.info(`File ${filename} deleted from record ${recordId} by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });

    } catch (error) {
      logger.error('Delete file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file'
      });
    }
  }
);

module.exports = router;
