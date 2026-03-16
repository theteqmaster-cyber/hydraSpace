'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Note } from '@/types'
import { Search, BookOpen, FileText, AlertCircle, CheckCircle, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function CommunityPageContent() {
  const [sharedNotes, setSharedNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    loadSharedNotes()
  }, [])

  const loadSharedNotes = async () => {
    try {
      setIsLoading(true)
      const { getSharedNotes } = await import('@/lib/notes')
      const notes = await getSharedNotes(20, 0)
      setSharedNotes(notes)
    } catch (error) {
      console.error('Error loading shared notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadSharedNotes()
      return
    }

    try {
      setIsLoading(true)
      const { searchNotes } = await import('@/lib/notes')
      const notes = await searchNotes(searchQuery, user?.id)
      setSharedNotes(notes)
    } catch (error) {
      console.error('Error searching notes:', error)
    } finally {
      setIsLoading(false)
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
      day: 'numeric'
    })
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Notes</h1>
              <p className="text-gray-600">Discover and learn from shared notes by fellow students</p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="flex space-x-4">
                <Input
                  placeholder="Search notes by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                  icon={<Search className="w-5 h-5 text-gray-400" />}
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                  Search
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                </div>
                <p className="text-gray-600">Loading shared notes...</p>
              </div>
            ) : (
              <>
                {sharedNotes.length === 0 ? (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No shared notes yet</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery ? 'No notes found matching your search.' : 'Be the first to share your notes with the community!'}
                    </p>
                    {user && !searchQuery && (
                      <p className="text-gray-600">
                        Share your notes from your courses to help others learn.
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sharedNotes.map((note, index) => {
                      const Icon = getNoteIcon(note.type)
                      return (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            // Expand note details
                            alert(`Note: ${note.title}\n\nType: ${note.type}\n\nAuthor: ${(note as any).users?.name || 'Anonymous'}\n\nCourse: ${(note as any).courses?.name || 'N/A'}\n\nCreated: ${formatDate(note.created_at)}\n\nContent: ${note.content}`)
                          }}
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

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{(note as any).users?.name || 'Anonymous'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(note.created_at)}</span>
                            </div>
                          </div>

                          {(note as any).courses && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <span className="text-xs text-gray-500">
                                {(note as any).courses?.code} - {(note as any).courses?.name}
                              </span>
                            </div>
                          )}

                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <span className="text-xs text-blue-600 font-medium">
                              Click to view full note details
                            </span>
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
    </div>
  )
}

export default function CommunityPage() {
  return (
    <AuthProvider>
      <CommunityPageContent />
    </AuthProvider>
  )
}
