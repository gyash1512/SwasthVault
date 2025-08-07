# SwasthVault Development Setup Guide

This guide provides step-by-step instructions for setting up SwasthVault for local development.

## 📋 Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **Docker Desktop**: For running databases
- **Git**: For version control
- **Code Editor**: VS Code recommended

## 🚀 Development Setup Steps

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/gyash1512/SwasthVault.git
cd SwasthVault
```

### Step 2: Start Database Services

```bash
# Start only MongoDB and Redis using Docker
docker compose up mongodb redis -d

# Verify databases are running
docker compose ps
```

### Step 3: Backend Development Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

#### Backend Environment Variables (.env)

Create/edit `backend/.env` with these values:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://swasthvault_user:swasthvault_user_password@localhost:27017/swasthvault?authSource=swasthvault

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=swasthvault_redis_password

# JWT Configuration
JWT_SECRET=dev_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=dev_refresh_secret_key_minimum_32_characters_long
JWT_REFRESH_EXPIRE=30d

# Encryption Configuration
ENCRYPTION_KEY=dev_32_character_encryption_key
ENCRYPTION_IV=dev_16_char_iv

# Session Configuration
SESSION_SECRET=dev_session_secret_minimum_32_characters_long

# Email Configuration (for development - use Ethereal or Mailtrap)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_username
SMTP_PASS=your_ethereal_password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security Configuration
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=1000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging Configuration
LOG_LEVEL=debug
LOG_FILE=./logs/app.log

# Development Features
ENABLE_SWAGGER=true
ENABLE_DEBUG_ROUTES=true
MOCK_EXTERNAL_APIS=true
```

#### Start Backend Development Server

```bash
# From backend directory
npm run dev

# Backend will start on http://localhost:5000
# API documentation available at http://localhost:5000/api-docs
```

### Step 4: Frontend Development Setup

```bash
# Open new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
touch .env.local
```

#### Frontend Environment Variables (.env.local)

Create `frontend/.env.local` with these values:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Environment
REACT_APP_ENV=development

# Debug Configuration
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug

# Feature Flags
REACT_APP_ENABLE_MOCK_DATA=true
REACT_APP_ENABLE_DEV_TOOLS=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=false

# External Services (Development)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_for_dev
REACT_APP_ANALYTICS_ID=your_analytics_id_for_dev

# Development URLs
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_WEBSOCKET_URL=ws://localhost:5000

# Theme Configuration
REACT_APP_DEFAULT_THEME=light
REACT_APP_ENABLE_DARK_MODE=true

# Development Features
GENERATE_SOURCEMAP=true
FAST_REFRESH=true
```

#### Start Frontend Development Server

```bash
# From frontend directory
npm start

# Frontend will start on http://localhost:3000
# Hot reload enabled for development
```

## 🔧 Development Environment Configuration

### Database Setup for Development

The Docker containers will automatically initialize the databases. You can verify:

```bash
# Connect to MongoDB
docker exec -it swasthvault-mongodb mongosh -u admin -p swasthvault_admin_password

# In MongoDB shell:
use swasthvault
show collections
db.users.findOne()
exit

# Connect to Redis
docker exec -it swasthvault-redis redis-cli -a swasthvault_redis_password
ping
exit
```

### Email Testing Setup

For development, use Ethereal Email (fake SMTP service):

1. Go to https://ethereal.email/
2. Click "Create Ethereal Account"
3. Copy the SMTP credentials to your backend `.env` file
4. All emails will be captured and viewable on Ethereal

### Development Scripts

#### Backend Scripts

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Database operations
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database
npm run db:migrate   # Run migrations
```

#### Frontend Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Analyze bundle size
npm run analyze
```

## 🛠️ Development Tools Setup

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-thunder-client"
  ]
}
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "html"
  }
}
```

### Git Hooks Setup

```bash
# Install husky for git hooks
npm install --save-dev husky

# Setup pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm test"
```

## 🧪 Testing Setup

### Backend Testing

```bash
# Install test dependencies (already included)
cd backend

# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Frontend Testing

```bash
# Install test dependencies (already included)
cd frontend

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

## 🔍 Debugging Setup

### Backend Debugging (VS Code)

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "nodemon",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Frontend Debugging

React DevTools browser extension is recommended for debugging React components.

## 📊 Development Monitoring

### API Testing

Use Thunder Client (VS Code extension) or Postman:

```bash
# Import API collection
# File: docs/api-collection.json (if available)
```

### Database Monitoring

```bash
# MongoDB Compass (GUI tool)
# Connection string: mongodb://admin:swasthvault_admin_password@localhost:27017

# Redis Commander (Web UI)
npm install -g redis-commander
redis-commander --redis-password swasthvault_redis_password
```

## 🔄 Development Workflow

### Daily Development Routine

1. **Start databases**:
   ```bash
   docker compose up mongodb redis -d
   ```

2. **Start backend**:
   ```bash
   cd backend && npm run dev
   ```

3. **Start frontend**:
   ```bash
   cd frontend && npm start
   ```

4. **Access application**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - API Docs: http://localhost:5000/api-docs

### Code Changes Workflow

1. Make changes to code
2. Tests run automatically (if watch mode enabled)
3. Hot reload updates the application
4. Commit changes with proper messages
5. Push to feature branch

## 🐛 Common Development Issues

### Port Conflicts

```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Kill processes if needed
kill -9 <PID>
```

### Database Connection Issues

```bash
# Restart database containers
docker compose restart mongodb redis

# Check container logs
docker compose logs mongodb
docker compose logs redis
```

### Node Modules Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend Build Issues

```bash
# Clear React cache
rm -rf node_modules/.cache

# Restart development server
npm start
```

## 📝 Development Best Practices

### Code Style

- Use Prettier for formatting
- Follow ESLint rules
- Use meaningful variable names
- Write comments for complex logic
- Keep functions small and focused

### Git Workflow

- Create feature branches from main
- Use conventional commit messages
- Write descriptive commit messages
- Test before committing
- Keep commits atomic

### Testing

- Write tests for new features
- Maintain test coverage above 80%
- Test edge cases
- Use meaningful test descriptions

## 🎯 Next Steps

After setup:

1. **Explore the codebase**
2. **Run existing tests**
3. **Make a small change to verify setup**
4. **Set up your preferred development tools**
5. **Read the API documentation**
6. **Start developing new features**

---

**Happy Coding!** 🚀 Your SwasthVault development environment is ready!
