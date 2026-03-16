'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock,
  Zap,
  Shield,
  Target,
  Star,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

function HelpPageContent() {
  const { user } = useAuth()

  const features = [
    {
      icon: BookOpen,
      title: 'Smart Note-Taking',
      description: 'Organized notes for lectures, assignments, and key concepts with automatic saving.',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Community Sharing',
      description: 'Share knowledge with peers and discover notes from other students.',
      color: 'text-green-600'
    },
    {
      icon: Calendar,
      title: 'Academic Calendar',
      description: 'Never miss important dates with integrated calendar and timetable.',
      color: 'text-purple-600'
    },
    {
      icon: Clock,
      title: 'Time Management',
      description: 'Optimize your study schedule with smart timetable features.',
      color: 'text-orange-600'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built for speed with instant search and smooth animations.',
      color: 'text-yellow-600'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is secure with granular privacy controls.',
      color: 'text-red-600'
    },
    {
      icon: Target,
      title: 'Student Focused',
      description: 'Designed specifically for university students by students.',
      color: 'text-indigo-600'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Active Students' },
    { number: '50,000+', label: 'Notes Shared' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header onCreateCourse={() => {}} />
      
      <main className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-block"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center"
                  >
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      HS
                    </span>
                  </motion.div>
                </div>
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                  Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">HydraSpace</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Your digital academic workspace for university students. Built for speed, simplicity, and collaboration.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => window.location.href = user ? '/courses' : '/'}
                    className="group"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                  {user && (
                    <Button 
                      variant="ghost" 
                      onClick={() => window.location.href = '/courses'}
                    >
                      Go to Dashboard
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Features Grid */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Why Students Love HydraSpace
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-200"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Icon className={`w-8 h-8 ${feature.color}`} />
                        </div>
                      </div>
                      <h3 className={`text-xl font-bold mb-3 ${feature.color}`}>
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Stats Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Trusted by Students Worldwide
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200"
                  >
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white inline-block"
              >
                <h3 className="text-2xl font-bold mb-4">
                  Ready to Transform Your Academic Life?
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Join thousands of students already using HydraSpace to organize, collaborate, and excel.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="ghost" 
                    size="lg"
                    onClick={() => window.location.href = '/courses'}
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Explore Features
                  </Button>
                  <Button 
                    size="lg"
                    onClick={() => window.location.href = user ? '/courses' : '/'}
                  >
                    Start Free Trial
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </main>

      <Footer />
    </div>
  )
}

export default function HelpPage() {
  return (
    <AuthProvider>
      <HelpPageContent />
    </AuthProvider>
  )
}
