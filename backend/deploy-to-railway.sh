#!/bin/bash

echo "🚀 VoiceVitals Backend Deployment to Railway"
echo "=============================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
else
    echo "✅ Railway CLI already installed"
fi

echo ""
echo "🔑 Step 1: Login to Railway"
echo "   This will open your browser to authenticate with GitHub"
echo "   Press Enter when ready..."
read -r

railway login

echo ""
echo "📁 Step 2: Initialize Railway Project"
echo "   This will create a new Railway project"
echo "   Press Enter when ready..."
read -r

railway init

echo ""
echo "⚙️  Step 3: Set Environment Variables"
echo "   You'll need to set these in Railway dashboard:"
echo ""
echo "   MONGODB_URI=your_mongodb_connection_string"
echo "   JWT_SECRET=your_jwt_secret_key"
echo "   FRONTEND_URL=https://voice-vitals-5syx4szr6-doris-lams-projects.vercel.app"
echo "   PORT=4000"
echo "   GEMINI_API_KEY=your_gemini_api_key"
echo ""
echo "   Press Enter when you've set these in Railway..."
read -r

echo ""
echo "🚀 Step 4: Deploy to Railway"
echo "   This will deploy your backend"
echo "   Press Enter when ready..."
read -r

railway up

echo ""
echo "🎉 Deployment Complete!"
echo "   Your backend should now be live!"
echo ""
echo "🔗 Next Steps:"
echo "   1. Copy your Railway URL from the output above"
echo "   2. Go to Vercel Dashboard → Settings → Environment Variables"
echo "   3. Add: NEXT_PUBLIC_API_URL = your_railway_url"
echo "   4. Your frontend will automatically redeploy"
echo ""
echo "🌐 Test your backend by visiting your Railway URL"
