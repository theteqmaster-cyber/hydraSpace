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

export const getSharedNotes = async (limit = 10, offset = 0, sortBy: 'newest' | 'trending' = 'newest'): Promise<Note[]> => {
  let query = supabase
    .from('notes')
    .select(`
      *,
      courses(name, code),
      users(name)
    `)
    .eq('is_shared', true)
    
  if (sortBy === 'trending') {
    query = query.order('upvotes', { ascending: false }).order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query.range(offset, offset + limit - 1)

  if (error) throw error
  return data || []
}

export const toggleUpvote = async (noteId: string, userId: string): Promise<{ upvotes: number, upvoted_by: string[] }> => {
  const { data: note, error: fetchError } = await supabase
    .from('notes')
    .select('upvoted_by, upvotes')
    .eq('id', noteId)
    .single()

  if (fetchError) throw fetchError

  const currentUpvotedBy = note.upvoted_by || []
  let newUpvotedBy = [...currentUpvotedBy]
  let newUpvotes = note.upvotes || 0

  if (currentUpvotedBy.includes(userId)) {
    // Remove upvote
    newUpvotedBy = currentUpvotedBy.filter((id: string) => id !== userId)
    newUpvotes = Math.max(0, newUpvotes - 1)
  } else {
    // Add upvote
    newUpvotedBy.push(userId)
    newUpvotes += 1
  }

  const { data: updatedNote, error: updateError } = await supabase
    .from('notes')
    .update({ 
      upvoted_by: newUpvotedBy,
      upvotes: newUpvotes 
    })
    .eq('id', noteId)
    .select('upvotes, upvoted_by')
    .single()

  if (updateError) throw updateError

  return updatedNote
}

export const searchNotes = async (query: string, userId?: string, sortBy: 'newest' | 'trending' = 'newest'): Promise<Note[]> => {
  let supabaseQuery = supabase
    .from('notes')
    .select(`
      *,
      courses(name, code),
      users(name)
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    
  if (sortBy === 'trending') {
    supabaseQuery = supabaseQuery.order('upvotes', { ascending: false }).order('created_at', { ascending: false })
  } else {
    supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
  }

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
