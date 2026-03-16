'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Calendar, 
  Users, 
  Settings, 
  Home,
  FileText,
  Clock,
  TrendingUp
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
}

export const Sidebar = ({ isOpen = true }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '#', active: true },
    { icon: BookOpen, label: 'My Courses', href: '#', active: false },
    { icon: Calendar, label: 'Calendar', href: '#', active: false },
    { icon: Users, label: 'Community', href: '#', active: false },
    { icon: FileText, label: 'Recent Notes', href: '#', active: false },
    { icon: Clock, label: 'Timetable', href: '#', active: false },
    { icon: TrendingUp, label: 'Progress', href: '#', active: false },
    { icon: Settings, label: 'Settings', href: '#', active: false },
  ]

  return (
    <motion.aside
      className={`bg-white border-r border-gray-200 h-screen sticky top-16 ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden transition-all duration-300`}
      initial={{ x: -300 }}
      animate={{ x: isOpen ? 0 : -300 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.a>
          ))}
        </nav>

        {/* Quick Stats */}
        <motion.div
          className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-semibold text-gray-900 mb-3">Your Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Courses</span>
              <span className="font-medium">5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Notes</span>
              <span className="font-medium">47</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shared</span>
              <span className="font-medium">12</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  )
}
