'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { 
  ArrowLeft,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  RotateCcw,
  Send,
  Activity,
  Brain,
  Loader,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Droplets
} from 'lucide-react'

export default function RecordPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // Use the real speech recognition hook from the front page
  const {
    isRecording,
    transcript,
    isSupported,
    audioUrl,
    startRecording: startSpeechRecording,
    stopRecording: stopSpeechRecording,
    clearTranscript,
  } = useSpeechRecognition()
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [analysisResult, setAnalysisResult] = useState<{
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
      followUpNeeded?: boolean
    }
    createdAt: string
    updatedAt: string
  } | null>(null)
  const [step, setStep] = useState<'record' | 'review' | 'analysis' | 'complete'>('record')
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isAudioLoading, setIsAudioLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)

  // Quick water logging function
  const addQuickWater = async (amount: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to track water')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/water/add`, {
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
        // Show success message briefly
        const successMsg = `Added ${amount} glass${amount > 1 ? 'es' : ''} of water! 💧`
        setError(null)
        setSuccessMessage(successMsg)
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError('Failed to log water intake. Please try again.')
      }
    } catch (error) {
        console.error('Error adding water:', error)
        setError('Error logging water intake. Please try again.')
      }
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])





  // Audio playback controls
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current
      
      const updateTime = () => setCurrentTime(audio.currentTime)
      const updateDuration = () => setDuration(audio.duration)
      const onEnded = () => setIsPlaying(false)
      
      audio.addEventListener('timeupdate', updateTime)
      audio.addEventListener('loadedmetadata', updateDuration)
      audio.addEventListener('ended', onEnded)
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime)
        audio.removeEventListener('loadedmetadata', updateDuration)
        audio.removeEventListener('ended', onEnded)
      }
    }
  }, [audioRef.current])

  // Keyboard shortcuts for audio playback
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (step === 'review' && audioUrl) {
        if (e.code === 'Space') {
          e.preventDefault()
          togglePlayback()
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault()
          if (audioRef.current && duration > 0) {
            const newTime = Math.max(0, currentTime - 10)
            audioRef.current.currentTime = newTime
            setCurrentTime(newTime)
          }
        } else if (e.code === 'ArrowRight') {
          e.preventDefault()
          if (audioRef.current && duration > 0) {
            const newTime = Math.min(duration, currentTime + 10)
            audioRef.current.currentTime = newTime
            setCurrentTime(newTime)
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [step, audioUrl, currentTime, duration])

  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      setError(null)
      clearTranscript()
      
      // Use the real speech recognition from the hook
      await startSpeechRecording()
      setRecordingTime(0)
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Failed to start recording. Please try again.')
    }
  }

  const stopRecording = () => {
    stopSpeechRecording()
    setStep('review')
  }

  const resetRecording = () => {
    setIsPlaying(false)
    clearTranscript()
    setRecordingTime(0)
    setAudioBlob(null)
    setAnalysisResult(null)
    setError(null)
    setCurrentTime(0)
    setDuration(0)
    setStep('record')
  }

  const togglePlayback = async () => {
    if (!audioRef.current) return
    
    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        setIsAudioLoading(true)
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Audio playback error:', error)
      setError('Failed to play audio. Please try again.')
      setIsPlaying(false)
    } finally {
      setIsAudioLoading(false)
    }
  }

  const processRecording = async () => {
    if (!transcript) {
      setError('No transcript available. Please record again.')
      return
    }

    if (transcript.trim().length < 5) {
      setError('Transcript is too short. Please record for longer.')
      return
    }

    setIsProcessing(true)
    setStep('analysis')
    setError(null)

    try {
      // Send the real transcript directly to the backend
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.')
      }

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/health`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transcript: transcript
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Processing failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.data || !result.data.healthRecord) {
        throw new Error('Invalid response from server')
      }
      
      const healthRecord = result.data.healthRecord
      setAnalysisResult(healthRecord)
      
      setIsProcessing(false)
      setStep('complete')
    } catch (error) {
      console.error('Error processing recording:', error)
      setError(error instanceof Error ? error.message : 'Failed to process recording. Please try again.')
      setIsProcessing(false)
      setStep('review')
    }
  }



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Voice Health Recording</h1>
          <p className="text-slate-600 dark:text-slate-400">Speak naturally about your symptoms and health concerns</p>
        </div>

        {/* Success Display */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-200">{successMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Quick Water Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Quick Water Log</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Log your water intake before recording</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => addQuickWater(1)}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors font-medium"
            >
              +1 Glass
            </button>
            <button
              onClick={() => addQuickWater(2)}
              className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors font-medium"
            >
              +2 Glasses
            </button>
            <button
              onClick={() => addQuickWater(3)}
              className="px-4 py-2 bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 rounded-lg transition-colors font-medium"
            >
              +3 Glasses
            </button>
            <Link
              href="/water"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium"
            >
              Full Tracker
            </Link>
          </div>
        </motion.div>

        {/* Recording Interface */}
        {step === 'record' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm text-center"
          >
            <div className="mb-8">
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
                isRecording 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105'
              }`}>
                {isRecording ? (
                  <MicOff className="w-16 h-16 text-white" />
                ) : (
                  <Mic className="w-16 h-16 text-white" />
                )}
              </div>
              
              {isRecording && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-600 font-semibold">Recording</span>
                </div>
              )}
              
              {isRecording && (
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                  {formatTime(recordingTime)}
                </div>
              )}
              
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {isRecording 
                  ? "Speak clearly about your symptoms, how you're feeling, and any concerns you have."
                  : "Click the microphone to start recording your health status."
                }
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              {!isRecording ? (
                <motion.button
                  onClick={startRecording}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3"
                >
                  <Mic className="w-5 h-5" />
                  Start Recording
                </motion.button>
              ) : (
                <motion.button
                  onClick={stopRecording}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3"
                >
                  <Square className="w-5 h-5" />
                  Stop Recording
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Review Interface */}
        {step === 'review' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Recording Complete</h2>
              <p className="text-slate-600 dark:text-slate-400">Review your transcript and submit for AI analysis</p>
            </div>

            <div className="space-y-6">
              {/* Transcript Display */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">What You Said</h3>
                  <span className="text-slate-600 dark:text-slate-400 text-sm">
                    {transcript.length} characters
                  </span>
                </div>
                
                <div className="bg-white dark:bg-slate-600 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                  {transcript ? (
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      "{transcript}"
                    </p>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 italic">
                      No transcript available. Please record again.
                    </p>
                  )}
                </div>
              </div>

              {/* Audio Playback (if available) */}
              {audioUrl && (
                <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Audio Playback</h3>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-600 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                    <audio 
                      controls 
                      className="w-full"
                      src={audioUrl}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={resetRecording}
                  className="flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Record Again
                </button>
                

                
                <button
                  onClick={processRecording}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  <Brain className="w-5 h-5" />
                  Analyze with AI
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analysis Interface */}
        {step === 'analysis' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm text-center"
          >
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                {isProcessing ? (
                  <Loader className="w-12 h-12 text-white animate-spin" />
                ) : (
                  <Brain className="w-12 h-12 text-white" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">AI Analysis in Progress</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {isProcessing ? 
                  "Converting your voice to text and analyzing your health data..." :
                  "Processing your recording..."
                }
              </p>
            </div>

            {/* Processing Steps */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 dark:text-slate-300">Audio file uploaded</span>
              </div>
              
              <div className="flex items-center gap-3 text-left">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  transcript ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                }`}>
                  {transcript ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <Loader className="w-4 h-4 text-white animate-spin" />
                  )}
                </div>
                <span className="text-slate-700 dark:text-slate-300">
                  {transcript ? 'Speech converted to text' : 'Converting speech to text...'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-left">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  analysisResult ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                }`}>
                  {analysisResult ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <Loader className="w-4 h-4 text-white animate-spin" />
                  )}
                </div>
                <span className="text-slate-700 dark:text-slate-300">
                  {analysisResult ? 'AI analysis complete' : 'Analyzing with AI...'}
                </span>
              </div>
            </div>

            {transcript && (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-6 text-left mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Transcript</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{transcript}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </motion.div>
        )}

        {/* Complete Interface */}
        {step === 'complete' && analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Analysis Complete</h2>
              <p className="text-slate-600 dark:text-slate-400">Your health record has been saved and analyzed</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">AI Summary</h3>
              <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                {analysisResult.aiAnalysis?.summary || 'No summary available'}
              </p>
            </div>

            {analysisResult.symptoms && analysisResult.symptoms.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Detected Symptoms</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.symptoms.map((symptom: any, idx: number) => (
                    <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-4">
                      <div className="font-medium text-yellow-800 dark:text-yellow-300">{symptom.name}</div>
                      <div className="text-yellow-700 dark:text-yellow-400 text-sm">Severity: {symptom.severity}/10</div>
                      <div className="text-yellow-700 dark:text-yellow-400 text-sm">Duration: {symptom.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.aiAnalysis?.recommendations && analysisResult.aiAnalysis.recommendations.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Recommendations</h3>
                <ul className="space-y-2">
                  {analysisResult.aiAnalysis.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.aiAnalysis?.followUpNeeded && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300">Follow-up Recommended</h3>
                </div>
                <p className="text-orange-700 dark:text-orange-400">Consider scheduling an appointment with your healthcare provider to discuss these symptoms.</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={resetRecording}
                className="flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Mic className="w-5 h-5" />
                New Recording
              </button>
              <Link
                href="/records"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                <Send className="w-5 h-5" />
                View All Records
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

