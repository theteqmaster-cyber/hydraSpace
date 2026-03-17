'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Save, Share2, Eye, EyeOff, FileText, BookOpen, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Note, Course } from '@/types'

interface NoteEditorProps {
  isOpen: boolean
  note?: Note
  course?: Course | null
  courses: Course[]
  courseId: string
  onSave: (note: Partial<Note>) => Promise<void>
  onCancel: () => void
}

export const NoteEditor = ({ 
  note, 
  course,
  courses,
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
      className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              {(() => {
                const currentType = noteTypes.find(type => type.value === formData.type)
                return currentType ? <currentType.icon className="w-4 h-4 text-blue-600" /> : null
              })()}
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="text-xs font-black uppercase tracking-tight text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                {noteTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFormData({ ...formData, is_shared: !formData.is_shared })}
              className={`flex items-center space-x-2 h-9 rounded-xl border transition-all ${
                formData.is_shared 
                  ? 'text-green-600 bg-green-50 border-green-100' 
                  : 'text-slate-400 bg-slate-50 border-slate-100'
              }`}
            >
              {formData.is_shared ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="text-[10px] font-black uppercase tracking-widest">{formData.is_shared ? 'Shared' : 'Private'}</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {formData.type === 'lecture' && (
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">LEC #</span>
                  <input
                    type="number"
                    placeholder="—"
                    value={formData.lecture_number || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      lecture_number: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="w-12 h-8 bg-white border border-slate-200 rounded-lg text-center text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              )}
            </div>
            
            {/* Auto-save indicator */}
            <div className="flex items-center space-x-2 min-h-[20px]">
              {saveStatus === 'saving' && (
                <span className="text-[10px] font-bold text-blue-600 animate-pulse uppercase tracking-tight">Syncing...</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-[10px] font-bold text-green-600 flex items-center space-x-1 uppercase tracking-tight">
                  <CheckCircle className="w-3 h-3" />
                  <span>Synced</span>
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-[10px] font-bold text-red-600 flex items-center space-x-1 uppercase tracking-tight">
                  <AlertCircle className="w-3 h-3" />
                  <span>Offline</span>
                </span>
              )}
              {hasUnsavedChanges && saveStatus === 'idle' && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Draft</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Title</label>
        <Input
          label=""
          placeholder="Enter note title..."
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="text-lg font-bold border-none px-0 focus:ring-0"
        />
        
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Your Notes
          </label>
          <textarea
            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none text-slate-800 leading-relaxed min-h-[400px]"
            placeholder="Start writing your note..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-5 py-5 border-t border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" onClick={handleCancel} className="w-full sm:w-auto h-12 rounded-xl text-slate-500 font-bold">
            Close
          </Button>
          <div className="flex flex-1 gap-3">
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={!formData.title.trim() || !formData.content.trim() || isSaving}
              className="flex-1 h-12 rounded-xl font-bold"
            >
              <Save className="w-4 h-4 mr-2" />
              Draft
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!formData.title.trim() || !formData.content.trim() || isSaving}
              className="flex-[1.5] h-12 rounded-xl font-bold shadow-lg shadow-blue-500/20"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {note ? 'Update' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
