export interface VoiceRecordingState {
  isRecording: boolean
  transcript: string
  isSupported: boolean
  response: string | ApiResponse | null // More specific typing
  isProcessing: boolean
  error: string
  audioBlob: Blob | null
  audioUrl: string
}

export interface ApiResponse {
  status: string
  data: {
    healthRecord: {
      _id: string
      transcript: string
      symptoms: Array<{
        name: string
        severity: number
        duration: string
        notes: string
      }>
      medications: Array<{
        name: string
        dosage: string
        frequency: string
        notes: string
      }>
      aiAnalysis: {
        summary: string
        recommendations: string[]
        urgencyLevel: 'low' | 'medium' | 'high' | 'urgent'
        confidence: number
        processedAt: string
      }
      createdAt: string
      updatedAt: string
    }
  }
}

export interface Feature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: string
}

export interface SocialLink {
  icon: React.ComponentType<{ className?: string }>
  href: string
  label: string
}

export interface NavigationLink {
  label: string
  href: string
}

export interface Medication {
  _id: string
  user: string
  name: string
  dosage: string
  frequency: string
  instructions?: string
  startDate: string
  endDate?: string
  isActive: boolean
  category: 'prescription' | 'over-the-counter' | 'supplement' | 'other'
  sideEffects?: string[]
  notes?: string
  prescribedBy?: string
  pharmacy?: string
  refillReminder: boolean
  refillDate?: string
  createdAt: string
  updatedAt: string
}

export interface MedicationFormData {
  name: string
  dosage: string
  frequency: string
  instructions?: string
  startDate: string
  endDate?: string
  category: 'prescription' | 'over-the-counter' | 'supplement' | 'other'
  sideEffects?: string[]
  notes?: string
  prescribedBy?: string
  pharmacy?: string
  refillReminder: boolean
  refillDate?: string
}

// Speech Recognition API types
export interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: {
    transcript: string
    confidence: number
  }
}

export interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResult[]
}

export interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}

export interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onend: () => void
  start: () => void
  stop: () => void
}

export interface Vitals {
  _id: string
  user: string
  bloodPressure: {
    systolic: number
    diastolic: number
  }
  heartRate: number
  temperature: number
  oxygenSaturation: number
  weight: number
  height: number
  bmi: number
  recordedAt: string
  createdAt: string
  updatedAt: string
}

export interface HealthRecord {
  _id: string
  user: string
  transcript: string
  symptoms: Array<{
    name: string
    severity: number
    duration: string
    notes: string
  }>
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    notes: string
  }>
  aiAnalysis: {
    summary: string
    recommendations: string[]
    urgencyLevel: 'low' | 'medium' | 'high' | 'urgent'
    confidence: number
    processedAt: string
  }
  createdAt: string
  updatedAt: string
}

export interface WaterRecord {
  _id: string
  user: string
  glasses: number
  dailyGoal: number
  date: string
  createdAt: string
  updatedAt: string
}

export interface User {
  _id: string
  email: string
  name: string
  dateOfBirth?: string
  gender?: string
  phone?: string
  address?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  preferences?: {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    language: string
  }
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  _id: string
  user: string
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  language: string
  waterGoal: number
  privacySettings: {
    shareData: boolean
    allowNotifications: boolean
  }
  createdAt: string
  updatedAt: string
}
