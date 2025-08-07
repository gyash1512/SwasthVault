# SwasthVault Docker Deployment Guide

This guide provides comprehensive instructions for deploying SwasthVault using Docker containers with separate services for MongoDB, Redis, Backend API, and Frontend.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM
- At least 10GB free disk space

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │
│   (React/Nginx) │    │   (Node.js)     │
│   Port: 3000    │    │   Port: 5000    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  MongoDB    │ │   Redis     │ │   Docker    │
│  Port: 27017│ │   Port: 6379│ │   Network   │
└─────────────┘ └─────────────┘ └─────────────┘
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-username/SwasthVault.git
cd SwasthVault

# Copy environment file
cp .env.production .env

# Edit environment variables (IMPORTANT!)
nano .env
```

### 2. Build and Run All Services

```bash
# Build and start all services
docker-compose up --build -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 🔧 Individual Service Commands

### MongoDB Container

```bash
# Run MongoDB only
docker run -d \
  --name swasthvault-mongodb \
  --network swasthvault-network \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=swasthvault_admin_password \
  -e MONGO_INITDB_DATABASE=swasthvault \
  -v mongodb_data:/data/db \
  -v ./deployment/mongodb/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro \
  mongo:7.0

# Connect to MongoDB
docker exec -it swasthvault-mongodb mongosh -u admin -p swasthvault_admin_password

# Backup database
docker exec swasthvault-mongodb mongodump --uri="mongodb://admin:swasthvault_admin_password@localhost:27017/swasthvault?authSource=admin" --out=/backup
docker cp swasthvault-mongodb:/backup ./backup
```

### Redis Container

```bash
# Run Redis only
docker run -d \
  --name swasthvault-redis \
  --network swasthvault-network \
  -p 6379:6379 \
  -v redis_data:/data \
  -v ./deployment/redis/redis.conf:/usr/local/etc/redis/redis.conf:ro \
  redis:7.2-alpine redis-server /usr/local/etc/redis/redis.conf

# Connect to Redis
docker exec -it swasthvault-redis redis-cli -a swasthvault_redis_password

# Monitor Redis
docker exec -it swasthvault-redis redis-cli -a swasthvault_redis_password monitor
```

### Backend Container

```bash
# Build backend image
docker build -t swasthvault-backend ./backend

# Run backend only (requires MongoDB and Redis)
docker run -d \
  --name swasthvault-backend \
  --network swasthvault-network \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://swasthvault_user:swasthvault_user_password@mongodb:27017/swasthvault?authSource=swasthvault \
  -e REDIS_HOST=redis \
  -e REDIS_PASSWORD=swasthvault_redis_password \
  -v backend_uploads:/app/uploads \
  -v backend_logs:/app/logs \
  swasthvault-backend

# View backend logs
docker logs -f swasthvault-backend

# Execute commands in backend container
docker exec -it swasthvault-backend npm run --help
```

### Frontend Container

```bash
# Build frontend image
docker build -t swasthvault-frontend ./frontend

# Run frontend only
docker run -d \
  --name swasthvault-frontend \
  --network swasthvault-network \
  -p 3000:3000 \
  -e REACT_APP_API_URL=http://localhost:5000/api \
  swasthvault-frontend

# View frontend logs
docker logs -f swasthvault-frontend
```

## 🔒 Security Configuration

### 1. Change Default Passwords

```bash
# Generate secure passwords
openssl rand -base64 32  # For JWT secrets
openssl rand -hex 16     # For encryption keys
openssl rand -base64 24  # For database passwords
```

### 2. Update Environment Variables

Edit `.env` file with secure values:

```env
JWT_SECRET=your_generated_jwt_secret_here
JWT_REFRESH_SECRET=your_generated_refresh_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key_here
ENCRYPTION_IV=your_16_character_iv_here
```

### 3. Database Security

```bash
# Change MongoDB passwords
docker exec -it swasthvault-mongodb mongosh -u admin -p swasthvault_admin_password

# In MongoDB shell:
use swasthvault
db.changeUserPassword("swasthvault_user", "your_new_secure_password")
```

## 📊 Monitoring and Maintenance

### Health Checks

```bash
# Check all service health
docker-compose ps

# Individual health checks
curl http://localhost:5000/health  # Backend
curl http://localhost:3000/health  # Frontend

# Database health
docker exec swasthvault-mongodb mongosh --eval "db.adminCommand('ping')"
docker exec swasthvault-redis redis-cli -a swasthvault_redis_password ping
```

### Logs Management

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f backend

# Export logs
docker-compose logs > swasthvault-logs.txt
```

### Backup and Restore

```bash
# Backup MongoDB
docker exec swasthvault-mongodb mongodump \
  --uri="mongodb://swasthvault_user:swasthvault_user_password@localhost:27017/swasthvault?authSource=swasthvault" \
  --out=/backup/$(date +%Y%m%d_%H%M%S)

# Backup Redis
docker exec swasthvault-redis redis-cli -a swasthvault_redis_password BGSAVE

# Backup uploaded files
docker cp swasthvault-backend:/app/uploads ./backup/uploads_$(date +%Y%m%d_%H%M%S)

# Restore MongoDB
docker exec -i swasthvault-mongodb mongorestore \
  --uri="mongodb://swasthvault_user:swasthvault_user_password@localhost:27017/swasthvault?authSource=swasthvault" \
  /backup/your_backup_folder
```

## 🔄 Updates and Scaling

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose up --build -d

# Update specific service
docker-compose up --build -d backend
```

### Scaling Services

```bash
# Scale backend instances
docker-compose up --scale backend=3 -d

# Scale with load balancer (requires nginx configuration)
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5000
   
   # Change ports in docker-compose.yml if needed
   ```

2. **Permission issues**:
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER ./
   chmod +x ./backend/healthcheck.js
   ```

3. **Database connection issues**:
   ```bash
   # Check network connectivity
   docker network ls
   docker network inspect swasthvault-network
   
   # Test database connection
   docker exec swasthvault-backend npm run test:db
   ```

4. **Memory issues**:
   ```bash
   # Check container resource usage
   docker stats
   
   # Increase Docker memory limit in Docker Desktop
   # Or add memory limits to docker-compose.yml
   ```

### Debug Mode

```bash
# Run services in debug mode
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up

# Access container shell
docker exec -it swasthvault-backend sh
docker exec -it swasthvault-frontend sh
```

## 📈 Production Deployment

### 1. Use Production Compose File

```bash
# Create production override
cp docker-compose.yml docker-compose.prod.yml

# Edit for production settings
# - Remove port mappings for internal services
# - Add restart policies
# - Configure resource limits
# - Add SSL/TLS configuration
```

### 2. SSL/TLS Setup

```bash
# Add reverse proxy (nginx/traefik)
# Configure SSL certificates
# Update CORS settings
```

### 3. Monitoring Setup

```bash
# Add monitoring stack
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Services: Prometheus, Grafana, AlertManager
```

## 🆘 Support

For issues and support:

1. Check logs: `docker-compose logs`
2. Verify configuration: `docker-compose config`
3. Check GitHub issues
4. Contact support team

## 📝 Notes

- Default admin credentials: `admin@swasthvault.com` / `admin123`
- Change all default passwords before production use
- Regular backups are recommended
- Monitor disk space for logs and uploads
- Keep Docker images updated for security patches
