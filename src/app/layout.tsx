import { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { DataProvider } from '@/contexts/DataContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HydraSpace - Your Digital Academic Workspace',
  description: 'Organize, collaborate, and excel with HydraSpace - the ultimate note-taking platform for university students.',
  manifest: '/manifest.json',
  applicationName: 'HydraSpace',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HydraSpace',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
