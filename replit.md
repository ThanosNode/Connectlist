# ConnectList Project Documentation

## Project Overview
ConnectList is a cutting-edge Web3-powered marketplace platform that revolutionizes classified listings through decentralized, secure, and engaging community interactions.

### Current Status
- ✅ Application is functional and running
- ✅ Database is connected (local PostgreSQL)
- ✅ Frontend is working with all components
- ✅ Authentication system is implemented
- ✅ Payment systems integrated (Coinbase Commerce, Stripe)
- ✅ Elasticsearch is optional (graceful fallback)
- ✅ Deployment configurations complete

## Technical Architecture

### Frontend
- **React.js 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** with Radix UI components
- **TanStack Query** for state management
- **Wouter** for client-side routing
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** database with Drizzle ORM
- **Session-based authentication** with Passport.js
- **WebSocket** support for real-time features
- **Helmet.js** for security headers

### Database
- **PostgreSQL** (local instance)
- **Drizzle ORM** for type-safe database operations
- Schema defined in `shared/schema.ts`
- Migrations handled via `npm run db:push`

### Optional Services
- **Elasticsearch** (optional, graceful fallback)
- **Coinbase Commerce** for crypto payments
- **Stripe** for traditional payments

## Recent Changes (Latest First)

### 2025-01-14 - Deployment Preparation Complete
- ✅ Created comprehensive deployment configurations
- ✅ Added Docker and docker-compose setups
- ✅ Created Nginx configuration with SSL support
- ✅ Added PM2 ecosystem configuration
- ✅ Created automated deployment script for Linode
- ✅ Added comprehensive documentation (README.md, DEPLOYMENT.md)
- ✅ Added health check endpoint at `/api/health`
- ✅ Created proper .env.example and .gitignore
- ✅ Added MIT License

### 2025-01-14 - Database and Application Fixed
- ✅ Fixed database connection issues (switched from Neon to local PostgreSQL)
- ✅ Made Elasticsearch optional to prevent startup failures
- ✅ Created database schema successfully
- ✅ Application now runs without errors on port 5000
- ✅ Frontend loads properly with all React components

## Environment Configuration

### Required Variables
```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
SESSION_SECRET=your-secure-session-secret
```

### Optional Variables
```env
# Elasticsearch (for advanced search)
ELASTICSEARCH_URL=https://your-elasticsearch-url
ELASTICSEARCH_USERNAME=username
ELASTICSEARCH_PASSWORD=password

# Payment providers
COINBASE_COMMERCE_API_KEY=your-coinbase-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# Email (if implemented)
SMTP_HOST=smtp.provider.com
SMTP_USER=your-email
SMTP_PASS=your-password
```

## Deployment Options

### 1. Linode/VPS Deployment (Recommended)
- Use the automated `deploy.sh` script
- Supports PM2 process management
- Nginx reverse proxy with SSL
- PostgreSQL database setup

### 2. Docker Deployment
- `docker-compose up -d` for basic setup
- Profiles available for Elasticsearch, Redis, Nginx
- Fully containerized environment

### 3. Cloud Platforms
- Compatible with AWS EC2, DigitalOcean, GCP
- Heroku-ready with buildpack
- Environment variable configuration

## File Structure
```
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared schemas and types
├── scripts/                # Database seeding scripts
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Multi-service setup
├── deploy.sh              # Automated deployment script
├── ecosystem.config.js    # PM2 configuration
├── nginx.conf             # Nginx configuration
└── DEPLOYMENT.md          # Comprehensive deployment guide
```

## Key Features
- **Location-based filtering** (country, state, city)
- **Category management** with subcategories
- **User authentication** with role-based access
- **Payment processing** (crypto and traditional)
- **Advanced search** (Elasticsearch optional)
- **Admin dashboard** with user management
- **Real-time updates** via WebSocket
- **Mobile responsive** design

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run check` - TypeScript type checking

## User Preferences
- User requested deployment preparation for Linode and GitHub upload
- Prefer comprehensive documentation and automated setup scripts
- Focus on production-ready configuration with security best practices

## Security Features
- Helmet.js security headers
- CSRF protection
- SQL injection protection via Drizzle ORM
- Password hashing with bcrypt
- Session security with secure cookies
- Input validation with Zod schemas
- Rate limiting in Nginx configuration

## Next Steps
- Application is ready for deployment
- All configuration files are in place
- Documentation is comprehensive
- Health checks are implemented
- Security measures are configured