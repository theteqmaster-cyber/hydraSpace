'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { updatePassword } from '@/lib/auth'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await updatePassword(password)
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-none shadow-2xl overflow-hidden">
          <CardHeader className="pb-4 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Secure Your Account</h1>
            <p className="text-slate-500 mt-2">Enter your new password below</p>
          </CardHeader>

          <CardContent className="pt-6">
            {isSuccess ? (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Password Updated!</h2>
                <p className="text-slate-500 mb-8">You can now sign in with your new password.</p>
                <Link href="/">
                  <Button variant="primary" className="w-full h-12 rounded-xl font-bold">
                    Go to Login
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full h-12 px-4 py-2 pl-12 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-12 rounded-xl shadow-lg shadow-blue-600/20 font-black tracking-tight"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Securing...</span>
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <Link href="/" className="flex items-center justify-center space-x-2 text-slate-400 hover:text-slate-600 transition-colors pt-4 text-sm font-bold">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 opacity-50">
                <GraduationCap className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">HydraSpace v0.1.0</span>
            </div>
        </div>
      </motion.div>
    </div>
  )
}
