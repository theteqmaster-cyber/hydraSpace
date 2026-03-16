'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Menu, X, Plus, BookOpen, Users, Calendar, Clock, FileText, Settings, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthModal } from '@/components/auth/AuthModal'
import { UserMenu } from '@/components/auth/UserMenu'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface HeaderProps {
  onCreateCourse?: () => void; // Making it optional
}

export const Header = ({ onCreateCourse }: HeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isLoading } = useAuth()

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <motion.header
      className="bg-white border-b border-gray-200 sticky top-0 z-40"
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
            <Link href="/courses">
              <Button variant="ghost" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Courses
              </Button>
            </Link>
            <Link href="/community">
              <Button variant="ghost" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Community
              </Button>
            </Link>
            <Link href="/calendar">
              <Button variant="ghost" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </Link>
            {user ? (
              <Button onClick={onCreateCourse} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Course
              </Button>
            ) : (
              <Button onClick={() => setIsSearchOpen(true)} variant="primary" size="sm">
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
            <Link href="/courses" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Courses
              </Button>
            </Link>
            <Link href="/community" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Community
              </Button>
            </Link>
            <Link href="/calendar" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </Link>
            {user && (
              <Button onClick={onCreateCourse} className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                New Course
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Auth Modal */}
      {isSearchOpen && !user && (
        <AuthModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onAuthSuccess={() => setIsSearchOpen(false)}
        />
      )}
    </motion.header>
  )
}
