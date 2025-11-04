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

// CORS middleware - must be first
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow any origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

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

// Export the Express app as a serverless function
// Vercel serverless function handler
export default async function handler(req: express.Request, res: express.Response) {
  // CRITICAL: Handle OPTIONS requests BEFORE anything else - don't even touch Express
  // Check method first thing - return immediately without any async operations
  const method = (req.method || '').toUpperCase();
  
  // Handle OPTIONS preflight requests immediately
  if (method === 'OPTIONS') {
    // Get origin from headers - handle both localhost and Vercel deployments
    const origin = req.headers.origin || req.headers['x-forwarded-host'] || '*';
    
    // Log for debugging
    console.log('[CORS] OPTIONS request:', { 
      origin, 
      method: req.method, 
      url: req.url
    });
    
    // Set all CORS headers - use origin if provided, otherwise allow all
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': origin === '*' ? '*' : origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    };
    
    // Send response immediately - don't call Express, don't initialize DB, nothing
    res.writeHead(200, corsHeaders);
    res.end();
    
    // Return immediately - this prevents Express from processing the request
    return;
  }
  
  // Set CORS headers FIRST before anything else - CRITICAL for Vercel
  const origin = req.headers.origin || req.headers.referer?.split('/').slice(0, 3).join('/');
  
  // Always set CORS headers
  if (origin && origin !== '*') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Initialize database on first request
  await initializeDatabase();
  
  // Wrap response methods to ensure CORS headers persist
  const originalEnd = res.end.bind(res);
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  
  res.end = function(chunk?: any, encoding?: any) {
    // Ensure CORS headers are set before ending
    if (origin && origin !== '*') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    return originalEnd(chunk, encoding);
  };
  
  res.json = function(body?: any) {
    // Ensure CORS headers are set before sending JSON
    if (origin && origin !== '*') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    return originalJson(body);
  };
  
  res.send = function(body?: any) {
    // Ensure CORS headers are set before sending
    if (origin && origin !== '*') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    return originalSend(body);
  };
  
  // Handle the request with Express app
  // Only call app() for non-OPTIONS requests
  app(req, res);
}

