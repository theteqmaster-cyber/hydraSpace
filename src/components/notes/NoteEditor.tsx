'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Save, Share2, Eye, EyeOff, FileText, BookOpen, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Note } from '@/types'

interface NoteEditorProps {
  note?: Note
  courseId: string
  onSave: (note: Partial<Note>) => Promise<void>
  onCancel: () => void
}

export const NoteEditor = ({ 
  note, 
  courseId, 
  onSave, 
  onCancel 
}: NoteEditorProps) => {
  const [formData, setFormData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    type: note?.type || 'lecture' as const,
    lecture_number: note?.lecture_number || undefined,
    is_shared: note?.is_shared || false
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const autoSaveTimeoutRef = useRef<any>(null)
  const lastSavedRef = useRef<string>(JSON.stringify(formData))

  const noteTypes = [
    { value: 'lecture', label: 'Lecture Note', icon: BookOpen },
    { value: 'assignment', label: 'Assignment', icon: FileText },
    { value: 'test', label: 'Test/Exam', icon: AlertCircle },
    { value: 'concept', label: 'Key Concept', icon: CheckCircle }
  ] as const

  // Auto-save functionality
  useEffect(() => {
    const currentData = JSON.stringify(formData)
    
    if (currentData !== lastSavedRef.current) {
      setHasUnsavedChanges(true)
      
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      
      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave()
      }, 2000) as any // Auto-save after 2 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [formData])

  const handleAutoSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return
    }

    try {
      setIsSaving(true)
      setSaveStatus('saving')
      
      await onSave({
        ...formData,
        course_id: courseId,
        id: note?.id
      })
      
      lastSavedRef.current = JSON.stringify(formData)
      setHasUnsavedChanges(false)
      setSaveStatus('saved')
      
      // Clear saved status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      setSaveStatus('error')
      console.error('Auto-save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    
    setIsSaving(true)
    setSaveStatus('saving')
    
    try {
      await onSave({
        ...formData,
        course_id: courseId,
        id: note?.id
      })
      
      lastSavedRef.current = JSON.stringify(formData)
      setHasUnsavedChanges(false)
      setSaveStatus('saved')
      
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      setSaveStatus('error')
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel()
      }
    } else {
      onCancel()
    }
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {(() => {
                const currentType = noteTypes.find(type => type.value === formData.type)
                return currentType ? <currentType.icon className="w-5 h-5 text-gray-600" /> : null
              })()}
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="text-sm font-medium text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                {noteTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            {formData.type === 'lecture' && (
              <Input
                label=""
                type="number"
                placeholder="Lecture #"
                value={formData.lecture_number || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  lecture_number: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-20"
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFormData({ ...formData, is_shared: !formData.is_shared })}
              className={`flex items-center space-x-2 ${
                formData.is_shared ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              {formData.is_shared ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="text-sm">{formData.is_shared ? 'Shared' : 'Private'}</span>
            </Button>
            
            {/* Auto-save indicator */}
            <div className="flex items-center space-x-2 text-sm">
              {saveStatus === 'saving' && (
                <span className="text-blue-600">Auto-saving...</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-green-600 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Auto-saved</span>
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Save failed</span>
                </span>
              )}
              {hasUnsavedChanges && saveStatus === 'idle' && (
                <span className="text-gray-500">Unsaved changes...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <Input
          label="Note Title"
          placeholder="Enter note title..."
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={12}
            placeholder="Start writing your note..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between">
          <Button variant="ghost" onClick={handleCancel}>
            Close
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={!formData.title.trim() || !formData.content.trim() || isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!formData.title.trim() || !formData.content.trim() || isSaving}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {note ? 'Update' : 'Create'} Note
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
