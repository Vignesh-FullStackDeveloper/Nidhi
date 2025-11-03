# Nidhi - Financial Management Application

A comprehensive multi-platform financial management application for managing organizational income and expenses with role-based access control.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm 9+
- **PostgreSQL** 14+ (or use Supabase - cloud PostgreSQL)
- For mobile: Expo Go app (iOS/Android)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd nidhi
npm install
```

2. **Setup Backend Environment:**
```bash
cd packages/backend
# Create .env file
```

Add to `packages/backend/.env`:
```env
# Database (Supabase PostgreSQL example)
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true&connection_limit=1"

# JWT Authentication
JWT_SECRET="your-secure-secret-key-change-this"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./uploads"

# Email (Optional - see Email Setup section)
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="onboarding@resend.dev"
```

3. **Setup Web Environment:**
```bash
cd ../web
# Create .env file
```

Add to `packages/web/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

4. **Setup Mobile Environment:**
```bash
cd ../mobile
# Create .env file
```

Add to `packages/mobile/.env`:
```env
API_URL=http://localhost:3001/api
```

### Database Setup

**The app automatically creates database tables on startup!** No manual SQL needed.

**For Supabase (Recommended):**
1. Create account at https://supabase.com
2. Create a new project
3. Get connection string from Settings → Database
4. Add `?pgbouncer=true&connection_limit=1` to connection string
5. Use connection pooler URL (port 6543) for Prisma compatibility

**For Local PostgreSQL:**
1. Create database: `createdb nidhi_db`
2. Update `DATABASE_URL` in `.env`
3. Tables are created automatically on first startup

### Running the Application

**Development (all together):**
```bash
npm run dev
```

**Or run separately:**

**Backend:**
```bash
npm run backend
# API: http://localhost:3001
```

**Web:**
```bash
npm run web
# App: http://localhost:5173
```

**Mobile:**
```bash
npm run mobile
# Scan QR code with Expo Go app
```

## 📧 Email Setup (Optional)

### Option 1: Resend (Easiest - Recommended) ⭐

1. Sign up: https://resend.com (free, 3,000 emails/month)
2. Get API Key: https://resend.com/api-keys
3. Add to `packages/backend/.env`:
```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev
```

**That's it!** No SMTP configuration needed.

### Option 2: SMTP (Gmail, SendGrid, etc.)

Add to `packages/backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Note:** If email is not configured, clicking "Email" will download PDF instead.

## 📁 Project Structure

```
nidhi/
├── packages/
│   ├── backend/              # Node.js/Express API
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   ├── src/
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── middleware/   # Auth, upload, error handling
│   │   │   ├── utils/        # Database setup utilities
│   │   │   └── index.ts      # Entry point
│   │   └── .env             # Environment variables
│   ├── web/                  # React web app
│   │   ├── src/
│   │   │   ├── pages/        # Page components
│   │   │   ├── components/   # Reusable components
│   │   │   ├── contexts/     # React contexts
│   │   │   └── services/     # API services
│   │   └── .env             # Environment variables
│   └── mobile/               # React Native app
│       ├── src/
│       │   ├── screens/      # Screen components
│       │   ├── navigation/   # Navigation setup
│       │   ├── contexts/     # React contexts
│       │   └── services/     # API services
│       └── .env             # Environment variables
└── package.json             # Root package.json
```

## 🔐 Features

- **Authentication:** JWT-based with role-based access control
- **Organizations:** Multi-tenant with user management
- **Transactions:** Income & expenses with attachments
- **Categories:** Organized by type (Income/Expense)
- **Reports:** Weekly, monthly, yearly with PDF export
- **Email Reports:** Send PDF reports via email (optional)
- **Multi-Currency:** Support for 8 currencies
- **Payment Methods:** Cash, Cheque, DD, Bank Transfer, Card, UPI
- **File Attachments:** Images and documents for transactions

## 👥 User Roles

- **SUPER_ADMIN:** Full access to everything
- **ADMIN:** Manage users and all transactions
- **USER:** Create and edit own transactions
- **VIEWER:** View-only access

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register organization and user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Reports
- `GET /api/reports/summary` - Get summary report
- `GET /api/reports/download` - Download PDF report
- `POST /api/reports/email` - Email PDF report

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Organizations
- `GET /api/organizations` - Get organization
- `PUT /api/organizations/:id` - Update organization

## 🔧 Environment Variables

### Backend (`packages/backend/.env`)
```env
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./uploads"

# Email (Resend - Recommended)
RESEND_API_KEY="re_..."
EMAIL_FROM="onboarding@resend.dev"

# Email (SMTP - Alternative)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-password"
```

### Web (`packages/web/.env`)
```env
VITE_API_URL=http://localhost:3001/api
```

### Mobile (`packages/mobile/.env`)
```env
API_URL=http://localhost:3001/api
```

**Note:** For mobile, use your computer's local IP instead of `localhost`:
```env
API_URL=http://192.168.1.100:3001/api
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run all (backend + web)
npm run dev

# Run separately
npm run backend    # Backend API
npm run web        # Web frontend
npm run mobile     # Mobile app

# Database commands (in packages/backend)
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio

# Build for production
cd packages/backend && npm run build && npm start
cd packages/web && npm run build
```

## 🗄️ Database

**Automatic Schema Management:**
- Tables are created automatically on backend startup
- No manual SQL scripts needed
- UUID extension enabled automatically
- Indexes and constraints set up automatically

**Schema:**
- `Organization` - Multi-tenant organizations
- `User` - Users with roles
- `Category` - Income/expense categories
- `Transaction` - Financial transactions
- `Attachment` - File attachments

## 📦 Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL (Supabase)
- JWT Authentication
- PDFKit (PDF generation)
- Resend/Nodemailer (Email)

**Web:**
- React + TypeScript
- Vite
- Material-UI (MUI)
- React Query
- Axios

**Mobile:**
- React Native + Expo
- React Navigation
- React Native Paper
- React Query

## 🚀 Production Deployment

### Backend (Railway, Heroku, VPS)
1. Set environment variables
2. Deploy code
3. Tables are created automatically on first startup

### Web (Vercel, Netlify)
1. Build: `cd packages/web && npm run build`
2. Deploy `dist/` folder
3. Set `VITE_API_URL` environment variable

### Mobile (Expo EAS Build)
```bash
cd packages/mobile
npm install -g eas-cli
eas build:configure
eas build --platform all
eas submit
```

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens with expiration
- File upload restrictions
- SQL injection protection (Prisma)
- XSS protection (React)
- CORS configuration
- Environment variables for secrets

## 📝 Importing Dependencies

All dependencies are managed via npm:

```bash
# Root level (installs all packages)
npm install

# Individual packages
cd packages/backend && npm install
cd packages/web && npm install
cd packages/mobile && npm install
```

**Key Dependencies:**
- `@prisma/client` - Database ORM
- `express` - Web framework
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `pdfkit` - PDF generation
- `resend` - Email API (easier than SMTP)
- `nodemailer` - SMTP email (alternative)
- `react`, `react-native` - UI frameworks
- `@tanstack/react-query` - Data fetching
- `axios` - HTTP client

## 🐛 Troubleshooting

### Backend won't start
- Check `.env` file exists in `packages/backend/`
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running (or Supabase is accessible)

### Database connection errors
- For Supabase: Use connection pooler URL (port 6543)
- Add `?pgbouncer=true&connection_limit=1` to connection string
- Tables are created automatically on first startup

### Email not working
- Check `RESEND_API_KEY` or SMTP settings in `.env`
- If not configured, clicking "Email" downloads PDF instead
- See Email Setup section above

### Mobile can't connect to backend
- Use your computer's local IP instead of `localhost`
- Ensure backend is running
- Check firewall settings

## 📄 License

MIT License

## 🆘 Support

For issues:
- Check environment variables are set correctly
- Verify database connection
- Check backend logs for errors
- Ensure all dependencies are installed

---

**Ready to use!** Just run `npm install` and `npm run dev` 🎉
