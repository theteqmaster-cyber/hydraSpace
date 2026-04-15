'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, Sparkles, AlertCircle, ArrowRightCircle, X, User, Bot, Quote } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { getGeminiResponse } from '@/lib/gemini'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'model'
  content: string
  id: string
}

interface ResearchPanelProps {
  initialQuery?: string
  onInsert?: (text: string) => void
}

export const ResearchPanel = ({ initialQuery = '', onInsert }: ResearchPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hi! I'm **Mphathi**, your AI study assistant. How can I help you today? Whether you're stuck on a concept, need a summary, or want brainstorming ideas, I'm here for you.",
      id: 'welcome'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery)
    }
  }, [initialQuery])

  const handleSend = async (text: string) => {
    const prompt = text.trim()
    if (!prompt || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: prompt,
      id: Date.now().toString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const history = messages.map(m => ({
        role: m.role as 'user' | 'model',
        parts: [{ text: m.content }]
      }))

      const response = await getGeminiResponse(prompt, history)
      
      const aiMessage: Message = {
        role: 'model',
        content: response,
        id: (Date.now() + 1).toString()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend(input)
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative border-l border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Mphathi</h2>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-none">AI Study Assistant</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setMessages([{
            role: 'model',
            content: "Hi! I'm **Mphathi**, your AI study assistant. How can I help you today?",
            id: 'welcome-' + Date.now()
          }])}
          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500"
        >
          Reset Chat
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[90%] p-4 rounded-2xl shadow-sm border ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none' 
                    : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                }`}
              >
                <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : 'prose-slate'}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
              
              {message.role === 'model' && message.id !== 'welcome' && onInsert && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex space-x-2"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onInsert(`\n\n--- AI Assistant (Mphathi) ---\n${message.content}\n---`)}
                    className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 bg-white border border-blue-100 rounded-full"
                  >
                    <Quote className="w-3 h-3 mr-1.5" />
                    Insert into Note
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 text-blue-500 bg-blue-50/50 w-fit p-3 rounded-2xl border border-blue-100"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-bold animate-pulse uppercase tracking-widest">Mphathi is thinking...</span>
          </motion.div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-600 text-xs font-medium">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input 
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to Mphathi, your AI assistant..."
            className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-black disabled:bg-slate-200 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[9px] text-center text-slate-400 mt-3 font-bold uppercase tracking-[0.2em]">
          Empowering focus. Powered by Gemini.
        </p>
      </div>
    </div>
  )
}
