# ConnectList - Web3 Classified Marketplace

A cutting-edge Web3-powered marketplace platform that revolutionizes classified listings through decentralized, secure, and engaging community interactions.

## 🚀 Features

- **Web3 Integration**: Blockchain-powered classified listings
- **Modern UI/UX**: Built with React.js and Tailwind CSS
- **Advanced Search**: Elasticsearch-powered search capabilities (optional)
- **Secure Authentication**: Multi-factor authentication and session management
- **Payment Integration**: Coinbase Commerce and Stripe payment support
- **Location-Based Filtering**: Comprehensive country and US state-level filtering
- **Real-time Features**: WebSocket integration for live updates
- **Mobile Responsive**: Optimized for all device sizes

## 🛠 Tech Stack

### Frontend
- **React.js 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** components
- **TanStack Query** for state management
- **Wouter** for routing
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **Passport.js** for authentication
- **WebSocket** support
- **Helmet.js** for security

### Optional Services
- **Elasticsearch** for advanced search
- **Coinbase Commerce** for crypto payments
- **Stripe** for traditional payments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd connectlist
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database and service credentials
```

4. **Set up the database:**
```bash
npm run db:push
```

5. **Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🌐 Environment Variables

### Required
```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### Optional (for enhanced features)
```env
# Elasticsearch (for advanced search)
ELASTICSEARCH_URL=https://your-elasticsearch-url
ELASTICSEARCH_USERNAME=your-username
ELASTICSEARCH_PASSWORD=your-password

# Coinbase Commerce (for crypto payments)
COINBASE_COMMERCE_API_KEY=your-coinbase-api-key

# Stripe (for card payments)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## 🚀 Deployment

### Linode Deployment

1. **Create a Linode server** (Ubuntu 22.04 LTS recommended)

2. **Install dependencies on server:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 for process management
sudo npm install -g pm2
```

3. **Set up PostgreSQL:**
```bash
sudo -u postgres psql
CREATE DATABASE connectlist;
CREATE USER connectlist_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE connectlist TO connectlist_user;
\q
```

4. **Clone and deploy:**
```bash
git clone <your-repository-url>
cd connectlist
npm install
npm run build

# Set up environment variables
sudo nano /etc/environment
# Add your environment variables

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

5. **Set up Nginx reverse proxy:**
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/connectlist
```

Add nginx configuration (see `nginx.conf` in the repository)

6. **Enable SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

### Docker Deployment

```bash
# Build the image
docker build -t connectlist .

# Run with docker-compose
docker-compose up -d
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check
- `npm run db:push` - Push database schema

## 🔧 Configuration

### Database Schema
The application uses Drizzle ORM with PostgreSQL. The schema is defined in `shared/schema.ts` and includes:
- Users with role-based access
- Listings with location and category filtering
- Payments with multiple provider support
- Sessions and security features

### Authentication
- Session-based authentication with secure cookies
- Password hashing with bcrypt
- Security questions for account recovery
- Role-based authorization (user, sub_admin, super_admin)

### Search
- Basic SQL-based search (always available)
- Advanced Elasticsearch search (optional, requires credentials)
- Location-based filtering
- Category and price range filtering

## 🔒 Security Features

- Helmet.js for security headers
- CSRF protection
- SQL injection protection via Drizzle ORM
- Password hashing and security questions
- Session security with secure cookies
- Input validation with Zod schemas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@connectlist.com or create an issue in the GitHub repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core marketplace functionality
- Features: User authentication, listing management, payment integration, location filtering