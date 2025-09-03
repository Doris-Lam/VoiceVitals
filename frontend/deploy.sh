#!/bin/bash

echo "🚀 Deploying VoiceVitals to Vercel..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "🎉 Deployment complete!"
    echo "🌐 Your app is live at: https://voice-vitals-5syx4szr6-doris-lams-projects.vercel.app"
else
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi
