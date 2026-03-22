'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X, Calendar, User, BookOpen, FileText, AlertCircle, CheckCircle, Share2, Flag, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Note } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface CommunityNotePreviewProps {
  note: Note & { users?: { name: string }; courses?: { name: string; code: string } }
  isOpen: boolean
  onClose: () => void
}

export const CommunityNotePreview = ({ note: initialNote, isOpen, onClose }: CommunityNotePreviewProps) => {
  const { user } = useAuth()
  const [note, setNote] = useState(initialNote)
  
  const handleUpvote = async () => {
    if (!user) return
    
    const isUpvoted = note.upvoted_by?.includes(user.id)
    const newUpvotes = isUpvoted ? Math.max(0, (note.upvotes || 0) - 1) : (note.upvotes || 0) + 1
    const newUpvotedBy = isUpvoted 
      ? (note.upvoted_by || []).filter((id: string) => id !== user.id)
      : [...(note.upvoted_by || []), user.id]

    // Optimistic
    setNote({ ...note, upvotes: newUpvotes, upvoted_by: newUpvotedBy })

    try {
      const { toggleUpvote } = await import('@/lib/notes')
      await toggleUpvote(note.id, user.id)
    } catch (e) {
      console.error(e)
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'text-blue-600 bg-blue-50'
      case 'assignment': return 'text-green-600 bg-green-50'
      case 'test': return 'text-red-600 bg-red-50'
      case 'concept': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const Icon = getNoteIcon(note.type)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${getTypeColor(note.type)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{note.title}</h2>
                  <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                    <span className="capitalize font-medium">{note.type}</span>
                    <span>•</span>
                    {note.courses && (
                      <span className="font-medium text-blue-600">
                        {note.courses.code} - {note.courses.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full w-10 h-10 p-0 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
              <div className="max-w-3xl mx-auto">
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full flex items-center justify-center ring-2 ring-white">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Shared by</div>
                      <div className="text-sm font-bold text-gray-900">{note.users?.name || 'Anonymous Student'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Published</div>
                      <div className="text-sm font-bold text-gray-900">{formatDate(note.created_at)}</div>
                    </div>
                  </div>

                  {note.lecture_number && (
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Lecture</div>
                        <div className="text-sm font-bold text-gray-900">№ {note.lecture_number}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Note Content */}
                <div className="prose prose-blue max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg font-serif">
                    {note.content}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex space-x-3 w-full sm:w-auto">
                <Button 
                  onClick={handleUpvote}
                  variant="outline" 
                  size="sm" 
                  className={`bg-white font-bold tracking-wide transition-all ${note.upvoted_by?.includes(user?.id || '') ? 'text-orange-600 border-orange-200 bg-orange-50' : 'text-gray-600'}`}
                >
                  <ThumbsUp className={`w-4 h-4 mr-2 ${note.upvoted_by?.includes(user?.id || '') ? 'fill-orange-500' : ''}`} />
                  {note.upvotes || 0} Upvotes
                </Button>
                <Button variant="outline" size="sm" className="bg-white text-gray-600">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400 italic">
                <span>View only mode • Community shared</span>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 h-auto">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
