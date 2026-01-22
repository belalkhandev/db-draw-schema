# SchemaCraft - Production Setup Guide

## Overview

This guide explains how your SchemaCraft application has been configured for production deployment on Ubuntu with a single entry point at `http://scraft.local`.

## Architecture

### Production Stack:
- **Frontend**: Vite-built React app served as static files
- **Backend**: Node.js/Express API running as a systemd service
- **Database**: MongoDB (already running)
- **Web Server**: Nginx as reverse proxy
- **Domain**: scraft.local (configured in /etc/hosts)

### How it Works:
1. Nginx listens on port 80 for requests to `scraft.local`
2. Frontend requests are served directly from `/var/www/workspace/schema-craft/dist`
3. API requests (`/api/*` and `/health`) are proxied to the backend on port 5550
4. Backend runs as a background systemd service, starts automatically on boot

## Configuration Files

### 1. Backend Environment (`backend/.env`)
```
NODE_ENV=production
PORT=5550
MONGODB_URI=mongodb://localhost:27017/schema-craft
CORS_ORIGIN=http://scraft.local
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 2. Systemd Service (`/etc/systemd/system/schema-craft-backend.service`)
- **Location**: `/tmp/schema-craft-backend.service` (to be installed)
- **User**: belal
- **Working Directory**: `/var/www/workspace/schema-craft/backend`
- **Auto-start**: Enabled on boot
- **Dependencies**: Waits for MongoDB service

### 3. Nginx Configuration (`/etc/nginx/sites-available/scraft.local`)
- **Location**: `/tmp/scraft.local.nginx` (to be installed)
- **Server Name**: scraft.local
- **Port**: 80
- **Root**: `/var/www/workspace/schema-craft/dist`
- **API Proxy**: `/api/*` → `http://localhost:5550`

## Installation Steps

### Quick Setup (Recommended)

Run the automated setup script:

```bash
sudo bash setup-production.sh
```

This script will:
1. Install nginx (if not already installed)
2. Install and enable the backend systemd service
3. Configure nginx for scraft.local
4. Start all services
5. Display status information

### Manual Setup

If you prefer to set up manually:

```bash
# 1. Install nginx (if needed)
sudo apt-get update
sudo apt-get install nginx

# 2. Install systemd service
sudo cp /tmp/schema-craft-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable schema-craft-backend
sudo systemctl start schema-craft-backend

# 3. Install nginx configuration
sudo cp /tmp/scraft.local.nginx /etc/nginx/sites-available/scraft.local
sudo ln -s /etc/nginx/sites-available/scraft.local /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Accessing Your Application

Once setup is complete, access your application at:

**http://scraft.local**

- The frontend will load automatically
- API calls are automatically proxied to the backend
- No need to manually start any services

## Managing Services

### Backend Service

```bash
# Start backend
sudo systemctl start schema-craft-backend

# Stop backend
sudo systemctl stop schema-craft-backend

# Restart backend
sudo systemctl restart schema-craft-backend

# Check status
sudo systemctl status schema-craft-backend

# View logs
sudo journalctl -u schema-craft-backend -f

# View logs from the last hour
sudo journalctl -u schema-craft-backend --since "1 hour ago"
```

### Nginx

```bash
# Restart nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# View access logs
sudo tail -f /var/log/nginx/scraft.local.access.log

# View error logs
sudo tail -f /var/log/nginx/scraft.local.error.log
```

### MongoDB

```bash
# Check status
sudo systemctl status mongod

# Restart
sudo systemctl restart mongod
```

## Rebuilding the Application

When you make code changes, you need to rebuild:

### Frontend Changes:
```bash
# From project root
npm run build

# Then reload nginx (optional, static files updated immediately)
sudo systemctl reload nginx
```

### Backend Changes:
```bash
# From project root
cd backend
npm run build

# Restart the service
sudo systemctl restart schema-craft-backend
```

### Both:
```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
cd ..

# Restart backend service
sudo systemctl restart schema-craft-backend
```

## Development vs Production

### Development Mode:
```bash
# Runs both frontend and backend in watch mode
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5550
- Hot reload enabled
- CORS configured for localhost

### Production Mode:
```bash
# Access via the configured domain
http://scraft.local
```
- Frontend: Static files served by nginx
- Backend: Runs as systemd service
- Auto-starts on boot
- CORS configured for scraft.local

## Troubleshooting

### Application not accessible at scraft.local

1. Check /etc/hosts:
```bash
cat /etc/hosts | grep scraft.local
# Should show: 127.0.0.1  scraft.local
```

2. Check nginx is running:
```bash
sudo systemctl status nginx
```

3. Check backend is running:
```bash
sudo systemctl status schema-craft-backend
```

### Backend API not responding

1. Check backend logs:
```bash
sudo journalctl -u schema-craft-backend -n 50
```

2. Verify MongoDB is running:
```bash
sudo systemctl status mongod
```

3. Check if backend is listening on port 5550:
```bash
sudo netstat -tlnp | grep 5550
```

### Nginx errors

1. Test nginx configuration:
```bash
sudo nginx -t
```

2. Check nginx error logs:
```bash
sudo tail -50 /var/log/nginx/scraft.local.error.log
```

3. Check file permissions:
```bash
ls -la /var/www/workspace/schema-craft/dist
```

### Port conflicts

If port 5550 is already in use, you can change it:

1. Edit backend/.env:
```
PORT=5551  # or any available port
```

2. Update nginx config:
```bash
sudo nano /etc/nginx/sites-available/scraft.local
# Change proxy_pass http://localhost:5550 to your new port
```

3. Rebuild and restart:
```bash
cd backend && npm run build && cd ..
sudo systemctl restart schema-craft-backend
sudo systemctl restart nginx
```

## Security Recommendations

Before deploying to a real production environment:

1. **Change JWT Secret**: Update `JWT_SECRET` in `backend/.env` to a strong random value
2. **Use HTTPS**: Configure SSL/TLS certificates (Let's Encrypt)
3. **Firewall**: Configure ufw or iptables to restrict access
4. **Environment Variables**: Never commit .env files to version control
5. **Database Security**: Enable MongoDB authentication
6. **Regular Updates**: Keep Node.js, nginx, and system packages updated

## Files Modified/Created

### Modified:
- `backend/.env` - Updated for production (NODE_ENV, CORS_ORIGIN)
- `src/modules/ReactFlowRelationshipEdge.tsx` - Fixed TypeScript errors
- `backend/src/controllers/auth.controller.ts` - Fixed JWT type issues

### Created:
- `/tmp/schema-craft-backend.service` - Systemd service configuration
- `/tmp/scraft.local.nginx` - Nginx site configuration
- `setup-production.sh` - Automated setup script
- `PRODUCTION_SETUP.md` - This documentation

## Quick Reference

| Component | Port | Access |
|-----------|------|--------|
| Application | 80 | http://scraft.local |
| Frontend (dev) | 5173 | http://localhost:5173 |
| Backend API | 5550 | http://localhost:5550/api (proxied) |
| MongoDB | 27017 | localhost only |

---

For issues or questions, check the logs first:
```bash
# Backend
sudo journalctl -u schema-craft-backend -f

# Nginx access
sudo tail -f /var/log/nginx/scraft.local.access.log

# Nginx errors
sudo tail -f /var/log/nginx/scraft.local.error.log
```
