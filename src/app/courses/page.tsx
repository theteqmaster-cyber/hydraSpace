'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Footer } from '@/components/layout/Footer'
import { CourseCard } from '@/components/courses/CourseCard'
import { ArchivedCourses } from '@/components/courses/ArchivedCourses'
import { CreateCourseModal } from '@/components/courses/CreateCourseModal'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { useRouter } from 'next/navigation'
import { BookOpen, Archive, Plus, MoreHorizontal } from 'lucide-react'
import { Course } from '@/types'

function CoursesPageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { courses, notes, refreshData } = useData()
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')
  const [isArchiving, setIsArchiving] = useState<string | null>(null)

  const activeCourses = courses.filter(course => !course.is_archived)
  const archivedCourses = courses.filter(course => course.is_archived)

  const handleCreateCourse = () => {
    setIsCreateCourseModalOpen(true)
  }

  const handleArchiveCourse = async (courseId: string) => {
    setIsArchiving(courseId)
    try {
      const { updateCourse } = await import('@/lib/courses')
      await updateCourse(courseId, { 
        is_archived: true, 
        archived_at: new Date().toISOString() 
      })
      refreshData()
    } catch (error) {
      console.error('Error archiving course:', error)
    } finally {
      setIsArchiving(null)
    }
  }

  const handleUnarchiveCourse = async (courseId: string) => {
    try {
      const { updateCourse } = await import('@/lib/courses')
      await updateCourse(courseId, { 
        is_archived: false, 
        archived_at: undefined 
      })
      refreshData()
    } catch (error) {
      console.error('Error unarchiving course:', error)
    }
  }

  const getNotesCount = (courseId: string) => {
    return notes.filter(note => note.course_id === courseId).length
  }

  const getSharedCount = (courseId: string) => {
    return notes.filter(note => note.course_id === courseId && note.is_shared).length
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onCreateCourse={handleCreateCourse} />
      
      <main className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 mobile-safe-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-fluid-h2 text-gray-900">My Courses</h1>
                  <p className="text-gray-600 mt-2">
                    Manage your active and completed courses
                  </p>
                </div>
                <Button onClick={handleCreateCourse} className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  New Course
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    activeTab === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Active Courses ({activeCourses.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('archived')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    activeTab === 'archived'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  <span>Archived ({archivedCourses.length})</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'active' ? (
              <div className="space-y-6">
                {activeCourses.length === 0 ? (
                  <motion.div
                    className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Active Courses
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Get started by creating your first course.
                    </p>
                    <Button onClick={handleCreateCourse}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Course
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeCourses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        <CourseCard
                          course={course}
                          notesCount={getNotesCount(course.id)}
                          sharedCount={getSharedCount(course.id)}
                          onClick={(course) => {
                            router.push(`/courses/${course.id}`)
                          }}
                        />
                        
                        {/* Archive Button */}
                        <div className="absolute top-4 right-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchiveCourse(course.id)}
                            disabled={isArchiving === course.id}
                            className="bg-white/90 hover:bg-white shadow-sm"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <ArchivedCourses
                courses={archivedCourses}
                notes={notes}
                onUnarchiveCourse={handleUnarchiveCourse}
              />
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
      <BottomNav />
    </div>
  )
}

export default function CoursesPage() {
  return <CoursesPageContent />
}
