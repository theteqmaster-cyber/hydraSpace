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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onCreateCourse={() => {}} />
      
      <main className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Branding Header */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">The Student OS</h4>
                    <h1 className="text-4xl font-black text-slate-900">HydraSpace</h1>
                </div>
              </div>

              {/* Manifest Text */}
              <div className="mb-20">
                <h2 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-8">
                  Built by students. <br />
                  Verified by <span className="text-blue-600 italic">results</span>.
                </h2>
                <div className="text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                  We built HydraSpace because spreadsheets are for accountants and paper is for the 19th century. 
                  You deserve a workspace that moves as fast as you do.
                </div>
              </div>

              {/* The "Why" Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative overflow-hidden group">
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors"></div>
                  <Target className="w-10 h-10 text-blue-600 mb-6" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Precision Mastery</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Stop collecting notes. Start building a knowledge base. Our system links every snippet to your curriculum, making revision a 10-minute task, not a 10-hour struggle.
                  </p>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
                   <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                  <Shield className="w-10 h-10 text-blue-400 mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Unshakeable Trust</h3>
                  <p className="text-slate-300 leading-relaxed">
                    With **99.9% uptime** and enterprise-grade security via Supabase, your academic life is safe. Your notes won't disappear when you need them most.
                  </p>
                </div>
              </div>

              {/* The Invitation Section */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                
                <div className="relative z-10">
                  <span className="px-4 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-6 inline-block">Invitation Only</span>
                  <h3 className="text-4xl font-black mb-6">Your digital notebook is here. <br />Ready to ace those exams?</h3>
                  <p className="text-blue-100 text-lg mb-10 max-w-xl">
                    HydraSpace isn't just an app — it's a competitive advantage. Join the students from NUST and beyond who are reclaiming their time.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      variant="ghost" 
                      className="bg-white text-blue-600 hover:bg-white/90 h-14 rounded-2xl px-10 font-bold"
                      onClick={() => window.location.href = '/courses'}
                    >
                      Enter Your Workspace
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-white border-2 border-white/30 h-14 rounded-2xl px-10 font-bold hover:bg-white/10"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'HydraSpace',
                            text: 'Check out HydraSpace - the best workspace for students!',
                            url: window.location.origin
                          })
                        } else {
                          alert('Link copied to clipboard: ' + window.location.origin)
                        }
                      }}
                    >
                      Spread the Word 📣
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-20 text-center text-slate-400 text-sm font-medium pb-20">
                Created with ❤️ for students, by students. Version 0.1.0-alpha
              </div>
            </motion.div>
          </div>
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
