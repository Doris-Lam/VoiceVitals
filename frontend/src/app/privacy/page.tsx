'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Database, Users, Calendar, Mic, User, Activity } from 'lucide-react'

export default function PrivacyPage() {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">Privacy Policy</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Your privacy and data security are our top priorities</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Last updated: January 2025</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-8"
        >
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Introduction</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              VoiceVitals ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your health information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our voice-powered health tracking application.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Information We Collect</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">Voice Recordings</h3>
                </div>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  We collect voice recordings when you use our voice recording feature to describe your symptoms and health concerns. 
                  These recordings are processed to extract text and analyze your health information.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Account Information</h3>
                </div>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  When you create an account, we collect your name, email address, and password. 
                  We may also collect additional profile information you choose to provide.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200">Health Data</h3>
                </div>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  We collect health-related information including symptoms, medications, vital signs, 
                  and other health metrics you choose to track through our application.
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200">Usage Data</h3>
                </div>
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  We collect information about how you use our application, including features accessed, 
                  time spent using the app, and technical information about your device.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">How We Use Your Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Provide Services:</strong> To provide and maintain our voice-powered health tracking services
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>AI Analysis:</strong> To analyze your health data and provide personalized insights and recommendations
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Improve Services:</strong> To enhance and improve our application and user experience
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Communication:</strong> To communicate with you about your account and our services
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Security:</strong> To protect against fraud and ensure the security of our platform
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Data Security</h2>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800/50">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">Industry-Standard Security</h3>
              </div>
              <div className="space-y-3 text-sm text-green-700 dark:text-green-300">
                <p>• All data is encrypted in transit and at rest using AES-256 encryption</p>
                <p>• We use secure, HIPAA-compliant cloud infrastructure</p>
                <p>• Regular security audits and penetration testing</p>
                <p>• Access controls and authentication measures</p>
                <p>• Data backup and disaster recovery procedures</p>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Data Sharing and Disclosure</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>With Your Consent:</strong> We may share your information if you explicitly consent
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our platform
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Your Rights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600/50">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Access</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Request access to your personal data</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600/50">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Correction</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Request correction of inaccurate data</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600/50">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Deletion</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Request deletion of your personal data</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600/50">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Portability</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Request data portability</p>
              </div>
            </div>
          </section>


        </motion.div>
      </div>
    </div>
  )
}
