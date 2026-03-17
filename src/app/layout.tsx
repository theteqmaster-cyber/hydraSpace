import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { DataProvider } from '@/contexts/DataContext'
import { AuthDebug } from '@/components/auth/AuthDebug'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HydraSpace - Your Digital Academic Workspace',
  description: 'Organize, collaborate, and excel with HydraSpace - the ultimate note-taking platform for university students.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DataProvider>
            {children}
            {process.env.NODE_ENV === 'development' && <AuthDebug />}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
