# 🚀 Deployment & Scaling Documentation

## Overview

This document provides comprehensive instructions for deploying and scaling the AI Interview Platform across multiple environments.

## Architecture Overview

```
┌─────────────────┐
│   Vercel CDN    │  ← Frontend (Global Edge Network)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Render (Node)  │  ← Backend API (Oregon Region)
└────────┬────────┘
         │
         ├────────────┐
         │            │
         ▼            ▼
┌─────────────┐  ┌──────────────┐
│ Render (Py) │  │ MongoDB Atlas│
│ AI Service  │  │   Database   │
└─────────────┘  └──────────────┘
```

---

## Production URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | https://ai-interview-platform-mu-nine.vercel.app | ✅ Live |
| Backend API | https://ai-interview-platform-c8f2.onrender.com | ✅ Live |
| AI Service | https://ai-interview-ai-service.onrender.com | ✅ Live |
| Database | MongoDB Atlas (Private) | ✅ Live |

---

## Prerequisites

### Accounts Required
- [x] GitHub account
- [x] Vercel account (free tier)
- [x] Render account (free tier)
- [x] MongoDB Atlas account (free tier)

### Tools Required
- Git
- Node.js v18+
- Python 3.12+
- npm or yarn

---

## Part 1: Database Deployment (MongoDB Atlas)

### Step 1: Create MongoDB Cluster

1. **Sign up/Login** to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a New Cluster**
   - Click "Build a Database"
   - Choose **M0 Sandbox** (Free tier)
   - Provider: **AWS**
   - Region: **Closest to your users**
   - Cluster Name: `ai-interview-cluster`

3. **Configure Security**
   ```
   Database Access:
   - Username: your_username
   - Password: your_secure_password
   - Privileges: Atlas admin
   
   Network Access:
   - Add IP: 0.0.0.0/0 (Allow from anywhere)
   - Note: In production, restrict to specific IPs
   ```

4. **Get Connection String**
   ```
   Click "Connect" → "Connect your application"
   Copy: mongodb+srv://username:password@cluster.mongodb.net/ai-interview-platform
   ```

### Step 2: Initialize Database

```javascript
// Run this in MongoDB Compass or Shell
use ai-interview-platform

// Create collections
db.createCollection("users")
db.createCollection("interviews")
db.createCollection("scores")

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.interviews.createIndex({ user: 1, createdAt: -1 })
db.scores.createIndex({ user: 1, interview: 1 })
```

---

## Part 2: Backend Deployment (Render)

### Step 1: Prepare Backend

1. **Ensure package.json is correct**
   ```json
   {
     "name": "ai-interview-backend",
     "version": "1.0.0",
     "main": "src/server.js",
     "scripts": {
       "start": "node src/server.js",
       "dev": "nodemon src/server.js"
     },
     "dependencies": {
       "express": "^4.18.2",
       "mongoose": "^7.6.0",
       "bcrypt": "^5.1.1",
       "jsonwebtoken": "^9.0.2",
       "cors": "^2.8.5",
       "dotenv": "^16.3.1"
     }
   }
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Deploy on Render

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **New +** → **Web Service**
   - Connect GitHub repository
   - Select `AI-Interview-Platform`

2. **Configure Build Settings**
   ```
   Name: ai-interview-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: Backend
   Runtime: Node
   Build Command: npm install
   Start Command: node src/server.js
   Instance Type: Free
   ```

3. **Add Environment Variables**
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/ai-interview-platform
   JWT_SECRET = your_random_secret_key_here_min_32_chars
   PORT = 5000
   NODE_ENV = production
   ```

4. **Deploy**
   - Click **Create Web Service**
   - Wait 3-5 minutes for deployment
   - Check logs for "Server running on port 5000"

### Step 3: Verify Backend

```bash
# Test health endpoint
curl https://ai-interview-platform-c8f2.onrender.com/health

# Expected response:
{"message":"Server is running"}
```

---

## Part 3: AI Service Deployment (Render)

### Step 1: Prepare AI Service

1. **Ensure requirements.txt exists**
   ```txt
   fastapi==0.104.1
   uvicorn[standard]==0.24.0
   pydantic==2.5.0
   python-multipart==0.0.6
   ```

2. **Ensure main.py has uvicorn runner**
   ```python
   if __name__ == "__main__":
       import uvicorn
       uvicorn.run(app, host="0.0.0.0", port=8000)
   ```

### Step 2: Deploy on Render

1. **Create Web Service**
   - Click **New +** → **Web Service**
   - Select same GitHub repository

2. **Configure Build Settings**
   ```
   Name: ai-interview-ai-service
   Region: Oregon (US West)
   Branch: main
   Root Directory: ai-service
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port 8000
   Instance Type: Free
   ```

3. **Environment Variables** (if needed)
   ```
   PYTHON_VERSION = 3.12.0
   ```

4. **Deploy and Verify**
   ```bash
   curl https://ai-interview-ai-service.onrender.com/health
   ```

---

## Part 4: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Create vercel.json** (in frontend directory)
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "**/*",
         "use": "@vercel/static"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/$1"
       }
     ]
   }
   ```

2. **Update config.js with production URLs**
   ```javascript
   const API_BASE_URL = "https://ai-interview-platform-c8f2.onrender.com";
   const AI_SERVICE_URL = "https://ai-interview-ai-service.onrender.com";
   ```

3. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

### Step 2: Deploy on Vercel

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **Add New...** → **Project**
   - Import `AI-Interview-Platform` from GitHub

2. **Configure Project**
   ```
   Framework Preset: Other
   Root Directory: frontend
   Build Command: (leave empty)
   Output Directory: .
   Install Command: (leave empty)
   ```

3. **Deploy**
   - Click **Deploy**
   - Wait 1-2 minutes
   - Get URL: `https://ai-interview-platform-*.vercel.app`

4. **Configure Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your domain
   - Update DNS records

---

## Part 5: CORS Configuration

### Update Backend CORS

```javascript
// Backend/src/app.js
const cors = require('cors');

app.use(cors({
  origin: [
    'https://ai-interview-platform-mu-nine.vercel.app',
    'http://localhost:3000',  // Keep for local dev
    'http://localhost:5173'   // Keep for Vite dev
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Push update:**
```bash
git add Backend/src/app.js
git commit -m "Update CORS for production"
git push
```

Render will auto-deploy in 2-3 minutes.

---

## Part 6: Environment Variables Management

### Development (.env.local)
```bash
# Backend/.env.local
MONGODB_URI=mongodb://localhost:27017/ai-interview-platform
JWT_SECRET=dev_secret_key_not_for_production
PORT=5000
NODE_ENV=development
```

### Production (Render)
```bash
# Set via Render Dashboard
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production_secret_min_32_chars
PORT=5000
NODE_ENV=production
```

### Frontend Config
```javascript
// Production
const API_BASE_URL = "https://ai-interview-platform-c8f2.onrender.com";

// Development
const API_BASE_URL = "http://localhost:5000";
```

---

## Part 7: Monitoring & Logging

### Render Logs

1. **View Logs**
   - Render Dashboard → Your Service → Logs tab
   - Real-time log streaming
   - Filter by severity

2. **Download Logs**
   - Click "Download Logs"
   - Available for 7 days

### MongoDB Atlas Monitoring

1. **Database Metrics**
   - Atlas Dashboard → Metrics
   - Track: Connections, Operations, Network

2. **Set Alerts**
   - Alerts tab → Create Alert
   - Monitor: CPU, Memory, Disk usage

### Vercel Analytics

1. **Enable Analytics**
   - Project Settings → Analytics
   - Track: Page views, Performance

---

## Scaling Strategy

### Phase 1: Current (Free Tier)
```
Frontend: Vercel Free (Unlimited bandwidth)
Backend: Render Free (750 hours/month)
AI Service: Render Free (750 hours/month)
Database: MongoDB M0 (512MB storage)
```

**Limitations:**
- Backend/AI service sleep after 15 min inactivity
- 100K requests/month on Render Free
- 512MB storage on MongoDB Free

### Phase 2: Light Production ($20/month)
```
Frontend: Vercel Pro ($20/month)
Backend: Render Starter ($7/month)
AI Service: Render Starter ($7/month)
Database: MongoDB M10 ($9/month - Shared)

Total: ~$43/month
```

**Improvements:**
- No sleep on backend services
- 2GB database storage
- Priority support

### Phase 3: Medium Production ($100-200/month)
```
Frontend: Vercel Pro
Backend: Render Standard ($25/month)
AI Service: Render Standard ($25/month)
Database: MongoDB M20 ($50/month - Dedicated)

Total: ~$120/month
```

**Features:**
- 2GB RAM per service
- Auto-scaling
- 10GB database storage
- Better performance

### Phase 4: High Production ($500+/month)
```
Frontend: Vercel Enterprise
Backend: Multiple Render instances with load balancer
AI Service: Dedicated GPU instances
Database: MongoDB M40+ with replication

Features:
- Auto-scaling
- Multi-region deployment
- 99.9% SLA
- Dedicated support
```

---

## Performance Optimization

### Backend Optimization

1. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Add Caching**
   ```javascript
   const redis = require('redis');
   const client = redis.createClient(process.env.REDIS_URL);
   ```

3. **Database Query Optimization**
   ```javascript
   // Use lean() for read-only queries
   const users = await User.find().lean();
   
   // Use select() to limit fields
   const users = await User.find().select('name email');
   ```

### Frontend Optimization

1. **Enable Compression**
   - Vercel automatically compresses assets

2. **Lazy Loading**
   ```javascript
   // Load charts only when needed
   const Chart = await import('chart.js');
   ```

3. **Image Optimization**
   - Use WebP format
   - Implement lazy loading

### AI Service Optimization

1. **Model Caching**
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=100)
   def load_model():
       return load_nlp_model()
   ```

2. **Async Processing**
   ```python
   from fastapi import BackgroundTasks
   
   @app.post("/evaluate")
   async def evaluate(background_tasks: BackgroundTasks):
       background_tasks.add_task(process_evaluation)
   ```

---

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Render/Vercel environment variables
- ✅ Rotate secrets regularly

### 2. API Security
```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Database Security
- ✅ IP whitelisting
- ✅ Encryption at rest
- ✅ TLS for connections
- ✅ Regular backups

### 4. HTTPS Enforcement
```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

---

## Continuous Integration/Deployment (CI/CD)

### Automatic Deployments

**Vercel:**
- Pushes to `main` → Auto-deploy to production
- Pull requests → Deploy preview

**Render:**
- Pushes to `main` → Auto-deploy
- Can configure branch-based deploys

### GitHub Actions (Optional)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        run: curl ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## Rollback Strategy

### Render Rollback
1. Go to Render Dashboard
2. Click on service
3. "Manual Deploy" → Select previous commit
4. Click "Deploy"

### Vercel Rollback
1. Go to Deployments tab
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

---

## Health Checks

### Backend Health Endpoint
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### Database Health Check
```javascript
app.get('/health/db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ database: 'connected' });
  } catch (error) {
    res.status(500).json({ database: 'disconnected', error: error.message });
  }
});
```

---

## Troubleshooting

### Common Issues

**1. "Application failed to respond"**
- Check: Service logs in Render
- Fix: Ensure PORT environment variable is set
- Fix: Verify start command is correct

**2. "CORS error"**
- Check: Origin URL in CORS config
- Fix: Add Vercel URL to allowed origins
- Fix: Ensure credentials: true

**3. "MongoDB connection failed"**
- Check: Connection string format
- Fix: Verify IP whitelist includes 0.0.0.0/0
- Fix: Check username/password

**4. "Service unavailable (503)"**
- Cause: Free tier service sleeping
- Fix: Upgrade to paid tier
- Workaround: Ping service every 10 mins

---

## Cost Optimization

### Free Tier Limits
| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel | Unlimited | $20/month |
| Render | 750 hours/month | $7+/month |
| MongoDB | 512MB | $9+/month |

### Tips to Stay Free
1. Use Render sleep mode wisely
2. Optimize database queries
3. Implement caching
4. Use CDN for static assets

---

## Support & Maintenance

### Regular Tasks
- [ ] Weekly: Check logs for errors
- [ ] Monthly: Review metrics
- [ ] Quarterly: Update dependencies
- [ ] Annually: Renew SSL certificates (auto on Vercel/Render)

### Monitoring Checklist
- [ ] Backend uptime
- [ ] Database performance
- [ ] API response times
- [ ] Error rates
- [ ] User feedback

---

**Last Updated:** February 2026  
**Maintained by:** Mohar Ganguly  
**Platform Version:** 1.0