'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Archive, RotateCcw, Calendar, FileText, Users, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Course, Note } from '@/types'

interface ArchivedCoursesProps {
  courses: Course[]
  notes: Note[]
  onUnarchiveCourse: (courseId: string) => Promise<void>
}

export const ArchivedCourses = ({ courses, notes, onUnarchiveCourse }: ArchivedCoursesProps) => {
  const [isUnarchiving, setIsUnarchiving] = useState<string | null>(null)

  const handleUnarchive = async (courseId: string) => {
    setIsUnarchiving(courseId)
    try {
      await onUnarchiveCourse(courseId)
    } catch (error) {
      console.error('Error unarchiving course:', error)
    } finally {
      setIsUnarchiving(null)
    }
  }

  const getNotesCount = (courseId: string) => {
    return notes.filter(note => note.course_id === courseId).length
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (courses.length === 0) {
    return (
      <motion.div
        className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Archive className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Archived Courses
        </h3>
        <p className="text-gray-600">
          Completed courses will appear here when you archive them.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Archive className="w-6 h-6 text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-900">Archived Courses</h2>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
          {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold opacity-75"
                  style={{ backgroundColor: course.color || '#9CA3AF' }}
                >
                  {course.code?.substring(0, 2).toUpperCase() || 'CO'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{course.name}</h3>
                  {course.code && (
                    <p className="text-sm text-gray-500">{course.code}</p>
                  )}
                </div>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Archive className="w-4 h-4 text-gray-500" />
              </div>
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
                  <span className="font-semibold">{getNotesCount(course.id)}</span>
                </div>
                <p className="text-xs text-gray-500">Notes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-green-600">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">0</span>
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

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Archived:</span> {formatDate(course.archived_at || course.updated_at)}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                disabled={isUnarchiving === course.id}
              >
                <ChevronRight className="w-4 h-4 mr-2" />
                View Notes
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => handleUnarchive(course.id)}
                disabled={isUnarchiving === course.id}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {isUnarchiving === course.id ? 'Restoring...' : 'Unarchive'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
