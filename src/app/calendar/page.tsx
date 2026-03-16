'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Calendar, Plus, Clock, MapPin, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: 'assignment' | 'exam' | 'lecture' | 'meeting' | 'other'
  course_name?: string
  created_at: string
  updated_at: string
}

function CalendarPageContent() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadEvents()
    } else {
      setEvents([])
      setIsLoading(false)
    }
  }, [user])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      // For now, we'll use mock data since we haven't implemented the full calendar API
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Database Systems Assignment',
          description: 'Complete SQL queries and database design',
          date: '2024-03-20',
          time: '23:59',
          location: 'Online',
          type: 'assignment',
          course_name: 'Database Systems',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Data Structures Midterm',
          description: 'Covers arrays, linked lists, trees, and sorting algorithms',
          date: '2024-03-25',
          time: '09:00',
          location: 'Room 105',
          type: 'exam',
          course_name: 'Data Structures',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Web Development Workshop',
          description: 'Learn React hooks and state management',
          date: '2024-03-22',
          time: '14:00',
          location: 'Lab 201',
          type: 'lecture',
          course_name: 'Web Development',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      setEvents(mockEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateStr)
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'exam': return 'bg-red-100 text-red-800 border-red-300'
      case 'lecture': return 'bg-green-100 text-green-800 border-green-300'
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onCreateCourse={() => {}} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sign in to access your calendar
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Please sign in to view and manage your academic calendar.
            </p>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    )
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Calendar</h1>
              <p className="text-gray-600">View and manage your academic schedule and important dates</p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">Loading calendar...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {/* Calendar Header */}
                    <div className="flex justify-between items-center mb-6">
                      <Button variant="ghost" onClick={() => navigateMonth('prev')}>
                        ←
                      </Button>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h2>
                      <Button variant="ghost" onClick={() => navigateMonth('next')}>
                        →
                      </Button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {dayNames.map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                      {getDaysInMonth(currentDate).map((day, index) => {
                        const date = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null
                        const dayEvents = date ? getEventsForDate(date) : []
                        const isToday = date && date.toDateString() === new Date().toDateString()

                        return (
                          <div
                            key={index}
                            className={`min-h-[80px] border border-gray-200 rounded-lg p-2 ${
                              day ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                            } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
                            onClick={() => day && setSelectedDate(date)}
                          >
                            {day && (
                              <>
                                <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                                  {day}
                                </div>
                                <div className="mt-1 space-y-1">
                                  {dayEvents.slice(0, 2).map((event, i) => (
                                    <div
                                      key={i}
                                      className={`text-xs px-1 py-0.5 rounded truncate ${getEventColor(event.type)}`}
                                    >
                                      {event.title}
                                    </div>
                                  ))}
                                  {dayEvents.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      +{dayEvents.length - 2} more
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Add Event Button */}
            <div className="mb-8 flex justify-center">
              <Button onClick={() => alert('Event creation coming soon!')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>

            {/* Events List */}
                <div className="space-y-6">
                  {/* Selected Date Events */}
                  {selectedDate && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <div className="space-y-3">
                        {getEventsForDate(selectedDate).length === 0 ? (
                          <p className="text-gray-500 text-sm">No events scheduled</p>
                        ) : (
                          getEventsForDate(selectedDate).map(event => (
                            <div key={event.id} className={`p-3 rounded-lg border ${getEventColor(event.type)}`}>
                              <div className="font-medium text-sm">{event.title}</div>
                              <div className="text-xs opacity-75 mt-1">
                                {event.time} • {event.location}
                              </div>
                              {event.course_name && (
                                <div className="text-xs opacity-75 mt-1">
                                  {event.course_name}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upcoming Events */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                    <div className="space-y-3">
                      {events
                        .filter(event => new Date(event.date) >= new Date())
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 5)
                        .map(event => (
                          <div key={event.id} className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${getEventColor(event.type).split(' ')[0]}`}></div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900">{event.title}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(event.date).toLocaleDateString()} • {event.time}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </main>

      <Footer />
    </div>
  )
}

export default function CalendarPage() {
  return (
    <AuthProvider>
      <CalendarPageContent />
    </AuthProvider>
  )
}
