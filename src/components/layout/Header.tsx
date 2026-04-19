'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Calendar, Users, BookOpen, Menu, X, Archive, Search, Clock, FileText, Settings, HelpCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { UserMenu } from '@/components/auth/UserMenu'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  onCreateCourse?: () => void; // Making it optional
}

export const Header = ({ onCreateCourse }: HeaderProps) => {
  const router = useRouter()
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
      router.push('/login')
      return
    }
    router.push(path)
  }

  return (
    <motion.header
      className="bg-white/40 backdrop-blur-2xl border-b border-white/20 sticky top-0 z-50 selection:bg-blue-100"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 group-hover:bg-blue-600 transition-all duration-500">
               <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">HydraSpace</span>
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
          <nav className="hidden md:flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigation("/courses")}
              className="font-bold text-slate-600 hover:text-blue-600 px-4 rounded-xl"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigation("/community")}
              className="font-bold text-slate-600 hover:text-blue-600 px-4 rounded-xl"
            >
              <Users className="w-4 h-4 mr-2" />
              Vault
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigation("/calendar")}
              className="font-bold text-slate-600 hover:text-blue-600 px-4 rounded-xl"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <div className="w-px h-6 bg-slate-200 mx-4" />
            {user ? (
              <div className="flex items-center space-x-4">
                <Button onClick={onCreateCourse} size="sm" className="hidden lg:flex bg-slate-900 rounded-xl px-5 font-black">
                  <Plus className="w-4 h-4 mr-2" />
                  New Course
                </Button>
                <UserMenu user={user} />
              </div>
            ) : (
              <Button 
                onClick={() => router.push('/login')} 
                size="sm" 
                className="bg-blue-600 text-white font-black px-6 rounded-xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                ENTER PORTAL
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
              className="w-full justify-start font-bold"
              onClick={() => handleNavigation("/courses")}
            >
              <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
              Courses
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start font-bold"
              onClick={() => handleNavigation("/community")}
            >
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              Vault
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start font-bold"
              onClick={() => handleNavigation("/calendar")}
            >
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              Schedule
            </Button>
            {user && (
              <>
                <Button onClick={onCreateCourse} className="w-full justify-start font-black bg-slate-900 text-white rounded-xl mt-4">
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

    </motion.header>
  )
}
