import { supabase } from './supabase'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  type: 'assignment' | 'test' | 'lecture' | 'other'
  course_id?: string
  user_id: string
  created_at: string
}

export const getEvents = async (userId: string): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true })

  if (error) throw error
  return data || []
}

export const createEvent = async (event: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId: string): Promise<CalendarEvent> => {
  const insertPromise = supabase
    .from('calendar_events')
    .insert({
      ...event,
      user_id: userId
    })
    .select()
    .single()

  const timeoutPromise = new Promise<{data: any, error: any}>((_, reject) => 
    setTimeout(() => reject(new Error('Database request timed out')), 8000)
  )

  const { data, error } = await Promise.race([insertPromise, timeoutPromise])

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
