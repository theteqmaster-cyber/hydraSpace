'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/Button'

export const AuthDebug = () => {
  const auth = useAuth()
  const { isLoading: dataLoading } = useData()

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs z-50">
      <h3 className="font-semibold text-sm mb-2">Auth Debug Info</h3>
      <div className="text-xs space-y-1">
        <p>Auth Loading: {auth.isLoading ? 'Yes' : 'No'}</p>
        <p>Authenticated: {auth.user ? 'Yes' : 'No'}</p>
        <p>Data Loading: {dataLoading ? 'Yes' : 'No'}</p>
        {auth.user && (
          <>
            <p>ID: {auth.user.id}</p>
            <p>Email: {auth.user.email}</p>
            <p>Name: {auth.user.name || 'Not set'}</p>
          </>
        )}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200">
        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => {
            console.log('Auth state:', { user: auth.user, isLoading: auth.isLoading })
            console.log('Supabase session:', window.localStorage.getItem('supabase.auth.token'))
          }}
        >
          Log Auth State
        </Button>
      </div>
    </div>
  )
}
