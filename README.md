# SwasthVault - Centralized Medical History Management System

🏥 **A comprehensive, secure, and scalable medical history management system with version control, audit trails, and emergency access capabilities.**

## 🌟 Overview

SwasthVault is a cutting-edge healthcare platform that revolutionizes how medical records are stored, accessed, and managed. Built with modern technologies and security best practices, it provides a unified solution for patients, doctors, and healthcare institutions.

## 🔑 Key Features

### 🔄 **Version Control System**
- **Complete Medical History Tracking**: Every change to a medical record is versioned
- **Audit Trails**: Full traceability of who accessed or modified data and when
- **Digital Signatures**: Cryptographic verification of doctor authenticity
- **Tamper-Proof Records**: Blockchain-ready hash verification

### 🏥 **Comprehensive Medical Records**
- **Patient Timeline**: Chronological view of all medical interactions
- **Multi-Doctor Collaboration**: Seamless sharing between healthcare providers
- **Lab Results Integration**: Complete diagnostic data with trend analysis
- **Medication Tracking**: Current and historical prescription management
- **Allergy & Alert Management**: Critical safety information always accessible

### 🚨 **Emergency Access System**
- **QR Code Emergency Access**: Instant critical info for first responders
- **Blood Group & Allergies**: Life-saving information at a glance
- **Current Medications**: Prevent dangerous drug interactions
- **Emergency Contacts**: Immediate family notification capability

### 🔐 **Security & Privacy**
- **Multi-Level Access Control**: Role-based permissions (Patient, Doctor, Emergency, Admin)
- **End-to-End Encryption**: All sensitive data encrypted at rest and in transit
- **Aadhaar Integration**: Verified identity management
- **HIPAA Compliant**: Meets international healthcare data protection standards

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SWASTHVAULT ECOSYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React)     │  Backend (Node.js)    │  Database       │
│  ┌─────────────────┐  │  ┌─────────────────┐   │  ┌───────────┐  │
│  │ Patient Portal  │  │  │ Authentication  │   │  │ MongoDB   │  │
│  │ Doctor Portal   │  │  │ Medical Records │   │  │ Users     │  │
│  │ Emergency Access│  │  │ Version Control │   │  │ Records   │  │
│  │ Admin Dashboard │  │  │ Audit Trails    │   │  │ Audit     │  │
│  └─────────────────┘  │  └─────────────────┘   │  └───────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- MongoDB (handled by Docker)
- Redis (handled by Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/gyash1512/SwasthVault.git
cd SwasthVault
```

### 2. Start All Services
```bash
# Start all services (MongoDB, Redis, Backend, Frontend)
sudo docker compose up --build -d

# Check status
sudo docker compose ps
```

### 3. Setup Demo Data (Optional)
```bash
# Create comprehensive demo data with sample patients and medical records
sudo docker exec -it swasthvault-backend npm run setup-demo
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

## 👥 Demo Users & Login Credentials

After running the demo setup, you can login with:

### 🔐 **Admin Access**
```
Email: admin@demo.com
Password: admin123
Role: System Administrator
```

### 👨‍⚕️ **Doctor Access**
```
Email: dr.smith@demo.com
Password: doctor123
Role: Cardiologist
Specialization: Cardiology
```

### 👤 **Patient Access**
```
Email: john.doe@demo.com
Password: patient123
Role: Patient
Medical History: Hypertension, complete timeline with version control
```

## 📋 Demo Data Features

The demo includes:

### **John Doe's Medical Journey** (Version Control Example)
```
📅 2024-01-15: Initial Consultation (v1.0)
   ├── Chief Complaint: Chest pain
   ├── Diagnosis: Hypertension
   ├── Medication: Lisinopril 10mg
   └── Digital Signature: Dr. Smith

📅 2024-01-29: Follow-up Visit (v1.1)
   ├── BP Improvement: 145/95 → 135/88
   ├── Medication Adjustment: Increased to 20mg
   └── Version Control: Previous version stored

📅 2024-02-05: Lab Results Added (v1.2)
   ├── Lipid Panel: Abnormal cholesterol
   ├── New Medication: Atorvastatin 20mg
   └── Audit Trail: All changes logged

📅 2024-02-20: Specialist Referral
   ├── Cardiology Consultation
   ├── ECG: Normal results
   └── Multi-doctor collaboration
```

## 🛠️ API Endpoints

### **Enhanced Medical Records API**
```
GET    /api/medical-records-enhanced/patient/:id/timeline
POST   /api/medical-records-enhanced/create
PUT    /api/medical-records-enhanced/:id/update
GET    /api/medical-records-enhanced/:id/versions
GET    /api/medical-records-enhanced/:id/versions/:versionNumber
POST   /api/medical-records-enhanced/:id/share
GET    /api/medical-records-enhanced/emergency/:qrCode
```

### **Authentication API**
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
POST   /api/auth/setup-2fa
POST   /api/auth/verify-2fa
```

### **User Management API**
```
GET    /api/patients/profile
GET    /api/patients/medical-records
GET    /api/doctors/patients
PUT    /api/patients/profile
```

## 🔄 Version Control Workflow

### **How Medical Records Are Versioned**

1. **Initial Record Creation** (v1.0)
   - Doctor creates new medical record
   - Digital signature applied
   - Audit trail entry created

2. **Record Updates** (v1.1, v1.2, etc.)
   - Previous version stored in `previousVersions` array
   - New version number incremented
   - Change reason documented
   - New digital signature applied

3. **Version History Access**
   - View all versions of a record
   - Compare changes between versions
   - Track who made what changes when

### **Example Version Control API Usage**

```bash
# Get patient's medical timeline
curl -X GET "http://localhost:8080/api/medical-records-enhanced/patient/PATIENT_ID/timeline" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get version history of a record
curl -X GET "http://localhost:8080/api/medical-records-enhanced/RECORD_ID/versions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get specific version
curl -X GET "http://localhost:8080/api/medical-records-enhanced/RECORD_ID/versions/2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚨 Emergency Access System

### **QR Code Emergency Access**

1. **Patient generates QR code** containing encrypted patient ID
2. **Emergency personnel scan QR code** to get instant access to:
   - Blood group
   - Critical allergies
   - Current medications
   - Chronic conditions
   - Emergency contacts

3. **Access is logged** for audit purposes

### **Emergency Access API**
```bash
# Emergency access via QR code (no authentication required)
curl -X GET "http://localhost:8080/api/medical-records-enhanced/emergency/BASE64_QR_CODE"
```

## 🔐 Security Features

### **Multi-Level Access Control**
- **Patient**: Can view own records, share with doctors
- **Doctor**: Can view assigned patients, create/update records
- **Emergency Personnel**: Limited access to critical info only
- **Admin**: System management, user administration

### **Audit Trail System**
Every action is logged with:
- **Who**: User ID and role
- **What**: Action performed (created, updated, viewed, shared)
- **When**: Timestamp
- **Where**: IP address
- **Why**: Purpose/reason for access

### **Digital Signatures**
- **Doctor Verification**: Cryptographic signature for each record
- **Tamper Detection**: Hash verification to detect unauthorized changes
- **Legal Compliance**: Non-repudiation for legal purposes

## 🏥 Use Cases

### **For Patients**
- ✅ Complete medical history in one place
- ✅ Easy sharing with new doctors
- ✅ Emergency access capability
- ✅ Medication tracking and reminders
- ✅ Privacy control over who accesses records

### **For Doctors**
- ✅ Comprehensive patient view across all visits
- ✅ Version-controlled records with full history
- ✅ Collaboration with specialists and other doctors
- ✅ Legal compliance with digital signatures
- ✅ Audit trails for accountability

### **For Healthcare Institutions**
- ✅ Reduced duplicate tests and procedures
- ✅ Better care coordination between departments
- ✅ Data-driven insights for population health
- ✅ Cost reduction through efficiency
- ✅ Improved patient outcomes

## 🛠️ Development

### **Local Development Setup**

```bash
# Backend development
cd backend
npm install
npm run dev

# Frontend development
cd frontend
npm install
npm start

# Database setup (with Docker)
sudo docker compose up mongodb redis -d
```

### **Environment Variables**

Create `backend/.env` with:
```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://testcheck:Check_123@mongodb:27017/swasthvault?authSource=swasthvault
REDIS_HOST=redis
REDIS_PASSWORD=Check_123
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

### **Database Management**

```bash
# Create demo data
npm run setup-demo

# Connect to MongoDB
sudo docker exec -it swasthvault-mongodb mongosh -u testcheck -p Check_123 --authenticationDatabase swasthvault

# View all users
use swasthvault
db.users.find({}, {email: 1, role: 1, firstName: 1, lastName: 1})

# View medical records
db.medicalrecords.find({}, {patient: 1, doctor: 1, visitDate: 1, version: 1})
```

## 📊 System Benefits

### **Clinical Benefits**
- **Continuity of Care**: Complete patient history available to all authorized providers
- **Reduced Medical Errors**: Access to allergies, medications, and medical alerts
- **Faster Diagnosis**: Historical data and trends readily available
- **Better Outcomes**: Coordinated care across multiple providers

### **Operational Benefits**
- **Reduced Paperwork**: Digital records eliminate manual processes
- **Cost Savings**: Reduced duplicate tests and administrative overhead
- **Compliance**: Built-in audit trails and security measures
- **Scalability**: Cloud-ready architecture for growing healthcare systems

### **Patient Benefits**
- **Portability**: Medical records follow the patient anywhere
- **Transparency**: Full visibility into medical history and treatments
- **Emergency Preparedness**: Critical information available in emergencies
- **Privacy Control**: Granular control over who accesses medical data

## 🔮 Future Enhancements

### **Planned Features**
- 🤖 **AI-Powered Insights**: Drug interaction detection, trend analysis
- 📱 **Mobile App**: Native iOS/Android applications
- 🔗 **Blockchain Integration**: Immutable record storage
- 🌐 **Interoperability**: HL7 FHIR compliance for system integration
- 📊 **Analytics Dashboard**: Population health insights
- 🗣️ **Voice Integration**: Voice-to-text for clinical notes

## 📞 Support & Documentation

### **Getting Help**
- 📖 **Documentation**: See `MEDICAL_SYSTEM_ARCHITECTURE.md` for detailed technical specs
- 🐛 **Issues**: Report bugs via GitHub Issues
- 💬 **Discussions**: Join our community discussions
- 📧 **Contact**: healthcare@swasthvault.com

### **Contributing**
We welcome contributions! Please see our contributing guidelines and code of conduct.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Healthcare professionals who provided domain expertise
- Open source community for excellent libraries and tools
- Security researchers for vulnerability assessments
- Beta testers for valuable feedback

---

**SwasthVault** - Transforming Healthcare Through Technology 🏥✨

*Built with ❤️ for better healthcare outcomes*
