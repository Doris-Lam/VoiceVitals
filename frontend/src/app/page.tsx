'use client'

import { useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { Footer } from '@/components/Footer'

export default function Home() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 force-light-mode" style={{ colorScheme: 'light' }}>
      <Navbar />
      <Hero />
      <Features />
      <VoiceRecorder />
      <Footer />
    </div>
  )
}
// Trigger redeploy
