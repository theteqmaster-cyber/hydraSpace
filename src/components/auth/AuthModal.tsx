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
        <div className="fixed inset-0 z-[110] overflow-y-auto hide-scrollbar scrollbar-hide">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-6">
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Modal Box */}
            <motion.div
              className="relative w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all z-10"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <Card className="border-none shadow-none">
                <CardHeader className="pb-4 pt-8 px-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                          {mode === 'signup' ? 'Join Hydra' : mode === 'signin' ? 'Welcome' : 'Reset'}
                        </h2>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">HydraSpace Suite</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {mode === 'signup' && (
                      <Input
                        label="Full Name"
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        icon={<User className="w-4 h-4" />}
                        required
                        className="rounded-2xl h-12"
                      />
                    )}

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="name@university.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      icon={<Mail className="w-4 h-4" />}
                      required
                      className="rounded-2xl h-12"
                    />

                    {mode !== 'reset' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => switchMode('reset')}
                            className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                          >
                            Forgot?
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full h-12 px-4 py-2 pl-12 pr-12 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium placeholder:text-slate-300"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                          />
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {mode === 'signup' && (
                      <Input
                        label="University"
                        placeholder="e.g. NUST"
                        value={formData.university}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        icon={<GraduationCap className="w-4 h-4" />}
                        className="rounded-2xl h-12"
                      />
                    )}

                    {error && (
                      <motion.div
                        className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-wide"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {error}
                      </motion.div>
                    )}

                    {successMessage && (
                      <motion.div
                        className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 text-xs font-bold uppercase tracking-wide text-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {successMessage}
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full h-14 rounded-2xl shadow-xl shadow-blue-600/20 font-black text-sm uppercase tracking-[0.1em] bg-blue-600 hover:bg-black transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <span>{mode === 'signup' ? 'Create Account' : mode === 'signin' ? 'Sign In' : 'Send Reset Link'}</span>
                      )}
                    </Button>
                  </form>

                  <div className="mt-8 text-center pt-6 border-t border-slate-50">
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                      {mode === 'signup' ? 'Have an account?' : mode === 'signin' ? "Not with us yet?" : "Found it?"}
                      <button
                        onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}
                        className="ml-2 text-blue-600 hover:text-black font-black underline underline-offset-4 decoration-2"
                      >
                        {mode === 'signup' ? 'Sign In' : mode === 'signin' ? 'Join Now' : 'Sign In'}
                      </button>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
