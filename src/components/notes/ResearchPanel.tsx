'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ExternalLink, Loader2, BookOpen, AlertCircle, Copy, ArrowRightCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

interface ResearchPanelProps {
  initialQuery?: string
  onInsert?: (text: string) => void
}

interface WikiResult {
  title: string
  description?: string
  extract: string
  thumbnail?: { source: string }
  content_urls: { desktop: { page: string } }
}

export const ResearchPanel = ({ initialQuery = '', onInsert }: ResearchPanelProps) => {
  const [query, setQuery] = useState(initialQuery)
  const [activeSearch, setActiveSearch] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'notFound' | 'error'>('idle')
  const [result, setResult] = useState<WikiResult | null>(null)
  const [searchResults, setSearchResults] = useState<{title: string, snippet: string}[]>([])

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery)
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      handleSearch(query)
    }
  }

  const handleSearch = async (searchQuery: string) => {
    const q = searchQuery.trim()
    if (!q) return

    setQuery(q)
    setActiveSearch(q)
    setStatus('loading')
    setResult(null)
    setSearchResults([])

    try {
      // 1. Fetch exact summary from REST API
      const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`)
      
      if (summaryRes.ok) {
        const data = await summaryRes.json()
        if (data.type !== 'disambiguation' && data.extract) {
          setResult(data)
          setStatus('success')
          return
        }
      }

      // 2. If it fails or is disambiguation, do a broad open search
      const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&utf8=&format=json&origin=*`)
      const searchData = await searchRes.json()

      if (searchData.query?.search?.length > 0) {
        setSearchResults(searchData.query.search)
        setStatus('notFound')
      } else {
        setStatus('notFound')
      }
    } catch (e) {
      console.error(e)
      setStatus('error')
    }
  }

  const renderContent = () => {
    if (status === 'idle') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center mt-12">
          <BookOpen className="w-16 h-16 opacity-20 mb-4" />
          <p className="font-medium text-slate-500">Highlight a word and click Research, or search directly.</p>
          <p className="text-xs mt-2 opacity-60">Powered by Wikipedia API</p>
        </div>
      )
    }

    if (status === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-blue-500 mt-12">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p className="text-sm font-bold animate-pulse text-blue-900">Gathering intelligence...</p>
        </div>
      )
    }

    if (status === 'success' && result) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8 space-y-6"
        >
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-none">{result.title}</h2>
              {result.thumbnail && (
                <img src={result.thumbnail.source} alt={result.title} className="w-16 h-16 rounded-lg object-cover shadow-sm bg-slate-100 shrink-0" />
              )}
            </div>
            {result.description && (
              <p className="text-sm text-blue-600 font-bold uppercase tracking-widest mt-3">{result.description}</p>
            )}
          </div>

          <div className="prose prose-sm prose-slate leading-loose text-slate-700">
             <p>{result.extract}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
            {onInsert && (
              <Button 
                onClick={() => onInsert(`\n> **${result.title}**: ${result.extract}\n`)}
                variant="primary" 
                size="sm"
                className="font-bold shadow-lg shadow-blue-500/20"
              >
                <ArrowRightCircle className="w-4 h-4 mr-2" />
                Quote in Note
              </Button>
            )}
            <a 
              href={result.content_urls.desktop.page} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors bg-white border border-slate-200 hover:border-blue-200 px-4 py-2 rounded-lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Read full article
            </a>
          </div>
        </motion.div>
      )
    }

    if (status === 'notFound') {
      return (
        <div className="p-6 md:p-8">
          <div className="flex items-center text-orange-600 mb-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            <p className="text-sm font-medium">Exact match not found for <strong className="font-black">"{activeSearch}"</strong>.</p>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4 relative">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Related Topics</h3>
              {searchResults.slice(0, 5).map((res, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={res.title}
                  onClick={() => handleSearch(res.title)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/50 cursor-pointer transition-all group"
                >
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{res.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: res.snippet }}></p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center text-red-500 mt-12">
          <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-bold">Network Error</p>
          <p className="text-sm text-slate-500 mt-2">Could not connect to knowledge base. Please try again.</p>
        </div>
      )
    }

    return null
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden relative">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
        <form onSubmit={handleSearchClick} className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search encyclopedia..."
            className="w-full pl-10 pr-[100px] py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-sm font-medium placeholder:text-slate-400"
          />
          <div className="absolute right-1.5 flex items-center space-x-1">
            {query && (
              <button 
                type="button"
                onClick={() => {
                  setQuery('')
                  setActiveSearch('')
                  setStatus('idle')
                  setResult(null)
                  setSearchResults([])
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button 
              type="submit"
              className="px-4 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              Find
            </button>
          </div>
        </form>
      </div>

      {/* Dynamic Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  )
}
