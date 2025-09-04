# VoiceVitals - Voice-Powered Health Tracking Platform

## 🎯 Overview

VoiceVitals is a revolutionary healthcare application that leverages voice recognition and artificial intelligence to make health tracking accessible to everyone. The platform allows users to record their symptoms, medications, and health concerns through natural speech, which is then analyzed by AI to provide personalized health insights and recommendations.

**🚀 Live Demo:** [https://voice-vitals.vercel.app](https://voice-vitals.vercel.app)

### Key Benefits
- **Accessibility First**: Designed for seniors, people with disabilities, and anyone preferring hands-free interaction
- **Natural Communication**: Speak naturally about symptoms without complex forms
- **AI-Powered Analysis**: Google Gemini AI provides intelligent health insights
- **Comprehensive Tracking**: Monitor vitals, medications, symptoms, and water intake
- **Privacy Protected**: End-to-end encryption and secure data handling

## ✨ Features

### 🎤 Voice Recognition & AI Analysis
- **Real-time Speech-to-Text**: Powered by Web Speech API for accurate transcript capture
- **Natural Language Processing**: AI understands context and extracts relevant health information
- **Symptom Detection**: Automatically identifies symptoms, severity levels, and duration
- **Medication Recognition**: Detects medications, dosages, and frequencies mentioned
- **Urgency Assessment**: AI determines risk levels (low, medium, high, critical)
- **Personalized Recommendations**: Actionable health advice based on symptoms

### 📊 Health Tracking
- **Vital Signs Monitoring**: Track blood pressure, heart rate, temperature, and weight
- **Dynamic Color Coding**: Visual indicators based on medical ranges
  - **Blood Pressure**: Red (≥140/90), Green (<140/90)
  - **Heart Rate**: Red (>100 BPM), Blue (<60 BPM), Green (60-100 BPM)
  - **Temperature**: Red (≥38°C), Blue (<35°C), Green (35-37.9°C)
- **Medication Management**: Track prescriptions, dosages, schedules, and refills
- **Water Intake Tracking**: Monitor daily hydration with goal setting
- **Symptom History**: Comprehensive symptom tracking with severity levels

### 📱 User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Accessibility Features**: High contrast, screen reader support, keyboard navigation
- **Real-time Updates**: Live transcript display and processing status
- **Interactive Charts**: Visual health trends and analytics

### 🔐 Security & Privacy
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for user passwords
- **Data Encryption**: All sensitive health data is encrypted
- **Privacy Controls**: User-controlled data sharing options
- **GDPR Compliance**: Full data portability and deletion capabilities

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth transitions
- **State Management**: React Context API
- **Icons**: Lucide React
- **Charts**: Custom chart components with D3.js
- **Deployment**: Vercel with automatic deployments

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **AI Integration**: Google Gemini API
- **File Processing**: Multer for audio file handling
- **Validation**: Joi for request validation
- **Deployment**: Railway with automatic scaling

### AI & External Services
- **Speech Recognition**: Web Speech API
- **AI Analysis**: Google Gemini 1.5 Flash
- **Audio Processing**: Web Audio API
- **PDF Generation**: jsPDF for health reports

## 🏗 Architecture

### Frontend Architecture
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Main dashboard interface
│   │   ├── record/            # Voice recording page
│   │   ├── records/           # Health records history
│   │   ├── vitals/            # Vital signs tracking
│   │   ├── medications/       # Medication management
│   │   ├── water/             # Water intake tracking
│   │   ├── settings/          # User preferences
│   │   ├── login/             # Authentication
│   │   └── ai-analysis/       # AI analysis results
│   ├── components/            # Reusable UI components
│   │   ├── VoiceRecorder.tsx  # Voice recording component
│   │   ├── Navbar.tsx         # Navigation component
│   │   ├── Hero.tsx           # Landing page hero
│   │   ├── Features.tsx       # Features showcase
│   │   ├── Footer.tsx         # Footer component
│   │   └── ClientOnly.tsx     # Client-side rendering wrapper
│   ├── contexts/              # React Context providers
│   │   ├── AuthContext.tsx    # Authentication context
│   │   └── ThemeContext.tsx   # Theme management
│   ├── hooks/                 # Custom React hooks
│   │   └── useSpeechRecognition.ts # Speech recognition hook
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # Shared type definitions
│   └── utils/                 # Utility functions
│       ├── api.ts             # API client functions
│       └── helpers.ts         # Helper utilities
```

### Backend Architecture
```
backend/
├── controllers/               # Request handlers
│   ├── authController.js      # Authentication logic
│   ├── healthController.js    # Health records management
│   ├── vitalsController.js    # Vital signs handling
│   ├── medicationController.js # Medication management
│   ├── waterController.js     # Water tracking
│   ├── settingsController.js  # User settings
│   └── achievementController.js # Achievement system
├── models/                   # MongoDB schemas
│   ├── User.js               # User model
│   ├── HealthRecord.js       # Health records model
│   ├── Vitals.js             # Vital signs model
│   ├── Medication.js         # Medication model
│   ├── WaterRecord.js        # Water tracking model
│   └── UserSettings.js       # User settings model
├── routes/                   # API route definitions
│   ├── authRoutes.js         # Authentication routes
│   ├── healthRoutes.js       # Health records routes
│   ├── vitalsRoutes.js       # Vital signs routes
│   ├── medicationRoutes.js   # Medication routes
│   ├── waterRoutes.js        # Water tracking routes
│   └── settingsRoutes.js     # Settings routes
├── services/                 # Business logic
│   └── geminiService.js      # AI analysis service
├── utils/                    # Helper functions
│   ├── auth.js               # Authentication utilities
│   ├── catchAsync.js         # Error handling
│   ├── AppError.js           # Custom error class
│   └── waterScheduler.js     # Water reminder scheduling
└── server.js                 # Main server file
```

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- npm or yarn package manager

### Live Demo
**🌐 Production App:** [https://voice-vitals.vercel.app](https://voice-vitals.vercel.app)

### Available Scripts (Root Directory)
```bash
# Development
npm run dev              # Start both frontend and backend in development mode
npm run dev:frontend     # Start only frontend development server
npm run dev:backend      # Start only backend development server

# Building
npm run build            # Build both frontend and backend for production
npm run build:frontend   # Build only frontend
npm run build:backend    # Build only backend

# Production
npm start                # Start both frontend and backend in production mode
npm run start:frontend   # Start only frontend production server
npm run start:backend    # Start only backend production server

# Testing
npm test                 # Run tests for both frontend and backend
npm run test:frontend    # Run only frontend tests
npm run test:backend     # Run only backend tests

# Utilities
npm run setup            # Install all dependencies and setup the project
npm run install:all      # Install dependencies for all packages
npm run lint             # Run linting for both frontend and backend
npm run clean            # Remove all node_modules directories
```

### Quick Start (Recommended)
```bash
# Install all dependencies and start development servers
npm run setup
npm run dev
```

### Manual Setup

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Health Records Endpoints

#### POST /api/health
Create a new health record from voice transcript
```json
{
  "transcript": "I have a headache and took 2 aspirin",
  "audioUrl": "optional-audio-file-url"
}
```

#### GET /api/health
Retrieve user's health records with pagination
```
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- urgencyLevel: string (low|medium|high|urgent)
```

### Vitals Endpoints

#### POST /api/vitals
Record vital signs
```json
{
  "bloodPressure": {
    "systolic": 120,
    "diastolic": 80
  },
  "heartRate": {
    "bpm": 72
  },
  "temperature": {
    "value": 36.8,
    "unit": "celsius"
  },
  "weight": {
    "value": 70,
    "unit": "kg"
  }
}
```

#### GET /api/vitals
Retrieve vital signs with statistics and trends

#### POST /api/vitals/:id/regenerate-analysis
Regenerate AI analysis for a specific vitals record

### Medication Endpoints

#### POST /api/medications
Add a new medication
```json
{
  "name": "Aspirin",
  "dosage": "100mg",
  "frequency": "daily",
  "category": "over-the-counter",
  "instructions": "Take with food"
}
```

#### GET /api/medications
Retrieve user's medications

#### PUT /api/medications/:id
Update medication information

#### DELETE /api/medications/:id
Remove medication from tracking

### Water Tracking Endpoints

#### POST /api/water/add
Record water intake
```json
{
  "glasses": 2,
  "notes": "After lunch"
}
```

#### GET /api/water/today
Get today's water intake

#### GET /api/water/history
Retrieve water intake history

#### PUT /api/water/goal
Update daily water goal

### Settings Endpoints

#### GET /api/settings
Retrieve user settings

#### PUT /api/settings
Update user settings

#### POST /api/settings/change-password
Change user password

#### DELETE /api/settings/delete-account
Delete user account

## 🗄️ Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  healthProfile: {
    dateOfBirth: Date,
    gender: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  preferences: {
    theme: String,
    notifications: Boolean,
    language: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### HealthRecord Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  transcript: String,
  symptoms: [{
    name: String,
    severity: Number,
    duration: String,
    notes: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    notes: String
  }],
  aiAnalysis: {
    summary: String,
    recommendations: [String],
    urgencyLevel: String,
    confidence: Number,
    processedAt: Date
  },
  createdAt: Date
}
```

### Vitals Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  bloodPressure: {
    systolic: Number,
    diastolic: Number,
    timestamp: Date
  },
  heartRate: {
    bpm: Number,
    timestamp: Date
  },
  temperature: {
    value: Number,
    unit: String,
    timestamp: Date
  },
  weight: {
    value: Number,
    unit: String,
    timestamp: Date
  },
  aiAnalysis: {
    summary: String,
    insights: [String],
    recommendations: [String],
    riskLevel: String
  },
  createdAt: Date
}
```

### Medication Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  name: String,
  dosage: String,
  frequency: String,
  category: String,
  instructions: String,
  prescribedBy: String,
  isActive: Boolean,
  refillReminder: Boolean,
  refillDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### WaterRecord Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  date: Date,
  glasses: Number,
  dailyGoal: Number,
  notes: String,
  createdAt: Date
}
```

### UserSettings Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  theme: String,
  notifications: Boolean,
  language: String,
  waterGoal: Number,
  privacySettings: {
    shareData: Boolean,
    allowNotifications: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Frontend Components

### Core Components

#### VoiceRecorder
- Real-time speech recognition
- Audio recording and playback
- Transcript display and editing
- AI analysis integration
- Error handling and fallbacks

#### Dashboard
- Health overview with statistics
- Recent records display
- Quick actions and shortcuts
- Trend visualization
- Responsive grid layout

#### VitalsTracker
- Dynamic vital sign cards
- Color-coded status indicators
- Historical data visualization
- AI-powered insights

#### MedicationManager
- Medication CRUD operations
- Dosage tracking
- Refill reminders
- Category organization
- Prescription management

### UI Components

#### Navigation
- Responsive navbar with mobile menu
- Breadcrumb navigation
- Tab-based interface
- Search functionality

#### Forms
- Accessible form components
- Real-time validation
- Error handling
- Loading states

#### Charts
- Custom chart components
- Trend visualization
- Interactive data points
- Responsive design

## 🔧 Backend Services

### Authentication Service
- JWT token generation and validation
- Password hashing with bcrypt
- Session management
- Role-based access control

### AI Analysis Service
- Google Gemini API integration
- Natural language processing
- Symptom extraction
- Risk assessment
- Fallback analysis

### Notification Service
- Email notifications
- In-app alerts
- Reminder scheduling
- Push notifications (future)

## 🤖 AI Integration

### Google Gemini Integration
- **Model**: Gemini 1.5 Flash
- **Context Window**: 1M tokens
- **Response Format**: Structured JSON
- **Error Handling**: Graceful fallbacks
- **Rate Limiting**: Intelligent throttling

### Analysis Capabilities
- **Symptom Recognition**: Identifies 100+ common symptoms
- **Severity Assessment**: 1-10 scale with medical context
- **Medication Detection**: Recognizes brand and generic names
- **Urgency Classification**: Medical risk assessment
- **Recommendation Generation**: Evidence-based advice

### Fallback System
- **Offline Analysis**: Basic symptom matching
- **Medical Guidelines**: Standard health protocols
- **Error Recovery**: Graceful degradation
- **User Feedback**: Continuous improvement

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure stateless authentication
- **Password Security**: bcrypt hashing with salt
- **Session Management**: Automatic token refresh
- **Access Control**: User-specific data isolation

### Data Protection
- **Encryption**: AES-256 for sensitive data
- **HTTPS**: TLS 1.3 encryption in transit
- **Input Validation**: Comprehensive sanitization
- **SQL Injection Prevention**: Parameterized queries

### Privacy Compliance
- **GDPR Compliance**: Full data portability
- **Data Minimization**: Only necessary data collection
- **User Consent**: Explicit permission management
- **Right to Deletion**: Complete data removal

## ♿ Accessibility Features

### Visual Accessibility
- **High Contrast Mode**: Enhanced visibility
- **Color Blind Support**: Non-color-dependent indicators
- **Font Scaling**: Responsive text sizing
- **Focus Indicators**: Clear navigation feedback

### Auditory Accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **Audio Descriptions**: Contextual audio cues
- **Volume Controls**: Adjustable audio levels
- **Transcript Display**: Visual speech feedback

### Motor Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Voice Commands**: Hands-free operation
- **Large Touch Targets**: Mobile-friendly buttons
- **Gesture Support**: Alternative input methods

### Cognitive Accessibility
- **Clear Language**: Simple, medical terminology
- **Consistent Layout**: Predictable interface
- **Error Prevention**: Validation and confirmation
- **Help System**: Contextual assistance

## 🧪 Testing

### Frontend Testing
- **Unit Tests**: Jest with React Testing Library
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Cypress for user workflows
- **Accessibility Tests**: axe-core integration

### Backend Testing
- **Unit Tests**: Jest for service functions
- **Integration Tests**: API endpoint testing
- **Database Tests**: MongoDB integration testing
- **Security Tests**: Authentication and authorization

### AI Testing
- **Accuracy Testing**: Symptom recognition validation
- **Performance Testing**: Response time optimization
- **Fallback Testing**: Offline functionality verification
- **User Acceptance**: Real-world scenario testing

## 🚀 Deployment

### Environment Setup
```bash
# Production build (from root directory)
npm run build

# Start production servers
npm start
```
## 📄 License

This project is licensed under the MIT License

**VoiceVitals** - Making healthcare accessible through voice technology. 🎤❤️
