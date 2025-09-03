#!/bin/bash

echo "🔧 MongoDB Authentication Fix Script"
echo "===================================="
echo ""

echo "🚨 Current Issue: MongoDB authentication failed"
echo ""

echo "📋 Solutions (choose one):"
echo ""
echo "1. 🔑 Reset MongoDB Atlas Password:"
echo "   - Go to https://cloud.mongodb.com"
echo "   - Database Access → Edit user 'doriswylam'"
echo "   - Set new password: VoiceVitals123!"
echo ""
echo "2. 👤 Create New MongoDB User:"
echo "   - Database Access → Add New Database User"
echo "   - Username: voicevitals_user"
echo "   - Password: VoiceVitals123!"
echo "   - Privileges: Read and write to any database"
echo ""
echo "3. 🚀 Use Railway MongoDB (Recommended):"
echo "   - In Railway dashboard → New → Database → MongoDB"
echo "   - Copy the connection string Railway provides"
echo ""

echo "🔧 After fixing, update your .env file with the new connection string"
echo ""

echo "💡 Quick Test:"
echo "   - Test connection locally: npm run dev"
echo "   - If it works locally, deploy to Railway again"
echo ""

echo "📞 Need help? Check MongoDB Atlas documentation or Railway support"
