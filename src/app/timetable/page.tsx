'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
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
  const { courses } = useData()
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null)
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([])

  // Load timetable entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('hydraspace_timetable_entries')
    if (savedEntries) {
      setTimetableEntries(JSON.parse(savedEntries))
    }
  }, [])

  // Save to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('hydraspace_timetable_entries', JSON.stringify(timetableEntries))
  }, [timetableEntries])

  const handleAddEntry = () => {
    setSelectedEntry(null)
    setIsEditorOpen(true)
  }

  const handleEditEntry = (entry: TimetableEntry) => {
    setSelectedEntry(entry)
    setIsEditorOpen(true)
  }

  const handleSaveEntry = async (entryData: Omit<TimetableEntry, 'id'>) => {
    try {
      if (selectedEntry?.id) {
        // Update existing entry
        setTimetableEntries(prev => 
          prev.map(entry => 
            entry.id === selectedEntry.id 
              ? { ...entryData, id: selectedEntry.id }
              : entry
          )
        )
      } else {
        // Create new entry
        const newEntry: TimetableEntry = {
          ...entryData,
          id: Date.now().toString()
        }
        setTimetableEntries(prev => [...prev, newEntry])
      }
      
      setIsEditorOpen(false)
      setSelectedEntry(null)
    } catch (error) {
      console.error('Error saving timetable entry:', error)
      throw error
    }
  }

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this timetable entry?')) {
      setTimetableEntries(prev => prev.filter(entry => entry.id !== id))
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

  const filteredEntries = timetableEntries.filter(entry => entry.day === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time))

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
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Timetable</h1>
                  <p className="text-gray-600 mt-2">
                    Your weekly class schedule
                    <span className="ml-2 text-sm text-gray-500">
                      {timetableEntries.length} entries
                    </span>
                  </p>
                </div>
                <Button onClick={handleAddEntry}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </div>
            </div>

            {/* Day Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
              <div className="flex space-x-2">
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
                              <span className="text-sm opacity-75">{entry.duration}</span>
                            </div>
                            
                            <h3 className="font-semibold text-lg mb-1">{entry.course_name || 'Untitled Course'}</h3>
                            {entry.course_code && (
                              <p className="text-sm text-gray-600 mb-2">{entry.course_code}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{entry.time}</span>
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
    </div>
  )
}

export default function TimetablePage() {
  return <TimetablePageContent />
}
