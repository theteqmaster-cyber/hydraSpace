'use client'

import { motion } from 'framer-motion'

interface LoadingScreenProps {
  message?: string
}

export const LoadingScreen = ({ message = 'Initializing your workspace...' }: LoadingScreenProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-6 max-w-xs text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600/20 border-t-blue-600"></div>
          <motion.div 
            className="absolute inset-0 flex items-center justify-center text-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🚀
          </motion.div>
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">HydraSpace</h2>
          <p className="text-slate-500 font-bold text-sm animate-pulse uppercase tracking-widest">{message}</p>
        </div>
      </div>
    </div>
  )
}
