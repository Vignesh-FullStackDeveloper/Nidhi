# API Access Guide - Vercel Deployment

## 🌐 Your Deployed API URLs

### Production URL (Use This):
```
https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app
```

### Alternative URLs (Same API):
- **Branch URL:** `https://nidhi-backend-git-master-vignesh-kumars-projects-04f1e33b.vercel.app`
- **Deployment URL:** `https://nidhi-backend-2072zl2ir-vignesh-kumars-projects-04f1e33b.vercel.app`

### Custom Domain (If Configured):
```
https://nidhi-backend.vercel.app
```

---

## 🔗 API Endpoints

### Base URL:
```
https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api
```

### Health Check:
```
GET https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/health
```

### Authentication:
```
POST https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/auth/register
POST https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/auth/login
GET  https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/auth/me
```

### Transactions:
```
GET    https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/transactions
POST   https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/transactions
GET    https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/transactions/:id
PUT    https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/transactions/:id
DELETE https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/transactions/:id
```

### Reports:
```
GET  https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/reports/summary
GET  https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/reports/download
POST https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/reports/email
```

### Users (Admin only):
```
GET    https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/users
POST   https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/users
PUT    https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/users/:id
DELETE https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/users/:id
```

### Categories:
```
GET    https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/categories
POST   https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/categories
PUT    https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/categories/:id
DELETE https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/categories/:id
```

### Organizations:
```
GET https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/organizations
PUT https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/organizations/:id
```

---

## 🧪 Testing the API

### 1. Test Health Endpoint (No Auth Required):
```bash
curl https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/health
```

Or open in browser:
```
https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-03T12:34:56.789Z"
}
```

### 2. Test Registration:
```bash
curl -X POST https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "organizationName": "Test Organization"
  }'
```

### 3. Test Login:
```bash
curl -X POST https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "SUPER_ADMIN",
    "organizationId": "..."
  }
}
```

### 4. Test Authenticated Endpoint:
```bash
curl -X GET https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 🌐 Updating Frontend to Use Deployed API

### Web App (`packages/web/.env`):
```env
VITE_API_URL=https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api
```

### Mobile App (`packages/mobile/.env`):
```env
API_URL=https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api
```

### For Production Builds:
- **Web:** Set environment variable `VITE_API_URL` in your web hosting (Vercel, Netlify, etc.)
- **Mobile:** Update `.env` before building the app

---

## 📱 Access from Frontend

### Web App:
1. Update `packages/web/.env`:
   ```env
   VITE_API_URL=https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api
   ```
2. Restart web app:
   ```bash
   npm run web
   ```

### Mobile App:
1. Update `packages/mobile/.env`:
   ```env
   API_URL=https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api
   ```
2. Restart mobile app:
   ```bash
   npm run mobile
   ```

---

## 🔍 Troubleshooting

### API Returns 500 Error:
1. **Check Environment Variables** in Vercel Dashboard:
   - `DATABASE_URL` must be set
   - `JWT_SECRET` must be set
   - Check Runtime Logs in Vercel

2. **Check Runtime Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the deployment → Runtime Logs
   - Look for error messages

3. **Test Health Endpoint First:**
   - If `/health` works but `/api/*` doesn't, it's a routing issue
   - If `/health` doesn't work, it's a serverless function issue

### CORS Errors:
- Backend already has CORS enabled for all origins
- If you still see CORS errors, check Vercel logs

### Database Connection Errors:
- Verify `DATABASE_URL` is correct in Vercel environment variables
- For Supabase: Use connection pooler URL with `?pgbouncer=true&connection_limit=1`

---

## ✅ Quick Test Checklist

- [ ] Health endpoint works: `/health`
- [ ] Registration works: `POST /api/auth/register`
- [ ] Login works: `POST /api/auth/login`
- [ ] Authenticated endpoint works: `GET /api/auth/me` (with token)
- [ ] Frontend can connect to API

---

## 🔗 Quick Links

- **Health Check:** https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/health
- **API Base:** https://nidhi-backend-vignesh-kumars-projects-04f1e33b.vercel.app/api
- **Vercel Dashboard:** https://vercel.com/dashboard

---

**Your API is live and ready to use!** 🚀


