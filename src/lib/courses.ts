import { supabase } from './supabase'
import { Course } from '@/types'

export const getCourses = async (userId: string): Promise<Course[]> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const createCourse = async (course: Omit<Course, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId: string): Promise<Course> => {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      ...course,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateCourse = async (id: string, course: Partial<Omit<Course, 'id' | 'user_id' | 'created_at'>>): Promise<Course> => {
  const { data, error } = await supabase
    .from('courses')
    .update({
      ...course,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteCourse = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const getCourseStats = async (courseId: string) => {
  // Get notes count for this course
  const { data: notesData, error: notesError } = await supabase
    .from('notes')
    .select('id')
    .eq('course_id', courseId)

  if (notesError) throw notesError

  // Get shared notes count
  const { data: sharedData, error: sharedError } = await supabase
    .from('notes')
    .select('id')
    .eq('course_id', courseId)
    .eq('is_shared', true)

  if (sharedError) throw sharedError

  return {
    notesCount: notesData?.length || 0,
    sharedCount: sharedData?.length || 0
  }
}
