import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { authRouter } from '../src/routes/auth';
import { organizationRouter } from '../src/routes/organization';
import { userRouter } from '../src/routes/user';
import { transactionRouter } from '../src/routes/transaction';
import { categoryRouter } from '../src/routes/category';
import { reportRouter } from '../src/routes/report';
import { errorHandler } from '../src/middleware/errorHandler';
import { ensureDatabaseSchema, checkDatabaseConnection } from '../src/utils/dbSetup';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads (Note: Vercel serverless functions don't support persistent file storage)
// For production, use cloud storage like AWS S3, Cloudinary, or Supabase Storage
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
if (!isVercel) {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/organizations', organizationRouter);
app.use('/api/users', userRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/reports', reportRouter);

// Error handling
app.use(errorHandler);

// Initialize database connection on cold start
let dbInitialized = false;

async function initializeDatabase() {
  if (dbInitialized) {
    return;
  }
  
  try {
    console.log('🔌 Connecting to database...');
    const connected = await checkDatabaseConnection();
    
    if (!connected) {
      console.error('❌ Failed to connect to database. Please check your DATABASE_URL');
      throw new Error('Database connection failed');
    }
    
    console.log('🔧 Setting up database schema...');
    await ensureDatabaseSchema();
    dbInitialized = true;
    console.log('✅ Database initialized');
  } catch (error: any) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}

// Export the Express app as a serverless function
export default async function handler(req: express.Request, res: express.Response) {
  // Initialize database on first request
  await initializeDatabase();
  
  // Handle the request with Express app
  return app(req, res);
}

