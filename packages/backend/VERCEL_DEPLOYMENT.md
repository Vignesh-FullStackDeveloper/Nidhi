# Vercel Deployment Guide

## ✅ What Was Fixed

The backend Express app is now configured for Vercel serverless functions.

## 📋 Required Setup in Vercel Dashboard

### 1. **Environment Variables**

Go to your Vercel project → Settings → Environment Variables and add:

```env
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

**Optional (for email):**
```env
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=onboarding@resend.dev
```

Or use SMTP:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### 2. **Build Settings**

In Vercel Dashboard → Settings → General:

- **Root Directory:** Leave empty (or set to `packages/backend` if deploying only backend)
- **Build Command:** `npm run vercel-build` (or leave empty, it's in vercel.json)
- **Output Directory:** `.` (or leave empty)
- **Install Command:** `npm install`

### 3. **Deployment**

1. Push your code to GitHub
2. Vercel will automatically detect changes
3. Or manually trigger deployment from Vercel dashboard

## 🔍 Troubleshooting

### Function Crashes

1. **Check Runtime Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments → Click deployment → Runtime Logs

2. **Check Environment Variables:**
   - Ensure all required variables are set
   - Check for typos in variable names

3. **Check Database Connection:**
   - Verify `DATABASE_URL` is correct
   - For Supabase: Use connection pooler URL with `?pgbouncer=true&connection_limit=1`

4. **Common Issues:**
   - Missing `DATABASE_URL` → Function crashes on startup
   - Prisma client not generated → Add `vercel-build` script that runs `prisma generate`
   - TypeScript compilation errors → Check `api/index.ts` for correct imports

### Check Build Logs

- Go to Vercel Dashboard → Your Project → Deployments → Click deployment → Build Logs

## 📝 Files Added

- `vercel.json` - Vercel configuration
- `api/index.ts` - Serverless function handler
- `package.json` - Updated with `vercel-build` script

## 🔗 Testing

After deployment:
- Health check: `https://your-domain.vercel.app/health`
- API endpoint: `https://your-domain.vercel.app/api/auth/login`

## 💡 Important Notes

1. **File Uploads:** Vercel serverless functions don't support persistent file storage. Use cloud storage like Supabase Storage, AWS S3, or Cloudinary.

2. **Database:** Tables are created automatically on first request (via `dbSetup.ts`).

3. **Cold Starts:** First request may take longer due to database initialization.

4. **Environment Variables:** Must be set in Vercel dashboard for production.

