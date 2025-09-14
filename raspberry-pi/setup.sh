#!/bin/bash

# ADHD Reader - Raspberry Pi Setup Script
# This script sets up the ADHD Reader application on a Raspberry Pi

set -e

echo "🧠 Setting up ADHD Reader on Raspberry Pi..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required system packages
echo "🔧 Installing system dependencies..."
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    nginx \
    supervisor \
    git \
    curl \
    wget \
    unzip \
    ffmpeg \
    espeak \
    espeak-data \
    libespeak1 \
    libespeak-dev

# Install Python dependencies
echo "🐍 Setting up Python environment..."
cd /home/pi/Book-Flow/server
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Install Node.js dependencies
echo "📱 Setting up Node.js environment..."
cd /home/pi/Book-Flow/client
npm install

# Build the client
echo "🏗️ Building client application..."
npm run build

# Create systemd service for the backend
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/adhd-reader.service > /dev/null <<EOF
[Unit]
Description=ADHD Reader Backend API
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/Book-Flow/server
Environment=PATH=/home/pi/Book-Flow/server/venv/bin
ExecStart=/home/pi/Book-Flow/server/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/adhd-reader > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Serve static files
    location /static/ {
        alias /home/pi/Book-Flow/server/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Serve frontend
    location / {
        root /home/pi/Book-Flow/client/dist;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/adhd-reader /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Create environment file
echo "🔐 Creating environment configuration..."
tee /home/pi/Book-Flow/server/.env > /dev/null <<EOF
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WALLET_PATH=/home/pi/Book-Flow/server/wallet.json
READING_PROGRAM_ID=11111111111111111111111111111111

# Application Configuration
APP_ORIGINS=http://localhost:3000,http://raspberrypi.local,http://192.168.1.100
DEBUG=False
LOG_LEVEL=INFO

# Audio Configuration
AUDIO_CACHE_SIZE=100
AUDIO_CACHE_TTL=3600

# Reading Configuration
DEFAULT_READING_SPEED=1.0
MAX_DOCUMENT_SIZE=50MB
SUPPORTED_FORMATS=pdf,docx,txt
EOF

# Create directories
echo "📁 Creating required directories..."
mkdir -p /home/pi/Book-Flow/server/static/audio
mkdir -p /home/pi/Book-Flow/server/static/images
mkdir -p /home/pi/Book-Flow/logs

# Set permissions
echo "🔒 Setting permissions..."
sudo chown -R pi:pi /home/pi/Book-Flow
chmod +x /home/pi/Book-Flow/server/venv/bin/uvicorn

# Enable and start services
echo "🚀 Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable adhd-reader
sudo systemctl start adhd-reader
sudo systemctl restart nginx

# Create startup script
echo "📜 Creating startup script..."
tee /home/pi/Book-Flow/start.sh > /dev/null <<EOF
#!/bin/bash
cd /home/pi/Book-Flow
echo "Starting ADHD Reader..."

# Start backend
sudo systemctl start adhd-reader

# Wait for backend to start
sleep 5

# Check if services are running
if systemctl is-active --quiet adhd-reader; then
    echo "✅ Backend service is running"
else
    echo "❌ Backend service failed to start"
    exit 1
fi

if systemctl is-active --quiet nginx; then
    echo "✅ Web server is running"
else
    echo "❌ Web server failed to start"
    exit 1
fi

echo "🎉 ADHD Reader is ready!"
echo "Access the application at: http://raspberrypi.local or http://$(hostname -I | awk '{print $1}')"
EOF

chmod +x /home/pi/Book-Flow/start.sh

# Create monitoring script
echo "📊 Creating monitoring script..."
tee /home/pi/Book-Flow/monitor.sh > /dev/null <<EOF
#!/bin/bash
echo "ADHD Reader Status Monitor"
echo "========================="

echo "Backend Service:"
systemctl status adhd-reader --no-pager -l

echo -e "\nWeb Server:"
systemctl status nginx --no-pager -l

echo -e "\nDisk Usage:"
df -h /home/pi/Book-Flow

echo -e "\nMemory Usage:"
free -h

echo -e "\nProcesses:"
ps aux | grep -E "(uvicorn|nginx)" | grep -v grep
EOF

chmod +x /home/pi/Book-Flow/monitor.sh

# Create update script
echo "🔄 Creating update script..."
tee /home/pi/Book-Flow/update.sh > /dev/null <<EOF
#!/bin/bash
cd /home/pi/Book-Flow

echo "Updating ADHD Reader..."

# Stop services
sudo systemctl stop adhd-reader

# Update code
git pull origin main

# Update Python dependencies
cd server
source venv/bin/activate
pip install -r requirements.txt

# Update Node.js dependencies and rebuild
cd ../client
npm install
npm run build

# Restart services
sudo systemctl start adhd-reader
sudo systemctl reload nginx

echo "✅ Update complete!"
EOF

chmod +x /home/pi/Book-Flow/update.sh

# Create backup script
echo "💾 Creating backup script..."
tee /home/pi/Book-Flow/backup.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/home/pi/backups/adhd-reader"
DATE=\$(date +%Y%m%d_%H%M%S)

echo "Creating backup..."

mkdir -p \$BACKUP_DIR

# Backup application data
tar -czf "\$BACKUP_DIR/adhd-reader_\$DATE.tar.gz" \
    --exclude="node_modules" \
    --exclude="venv" \
    --exclude=".git" \
    /home/pi/Book-Flow

# Backup configuration
cp /etc/nginx/sites-available/adhd-reader "\$BACKUP_DIR/nginx_config_\$DATE"
cp /etc/systemd/system/adhd-reader.service "\$BACKUP_DIR/systemd_service_\$DATE"

echo "✅ Backup created: \$BACKUP_DIR/adhd-reader_\$DATE.tar.gz"
EOF

chmod +x /home/pi/Book-Flow/backup.sh

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit /home/pi/Book-Flow/server/.env and add your API keys"
echo "2. Run: /home/pi/Book-Flow/start.sh"
echo "3. Access the app at: http://raspberrypi.local"
echo ""
echo "Useful commands:"
echo "- Monitor: /home/pi/Book-Flow/monitor.sh"
echo "- Update: /home/pi/Book-Flow/update.sh"
echo "- Backup: /home/pi/Book-Flow/backup.sh"
echo "- Logs: sudo journalctl -u adhd-reader -f"
