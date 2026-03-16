'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { CourseCard } from '@/components/courses/CourseCard'
import { CreateCourseModal } from '@/components/courses/CreateCourseModal'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Course } from '@/types'

function CoursesPageContent() {
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

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
    }
  }

  const handleCourseClick = (course: Course) => {
    // Navigate to course details page
    window.location.href = `/courses/${course.id}`
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onCreateCourse={() => {}} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sign in to access your courses
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Please sign in to view and manage your courses.
            </p>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onCreateCourse={() => {}} />
      
      <main className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">All Courses</h1>
              <p className="text-gray-600">Manage and organize all your academic courses</p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                </div>
                <p className="text-gray-600">Loading courses...</p>
              </div>
            ) : (
              <>
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
              </>
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
    </div>
  )
}

export default function CoursesPage() {
  return (
    <AuthProvider>
      <CoursesPageContent />
    </AuthProvider>
  )
}
