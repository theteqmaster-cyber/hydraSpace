'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getCourses } from '@/lib/courses'
import { getNotes, getSharedNotes } from '@/lib/notes'
import { getEvents, createEvent } from '@/lib/events'
import { CalendarEvent } from '@/lib/events'
import { Course, Note } from '@/types'

interface DataState {
  courses: Course[]
  notes: Note[]
  sharedNotes: Note[]
  events: CalendarEvent[]
  isLoading: boolean
  isOffline: boolean
  lastSyncTime: Date | null
  refreshData: () => Promise<void>
  updateLocalData: (type: 'courses' | 'notes' | 'sharedNotes' | 'events' | 'timetable', data: any[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  addEvent: (event: CalendarEvent) => void
  timetableEntries: any[]
  addTimetableEntry: (entry: any) => void
  updateTimetableEntry: (id: string, updates: any) => void
  deleteTimetableEntry: (id: string) => void
}

const DataContext = createContext<DataState | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [sharedNotes, setSharedNotes] = useState<Note[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [timetableEntries, setTimetableEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCourses = localStorage.getItem('hydraspace_courses')
      const savedNotes = localStorage.getItem('hydraspace_notes')
      const savedSharedNotes = localStorage.getItem('hydraspace_shared_notes')
      const savedEvents = localStorage.getItem('hydraspace_events')
      const savedTimetable = localStorage.getItem('hydraspace_timetable')
      const savedSyncTime = localStorage.getItem('hydraspace_last_sync')

      if (savedCourses) setCourses(JSON.parse(savedCourses))
      if (savedNotes) setNotes(JSON.parse(savedNotes))
      if (savedSharedNotes) setSharedNotes(JSON.parse(savedSharedNotes))
      if (savedEvents) setEvents(JSON.parse(savedEvents))
      if (savedTimetable) setTimetableEntries(JSON.parse(savedTimetable))
      if (savedSyncTime) setLastSyncTime(new Date(savedSyncTime))
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hydraspace_courses', JSON.stringify(courses))
      localStorage.setItem('hydraspace_notes', JSON.stringify(notes))
      localStorage.setItem('hydraspace_shared_notes', JSON.stringify(sharedNotes))
      localStorage.setItem('hydraspace_events', JSON.stringify(events))
      localStorage.setItem('hydraspace_timetable', JSON.stringify(timetableEntries))
      if (lastSyncTime) {
        localStorage.setItem('hydraspace_last_sync', lastSyncTime.toISOString())
      }
    }
  }, [courses, notes, sharedNotes, events, timetableEntries, lastSyncTime])

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Preload all data when user signs in
  const refreshData = async () => {
    if (!user) {
      console.log('No user found, skipping data preload')
      return
    }

    console.log('Starting data preload for user:', user.id)
    setIsLoading(true)
    try {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Supabase URL not configured')
      }
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase anon key not configured')
      }

      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...')
      console.log('Supabase Key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      // Fetch all data in parallel
      const { getTimetableEntries } = await import('@/lib/timetable')
      const [coursesData, notesData, sharedNotesData, eventsData, timetableData] = await Promise.all([
        getCourses(user.id),
        getNotes(user.id),
        getSharedNotes(),
        getEvents(user.id),
        getTimetableEntries(user.id)
      ])

      console.log('Raw data received:', {
        courses: coursesData?.length,
        notes: notesData?.length,
        sharedNotes: sharedNotesData?.length,
        events: eventsData?.length,
        timetable: timetableData?.length
      })

      setCourses(coursesData?.map(c => ({ ...c, code: c.code || '' })) || [])
      setNotes(notesData || [])
      setSharedNotes(sharedNotesData || [])
      setEvents(eventsData || [])
      setTimetableEntries(timetableData || [])
      setLastSyncTime(new Date())

      console.log('All data preloaded successfully')
    } catch (error) {
      console.error('Error preloading data:', error)
      console.error('Error details:', (error as Error).message || 'Unknown error')
      console.error('Error stack:', (error as Error).stack)
      // If network fails, use cached data
      setIsOffline(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh when user comes online
  useEffect(() => {
    if (!isOffline && user && lastSyncTime) {
      const timeSinceLastSync = Date.now() - lastSyncTime.getTime()
      // Refresh if offline for more than 5 minutes
      if (timeSinceLastSync > 5 * 60 * 1000) {
        refreshData()
      }
    }
  }, [isOffline, user, lastSyncTime])

  // Initial data load when user signs in
  useEffect(() => {
    if (user) {
      refreshData()
    }
  }, [user])

  const updateLocalData = (type: 'courses' | 'notes' | 'sharedNotes' | 'events', data: any[]) => {
    switch (type) {
      case 'courses':
        setCourses(data)
        break
      case 'notes':
        setNotes(data)
        break
      case 'sharedNotes':
        setSharedNotes(data)
        break
      case 'events':
        setEvents(data)
        break
      case 'timetable':
        setTimetableEntries(data)
        break
    }
  }

  const addNote = (note: Note) => {
    setNotes(prev => [note, ...prev])
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ))
  }

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id))
  }

  const addEvent = (event: CalendarEvent) => {
    setEvents(prev => [event, ...prev])
  }

  const addTimetableEntry = (entry: any) => {
    setTimetableEntries(prev => [...prev, entry])
  }

  const updateTimetableEntry = (id: string, updates: any) => {
    setTimetableEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ))
  }

  const deleteTimetableEntry = (id: string) => {
    setTimetableEntries(prev => prev.filter(entry => entry.id !== id))
  }

  return (
    <DataContext.Provider
      value={{
        courses,
        notes,
        sharedNotes,
        events,
        timetableEntries,
        isLoading,
        isOffline,
        lastSyncTime,
        refreshData,
        updateLocalData,
        addNote,
        updateNote,
        deleteNote,
        addEvent,
        addTimetableEntry,
        updateTimetableEntry,
        deleteTimetableEntry
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
