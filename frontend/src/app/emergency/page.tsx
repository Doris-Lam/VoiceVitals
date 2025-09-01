'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Phone,
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Heart,
  Thermometer,
  Activity,
  MessageSquare,
  Navigation,
  Zap,
  Shield,
  CheckCircle,
  Info
} from 'lucide-react'

export default function EmergencyPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  const getLocation = () => {
    setLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLoadingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLoadingLocation(false)
        }
      )
    } else {
      setLoadingLocation(false)
    }
  }

  const callEmergency = () => {
    window.open('tel:911', '_self')
  }

  const sendEmergencyMessage = () => {
    const message = `Emergency: I need medical assistance. My location is approximately: ${location ? `${location.lat}, ${location.lng}` : 'Location not available'}. This is ${user?.name}.`
    window.open(`sms:911&body=${encodeURIComponent(message)}`, '_self')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 dark:text-slate-400 font-medium">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Emergency Contacts</h1>
          <p className="text-slate-600 dark:text-slate-400">Quick access to emergency services and contacts</p>
        </div>

        {/* Emergency Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Call 911 */}
          <motion.button
            onClick={callEmergency}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-8 rounded-2xl shadow-lg transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Call 911</h2>
              <p className="text-red-100">Emergency medical services</p>
              <div className="mt-4 text-3xl font-bold">911</div>
            </div>
          </motion.button>

          {/* Share Location */}
          <motion.button
            onClick={getLocation}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-8 rounded-2xl shadow-lg transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                {loadingLocation ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <MapPin className="w-8 h-8" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">Share Location</h2>
              <p className="text-blue-100">Send your location to emergency contacts</p>
              {location && (
                <div className="mt-2 text-sm text-blue-200">
                  Location obtained ✓
                </div>
              )}
            </div>
          </motion.button>
        </motion.div>

        {/* Emergency Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-red-200 dark:border-red-800/50 shadow-sm mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Info className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your Emergency Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-600" />
                  <span className="font-medium text-slate-800">Personal Information</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>Name: {user?.name || 'Not set'}</div>
                  <div>Email: {user?.email || 'Not set'}</div>
                  <div>Phone: Not set</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-slate-800">Medical Information</span>
                </div>
                <div className="space-y-1 text-sm text-slate-600">
                  <div>Blood Type: Not specified</div>
                  <div>Allergies: None specified</div>
                  <div>Medications: None specified</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-800">Emergency Contacts</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Primary:</span>
                    <span className="text-slate-800">Not set</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Secondary:</span>
                    <span className="text-slate-800">Not set</span>
                  </div>
                  <Link href="/profile" className="text-blue-600 hover:text-blue-700 text-xs">
                    Update emergency contacts →
                  </Link>
                </div>
              </div>

              {location && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-slate-800">Current Location</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Latitude: {location.lat.toFixed(6)}<br/>
                    Longitude: {location.lng.toFixed(6)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <button
            onClick={sendEmergencyMessage}
            className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-slate-800">Send SMS</div>
              <div className="text-sm text-slate-600">Emergency text message</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Navigation className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-slate-800">Find Hospital</div>
              <div className="text-sm text-slate-600">Nearest medical facility</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-slate-800">Health Summary</div>
              <div className="text-sm text-slate-600">Quick medical overview</div>
            </div>
          </button>
        </motion.div>

        {/* Emergency Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">Emergency Guidelines</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                When to Call 911
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Chest pain or difficulty breathing
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Severe bleeding or injury
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Loss of consciousness
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Severe allergic reaction
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Signs of stroke or heart attack
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                What to Tell 911
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  Your exact location or address
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  Nature of the emergency
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  Number of people involved
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  Current condition of patient
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  Any known medical conditions
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Important Notice</span>
          </div>
          <p className="text-sm text-yellow-700">
            This emergency page is designed to provide quick access to emergency services. 
            In a real emergency, always call 911 directly. This app should not replace professional medical advice or emergency services.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
