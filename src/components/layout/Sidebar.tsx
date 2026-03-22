'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Home, 
  BookOpen, 
  Users, 
  Calendar, 
  Clock,
  FileText,
  HelpCircle,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useData } from '@/contexts/DataContext'

export const Sidebar = () => {
  const pathname = usePathname()
  const { courses, notes } = useData()

  const menuItems = [
    { href: '/', icon: Home, label: 'Dashboard', active: pathname === '/' },
    { href: '/courses', icon: BookOpen, label: 'Courses', active: pathname === '/courses' },
    { href: '/community', icon: Users, label: 'Community', active: pathname === '/community' },
    { href: '/calendar', icon: Calendar, label: 'Calendar', active: pathname === '/calendar' },
    { href: '/timetable', icon: Clock, label: 'Timetable', active: pathname === '/timetable' },
    { href: '/notes', icon: FileText, label: 'Notes', active: pathname === '/notes' },
    { href: '/help', icon: HelpCircle, label: 'HydraSpace', active: pathname === '/help' },
  ]

  const quickStats = [
    { label: 'Active Courses', value: (courses || []).filter(c => !c.is_archived).length.toString() },
    { label: 'Total Notes', value: (notes || []).length.toString() },
    { label: 'Shared Notes', value: (notes || []).filter(n => n.is_shared).length.toString() },
  ]

  return (
    <motion.aside
      className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen p-6 sticky top-16"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Navigation */}
      <nav className="space-y-2 mb-8">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Quick Stats */}
      <div className="border-t border-gray-200 pt-6 mb-auto">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Quick Stats
        </h3>
        <div className="space-y-3">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="flex justify-between items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="text-sm text-gray-600">{stat.label}</span>
              <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <button
          onClick={async () => {
            const { signOut } = await import('@/lib/auth')
            await signOut()
            window.location.reload()
          }}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  )
}
