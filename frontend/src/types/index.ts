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
