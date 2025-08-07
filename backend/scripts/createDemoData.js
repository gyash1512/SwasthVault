const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

// Import models
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');

// Demo data creation script
async function createDemoData() {
  try {
    console.log('🚀 Starting demo data creation...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing demo data
    await User.deleteMany({ email: { $regex: /@demo\.com$/ } });
    await MedicalRecord.deleteMany({});
    console.log('🧹 Cleared existing demo data');

    // Create demo users
    const demoUsers = await createDemoUsers();
    console.log('👥 Created demo users');

    // Create demo medical records with version history
    await createDemoMedicalRecords(demoUsers);
    console.log('📋 Created demo medical records');

    console.log('🎉 Demo data creation completed successfully!');
    console.log('\n📊 Demo Data Summary:');
    console.log('👨‍⚕️ Doctors: Dr. Sarah Smith, Dr. Michael Johnson, Dr. Emily Davis');
    console.log('👤 Patients: John Doe, Jane Smith, Robert Wilson');
    console.log('🔐 Admin: admin@demo.com / admin123');
    console.log('🏥 Medical Records: Complete patient histories with version control');
    console.log('\n🌐 Login Credentials:');
    console.log('Admin: admin@demo.com / admin123');
    console.log('Doctor: dr.smith@demo.com / doctor123');
    console.log('Patient: john.doe@demo.com / patient123');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function createDemoUsers() {
  const users = [];

  // Admin User
  const admin = await User.create({
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@demo.com',
    password: 'admin123',
    aadhaarNumber: '999999999999',
    phoneNumber: '+919999999999',
    dateOfBirth: new Date('1980-01-01'),
    gender: 'male',
    role: 'admin',
    isVerified: true,
    isActive: true,
    address: {
      street: 'Admin Street',
      city: 'Admin City',
      state: 'Admin State',
      pincode: '000000'
    }
  });
  users.push(admin);

  // Doctors
  const doctors = [
    {
      firstName: 'Dr. Sarah',
      lastName: 'Smith',
      email: 'dr.smith@demo.com',
      password: 'doctor123',
      aadhaarNumber: '111111111111',
      phoneNumber: '+919111111111',
      dateOfBirth: new Date('1975-03-15'),
      gender: 'female',
      role: 'doctor',
      specialization: 'Cardiology',
      licenseNumber: 'MED001',
      hospitalAffiliation: 'City General Hospital'
    },
    {
      firstName: 'Dr. Michael',
      lastName: 'Johnson',
      email: 'dr.johnson@demo.com',
      password: 'doctor123',
      aadhaarNumber: '222222222222',
      phoneNumber: '+919222222222',
      dateOfBirth: new Date('1978-07-22'),
      gender: 'male',
      role: 'doctor',
      specialization: 'Internal Medicine',
      licenseNumber: 'MED002',
      hospitalAffiliation: 'Metro Medical Center'
    },
    {
      firstName: 'Dr. Emily',
      lastName: 'Davis',
      email: 'dr.davis@demo.com',
      password: 'doctor123',
      aadhaarNumber: '333333333333',
      phoneNumber: '+919333333333',
      dateOfBirth: new Date('1982-11-08'),
      gender: 'female',
      role: 'doctor',
      specialization: 'Endocrinology',
      licenseNumber: 'MED003',
      hospitalAffiliation: 'Specialty Care Institute'
    }
  ];

  for (const doctorData of doctors) {
    const doctor = await User.create({
      ...doctorData,
      isVerified: true,
      isActive: true,
      address: {
        street: '123 Medical Plaza',
        city: 'Healthcare City',
        state: 'Medical State',
        pincode: '123456'
      }
    });
    users.push(doctor);
  }

  // Patients
  const patients = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@demo.com',
      password: 'patient123',
      aadhaarNumber: '444444444444',
      phoneNumber: '+919444444444',
      dateOfBirth: new Date('1985-05-10'),
      gender: 'male',
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Shellfish'],
      chronicConditions: ['Hypertension']
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@demo.com',
      password: 'patient123',
      aadhaarNumber: '555555555555',
      phoneNumber: '+919555555555',
      dateOfBirth: new Date('1990-12-25'),
      gender: 'female',
      bloodGroup: 'A+',
      allergies: ['Latex'],
      chronicConditions: ['Diabetes Type 2']
    },
    {
      firstName: 'Robert',
      lastName: 'Wilson',
      email: 'robert.wilson@demo.com',
      password: 'patient123',
      aadhaarNumber: '666666666666',
      phoneNumber: '+919666666666',
      dateOfBirth: new Date('1970-08-14'),
      gender: 'male',
      bloodGroup: 'B+',
      allergies: ['Aspirin'],
      chronicConditions: ['Arthritis', 'High Cholesterol']
    }
  ];

  for (const patientData of patients) {
    const patient = await User.create({
      ...patientData,
      role: 'patient',
      isVerified: true,
      isActive: true,
      address: {
        street: '456 Residential Ave',
        city: 'Patient City',
        state: 'Patient State',
        pincode: '654321'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'spouse',
        phoneNumber: '+919000000000'
      }
    });
    users.push(patient);
  }

  return users;
}

async function createDemoMedicalRecords(users) {
  const doctors = users.filter(u => u.role === 'doctor');
  const patients = users.filter(u => u.role === 'patient');

  // Create comprehensive medical records for John Doe (Patient 1)
  await createJohnDoeRecords(patients[0], doctors);
  
  // Create medical records for Jane Smith (Patient 2)
  await createJaneSmithRecords(patients[1], doctors);
  
  // Create medical records for Robert Wilson (Patient 3)
  await createRobertWilsonRecords(patients[2], doctors);
}

async function createJohnDoeRecords(patient, doctors) {
  const drSmith = doctors.find(d => d.firstName === 'Dr. Sarah');
  const drJohnson = doctors.find(d => d.firstName === 'Dr. Michael');

  // Initial consultation (Version 1.0)
  const initialRecord = await MedicalRecord.create({
    patient: patient._id,
    doctor: drSmith._id,
    hospital: {
      name: 'City General Hospital',
      address: {
        street: '123 Hospital Road',
        city: 'Healthcare City',
        state: 'Medical State',
        pincode: '123456'
      },
      registrationNumber: 'HOSP001'
    },
    visitType: 'consultation',
    visitDate: new Date('2024-01-15'),
    chiefComplaint: 'Chest pain and shortness of breath',
    historyOfPresentIllness: 'Patient reports intermittent chest pain for the past 2 weeks, associated with mild shortness of breath during exertion.',
    vitalSigns: {
      temperature: { value: 98.6, unit: 'fahrenheit' },
      bloodPressure: { systolic: 145, diastolic: 95 },
      heartRate: { value: 88 },
      respiratoryRate: { value: 16 },
      oxygenSaturation: { value: 98 },
      weight: { value: 75, unit: 'kg' },
      height: { value: 175, unit: 'cm' }
    },
    physicalExamination: {
      general: 'Alert and oriented, appears comfortable',
      cardiovascular: 'Regular rate and rhythm, no murmurs',
      respiratory: 'Clear to auscultation bilaterally',
      other: 'No acute distress'
    },
    diagnosis: {
      primary: 'Essential Hypertension',
      secondary: ['Chest pain - rule out cardiac cause'],
      icdCodes: [{ code: 'I10', description: 'Essential hypertension' }]
    },
    treatment: {
      medications: [{
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take in the morning',
        startDate: new Date('2024-01-15')
      }],
      recommendations: [
        'Low sodium diet',
        'Regular exercise',
        'Weight management'
      ],
      followUpInstructions: 'Return in 2 weeks for blood pressure check',
      nextAppointment: {
        date: new Date('2024-01-29'),
        reason: 'Blood pressure follow-up',
        doctor: drSmith._id
      }
    },
    emergencyInfo: {
      bloodGroup: 'O+',
      chronicConditions: [{
        condition: 'Hypertension',
        diagnosedDate: new Date('2024-01-15'),
        status: 'active'
      }],
      currentMedications: [{
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily'
      }]
    },
    digitalSignature: {
      doctorSignature: generateSignature('initial_record', drSmith._id),
      signatureDate: new Date('2024-01-15'),
      verificationHash: 'hash001'
    },
    status: 'completed',
    isEmergencyAccessible: true,
    auditTrail: [{
      action: 'created',
      performedBy: drSmith._id,
      timestamp: new Date('2024-01-15'),
      details: 'Initial consultation record created'
    }]
  });

  // Follow-up visit (Version 1.1) - Update existing record
  await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for timestamp difference
  
  initialRecord.visitDate = new Date('2024-01-29');
  initialRecord.chiefComplaint = 'Follow-up for hypertension management';
  initialRecord.vitalSigns.bloodPressure = { systolic: 135, diastolic: 88 };
  initialRecord.treatment.medications[0].dosage = '20mg';
  initialRecord.treatment.medications[0].instructions = 'Take in the morning, increased dose';
  initialRecord.previousVersions.push({
    versionNumber: 1,
    data: initialRecord.toObject(),
    modifiedBy: drSmith._id,
    modifiedDate: new Date('2024-01-29'),
    changeReason: 'Follow-up visit - medication adjustment'
  });
  initialRecord.version = 2;
  initialRecord.auditTrail.push({
    action: 'updated',
    performedBy: drSmith._id,
    timestamp: new Date('2024-01-29'),
    details: 'Follow-up visit - increased Lisinopril dose to 20mg'
  });
  await initialRecord.save();

  // Lab results addition (Version 1.2)
  await new Promise(resolve => setTimeout(resolve, 100));
  
  initialRecord.labResults = [{
    testName: 'Lipid Panel',
    testDate: new Date('2024-02-05'),
    results: [
      { parameter: 'Total Cholesterol', value: '240', unit: 'mg/dL', referenceRange: '<200', status: 'abnormal' },
      { parameter: 'LDL Cholesterol', value: '160', unit: 'mg/dL', referenceRange: '<100', status: 'abnormal' },
      { parameter: 'HDL Cholesterol', value: '35', unit: 'mg/dL', referenceRange: '>40', status: 'abnormal' },
      { parameter: 'Triglycerides', value: '200', unit: 'mg/dL', referenceRange: '<150', status: 'abnormal' }
    ],
    interpretation: 'Dyslipidemia - elevated cholesterol and triglycerides'
  }];
  
  initialRecord.treatment.medications.push({
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily',
    duration: '30 days',
    instructions: 'Take in the evening',
    startDate: new Date('2024-02-05')
  });

  initialRecord.diagnosis.secondary.push('Dyslipidemia');
  initialRecord.previousVersions.push({
    versionNumber: 2,
    data: initialRecord.toObject(),
    modifiedBy: drSmith._id,
    modifiedDate: new Date('2024-02-05'),
    changeReason: 'Lab results added - started statin therapy'
  });
  initialRecord.version = 3;
  initialRecord.auditTrail.push({
    action: 'updated',
    performedBy: drSmith._id,
    timestamp: new Date('2024-02-05'),
    details: 'Lab results added, started Atorvastatin for dyslipidemia'
  });
  await initialRecord.save();

  // Specialist referral record
  await MedicalRecord.create({
    patient: patient._id,
    doctor: drJohnson._id,
    hospital: {
      name: 'Metro Medical Center',
      address: {
        street: '456 Specialist Blvd',
        city: 'Healthcare City',
        state: 'Medical State',
        pincode: '123456'
      },
      registrationNumber: 'HOSP002'
    },
    visitType: 'consultation',
    visitDate: new Date('2024-02-20'),
    chiefComplaint: 'Cardiology consultation for chest pain evaluation',
    historyOfPresentIllness: 'Referred by Dr. Smith for further evaluation of chest pain in setting of newly diagnosed hypertension.',
    vitalSigns: {
      temperature: { value: 98.4, unit: 'fahrenheit' },
      bloodPressure: { systolic: 130, diastolic: 85 },
      heartRate: { value: 82 },
      respiratoryRate: { value: 14 },
      oxygenSaturation: { value: 99 },
      weight: { value: 74, unit: 'kg' },
      height: { value: 175, unit: 'cm' }
    },
    physicalExamination: {
      cardiovascular: 'Regular rate and rhythm, no murmurs, gallops, or rubs',
      respiratory: 'Clear to auscultation',
      general: 'Well-appearing male in no acute distress'
    },
    diagnosis: {
      primary: 'Atypical chest pain',
      secondary: ['Hypertension - well controlled'],
      icdCodes: [{ code: 'R06.02', description: 'Shortness of breath' }]
    },
    treatment: {
      procedures: [{
        name: 'ECG',
        description: '12-lead electrocardiogram',
        date: new Date('2024-02-20'),
        outcome: 'Normal sinus rhythm, no acute changes'
      }],
      recommendations: [
        'Continue current medications',
        'Stress test if symptoms persist',
        'Return to primary care for routine follow-up'
      ]
    },
    digitalSignature: {
      doctorSignature: generateSignature('specialist_consult', drJohnson._id),
      signatureDate: new Date('2024-02-20'),
      verificationHash: 'hash002'
    },
    status: 'completed',
    auditTrail: [{
      action: 'created',
      performedBy: drJohnson._id,
      timestamp: new Date('2024-02-20'),
      details: 'Cardiology consultation completed'
    }]
  });
}

async function createJaneSmithRecords(patient, doctors) {
  const drDavis = doctors.find(d => d.firstName === 'Dr. Emily');

  // Diabetes management record
  await MedicalRecord.create({
    patient: patient._id,
    doctor: drDavis._id,
    hospital: {
      name: 'Specialty Care Institute',
      address: {
        street: '789 Endocrine Way',
        city: 'Healthcare City',
        state: 'Medical State',
        pincode: '123456'
      },
      registrationNumber: 'HOSP003'
    },
    visitType: 'follow_up',
    visitDate: new Date('2024-01-20'),
    chiefComplaint: 'Diabetes follow-up and management',
    historyOfPresentIllness: 'Patient with Type 2 diabetes for 3 years, currently on metformin. Reports good adherence to diet and exercise.',
    vitalSigns: {
      temperature: { value: 98.2, unit: 'fahrenheit' },
      bloodPressure: { systolic: 125, diastolic: 80 },
      heartRate: { value: 76 },
      weight: { value: 68, unit: 'kg' },
      height: { value: 165, unit: 'cm' }
    },
    diagnosis: {
      primary: 'Type 2 Diabetes Mellitus',
      icdCodes: [{ code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' }]
    },
    treatment: {
      medications: [{
        name: 'Metformin',
        dosage: '1000mg',
        frequency: 'Twice daily',
        duration: '90 days',
        instructions: 'Take with meals'
      }]
    },
    labResults: [{
      testName: 'HbA1c',
      testDate: new Date('2024-01-18'),
      results: [
        { parameter: 'Hemoglobin A1c', value: '7.2', unit: '%', referenceRange: '<7.0', status: 'abnormal' }
      ],
      interpretation: 'Diabetes control suboptimal, consider medication adjustment'
    }],
    emergencyInfo: {
      bloodGroup: 'A+',
      chronicConditions: [{
        condition: 'Type 2 Diabetes',
        diagnosedDate: new Date('2021-01-20'),
        status: 'active'
      }],
      currentMedications: [{
        name: 'Metformin',
        dosage: '1000mg',
        frequency: 'Twice daily'
      }]
    },
    digitalSignature: {
      doctorSignature: generateSignature('diabetes_followup', drDavis._id),
      signatureDate: new Date('2024-01-20'),
      verificationHash: 'hash003'
    },
    status: 'completed',
    isEmergencyAccessible: true,
    auditTrail: [{
      action: 'created',
      performedBy: drDavis._id,
      timestamp: new Date('2024-01-20'),
      details: 'Diabetes follow-up consultation'
    }]
  });
}

async function createRobertWilsonRecords(patient, doctors) {
  const drJohnson = doctors.find(d => d.firstName === 'Dr. Michael');

  // Comprehensive geriatric assessment
  await MedicalRecord.create({
    patient: patient._id,
    doctor: drJohnson._id,
    hospital: {
      name: 'Metro Medical Center',
      address: {
        street: '456 Specialist Blvd',
        city: 'Healthcare City',
        state: 'Medical State',
        pincode: '123456'
      },
      registrationNumber: 'HOSP002'
    },
    visitType: 'checkup',
    visitDate: new Date('2024-01-10'),
    chiefComplaint: 'Annual physical examination',
    historyOfPresentIllness: 'Patient presents for routine annual physical. Reports joint stiffness in the morning, managed with over-the-counter medications.',
    vitalSigns: {
      temperature: { value: 98.0, unit: 'fahrenheit' },
      bloodPressure: { systolic: 140, diastolic: 90 },
      heartRate: { value: 72 },
      respiratoryRate: { value: 16 },
      weight: { value: 82, unit: 'kg' },
      height: { value: 178, unit: 'cm' }
    },
    physicalExamination: {
      general: 'Well-developed, well-nourished male',
      cardiovascular: 'Regular rate and rhythm',
      respiratory: 'Clear to auscultation',
      musculoskeletal: 'Mild joint stiffness in hands and knees'
    },
    diagnosis: {
      primary: 'Osteoarthritis',
      secondary: ['Hyperlipidemia', 'Borderline hypertension'],
      icdCodes: [
        { code: 'M19.90', description: 'Unspecified osteoarthritis, unspecified site' },
        { code: 'E78.5', description: 'Hyperlipidemia, unspecified' }
      ]
    },
    treatment: {
      medications: [{
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'As needed',
        duration: '30 days',
        instructions: 'Take with food for joint pain'
      }],
      recommendations: [
        'Physical therapy for joint mobility',
        'Weight management',
        'Regular low-impact exercise'
      ]
    },
    labResults: [{
      testName: 'Comprehensive Metabolic Panel',
      testDate: new Date('2024-01-08'),
      results: [
        { parameter: 'Total Cholesterol', value: '220', unit: 'mg/dL', referenceRange: '<200', status: 'abnormal' },
        { parameter: 'Glucose', value: '95', unit: 'mg/dL', referenceRange: '70-100', status: 'normal' }
      ]
    }],
    allergies: [{
      allergen: 'Aspirin',
      reaction: 'Gastrointestinal upset',
      severity: 'mild',
      dateIdentified: new Date('2020-01-01')
    }],
    emergencyInfo: {
      bloodGroup: 'B+',
      chronicConditions: [
        { condition: 'Osteoarthritis', diagnosedDate: new Date('2018-01-01'), status: 'active' },
        { condition: 'Hyperlipidemia', diagnosedDate: new Date('2019-01-01'), status: 'active' }
      ],
      medicalAlerts: [{
        type: 'Allergy',
        description: 'Aspirin allergy - GI upset',
        severity: 'medium'
      }]
    },
    digitalSignature: {
      doctorSignature: generateSignature('annual_physical', drJohnson._id),
      signatureDate: new Date('2024-01-10'),
      verificationHash: 'hash004'
    },
    status: 'completed',
    isEmergencyAccessible: true,
    auditTrail: [{
      action: 'created',
      performedBy: drJohnson._id,
      timestamp: new Date('2024-01-10'),
      details: 'Annual physical examination completed'
    }]
  });
}

function generateSignature(recordType, doctorId) {
  return crypto.createHash('sha256')
    .update(recordType + doctorId + Date.now())
    .digest('hex');
}

// Run the script
if (require.main === module) {
  createDemoData();
}

module.exports = { createDemoData };
