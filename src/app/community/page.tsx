'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { Note } from '@/types'
import { Search, BookOpen, FileText, AlertCircle, CheckCircle, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

import { CommunityNotePreview } from '@/components/community/CommunityNotePreview'

function CommunityPageContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedNote, setSelectedNote] = useState<any | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  const { user } = useAuth()
  const { sharedNotes, isLoading } = useData()

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const { searchNotes } = await import('@/lib/notes')
      const results = await searchNotes(searchQuery, user?.id)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching notes:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const displayNotes = searchQuery ? searchResults : sharedNotes

  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'lecture': return BookOpen
      case 'assignment': return FileText
      case 'test': return AlertCircle
      case 'concept': return CheckCircle
      default: return FileText
    }
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-blue-100 text-blue-700'
      case 'assignment': return 'bg-emerald-100 text-emerald-700'
      case 'test': return 'bg-rose-100 text-rose-700'
      case 'concept': return 'bg-violet-100 text-violet-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleNoteClick = (note: any) => {
    setSelectedNote(note)
    setIsPreviewOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Header onCreateCourse={() => {}} />
      
      <main className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 mobile-safe-padding overflow-y-auto max-h-screen custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 text-blue-600 font-bold tracking-wider uppercase text-xs mb-2"
                >
                  <span className="w-8 h-[2px] bg-blue-600"></span>
                  <span>Community Network</span>
                </motion.div>
                <h1 className="text-fluid-h1 text-gray-900">
                  Academic <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Library</span>
                </h1>
                <p className="text-gray-500 mt-4 text-base md:text-lg max-w-xl leading-relaxed">
                  Discover, share, and expand your knowledge with curated notes from fellow high-achieving students.
                </p>
              </div>

              {/* Stats Mini Section */}
              <div className="flex items-center space-x-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{sharedNotes.length}</div>
                  <div className="text-xs text-gray-400 uppercase font-semibold">Total Shared</div>
                </div>
                <div className="w-[1px] h-8 bg-gray-100"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {sharedNotes.filter(n => n.type === 'lecture').length}
                  </div>
                  <div className="text-xs text-gray-400 uppercase font-semibold">Lectures</div>
                </div>
              </div>
            </div>

            {/* Premium Search Experience */}
            <div className="bg-white p-2 rounded-2xl shadow-xl shadow-blue-500/5 border border-gray-100 mb-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 group-hover:bg-indigo-50 transition-colors duration-500"></div>
              <div className="flex flex-col sm:flex-row gap-2 relative z-10">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by topic, course code, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-12 h-14 bg-transparent border-none focus:ring-0 text-lg placeholder:text-gray-300"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading || isSearching}
                  size="lg"
                  className="h-14 px-8 rounded-xl shadow-lg shadow-blue-600/20"
                >
                  {isSearching ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Discovery...</span>
                    </div>
                  ) : 'Search Library'}
                </Button>
              </div>
            </div>

            {(isLoading || isSearching) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-100 p-6">
                    <div className="w-24 h-6 bg-gray-100 rounded-full mb-4"></div>
                    <div className="w-full h-8 bg-gray-100 rounded-lg mb-4"></div>
                    <div className="w-2/3 h-4 bg-gray-100 rounded-lg mb-8"></div>
                    <div className="flex justify-between">
                      <div className="w-20 h-4 bg-gray-100 rounded"></div>
                      <div className="w-20 h-4 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {displayNotes.length === 0 ? (
                  <motion.div
                    className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                      <BookOpen className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                       {searchQuery ? 'No Results Found' : 'Be a Pioneer'}
                    </h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto italic">
                      {searchQuery 
                        ? "We couldn't find any notes matching your search. Try a different keyword or course code." 
                        : "The library is looking a bit empty. Share your high-quality academic notes to help the community grow!"}
                    </p>
                    {user && !searchQuery && (
                       <Button variant="outline" className="rounded-xl px-8 h-12">
                          Start Contributing
                       </Button>
                    )}
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayNotes.map((note, index) => {
                      const Icon = getNoteIcon(note.type)
                      return (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                          className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-blue-600/10 border border-gray-100 p-7 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col relative"
                          onClick={() => handleNoteClick(note)}
                        >
                          {/* Rich Decorator */}
                          <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] transition-transform duration-500 group-hover:scale-125 -translate-y-8 translate-x-8`}>
                            <Icon className="w-full h-full" />
                          </div>

                          <div className="flex items-start justify-between mb-6">
                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${getTypeStyles(note.type)} transition-colors duration-300`}>
                              {note.type}
                            </div>
                            <div className="flex space-x-1">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="w-1 h-1 bg-gray-200 rounded-full"></div>
                              ))}
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                            {note.title}
                          </h3>

                          <p className="text-gray-500 text-sm mb-8 line-clamp-3 leading-relaxed flex-grow">
                            {note.content}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-6 border-t border-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                {note.users?.name?.substring(0, 2).toUpperCase() || 'AN'}
                              </div>
                              <span className="font-semibold text-gray-600">{note.users?.name || 'Anonymous'}</span>
                            </div>
                            <div className="flex items-center space-x-1 font-medium bg-gray-50 px-2 py-1 rounded">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(note.created_at)}</span>
                            </div>
                          </div>

                          {note.courses && (
                            <div className="mt-4 flex items-center space-x-2">
                               <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                                 {note.courses.code}
                               </span>
                               <span className="text-[10px] text-gray-400 font-medium truncate">
                                 {note.courses.name}
                               </span>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </main>
      </main>

      <Footer />

      {/* Note Preview Modal */}
      {selectedNote && (
        <CommunityNotePreview
          note={selectedNote}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
      <BottomNav />
    </div>
  )
}


export default function CommunityPage() {
  return <CommunityPageContent />
}
