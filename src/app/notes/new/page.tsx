'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import NoteEditor from '@/components/notes/NoteEditor'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { Note } from '@/types'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function NewNoteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  const typeParam = searchParams.get('type') as Note['type'] | null
  
  const { user, isLoading: isAuthLoading } = useAuth()
  const { courses, refreshData, isOffline, addPendingNote } = useData()
  
  const [selectedCourse, setSelectedCourse] = useState(
    courses.find(c => c.id === courseId) || courses[0] || null
  )

  useEffect(() => {
    if (courseId && courses.length > 0) {
      const course = courses.find(c => c.id === courseId)
      if (course) setSelectedCourse(course)
    }
  }, [courseId, courses])

  const handleSaveNote = async (noteData: Partial<Note>) => {
    try {
      if (isOffline) {
        const tempId = noteData.id || `local-${Date.now()}`
        const tempNote: Partial<Note> = {
          ...noteData,
          id: tempId,
          user_id: user!.id,
          course_id: selectedCourse!.id
        }
        addPendingNote(tempNote)
        return tempNote as Note
      }

      let savedNote;
      if (noteData.id) {
        // If it got an ID during auto-save
        const { updateNote } = await import('@/lib/notes')
        savedNote = await updateNote(noteData.id, noteData)
      } else {
        const { createNote } = await import('@/lib/notes')
        savedNote = await createNote({
          ...noteData,
          user_id: user!.id,
          course_id: selectedCourse!.id
        } as Omit<Note, 'id' | 'created_at' | 'updated_at'>)
      }
      
      refreshData() // Background refresh
      return savedNote
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Failed to save note. Please check your connection.')
    }
  }

  if (isAuthLoading) return <LoadingScreen />
  
  if (!user) {
    router.push('/')
    return null
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">No Courses Found</h2>
          <p className="text-slate-600 mb-6">You need to create a course before you can take notes.</p>
          <Button onClick={() => router.push('/courses')}>Go to Courses</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Editor Area */}
      <main className="flex-1 flex flex-col p-0 w-full relative">
        <NoteEditor
          course={selectedCourse}
          courses={courses}
          courseId={selectedCourse!.id}
          onSave={handleSaveNote}
          onBack={() => router.back()}
          defaultType={typeParam || 'lecture'}
        />
      </main>
    </div>
  )
}

export default function NewNotePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <NewNoteContent />
    </Suspense>
  )
}
