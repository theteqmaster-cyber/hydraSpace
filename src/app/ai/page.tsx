'use client'

import { ResearchPanel } from '@/components/notes/ResearchPanel'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { useRouter } from 'next/navigation'

export default function AIPage() {
  const router = useRouter()

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <Header onCreateCourse={() => {}} />
      
      <main className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col bg-paper relative">
          <ResearchPanel 
            onClose={() => router.back()}
          />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
