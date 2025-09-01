'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, Trash2, Brain, AlertCircle, CheckCircle, LogIn, RefreshCw } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { sendTranscriptToAPI, validateTranscript } from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'
import { ApiResponse } from '@/types'
import { useState, useEffect, useRef } from 'react'

export function VoiceRecorder() {
  const { user } = useAuth()
  const isAuthenticated = !!user
  const [recordingDuration, setRecordingDuration] = useState(0)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [lastRecordingTime, setLastRecordingTime] = useState<Date | null>(null)
  
  const {
    isRecording,
    transcript,
    isSupported,
    response,
    isProcessing,
    error,
    audioUrl,
    startRecording,
    stopRecording,
    clearTranscript,
    setProcessing,
    setResponse,
    setError,
  } = useSpeechRecognition()

  // Clear old responses when starting new recording
  useEffect(() => {
    if (isRecording) {
      setResponse(null)
      setLastRecordingTime(new Date())
    }
  }, [isRecording, setResponse])

  // Handle recording duration
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0)
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [isRecording])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSendToBackend = async () => {
    if (!validateTranscript(transcript)) return
    
    if (!isAuthenticated) {
      setError('Please log in to use VoiceVitals')
      return
    }

    console.log('🎤 Sending transcript to backend:', transcript);
    console.log('📝 Transcript length:', transcript.length);
    console.log('🔍 Transcript content:', `"${transcript}"`);
    console.log('⏰ Recording time:', lastRecordingTime);

    setProcessing(true)
    setError('')
    
    try {
      const data = await sendTranscriptToAPI(transcript)
      console.log('✅ Backend response:', data);
      setResponse(data)
    } catch (error) {
      console.error('❌ Error sending to backend:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setProcessing(false)
    }
  }

  const handleClearAll = () => {
    clearTranscript()
    setRecordingDuration(0)
    setResponse(null)
    setLastRecordingTime(null)
  }

  const renderAIResponse = (response: ApiResponse) => {
    if (!response || !response.data || !response.data.healthRecord) {
      return <p className="text-blue-800">Processing response...</p>
    }

    const record = response.data.healthRecord
    
    return (
      <div className="space-y-4">
        {/* Summary */}
        {record.aiAnalysis?.summary && (
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">AI Summary</h4>
            <p className="text-blue-800">{record.aiAnalysis.summary}</p>
          </div>
        )}

        {/* Symptoms */}
        {record.symptoms && record.symptoms.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Symptoms Detected</h4>
            <div className="space-y-2">
              {record.symptoms.map((symptom: { name: string; severity: number; duration: string; notes: string }, index: number) => (
                <div key={index} className="bg-blue-100 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">{symptom.name}</span>
                    <span className="text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded">
                      Severity: {symptom.severity}/10
                    </span>
                  </div>
                  {symptom.duration && (
                    <p className="text-sm text-blue-700 mt-1">Duration: {symptom.duration}</p>
                  )}
                  {symptom.notes && (
                    <p className="text-sm text-blue-600 mt-1">{symptom.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medications */}
        {record.medications && record.medications.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Medications Mentioned</h4>
            <div className="space-y-2">
              {record.medications.map((med: { name: string; dosage?: string; frequency?: string; notes?: string }, index: number) => (
                <div key={index} className="bg-blue-100 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">{med.name}</span>
                    {med.dosage && (
                      <span className="text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded">
                        {med.dosage}
                      </span>
                    )}
                  </div>
                  {med.frequency && (
                    <p className="text-sm text-blue-700 mt-1">Frequency: {med.frequency}</p>
                  )}
                  {med.notes && (
                    <p className="text-sm text-blue-600 mt-1">{med.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {record.aiAnalysis?.recommendations && record.aiAnalysis.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Recommendations</h4>
            <ul className="space-y-2">
              {record.aiAnalysis.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-800">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Urgency Level */}
        {record.aiAnalysis?.urgencyLevel && (
          <div className="mt-4 p-3 rounded-lg bg-blue-100 border border-blue-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-900">Urgency Level:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                record.aiAnalysis.urgencyLevel === 'urgent' ? 'bg-red-200 text-red-800' :
                record.aiAnalysis.urgencyLevel === 'high' ? 'bg-orange-200 text-orange-800' :
                record.aiAnalysis.urgencyLevel === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                'bg-green-200 text-green-800'
              }`}>
                {record.aiAnalysis.urgencyLevel.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!isSupported) {
    return (
      <section id="voice-recorder" className="py-24 lg:py-32 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-100 rounded-3xl p-8 border border-red-200 text-center"
            >
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-red-700 mb-4">Speech Recognition Not Supported</h3>
              <p className="text-red-600">
                Your browser doesn&apos;t support speech recognition. Please try Chrome, Edge, or Safari for the best experience.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="voice-recorder" className="py-24 lg:py-32 relative bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-800 mb-6">
              Try{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                VoiceVitals
              </span>{' '}
              Now
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Speak naturally about your symptoms, medications, or health concerns. Our AI will analyze and provide insights.
            </p>
          </motion.div>

          {/* Main Recording Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200 shadow-md"
          >
            {/* Voice Button */}
            <div className="text-center mb-8">
              <motion.button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`relative w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 transition-all duration-300 ${
                  isRecording
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 border-red-300 shadow-lg shadow-red-500/25'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                whileTap={{ scale: 0.95 }}
                animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
                transition={isRecording ? { duration: 1, repeat: Infinity } : {}}
              >
                {isRecording ? (
                  <MicOff className="w-12 h-12 lg:w-16 lg:h-16 text-white mx-auto" />
                ) : (
                  <Mic className="w-12 h-12 lg:w-16 lg:h-16 text-white mx-auto" />
                )}
                
                {/* Pulse Animation */}
                {isRecording && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-red-300"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>

              {/* Recording Status */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 flex items-center justify-center gap-3"
                  >
                    <motion.div
                      className="w-3 h-3 bg-red-400 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-red-200 font-medium text-lg">
                      Recording... {formatDuration(recordingDuration)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Button Text */}
              <div className="mt-4">
                <span className="text-white font-semibold text-lg">
                  {isRecording ? 'Tap to Stop' : 'Tap to Start Recording'}
                </span>
              </div>
              
              {/* Recording Tips */}
              {!isRecording && !transcript && (
                <div className="mt-4 text-sm text-slate-400">
                  <p>Speak clearly and naturally about your symptoms</p>
                  <p>Example: &ldquo;I have a headache that started yesterday&rdquo;</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <AnimatePresence>
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                >
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={handleSendToBackend}
                        disabled={isProcessing || !transcript}
                        className="group flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Brain className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        )}
                        {isProcessing ? 'Analyzing...' : 'Analyze with AI'}
                      </button>
                      
                      {audioUrl && (
                        <button
                          onClick={() => {
                            handleClearAll()
                            startRecording()
                          }}
                          className="flex items-center justify-center gap-3 bg-white border-2 border-blue-300 hover:border-blue-400 text-blue-700 hover:text-blue-800 font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                        >
                          <Mic className="w-5 h-5" />
                          Record Again
                        </button>
                      )}
                      
                      <button
                        onClick={handleClearAll}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-5 h-5" />
                        Clear All
                      </button>
                      

                    </>
                  ) : (
                    <div className="text-center">
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                        <LogIn className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <h3 className="text-amber-700 font-semibold text-lg mb-2">Login Required</h3>
                        <p className="text-amber-600 mb-4">
                          Please log in to analyze your voice transcript with AI and save your health records.
                        </p>
                        <a
                          href="/login"
                          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-300"
                        >
                          <LogIn className="w-4 h-4" />
                          Go to Login
                        </a>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transcript Display */}
            <div className="mb-6">
              <h3 className="text-slate-800 font-semibold text-lg mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-600" />
                What you said:
                {transcript && (
                  <span className="text-sm text-slate-500 font-normal">
                    ({transcript.length} characters)
                  </span>
                )}
              </h3>
              <div className={`rounded-2xl p-6 min-h-[100px] transition-all duration-300 ${
                transcript 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-slate-50 border border-slate-200'
              }`}>
                {transcript ? (
                  <div>
                    <p className="text-slate-800 text-lg leading-relaxed mb-3">
                      <span className="font-medium">Transcript:</span> &ldquo;{transcript}&rdquo;
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Transcript captured successfully</span>
                    </div>
                    

                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mic className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 italic">Your speech will appear here...</p>
                    <p className="text-slate-300 text-sm mt-1">Click the microphone above to start recording</p>
                    

                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-red-200 mb-3">{error}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setError('')}
                            className="text-red-300 hover:text-red-100 text-sm underline"
                          >
                            Dismiss
                          </button>
                          {error.includes('microphone') || error.includes('speech') ? (
                            <button
                              onClick={() => {
                                setError('')
                                clearTranscript()
                                startRecording()
                              }}
                              className="text-red-300 hover:text-red-100 text-sm underline"
                            >
                              Try Again
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Audio Playback Interface */}
            <AnimatePresence>
              {audioUrl && !isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  <h3 className="text-slate-800 font-semibold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Your Recording:
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-green-800 font-semibold text-lg">Recording Complete</h4>
                        <p className="text-green-600">Review your recording and submit for AI analysis</p>
                      </div>
                    </div>
                    
                    {/* Audio Player */}
                    <div className="bg-white rounded-xl p-4 border border-green-200">
                      <audio 
                        controls 
                        className="w-full"
                        src={audioUrl}
                        onLoadedMetadata={(e) => {
                          const audio = e.target as HTMLAudioElement
                          console.log('Audio duration:', audio.duration)
                        }}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Response */}
            <AnimatePresence>
              {response && typeof response === 'object' && 'data' in response && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h3 className="text-slate-800 font-semibold text-lg mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    AI Analysis:
                    {lastRecordingTime && (
                      <span className="text-sm text-slate-500 font-normal">
                        (Recorded at {lastRecordingTime.toLocaleTimeString()})
                      </span>
                    )}
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    {renderAIResponse(response as ApiResponse)}
                  </div>
                </motion.div>
              )}
              
              {/* Processing State */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <h3 className="text-slate-800 font-semibold text-lg mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    AI Analysis:
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Brain className="w-6 h-6 text-blue-600" />
                    </motion.div>
                    <p className="text-blue-800 text-lg font-medium">Analyzing your symptoms...</p>
                    <p className="text-blue-600 text-sm mt-2">This may take a few moments</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>





            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-12 bg-blue-50 rounded-2xl p-8 border border-blue-200"
            >
            <h3 className="text-blue-700 font-semibold text-lg mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              How to use VoiceVitals:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Click the microphone to start recording",
                "Speak naturally about symptoms or medications",
                "Example: &ldquo;I have a headache and took 2 aspirin&rdquo;",
                "Our AI will analyze and provide health insights",
              ].map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-900 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-blue-700">{instruction}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
