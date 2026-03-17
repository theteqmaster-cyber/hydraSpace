'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { createEvent, CalendarEvent } from '@/lib/events'
import { Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EventEditor } from '@/components/calendar/EventEditor'

function CalendarPageContent() {
  const { user } = useAuth()
  const { events, addEvent, refreshData, isOffline, lastSyncTime } = useData()
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [isEventEditorOpen, setIsEventEditorOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const handleAddEvent = () => {
    setSelectedEvent(null)
    setIsEventEditorOpen(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsEventEditorOpen(true)
  }

  const handleSaveEvent = async (eventData: any) => {
    try {
      if (selectedEvent?.id) {
        // Update existing event
        const { updateEvent } = await import('@/lib/events')
        await updateEvent(selectedEvent.id, eventData)
      } else {
        // Create new event
        const newEvent = await createEvent(eventData, user!.id)
        addEvent(newEvent)
      }
      
      refreshData()
      setIsEventEditorOpen(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error saving event:', error)
      throw error
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
    return events.filter(event => event.start_time.startsWith(dateStr))
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'test': return 'bg-red-100 text-red-800 border-red-300'
      case 'lecture': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onCreateCourse={() => {}} />
      
      {/* Changed this outer tag from <main> to <div> to avoid nested main elements */}
      <div className="flex-1 flex">
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
                  <h1 className="text-fluid-h2 text-gray-900">Calendar</h1>
                  <p className="text-gray-600 mt-2">
                    Your academic calendar and events
                    {isOffline && (
                      <span className="ml-2 text-orange-600 font-medium">
                        (Offline Mode)
                      </span>
                    )}
                    {lastSyncTime && (
                      <span className="ml-2 text-sm text-gray-500">
                        Last sync: {lastSyncTime.toLocaleTimeString()}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex space-x-2 w-full md:w-auto">
                  <Button
                    variant="secondary"
                    onClick={refreshData}
                    disabled={isLoading}
                    className="flex-1 md:flex-none"
                  >
                    {isLoading ? '...' : 'Refresh'}
                  </Button>
                  <Button onClick={handleAddEvent} className="flex-1 md:flex-none font-bold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </div>
            </div>

            {/* Calendar View */}
            {selectedDate ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Calendar Grid (Takes up 2 columns) */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                      </h2>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateMonth('prev')}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateMonth('next')}
                        >
                          Next
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {dayNames.map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                      {getDaysInMonth(currentMonth).map((day, index) => {
                        const date = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null
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
                                <div className="text-sm font-medium mb-1">{day}</div>
                                {dayEvents.slice(0, 2).map((event, idx) => (
                                  <div
                                    key={idx}
                                    className={`text-xs p-1 mb-1 rounded ${getEventColor(event.type)}`}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                                )}
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Button & Event Lists */}
                <div className="space-y-6">
                  
                  {/* Add Event Button */}
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAddEvent}
                      className="text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </div>

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
                            <div key={event.id} className={`p-3 rounded-lg border ${getEventColor(event.type)} cursor-pointer`} onClick={() => handleEditEvent(event)}>
                              <div className="font-medium text-sm">{event.title}</div>
                              <div className="text-xs opacity-75 mt-1">
                                {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {event.course_id && (
                                <div className="text-xs opacity-75 mt-1">
                                  Course Event
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
                        .filter(event => new Date(event.start_time) >= new Date())
                        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                        .slice(0, 5)
                        .map(event => (
                          <div key={event.id} className="flex items-start space-x-3">
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900">{event.title}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(event.start_time).toLocaleDateString()} • {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">Select a date to view events</p>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      <Footer />

      {/* Event Editor Modal */}
      {isEventEditorOpen && (
        <EventEditor
          isOpen={isEventEditorOpen}
          event={selectedEvent || undefined}
          onSave={handleSaveEvent}
          onCancel={() => {
            setIsEventEditorOpen(false)
            setSelectedEvent(null)
          }}
        />
      )}
      <BottomNav />
    </div>
  )
}

export default function CalendarPage() {
  return <CalendarPageContent />
}
