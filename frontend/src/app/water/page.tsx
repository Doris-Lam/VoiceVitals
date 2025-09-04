'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Droplets, Plus, TrendingUp, Calendar, Target, Trophy, Zap, Sparkles, Clock, CheckCircle } from 'lucide-react'

export default function WaterPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [todayWater, setTodayWater] = useState(0)
  const [waterGoal, setWaterGoal] = useState(8)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [waterHistory, setWaterHistory] = useState<Array<{
    date: string
    glasses: number
    goal: number
    percentage: number
    isCompleted: boolean
  }>>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week')
  const [stats, setStats] = useState({
    averageGlasses: 0,
    bestDay: 0,
    goalCompletionRate: 0,
    streak: 0
  })

  const fetchTodayWater = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('https://web-production-508d.up.railway.app/api/water/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const waterRecord = data.data.waterRecord
        
        setTodayWater(waterRecord.glasses)
        setWaterGoal(waterRecord.dailyGoal)
      }
    } catch (error) {
      console.error('Error fetching today\'s water:', error)
    }
  }, [])

  const fetchWaterHistory = useCallback(async () => {
    try {
      setHistoryLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const days = selectedPeriod === 'week' ? 7 : 30
      const response = await fetch(`https://web-production-508d.up.railway.app/api/water/history?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Water history data:', data.data.history)
        setWaterHistory(data.data.history)
      } else {
        console.error('Failed to fetch water history:', response.status)
      }
    } catch (error) {
      console.error('Error fetching water history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }, [selectedPeriod])

  const fetchWaterStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const period = selectedPeriod === 'week' ? 'week' : 'month'
      const response = await fetch(`https://web-production-508d.up.railway.app/api/water/stats?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Error fetching water stats:', error)
    }
  }, [selectedPeriod])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    fetchTodayWater()
    fetchWaterHistory()
    fetchWaterStats()
  }, [user, authLoading, router, fetchTodayWater, fetchWaterHistory, fetchWaterStats])

  // Separate effect to refetch history when period changes
  useEffect(() => {
    if (user && !authLoading) {
      fetchWaterHistory()
    }
  }, [selectedPeriod, user, authLoading, fetchWaterHistory])

  const addWater = async (amount: number) => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('Please log in to track water')
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
          notes: `Added ${amount} glass${amount > 1 ? 'es' : ''} of water`
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTodayWater(data.data.waterRecord.glasses)
        setMessage(data.data.message)
        setTimeout(() => setMessage(''), 3000)
        
        // Refresh data
        console.log('Refreshing data after adding water...')
        fetchTodayWater()
        fetchWaterHistory()
        fetchWaterStats()
      } else {
        const errorData = await response.json().catch(() => ({}))
        setMessage(errorData.message || `Failed to log water intake. Please try again.`)
      }
    } catch (error) {
      setMessage('Error logging water intake. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateWaterGoal = async (newGoal: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('https://web-production-508d.up.railway.app/api/water/goal', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dailyGoal: newGoal })
      })

      if (response.ok) {
        setWaterGoal(newGoal)
        setMessage(`Daily goal updated to ${newGoal} glasses! 🎯`)
        setTimeout(() => setMessage(''), 3000)
        
        // Refresh data
        fetchTodayWater()
        fetchWaterHistory()
        fetchWaterStats()
      }
    } catch (error) {
      console.error('Error updating water goal:', error)
    }
  }

  const percentage = Math.min((todayWater / waterGoal) * 100, 100)
  const remaining = Math.max(waterGoal - todayWater, 0)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading water tracker...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Please log in to access the water tracker</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Dashboard</span>
            </Link>
            

          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">

          
                      <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-slate-100 mb-4">
              Water Tracker
            </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Stay hydrated and track your daily water intake with beautiful insights and progress tracking
          </p>
          
          {/* Daily Reset Info */}

        </div>

        {/* Main Water Display */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow mb-8">
          <div className="text-center mb-8">
                          <div className="w-48 h-48 mx-auto mb-8 relative">
              {/* Circular Progress */}
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="url(#waterGradient)"
                    strokeWidth="3"
                  strokeDasharray={`${percentage}, 100`}
                    className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                  <div className="text-6xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {todayWater}
                  </div>
                  <div className="text-xl text-slate-600 dark:text-slate-400 text-center">of {waterGoal} glasses</div>
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
              {percentage >= 100 ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Goal Achieved!
                </span>
              ) : (
                `${remaining} more to go!`
              )}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {percentage >= 100 
                ? 'Amazing job staying hydrated today! 🎉' 
                : 'Keep drinking water to reach your daily goal'
              }
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => addWater(1)}
              disabled={isLoading}
              className="p-6 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-2xl transition-colors disabled:opacity-50 border border-blue-200 dark:border-blue-700"
            >
              <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Plus className="w-6 h-6 text-white" />
          </div>
                <div className="font-bold text-blue-800 dark:text-blue-200 text-lg">+1 Glass</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">240ml</div>
              </div>
            </button>
            
            <button
              onClick={() => addWater(2)}
              disabled={isLoading}
              className="p-6 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-2xl transition-colors disabled:opacity-50 border border-indigo-200 dark:border-indigo-700"
            >
              <div className="text-center">
                                 <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                   <Plus className="w-6 h-6 text-white" />
                 </div>
                <div className="font-bold text-indigo-800 dark:text-indigo-200 text-lg">+2 Glasses</div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400">480ml</div>
              </div>
            </button>
            
            <button
              onClick={() => addWater(3)}
              disabled={isLoading}
              className="p-6 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/30 dark:hover:bg-cyan-900/50 rounded-2xl transition-colors disabled:opacity-50 border border-cyan-200 dark:border-cyan-700"
            >
              <div className="text-center">
                                 <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                   <Plus className="w-6 h-6 text-white" />
                 </div>
                <div className="font-bold text-cyan-800 dark:text-cyan-200 text-lg">+3 Glasses</div>
                <div className="text-sm text-cyan-600 dark:text-cyan-400">720ml</div>
              </div>
            </button>
          </div>

          {/* Success Message */}
          {message && (
            <div className="text-center">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-lg font-medium ${
                message.includes('Error') || message.includes('Failed') 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            </div>
          )}
        </div>



        {/* Water Tips */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow mb-8">
          <h3 className="text-2xl font-bold text-black dark:text-slate-100 mb-6">
            Hydration Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">Drink water first thing in the morning</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Start your day with a glass of water to rehydrate after sleep</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">Keep a water bottle with you</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Having water readily available makes it easier to stay hydrated</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">3</span>
                </div>
            <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">Set reminders throughout the day</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Use notifications to remind yourself to drink water regularly</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">4</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">Drink before, during, and after exercise</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Stay hydrated during physical activity to maintain performance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">5</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">Monitor your urine color</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Light yellow indicates good hydration levels</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">6</span>
            </div>
            <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">Eat water-rich foods</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Fruits and vegetables can contribute to your daily water intake</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Water History */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Water History</h3>
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === 'week'
                    ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === 'month'
                    ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {historyLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading water history...</p>
            </div>
          ) : waterHistory.length > 0 ? (
            <div className="space-y-4">
              {waterHistory.slice(-(selectedPeriod === 'week' ? 7 : 30)).map((day) => (
                <div key={day.date} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{day.glasses}</span>
                      <span className="text-slate-600 dark:text-slate-400">glasses</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {day.isCompleted ? (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Goal met!</span>
                </div>
                    ) : (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Goal: {day.goal}
                  </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium mb-1">No water history yet</p>
              <p className="text-sm">Start tracking water to see your history</p>
            </div>
          )}
        </div>

        {/* Goal Adjustment */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xl font-semibold text-slate-700 dark:text-slate-300">Daily Goal</span>
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{waterGoal} glasses</span>
          </div>
          <div className="flex gap-3">
            {[6, 8, 10, 12].map((goal) => (
              <button
                key={goal}
                onClick={() => updateWaterGoal(goal)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  waterGoal === goal
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
