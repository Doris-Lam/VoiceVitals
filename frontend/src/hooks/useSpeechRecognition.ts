'use client'

import { useState, useRef, useCallback } from 'react'
import { ApiResponse } from '@/types'

// Speech Recognition API types
interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: {
    transcript: string
    confidence: number
  }
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResult[]
}

interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives?: number
  onstart: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onend: () => void
  start: () => void
  stop: () => void
}

interface VoiceRecordingState {
  isRecording: boolean
  transcript: string
  isSupported: boolean
  response: string | ApiResponse | null
  isProcessing: boolean
  error: string
  audioBlob: Blob | null
  audioUrl: string
}

// Helper functions
function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
}

function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
}

export function useSpeechRecognition() {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    transcript: '',
    isSupported: isSpeechRecognitionSupported(),
    response: '',
    isProcessing: false,
    error: '',
    audioBlob: null,
    audioUrl: '',
  })

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const transcriptBufferRef = useRef<string>('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported' }))
      return
    }

    try {
      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setState(prev => ({ 
          ...prev, 
          audioBlob, 
          audioUrl,
          isRecording: false 
        }))
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      // Start audio recording with timeslice for better responsiveness
      mediaRecorder.start(1000) // Collect data every 1 second
      audioChunksRef.current = []

      // Start speech recognition
      const SpeechRecognition = getSpeechRecognition()
      if (!SpeechRecognition) return

      const recognition = new SpeechRecognition() as SpeechRecognitionInstance
      recognitionRef.current = recognition

      // Configure recognition settings
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 3 // Get multiple alternatives for better accuracy
      


      recognition.onstart = () => {
        setState(prev => ({
          ...prev,
          isRecording: true,
          transcript: '',
          response: '',
          error: '',
          audioBlob: null,
          audioUrl: '',
        }))
        transcriptBufferRef.current = ''
      }

      recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        console.log('🎯 Speech recognition results:', event.results);
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          
          console.log(`Result ${i}: "${transcript}" (confidence: ${confidence}, final: ${result.isFinal})`);
          
          if (result.isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        // Update the transcript with both interim and final results
        const fullTranscript = transcriptBufferRef.current + finalTranscript + interimTranscript
        const cleanedTranscript = fullTranscript.trim()
        
        console.log('📝 Final transcript:', cleanedTranscript);
        console.log('📝 Interim transcript:', interimTranscript);
        
        // Update the transcript state
        setState(prev => ({ ...prev, transcript: cleanedTranscript }))
        
        // Store final transcript in buffer for when recognition ends
        if (finalTranscript) {
          transcriptBufferRef.current = transcriptBufferRef.current + finalTranscript
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        let errorMessage = 'Speech recognition error. Please try again.'
        
        // Provide more specific error messages
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly and try again.'
            break
          case 'audio-capture':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.'
            break
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.'
            break
          case 'network':
            errorMessage = 'Network error. Please check your connection and try again.'
            break
          case 'aborted':
            errorMessage = 'Recording was stopped. You can start recording again.'
            break
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not available. Please try again.'
            break
          default:
            errorMessage = `Speech recognition error: ${event.error}. Please try again.`
        }
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isRecording: false,
        }))
        
        // Stop audio recording on error
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
      }

      recognition.onend = () => {
        console.log('🛑 Speech recognition ended, final transcript:', transcriptBufferRef.current)
        
        // If we're still supposed to be recording, restart recognition
        if (state.isRecording) {
          console.log('🔄 Restarting speech recognition...')
          try {
            recognition.start()
          } catch (error) {
            console.error('Failed to restart recognition:', error)
            setState(prev => ({ 
              ...prev, 
              isRecording: false,
              transcript: transcriptBufferRef.current || prev.transcript
            }))
          }
        } else {
          setState(prev => ({ 
            ...prev, 
            isRecording: false,
            transcript: transcriptBufferRef.current || prev.transcript
          }))
        }
      }

      recognition.start()
    } catch (error) {
      console.error('Failed to start recording:', error)
      setState(prev => ({
        ...prev,
        error: 'Failed to access microphone. Please allow microphone access and try again.',
        isRecording: false,
      }))
    }
  }, [state.isSupported])

  const stopRecording = useCallback(() => {
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error('Error stopping recognition:', error)
      }
    }
    
    // Stop audio recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    setState(prev => ({ ...prev, isRecording: false }))
  }, [])

  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      response: '',
      error: '',
      audioBlob: null,
      audioUrl: '',
    }))
    transcriptBufferRef.current = ''
    
    // Clean up audio URL
    setState(prev => {
      if (prev.audioUrl) {
        URL.revokeObjectURL(prev.audioUrl)
      }
      return prev
    })
  }, [])

  const setProcessing = useCallback((isProcessing: boolean) => {
    setState(prev => ({ ...prev, isProcessing }))
  }, [])

  const setResponse = useCallback((response: string | ApiResponse | null) => {
    setState(prev => ({ ...prev, response }))
  }, [])

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  return {
    ...state,
    startRecording,
    stopRecording,
    clearTranscript,
    setProcessing,
    setResponse,
    setError,
  }
}
