'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { X, Mail, Lock, User, GraduationCap, Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { signUp, signIn, sendPasswordResetEmail } from '@/lib/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

type AuthMode = 'signin' | 'signup' | 'reset'

// --- PREMIUM BACKGROUND AURA COMPONENT ---
const BackgroundAura = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 bg-[#f8fafc]">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -right-[10%] w-[800px] h-[800px] bg-blue-100/30 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 60, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[100px]"
      />
      <div className="absolute inset-0 w-full h-full opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMode = (searchParams.get('mode') as AuthMode) || 'signin'
  
  const [mode, setMode] = useState<AuthMode>(initialMode)
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

  useEffect(() => {
    const m = searchParams.get('mode') as AuthMode
    if (m && (m === 'signin' || m === 'signup' || m === 'reset')) {
      setMode(m)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      if (mode === 'signup') {
        await signUp(formData.email, formData.password, formData.name, formData.university)
        router.push('/courses')
      } else if (mode === 'signin') {
        await signIn(formData.email, formData.password)
        router.push('/courses')
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

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError('')
    setSuccessMessage('')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative selection:bg-blue-100 selection:text-blue-700 py-12 px-4 sm:px-6 lg:px-8">
      <BackgroundAura />
      
      {/* Back to Home Button */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-8 left-8"
      >
        <Link 
          href="/"
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hydra</span>
        </Link>
      </motion.div>

      <div className="w-full max-w-xl">
        {/* Branding Title */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-[0.2em] uppercase mb-6"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Academic Operating System</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2"
          >
            {mode === 'signup' ? 'Create Your Account' : mode === 'signin' ? 'Sign In to Proceed' : 'Reset Your Password'}
          </motion.h1>
          <p className="text-slate-500 font-medium">Join thousands of students optimizing their study workflow.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-[0_32px_64px_-16px_rgba(30,41,59,0.12)] rounded-[2.5rem] overflow-hidden bg-white">
            <CardContent className="p-8 sm:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'signup' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      icon={<User className="w-4 h-4" />}
                      required
                      className="rounded-2xl h-14"
                    />
                    <Input
                      label="University"
                      placeholder="e.g. NUST"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      icon={<GraduationCap className="w-4 h-4" />}
                      className="rounded-2xl h-14"
                    />
                  </div>
                )}

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  icon={<Mail className="w-4 h-4" />}
                  required
                  className="rounded-2xl h-14"
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
                        className="w-full h-14 px-4 py-2 pl-12 pr-12 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium placeholder:text-slate-300"
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
                  className="w-full h-16 rounded-2xl shadow-2xl shadow-blue-600/20 font-black text-lg group bg-blue-600 hover:bg-black transition-all flex items-center justify-center gap-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{mode === 'signup' ? 'Creating Academy...' : mode === 'signin' ? 'Entering Space...' : 'Sending Link...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'signup' ? 'Join the Hub' : mode === 'signin' ? 'Enter Dashboard' : 'Send Recovery Link'}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-10 text-center pt-8 border-t border-slate-50">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                  {mode === 'signup' ? 'Already an Elite?' : mode === 'signin' ? "New to HydraSpace?" : "Remembered?"}
                  <button
                    onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}
                    className="ml-2 text-blue-600 hover:text-black font-black underline underline-offset-8 decoration-2"
                  >
                    {mode === 'signup' ? 'Sign In' : mode === 'signin' ? 'Create Account' : 'Back to Login'}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Simple Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">Master Your degree with HydraSpace</p>
          <div className="flex items-center justify-center space-x-6 text-slate-400">
             <Link href="/help" className="text-[10px] font-bold hover:text-blue-600 uppercase tracking-widest transition-colors">Help Center</Link>
             <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
             <Link href="/privacy" className="text-[10px] font-bold hover:text-blue-600 uppercase tracking-widest transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginContent />
    </Suspense>
  )
}
