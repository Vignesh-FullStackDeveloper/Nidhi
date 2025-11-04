import express from 'express';
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

// Middleware - Remove Express CORS, we'll handle it manually in the handler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads (Note: Vercel serverless functions don't support persistent file storage)
// For production, use cloud storage like AWS S3, Cloudinary, or Supabase Storage
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
if (!isVercel) {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// CORS is handled in the handler function for Vercel serverless functions

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

// Helper function to set CORS headers
function setCORSHeaders(req: express.Request, res: express.Response) {
  // Get origin from request
  const origin = req.headers.origin;
  
  // Allow all origins (including localhost for development)
  // In production, you might want to whitelist specific domains
  if (origin) {
    // Allow any origin - this is permissive for development
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    // No origin header (e.g., direct API calls) - allow all
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Log for debugging (can remove in production)
  if (process.env.NODE_ENV !== 'production') {
    console.log('CORS Headers set for origin:', origin || 'none');
  }
}

// Export the Express app as a serverless function
export default async function handler(req: express.Request, res: express.Response) {
  // Set CORS headers first
  setCORSHeaders(req, res);
  
  // Handle preflight OPTIONS request - return early before Express processing
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Initialize database on first request
  await initializeDatabase();
  
  // Wrap res.end to ensure CORS headers are always set
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any) {
    setCORSHeaders(req, res);
    return originalEnd(chunk, encoding);
  };
  
  // Wrap res.json to ensure CORS headers are always set
  const originalJson = res.json.bind(res);
  res.json = function(body?: any) {
    setCORSHeaders(req, res);
    return originalJson(body);
  };
  
  // Wrap res.send to ensure CORS headers are always set
  const originalSend = res.send.bind(res);
  res.send = function(body?: any) {
    setCORSHeaders(req, res);
    return originalSend(body);
  };
  
  // Handle the request with Express app
  return app(req, res);
}

