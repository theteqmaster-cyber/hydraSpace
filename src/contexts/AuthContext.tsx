'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthUser, onAuthStateChange, getCurrentUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let isInitialized = false

    const init = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (mounted) {
          setUser(currentUser)
          setIsLoading(false)
          isInitialized = true
        }
      } catch (error) {
        console.error('Failed to hydrate secure session:', error)
        if (mounted) {
          setUser(null)
          setIsLoading(false)
          isInitialized = true
        }
      }
    }

    // Await background refresh tokens manually
    init()

    const { data: { subscription } } = onAuthStateChange((currentUser) => {
      if (mounted && isInitialized) {
        console.log('Context handled auth state change')
        setUser(currentUser)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const { signOut } = await import('@/lib/auth')
    await signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
