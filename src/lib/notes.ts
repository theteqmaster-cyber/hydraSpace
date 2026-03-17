import { supabase } from './supabase'
import { Note } from '@/types'

export const getNotes = async (userId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const getNotesForCourse = async (courseId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const createNote = async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      ...note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateNote = async (id: string, note: Partial<Omit<Note, 'id' | 'user_id' | 'course_id' | 'created_at'>>): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .update({
      ...note,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteNote = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const getSharedNotes = async (limit = 10, offset = 0): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      courses(name, code),
      users(name)
    `)
    .eq('is_shared', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data || []
}

export const searchNotes = async (query: string, userId?: string): Promise<Note[]> => {
  let supabaseQuery = supabase
    .from('notes')
    .select(`
      *,
      courses(name, code),
      users(name)
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  // If user is logged in, include their private notes
  if (userId) {
    supabaseQuery = supabaseQuery.or(`(title.ilike.%${query}%,content.ilike.%${query}%),user_id.eq.${userId}`)
  } else {
    // Only show shared notes to non-logged in users
    supabaseQuery = supabaseQuery.eq('is_shared', true)
  }

  const { data, error } = await supabaseQuery

  if (error) throw error
  return data || []
}
