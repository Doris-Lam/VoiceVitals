'use client'

import { motion } from 'framer-motion'
import { Mic, Activity, Brain, Shield } from 'lucide-react'
import { scrollToElement } from '@/utils/helpers'
import { Feature } from '@/types'

const features: Feature[] = [
  { 
    icon: Activity, 
    title: "Voice Tracking", 
    description: "Speak naturally about your symptoms",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    icon: Brain, 
    title: "AI Analysis", 
    description: "Smart health insights powered by AI",
    color: "from-purple-500 to-pink-500"
  },
  { 
    icon: Shield, 
    title: "Secure & Private", 
    description: "Your health data stays protected",
    color: "from-green-500 to-emerald-500"
  },
]

export function Hero() {
  const handleScrollToRecorder = () => {
    scrollToElement('voice-recorder')
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 pb-12 px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-800 mb-6 leading-tight">
              Track Your Health with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                Your Voice
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Speak naturally about your symptoms and medications. Our AI understands and analyzes your health data to provide personalized insights.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <button
              onClick={handleScrollToRecorder}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Mic className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Try Voice Recording
            </button>
            <button
              onClick={() => scrollToElement('features')}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-8 py-4 rounded-2xl border border-slate-200 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Learn More
            </button>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * (index + 5) }}
                className="bg-white backdrop-blur-md rounded-2xl p-6 border border-slate-200 hover:bg-slate-50 transition-all duration-300 group shadow-md hover:shadow-lg"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-all duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-slate-800 font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-slate-500 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
