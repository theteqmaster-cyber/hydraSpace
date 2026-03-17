'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { TimetableEditor } from '@/components/timetable/TimetableEditor'
import { 
  Clock, 
  Plus, 
  BookOpen, 
  MapPin, 
  Beaker,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

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

function TimetablePageContent() {
  const { user } = useAuth()
  const { 
    courses, 
    timetableEntries, 
    addTimetableEntry, 
    updateTimetableEntry, 
    deleteTimetableEntry,
    refreshData 
  } = useData()
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null)

  const handleAddEntry = () => {
    setSelectedEntry(null)
    setIsEditorOpen(true)
  }

  const handleEditEntry = (entry: any) => {
    setSelectedEntry(entry)
    setIsEditorOpen(true)
  }

  const handleSaveEntry = async (entryData: any) => {
    try {
      const { createTimetableEntry, updateTimetableEntry: updateTimetableDb } = await import('@/lib/timetable')
      
      // Map UI day string to database integer
      const dayMap: Record<string, number> = {
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5
      }

      // Calculate end time correctly based on minutes
      const durationMinutes = parseInt(entryData.duration) || 60
      const [startH, startM] = entryData.time.split(':').map(Number)
      const startTotalMinutes = startH * 60 + startM
      const endTotalMinutes = startTotalMinutes + durationMinutes
      
      const endHour = Math.floor(endTotalMinutes / 60)
      const endMin = endTotalMinutes % 60
      const end_time = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}:00`
      const start_time = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}:00`

      const payload = {
        course_id: entryData.course_id || undefined,
        day_of_week: dayMap[entryData.day] || 1,
        start_time,
        end_time,
        title: entryData.course_name || 'Untitled Class',
        location: entryData.location,
        type: entryData.type as any
      }

      if (!user?.id) {
        throw new Error('User session not found. Please log in again.')
      }

      if (selectedEntry?.id) {
        // Update in DB
        await updateTimetableDb(selectedEntry.id, payload as any)
        updateTimetableEntry(selectedEntry.id, payload)
      } else {
        // Create in DB
        const newEntry = await createTimetableEntry(payload as any, user.id)
        addTimetableEntry(newEntry)
      }
      
      refreshData()
      setIsEditorOpen(false)
      setSelectedEntry(null)
    } catch (err: any) {
      // Safer logging that won't show empty object for Error types
      const errorMsg = err?.message || 'Unknown save error'
      console.error('Error saving timetable entry:', errorMsg)
      if (err?.details) console.error('Details:', err.details)
      if (err?.hint) console.error('Hint:', err.hint)
      throw err
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        const { deleteTimetableEntry: deleteTimetableDb } = await import('@/lib/timetable')
        await deleteTimetableDb(id)
        deleteTimetableEntry(id)
      } catch (error) {
        console.error('Error deleting timetable entry:', error)
      }
    }
  }

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'lecture': return BookOpen
      case 'tutorial': return Users
      case 'lab': return Beaker
      default: return Clock
    }
  }

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'tutorial': return 'bg-green-100 text-green-800 border-green-300'
      case 'lab': return 'bg-purple-100 text-purple-800 border-purple-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  const dayMapRev: Record<number, string> = {
    1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday'
  }

  const filteredEntries = timetableEntries
    .filter(entry => dayMapRev[entry.day_of_week] === selectedDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onCreateCourse={() => {}} />
      
      <main className="min-h-screen flex">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 mobile-safe-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-fluid-h2 text-gray-900">Timetable</h1>
                  <p className="text-gray-600 mt-2">
                    Your weekly class schedule
                    <span className="ml-2 text-sm text-gray-500">
                      {timetableEntries.length} entries
                    </span>
                  </p>
                </div>
                <Button onClick={handleAddEntry} className="w-full md:w-auto font-bold py-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </div>
            </div>

            {/* Day Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6 overflow-x-auto custom-scrollbar">
              <div className="flex space-x-2 min-w-max md:min-w-0">
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      selectedDay === day
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Timetable Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 gap-4">
                {filteredEntries.length === 0 ? (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No classes on {selectedDay}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add your first class for {selectedDay} to get started.
                    </p>
                    <Button onClick={handleAddEntry}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add {selectedDay} Class
                    </Button>
                  </motion.div>
                ) : (
                  filteredEntries.map((entry, index) => {
                    const Icon = getEntryIcon(entry.type)
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border-2 ${getEntryColor(entry.type)} cursor-pointer hover:shadow-md transition-all`}
                        onClick={() => handleEditEntry(entry)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Icon className="w-5 h-5" />
                              <span className="font-medium capitalize">{entry.type}</span>
                            </div>
                            
                            <h3 className="font-semibold text-lg mb-1">{entry.title || 'Untitled Course'}</h3>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{entry.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditEntry(entry)
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteEntry(entry.id)
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Total Lectures</h3>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {timetableEntries.filter(e => e.type === 'lecture').length}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Tutorials</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {timetableEntries.filter(e => e.type === 'tutorial').length}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Beaker className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Lab Sessions</h3>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {timetableEntries.filter(e => e.type === 'lab').length}
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </main>

      <Footer />

      {/* Timetable Editor Modal */}
      {isEditorOpen && (
        <TimetableEditor
          isOpen={isEditorOpen}
          entry={selectedEntry || undefined}
          courses={courses}
          onSave={handleSaveEntry}
          onCancel={() => {
            setIsEditorOpen(false)
            setSelectedEntry(null)
          }}
        />
      )}
      <BottomNav />
    </div>
  )
}

export default function TimetablePage() {
  return <TimetablePageContent />
}
