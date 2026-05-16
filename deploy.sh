#!/bin/bash

# ConnectList Deployment Script for Linode
# This script automates the deployment process

set -e

echo "🚀 Starting ConnectList deployment..."

# Configuration
APP_NAME="connectlist"
APP_USER="connectlist"
APP_DIR="/opt/connectlist"
NGINX_AVAILABLE="/etc/nginx/sites-available/$APP_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$APP_NAME"
DB_NAME="connectlist"
DB_USER="connectlist_user"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
print_status "Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PostgreSQL
print_status "Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Install PM2
print_status "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Install Nginx
print_status "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# Create application user
print_status "Creating application user..."
if ! id "$APP_USER" &>/dev/null; then
    sudo useradd -m -s /bin/bash $APP_USER
fi

# Create application directory
print_status "Setting up application directory..."
sudo mkdir -p $APP_DIR
sudo chown $APP_USER:$APP_USER $APP_DIR

# Set up PostgreSQL database
print_status "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || print_warning "Database $DB_NAME already exists"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD 'changeme';" 2>/dev/null || print_warning "User $DB_USER already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Clone or update repository
print_status "Cloning/updating repository..."
if [ ! -d "$APP_DIR/.git" ]; then
    print_warning "Please manually clone your repository to $APP_DIR"
    print_warning "Example: sudo -u $APP_USER git clone https://github.com/yourusername/connectlist.git $APP_DIR"
    read -p "Press enter when repository is cloned..."
fi

# Install dependencies and build
print_status "Installing dependencies and building application..."
cd $APP_DIR
sudo -u $APP_USER npm install
sudo -u $APP_USER npm run build

# Create logs directory
sudo -u $APP_USER mkdir -p $APP_DIR/logs

# Set up environment variables
print_status "Setting up environment variables..."
if [ ! -f "$APP_DIR/.env" ]; then
    sudo -u $APP_USER cp $APP_DIR/.env.example $APP_DIR/.env
    print_warning "Please edit $APP_DIR/.env with your actual configuration"
    print_warning "Especially update the DATABASE_URL with the correct password"
fi

# Set up database schema
print_status "Setting up database schema..."
cd $APP_DIR
sudo -u $APP_USER npm run db:push

# Set up PM2
print_status "Setting up PM2..."
sudo -u $APP_USER pm2 start ecosystem.config.js
sudo -u $APP_USER pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $APP_USER --hp /home/$APP_USER

# Set up Nginx configuration
print_status "Setting up Nginx configuration..."
sudo cp nginx.conf $NGINX_AVAILABLE
sudo ln -sf $NGINX_AVAILABLE $NGINX_ENABLED
sudo nginx -t
sudo systemctl reload nginx

# Set up UFW firewall
print_status "Setting up firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Install Certbot for SSL
print_status "Installing Certbot for SSL..."
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot python3-certbot-nginx -y
fi

print_status "Deployment completed!"
print_warning "Don't forget to:"
print_warning "1. Update $APP_DIR/.env with your actual configuration"
print_warning "2. Update nginx.conf with your actual domain name"
print_warning "3. Run: sudo certbot --nginx -d yourdomain.com"
print_warning "4. Restart nginx: sudo systemctl reload nginx"
print_warning "5. Check PM2 status: sudo -u $APP_USER pm2 status"

echo -e "${GREEN}🎉 ConnectList deployment script completed!${NC}"