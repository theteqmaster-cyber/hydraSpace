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

function EditNotePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const noteId = searchParams.get('id') as string
  
  const { user, isLoading: isAuthLoading } = useAuth()
  const { notes, courses, refreshData, isOffline, addPendingNote } = useData()
  
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (notes.length > 0 && noteId) {
      const foundNote = notes.find(n => n.id === noteId)
      if (foundNote) {
        setNote(foundNote)
      } else {
        // Fallback to fetch from DB directly if not in context
        const fetchNote = async () => {
          try {
            const { getNotes } = await import('@/lib/notes')
            const allNotes = await getNotes(user!.id)
            const dbNote = allNotes.find(n => n.id === noteId)
            if (dbNote) setNote(dbNote)
            else router.push('/notes')
          } catch (error) {
            console.error('Failed to fetch note:', error)
            router.push('/notes')
          }
        }
        if (user) fetchNote()
      }
      setIsLoading(false)
    }
  }, [notes, noteId, user, router])

  const handleSaveNote = async (noteData: Partial<Note>) => {
    try {
      if (isOffline) {
        const tempNote: Partial<Note> = { ...note, ...noteData, id: noteId }
        addPendingNote(tempNote)
        return tempNote as Note
      }

      const { updateNote } = await import('@/lib/notes')
      const savedNote = await updateNote(noteId, noteData)
      
      refreshData() // Background refresh
      return savedNote
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Failed to save note. Please check your connection.')
    }
  }

  if (isAuthLoading || isLoading) return <LoadingScreen />
  
  if (!user) {
    router.push('/')
    return null
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Note Not Found</h2>
          <p className="text-slate-600 mb-6">The note you are trying to edit does not exist or you don't have permission to view it.</p>
          <Button onClick={() => router.push('/notes')}>Back to Notes</Button>
        </div>
      </div>
    )
  }

  const course = courses.find(c => c.id === note.course_id)

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Editor Area */}
      <main className="flex-1 flex flex-col p-0 w-full relative">
        <NoteEditor
          note={note}
          course={course}
          courses={courses}
          courseId={course?.id || ''}
          onSave={handleSaveNote}
          onBack={() => router.back()}
        />
      </main>
    </div>
  )
}

export default function EditNotePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <EditNotePageContent />
    </Suspense>
  )
}
