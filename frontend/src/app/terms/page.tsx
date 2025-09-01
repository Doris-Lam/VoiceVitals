'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, FileText, AlertTriangle, Shield, Users, Calendar } from 'lucide-react'

export default function TermsPage() {
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">Terms of Service</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Please read these terms carefully before using our service</p>
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
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              By accessing and using VoiceVitals ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">2. Service Description</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              VoiceVitals is a voice-powered health tracking application that allows users to:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">Record voice descriptions of health symptoms and concerns</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">Track medications, vital signs, and health metrics</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">Receive AI-powered health insights and recommendations</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">Monitor health trends over time</p>
              </div>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">3. User Accounts</h2>
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                To use certain features of the Service, you must create an account. You agree to:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-600 dark:text-slate-400">Provide accurate and complete information</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-600 dark:text-slate-400">Maintain the security of your account credentials</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-600 dark:text-slate-400">Notify us immediately of any unauthorized use</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-600 dark:text-slate-400">Accept responsibility for all activities under your account</p>
                </div>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">4. Acceptable Use</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800/50 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">You agree not to:</h3>
              </div>
              <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>• Use the Service for any illegal or unauthorized purpose</p>
                <p>• Attempt to gain unauthorized access to our systems</p>
                <p>• Interfere with or disrupt the Service or servers</p>
                <p>• Upload malicious code or content</p>
                <p>• Violate any applicable laws or regulations</p>
              </div>
            </div>
          </section>

          {/* Medical Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">5. Medical Disclaimer</h2>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800/50">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold text-red-800 dark:text-red-200">Important Medical Notice</h3>
              </div>
              <div className="space-y-3 text-sm text-red-700 dark:text-red-300">
                <p><strong>VoiceVitals is not a substitute for professional medical advice, diagnosis, or treatment.</strong></p>
                <p>• Always seek the advice of qualified healthcare providers</p>
                <p>• Do not disregard professional medical advice based on our AI analysis</p>
                <p>• In case of emergency, contact emergency services immediately</p>
                <p>• Our AI insights are for informational purposes only</p>
              </div>
            </div>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">6. Privacy and Data</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800/50">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Data Protection</h3>
              </div>
              <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
                <p>• We protect your health data according to our Privacy Policy</p>
                <p>• Your data is encrypted and stored securely</p>
                <p>• We comply with applicable data protection laws</p>
                <p>• You retain ownership of your health data</p>
                <p>• You can request data deletion at any time</p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">7. Intellectual Property</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              The Service and its original content, features, and functionality are owned by VoiceVitals and are protected by international copyright, 
              trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">You retain ownership of your health data and content</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">We own the platform, software, and AI technology</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">You grant us license to process your data for service provision</p>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">8. Limitation of Liability</h2>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800/50">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">Liability Limitations</h3>
              </div>
              <div className="space-y-3 text-sm text-orange-700 dark:text-orange-300">
                <p>• We are not liable for any indirect, incidental, or consequential damages</p>
                <p>• Our total liability is limited to the amount you paid for the service</p>
                <p>• We are not responsible for medical decisions based on our analysis</p>
                <p>• Service availability is not guaranteed</p>
                <p>• We disclaim warranties to the extent permitted by law</p>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">9. Termination</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">You may terminate your account at any time</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">Upon termination, your right to use the Service ceases</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400">We may retain certain data as required by law</p>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">10. Changes to Terms</h2>
            <p className="text-slate-600 dark:text-slate-400">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service. 
              Your continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">11. Governing Law</h2>
            <p className="text-slate-600 dark:text-slate-400">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
              without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">12. Contact Information</h2>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600/50">
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p>Email: legal@voicevitals.com</p>
                <p>Address: [Your Company Address]</p>
                <p>Phone: [Your Phone Number]</p>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  )
}
