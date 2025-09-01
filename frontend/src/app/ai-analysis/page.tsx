'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Brain, Mic, Activity, TrendingUp, Shield, Zap, BarChart3, MessageSquare, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

export default function AiAnalysisPage() {
  useEffect(() => {
    // Force remove dark class from HTML element
    const html = document.documentElement
    html.classList.remove('dark')
    
    // Prevent dark mode from being applied
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (html.classList.contains('dark')) {
            html.classList.remove('dark')
          }
        }
      })
    })
    
    observer.observe(html, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])
  const aiFeatures = [
    {
      icon: Brain,
      title: "Natural Language Processing",
      description: "Advanced NLP algorithms understand context, medical terminology, and conversational speech patterns to extract meaningful health insights.",
      benefits: ["Context-aware analysis", "Medical terminology recognition", "Conversational understanding"]
    },
    {
      icon: Activity,
      title: "Health Pattern Recognition",
      description: "AI identifies trends and patterns in your health data over time, providing predictive insights and early warning indicators.",
      benefits: ["Trend analysis", "Predictive insights", "Early warning detection"]
    },
    {
      icon: MessageSquare,
      title: "Intelligent Symptom Analysis",
      description: "Automatically categorizes and analyzes symptoms, providing relevant health recommendations and potential causes.",
      benefits: ["Symptom categorization", "Health recommendations", "Cause identification"]
    },
    {
      icon: TrendingUp,
      title: "Personalized Health Insights",
      description: "Tailored health recommendations based on your unique health profile, medical history, and current symptoms.",
      benefits: ["Personalized recommendations", "Health profile analysis", "Customized insights"]
    }
  ]

  const analysisExamples = [
    {
      input: "I've been feeling really tired lately and have a headache that won't go away",
      analysis: {
        symptoms: ["Fatigue", "Persistent headache"],
        severity: "Moderate",
        recommendations: [
          "Monitor sleep patterns and ensure 7-9 hours of quality sleep",
          "Stay hydrated and maintain regular meal times",
          "Consider stress management techniques",
          "If headache persists for more than 3 days, consult a healthcare provider"
        ],
        patterns: "Consistent fatigue pattern detected over the past week"
      }
    },
    {
      input: "My blood pressure has been higher than usual, around 140/90",
      analysis: {
        symptoms: ["Elevated blood pressure"],
        severity: "High",
        recommendations: [
          "Reduce sodium intake in your diet",
          "Increase physical activity with moderate exercise",
          "Practice stress-reduction techniques",
          "Schedule a follow-up with your doctor within 1 week"
        ],
        patterns: "Blood pressure trending upward over the past month"
      }
    },
    {
      input: "I forgot to take my medication yesterday and today I feel dizzy",
      analysis: {
        symptoms: ["Dizziness", "Missed medication"],
        severity: "Moderate",
        recommendations: [
          "Take your missed medication as soon as possible",
          "Monitor for any adverse effects",
          "Set up medication reminders",
          "Contact your pharmacist about missed dose protocol"
        ],
        patterns: "Medication adherence has decreased by 15% this month"
      }
    }
  ]

  const aiCapabilities = [
    {
      category: "Voice Recognition",
      features: [
        "99.5% accuracy in speech-to-text conversion",
        "Multi-language support",
        "Noise cancellation and background filtering",
        "Real-time transcription"
      ]
    },
    {
      category: "Health Analysis",
      features: [
        "Symptom severity assessment",
        "Medication interaction checking",
        "Vital signs trend analysis",
        "Health risk prediction"
      ]
    },
    {
      category: "Data Security",
      features: [
        "End-to-end encryption",
        "HIPAA compliance",
        "Secure data transmission",
        "Privacy-first design"
      ]
    },
    {
      category: "Personalization",
      features: [
        "Learning user patterns",
        "Adaptive recommendations",
        "Custom health goals",
        "Individualized insights"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">AI-Powered Health Analysis</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Experience the future of health monitoring with our advanced artificial intelligence that understands your voice and provides personalized health insights.
          </p>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-8">How AI Analysis Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">1. Voice Input</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Speak naturally about your symptoms, medications, or health concerns. Our AI captures and processes your voice in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">2. AI Processing</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Advanced algorithms analyze your speech, extract health information, and identify patterns and trends in your data.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">3. Health Insights</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Receive personalized health recommendations, symptom analysis, and actionable insights to improve your well-being.
              </p>
            </div>
          </div>
        </motion.div>

        {/* AI Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-8">Advanced AI Features</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Analysis Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-8">AI Analysis Examples</h2>
          
          <div className="space-y-6">
            {analysisExamples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Mic className="w-5 h-5 text-blue-500" />
                      Voice Input
                    </h3>
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                      <p className="text-slate-700 dark:text-slate-300 italic">"{example.input}"</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      AI Analysis
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Symptoms: </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{example.analysis.symptoms.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Severity: </span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          example.analysis.severity === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          example.analysis.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {example.analysis.severity}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Patterns: </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{example.analysis.patterns}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {example.analysis.recommendations.map((rec, recIndex) => (
                      <li key={recIndex} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Capabilities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-8">AI Capabilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiCapabilities.map((capability, index) => (
              <motion.div
                key={capability.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{capability.category}</h3>
                <ul className="space-y-3">
                  {capability.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800/50">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Privacy & Security First</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Your health data is protected with enterprise-grade security and privacy measures.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">HIPAA Compliant</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Full compliance with healthcare privacy regulations</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">End-to-End Encryption</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Your data is encrypted at rest and in transit</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Local Processing</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">AI analysis happens on secure, local servers</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Ready to Experience AI-Powered Health?</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Start your journey with VoiceVitals and discover how artificial intelligence can transform your health monitoring experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300"
              >
                <Mic className="w-5 h-5" />
                Start Recording Now
              </Link>
              <Link
                href="/documentation"
                className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold px-8 py-4 rounded-xl transition-all duration-300"
              >
                <BarChart3 className="w-5 h-5" />
                Learn More
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
