'use client'

import { motion } from 'framer-motion'
import { Mic, Brain, Clock, Users, Shield, Zap, Heart, MessageSquare } from 'lucide-react'
import { Feature } from '@/types'

const features: Feature[] = [
  {
    icon: Mic,
    title: "Voice Recognition",
    description: "Advanced speech-to-text powered by Web Speech API for accurate symptom logging",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Brain,
    title: "AI Health Analysis",
    description: "Google Gemini AI processes your symptoms and provides intelligent health insights",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Clock,
    title: "Medication Tracking",
    description: "Track dosages, timing, and medication schedules with simple voice commands",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Accessibility First",
    description: "Designed for seniors, people with disabilities, and anyone preferring hands-free interaction",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Shield,
    title: "Privacy Protected",
    description: "Your health data is encrypted and stored securely with complete privacy controls",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "Instant analysis and feedback for immediate health insights and recommendations",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Heart,
    title: "Health Trends",
    description: "Track patterns in your symptoms and medications over time with visual charts",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: MessageSquare,
    title: "Natural Conversation",
    description: "Speak naturally - no complex forms or interfaces, just tell us how you feel",
    color: "from-teal-500 to-green-500",
  },
]

export function Features() {

  return (
    <section id="features" className="py-24 lg:py-32 relative bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-slate-800 mb-6">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Better Health
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            VoiceVitals combines cutting-edge AI with intuitive voice interaction to revolutionize 
            how you track and understand your health.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl backdrop-blur-md border border-slate-200 transition-all duration-300 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:border-blue-300 shadow-md group-hover:shadow-lg" />
              
              {/* Card Content */}
              <div className="relative p-8 text-center">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300" />
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  )
}
