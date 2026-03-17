'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { CourseCard } from '@/components/courses/CourseCard'
import { CreateCourseModal } from '@/components/courses/CreateCourseModal'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'

interface Course {
  id: string
  name: string
  code: string
  description?: string
  color?: string
  user_id: string
  created_at: string
  updated_at: string
}

interface Note {
  id: string
  title: string
  content: string
  type: 'lecture' | 'assignment' | 'test' | 'concept'
  lecture_number?: number
  is_shared: boolean
  user_id: string
  course_id: string
  created_at: string
  updated_at: string
}

function HomeContent() {
  const { user } = useAuth()
  const { courses, notes, isLoading, refreshData, isOffline, lastSyncTime } = useData()
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false)
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  const handleCreateCourse = () => {
    setIsCreateCourseModalOpen(true)
  }

  const handleCourseClick = (course: any) => {
    // Navigate to course detail page instead of opening note editor
    window.location.href = `/courses/${course.id}`
  }

  const activeCourses = courses.filter(course => !course.is_archived)
  
  const getNotesCount = (courseId: string) => {
    return notes.filter(note => note.course_id === courseId).length
  }

  const getSharedCount = (courseId: string) => {
    return notes.filter(note => note.course_id === courseId && note.is_shared).length
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Header onCreateCourse={() => {}} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">HS</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">HydraSpace</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your digital academic workspace for university students. Organize notes, manage courses, and collaborate with peers - all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/help'}
                className="group"
              >
                Learn More
                <span className="ml-2">🎓</span>
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => window.location.href = '/courses'}
              >
                Sign In to Get Started
              </Button>
            </div>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onCreateCourse={handleCreateCourse} />
      
      <main className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600 mt-2">
                    Welcome back! Here's your academic overview
                    {isOffline && (
                      <span className="ml-2 text-orange-600 font-medium">
                        (Offline Mode)
                      </span>
                    )}
                    {lastSyncTime && (
                      <span className="ml-2 text-sm text-gray-500">
                        Last sync: {lastSyncTime.toLocaleTimeString()}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Button
                    variant="secondary"
                    onClick={refreshData}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button onClick={handleCreateCourse}>
                    Create Course
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 bg-blue-600 rounded"></div>
                  </div>
                  <h3 className="font-semibold text-gray-900">Active Courses</h3>
                </div>
                <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
                <p className="text-sm text-gray-600">this semester</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 bg-green-600 rounded"></div>
                  </div>
                  <h3 className="font-semibold text-gray-900">Total Notes</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">{notes.length}</p>
                <p className="text-sm text-gray-600">created</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 bg-purple-600 rounded"></div>
                  </div>
                  <h3 className="font-semibold text-gray-900">Shared Notes</h3>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {notes.filter(n => n.is_shared).length}
                </p>
                <p className="text-sm text-gray-600">with community</p>
              </motion.div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard
                    course={course}
                    notesCount={getNotesCount(course.id)}
                    sharedCount={getSharedCount(course.id)}
                    onClick={() => handleCourseClick(course)}
                  />
                </motion.div>
              ))}
            </div>

            {activeCourses.length === 0 && !isLoading && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl text-gray-400">📚</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No courses yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first course to start organizing your academic journey.
                </p>
                <Button onClick={handleCreateCourse}>
                  Create Your First Course
                </Button>
              </motion.div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading courses...</p>
              </div>
            )}
          </motion.div>
        </main>
      </main>

      <Footer />

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={isCreateCourseModalOpen}
        onClose={() => setIsCreateCourseModalOpen(false)}
        onCreateCourse={async (courseData) => {
          try {
            const { createCourse } = await import('@/lib/courses')
            await createCourse(courseData, user!.id)
            setIsCreateCourseModalOpen(false)
            refreshData()
          } catch (error) {
            console.error('Error creating course:', error)
          }
        }}
      />

      <Footer />
    </div>
  )
}

export default function HomePage() {
  return <HomeContent />
}
