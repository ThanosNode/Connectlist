# ConnectList Deployment Guide

This guide provides comprehensive instructions for deploying ConnectList to various platforms.

## 🌐 Linode Deployment (Recommended)

### Prerequisites
- Linode server (Ubuntu 22.04 LTS, minimum 2GB RAM)
- Domain name (optional, can use IP address)
- SSH access to server

### Automated Deployment

1. **Upload files to server:**
```bash
scp -r . user@your-server-ip:/tmp/connectlist
```

2. **Run deployment script:**
```bash
ssh user@your-server-ip
cd /tmp/connectlist
chmod +x deploy.sh
./deploy.sh
```

3. **Configure environment:**
```bash
sudo nano /opt/connectlist/.env
# Update with your actual configuration
```

4. **Set up SSL (if using domain):**
```bash
sudo certbot --nginx -d yourdomain.com
```

### Manual Deployment

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 2. Database Setup
```bash
sudo -u postgres psql
CREATE DATABASE connectlist;
CREATE USER connectlist_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE connectlist TO connectlist_user;
\q
```

#### 3. Application Setup
```bash
# Create user and directory
sudo useradd -m connectlist
sudo mkdir -p /opt/connectlist
sudo chown connectlist:connectlist /opt/connectlist

# Clone repository
sudo -u connectlist git clone https://github.com/yourusername/connectlist.git /opt/connectlist

# Install dependencies and build
cd /opt/connectlist
sudo -u connectlist npm install
sudo -u connectlist npm run build

# Set up environment
sudo -u connectlist cp .env.example .env
sudo -u connectlist nano .env  # Configure your settings

# Set up database
sudo -u connectlist npm run db:push
```

#### 4. Process Management
```bash
# Start with PM2
cd /opt/connectlist
sudo -u connectlist pm2 start ecosystem.config.js
sudo -u connectlist pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u connectlist --hp /home/connectlist
```

#### 5. Web Server Setup
```bash
# Copy Nginx configuration
sudo cp /opt/connectlist/nginx.conf /etc/nginx/sites-available/connectlist
sudo ln -s /etc/nginx/sites-available/connectlist /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Update domain in config
sudo nano /etc/nginx/sites-available/connectlist

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. SSL Setup
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

#### 7. Firewall Setup
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Clone repository:**
```bash
git clone https://github.com/yourusername/connectlist.git
cd connectlist
```

2. **Configure environment:**
```bash
cp .env.example .env
nano .env  # Update configuration
```

3. **Deploy:**
```bash
# Basic deployment
docker-compose up -d

# With Elasticsearch
docker-compose --profile with-elasticsearch up -d

# With full stack (Nginx, Redis, Elasticsearch)
docker-compose --profile with-nginx --profile with-redis --profile with-elasticsearch up -d
```

### Using Docker only

```bash
# Build image
docker build -t connectlist .

# Run with external database
docker run -d \
  --name connectlist \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NODE_ENV=production \
  connectlist
```

## ☁️ Cloud Platform Deployment

### DigitalOcean Droplet
Follow the same steps as Linode deployment.

### AWS EC2
1. Launch Ubuntu 22.04 LTS instance
2. Configure security groups (ports 22, 80, 443)
3. Follow Linode deployment steps

### Google Cloud Platform
1. Create Compute Engine instance with Ubuntu 22.04
2. Configure firewall rules
3. Follow Linode deployment steps

### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run database migrations
heroku run npm run db:push
```

## 🔧 Environment Configuration

### Required Variables
```env
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
SESSION_SECRET=your-super-secure-session-secret
```

### Optional Variables
```env
# Elasticsearch
ELASTICSEARCH_URL=https://your-elasticsearch-url
ELASTICSEARCH_USERNAME=username
ELASTICSEARCH_PASSWORD=password

# Payment processing
COINBASE_COMMERCE_API_KEY=your-coinbase-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# Email (if implemented)
SMTP_HOST=smtp.provider.com
SMTP_USER=your-email
SMTP_PASS=your-password
```

## 🔍 Health Monitoring

### PM2 Monitoring
```bash
# Check status
pm2 status

# View logs
pm2 logs connectlist

# Restart application
pm2 restart connectlist

# Monitor resources
pm2 monit
```

### System Monitoring
```bash
# Check Nginx status
sudo systemctl status nginx

# Check PostgreSQL status
sudo systemctl status postgresql

# View application logs
tail -f /opt/connectlist/logs/app.log

# Check disk space
df -h

# Check memory usage
free -h
```

## 🚀 Performance Optimization

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_listings_location ON listings(country, state, city);
CREATE INDEX CONCURRENTLY idx_listings_type_status ON listings(type, status);
CREATE INDEX CONCURRENTLY idx_listings_featured ON listings(is_featured, created_at);
```

### Nginx Optimization
- Enable gzip compression
- Set up proper caching headers
- Configure rate limiting
- Use HTTP/2

### Application Optimization
- Enable PM2 cluster mode
- Configure proper logging levels
- Set up health checks
- Monitor memory usage

## 🔒 Security Checklist

- [ ] Use strong database passwords
- [ ] Configure firewall (UFW/iptables)
- [ ] Set up SSL certificates
- [ ] Enable fail2ban for SSH protection
- [ ] Regular security updates
- [ ] Configure secure headers in Nginx
- [ ] Use environment variables for secrets
- [ ] Regular database backups
- [ ] Monitor application logs

## 🔄 Backup Strategy

### Database Backup
```bash
# Create backup
pg_dump -h localhost -U connectlist_user connectlist > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U connectlist_user connectlist < backup_20240101_120000.sql
```

### Application Backup
```bash
# Backup application files
tar -czf connectlist_backup_$(date +%Y%m%d).tar.gz /opt/connectlist --exclude=/opt/connectlist/node_modules --exclude=/opt/connectlist/logs
```

### Automated Backups
Set up cron jobs for regular backups:
```bash
# Daily database backup at 2 AM
0 2 * * * pg_dump -h localhost -U connectlist_user connectlist > /backups/db_$(date +\%Y\%m\%d).sql

# Weekly application backup
0 3 * * 0 tar -czf /backups/app_$(date +\%Y\%m\%d).tar.gz /opt/connectlist --exclude=/opt/connectlist/node_modules --exclude=/opt/connectlist/logs
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Multiple application instances
- Shared session storage (Redis)
- Separate database server

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Use CDN for static assets
- Implement caching strategies

## 🆘 Troubleshooting

### Common Issues

#### Application won't start
```bash
# Check PM2 logs
pm2 logs connectlist

# Check environment variables
pm2 env connectlist

# Check database connection
psql -h localhost -U connectlist_user connectlist
```

#### 502 Bad Gateway
```bash
# Check if application is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### Database connection errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Test connection
psql -h localhost -U connectlist_user connectlist
```

For additional support, check the logs and monitoring tools, or create an issue in the GitHub repository.