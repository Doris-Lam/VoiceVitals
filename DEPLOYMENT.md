# VoiceVitals Deployment Guide

## 🚀 Frontend (Vercel) - Already Deployed ✅

**URL:** https://voice-vitals-5syx4szr6-doris-lams-projects.vercel.app

**Status:** ✅ Deployed and working

## 🔧 Backend (Railway) - Need to Deploy

### Step 1: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign in with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your `Doris-Lam/VoiceVitals` repository**
5. **Set the root directory to `backend`**
6. **Railway will automatically detect it's a Node.js app**

### Step 2: Set Environment Variables in Railway

In your Railway project dashboard, add these environment variables:

```bash
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/voicevitals
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=https://voice-vitals-5syx4szr6-doris-lams-projects.vercel.app
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 3: Get Your Backend URL

After deployment, Railway will give you a URL like:
`https://your-project-name-production.up.railway.app`

### Step 4: Update Frontend Environment Variables

1. **Go to Vercel Dashboard:** https://vercel.com/doris-lams-projects/voice-vitals/settings
2. **Click "Environment Variables"**
3. **Add:** `NEXT_PUBLIC_API_URL` = `https://your-project-name-production.up.railway.app`
4. **Redeploy** your frontend

## 🔄 Alternative Backend Deployment Options

### Option 1: Render (Free Tier Available)
- Similar to Railway
- Free tier with sleep after inactivity
- Good for development/testing

### Option 2: Heroku
- More established platform
- Free tier discontinued
- Good for production apps

### Option 3: DigitalOcean App Platform
- Very reliable
- Starts at $5/month
- Great for production

## 🧪 Test Your Deployment

1. **Frontend:** Visit your Vercel URL
2. **Backend:** Test API endpoints
3. **Integration:** Try logging in/using features

## 🚨 Common Issues & Solutions

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check that CORS middleware is properly configured

### Database Connection
- Verify MongoDB connection string
- Ensure IP whitelist includes Railway's IPs

### Environment Variables
- Frontend: Must start with `NEXT_PUBLIC_`
- Backend: No prefix needed
- Restart deployments after changing env vars

## 📱 Next Steps

1. **Deploy backend to Railway**
2. **Update frontend environment variables**
3. **Test full application**
4. **Set up custom domain (optional)**
5. **Configure monitoring and analytics**

## 🆘 Need Help?

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
