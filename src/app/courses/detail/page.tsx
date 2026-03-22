'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { 
  BookOpen, 
  FileText, 
  AlertCircle, 
  Plus, 
  ArrowLeft,
  Calendar,
  User,
  Clock
} from 'lucide-react'

import { Course, Note } from '@/types'

type TabType = 'notes' | 'examtips' | 'assignments'

function CourseDetailPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { courses, notes, isLoading, refreshData } = useData()
  const courseId = searchParams.get('id') as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('notes')

  // Synchronize local course state with the courses array from context
  useEffect(() => {
    if (courses.length > 0) {
      const foundCourse = courses.find(c => c.id === courseId)
      setCourse(foundCourse || null)
    }
  }, [courseId, courses])

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header onCreateCourse={() => {}} />
        
        <div className="flex-1 flex">
          <Sidebar />
          
          <div className="flex-1 p-8">
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
              {isLoading || isAuthLoading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Syncing course data...</p>
                </>
              ) : (
                <>
                  <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
                  <p className="text-gray-600 mb-8 max-w-sm text-center">
                    We couldn't find the course you're looking for. It may have been deleted or the link might be incorrect.
                  </p>
                  <Button onClick={() => router.push('/courses')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to My Courses
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Filter notes for this course and by type
  const courseNotes = notes.filter(note => note.course_id === courseId)
  const lectureNotes = courseNotes.filter(note => note.type === 'lecture')
  const examTips = courseNotes.filter(note => note.type === 'test' || note.type === 'concept')
  const assignments = courseNotes.filter(note => note.type === 'assignment')

  const getNotesForTab = () => {
    switch (activeTab) {
      case 'notes':
        return lectureNotes
      case 'examtips':
        return examTips
      case 'assignments':
        return assignments
      default:
        return lectureNotes
    }
  }

  const handleCreateNote = (type: Note['type']) => {
    router.push(`/notes/new?courseId=${courseId}&type=${type}`)
  }

  const handleEditNote = (note: Note) => {
    router.push(`/notes/edit?id=${note.id}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'notes': return BookOpen
      case 'examtips': return AlertCircle
      case 'assignments': return FileText
      default: return FileText
    }
  }

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'notes': return 'Lecture Notes'
      case 'examtips': return 'Exam Tips'
      case 'assignments': return 'Assignments'
      default: return 'Notes'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onCreateCourse={() => {}} />
      
      <div className="flex-1 flex min-w-0">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 mobile-safe-padding min-w-0 overflow-hidden">

          {/* Course Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2 -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </div>
              
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-8 relative overflow-hidden group">
            <div 
              className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] -translate-y-8 translate-x-8 transition-transform duration-500 group-hover:scale-110"
              style={{ color: course.color || '#3B82F6' }}
            >
              <BookOpen className="w-full h-full" />
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 relative z-10">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20 flex-shrink-0"
                style={{ backgroundColor: course.color || '#3B82F6' }}
              >
                {course.code?.substring(0, 2).toUpperCase() || 'CO'}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight truncate">{course.name}</h1>
                  {course.code && (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px] w-fit mx-auto md:mx-0">
                      {course.code}
                    </span>
                  )}
                </div>
                {course.description && (
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto md:mx-0 italic">
                    {course.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 bg-slate-50/30">
              {(['notes', 'examtips', 'assignments'] as TabType[]).map((tab) => {
                const Icon = getTabIcon(tab)
                const count = getNotesForTab().length
                const isActive = activeTab === tab
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center space-x-3 px-6 py-5 font-bold transition-all relative whitespace-nowrap overflow-hidden ${
                      isActive
                        ? 'text-blue-600 bg-white'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                    <span className="text-sm tracking-tight">{getTabLabel(tab)}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-colors ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {count}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {getTabLabel(activeTab)} <span className="text-slate-400 font-medium ml-1">({getNotesForTab().length})</span>
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {activeTab === 'notes' && (
                <Button onClick={() => handleCreateNote('lecture')} className="flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              )}
              {activeTab === 'examtips' && (
                <>
                  <Button variant="secondary" onClick={() => handleCreateNote('concept')} className="flex-1 sm:flex-none">
                    <Plus className="w-4 h-4 mr-2" />
                    Concept
                  </Button>
                  <Button onClick={() => handleCreateNote('test')} className="flex-1 sm:flex-none">
                    <Plus className="w-4 h-4 mr-2" />
                    Exam Tip
                  </Button>
                </>
              )}
              {activeTab === 'assignments' && (
                <Button onClick={() => handleCreateNote('assignment')} className="flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  New Assignment
                </Button>
              )}
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-4">
            {getNotesForTab().length === 0 ? (
              <motion.div
                className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {(() => {
                    const Icon = getTabIcon(activeTab)
                    return Icon ? <Icon className="w-8 h-8 text-gray-400" /> : null
                  })()}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No {getTabLabel(activeTab).toLowerCase()} yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by creating your first {getTabLabel(activeTab).toLowerCase().slice(0, -1)} for this course.
                </p>
                <Button onClick={() => {
                  if (activeTab === 'notes') handleCreateNote('lecture')
                  else if (activeTab === 'examtips') handleCreateNote('concept')
                  else handleCreateNote('assignment')
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First {getTabLabel(activeTab).slice(0, -1)}
                </Button>
              </motion.div>
            ) : (
              getNotesForTab().map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEditNote(note)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {(() => {
                          const Icon = getTabIcon(activeTab)
                          return Icon ? <Icon className="w-5 h-5 text-blue-600" /> : null
                        })()}
                        <span className="text-sm text-gray-500 capitalize">{note.type}</span>
                        {note.lecture_number && (
                          <span className="text-sm text-gray-500">Lecture {note.lecture_number}</span>
                        )}
                        {note.is_shared && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Shared
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>You</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(note.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default function CourseDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <CourseDetailPageContent />
    </Suspense>
  )
}
