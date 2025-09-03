# 🚀 Quick Backend Deployment Checklist

## ✅ What You Need (5 minutes total!)

### 1. **MongoDB Atlas** (2 min)
- Go to [MongoDB Atlas](https://cloud.mongodb.com)
- Create free cluster (if you don't have one)
- Get connection string

### 2. **Railway Deployment** (3 min)
- Go to [Railway.app](https://railway.app)
- Sign in with GitHub
- Click "New Project" → "Deploy from GitHub repo"
- Select: `Doris-Lam/VoiceVitals`
- Set root directory: `backend`
- Add environment variables (see below)

### 3. **Environment Variables to Add in Railway:**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voicevitals
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
FRONTEND_URL=https://voice-vitals-5syx4szr6-doris-lams-projects.vercel.app
PORT=4000
GEMINI_API_KEY=your_gemini_key_if_you_have_one
```

### 4. **Get Your Backend URL**
- Railway will give you: `https://your-app.up.railway.app`
- Copy this URL!


### 5. **Update Frontend** (1 min)
- Go to [Vercel Dashboard](https://vercel.com/doris-lams-projects/voice-vitals/settings)
- Click "Environment Variables"
- Add: `NEXT_PUBLIC_API_URL` = your Railway URL
- Frontend auto-redeploys! 🎉

## 🆘 Need Help?
- **MongoDB:** Use free tier, it's enough for testing
- **JWT_SECRET:** Just type random characters like `abc123def456ghi789`
- **Railway:** It's like Heroku but easier and has free tier

## 🎯 Total Time: 5 minutes!
Your backend will be live and connected to your frontend!
