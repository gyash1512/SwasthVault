const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  // Patient Information
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient reference is required'],
    index: true
  },

  // Healthcare Provider Information
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor reference is required']
  },

  hospital: {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    registrationNumber: {
      type: String,
      required: [true, 'Hospital registration number is required']
    }
  },

  // Visit Information
  visitType: {
    type: String,
    required: [true, 'Visit type is required'],
    enum: ['consultation', 'emergency', 'surgery', 'follow_up', 'diagnostic', 'vaccination', 'checkup']
  },

  visitDate: {
    type: Date,
    required: [true, 'Visit date is required'],
    default: Date.now
  },

  // Medical Information
  chiefComplaint: {
    type: String,
    required: [true, 'Chief complaint is required'],
    trim: true,
    maxlength: [500, 'Chief complaint cannot exceed 500 characters']
  },

  historyOfPresentIllness: {
    type: String,
    trim: true,
    maxlength: [2000, 'History of present illness cannot exceed 2000 characters']
  },

  // Physical Examination
  vitalSigns: {
    temperature: {
      value: Number,
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      }
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: {
        type: String,
        default: 'mmHg'
      }
    },
    heartRate: {
      value: Number,
      unit: {
        type: String,
        default: 'bpm'
      }
    },
    respiratoryRate: {
      value: Number,
      unit: {
        type: String,
        default: 'breaths/min'
      }
    },
    oxygenSaturation: {
      value: Number,
      unit: {
        type: String,
        default: '%'
      }
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
      }
    },
    height: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'inches'],
        default: 'cm'
      }
    },
    bmi: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  physicalExamination: {
    general: String,
    cardiovascular: String,
    respiratory: String,
    gastrointestinal: String,
    neurological: String,
    musculoskeletal: String,
    dermatological: String,
    other: String
  },

  // Diagnosis
  diagnosis: {
    primary: {
      type: String,
      required: [true, 'Primary diagnosis is required'],
      trim: true
    },
    secondary: [{
      type: String,
      trim: true
    }],
    icdCodes: [{
      code: String,
      description: String
    }]
  },

  // Treatment Plan
  treatment: {
    medications: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      dosage: {
        type: String,
        required: true
      },
      frequency: {
        type: String,
        required: true
      },
      duration: {
        type: String,
        required: true
      },
      instructions: String,
      startDate: {
        type: Date,
        default: Date.now
      },
      endDate: Date
    }],

    procedures: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: String,
      date: {
        type: Date,
        default: Date.now
      },
      outcome: String,
      complications: String
    }],

    recommendations: [{
      type: String,
      trim: true
    }],

    followUpInstructions: {
      type: String,
      trim: true
    },

    nextAppointment: {
      date: Date,
      reason: String,
      doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  },

  // Lab Results and Diagnostic Reports
  labResults: [{
    testName: {
      type: String,
      required: true,
      trim: true
    },
    testDate: {
      type: Date,
      required: true
    },
    results: [{
      parameter: String,
      value: String,
      unit: String,
      referenceRange: String,
      status: {
        type: String,
        enum: ['normal', 'abnormal', 'critical'],
        default: 'normal'
      }
    }],
    interpretation: String,
    reportFile: String // File path for uploaded report
  }],

  // Imaging Studies
  imagingStudies: [{
    studyType: {
      type: String,
      required: true,
      enum: ['x_ray', 'ct_scan', 'mri', 'ultrasound', 'mammography', 'pet_scan', 'other']
    },
    studyDate: {
      type: Date,
      required: true
    },
    bodyPart: String,
    findings: String,
    impression: String,
    reportFile: String, // File path for uploaded report
    imageFiles: [String] // Array of image file paths
  }],

  // Allergies and Adverse Reactions
  allergies: [{
    allergen: {
      type: String,
      required: true,
      trim: true
    },
    reaction: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'life_threatening'],
      required: true
    },
    dateIdentified: {
      type: Date,
      default: Date.now
    }
  }],

  // Emergency Information
  emergencyInfo: {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    chronicConditions: [{
      condition: String,
      diagnosedDate: Date,
      status: {
        type: String,
        enum: ['active', 'resolved', 'managed'],
        default: 'active'
      }
    }],
    currentMedications: [{
      name: String,
      dosage: String,
      frequency: String
    }],
    medicalAlerts: [{
      type: String,
      description: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      }
    }]
  },

  // Document Attachments
  attachments: [{
    fileName: String,
    originalName: String,
    fileType: String,
    fileSize: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['prescription', 'lab_report', 'imaging', 'discharge_summary', 'other']
    },
    description: String
  }],

  // Record Status
  status: {
    type: String,
    enum: ['draft', 'completed', 'reviewed', 'amended'],
    default: 'draft'
  },

  // Privacy and Access Control
  accessPermissions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessLevel: {
      type: String,
      enum: ['read', 'write', 'full'],
      default: 'read'
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    grantedDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date,
    purpose: String
  }],

  // Audit Trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'viewed', 'shared', 'deleted'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    ipAddress: String,
    userAgent: String
  }],

  // Version Control
  version: {
    type: Number,
    default: 1
  },

  previousVersions: [{
    versionNumber: Number,
    data: mongoose.Schema.Types.Mixed,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedDate: Date,
    changeReason: String
  }],

  // Metadata
  tags: [String],
  notes: String,
  isEmergencyAccessible: {
    type: Boolean,
    default: false
  },

  // Blockchain Integration (for tamper-proof records)
  blockchainHash: String,
  blockchainTransactionId: String,

  // Record Validity
  isValid: {
    type: Boolean,
    default: true
  },

  invalidationReason: String,
  invalidatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  invalidatedDate: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
medicalRecordSchema.index({ patient: 1, visitDate: -1 });
medicalRecordSchema.index({ doctor: 1, visitDate: -1 });
medicalRecordSchema.index({ 'hospital.registrationNumber': 1 });
medicalRecordSchema.index({ visitType: 1 });
medicalRecordSchema.index({ status: 1 });
medicalRecordSchema.index({ isEmergencyAccessible: 1 });
medicalRecordSchema.index({ createdAt: -1 });
medicalRecordSchema.index({ 'diagnosis.primary': 'text', 'chiefComplaint': 'text' });

// Virtual for BMI calculation
medicalRecordSchema.virtual('calculatedBMI').get(function() {
  if (this.vitalSigns.weight?.value && this.vitalSigns.height?.value) {
    const weightInKg = this.vitalSigns.weight.unit === 'lbs' 
      ? this.vitalSigns.weight.value * 0.453592 
      : this.vitalSigns.weight.value;
    
    const heightInM = this.vitalSigns.height.unit === 'inches' 
      ? this.vitalSigns.height.value * 0.0254 
      : this.vitalSigns.height.value / 100;
    
    return Math.round((weightInKg / (heightInM * heightInM)) * 100) / 100;
  }
  return null;
});

// Virtual for record age
medicalRecordSchema.virtual('recordAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to calculate BMI
medicalRecordSchema.pre('save', function(next) {
  if (this.vitalSigns.weight?.value && this.vitalSigns.height?.value) {
    this.vitalSigns.bmi = this.calculatedBMI;
  }
  next();
});

// Pre-save middleware to increment version
medicalRecordSchema.pre('save', function(next) {
  if (!this.isNew && this.isModified()) {
    // Store previous version
    this.previousVersions.push({
      versionNumber: this.version,
      data: this.toObject(),
      modifiedBy: this.updatedBy,
      modifiedDate: new Date(),
      changeReason: this.changeReason || 'Record updated'
    });
    
    this.version += 1;
  }
  next();
});

// Instance method to add audit trail entry
medicalRecordSchema.methods.addAuditEntry = function(action, performedBy, details, ipAddress, userAgent) {
  this.auditTrail.push({
    action,
    performedBy,
    details,
    ipAddress,
    userAgent,
    timestamp: new Date()
  });
  return this.save();
};

// Instance method to grant access permission
medicalRecordSchema.methods.grantAccess = function(userId, accessLevel, grantedBy, purpose, expiryDate) {
  // Remove existing permission for the user
  this.accessPermissions = this.accessPermissions.filter(
    permission => !permission.user.equals(userId)
  );
  
  // Add new permission
  this.accessPermissions.push({
    user: userId,
    accessLevel,
    grantedBy,
    purpose,
    expiryDate,
    grantedDate: new Date()
  });
  
  return this.save();
};

// Instance method to revoke access permission
medicalRecordSchema.methods.revokeAccess = function(userId) {
  this.accessPermissions = this.accessPermissions.filter(
    permission => !permission.user.equals(userId)
  );
  return this.save();
};

// Instance method to check if user has access
medicalRecordSchema.methods.hasAccess = function(userId, requiredLevel = 'read') {
  const permission = this.accessPermissions.find(
    p => p.user.equals(userId) && (!p.expiryDate || p.expiryDate > new Date())
  );
  
  if (!permission) return false;
  
  const accessLevels = { read: 1, write: 2, full: 3 };
  return accessLevels[permission.accessLevel] >= accessLevels[requiredLevel];
};

// Static method to find records by patient with access control
medicalRecordSchema.statics.findByPatientWithAccess = function(patientId, userId, accessLevel = 'read') {
  return this.find({
    $or: [
      { patient: patientId, patient: userId }, // Patient accessing their own records
      { 
        patient: patientId,
        'accessPermissions.user': userId,
        'accessPermissions.accessLevel': { $in: this.getAccessLevels(accessLevel) },
        $or: [
          { 'accessPermissions.expiryDate': { $exists: false } },
          { 'accessPermissions.expiryDate': { $gt: new Date() } }
        ]
      }
    ],
    isValid: true
  }).populate('patient doctor').sort({ visitDate: -1 });
};

// Static method to get access levels hierarchy
medicalRecordSchema.statics.getAccessLevels = function(minLevel) {
  const levels = { read: ['read', 'write', 'full'], write: ['write', 'full'], full: ['full'] };
  return levels[minLevel] || ['read'];
};

// Static method for emergency access
medicalRecordSchema.statics.getEmergencyRecords = function(patientId) {
  return this.find({
    patient: patientId,
    isEmergencyAccessible: true,
    isValid: true
  }).select('emergencyInfo allergies diagnosis.primary vitalSigns.bloodGroup patient')
    .populate('patient', 'firstName lastName dateOfBirth emergencyContact')
    .sort({ visitDate: -1 })
    .limit(5);
};

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
