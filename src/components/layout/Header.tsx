'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Calendar, Users, BookOpen, Menu, X, Archive, Search, Clock, FileText, Settings, HelpCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthModal } from '@/components/auth/AuthModal'
import { UserMenu } from '@/components/auth/UserMenu'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  onCreateCourse?: () => void; // Making it optional
}

export const Header = ({ onCreateCourse }: HeaderProps) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isLoading } = useAuth()

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleNavigation = (path: string) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    window.location.href = path
  }

  return (
    <motion.header
      className="bg-white/70 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-gray-900">HydraSpace</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Input
                placeholder="Search notes, courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full"
                icon={<Search className="w-5 h-5 text-gray-400" />}
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigation("/courses")}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {user ? "Courses" : "Sign In to View Courses"}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigation("/community")}
            >
              <Users className="w-4 h-4 mr-2" />
              {user ? "Community" : "Sign In to View Community"}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigation("/calendar")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {user ? "Calendar" : "Sign In to View Calendar"}
            </Button>
            {user ? (
              <div className="flex items-center space-x-4">
                <Button onClick={onCreateCourse} size="sm" className="hidden lg:flex">
                  <Plus className="w-4 h-4 mr-2" />
                  New Course
                </Button>
                <UserMenu user={user} />
              </div>
            ) : (
              <Button onClick={() => setIsAuthModalOpen(true)} variant="primary" size="sm" className="shadow-lg shadow-blue-500/20">
                Sign In
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden bg-white border-b border-gray-200 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => handleNavigation("/courses")}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {user ? "Courses" : "Sign In to View Courses"}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => handleNavigation("/community")}
            >
              <Users className="w-4 h-4 mr-2" />
              {user ? "Community" : "Sign In to View Community"}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => handleNavigation("/calendar")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {user ? "Calendar" : "Sign In to View Calendar"}
            </Button>
            {user && (
              <>
                <Button onClick={onCreateCourse} className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  New Course
                </Button>
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={async () => {
                      const { signOut } = await import('@/lib/auth')
                      await signOut()
                      window.location.reload()
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && !user && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={() => setIsAuthModalOpen(false)}
        />
      )}
    </motion.header>
  )
}
