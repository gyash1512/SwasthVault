# SwasthVault 🏥
**Centralized Medical History Management System**

A critical project that can transform public health infrastructure by providing unified, secure, and interoperable medical records for every citizen.

## 🔑 Core Objectives

- **Unified Health Record**: Maintain every citizen's complete medical history—from allergies, prescriptions, diagnostics, surgeries to mental health
- **Interoperability**: Allow any verified doctor/hospital across the country to access and update patient records
- **Continuity of Care**: Enable seamless transfer of patient data between healthcare providers
- **Authentication & Authorization**: Only patients and authorized professionals can access/update records
- **Tamper-proof History**: Every update is timestamped and logged; past records cannot be deleted—only added with justification
- **Emergency Access**: Paramedics/doctors can access critical medical info instantly with biometric or QR verification

## 🧩 Key Features

### Patient Management
- **Aadhaar/UID Integration**: Link each record with verified national ID
- **Health Timeline View**: Scrollable timeline of patient's entire medical journey
- **Emergency Profile**: Quick access to critical info (blood group, allergies, chronic conditions)

### Healthcare Provider Features
- **Doctor Verification System**: Digital signatures for all medical updates
- **Appointment & Referral History**: Complete chain of consultations and diagnoses
- **Prescription & Medication Logs**: Track medications, dosage, and effects
- **Lab Reports & Scans**: DICOM/PDF uploads with annotations
- **Vaccination Records**: Including COVID-19 and other immunization data

### Security & Access
- **Offline Access Mode**: Limited data via encrypted QR code
- **Audit Logs**: Full traceability of data access and modifications
- **Consent-Based Access**: Third-party access (insurance, research) with patient consent

## 🛡️ Privacy & Security

- **End-to-End Encryption**: All data encrypted in transit and at rest
- **Two-Factor Authentication**: Required for all healthcare providers
- **Biometric Authentication**: For emergency access scenarios
- **HIPAA + Indian Health Data Protection Compliant**
- **Role-Based Access Control**: Different permission levels for different user types

## 🏗️ System Architecture

### Backend (Node.js + Express)
- RESTful API with JWT authentication
- MongoDB for flexible medical data storage
- Redis for session management and caching
- Blockchain integration for tamper-proof audit trails

### Frontend (React.js)
- Responsive web application
- Progressive Web App (PWA) capabilities
- Real-time updates with WebSocket
- Offline-first architecture

### Security Layer
- OAuth 2.0 + OpenID Connect
- AES-256 encryption
- Digital signatures with PKI
- Biometric integration APIs

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- Redis (v6.0 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gyash1512/SwasthVault.git
cd SwasthVault
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
```bash
# Copy example environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

5. Start the development servers:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## 📱 User Roles

### 1. Patients
- View complete medical history
- Grant/revoke access permissions
- Download medical reports
- Emergency QR code generation

### 2. Healthcare Providers
- Access authorized patient records
- Add medical entries (diagnoses, prescriptions, reports)
- Digital prescription generation
- Referral management

### 3. Emergency Personnel
- Limited access to critical patient info
- Biometric-based emergency access
- Real-time patient status updates

### 4. System Administrators
- User management and verification
- System monitoring and maintenance
- Audit trail management
- Compliance reporting

## 🔐 Data Security Measures

1. **Encryption**: AES-256 for data at rest, TLS 1.3 for data in transit
2. **Access Control**: Multi-factor authentication and role-based permissions
3. **Audit Trail**: Immutable blockchain-based logging
4. **Data Integrity**: Digital signatures and hash verification
5. **Privacy**: Zero-knowledge architecture where possible

## 📊 Compliance

- **HIPAA** (Health Insurance Portability and Accountability Act)
- **Indian Personal Data Protection Bill**
- **ISO 27001** Information Security Management
- **HL7 FHIR** Healthcare data interoperability standards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@swasthvault.gov.in or join our Slack channel.

## 🗺️ Roadmap

- [ ] Phase 1: Core patient record management
- [ ] Phase 2: Healthcare provider integration
- [ ] Phase 3: Emergency access system
- [ ] Phase 4: AI-powered health insights
- [ ] Phase 5: Nationwide deployment

---

**SwasthVault** - Transforming Healthcare Through Technology 🚀
