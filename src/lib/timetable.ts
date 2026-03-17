import { supabase } from './supabase'

export interface TimetableEntry {
  id: string
  user_id: string
  course_id?: string
  day_of_week: number // 0-6, 1 = Monday
  start_time: string // "HH:mm:ss"
  end_time: string // "HH:mm:ss"
  title: string
  location?: string
  type: 'lecture' | 'lab' | 'tutorial'
}

export const getTimetableEntries = async (userId: string): Promise<TimetableEntry[]> => {
  const { data, error } = await supabase
    .from('timetable_entries')
    .select('*')
    .eq('user_id', userId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error
  return data || []
}

export const createTimetableEntry = async (entry: Omit<TimetableEntry, 'id' | 'user_id'>, userId: string): Promise<TimetableEntry> => {
  const { data, error } = await supabase
    .from('timetable_entries')
    .insert({
      ...entry,
      user_id: userId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateTimetableEntry = async (id: string, entry: Partial<TimetableEntry>): Promise<TimetableEntry> => {
  const { data, error } = await supabase
    .from('timetable_entries')
    .update(entry)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteTimetableEntry = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('timetable_entries')
    .delete()
    .eq('id', id)

  if (error) throw error
}
