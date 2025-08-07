// MongoDB initialization script for SwasthVault
// This script creates the application database and user

// Switch to the SwasthVault database
db = db.getSiblingDB('swasthvault');

// Create application user with read/write permissions
db.createUser({
  user: 'swasthvault_user',
  pwd: 'swasthvault_user_password',
  roles: [
    {
      role: 'readWrite',
      db: 'swasthvault'
    }
  ]
});

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'role', 'firstName', 'lastName'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'must be a valid email address'
        },
        role: {
          bsonType: 'string',
          enum: ['patient', 'doctor', 'emergency_personnel', 'admin'],
          description: 'must be one of the allowed roles'
        },
        firstName: {
          bsonType: 'string',
          minLength: 1,
          description: 'must be a non-empty string'
        },
        lastName: {
          bsonType: 'string',
          minLength: 1,
          description: 'must be a non-empty string'
        }
      }
    }
  }
});

db.createCollection('medicalrecords', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['patient', 'doctor', 'visitDate'],
      properties: {
        patient: {
          bsonType: 'objectId',
          description: 'must be a valid ObjectId reference to a patient'
        },
        doctor: {
          bsonType: 'objectId',
          description: 'must be a valid ObjectId reference to a doctor'
        },
        visitDate: {
          bsonType: 'date',
          description: 'must be a valid date'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ aadhaarNumber: 1 }, { unique: true, sparse: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isVerified: 1 });

db.medicalrecords.createIndex({ patient: 1 });
db.medicalrecords.createIndex({ doctor: 1 });
db.medicalrecords.createIndex({ visitDate: -1 });
db.medicalrecords.createIndex({ 'diagnosis.primary': 'text', 'diagnosis.secondary': 'text' });
db.medicalrecords.createIndex({ isEmergencyAccessible: 1 });

// Create admin user (change password in production)
db.users.insertOne({
  email: 'admin@swasthvault.com',
  password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIf6', // password: admin123
  role: 'admin',
  firstName: 'System',
  lastName: 'Administrator',
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('SwasthVault database initialized successfully');
print('Created user: swasthvault_user');
print('Created collections: users, medicalrecords');
print('Created indexes for performance optimization');
print('Created default admin user: admin@swasthvault.com (password: admin123)');
print('IMPORTANT: Change default passwords in production!');
