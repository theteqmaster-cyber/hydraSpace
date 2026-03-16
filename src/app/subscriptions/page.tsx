'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { 
  CheckCircle, 
  Crown, 
  Zap, 
  Star,
  CreditCard,
  Wallet,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Plan {
  id: string
  name: string
  price: number
  features: string[]
  icon: any
  popular?: boolean
  current?: boolean
}

function SubscriptionsPageContent() {
  const [selectedPlan, setSelectedPlan] = useState<string>('free')
  const { user } = useAuth()

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free Forever',
      price: 0,
      features: [
        'Unlimited notes',
        '5 courses',
        'Basic community access',
        'Calendar & timetable',
        'Mobile app access'
      ],
      icon: Star,
      current: !user || selectedPlan === 'free'
    },
    {
      id: 'student',
      name: 'Student Pro',
      price: 20,
      features: [
        'Everything in Free',
        'Unlimited courses',
        'Advanced community features',
        'Note collaboration',
        'Export to PDF',
        'Priority support'
      ],
      icon: Crown,
      popular: true
    },
    {
      id: 'team',
      name: 'Team Edition',
      price: 50,
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Admin dashboard',
        'Bulk operations',
        'API access',
        'Custom branding'
      ],
      icon: Zap
    }
  ]

  const paymentMethods = [
    {
      name: 'EcoCash',
      icon: '💚',
      description: 'Fast, secure payments'
    },
    {
      name: 'MasterCard',
      icon: '💳',
      description: 'Credit and debit cards'
    },
    {
      name: 'Visa',
      icon: '💳',
      description: 'Global acceptance'
    }
  ]

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handleSubscribe = () => {
    // For demo purposes - just show success message
    alert(`Thank you for choosing ${plans.find(p => p.id === selectedPlan)?.name}! This is a demo - no actual payment will be processed.`)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onCreateCourse={() => {}} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sign in to access subscriptions
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Please sign in to view and manage your HydraSpace subscription.
            </p>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    )
  }

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
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Choose Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">HydraSpace</span> Plan
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Unlock powerful features designed for students. No credit card required.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {plans.map((plan, index) => {
                const Icon = plan.icon
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`relative bg-white rounded-xl shadow-lg p-8 border-2 cursor-pointer transition-all hover:shadow-xl ${
                      selectedPlan === plan.id 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 -right-3">
                        <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          POPULAR
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <div className="text-3xl font-bold text-gray-900 mb-6">
                        ${plan.price}
                        <span className="text-lg text-gray-500">/month</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.05 }}
                          className="flex items-center space-x-3"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {plan.current && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <span className="text-sm text-green-600 font-medium">✓ Current Plan</span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Payment Methods */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                Flexible Payment Options
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paymentMethods.map((method, index) => (
                  <motion.div
                    key={method.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200"
                  >
                    <div className="text-3xl mb-3">{method.icon}</div>
                    <h4 className="font-semibold text-gray-900 mb-2">{method.name}</h4>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white inline-block"
              >
                <h3 className="text-2xl font-bold mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Join HydraSpace today and transform your academic journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => window.location.href = '/courses'}
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Start Free Trial
                  </Button>
                  <Button 
                    size="lg"
                    onClick={handleSubscribe}
                    disabled={selectedPlan === 'free'}
                  >
                    Subscribe Now
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Trust Badges */}
            <div className="text-center">
              <div className="flex justify-center space-x-8 mb-8">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">No Credit Card Required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Cancel Anytime</span>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </main>

      <Footer />
    </div>
  )
}

export default function SubscriptionsPage() {
  return (
    <AuthProvider>
      <SubscriptionsPageContent />
    </AuthProvider>
  )
}
