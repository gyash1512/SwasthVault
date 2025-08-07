# SwasthVault Complete Setup Instructions

This guide provides step-by-step instructions to set up SwasthVault from scratch using Docker.

## 📋 Prerequisites

Before starting, ensure you have:

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: At least 10GB free space
- **Internet**: Stable internet connection for downloading Docker images

### Required Software

#### 1. Install Docker Desktop

**For Windows:**
```bash
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
# Run the installer and follow the setup wizard
# Restart your computer when prompted
```

**For macOS:**
```bash
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
# Drag Docker.app to Applications folder
# Launch Docker Desktop from Applications
```

**For Linux (Ubuntu/Debian):**
```bash
# Update package index
sudo apt update

# Install required packages
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Restart to apply group changes
sudo reboot
```

#### 2. Verify Docker Installation

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker compose version

# Test Docker installation
docker run hello-world
```

#### 3. Install Git (if not already installed)

**Windows:**
- Download from https://git-scm.com/download/win
- Run installer with default settings

**macOS:**
```bash
# Install using Homebrew
brew install git

# Or download from https://git-scm.com/download/mac
```

**Linux:**
```bash
sudo apt install git
```

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
# Open terminal/command prompt
# Navigate to your desired directory
cd /path/to/your/projects

# Clone the repository
git clone https://github.com/gyash1512/SwasthVault.git

# Navigate to project directory
cd SwasthVault
```

### Step 2: Configure Environment Variables

```bash
# Copy the production environment template
cp .env.production .env

# Open the .env file in your preferred editor
# Windows:
notepad .env

# macOS:
open -e .env

# Linux:
nano .env
```

**Edit the .env file with secure values:**

```env
# JWT Configuration (Generate secure 32+ character strings)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_REFRESH_SECRET=your_super_secret_refresh_key_minimum_32_characters_long

# Encryption Keys (MUST be exactly these lengths)
ENCRYPTION_KEY=your_32_character_encryption_key  # Exactly 32 characters
ENCRYPTION_IV=your_16_char_iv                    # Exactly 16 characters

# Session Secret (32+ characters)
SESSION_SECRET=your_session_secret_minimum_32_characters_long

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**To generate secure keys:**

```bash
# Generate JWT secrets (32+ characters)
openssl rand -base64 32

# Generate encryption key (32 characters exactly)
openssl rand -hex 16

# Generate IV (16 characters exactly)
openssl rand -hex 8
```

### Step 3: Build and Start All Services

```bash
# Make sure you're in the SwasthVault directory
cd SwasthVault

# Build and start all services in detached mode
docker compose up --build -d

# This will:
# 1. Build the backend Docker image
# 2. Build the frontend Docker image
# 3. Download MongoDB 7.0 image
# 4. Download Redis 7.2 image
# 5. Create a custom network
# 6. Start all containers
```

### Step 4: Verify Services are Running

```bash
# Check status of all services
docker compose ps

# You should see 4 services running:
# - swasthvault-mongodb
# - swasthvault-redis  
# - swasthvault-backend
# - swasthvault-frontend

# Check logs if any service is not running
docker compose logs [service-name]
```

### Step 5: Access the Application

Open your web browser and navigate to:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

### Step 6: Login with Default Admin Account

Use these credentials for initial login:
- **Email**: admin@swasthvault.com
- **Password**: admin123

**⚠️ IMPORTANT**: Change this password immediately after first login!

## 🔧 Detailed Service Setup

### MongoDB Setup Verification

```bash
# Connect to MongoDB container
docker exec -it swasthvault-mongodb mongosh -u admin -p swasthvault_admin_password

# In MongoDB shell, verify database:
use swasthvault
show collections
db.users.findOne()

# Exit MongoDB shell
exit
```

### Redis Setup Verification

```bash
# Connect to Redis container
docker exec -it swasthvault-redis redis-cli -a swasthvault_redis_password

# Test Redis connection
ping
# Should return: PONG

# Exit Redis CLI
exit
```

### Backend API Verification

```bash
# Check backend health
curl http://localhost:5000/health

# Should return:
# {"status":"OK","timestamp":"...","uptime":...}

# Check backend logs
docker compose logs backend
```

### Frontend Verification

```bash
# Check frontend health
curl http://localhost:3000/health

# Should return: healthy

# Check frontend logs
docker compose logs frontend
```

## 🛠️ Development Setup (Alternative)

If you want to run services individually for development:

### Step 1: Start Database Services Only

```bash
# Start only MongoDB and Redis
docker compose up mongodb redis -d
```

### Step 2: Run Backend Locally

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with local database URLs:
# MONGODB_URI=mongodb://swasthvault_user:swasthvault_user_password@localhost:27017/swasthvault?authSource=swasthvault
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=swasthvault_redis_password

# Start backend in development mode
npm run dev
```

### Step 3: Run Frontend Locally

```bash
# Open new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend in development mode
npm start
```

## 🔒 Security Configuration

### Step 1: Change Default Passwords

```bash
# Generate new secure passwords
openssl rand -base64 32  # For JWT secrets
openssl rand -hex 16     # For encryption keys
openssl rand -base64 24  # For database passwords
```

### Step 2: Update Database Passwords

```bash
# Connect to MongoDB
docker exec -it swasthvault-mongodb mongosh -u admin -p swasthvault_admin_password

# Change application user password
use swasthvault
db.changeUserPassword("swasthvault_user", "your_new_secure_password")

# Update admin user password
db.users.updateOne(
  {email: "admin@swasthvault.com"}, 
  {$set: {password: "$2b$12$NEW_HASHED_PASSWORD"}}
)
```

### Step 3: Update Environment Variables

Update your `.env` file with the new passwords and restart services:

```bash
docker compose down
docker compose up -d
```

## 📊 Monitoring and Logs

### View All Logs

```bash
# View logs from all services
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View logs from specific service
docker compose logs backend
docker compose logs frontend
docker compose logs mongodb
docker compose logs redis
```

### Monitor Resource Usage

```bash
# Check container resource usage
docker stats

# Check disk usage
docker system df

# Check network
docker network ls
```

## 🔄 Managing Services

### Stop Services

```bash
# Stop all services
docker compose down

# Stop specific service
docker compose stop backend
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend
```

### Update Services

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose up --build -d
```

## 💾 Backup and Restore

### Backup Database

```bash
# Create backup directory
mkdir -p ./backups

# Backup MongoDB
docker exec swasthvault-mongodb mongodump \
  --uri="mongodb://swasthvault_user:swasthvault_user_password@localhost:27017/swasthvault?authSource=swasthvault" \
  --out=/backup

# Copy backup from container
docker cp swasthvault-mongodb:/backup ./backups/mongodb_$(date +%Y%m%d_%H%M%S)

# Backup uploaded files
docker cp swasthvault-backend:/app/uploads ./backups/uploads_$(date +%Y%m%d_%H%M%S)
```

### Restore Database

```bash
# Restore MongoDB from backup
docker exec -i swasthvault-mongodb mongorestore \
  --uri="mongodb://swasthvault_user:swasthvault_user_password@localhost:27017/swasthvault?authSource=swasthvault" \
  /backup/your_backup_folder
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use

```bash
# Check what's using the port
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Kill process using the port (replace PID)
kill -9 PID

# Or change ports in docker-compose.yml
```

#### 2. Docker Permission Denied (Linux)

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Restart terminal or run:
newgrp docker
```

#### 3. Container Won't Start

```bash
# Check container logs
docker compose logs [service-name]

# Check container status
docker compose ps

# Restart specific service
docker compose restart [service-name]
```

#### 4. Database Connection Issues

```bash
# Check if MongoDB is running
docker compose ps mongodb

# Check MongoDB logs
docker compose logs mongodb

# Test connection
docker exec swasthvault-mongodb mongosh --eval "db.adminCommand('ping')"
```

#### 5. Frontend Build Issues

```bash
# Clear Docker cache
docker system prune -a

# Rebuild frontend
docker compose build --no-cache frontend
docker compose up frontend -d
```

## ✅ Verification Checklist

After setup, verify these items:

- [ ] All 4 containers are running (`docker compose ps`)
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API accessible at http://localhost:5000
- [ ] Health checks pass for all services
- [ ] Can login with admin credentials
- [ ] Database contains initial admin user
- [ ] Redis is responding to ping
- [ ] Logs show no critical errors

## 🎯 Next Steps

After successful setup:

1. **Change default admin password**
2. **Configure email settings for notifications**
3. **Set up SSL/TLS for production**
4. **Configure backup schedules**
5. **Set up monitoring and alerting**
6. **Review security settings**

## 🆘 Getting Help

If you encounter issues:

1. **Check logs**: `docker compose logs`
2. **Verify configuration**: `docker compose config`
3. **Check system resources**: `docker stats`
4. **Review this guide**: Ensure all steps were followed
5. **Check GitHub issues**: Look for similar problems
6. **Contact support**: Provide logs and error messages

## 📝 Important Notes

- **Default admin**: admin@swasthvault.com / admin123
- **Change all default passwords** before production use
- **Regular backups** are recommended
- **Monitor disk space** for logs and uploads
- **Keep Docker images updated** for security
- **Use strong passwords** for all accounts
- **Enable firewall** for production deployments

---

**Congratulations!** 🎉 SwasthVault is now running on your system. You can access the application at http://localhost:3000 and start managing medical records securely.
