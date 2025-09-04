'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Heart, 
  Thermometer, 
  Activity, 
  Weight,
  Plus,
  TrendingUp,
  Trash2,
  ChevronLeft,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Download,
  Share2,
  Brain,
  ArrowLeft
} from 'lucide-react'




interface VitalsRecord {
  _id: string
  bloodPressure?: {
    systolic: number
    diastolic: number
    timestamp: Date
  }
  heartRate?: {
    bpm: number
    timestamp: Date
  }
  temperature?: {
    value: number
    unit: 'celsius' | 'fahrenheit'
    timestamp: Date
  }
  weight?: {
    value: number
    unit: 'kg' | 'lbs'
    timestamp: Date
  }

  aiAnalysis?: {
    summary: string
    insights: string[]
    recommendations: string[]
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  }

  createdAt: string
  updatedAt: string
}

export default function VitalsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<VitalsRecord[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [regeneratingAnalysis, setRegeneratingAnalysis] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    bloodPressure: { systolic: '', diastolic: '' },
    heartRate: '',
    temperature: '',
    temperatureUnit: 'celsius' as 'celsius' | 'fahrenheit',
    weight: '',
    weightUnit: 'kg' as 'kg' | 'lbs'
  })
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [stats, setStats] = useState({
    lastBloodPressure: { systolic: 0, diastolic: 0, timestamp: null as Date | null },
    lastHeartRate: { bpm: 0, timestamp: null as Date | null },
    lastTemperature: { value: 0, unit: 'celsius' as 'celsius' | 'fahrenheit', timestamp: null as Date | null },
    lastWeight: { value: 0, unit: 'kg' as 'kg' | 'lbs', timestamp: null as Date | null },
    trends: {
      bloodPressure: 'stable',
      heartRate: 'stable',
      temperature: 'stable',
      weight: 'stable'
    }
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    fetchVitalsRecords()
  }, [user, router, authLoading])

  const fetchVitalsRecords = async () => {
    try {
      const token = localStorage.getItem('token')
      
          const response = await fetch(`https://web-production-508d.up.railway.app/api/vitals`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

      if (response.ok) {
        const data = await response.json()
        
        setRecords(data.data.vitals)
        calculateStats(data.data.vitals)
      } else {
        console.error('❌ Vitals endpoint failed:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Error data:', errorData)
      }
    } catch (error) {
      console.error('❌ Error fetching vitals records:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (records: VitalsRecord[]) => {
    if (records.length === 0) {
      return
    }

    const latestRecord = records[0]
    const previousRecord = records[1]

    const newStats = {
      lastBloodPressure: { systolic: 0, diastolic: 0, timestamp: null as Date | null },
      lastHeartRate: { bpm: 0, timestamp: null as Date | null },
      lastTemperature: { value: 0, unit: 'celsius' as 'celsius' | 'fahrenheit', timestamp: null as Date | null },
      lastWeight: { value: 0, unit: 'kg' as 'kg' | 'lbs', timestamp: null as Date | null },
      trends: {
        bloodPressure: 'stable' as 'stable' | 'increasing' | 'decreasing',
        heartRate: 'stable' as 'stable' | 'increasing' | 'decreasing',
        temperature: 'stable' as 'stable' | 'increasing' | 'decreasing',
        weight: 'stable' as 'stable' | 'increasing' | 'decreasing'
      }
    }

    if (latestRecord.bloodPressure) {
      newStats.lastBloodPressure = latestRecord.bloodPressure
    }
    if (latestRecord.heartRate) {
      newStats.lastHeartRate = latestRecord.heartRate
    }
    if (latestRecord.temperature) {
      newStats.lastTemperature = latestRecord.temperature
    }
    if (latestRecord.weight) {
      newStats.lastWeight = latestRecord.weight
    }

    // Calculate trends if we have previous data
    if (previousRecord) {
      if (latestRecord.bloodPressure && previousRecord.bloodPressure) {
        const currentBP = latestRecord.bloodPressure.systolic
        const previousBP = previousRecord.bloodPressure.systolic
        newStats.trends.bloodPressure = currentBP > previousBP ? 'increasing' : currentBP < previousBP ? 'decreasing' : 'stable'
      }
      if (latestRecord.heartRate && previousRecord.heartRate) {
        const currentHR = latestRecord.heartRate.bpm
        const previousHR = previousRecord.heartRate.bpm
        newStats.trends.heartRate = currentHR > previousHR ? 'increasing' : currentHR < previousHR ? 'decreasing' : 'stable'
      }
    }

    setStats(newStats)
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    // Check if at least one vital sign is provided
    const hasVitals = formData.bloodPressure.systolic || formData.bloodPressure.diastolic || 
                     formData.heartRate || formData.temperature || formData.weight
    
    if (!hasVitals) {
      errors.general = 'Please provide at least one vital sign'
    }
    
    // Validate blood pressure
    if (formData.bloodPressure.systolic && formData.bloodPressure.diastolic) {
      const systolic = parseInt(formData.bloodPressure.systolic)
      const diastolic = parseInt(formData.bloodPressure.diastolic)
      
      if (systolic < 70 || systolic > 200) {
        errors.systolic = 'Systolic pressure should be between 70-200 mmHg'
      }
      if (diastolic < 40 || diastolic > 130) {
        errors.diastolic = 'Diastolic pressure should be between 40-130 mmHg'
      }
      if (systolic <= diastolic) {
        errors.bloodPressure = 'Systolic pressure must be higher than diastolic pressure'
      }
    } else if (formData.bloodPressure.systolic || formData.bloodPressure.diastolic) {
      errors.bloodPressure = 'Please provide both systolic and diastolic values'
    }
    
    // Validate heart rate
    if (formData.heartRate) {
      const hr = parseInt(formData.heartRate)
      if (hr < 40 || hr > 200) {
        errors.heartRate = 'Heart rate should be between 40-200 BPM'
      }
    }
    
    // Validate temperature
    if (formData.temperature) {
      const temp = parseFloat(formData.temperature)
      if (formData.temperatureUnit === 'celsius') {
        if (temp < 30 || temp > 45) {
          errors.temperature = 'Temperature should be between 30-45°C'
        }
      } else {
        if (temp < 86 || temp > 113) {
          errors.temperature = 'Temperature should be between 86-113°F'
        }
      }
    }
    
    // Validate weight
    if (formData.weight) {
      const weight = parseFloat(formData.weight)
      if (formData.weightUnit === 'kg') {
        if (weight < 20 || weight > 300) {
          errors.weight = 'Weight should be between 20-300 kg'
        }
      } else {
        if (weight < 44 || weight > 660) {
          errors.weight = 'Weight should be between 44-660 lbs'
        }
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      const vitalsData: any = {}
      
      if (formData.bloodPressure.systolic && formData.bloodPressure.diastolic) {
        vitalsData.bloodPressure = {
          systolic: parseInt(formData.bloodPressure.systolic),
          diastolic: parseInt(formData.bloodPressure.diastolic),
          timestamp: new Date()
        }
      }
      
      if (formData.heartRate) {
        vitalsData.heartRate = {
          bpm: parseInt(formData.heartRate),
          timestamp: new Date()
        }
      }
      
      if (formData.temperature) {
        vitalsData.temperature = {
          value: parseFloat(formData.temperature),
          unit: formData.temperatureUnit,
          timestamp: new Date()
        }
      }
      
      if (formData.weight) {
        vitalsData.weight = {
          value: parseFloat(formData.weight),
          unit: formData.weightUnit,
          timestamp: new Date()
        }
      }

      // Create a new vitals record
      const response = await fetch(`https://web-production-508d.up.railway.app/api/vitals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vitalsData)
      })

      if (response.ok) {
        setShowAddForm(false)
        setFormData({
          bloodPressure: { systolic: '', diastolic: '' },
          heartRate: '',
          temperature: '',
          temperatureUnit: 'celsius',
          weight: '',
          weightUnit: 'kg'
        })
        setFormErrors({})
        setShowSuccess(true)
        fetchVitalsRecords()
        
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        const errorData = await response.json()
        setFormErrors({ general: errorData.message || 'Failed to save vitals' })
      }
    } catch (error) {
      console.error('Error saving vitals:', error)
      setFormErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }



  const handleDelete = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://web-production-508d.up.railway.app/api/vitals/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchVitalsRecords()
      }
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  const handleRegenerateAnalysis = async (recordId: string) => {
    if (!confirm('Regenerate AI analysis for this record?')) return
    
    setRegeneratingAnalysis(recordId)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please log in to regenerate analysis')
        return
      }

      const response = await fetch(`https://web-production-508d.up.railway.app/api/vitals/${recordId}/regenerate-analysis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Analysis regenerated successfully:', result)
        fetchVitalsRecords()
        // Show success message
        alert('AI analysis regenerated successfully!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to regenerate analysis:', response.status, errorData)
        
        // Provide user-friendly error messages
        let errorMessage = errorData.message || 'Unknown error occurred'
        if (errorData.message?.includes('No vitals data')) {
          errorMessage = 'This record has no vitals data to analyze'
        } else if (errorData.message?.includes('configuration error')) {
          errorMessage = 'AI service is not properly configured. Please contact support.'
        } else if (errorData.message?.includes('temporarily unavailable')) {
          errorMessage = 'AI service is temporarily unavailable. Please try again later.'
        } else if (errorData.message?.includes('parsing error')) {
          errorMessage = 'There was an issue processing the AI response. Please try again.'
        }
        
        alert(`Failed to regenerate analysis: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error regenerating analysis:', error)
      alert('Network error occurred. Please check your connection and try again.')
    } finally {
      setRegeneratingAnalysis(null)
    }
  }



  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'decreasing':
        return <TrendingUp className="w-4 h-4 text-green-500 transform rotate-180" />
      default:
        return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'decreasing':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 dark:text-slate-400 font-medium">Loading vitals data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Back to Dashboard Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Vital Signs</h1>
              <p className="text-slate-600 dark:text-slate-400">Track your health measurements</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Add Vitals
          </button>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className={`rounded-2xl p-6 border shadow-sm ${
            stats.lastBloodPressure.systolic && stats.lastBloodPressure.diastolic && 
            (stats.lastBloodPressure.systolic >= 140 || stats.lastBloodPressure.diastolic >= 90)
              ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
              : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stats.lastBloodPressure.systolic && stats.lastBloodPressure.diastolic && 
                (stats.lastBloodPressure.systolic >= 140 || stats.lastBloodPressure.diastolic >= 90)
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                <Activity className={`w-6 h-6 ${
                  stats.lastBloodPressure.systolic && stats.lastBloodPressure.diastolic && 
                  (stats.lastBloodPressure.systolic >= 140 || stats.lastBloodPressure.diastolic >= 90)
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`} />
              </div>
              {getTrendIcon(stats.trends.bloodPressure)}
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              {stats.lastBloodPressure.systolic && stats.lastBloodPressure.diastolic 
                ? `${stats.lastBloodPressure.systolic}/${stats.lastBloodPressure.diastolic}`
                : '--/--'
              }
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Blood Pressure (mmHg)</p>
            {stats.lastBloodPressure.timestamp && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Last: {new Date(stats.lastBloodPressure.timestamp).toLocaleDateString()}
              </p>
            )}
            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
              stats.lastBloodPressure.systolic && stats.lastBloodPressure.diastolic && 
              (stats.lastBloodPressure.systolic >= 140 || stats.lastBloodPressure.diastolic >= 90)
                ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
                : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
            }`}>
              {stats.lastBloodPressure.systolic && stats.lastBloodPressure.diastolic && 
               (stats.lastBloodPressure.systolic >= 140 || stats.lastBloodPressure.diastolic >= 90)
                ? 'Elevated'
                : 'Normal'
              }
            </span>
          </div>

          <div className={`rounded-2xl p-6 border shadow-sm ${
            stats.lastHeartRate.bpm && 
            (stats.lastHeartRate.bpm > 100 || stats.lastHeartRate.bpm < 60)
              ? stats.lastHeartRate.bpm > 100 
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
                : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
              : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stats.lastHeartRate.bpm && 
                (stats.lastHeartRate.bpm > 100 || stats.lastHeartRate.bpm < 60)
                  ? stats.lastHeartRate.bpm > 100 
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                <Heart className={`w-6 h-6 ${
                  stats.lastHeartRate.bpm && 
                  (stats.lastHeartRate.bpm > 100 || stats.lastHeartRate.bpm < 60)
                    ? stats.lastHeartRate.bpm > 100 
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                    : 'text-green-600 dark:text-green-400'
                }`} />
              </div>
              {getTrendIcon(stats.trends.heartRate)}
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              {stats.lastHeartRate.bpm ? stats.lastHeartRate.bpm : '--'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Heart Rate (BPM)</p>
            {stats.lastHeartRate.timestamp && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Last: {new Date(stats.lastHeartRate.timestamp).toLocaleDateString()}
              </p>
            )}
            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
              stats.lastHeartRate.bpm && 
              (stats.lastHeartRate.bpm > 100 || stats.lastHeartRate.bpm < 60)
                ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
                : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
            }`}>
              {stats.lastHeartRate.bpm && 
               (stats.lastHeartRate.bpm > 100 || stats.lastHeartRate.bpm < 60)
                ? (stats.lastHeartRate.bpm > 100 ? 'Elevated' : 'Low')
                : 'Normal'
              }
            </span>
          </div>

          <div className={`rounded-2xl p-6 border shadow-sm ${
            stats.lastTemperature.value && 
            (stats.lastTemperature.value >= 38.0 || stats.lastTemperature.value < 35.0)
              ? stats.lastTemperature.value >= 38.0 
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
                : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
              : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stats.lastTemperature.value && 
                (stats.lastTemperature.value >= 38.0 || stats.lastTemperature.value < 35.0)
                  ? stats.lastTemperature.value >= 38.0 
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                <Thermometer className={`w-6 h-6 ${
                  stats.lastTemperature.value && 
                  (stats.lastTemperature.value >= 38.0 || stats.lastTemperature.value < 35.0)
                    ? stats.lastTemperature.value >= 38.0 
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                    : 'text-green-600 dark:text-green-400'
                }`} />
              </div>
              {getTrendIcon(stats.trends.temperature)}
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              {stats.lastTemperature.value ? `${stats.lastTemperature.value}°${stats.lastTemperature.unit === 'celsius' ? 'C' : 'F'}` : '--'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Temperature</p>
            {stats.lastTemperature.timestamp && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Last: {new Date(stats.lastTemperature.timestamp).toLocaleDateString()}
              </p>
            )}
            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
              stats.lastTemperature.value && 
              (stats.lastTemperature.value >= 38.0 || stats.lastTemperature.value < 35.0)
                ? stats.lastTemperature.value >= 38.0 
                  ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
                  : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700'
                : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
            }`}>
              {stats.lastTemperature.value && 
               (stats.lastTemperature.value >= 38.0 || stats.lastTemperature.value < 35.0)
                ? stats.lastTemperature.value >= 38.0 
                  ? 'Elevated'
                  : 'Low'
                : 'Normal'
              }
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Weight className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              {getTrendIcon(stats.trends.weight)}
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              {stats.lastWeight.value ? `${stats.lastWeight.value} ${stats.lastWeight.unit}` : '--'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Weight</p>
            {stats.lastWeight.timestamp && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Last: {new Date(stats.lastWeight.timestamp).toLocaleDateString()}
              </p>
            )}
            <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
              Tracked
            </span>
          </div>
        </motion.div>

        {/* Vital Signs Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50 p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Normal Vital Sign Ranges</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Reference values for healthy adults</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-red-600" />
                <span className="font-medium text-slate-800 dark:text-slate-200">Blood Pressure</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Normal: &lt;120/80 mmHg</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">Elevated: 120-129/&lt;80</p>
            </div>
            
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-600" />
                <span className="font-medium text-slate-800 dark:text-slate-200">Heart Rate</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Normal: 60-100 BPM</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">Elevated: &gt;100 BPM</p>
            </div>
            
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-slate-800 dark:text-slate-200">Temperature</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Normal: 36.5-37.5°C</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">Elevated: &gt;37.5°C</p>
            </div>
            
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Weight className="w-4 h-4 text-green-600" />
                <span className="font-medium text-slate-800 dark:text-slate-200">Weight</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Varies by individual</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">Monitor trends over time</p>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-8"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200 font-medium">Vitals saved successfully!</span>
            </div>
          </motion.div>
        )}

        {/* Add Vitals Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add New Vitals</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  AI will analyze your vitals and provide personalized insights
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Messages */}
              {formErrors.general && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-200 font-medium">{formErrors.general}</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blood Pressure */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Blood Pressure (mmHg)
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Systolic"
                        value={formData.bloodPressure.systolic}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          bloodPressure: { ...prev.bloodPressure, systolic: e.target.value }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                          formErrors.systolic ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                        }`}
                      />
                      {formErrors.systolic && (
                        <p className="text-red-600 dark:text-red-400 text-xs mt-1">{formErrors.systolic}</p>
                      )}
                    </div>
                    <span className="text-slate-400 self-center">/</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Diastolic"
                        value={formData.bloodPressure.diastolic}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          bloodPressure: { ...prev.bloodPressure, diastolic: e.target.value }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                          formErrors.diastolic ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                        }`}
                      />
                      {formErrors.diastolic && (
                        <p className="text-red-600 dark:text-red-400 text-xs mt-1">{formErrors.diastolic}</p>
                      )}
                    </div>
                  </div>
                  {(formErrors.bloodPressure || formErrors.systolic || formErrors.diastolic) && (
                    <p className="text-red-600 dark:text-red-400 text-xs">{formErrors.bloodPressure}</p>
                  )}
                </div>

                {/* Heart Rate */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter heart rate"
                    value={formData.heartRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, heartRate: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                      formErrors.heartRate ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  />
                  {formErrors.heartRate && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{formErrors.heartRate}</p>
                  )}
                </div>

                {/* Temperature */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Temperature
                  </label>
                  <div className="flex gap-3">
                                         <input
                       type="number"
                       step="0.1"
                       placeholder="Enter temperature"
                       value={formData.temperature}
                       onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                       className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                         formErrors.temperature ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                       }`}
                     />
                    <select
                      value={formData.temperatureUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, temperatureUnit: e.target.value as 'celsius' | 'fahrenheit' }))}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    >
                                             <option value="celsius">°C</option>
                       <option value="fahrenheit">°F</option>
                     </select>
                   </div>
                   {formErrors.temperature && (
                     <p className="text-red-600 dark:text-red-400 text-xs mt-1">{formErrors.temperature}</p>
                   )}
                </div>

                {/* Weight */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Weight
                  </label>
                  <div className="flex gap-3">
                                         <input
                       type="number"
                       step="0.1"
                       placeholder="Enter weight"
                       value={formData.weight}
                       onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                       className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                         formErrors.weight ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                       }`}
                     />
                    <select
                      value={formData.weightUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, weightUnit: e.target.value as 'kg' | 'lbs' }))}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    >
                                             <option value="kg">kg</option>
                       <option value="lbs">lbs</option>
                     </select>
                   </div>
                   {formErrors.weight && (
                     <p className="text-red-600 dark:text-red-400 text-xs mt-1">{formErrors.weight}</p>
                   )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Vitals
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Vitals History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                  <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Vitals History</h2>
                <p className="text-slate-600 dark:text-slate-400">Track your vital signs over time</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {records.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No vitals recorded yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Start tracking your vital signs to monitor your health.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Vitals
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record, index) => (
                  <motion.div
                    key={record._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">Vitals Record</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(record.createdAt).toLocaleDateString()} at {new Date(record.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRegenerateAnalysis(record._id)}
                          disabled={regeneratingAnalysis === record._id}
                          className="p-2 text-blue-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Regenerate AI Analysis"
                        >
                          {regeneratingAnalysis === record._id ? (
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Brain className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {record.bloodPressure && (
                        <div className={`border rounded-lg p-3 ${
                          (record.bloodPressure.systolic >= 140 || record.bloodPressure.diastolic >= 90)
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className={`w-4 h-4 ${
                              (record.bloodPressure.systolic >= 140 || record.bloodPressure.diastolic >= 90)
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-green-600 dark:text-green-400'
                            }`} />
                            <span className={`text-sm font-medium ${
                              (record.bloodPressure.systolic >= 140 || record.bloodPressure.diastolic >= 90)
                                ? 'text-red-800 dark:text-red-300'
                                : 'text-green-800 dark:text-green-300'
                            }`}>Blood Pressure</span>
                          </div>
                          <p className={`text-lg font-bold ${
                            (record.bloodPressure.systolic >= 140 || record.bloodPressure.diastolic >= 90)
                              ? 'text-red-900 dark:text-red-100'
                              : 'text-green-900 dark:text-green-100'
                          }`}>
                            {record.bloodPressure.systolic}/{record.bloodPressure.diastolic}
                          </p>
                          <p className={`text-xs ${
                            (record.bloodPressure.systolic >= 140 || record.bloodPressure.diastolic >= 90)
                              ? 'text-red-700 dark:text-red-400'
                              : 'text-green-700 dark:text-green-400'
                          }`}>mmHg</p>
                        </div>
                      )}

                      {record.heartRate && (
                        <div className={`border rounded-lg p-3 ${
                          record.heartRate.bpm > 100 
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : record.heartRate.bpm < 60
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className={`w-4 h-4 ${
                              record.heartRate.bpm > 100 
                                ? 'text-red-600 dark:text-red-400'
                                : record.heartRate.bpm < 60
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-green-600 dark:text-green-400'
                            }`} />
                            <span className={`text-sm font-medium ${
                              record.heartRate.bpm > 100 
                                ? 'text-red-800 dark:text-red-300'
                                : record.heartRate.bpm < 60
                                ? 'text-blue-800 dark:text-blue-300'
                                : 'text-green-800 dark:text-green-300'
                            }`}>Heart Rate</span>
                          </div>
                          <p className={`text-lg font-bold ${
                            record.heartRate.bpm > 100 
                              ? 'text-red-900 dark:text-red-100'
                              : record.heartRate.bpm < 60
                              ? 'text-blue-900 dark:text-blue-100'
                              : 'text-green-900 dark:text-green-100'
                          }`}>
                            {record.heartRate.bpm}
                          </p>
                          <p className={`text-xs ${
                            record.heartRate.bpm > 100 
                              ? 'text-red-700 dark:text-red-400'
                              : record.heartRate.bpm < 60
                              ? 'text-blue-700 dark:text-blue-400'
                              : 'text-green-700 dark:text-green-400'
                          }`}>BPM</p>
                        </div>
                      )}

                      {record.temperature && (
                        <div className={`border rounded-lg p-3 ${
                          record.temperature.value >= 38.0 
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : record.temperature.value < 35.0
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Thermometer className={`w-4 h-4 ${
                              record.temperature.value >= 38.0 
                                ? 'text-red-600 dark:text-red-400'
                                : record.temperature.value < 35.0
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-green-600 dark:text-green-400'
                            }`} />
                            <span className={`text-sm font-medium ${
                              record.temperature.value >= 38.0 
                                ? 'text-red-800 dark:text-red-300'
                                : record.temperature.value < 35.0
                                ? 'text-blue-800 dark:text-blue-300'
                                : 'text-green-800 dark:text-green-300'
                            }`}>Temperature</span>
                          </div>
                          <p className={`text-lg font-bold ${
                            record.temperature.value >= 38.0 
                              ? 'text-red-900 dark:text-red-100'
                              : record.temperature.value < 35.0
                              ? 'text-blue-900 dark:text-blue-100'
                              : 'text-green-900 dark:text-green-100'
                          }`}>
                            {record.temperature.value}°{record.temperature.unit === 'celsius' ? 'C' : 'F'}
                          </p>
                          <p className={`text-xs ${
                            record.temperature.value >= 38.0 
                              ? 'text-red-700 dark:text-red-400'
                              : record.temperature.value < 35.0
                              ? 'text-blue-700 dark:text-blue-400'
                              : 'text-green-700 dark:text-green-400'
                          }`}>Temperature</p>
                        </div>
                      )}

                      {record.weight && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Weight className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-300">Weight</span>
                          </div>
                          <p className="text-lg font-bold text-green-900 dark:text-green-100">
                            {record.weight.value}
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-400">{record.weight.unit}</p>
                        </div>
                      )}
                    </div>

                    {/* AI Insights Section */}
                    {record.aiAnalysis ? (
                      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                            <Brain className="w-4 h-4 text-purple-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200">AI Health Insights</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Personalized analysis of your vitals</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.aiAnalysis.riskLevel === 'critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                            record.aiAnalysis.riskLevel === 'high' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                            record.aiAnalysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {record.aiAnalysis.riskLevel.toUpperCase()} RISK
                          </span>
                        </div>

                        {/* Summary */}
                        <div className="mb-4">
                          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                            {record.aiAnalysis.summary || 'No summary available'}
                          </p>
                        </div>

                        {/* Insights and Recommendations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Key Insights */}
                          <div>
                            <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2 text-sm">Key Insights</h5>
                            <ul className="space-y-1">
                              {record.aiAnalysis.insights && record.aiAnalysis.insights.length > 0 ? (
                                record.aiAnalysis.insights.map((insight, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                                    {insight}
                                  </li>
                                ))
                              ) : (
                                <li className="text-xs text-slate-500 dark:text-slate-500 italic">No insights available</li>
                              )}
                            </ul>
                          </div>

                          {/* Recommendations */}
                          <div>
                            <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2 text-sm">Recommendations</h5>
                            <ul className="space-y-1">
                              {record.aiAnalysis.recommendations && record.aiAnalysis.recommendations.length > 0 ? (
                                record.aiAnalysis.recommendations.map((rec, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                                    {rec}
                                  </li>
                                ))
                              ) : (
                                <li className="text-xs text-slate-500 dark:text-slate-500 italic">No recommendations available</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                            <Brain className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-600 dark:text-slate-400">AI Analysis Not Available</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-500">This record hasn't been analyzed by AI yet</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
