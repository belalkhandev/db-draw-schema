#!/bin/bash

# SchemaCraft Production Setup Script
# This script installs and configures the production environment

set -e

echo "=========================================="
echo "SchemaCraft Production Setup"
echo "=========================================="
echo ""

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Please run this script with sudo:"
    echo "sudo bash setup-production.sh"
    exit 1
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Installing nginx..."
    apt-get update
    apt-get install -y nginx
else
    echo "✓ nginx is already installed"
fi

# Install the systemd service
echo ""
echo "Installing systemd service for backend..."
cp /tmp/schema-craft-backend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable schema-craft-backend.service
echo "✓ Systemd service installed and enabled"

# Install nginx configuration
echo ""
echo "Installing nginx configuration..."
cp /tmp/scraft.local.nginx /etc/nginx/sites-available/scraft.local

# Create symbolic link if it doesn't exist
if [ ! -L /etc/nginx/sites-enabled/scraft.local ]; then
    ln -s /etc/nginx/sites-available/scraft.local /etc/nginx/sites-enabled/
    echo "✓ Nginx site enabled"
else
    echo "✓ Nginx site already enabled"
fi

# Test nginx configuration
echo ""
echo "Testing nginx configuration..."
nginx -t

# Restart nginx
echo ""
echo "Restarting nginx..."
systemctl restart nginx
systemctl enable nginx
echo "✓ Nginx restarted and enabled"

# Start the backend service
echo ""
echo "Starting backend service..."
systemctl restart schema-craft-backend.service
echo "✓ Backend service started"

# Show status
echo ""
echo "=========================================="
echo "Service Status:"
echo "=========================================="
systemctl status schema-craft-backend.service --no-pager -l
echo ""
systemctl status nginx --no-pager -l

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Your application is now running at: http://scraft.local"
echo ""
echo "Useful commands:"
echo "  - Check backend logs: sudo journalctl -u schema-craft-backend -f"
echo "  - Check nginx logs: sudo tail -f /var/log/nginx/scraft.local.access.log"
echo "  - Restart backend: sudo systemctl restart schema-craft-backend"
echo "  - Restart nginx: sudo systemctl restart nginx"
echo "  - Check status: sudo systemctl status schema-craft-backend"
echo ""
