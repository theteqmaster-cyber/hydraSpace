import { supabase } from './supabase'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string
  time: string
  type: 'assignment' | 'exam' | 'lecture' | 'meeting' | 'other'
  course_id?: string
  location?: string
  user_id: string
  created_at: string
  updated_at: string
}

export const getEvents = async (userId: string): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (error) throw error
  return data || []
}

export const createEvent = async (event: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId: string): Promise<CalendarEvent> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      ...event,
      user_id: userId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateEvent = async (id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .update(event)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)

  if (error) throw error
}
