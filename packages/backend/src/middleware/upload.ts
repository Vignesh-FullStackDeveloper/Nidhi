import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Check if running on Vercel (serverless environment)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

// For serverless environments, use memory storage
// For regular environments, use disk storage
const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Try to create uploads directory (only works in non-serverless environments)
if (!isVercel) {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (error) {
    console.warn('Could not create uploads directory:', error);
    // Continue with memory storage if directory creation fails
  }
}

// Use memory storage for Vercel/serverless, disk storage otherwise
// NOTE: In Vercel/serverless, files are stored in memory and won't persist
// For production, implement cloud storage (Supabase Storage, AWS S3, Cloudinary)
const storage = isVercel 
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    });

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Allow images and PDFs
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  }
});

