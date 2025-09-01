'use client'

import { motion } from 'framer-motion'
import { Mic, Heart } from 'lucide-react'
import { NavigationLink } from '@/types'

const productLinks: NavigationLink[] = [
  { label: "Features", href: "/#features" },
  { label: "Voice Recorder", href: "/record" },
  { label: "AI Analysis", href: "/ai-analysis" },
  { label: "Privacy", href: "/privacy" },
]



export function Footer() {
  return (
    <footer className="relative py-16 lg:py-20 bg-gradient-to-t from-blue-50 to-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-100/80 to-white/0" />
      
      <div className="relative container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-blue-900">VoiceVitals</span>
                </div>
                <p className="text-blue-700 text-lg leading-relaxed max-w-md">
                  Revolutionizing healthcare accessibility through voice-powered AI. 
                  Track your health naturally and get intelligent insights instantly.
                </p>
              </motion.div>


            </div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-blue-900 font-semibold text-lg mb-6">Product</h3>
              <ul className="space-y-3">
                {productLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-blue-700 hover:text-blue-900 transition-colors duration-300 flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-blue-900 font-semibold text-lg mb-6">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/privacy"
                    className="text-blue-700 hover:text-blue-900 transition-colors duration-300 flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      Privacy Policy
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-blue-700 hover:text-blue-900 transition-colors duration-300 flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      Terms of Service
                    </span>
                  </a>
                </li>
              </ul>
            </motion.div>


          </div>



          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center justify-between pt-8 border-t border-blue-100"
          >
            <div className="flex items-center gap-2 text-blue-700 mb-4 lg:mb-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400" />
              <span>for better healthcare accessibility</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-blue-700">
              <span>© 2025 VoiceVitals. All rights reserved.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
