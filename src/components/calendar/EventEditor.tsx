'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, X, Calendar, Clock, MapPin, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CalendarEvent } from '@/lib/events'

interface EventEditorProps {
  isOpen: boolean
  event?: CalendarEvent
  onSave: (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
}

export const EventEditor = ({ 
  event,
  onSave, 
  onCancel 
}: EventEditorProps) => {
  const getLocalDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.start_time ? getLocalDateStr(new Date(event.start_time)) : getLocalDateStr(new Date()),
    time: event?.start_time 
      ? `${String(new Date(event.start_time).getHours()).padStart(2, '0')}:${String(new Date(event.start_time).getMinutes()).padStart(2, '0')}` 
      : '09:00',
    type: event?.type || 'other' as const,
    course_id: event?.course_id || ''
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const eventTypes = [
    { value: 'lecture', label: 'Lecture', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'assignment', label: 'Assignment', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'test', label: 'Test/Exam', color: 'bg-red-100 text-red-800 border-red-300' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-300' }
  ] as const

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.date) {
      alert('Please fill in both title and date')
      return
    }

    setIsSaving(true)
    setSaveStatus('saving')

    try {
      // Treat the input safely as local time by natively passing it to the interpreter
      const startLocal = new Date(`${formData.date}T${formData.time}:00`)
      const start_time = startLocal.toISOString()
      
      const endDate = new Date(startLocal)
      endDate.setHours(endDate.getHours() + 1)
      const end_time = endDate.toISOString()

      await onSave({
        title: formData.title,
        description: formData.description,
        start_time,
        end_time,
        type: formData.type as any,
        course_id: formData.course_id || undefined
      } as any)
      
      setSaveStatus('saved')
      setTimeout(() => {
        onCancel()
      }, 1000)
    } catch (error) {
      console.error('Error saving event:', error)
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
      default: return event ? 'Update Event' : 'Create Event'
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {event ? 'Edit Event' : 'Create New Event'}
              </h2>
              <p className="text-blue-100">
                Schedule your academic activities
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title..."
                className="w-full"
                required
              />
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {eventTypes.map(({ value, label, color }) => (
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
                    <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${color}`}></div>
                    <div className="text-xs font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time *
                </label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full"
                  required
                />
              </div>
            </div>


            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add event details, notes, or reminders..."
                className="w-full min-h-[150px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className={getSaveButtonColor()}
            >
              <Save className="w-4 h-4 mr-2" />
              {getSaveButtonText()}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
