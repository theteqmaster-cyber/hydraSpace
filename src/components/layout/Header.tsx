'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Calendar, Users, Search, Menu, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { UserMenu } from '@/components/auth/UserMenu'
import { AuthModal } from '@/components/auth/AuthModal'

interface HeaderProps {
  onCreateCourse?: () => void
}

export const Header = ({ onCreateCourse }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { user, isLoading } = useAuth()

  return (
    <>
      <motion.header 
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">HydraSpace</h1>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <motion.a 
                href="#" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <BookOpen className="w-4 h-4" />
                <span>My Courses</span>
              </motion.a>
              <motion.a 
                href="#" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </motion.a>
              <motion.a 
                href="#" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Users className="w-4 h-4" />
                <span>Community</span>
              </motion.a>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <motion.div
                className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2"
                whileFocus={{ scale: 1.02 }}
              >
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="bg-transparent outline-none text-sm w-48"
                />
              </motion.div>

              {user ? (
                <>
                  <Button 
                    onClick={onCreateCourse}
                    className="hidden md:flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Course</span>
                  </Button>
                  <UserMenu user={user} />
                </>
              ) : (
                !isLoading && (
                  <Button onClick={() => setIsAuthModalOpen(true)}>
                    Sign In
                  </Button>
                )
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => window.location.reload()}
      />
    </>
  )
}
