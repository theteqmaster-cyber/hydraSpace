'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Footer } from '@/components/layout/Footer'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { Note, Course } from '@/types'
import { BookOpen, FileText, AlertCircle, CheckCircle, Plus, Search, Eye, EyeOff, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

function NotesPageContent() {
  const { notes, courses, isLoading, refreshData, deleteNote: deleteNoteLocally, updateNote: updateNoteLocally } = useData()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const { user, isLoading: isAuthLoading } = useAuth()

  const handleCreateNote = () => {
    setSelectedNote(null)
    setSelectedCourse(courses[0] || null)
    setIsEditorOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setSelectedNote(note)
    setSelectedCourse(courses.find(c => c.id === note.course_id) || null)
    setIsEditorOpen(true)
  }

  const handleSaveNote = async (noteData: Partial<Note>) => {
    try {
      if (noteData.id) {
        // Update existing note
        const { updateNote } = await import('@/lib/notes')
        const updated = await updateNote(noteData.id, noteData)
        updateNoteLocally(noteData.id, updated)
      } else {
        // Create new note
        const { createNote } = await import('@/lib/notes')
        await createNote({
          ...noteData,
          user_id: user!.id,
          course_id: selectedCourse!.id
        } as Omit<Note, 'id' | 'created_at' | 'updated_at'>)
        // Refresh to get the new note with all metadata
        await refreshData()
      }
      
      setIsEditorOpen(false)
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return
    
    try {
      const { deleteNote } = await import('@/lib/notes')
      await deleteNote(noteId)
      deleteNoteLocally(noteId)
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const handleToggleShare = async (note: Note) => {
    try {
      const { updateNote } = await import('@/lib/notes')
      const updated = await updateNote(note.id, { is_shared: !note.is_shared })
      updateNoteLocally(note.id, updated)
    } catch (error) {
      console.error('Error toggling share:', error)
    }
  }

  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'lecture': return BookOpen
      case 'assignment': return FileText
      case 'test': return AlertCircle
      case 'concept': return CheckCircle
      default: return FileText
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

  const enrichedNotes = notes.map(note => {
    const course = courses.find(c => c.id === note.course_id)
    return {
      ...note,
      course_name: course?.name || 'Unknown Course',
      course_code: course?.code || 'N/A'
    }
  })

  const filteredNotes = enrichedNotes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCourse = !filterCourse || note.course_id === filterCourse
    
    return matchesSearch && matchesCourse
  })

  if (isAuthLoading) {
    return <LoadingScreen />
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
              Sign in to access your notes
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Please sign in to view and manage your notes.
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
        
        <main className="flex-1 p-4 md:p-8 mobile-safe-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-fluid-h2 text-gray-900 mb-2">My Notes</h1>
                <p className="text-gray-600">View and manage all your academic notes</p>
              </div>
              <Button onClick={handleCreateNote} disabled={courses.length === 0} className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex space-x-4">
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                icon={<Search className="w-5 h-5 text-gray-400" />}
              />
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">Loading notes...</p>
              </div>
            ) : (
              <>
                {filteredNotes.length === 0 ? (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {courses.length === 0 ? 'No courses yet' : 'No notes found'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {courses.length === 0 
                        ? 'Create a course first to start taking notes.'
                        : searchQuery || filterCourse 
                          ? 'Try adjusting your search or filters.'
                          : 'Create your first note to get started.'
                      }
                    </p>
                    {courses.length > 0 && !searchQuery && !filterCourse && (
                      <Button onClick={handleCreateNote}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Note
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map((note, index) => {
                      const Icon = getNoteIcon(note.type)
                      return (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <Icon className="w-5 h-5 text-blue-600" />
                              <span className="text-sm text-gray-500 capitalize">{note.type}</span>
                            </div>
                            {note.lecture_number && (
                              <span className="text-sm text-gray-500">Lecture {note.lecture_number}</span>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {note.title}
                          </h3>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {note.content}
                          </p>

                          <div className="flex items-center justify-between mb-4">
                            <div className="text-xs text-gray-500">
                              {(note as any).course_code} - {(note as any).course_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(note.created_at)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditNote(note)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleShare(note)}
                              className={note.is_shared ? 'text-green-600' : 'text-gray-600'}
                            >
                              {note.is_shared ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </main>
      </main>

      <Footer />

      {isEditorOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <NoteEditor
              isOpen={isEditorOpen}
              note={selectedNote || undefined}
              course={selectedCourse}
              courses={courses}
              courseId={selectedCourse.id}
              onSave={handleSaveNote}
              onCancel={() => setIsEditorOpen(false)}
            />
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  )
}

export default function NotesPage() {
  return <NotesPageContent />
}
