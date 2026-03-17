import { supabase } from './supabase'

export interface AuthUser {
  id: string
  email: string
  name?: string
  university?: string
}

export const signUp = async (email: string, password: string, name?: string, university?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        university
      }
    }
  })

  if (error) throw error

  // Create user profile in our users table
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        name,
        university
      })

    if (profileError) throw profileError

    // Send welcome email
    const { sendEmail } = await import('./email')
    await sendEmail(data.user.email!, 'welcome', { name: name || 'Student' })
  }

  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const sendPasswordResetEmail = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
  return data
}

export const updatePassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password
  })
  if (error) throw error
  return data
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get user profile from our users table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session?.user?.id)
    if (session?.user) {
      const profile = await getCurrentUser()
      console.log('User profile loaded:', profile)
      callback(profile)
    } else {
      console.log('User signed out')
      callback(null)
    }
  })
}
