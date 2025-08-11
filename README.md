# VoiceVitals - Voice-Controlled Health Tracker

A modern web application that combines voice recognition with AI to help users track their health symptoms and medications hands-free.

## Features

- 🎤 Voice recognition for hands-free input
- 🤖 AI-powered health data parsing (Google Gemini)
- 📱 Accessible, user-friendly interface
- 💊 Medication and symptom tracking
- 🔊 Voice feedback capabilities

## Project Structure

```
voicevitals/
├── frontend/          # React app with Vite
│   ├── src/
│   │   ├── VoiceRecorder.jsx    # Main voice component
│   │   └── App.jsx              # Main app component
│   └── package.json
└── backend/           # Node.js/Express server
    ├── server.js      # Main server file
    ├── .env           # Environment variables
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern browser with speech recognition support (Chrome, Edge, Safari)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd voicevitals
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The server will run on http://localhost:3001

2. **In a new terminal, start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   The app will run on http://localhost:5173

### Usage

1. Open http://localhost:5173 in your browser
2. Click "Start Recording" and speak about your symptoms or medications
3. Click "Stop Recording" when finished
4. Click "Send to Backend" to process your speech

## Next Steps

- [ ] Integrate Google Gemini AI for intelligent parsing
- [ ] Add data persistence (database)
- [ ] Implement user authentication
- [ ] Add health insights and recommendations
- [ ] Deploy to production

## Tech Stack

- **Frontend:** React, Vite, Web Speech API
- **Backend:** Node.js, Express, CORS
- **AI:** Google Gemini API (coming soon)
- **Database:** TBD (SQLite/MongoDB)

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Safari
- ❌ Firefox (limited speech recognition support)
