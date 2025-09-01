# VoiceVitals Frontend

A modern Next.js application with TypeScript for voice-controlled health tracking.

## 🚀 Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Development:** Turbopack for fast builds

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Hero.tsx          # Landing hero section
│   ├── Features.tsx      # Features showcase
│   ├── VoiceRecorder.tsx # Voice recording interface
│   └── Footer.tsx        # Site footer
├── hooks/                 # Custom React hooks
│   └── useSpeechRecognition.ts
├── types/                 # TypeScript type definitions
│   └── index.ts
└── utils/                 # Utility functions
    ├── api.ts            # API communication
    └── helpers.ts        # Helper functions
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME="VoiceVitals"
```

## 🎯 Features

- **TypeScript First:** Full type safety and IntelliSense
- **Modern Architecture:** Clean component separation
- **Custom Hooks:** Reusable voice recognition logic
- **Responsive Design:** Mobile-first approach
- **Performance:** Optimized with Turbopack
- **Accessibility:** WCAG compliance focused

## 🔧 Key Components

### VoiceRecorder
Advanced voice recording interface with:
- Real-time speech recognition
- Visual feedback and animations
- Error handling and loading states
- API integration for health analysis

### Hero
Landing section featuring:
- Animated gradient backgrounds
- Call-to-action buttons
- Feature highlights
- Smooth scroll navigation

### Features
Comprehensive feature showcase with:
- Grid layout for multiple features
- Hover animations and effects
- Icon integration
- Responsive design

## 📱 Browser Support

- ✅ Chrome (recommended for speech recognition)
- ✅ Edge
- ✅ Safari
- ⚠️ Firefox (limited speech support)

## 🚀 Deployment

The application is optimized for deployment on:
- Vercel (recommended)
- Netlify
- Any Node.js hosting platform

Build command: `npm run build`
Start command: `npm start`
