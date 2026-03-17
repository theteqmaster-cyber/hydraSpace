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
  const { user } = useAuth()
  const { courses, notes, isLoading, refreshData } = useData()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('notes')
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  useEffect(() => {
    const foundCourse = courses.find(c => c.id === courseId)
    setCourse(foundCourse || null)
  }, [courseId, courses])

  useEffect(() => {
    if (!course && courses.length > 0) {
      router.push('/courses')
    }
  }, [course, courses, router])

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header onCreateCourse={() => {}} />
        
        <main className="flex-1 flex">
          <Sidebar />
          
          <main className="flex-1 p-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading course...</p>
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
        
        <main className="flex-1 p-8">
          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>User ID: {user?.id || 'Not authenticated'}</p>
              <p>User Email: {user?.email || 'No email'}</p>
              <p>User Name: {user?.name || 'No name'}</p>
              <p>Course ID: {courseId}</p>
              <p>Course Found: {course ? 'Yes' : 'No'}</p>
              <p>Total Notes Loaded: {notes.length}</p>
              <p>Course Notes: {notes.filter(n => n.course_id === courseId).length}</p>
              <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
              <p>Auth Loading: {useAuth().isLoading ? 'Yes' : 'No'}</p>
            </div>
          )}

          {/* Course Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Courses</span>
              </Button>
            </div>
              
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: course.color || '#3B82F6' }}
                  >
                    {course.code?.substring(0, 2).toUpperCase() || 'CO'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                    {course.code && (
                      <p className="text-gray-600">{course.code}</p>
                    )}
                    {course.description && (
                      <p className="text-gray-600 mt-2">{course.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              {(['notes', 'examtips', 'assignments'] as TabType[]).map((tab) => {
                const Icon = getTabIcon(tab)
                const count = getNotesForTab().length
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{getTabLabel(tab)}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {getTabLabel(activeTab)} ({getNotesForTab().length})
            </h2>
            
            <div className="flex space-x-2">
              {activeTab === 'notes' && (
                <Button onClick={() => handleCreateNote('lecture')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lecture Note
                </Button>
              )}
              {activeTab === 'examtips' && (
                <>
                  <Button variant="secondary" onClick={() => handleCreateNote('concept')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Concept
                  </Button>
                  <Button onClick={() => handleCreateNote('test')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exam Tip
                  </Button>
                </>
              )}
              {activeTab === 'assignments' && (
                <Button onClick={() => handleCreateNote('assignment')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Assignment
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
