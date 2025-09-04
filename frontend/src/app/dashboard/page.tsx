'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Heart, 
  Mic, 
  Activity, 
  Settings, 
  LogOut, 
  Plus,
  TrendingUp,
  AlertCircle,
  Clock,
  User,
  FileText,
  Bell,
  Zap,
  Target,
  Pill,
  Stethoscope,
  Droplets,
  Search,
  ChevronRight,
  Eye,
  X
} from 'lucide-react'
import { Medication } from '@/types'

interface HealthRecord {
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
}

interface VitalsRecord {
  _id: string
  bloodPressure?: {
    systolic: number
    diastolic: number
    timestamp: string
  }
  heartRate?: {
    bpm: number
    timestamp: string
  }
  temperature?: {
    value: number
    unit: 'celsius' | 'fahrenheit'
    timestamp: string
  }
  weight?: {
    value: number
    unit: 'kg' | 'lbs'
    timestamp: string
  }
  aiAnalysis?: {
    summary: string
    insights: string[]
    recommendations: string[]
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  }
  createdAt: string
}

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [vitals, setVitals] = useState<VitalsRecord[]>([])
  const [stats, setStats] = useState({
    totalRecords: 0,
    streakDays: 0, // Start with 0, not 7
    todayWater: 0,
    waterGoal: 8,
    activeMedications: 0
  })
  // Removed waterLoading state to prevent glitching
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredRecords, setFilteredRecords] = useState<HealthRecord[]>([])

  const fetchMedications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('https://web-production-508d.up.railway.app/api/medications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // Ensure we have an array of medications
        const medicationsData = Array.isArray(data) ? data : (data.data?.medications || [])
        
        setMedications(medicationsData)
        
        // Recalculate stats when medications are loaded
        const activeCount = medicationsData.filter((m: any) => m.isActive).length
        
        // Force a re-render by updating stats
        setStats(prev => ({
          ...prev,
          activeMedications: activeCount
        }))
      }
    } catch (error) {
      console.error('Error fetching medications:', error)
    }
  }, [])

  const fetchVitals = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('https://web-production-508d.up.railway.app/api/vitals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Vitals data comes in nested structure: data.data.vitals
        const vitalsData = data.data?.vitals || data.vitals || (Array.isArray(data) ? data : [])
        setVitals(vitalsData)
      } else {
        console.error('Failed to fetch vitals:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching vitals:', error)
      setVitals([]) // Set empty array on error
    }
  }, [])

  const fetchTodayWater = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        return
      }

      const response = await fetch('https://web-production-508d.up.railway.app/api/water/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const waterRecord = data.data.waterRecord
        
        // Get today's water intake in glasses
        const cupsToday = waterRecord.glasses
        
        setStats(prev => ({
          ...prev,
          todayWater: cupsToday,
          waterGoal: waterRecord.dailyGoal
        }))
      } else {
        console.error('Water API failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching today\'s water:', error)
    }
  }, [])

  // Quick water logging function
  const addQuickWater = useCallback(async (amount: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No auth token found')
        return
      }

      const response = await fetch('https://web-production-508d.up.railway.app/api/water/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          glasses: amount,
          notes: `Quick log: Drank ${amount} glass${amount > 1 ? 'es' : ''} of water`
        })
      })

      if (response.ok) {
        // Update water count immediately for instant feedback
        setStats(prev => ({
          ...prev,
          todayWater: prev.todayWater + amount
        }))
        
        // Then fetch fresh data in background
        setTimeout(() => {
          fetchTodayWater()
        }, 100)
      } else {
        console.error('Failed to log water intake')
      }
    } catch (error) {
      console.error('Error adding water:', error)
    }
  }, [fetchTodayWater])



  const fetchHealthRecords = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        return
      }

      const response = await fetch(`https://web-production-508d.up.railway.app/api/health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        const healthRecords = data.data?.records || data.records || []
        
        setRecords(healthRecords)
        
        // Calculate real stats from actual data
        const total = healthRecords.length
        
        const urgent = healthRecords.filter((r: HealthRecord) => 
          r.aiAnalysis?.urgencyLevel === 'urgent' || r.aiAnalysis?.urgencyLevel === 'high'
        ).length
        
        // Calculate true consecutive day streak
        const calculateStreak = (records: HealthRecord[]) => {
          if (records.length === 0) {
            return 0
          }
          
          // Get unique dates from records
          const uniqueDates = new Set()
          records.forEach(record => {
            const date = new Date(record.createdAt)
            date.setHours(0, 0, 0, 0)
            uniqueDates.add(date.toDateString())
          })
          
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          let streak = 0
          let currentDate = new Date(today)
          
          // Check consecutive days starting from today
          while (true) {
            const dateString = currentDate.toDateString()
            const hasRecord = uniqueDates.has(dateString)
            
            if (hasRecord) {
              streak++
              currentDate.setDate(currentDate.getDate() - 1)
            } else {
              break
            }
          }
          
          return streak
        }
        
        const streakDays = calculateStreak(healthRecords)
        

        
        setStats(prev => ({
          totalRecords: total,
          streakDays: streakDays,
          todayWater: prev.todayWater, // Preserve existing water data
          waterGoal: prev.waterGoal, // Preserve existing water goal
          activeMedications: Array.isArray(medications) ? medications.filter((m: any) => m.isActive).length : 0
        }))
      } else {
        console.error('Failed to fetch health records:', response.status, response.statusText)
        // Set default stats if health records fail
        setStats(prev => ({
          ...prev,
          totalRecords: 0
        }))
      }
    } catch (error) {
      console.error('Error fetching health records:', error)
      // Set default stats on error
      setStats(prev => ({
        ...prev,
        totalRecords: 0
      }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    
    // Only fetch data once when component mounts
    const fetchData = async () => {
      await Promise.all([
        fetchHealthRecords(),
        fetchMedications(),
        fetchVitals(),
        fetchTodayWater()
      ])
    }
    
    fetchData()
  }, [user, authLoading]) // Remove function dependencies to prevent infinite loops

  // Refresh data when component comes into focus (for real-time updates)
  useEffect(() => {
    const handleFocus = () => {
      if (user && !authLoading) {
        fetchHealthRecords()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user, authLoading])

  // Update active medications count when medications change
  useEffect(() => {
    if (medications.length > 0) {
      const activeCount = medications.filter((m: any) => m.isActive).length
      
      setStats(prev => ({
        ...prev,
        activeMedications: activeCount
      }))
    }
  }, [medications])

  // Update total records count when records change
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalRecords: records.length
    }))
  }, [records])

  // Filter records based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records)
      return
    }
    
    const filtered = records.filter(record =>
      record.transcript.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.symptoms.some(symptom => 
        symptom.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (record.medications && record.medications.some(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    )
    setFilteredRecords(filtered)
  }, [searchTerm, records])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 dark:text-slate-400 font-medium">Loading your health dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100">VoiceVitals</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here's your health summary and recent voice recordings.
          </p>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{stats.totalRecords}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Total Records</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium">+12% this month</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{stats.activeMedications}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Active Medications</p>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs text-purple-600 font-medium">
                  {stats.activeMedications > 0 ? `${stats.activeMedications} medications tracked` : 'No active medications'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{stats.streakDays}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Day Streak</p>
            {stats.streakDays === 0 ? (
              <div className="mt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">Create a health record today to start your streak!</p>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-1">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full ${i < stats.streakDays ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                  ></div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              {stats.todayWater || 0}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Cups Today</p>
            <div className="mt-3">
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.todayWater || 0) / (stats.waterGoal || 8) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                Goal: {stats.waterGoal || 8} cups
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'medications', label: 'Medications', icon: Pill },
                { id: 'vitals', label: 'Vitals', icon: Stethoscope }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:block">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Content with Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Records */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Recent Health Records</h2>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 w-64"
                          />
                        </div>
                        <Link
                          href="/record"
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                        >
                          <Mic className="w-4 h-4" />
                          New Recording
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {filteredRecords.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mic className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No recordings yet</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">Start tracking your health by making your first voice recording.</p>
                        <Link
                          href="/record"
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                        >
                          <Plus className="w-4 h-4" />
                          Record Your Health
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredRecords.slice(0, 5).map((record, index) => (
                          <motion.div
                            key={record._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer"
                            onClick={() => {
                              setSelectedRecord(record)
                              setShowModal(true)
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                  <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800 dark:text-slate-200">Voice Recording</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(record.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(record.aiAnalysis?.urgencyLevel || 'low')}`}>
                                  {record.aiAnalysis?.urgencyLevel || 'low'}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 dark:text-slate-500 transition-all">
                                  <Eye className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                            
                            {record.transcript && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {record.transcript}
                              </p>
                            )}
                            
                            {record.aiAnalysis?.summary && (
                              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">AI Summary:</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{record.aiAnalysis.summary}</p>
                              </div>
                            )}
                          </motion.div>
                        ))}
                        
                        {/* View All Recordings Link */}
                        {filteredRecords && filteredRecords.length > 0 && (
                          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Link
                              href="/records"
                              className="block w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View All Recordings →
                            </Link>
                      </div>
                    )}
                        
                        {/* Search Results Info */}
                        {searchTerm && (
                          <div className="pt-4 text-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Showing {filteredRecords.length} of {records.length} records matching "{searchTerm}"
                            </p>
                    </div>
                        )}
                    </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Medication Management</h3>
                    <p className="text-slate-600 dark:text-slate-400">Track your medications and refills</p>
                  </div>
                  <Link
                    href="/medications"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    Add Medication
                  </Link>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading medications...</p>
                  </div>
                ) : !Array.isArray(medications) || medications.length === 0 ? (
                  <div className="text-center py-12">
                    <Pill className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No medications yet</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Start tracking your medications to see them here.</p>
                    <Link
                      href="/medications"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Medication
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Active Medications */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                        Active Medications ({Array.isArray(medications) ? medications.filter(m => m.isActive).length : 0})
                      </h4>
                      <div className="grid gap-3">
                        {Array.isArray(medications) ? medications.filter(m => m.isActive).slice(0, 3).map((medication) => (
                          <div key={medication._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <Pill className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{medication.name}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{medication.dosage} • {medication.frequency}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                medication.category === 'prescription' ? 'bg-blue-100 text-blue-800' :
                                medication.category === 'over-the-counter' ? 'bg-green-100 text-green-800' :
                                medication.category === 'supplement' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {medication.category.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                        )) : null}
                      </div>
                    </div>

                    {/* Refill Reminders */}
                    {Array.isArray(medications) && medications.filter(m => m.refillReminder && m.refillDate && new Date(m.refillDate) <= new Date()).length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-3 uppercase tracking-wide">
                          Refill Reminders ({medications.filter(m => m.refillReminder && m.refillDate && new Date(m.refillDate) <= new Date()).length})
                        </h4>
                        <div className="grid gap-3">
                          {medications.filter(m => m.refillReminder && m.refillDate && new Date(m.refillDate) <= new Date()).slice(0, 2).map((medication) => (
                            <div key={medication._id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                  <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800 dark:text-slate-200">{medication.name}</p>
                                  <p className="text-sm text-orange-600 dark:text-orange-400">
                                    Refill due: {medication.refillDate ? new Date(medication.refillDate).toLocaleDateString() : 'Unknown'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View All Link */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Link
                        href="/medications"
                        className="block w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View All Medications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vitals' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Vital Signs Monitoring</h3>
                    <p className="text-slate-600 dark:text-slate-400">Your latest health measurements</p>
                  </div>
                  <Link
                    href="/vitals"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    Add Vitals
                  </Link>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading vitals data...</p>
                  </div>
                ) : vitals.length === 0 ? (
                <div className="text-center py-12">
                  <Stethoscope className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No vitals recorded yet</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Start tracking your vital signs to see them here.</p>
                  <Link
                    href="/vitals"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                  >
                      <Plus className="w-4 h-4" />
                      Record Your First Vitals
                  </Link>
                </div>
                ) : (
                  <div className="space-y-4">
                    {/* Latest Vitals */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                        Latest Vitals ({vitals.length})
                      </h4>
                      <div className="grid gap-3">
                        {vitals.slice(0, 3).map((vital) => (
                          <div key={vital._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Heart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
                              <div>
                                <p className="font-medium text-slate-800 dark:text-slate-200">
                                  {vital.bloodPressure ? `BP: ${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}` : 
                                   vital.heartRate ? `HR: ${vital.heartRate.bpm} bpm` :
                                   vital.temperature ? `Temp: ${vital.temperature.value}${vital.temperature.unit === 'fahrenheit' ? '°F' : '°C'}` :
                                   vital.weight ? `Weight: ${vital.weight.value}${vital.weight.unit === 'lbs' ? ' lbs' : ' kg'}` : 'Vital Signs'}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(vital.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {vital.bloodPressure && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  vital.bloodPressure.systolic > 140 || vital.bloodPressure.diastolic > 90 
                                    ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {vital.bloodPressure.systolic > 140 || vital.bloodPressure.diastolic > 90 ? 'Elevated' : 'Normal'}
                                </span>
                              )}
                              {vital.heartRate && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  vital.heartRate.bpm > 100 || vital.heartRate.bpm < 60 
                                    ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {vital.heartRate.bpm > 100 ? 'Elevated' : vital.heartRate.bpm < 60 ? 'Low' : 'Normal'}
                                </span>
                              )}
                  </div>
                          </div>
                        ))}
                      </div>
                </div>
                
                    {/* Vital Trends */}
                    {vitals.length > 1 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                          Recent Trends
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Blood Pressure</span>
                          </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {(() => {
                                const bpVitals = vitals.filter(v => v.bloodPressure).slice(0, 2)
                                if (bpVitals.length < 2) return 'Need more data'
                                const latest = bpVitals[0]?.bloodPressure
                                const previous = bpVitals[1]?.bloodPressure
                                if (!latest || !previous) return 'Need more data'
                                const systolicChange = latest.systolic - previous.systolic
                                const diastolicChange = latest.diastolic - previous.diastolic
                                if (systolicChange < -5 || diastolicChange < -5) return 'Improving trend'
                                if (systolicChange > 5 || diastolicChange > 5) return 'Monitor closely'
                                return 'Stable readings'
                              })()}
                            </p>
                        </div>
                          
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Heart Rate</span>
                          </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {(() => {
                                const hrVitals = vitals.filter(v => v.heartRate).slice(0, 2)
                                if (hrVitals.length < 2) return 'Need more data'
                                const latest = hrVitals[0]?.heartRate
                                const previous = hrVitals[1]?.heartRate
                                if (!latest || !previous) return 'Need more data'
                                const change = latest.bpm - previous.bpm
                                if (Math.abs(change) < 5) return 'Stable rhythm'
                                if (change > 0) return 'Slightly elevated'
                                return 'Good recovery'
                              })()}
                            </p>
                      </div>
                </div>
                      </div>
                    )}
                
                    {/* View All Link */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <Link 
                        href="/vitals"
                        className="block w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                        View All Vitals →
                </Link>
              </div>
            </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Enhanced Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Quick Actions</h3>
              <div className="space-y-5">
                <Link
                  href="/record"
                  className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors group"
                >
                  <Mic className="w-4 h-4" />
                  <span className="font-medium text-sm">New Recording</span>
                  <ChevronRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="/records"
                  className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors group"
                >
                  <FileText className="w-4 h-4" />
                  <span className="font-medium text-sm">View All Records</span>
                  <ChevronRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
                

                
                <Link
                  href="/settings"
                  className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors group"
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-medium text-sm">Settings</span>
                  <ChevronRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="/vitals"
                  className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors group"
                >
                  <Activity className="w-4 h-4" />
                  <span className="font-medium text-sm">Vital Signs</span>
                  <ChevronRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Water Tracker */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Water Tracker</h3>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {loading ? '...' : (stats.todayWater || 0)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">cups today</div>
              </div>
              
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.todayWater || 0) / (stats.waterGoal || 8) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">
                Goal: {stats.waterGoal || 8} cups
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => addQuickWater(1)}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors font-medium text-sm flex-1"
                >
                  +1 Cup
                </button>
                <button
                  onClick={() => addQuickWater(2)}
                  className="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-blue-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors font-medium text-sm flex-1"
                >
                  +2 Cups
                </button>
              </div>
                
                <Link
                href="/water"
                className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium text-sm text-center block"
                >
                Full Tracker
                </Link>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Recent Updates</h3>
                <Bell className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </div>
              <div className="space-y-2">
                {/* Latest Health Record */}
                {records.length > 0 && (
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-800 dark:text-blue-300">Latest Recording</span>
                  </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {records[0]?.transcript?.substring(0, 50)}...
                    </p>
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                      {records[0]?.createdAt ? new Date(records[0].createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                </div>
                )}
                
                {/* Latest Vitals */}
                {vitals.length > 0 && (
                <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-xs font-medium text-green-800 dark:text-green-300">Latest Vitals</span>
                  </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {vitals[0]?.bloodPressure ? `BP: ${vitals[0].bloodPressure.systolic}/${vitals[0].bloodPressure.diastolic}` :
                       vitals[0]?.heartRate ? `HR: ${vitals[0].heartRate.bpm} bpm` :
                       vitals[0]?.temperature ? `Temp: ${vitals[0].temperature.value}°${vitals[0].temperature.unit === 'fahrenheit' ? 'F' : 'C'}` :
                       vitals[0]?.weight ? `Weight: ${vitals[0].weight.value} ${vitals[0].weight.unit}` : 'Vitals recorded'}
                    </p>
                    <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                      {vitals[0]?.createdAt ? new Date(vitals[0].createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                </div>
                )}

                {/* Latest Medication */}
                {Array.isArray(medications) && medications.length > 0 && (
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-xs font-medium text-purple-800 dark:text-purple-300">Latest Medication</span>
              </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      {medications[0]?.name} - {medications[0]?.dosage}
                    </p>
                    <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                      {medications[0]?.createdAt ? new Date(medications[0].createdAt).toLocaleDateString() : 'Recently'}
                    </p>
            </div>
                )}

                {/* Activity Summary */}
                <div className="p-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Activity Summary</span>
                </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {records.length} records • {vitals.length} vitals • {Array.isArray(medications) ? medications.length : 0} medications
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
              </div>
              
      {/* Record Detail Modal */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Health Record Details</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(selectedRecord.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                        </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedRecord(null)
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Transcript */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Voice Transcript</h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-slate-700 dark:text-slate-300">{selectedRecord.transcript}</p>
                </div>
              </div>

              {/* Symptoms */}
              {selectedRecord.symptoms && selectedRecord.symptoms.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Symptoms</h3>
                  <div className="space-y-3">
                    {selectedRecord.symptoms.map((symptom, index) => (
                      <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-800 dark:text-slate-200">{symptom.name}</span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">Severity: {symptom.severity}/10</span>
                        </div>
                        {symptom.duration && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">Duration: {symptom.duration}</p>
                        )}
                        {symptom.notes && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Notes: {symptom.notes}</p>
                      )}
                    </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Medications</h3>
                  <div className="space-y-3">
                    {selectedRecord.medications.map((medication, index) => (
                      <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-green-800 dark:text-green-200">{medication.name}</span>
                          <span className="text-sm text-green-600 dark:text-green-400">{medication.dosage}</span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">Frequency: {medication.frequency}</p>
                        {medication.notes && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">Notes: {medication.notes}</p>
                        )}
                  </div>
                ))}
              </div>
                </div>
              )}

              {/* AI Analysis */}
              {selectedRecord.aiAnalysis && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">AI Analysis</h3>
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Summary</h4>
                      <p className="text-blue-700 dark:text-blue-300">{selectedRecord.aiAnalysis.summary}</p>
            </div>

                    {/* Recommendations */}
                    {selectedRecord.aiAnalysis.recommendations && selectedRecord.aiAnalysis.recommendations.length > 0 && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-lg">
                        <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Recommendations</h4>
                        <ul className="space-y-2">
                          {selectedRecord.aiAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                              <span className="text-purple-700 dark:text-purple-300">{rec}</span>
                            </li>
                          ))}
                        </ul>
        </div>
                    )}

                    {/* Urgency & Confidence */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(selectedRecord.aiAnalysis.urgencyLevel)}`}>
                          {selectedRecord.aiAnalysis.urgencyLevel.toUpperCase()}
                        </span>
      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Confidence: {Math.round(selectedRecord.aiAnalysis.confidence * 100)}%
                      </div>
                    </div>

                    {/* Processed At */}
                    {selectedRecord.aiAnalysis.processedAt && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        AI Analysis processed: {new Date(selectedRecord.aiAnalysis.processedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}