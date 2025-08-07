# SwasthVault Quick Start Guide

## 🚀 Essential Commands

### Prerequisites
```bash
# Install Docker Desktop from: https://www.docker.com/products/docker-desktop
# Install Git from: https://git-scm.com/downloads
```

### 1. Clone & Setup (5 minutes)
```bash
# Clone repository
git clone https://github.com/gyash1512/SwasthVault.git
cd SwasthVault

# Setup environment
cp .env.production .env
# Edit .env with your secure values (see below)
```

### 2. Generate Secure Keys
```bash
# Generate JWT secret (copy output to .env)
openssl rand -base64 32

# Generate encryption key (copy output to .env) 
openssl rand -hex 16

# Generate IV (copy output to .env)
openssl rand -hex 8
```

### 3. Start Application
```bash
# Build and start all services
docker compose up --build -d

# Check status
docker compose ps
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Login**: admin@swasthvault.com / admin123

## 📝 Environment Variables (.env)

```env
JWT_SECRET=your_generated_32_plus_character_secret
JWT_REFRESH_SECRET=your_generated_32_plus_character_refresh_secret
ENCRYPTION_KEY=your_generated_32_character_key
ENCRYPTION_IV=your_generated_16_character_iv
SESSION_SECRET=your_generated_32_plus_character_session_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 🔧 Common Commands

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Restart services
docker compose restart

# Update application
git pull origin main
docker compose down
docker compose up --build -d

# Backup database
docker exec swasthvault-mongodb mongodump --uri="mongodb://swasthvault_user:swasthvault_user_password@localhost:27017/swasthvault?authSource=swasthvault" --out=/backup
```

## 🐛 Troubleshooting

```bash
# Check service status
docker compose ps

# View specific service logs
docker compose logs backend
docker compose logs frontend

# Restart specific service
docker compose restart backend

# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000
```

## ✅ Verification Checklist

- [ ] Docker Desktop installed and running
- [ ] All 4 containers running (`docker compose ps`)
- [ ] Frontend loads at http://localhost:3000
- [ ] Can login with admin credentials
- [ ] Backend health check passes at http://localhost:5000/health

## 🔒 Security Notes

- Change default admin password immediately
- Use strong, unique passwords for all services
- Keep environment variables secure
- Regular backups recommended

---

**Need detailed instructions?** See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)

**Need deployment info?** See [DEPLOYMENT.md](DEPLOYMENT.md)
