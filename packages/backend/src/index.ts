import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { authRouter } from './routes/auth';
import { organizationRouter } from './routes/organization';
import { userRouter } from './routes/user';
import { transactionRouter } from './routes/transaction';
import { categoryRouter } from './routes/category';
import { reportRouter } from './routes/report';
import { errorHandler } from './middleware/errorHandler';
import { ensureDatabaseSchema, checkDatabaseConnection } from './utils/dbSetup';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Start server with database setup
async function startServer() {
  try {
    console.log('🔌 Connecting to database...');
    const connected = await checkDatabaseConnection();
    
    if (!connected) {
      console.error('❌ Failed to connect to database. Please check your DATABASE_URL');
      process.exit(1);
    }
    
    console.log('🔧 Setting up database schema...');
    await ensureDatabaseSchema();
    
    app.listen(PORT, () => {
      console.log('\n════════════════════════════════════════');
      console.log('🚀 Server running on port ' + PORT);
      console.log('📝 API: http://localhost:' + PORT + '/api');
      console.log('✅ Database: Connected & Ready');
      console.log('════════════════════════════════════════\n');
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

export default app;

