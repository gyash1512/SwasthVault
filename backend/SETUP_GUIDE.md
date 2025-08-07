# SwasthVault Backend Setup Guide

This guide will help you set up all the required environment variables and services for the SwasthVault backend.

## 🚀 Quick Start

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Follow the sections below to configure each service.

## 📋 Environment Variables Setup

### 1. Basic Server Configuration
```env
PORT=5000                    # Port for the server (default: 5000)
NODE_ENV=development         # Environment (development/production)
CORS_ORIGIN=http://localhost:3000  # Frontend URL
```

### 2. Database Setup (MongoDB)

**Option A: Local MongoDB**
1. Install MongoDB Community Edition:
   - Windows: Download from https://www.mongodb.com/try/download/community
   - macOS: `brew install mongodb-community`
   - Linux: Follow official MongoDB installation guide

2. Start MongoDB service:
   ```bash
   # Windows (as service)
   net start MongoDB
   
   # macOS/Linux
   brew services start mongodb-community
   # or
   sudo systemctl start mongod
   ```

3. Set environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/swasthvault
   MONGODB_TEST_URI=mongodb://localhost:27017/swasthvault_test
   ```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/atlas
2. Create a new cluster (free tier available)
3. Get connection string from "Connect" → "Connect your application"
4. Replace `<password>` with your database user password
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swasthvault
   ```

### 3. Redis Setup (Session Management)

**Option A: Local Redis**
1. Install Redis:
   - Windows: Download from https://redis.io/download or use WSL
   - macOS: `brew install redis`
   - Linux: `sudo apt-get install redis-server`

2. Start Redis:
   ```bash
   # Windows/macOS/Linux
   redis-server
   ```

3. Set environment variables:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   ```

**Option B: Redis Cloud**
1. Create account at https://redis.com/try-free/
2. Create a new database
3. Get connection details from dashboard
   ```env
   REDIS_HOST=your-redis-host.com
   REDIS_PORT=12345
   REDIS_PASSWORD=your-redis-password
   ```

### 4. Security Keys Generation

**JWT Secrets** (Generate strong random strings):
```bash
# Generate JWT secrets using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```env
JWT_SECRET=generated_64_character_hex_string
JWT_REFRESH_SECRET=another_generated_64_character_hex_string
SESSION_SECRET=another_generated_string
```

**Encryption Keys**:
```bash
# Generate 32-byte encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate 16-byte IV
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

```env
ENCRYPTION_KEY=generated_32_byte_hex_string
ENCRYPTION_IV=generated_16_byte_hex_string
```

### 5. Email Configuration (Gmail Example)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

**Alternative Email Providers:**
- **SendGrid**: Get API key from https://sendgrid.com/
- **Mailgun**: Get API key from https://www.mailgun.com/
- **AWS SES**: Configure through AWS console

### 6. File Upload Configuration

```env
MAX_FILE_SIZE=10485760        # 10MB in bytes
UPLOAD_PATH=./uploads         # Local upload directory
```

Create the uploads directory:
```bash
mkdir uploads
mkdir uploads/medical-reports
mkdir uploads/prescriptions
mkdir uploads/lab-results
```

### 7. Security Configuration

```env
BCRYPT_ROUNDS=12             # Password hashing rounds (10-12 recommended)
RATE_LIMIT_WINDOW=15         # Rate limiting window in minutes
RATE_LIMIT_MAX=100           # Max requests per window
```

### 8. Aadhaar Integration (Development)

For development, we'll use mock services:
```env
AADHAAR_API_URL=https://api.aadhaar.gov.in
AADHAAR_API_KEY=mock_key_for_development
```

**For Production:**
1. Register with UIDAI (Unique Identification Authority of India)
2. Get API credentials for Aadhaar verification
3. Follow UIDAI guidelines for integration

### 9. Blockchain Configuration (Optional for MVP)

For development, you can use test networks:
```env
BLOCKCHAIN_NETWORK=ethereum
BLOCKCHAIN_PRIVATE_KEY=your_test_private_key
BLOCKCHAIN_CONTRACT_ADDRESS=deployed_contract_address
```

**Setup Steps:**
1. Install MetaMask or similar wallet
2. Get test ETH from faucets (Sepolia, Goerli)
3. Deploy smart contract for audit trails
4. Use private key from test wallet

### 10. Biometric Service (Mock for Development)

```env
BIOMETRIC_API_URL=https://api.biometric-service.com
BIOMETRIC_API_KEY=mock_biometric_key
```

**For Production:**
- Integrate with services like:
  - Mantra Softech (Indian biometric solutions)
  - Morpho (Safran Identity & Security)
  - HID Global

### 11. Emergency Access Configuration

```env
EMERGENCY_ACCESS_TIMEOUT=300  # 5 minutes in seconds
EMERGENCY_QR_EXPIRY=3600     # 1 hour in seconds
```

### 12. Logging Configuration

```env
LOG_LEVEL=info               # debug, info, warn, error
LOG_FILE=./logs/app.log
```

Create logs directory:
```bash
mkdir logs
```

### 13. Two-Factor Authentication

```env
TOTP_SERVICE_NAME=SwasthVault
TOTP_ISSUER=SwasthVault Healthcare System
```

## 🔧 Development Environment Setup

### Complete .env file for development:
```env
# Copy this to your .env file and update the generated keys
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/swasthvault
MONGODB_TEST_URI=mongodb://localhost:27017/swasthvault_test

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=your_generated_jwt_secret_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_generated_refresh_secret_here
JWT_REFRESH_EXPIRE=30d

ENCRYPTION_KEY=your_generated_32_byte_encryption_key
ENCRYPTION_IV=your_generated_16_byte_iv

SESSION_SECRET=your_generated_session_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

AADHAAR_API_URL=https://api.aadhaar.gov.in
AADHAAR_API_KEY=mock_key_for_development

BLOCKCHAIN_NETWORK=ethereum
BLOCKCHAIN_PRIVATE_KEY=mock_private_key
BLOCKCHAIN_CONTRACT_ADDRESS=mock_contract_address

BIOMETRIC_API_URL=https://api.biometric-service.com
BIOMETRIC_API_KEY=mock_biometric_key

EMERGENCY_ACCESS_TIMEOUT=300
EMERGENCY_QR_EXPIRY=3600

LOG_LEVEL=info
LOG_FILE=./logs/app.log

CORS_ORIGIN=http://localhost:3000

TOTP_SERVICE_NAME=SwasthVault
TOTP_ISSUER=SwasthVault Healthcare System
```

## 🧪 Testing the Setup

After setting up your .env file, test the configuration:

```bash
# Install dependencies
npm install

# Test database connection
npm run test:db

# Start development server
npm run dev
```

## 🔒 Production Considerations

1. **Use strong, unique secrets** for all keys
2. **Enable SSL/TLS** for all external communications
3. **Use managed services** (MongoDB Atlas, Redis Cloud) for reliability
4. **Implement proper backup strategies**
5. **Monitor and log all activities**
6. **Regular security audits**
7. **Compliance with healthcare regulations** (HIPAA, Indian data protection laws)

## 🆘 Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string format
   - Verify network connectivity

2. **Redis Connection Failed**
   - Ensure Redis server is running
   - Check host and port configuration
   - Verify authentication if required

3. **Email Not Sending**
   - Verify SMTP credentials
   - Check app password generation
   - Ensure 2FA is enabled for Gmail

4. **File Upload Issues**
   - Check upload directory permissions
   - Verify MAX_FILE_SIZE setting
   - Ensure disk space availability

For more help, check the logs in `./logs/app.log` or contact the development team.
