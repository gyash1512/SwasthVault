# SwasthVault - Centralized Medical History Management System

A comprehensive healthcare management platform that enables secure storage, management, and sharing of medical records with role-based access control, emergency features, and complete audit trails.

## 🏥 Features

- **Unified Health Records**: Complete medical history management
- **Role-Based Access**: Patient, Doctor, Emergency Personnel, Admin roles
- **Emergency Access**: Quick access to critical medical information
- **Secure Authentication**: JWT-based auth with 2FA support
- **File Management**: Upload and manage medical documents
- **Audit Logging**: Complete traceability of all actions
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Live notifications and updates

## 🚀 Quick Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Docker Desktop**
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/gyash1512/SwasthVault.git
cd SwasthVault
```

### 2. Generate Security Keys

Generate secure keys for your environment files:

```bash
# Generate JWT secrets (64-character hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key (32-character hex)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Generate IV (16-character hex)
node -e "console.log(require('crypto').randomBytes(8).toString('hex'))"
```

### 3. Configure Backend Environment

Edit `backend/.env` and add your generated keys:

```env
# JWT Configuration (Use generated 64-character hex)
JWT_SECRET=your_generated_jwt_secret
JWT_REFRESH_SECRET=your_generated_refresh_secret

# Encryption Configuration
ENCRYPTION_KEY=your_generated_32_char_key
ENCRYPTION_IV=your_generated_16_char_iv

# Session Configuration
SESSION_SECRET=your_generated_session_secret

# Email Configuration (Create account at https://ethereal.email/)
SMTP_USER=your_ethereal_username
SMTP_PASS=your_ethereal_password

# External API Keys (Optional)
AADHAAR_API_KEY=your_aadhaar_api_key
BIOMETRIC_API_KEY=your_biometric_api_key
SMS_API_KEY=your_sms_api_key
```

### 4. Configure Frontend Environment

The `frontend/.env` file is ready to use. Optionally add:

```env
# External Services (Optional)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_ANALYTICS_ID=your_analytics_id
```

### 5. Start Services

#### Option A: Full Docker Setup (Recommended)

```bash
# Start all services with Docker
docker compose up --build -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

#### Option B: Development Setup

```bash
# Start databases only
docker compose up mongodb redis -d

# Start backend (new terminal)
cd backend
npm install
npm run dev

# Start frontend (new terminal)
cd frontend
npm install
npm start
```

### 6. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Default Login**: admin@swasthvault.com / admin123

## 🐳 Docker Services

The application runs 4 separate containers:

1. **MongoDB** (Port 27017) - Database with initialization
2. **Redis** (Port 6379) - Caching and sessions
3. **Backend** (Port 5000) - Node.js API server
4. **Frontend** (Port 3000) - React app with Nginx

## 📁 Project Structure

```
SwasthVault/
├── backend/                 # Node.js API server
│   ├── .env                # Backend environment variables
│   ├── server.js           # Main server file
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── utils/              # Utility functions
├── frontend/               # React frontend
│   ├── .env                # Frontend environment variables
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   └── package.json        # Dependencies
├── deployment/             # Docker configurations
│   ├── mongodb/            # MongoDB initialization
│   └── redis/              # Redis configuration
├── docker-compose.yml      # Docker services definition
└── README.md              # This file
```

## 🔧 Development Commands

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

### Docker Management

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f [service-name]

# Restart specific service
docker compose restart [service-name]

# Rebuild and restart
docker compose up --build -d
```

## 🗄️ Database Management

### MongoDB

```bash
# Connect to MongoDB
docker exec -it swasthvault-mongodb mongosh -u admin -p swasthvault_admin_password

# In MongoDB shell:
use swasthvault
show collections
db.users.findOne()
```

### Redis

```bash
# Connect to Redis
docker exec -it swasthvault-redis redis-cli -a swasthvault_redis_password

# Test connection
ping
# Should return: PONG
```

### Backup Database

```bash
# Backup MongoDB
docker exec swasthvault-mongodb mongodump \
  --uri="mongodb://swasthvault_user:swasthvault_user_password@localhost:27017/swasthvault?authSource=swasthvault" \
  --out=/backup

# Copy backup from container
docker cp swasthvault-mongodb:/backup ./backup
```

## 🔒 Security Configuration

### Environment Variables

**Backend (.env)** - Required variables:
- `JWT_SECRET` - 64-character hex string for JWT signing
- `JWT_REFRESH_SECRET` - 64-character hex string for refresh tokens
- `ENCRYPTION_KEY` - 32-character hex string for data encryption
- `ENCRYPTION_IV` - 16-character hex string for encryption IV
- `SESSION_SECRET` - 64-character hex string for sessions

**Frontend (.env)** - Optional variables:
- `REACT_APP_GOOGLE_MAPS_API_KEY` - For location services
- `REACT_APP_ANALYTICS_ID` - For analytics tracking

### Email Setup

For development, use Ethereal Email:
1. Go to https://ethereal.email/
2. Click "Create Ethereal Account"
3. Copy credentials to `backend/.env`
4. All emails will be captured and viewable online

### Default Credentials

- **Admin**: admin@swasthvault.com / admin123
- **MongoDB Admin**: admin / swasthvault_admin_password
- **Redis**: swasthvault_redis_password

**⚠️ Change all default passwords in production!**

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test                    # Unit tests
npm run test:integration    # Integration tests
npm run test:coverage       # Coverage report
```

### Frontend Testing

```bash
cd frontend
npm test                    # Interactive test runner
npm run test:coverage       # Coverage report
```

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Frontend health
curl http://localhost:3000

# Database health
docker exec swasthvault-mongodb mongosh --eval "db.adminCommand('ping')"
docker exec swasthvault-redis redis-cli -a swasthvault_redis_password ping
```

### Logs

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs backend
docker compose logs frontend
docker compose logs mongodb
docker compose logs redis

# Follow logs in real-time
docker compose logs -f backend
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5000
   
   # Kill processes if needed
   kill -9 <PID>
   ```

2. **Database connection issues**:
   ```bash
   # Restart database containers
   docker compose restart mongodb redis
   
   # Check container logs
   docker compose logs mongodb
   docker compose logs redis
   ```

3. **Node modules issues**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Docker issues**:
   ```bash
   # Clean Docker system
   docker system prune -a
   
   # Rebuild containers
   docker compose up --build -d
   ```

### Debug Mode

```bash
# Run with debug logs
docker compose logs -f

# Access container shell
docker exec -it swasthvault-backend sh
docker exec -it swasthvault-frontend sh
```

## 🚀 Production Deployment

### Environment Setup

1. **Generate secure keys** for production
2. **Configure SSL/TLS** certificates
3. **Set up reverse proxy** (nginx/traefik)
4. **Configure monitoring** and logging
5. **Set up backup schedules**

### Security Checklist

- [ ] Change all default passwords
- [ ] Generate secure environment variables
- [ ] Configure SSL/TLS
- [ ] Set up firewall rules
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts

## 📚 API Documentation

When the backend is running, visit http://localhost:5000/api-docs for interactive API documentation.

### Key API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/patients` - Get patient list
- `POST /api/medical-records` - Create medical record
- `GET /api/emergency/:patientId` - Emergency access
- `POST /api/upload` - File upload

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and support:

1. Check this README for common solutions
2. Check the logs: `docker compose logs`
3. Verify configuration: `docker compose config`
4. Create an issue on GitHub with logs and error messages

---

**SwasthVault** - Transforming healthcare through secure, accessible medical record management.
