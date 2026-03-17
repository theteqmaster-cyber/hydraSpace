'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Footer } from '@/components/layout/Footer'
import { CourseCard } from '@/components/courses/CourseCard'
import { CreateCourseModal } from '@/components/courses/CreateCourseModal'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { AuthModal } from '@/components/auth/AuthModal'

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
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { courses, notes, isLoading, refreshData, isOffline, lastSyncTime } = useData()
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false)
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const handleCreateCourse = () => {
    setIsCreateCourseModalOpen(true)
  }

  const handleCourseClick = (course: any) => {
    // Navigate to course detail page instead of opening note editor
    router.push(`/courses/${course.id}`)
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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header onCreateCourse={() => {}} />
        
        {/* Modern Hero Section */}
        <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 overflow-hidden bg-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold tracking-wide uppercase mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span>By Students, For Students</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-6xl lg:text-8xl font-black text-slate-900 leading-tight tracking-tighter mb-8"
              >
                The Digital Notebook <br />
                That Helps You <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Win</span>.
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed"
              >
                Stop drowning in loose papers and fragmented files. HydraSpace is the all-in-one OS for your academic life. Notes, classes, and collaboration — solved.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Button 
                  size="lg" 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="h-16 px-10 rounded-2xl text-lg font-bold shadow-2xl shadow-blue-600/30 group"
                >
                  Enter HydraSpace
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">🚀</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('why-hydra');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-16 px-10 rounded-2xl text-gray-500 hover:text-blue-600"
                >
                  See Why It Works
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section id="why-hydra" className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:rotate-6 transition-transform">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 text-left">Structured Notes</h3>
                <p className="text-slate-600 leading-relaxed text-left">Linked directly to your courses. No more searching for "that one lecture" — it's exactly where it belongs.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:-rotate-6 transition-transform">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 text-left">Academic Flow</h3>
                <p className="text-slate-600 leading-relaxed text-left">Integrated timetable and calendar. We know when your exams are because you do. Stay ahead, always.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:rotate-12 transition-transform">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 text-left">The Library</h3>
                <p className="text-slate-600 leading-relaxed text-left">Share your knowledge or learn from the best. Access a community-driven database of verified notes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Placeholder / Pitch */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-left">
                <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
                  Stop stressing. <br />
                  Start <span className="text-blue-600">mastering</span> your degree.
                </h2>
                <div className="space-y-6">
                  {[
                    "Zero setup required. Just sign up and start learning.",
                    "Mobile friendly. Study in the commute or in the library.",
                    "99.9% Uptime. Your notes are always available when you need them.",
                    "Built by NUST students who understand the struggle."
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="mt-1 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 text-[10px] font-bold">✓</span>
                      </div>
                      <p className="text-slate-700 font-medium">{item}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = '/courses'}
                  className="mt-10 h-14 rounded-xl px-8"
                >
                  Join the Community
                </Button>
              </div>
              <div className="flex-1 relative">
                 <div className="w-full h-[400px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl border-4 border-white shadow-2xl relative overflow-hidden flex items-center justify-center">
                    <div className="text-6xl">🎓</div>
                    <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[1px]"></div>
                 </div>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
        
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            onAuthSuccess={() => router.push('/courses')}
          />
        )}
      </div>
    )
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
                  <h1 className="text-fluid-h1 text-gray-900">
                    Welcome back, <span className="text-blue-600">{user.name?.split(' ')[0] || 'Student'}</span>!
                  </h1>
                  <p className="text-gray-500 mt-3 text-lg">
                    Here's a snapshot of your academic journey today.
                    {isOffline && (
                      <span className="ml-2 text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-lg text-sm uppercase">
                        Offline
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
      <BottomNav />
    </div>
  )
}

export default function HomePage() {
  return <HomeContent />
}
