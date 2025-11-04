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

// CORS - Allow all origins
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (local dev only)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
if (!isVercel) {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/organizations', organizationRouter);
app.use('/api/users', userRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/reports', reportRouter);

// Error handling
app.use(errorHandler);

// Database initialization
let dbInitialized = false;

async function initializeDatabase() {
  if (dbInitialized) return;

  try {
    const connected = await checkDatabaseConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    await ensureDatabaseSchema();
    dbInitialized = true;
  } catch (error: any) {
    console.error('Database initialization error:', error.message);
    throw error;
  }
}

// Vercel serverless function handler
export default async function handler(req: express.Request, res: express.Response) {
  // Handle OPTIONS preflight
  if (req.method?.toUpperCase() === 'OPTIONS') {
    const origin = req.headers.origin || '*';
    res.writeHead(200, {
      'Access-Control-Allow-Origin': origin === '*' ? '*' : origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  // Set CORS headers for all requests
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin === '*' ? '*' : origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Initialize database
  await initializeDatabase();

  // Handle request
  app(req, res);
}

