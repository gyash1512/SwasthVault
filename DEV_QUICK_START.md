# SwasthVault Development Quick Start

## 🚀 Quick Development Setup (5 minutes)

### Prerequisites
- Node.js 18+ and npm
- Docker Desktop
- Git

### 1. Clone & Setup
```bash
git clone https://github.com/gyash1512/SwasthVault.git
cd SwasthVault
```

### 2. Start Databases Only
```bash
# Start MongoDB and Redis with admin UIs
docker compose -f docker-compose.dev.yml up -d

# Verify databases are running
docker compose -f docker-compose.dev.yml ps
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.development .env

# Start development server
npm run dev
```

### 4. Frontend Setup (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.development .env.local

# Start development server
npm start
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs
- **MongoDB Admin**: http://localhost:8081 (admin/admin123)
- **Redis Admin**: http://localhost:8082
- **Login**: admin@swasthvault.com / admin123

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://swasthvault_user:swasthvault_user_password@localhost:27017/swasthvault?authSource=swasthvault
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=swasthvault_redis_password
JWT_SECRET=dev_jwt_secret_key_minimum_32_characters_long_for_development
ENCRYPTION_KEY=dev_32_character_encryption_key
ENCRYPTION_IV=dev_16_char_iv
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
ENABLE_SWAGGER=true
ENABLE_DEBUG_ROUTES=true
```

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
REACT_APP_DEBUG=true
REACT_APP_ENABLE_DEV_TOOLS=true
REACT_APP_BACKEND_URL=http://localhost:5000
GENERATE_SOURCEMAP=true
FAST_REFRESH=true
```

## 🔧 Development Commands

### Backend
```bash
npm run dev          # Start with hot reload
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

### Frontend
```bash
npm start            # Start development server
npm test             # Run tests
npm run build        # Build for production
npm run lint         # Lint code
```

### Database Management
```bash
# Start only databases
docker compose -f docker-compose.dev.yml up mongodb redis -d

# Stop databases
docker compose -f docker-compose.dev.yml down

# View database logs
docker compose -f docker-compose.dev.yml logs mongodb
docker compose -f docker-compose.dev.yml logs redis

# Connect to MongoDB
docker exec -it swasthvault-mongodb-dev mongosh -u admin -p swasthvault_admin_password

# Connect to Redis
docker exec -it swasthvault-redis-dev redis-cli -a swasthvault_redis_password
```

## 🛠️ Development Tools

### Database Admin UIs
- **MongoDB Express**: http://localhost:8081
  - Username: admin
  - Password: admin123
- **Redis Commander**: http://localhost:8082

### API Testing
- **Swagger UI**: http://localhost:5000/api-docs
- **Thunder Client** (VS Code extension)
- **Postman** (external tool)

### Email Testing
- **Ethereal Email**: https://ethereal.email/
  - Create account and use credentials in backend .env
  - All emails captured and viewable online

## 🔄 Development Workflow

### Daily Routine
1. Start databases: `docker compose -f docker-compose.dev.yml up -d`
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm start`
4. Code, test, commit, repeat

### Making Changes
1. Backend changes auto-reload with nodemon
2. Frontend changes auto-reload with React Fast Refresh
3. Database changes persist in Docker volumes
4. Environment changes require restart

## 🐛 Common Issues

### Port Conflicts
```bash
# Check ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Kill processes
kill -9 <PID>
```

### Database Connection
```bash
# Restart databases
docker compose -f docker-compose.dev.yml restart

# Check logs
docker compose -f docker-compose.dev.yml logs
```

### Node Modules
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

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
curl http://localhost:5000/health    # Backend health
curl http://localhost:3000           # Frontend health
```

### Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Database logs
docker compose -f docker-compose.dev.yml logs -f mongodb redis
```

## 🔒 Security Notes

- Development uses relaxed security settings
- Default passwords are for development only
- Never commit real API keys or secrets
- Use environment-specific configurations

## 📚 Documentation

- **Full Setup**: [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md)
- **Production**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **API Docs**: http://localhost:5000/api-docs (when running)

---

**Happy Coding!** 🎉 Your development environment is ready!
