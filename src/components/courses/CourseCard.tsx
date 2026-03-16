'use client'

import { motion } from 'framer-motion'
import { BookOpen, FileText, Calendar, Users, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Course } from '@/types'

interface CourseCardProps {
  course: Course
  notesCount?: number
  sharedCount?: number
  onClick?: () => void
}

export const CourseCard = ({ 
  course, 
  notesCount = 0, 
  sharedCount = 0, 
  onClick 
}: CourseCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{course.name}</h3>
                {course.code && (
                  <p className="text-sm text-gray-500">{course.code}</p>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          {course.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {course.description}
            </p>
          )}

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-blue-600">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">{notesCount}</span>
              </div>
              <p className="text-xs text-gray-500">Notes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-green-600">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{sharedCount}</span>
              </div>
              <p className="text-xs text-gray-500">Shared</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-purple-600">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">12</span>
              </div>
              <p className="text-xs text-gray-500">Lectures</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="flex-1">
              View Notes
            </Button>
            <Button variant="primary" size="sm" className="flex-1">
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
