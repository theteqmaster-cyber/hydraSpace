'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Home, BookOpen, Users, Calendar, Plus, FileText, Clock, X, MessageSquare, List, Zap } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export const BottomNav = () => {
  const pathname = usePathname()
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false)

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/courses', icon: BookOpen, label: 'Courses' },
    { href: '/community', icon: Users, label: 'Library' },
    { href: '/calendar', icon: Calendar, label: 'Events' },
  ]

  const quickActions = [
    { label: 'New Note', icon: FileText, color: 'bg-blue-500', href: '/notes' },
    { label: 'Timetable', icon: Clock, color: 'bg-indigo-500', href: '/timetable' },
    { label: 'Ask AI', icon: MessageSquare, color: 'bg-purple-500', href: '#' },
    { label: 'Library', icon: Users, color: 'bg-emerald-500', href: '/community' },
  ]

  return (
    <>
      {/* Quick Action Overlay */}
      <AnimatePresence>
        {isQuickMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsQuickMenuOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-24 left-4 right-4 bg-white rounded-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-slate-900 mb-6">Quick Actions</h3>
              
              {/* Special AI Action - The "Surprise" */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert('Hydra AI: "I am preparing your academic summary. Coming soon in v1.0!"')}
                className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-lg shadow-blue-600/20 overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 fill-white animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-sm uppercase tracking-wider">Ask Hydra AI</div>
                    <div className="text-[10px] text-blue-100 font-bold">Smart Note Summaries</div>
                  </div>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest relative z-10">
                  BETA
                </div>
              </motion.button>

              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link 
                    key={action.label} 
                    href={action.href}
                    onClick={() => setIsQuickMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 active:bg-slate-100 transition-colors">
                      <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center text-white`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-700">{action.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-slate-200 lg:hidden z-40 px-6 pb-safe">
        <div className="flex items-center justify-between h-full max-w-md mx-auto relative">
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center space-y-1 group">
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-400 group-active:scale-95'}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* Quick Action FAB */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 transition-all ${isQuickMenuOpen ? 'bg-slate-900 rotate-45' : 'bg-blue-600'}`}
            >
              {isQuickMenuOpen ? <X className="w-7 h-7 text-white" /> : <Plus className="w-7 h-7 text-white" />}
            </motion.button>
          </div>

          <div className="w-14"></div> {/* Spacer for FAB */}

          {navItems.slice(2).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center space-y-1 group">
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-400 group-active:scale-95'}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
