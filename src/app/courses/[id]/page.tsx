'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { CourseNoteEditor } from '@/components/notes/CourseNoteEditor'
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
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { courses, notes, isLoading, refreshData } = useData()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('notes')
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

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
        
        <main className="flex-1 flex">
          <Sidebar />
          
          <main className="flex-1 p-8">
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
          </main>
        </main>
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
    setSelectedNote(null)
    setActiveTab(type === 'lecture' ? 'notes' : type === 'test' || type === 'concept' ? 'examtips' : 'assignments')
    setIsNoteEditorOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setSelectedNote(note)
    setIsNoteEditorOpen(true)
  }

  const handleSaveNote = async (noteData: Partial<Note>) => {
    try {
      if (selectedNote?.id) {
        // Update existing note
        const { updateNote } = await import('@/lib/notes')
        await updateNote(selectedNote.id, noteData)
      } else {
        // Create new note
        const { createNote } = await import('@/lib/notes')
        await createNote({
          ...noteData,
          user_id: user!.id,
          course_id: courseId
        } as Note)
      }
      
      refreshData()
      setIsNoteEditorOpen(false)
      setSelectedNote(null)
    } catch (error) {
      console.error('Error saving note:', error)
      throw error
    }
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
      
      <main className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 mobile-safe-padding">

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
              
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-4 w-full">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-white/20"
                    style={{ backgroundColor: course.color || '#3B82F6' }}
                  >
                    {course.code?.substring(0, 2).toUpperCase() || 'CO'}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{course.name}</h1>
                    {course.code && (
                      <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">{course.code}</p>
                    )}
                    {course.description && (
                      <p className="text-slate-600 mt-2 text-sm line-clamp-2 md:line-clamp-none">{course.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="flex overflow-x-auto custom-scrollbar border-b border-gray-200 hide-scrollbar scroll-smooth">
              {(['notes', 'examtips', 'assignments'] as TabType[]).map((tab) => {
                const Icon = getTabIcon(tab)
                const count = getNotesForTab().length
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-none sm:flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-bold transition-all whitespace-nowrap ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{getTabLabel(tab)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
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
      </main>

      <Footer />

      {/* Note Editor Modal */}
      {isNoteEditorOpen && course && (
        <CourseNoteEditor
          isOpen={isNoteEditorOpen}
          note={selectedNote || undefined}
          course={course}
          onSave={handleSaveNote}
          onCancel={() => {
            setIsNoteEditorOpen(false)
            setSelectedNote(null)
          }}
        />
      )}
    </div>
  )
}

export default function CourseDetailPage() {
  return <CourseDetailPageContent />
}
