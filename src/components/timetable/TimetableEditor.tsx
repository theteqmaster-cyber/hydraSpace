'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, X, Clock, MapPin, BookOpen, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Course } from '@/types'

interface TimetableEntry {
  id: string
  course_id?: string
  course_name?: string
  course_code?: string
  day: string
  time: string
  duration: string
  type: 'lecture' | 'tutorial' | 'lab'
  location: string
  color?: string
}

interface TimetableEditorProps {
  isOpen: boolean
  entry?: TimetableEntry
  courses: Course[]
  onSave: (entry: Omit<TimetableEntry, 'id'>) => Promise<void>
  onCancel: () => void
}

export const TimetableEditor = ({ 
  entry,
  courses,
  onSave, 
  onCancel 
}: TimetableEditorProps) => {
  const [formData, setFormData] = useState({
    course_id: entry?.course_id || '',
    day: entry?.day || 'Monday',
    time: entry?.time || '09:00',
    duration: entry?.duration || '60 min',
    type: entry?.type || 'lecture' as const,
    location: entry?.location || ''
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]
  const durations = ['30 min', '45 min', '60 min', '90 min', '120 min']
  const types = [
    { value: 'lecture', label: 'Lecture', icon: BookOpen },
    { value: 'tutorial', label: 'Tutorial', icon: Clock },
    { value: 'lab', label: 'Lab', icon: MapPin }
  ] as const

  const selectedCourse = courses.find(c => c.id === formData.course_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.day || !formData.time || !formData.location) {
      alert('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    setSaveStatus('saving')

    try {
      await onSave({
        ...formData,
        course_name: selectedCourse?.name,
        course_code: selectedCourse?.code,
        color: selectedCourse?.color
      })
      
      setSaveStatus('saved')
      setTimeout(() => {
        onCancel()
      }, 1000)
    } catch (err: any) {
      console.error('Error saving timetable entry:', err?.message || err)
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
      default: return entry ? 'Update Entry' : 'Add Entry'
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
                {entry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
              </h2>
              <p className="text-blue-100">
                Schedule your lectures and activities
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
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Course
              </label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData(prev => ({ ...prev, course_id: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a course (optional)</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Day and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day *
                </label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Start Time *
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {durations.map(duration => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {types.map(({ value, label, icon: Icon }) => (
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
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs font-medium">{label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Room 101, Lab 205, Online..."
                className="w-full"
                required
              />
            </div>

            {/* Course Preview */}
            {selectedCourse && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Course Preview</h4>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: selectedCourse.color || '#3B82F6' }}
                  >
                    {selectedCourse.code?.substring(0, 2).toUpperCase() || 'CO'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{selectedCourse.name}</div>
                    <div className="text-sm text-gray-500">{selectedCourse.code}</div>
                  </div>
                </div>
              </div>
            )}
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
