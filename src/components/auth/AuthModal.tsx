'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { signUp, signIn, sendPasswordResetEmail } from '@/lib/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: () => void
}

type AuthMode = 'signin' | 'signup' | 'reset'

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    university: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      if (mode === 'signup') {
        await signUp(formData.email, formData.password, formData.name, formData.university)
        onAuthSuccess()
        onClose()
      } else if (mode === 'signin') {
        await signIn(formData.email, formData.password)
        onAuthSuccess()
        onClose()
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(formData.email)
        setSuccessMessage('Recovery link sent! Check your inbox.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '', university: '' })
    setError('')
    setSuccessMessage('')
    setShowPassword(false)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4 py-6 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="min-h-full w-full flex items-center justify-center py-8">
            <motion.div
              className="w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
            <Card className="border-none shadow-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {mode === 'signup' ? 'Join HydraSpace' : mode === 'signin' ? 'Welcome Back' : 'Reset Password'}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <Input
                      label="Full Name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      icon={<User className="w-4 h-4" />}
                      required
                    />
                  )}

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    icon={<Mail className="w-4 h-4" />}
                    required
                  />

                  {mode !== 'reset' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => switchMode('reset')}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="w-full h-11 px-3 py-2 pl-10 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          placeholder="Your password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === 'signup' && (
                    <Input
                      label="University (Optional)"
                      placeholder="e.g., NUST"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      icon={<GraduationCap className="w-4 h-4" />}
                    />
                  )}

                  {error && (
                    <motion.div
                      className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div
                      className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-600 text-xs font-medium text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {successMessage}
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-12 rounded-xl shadow-lg shadow-blue-600/20 font-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{mode === 'signup' ? 'Creating...' : mode === 'signin' ? 'Signing In...' : 'Sending...'}</span>
                      </div>
                    ) : (
                      <span>{mode === 'signup' ? 'Create Account' : mode === 'signin' ? 'Sign In' : 'Send Recovery Link'}</span>
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500 font-medium tracking-tight">
                    {mode === 'signup' ? 'Already a member?' : mode === 'signin' ? "Not a member yet?" : "Remembered?"}
                    <button
                      onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}
                      className="ml-2 text-blue-600 hover:text-blue-700 font-bold"
                    >
                      {mode === 'signup' ? 'Login' : mode === 'signin' ? 'Join Now' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
