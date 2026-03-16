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
  Settings,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'

export const Sidebar = () => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/', active: true },
    { icon: BookOpen, label: 'Courses', href: '/courses', active: false },
    { icon: Users, label: 'Community', href: '/community', active: false },
    { icon: Calendar, label: 'Calendar', href: '/calendar', active: false },
    { icon: Clock, label: 'Timetable', href: '/timetable', active: false },
    { icon: FileText, label: 'Notes', href: '/notes', active: false },
    { icon: Settings, label: 'Settings', href: '/settings', active: false },
    { icon: HelpCircle, label: 'Help', href: '/help', active: false },
  ]

  const quickStats = [
    { label: 'Active Courses', value: '3' },
    { label: 'Total Notes', value: '24' },
    { label: 'Shared Notes', value: '8' },
  ]

  return (
    <motion.aside
      className="w-64 bg-white border-r border-gray-200 min-h-screen p-6"
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
      <div className="border-t border-gray-200 pt-6">
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
    </motion.aside>
  )
}
