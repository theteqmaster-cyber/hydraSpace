'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, X, FileText, AlertCircle, BookOpen, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Note, Course } from '@/types'

interface CourseNoteEditorProps {
  isOpen: boolean
  note?: Note
  course: Course
  onSave: (noteData: Partial<Note>) => Promise<void>
  onCancel: () => void
}

export const CourseNoteEditor = ({ 
  note, 
  course,
  onSave, 
  onCancel 
}: CourseNoteEditorProps) => {
  const [formData, setFormData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    type: note?.type || 'lecture' as const,
    lecture_number: note?.lecture_number || undefined,
    is_shared: note?.is_shared || false
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const noteTypes = [
    { value: 'lecture', label: 'Lecture Note', icon: BookOpen },
    { value: 'assignment', label: 'Assignment', icon: FileText },
    { value: 'test', label: 'Test/Exam', icon: AlertCircle },
    { value: 'concept', label: 'Key Concept', icon: CheckCircle }
  ] as const

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        type: note.type,
        lecture_number: note.lecture_number,
        is_shared: note.is_shared
      })
    } else {
      setFormData({
        title: '',
        content: '',
        type: 'lecture',
        lecture_number: undefined,
        is_shared: false
      })
    }
  }, [note])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in both title and content')
      return
    }

    setIsSaving(true)
    setSaveStatus('saving')

    try {
      await onSave({
        ...formData,
        course_id: course.id,
        user_id: course.user_id
      })
      
      setSaveStatus('saved')
      setTimeout(() => {
        onCancel()
      }, 1000)
    } catch (error) {
      console.error('Error saving note:', error)
      setSaveStatus('error')
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    } finally {
      setIsSaving(false)
    }
  }

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...'
      case 'saved': return 'Saved!'
      case 'error': return 'Error - Try Again'
      default: return note ? 'Update Note' : 'Create Note'
    }
  }

  const getSaveButtonColor = () => {
    switch (saveStatus) {
      case 'saved': return 'bg-green-600 hover:bg-green-700'
      case 'error': return 'bg-red-600 hover:bg-red-700'
      default: return ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        className="bg-white rounded-t-3xl md:rounded-xl max-w-4xl w-full h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-black truncate">
                {note ? 'Edit Note' : 'Create New Note'}
              </h2>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-0.5 truncate">
                {course.name}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-white hover:bg-white/10 -mr-2"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter note title..."
                className="w-full"
                required
              />
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {noteTypes.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.type === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lecture Number (for lecture notes) */}
            {formData.type === 'lecture' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lecture Number (Optional)
                </label>
                <Input
                  type="number"
                  value={formData.lecture_number || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    lecture_number: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="e.g., 1, 2, 3..."
                  min="1"
                />
              </div>
            )}

            {/* Content */}
            <div>
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Start writing your note..."
                className="w-full min-h-[350px] md:min-h-[400px] p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-slate-800 leading-relaxed custom-scrollbar"
                required
              />
            </div>

            {/* Share Option */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_shared"
                checked={formData.is_shared}
                onChange={(e) => setFormData(prev => ({ ...prev, is_shared: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_shared" className="text-sm text-gray-700">
                Share this note with the community
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 p-5 md:p-6 border-t border-slate-100 bg-slate-50">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSaving}
              className="w-full sm:w-auto h-12 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className={`w-full sm:w-auto h-12 rounded-xl font-bold shadow-lg transition-all ${getSaveButtonColor() || 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
            >
              <Save className="w-5 h-5 mr-2" />
              {getSaveButtonText()}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
