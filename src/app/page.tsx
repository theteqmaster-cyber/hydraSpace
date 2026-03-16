'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { CourseCard } from '@/components/courses/CourseCard'
import { CreateCourseModal } from '@/components/courses/CreateCourseModal'
import { Footer } from '@/components/layout/Footer'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Course } from '@/types'

function HomeContent() {
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false)
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Load courses when user is available
  useEffect(() => {
    if (user) {
      loadCourses()
    } else {
      setCourses([])
      setIsLoading(false)
    }
  }, [user])

  const loadCourses = async () => {
    try {
      setIsLoading(true)
      const { getCourses } = await import('@/lib/courses')
      const userCourses = await getCourses(user!.id)
      
      // Get stats for each course
      const { getCourseStats } = await import('@/lib/courses')
      const coursesWithStats = await Promise.all(
        userCourses.map(async (course) => {
          const stats = await getCourseStats(course.id)
          return { ...course, ...stats }
        })
      )
      
      setCourses(coursesWithStats)
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCourse = async (courseData: { name: string; code?: string; description?: string }) => {
    if (!user) return
    
    try {
      const { createCourse } = await import('@/lib/courses')
      const newCourse = await createCourse(courseData, user.id)
      setCourses([newCourse, ...courses])
    } catch (error) {
      console.error('Error creating course:', error)
      // Show error to user
    }
  }

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course)
    setIsNoteEditorOpen(true)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onCreateCourse={() => setIsCreateCourseModalOpen(true)} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <div className="w-12 h-12 bg-white rounded-lg"></div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to HydraSpace
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your digital academic workspace for organizing courses, taking structured notes, and collaborating with peers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Organized Courses</h3>
                <p className="text-gray-600 text-sm">Structure your academic life with course-based organization</p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Notes</h3>
                <p className="text-gray-600 text-sm">Structured note-taking for lectures, assignments, and concepts</p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-purple-600 rounded"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
                <p className="text-gray-600 text-sm">Share and discover notes from your peers</p>
              </motion.div>
            </div>

            <p className="text-gray-600">
              Sign in to get started with your academic journey
            </p>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onCreateCourse={() => setIsCreateCourseModalOpen(true)} />
      
      <main className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
              <p className="text-gray-600">Manage your courses and notes in one place</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard
                    course={course}
                    notesCount={(course as any).notesCount || 0}
                    sharedCount={(course as any).sharedCount || 0}
                    onClick={() => handleCourseClick(course)}
                  />
                </motion.div>
              ))}
            </div>

            {courses.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-4">Create your first course to get started with HydraSpace</p>
                <button
                  onClick={() => setIsCreateCourseModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Course
                </button>
              </motion.div>
            )}
          </motion.div>
        </main>
      </main>

      <Footer />

      <CreateCourseModal
        isOpen={isCreateCourseModalOpen}
        onClose={() => setIsCreateCourseModalOpen(false)}
        onCreateCourse={handleCreateCourse}
      />

      {isNoteEditorOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <NoteEditor
              courseId={selectedCourse.id}
              onSave={async (noteData) => {
                try {
                  if (noteData.id) {
                    // Update existing note
                    const { updateNote } = await import('@/lib/notes')
                    await updateNote(noteData.id, noteData)
                  } else {
                    // Create new note
                    const { createNote } = await import('@/lib/notes')
                    await createNote({
                      ...noteData,
                      user_id: user!.id,
                      course_id: selectedCourse.id,
                      type: noteData.type || 'lecture'
                    } as any)
                  }
                  console.log('Note saved successfully')
                  setIsNoteEditorOpen(false)
                } catch (error) {
                  console.error('Error saving note:', error)
                  // Show error to user
                }
              }}
              onCancel={() => setIsNoteEditorOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  )
}
