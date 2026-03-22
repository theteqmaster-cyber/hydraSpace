'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { createEvent, CalendarEvent } from '@/lib/events'
import { Calendar as CalendarIcon, Clock, Plus, LayoutGrid, ChevronLeft, ChevronRight, MapPin, AlignLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EventEditor } from '@/components/calendar/EventEditor'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

function CalendarPageContent() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { events, timetableEntries, courses, addEvent, refreshData, isOffline, lastSyncTime } = useData()
  
  const [viewMode, setViewMode] = useState<'timetable' | 'calendar'>('timetable')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [isEventEditorOpen, setIsEventEditorOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Refresh current time every minute for the red tracking line
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

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
        const { updateEvent } = await import('@/lib/events')
        await updateEvent(selectedEvent.id, eventData)
      } else {
        const newEvent = await createEvent(eventData, user!.id)
        if (newEvent) {
           addEvent(newEvent)
        }
      }
      
      // Close modal immediately so user isn't stuck waiting
      setIsEventEditorOpen(false)
      setSelectedEvent(null)
      
      // Refresh context entirely in the background
      refreshData().catch(console.error)
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
    const targetDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return (events || []).filter(event => {
      const eventDate = new Date(event.start_time)
      const eventStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
      return eventStr === targetDateStr
    })
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

  const renderTimetable = () => {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8 AM to 8 PM
    const days = [
      { id: 1, name: 'Monday', short: 'Mon' },
      { id: 2, name: 'Tuesday', short: 'Tue' },
      { id: 3, name: 'Wednesday', short: 'Wed' },
      { id: 4, name: 'Thursday', short: 'Thu' },
      { id: 5, name: 'Friday', short: 'Fri' }
    ]

    const getEventStyles = (startTime: string, endTime: string) => {
      const parseTime = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number)
        return h + m / 60
      }
      const startHourNum = Math.max(8, parseTime(startTime))
      const endHourNum = Math.min(20, parseTime(endTime))
      
      const top = (startHourNum - 8) * 80 // 80px per hour mapping
      const height = (endHourNum - startHourNum) * 80
      return { top: `${top}px`, height: `${height}px` }
    }

    const currentDayId = currentTime.getDay() 
    const currentHourNum = currentTime.getHours() + currentTime.getMinutes() / 60
    const currentTimeTop = (currentHourNum - 8) * 80

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-white rounded-3xl shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden"
      >
        <div className="flex border-b border-gray-100 bg-gray-50/80 backdrop-blur-md sticky top-0 z-20">
          <div className="w-16 sm:w-20 flex-shrink-0 border-r border-gray-100/50" />
          <div className="flex-1 overflow-x-auto hide-scrollbar flex snap-x snap-mandatory scroll-smooth">
            {days.map(day => (
              <div key={day.id} className="min-w-[200px] md:min-w-0 flex-1 text-center py-4 border-l border-gray-100/50 snap-center relative">
                {day.id === currentDayId && (
                  <motion.div layoutId="activeDay" className="absolute top-0 left-0 w-full h-1 bg-blue-600 rounded-b-full"></motion.div>
                )}
                <div className={`text-sm tracking-wide uppercase font-black transition-colors ${day.id === currentDayId ? 'text-blue-600' : 'text-gray-400'}`}>
                  <span className="md:hidden">{day.short}</span>
                  <span className="hidden md:inline">{day.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-[600px] overflow-y-auto custom-scrollbar relative">
           <div className="w-16 sm:w-20 flex-shrink-0 border-r border-gray-100/50 bg-white relative z-10">
              {hours.map(hour => (
                 <div key={hour} className="h-[80px] text-[10px] sm:text-xs text-gray-400 font-bold text-right pr-3 -mt-2.5 opacity-60">
                   {hour > 12 ? `${hour-12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                 </div>
              ))}
           </div>
           
           <div className="flex-1 flex overflow-x-auto hide-scrollbar snap-x snap-mandatory relative scroll-smooth" style={{ height: `${12 * 80}px` }}>
              {days.map(day => (
                 <div key={day.id} className="min-w-[200px] md:min-w-0 flex-1 border-r border-gray-100/50 relative snap-center">
                    {hours.map(hour => (
                       <div key={hour} className="absolute w-full border-t border-gray-50 pointer-events-none" style={{ top: `${(hour - 8) * 80}px` }}></div>
                    ))}
                    
                    {day.id === currentDayId && currentHourNum >= 8 && currentHourNum <= 20 && (
                       <div className="absolute w-full z-20 pointer-events-none" style={{ top: `${currentTimeTop}px` }}>
                          <div className="w-full h-[1px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 absolute -left-1.5 -top-1 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                       </div>
                    )}

                    {(timetableEntries || []).filter(e => e.day_of_week === day.id).map(cls => {
                       const course = courses?.find(c => c.id === cls.course_id)
                       const styles = getEventStyles(cls.start_time, cls.end_time)
                       
                       const getTypeColor = (type: string) => {
                         switch(type) {
                           case 'lecture': return 'from-blue-500/10 to-indigo-500/5 border-blue-500/20 text-blue-900 group-hover:border-blue-500/40 mark-blue'
                           case 'tutorial': return 'from-purple-500/10 to-fuchsia-500/5 border-purple-500/20 text-purple-900 group-hover:border-purple-500/40 mark-purple'
                           case 'lab': return 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-900 group-hover:border-emerald-500/40 mark-emerald'
                           default: return 'from-gray-500/10 to-slate-500/5 border-gray-500/20 text-gray-900 group-hover:border-gray-500/40'
                         }
                       }
                       const colorCls = getTypeColor(cls.type)

                       return (
                         <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           key={cls.id}
                           className={`absolute left-1 right-1 sm:left-2 sm:right-2 rounded-2xl p-3 border bg-gradient-to-br backdrop-blur-md overflow-hidden z-10 hover:z-30 hover:shadow-2xl transition-all duration-300 cursor-pointer group ${colorCls}`}
                           style={styles}
                         >
                            <div className="font-black text-xs sm:text-sm truncate">
                              {course?.code || cls.title}
                            </div>
                            <div className="opacity-70 font-semibold text-[10px] sm:text-xs mt-0.5">
                              {cls.start_time.slice(0,5)} - {cls.end_time.slice(0,5)}
                            </div>
                            {cls.location && (
                               <div className="text-[10px] sm:text-xs mt-2 flex items-center bg-white/40 w-fit px-2 py-0.5 rounded-md font-medium border border-white/20">
                                 <MapPin className="w-3 h-3 mr-1" />
                                 {cls.location}
                               </div>
                            )}
                         </motion.div>
                       )
                    })}
                 </div>
              ))}
           </div>
        </div>
      </motion.div>
    )
  }

  const renderCalendar = () => {
    const getEventColorDot = (type: string) => {
      switch (type) {
        case 'assignment': return 'bg-orange-400'
        case 'test': return 'bg-red-500'
        case 'lecture': return 'bg-blue-500'
        default: return 'bg-gray-400'
      }
    }

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/5 border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {monthNames[currentMonth.getMonth()]} <span className="text-gray-400 font-medium">{currentMonth.getFullYear()}</span>
              </h2>
              <div className="flex space-x-2 bg-gray-50 p-1 rounded-full">
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')} className="rounded-full hover:bg-white hover:shadow-sm h-10 w-10 p-0 text-gray-500 hover:text-gray-900">
                  <ChevronLeft className="w-5 h-5 mx-auto" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')} className="rounded-full hover:bg-white hover:shadow-sm h-10 w-10 p-0 text-gray-500 hover:text-gray-900">
                  <ChevronRight className="w-5 h-5 mx-auto" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-4 gap-x-1 sm:gap-x-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-400 py-2 uppercase tracking-widest">
                  {day}
                </div>
              ))}
              {getDaysInMonth(currentMonth).map((day, index) => {
                const date = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null
                const dayEvents = date ? getEventsForDate(date) : []
                const isToday = date && date.toDateString() === currentTime.toDateString()
                const isSelected = date && selectedDate && date.toDateString() === selectedDate.toDateString()

                return (
                  <div key={index} className="aspect-square flex items-center justify-center relative">
                    {day && date && (
                      <button
                        onClick={() => setSelectedDate(date)}
                        className={`w-full h-full max-w-[3rem] max-h-[3rem] sm:max-w-[4rem] sm:max-h-[4rem] rounded-full flex flex-col items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-110 z-10' 
                            : isToday 
                              ? 'bg-gray-100 text-gray-900 font-bold' 
                              : 'text-gray-700 hover:bg-gray-50 hover:scale-105'
                        }`}
                      >
                        <span className="text-sm sm:text-base">{day}</span>
                        {dayEvents.length > 0 && (
                          <div className="flex space-x-1 mt-1">
                            {dayEvents.slice(0, 3).map((event, idx) => (
                              <div key={idx} className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-white/80' : getEventColorDot(event.type)}`} />
                            ))}
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/5 border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-xl mr-3">📅</span>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            
            <div className="space-y-4">
              {getEventsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-300" />
                   </div>
                   <p className="text-gray-500 font-medium">Clear schedule today.</p>
                </div>
              ) : (
                getEventsForDate(selectedDate).map(event => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={event.id} 
                    className="p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-xl transition-all cursor-pointer group" 
                    onClick={() => handleEditEvent(event)}
                  >
                    <div className="flex items-start justify-between">
                       <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{event.title}</div>
                       <div className="flex space-x-1">
                         <div className={`w-2 h-2 rounded-full ${getEventColorDot(event.type)} mt-1.5`}></div>
                       </div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (isAuthLoading) return <LoadingScreen />
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onCreateCourse={() => {}} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 mobile-safe-padding overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">My Time</h1>
                <p className="text-gray-500 font-medium text-lg">
                  Control your schedule and never miss a beat.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex relative bg-gray-50 p-1 rounded-xl w-full sm:w-auto">
                  <button
                    onClick={() => setViewMode('timetable')}
                    className={`relative z-10 flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'timetable' ? 'text-blue-700' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Timetable
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`relative z-10 flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'calendar' ? 'text-blue-700' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Events
                  </button>
                  {/* Sliding highlight purely via active class background or simple logic */}
                  <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-in-out ${viewMode === 'timetable' ? 'translate-x-0' : 'translate-x-[calc(100%+8px)]'}`}></div>
                </div>

                <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

                <Button onClick={handleAddEvent} className="w-full sm:w-auto rounded-xl h-11 px-6 shadow-xl shadow-blue-500/20 whitespace-nowrap">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Event
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === 'timetable' ? renderTimetable() : renderCalendar()}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <Footer />

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
