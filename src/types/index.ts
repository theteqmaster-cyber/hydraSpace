export interface User {
  id: string
  email: string
  name?: string
  university?: string
  created_at: string
}

export interface Course {
  id: string
  user_id: string
  name: string
  code?: string
  description?: string
  color?: string
  is_archived?: boolean
  archived_at?: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  user_id: string
  course_id: string
  title: string
  content: string
  type: 'lecture' | 'assignment' | 'test' | 'concept'
  lecture_number?: number
  is_shared: boolean
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  course_id?: string
  title: string
  description?: string
  start_time: string
  end_time: string
  type: 'lecture' | 'assignment' | 'test' | 'other'
  created_at: string
}

export interface TimetableEntry {
  id: string
  user_id: string
  course_id?: string
  day_of_week: number // 0-6 (Sunday-Saturday)
  start_time: string
  end_time: string
  title: string
  location?: string
  type: 'lecture' | 'lab' | 'tutorial'
}

export interface Report {
  id: string
  note_id: string
  reporter_id: string
  reason: 'spam' | 'offensive' | 'irrelevant' | 'other'
  description?: string
  created_at: string
}
