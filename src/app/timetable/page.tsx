'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface TimetableEntry {
  id: string
  course_name: string
  day_of_week: string
  start_time: string
  end_time: string
  room: string
  type: 'lecture' | 'lab' | 'tutorial'
  created_at: string
  updated_at: string
}

function TimetablePageContent() {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { user } = useAuth()

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ]

  useEffect(() => {
    if (user) {
      loadTimetable()
    } else {
      setTimetableEntries([])
      setIsLoading(false)
    }
  }, [user])

  const loadTimetable = async () => {
    try {
      setIsLoading(true)
      // For now, we'll use mock data since we haven't implemented the full timetable API
      const mockEntries: TimetableEntry[] = [
        {
          id: '1',
          course_name: 'Database Systems',
          day_of_week: 'Monday',
          start_time: '09:00',
          end_time: '10:30',
          room: 'Lab 201',
          type: 'lecture',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          course_name: 'Data Structures',
          day_of_week: 'Tuesday',
          start_time: '11:00',
          end_time: '12:30',
          room: 'Room 105',
          type: 'lecture',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      setTimetableEntries(mockEntries)
    } catch (error) {
      console.error('Error loading timetable:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEntryForSlot = (day: string, time: string) => {
    return timetableEntries.find(entry => 
      entry.day_of_week === day && 
      entry.start_time === time
    )
  }

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'lab': return 'bg-green-100 border-green-300 text-green-800'
      case 'tutorial': return 'bg-purple-100 border-purple-300 text-purple-800'
      default: return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sign in to access your timetable
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Please sign in to view and manage your academic timetable.
            </p>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Timetable</h1>
                <p className="text-gray-600">View and manage your weekly class schedule</p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">Loading timetable...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        {days.map(day => (
                          <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {day.slice(0, 3)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {timeSlots.map(time => (
                        <tr key={time} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {time}
                          </td>
                          {days.map(day => {
                            const entry = getEntryForSlot(day, time)
                            return (
                              <td key={`${day}-${time}`} className="px-2 py-2">
                                {entry ? (
                                  <div className={`p-2 rounded-lg border ${getEntryColor(entry.type)} text-xs`}>
                                    <div className="font-semibold truncate">{entry.course_name}</div>
                                    <div className="text-xs opacity-75">{entry.room}</div>
                                    <div className="text-xs opacity-75">
                                      {entry.start_time} - {entry.end_time}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-12"></div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {timetableEntries.length}
                    </h3>
                    <p className="text-sm text-gray-600">Total Classes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {timetableEntries.length * 1.5}h
                    </h3>
                    <p className="text-sm text-gray-600">Weekly Hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {new Set(timetableEntries.map(e => e.day_of_week)).size}
                    </h3>
                    <p className="text-sm text-gray-600">Days Active</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </main>

      <Footer />
    </div>
  )
}

export default function TimetablePage() {
  return (
    <AuthProvider>
      <TimetablePageContent />
    </AuthProvider>
  )
}
