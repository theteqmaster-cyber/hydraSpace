'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, Sparkles, AlertCircle, ArrowRightCircle, X, User, Bot, Quote, ChevronLeft, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { getGeminiResponse } from '@/lib/gemini'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

interface Message {
  role: 'user' | 'model'
  content: string
  id: string
}

interface ResearchPanelProps {
  initialQuery?: string
  context?: string
  onInsert?: (text: string) => void
  onClose?: () => void
}

export const ResearchPanel = ({ initialQuery = '', context = '', onInsert, onClose }: ResearchPanelProps) => {
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

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (initialQuery && messages.length <= 1) {
      setInput(initialQuery)
    }
  }, [initialQuery])

  const handleSend = async (text: string) => {
    const prompt = text.trim()
    if (!prompt || isLoading) return

    // Inject context if available for first message or explicit actions
    const finalPrompt = context ? `Context: ${context}\n\nUser Question: ${prompt}` : prompt

    const userMessage: Message = {
      role: 'user',
      content: prompt, // Keep the UI message clean
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

      const response = await getGeminiResponse(finalPrompt, history)
      
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend(input)
  }

  return (
    <div 
      className="flex flex-col h-full overflow-hidden relative border-l border-slate-200"
      style={{ backgroundColor: '#f9f6e5' }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b border-slate-200 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(249, 246, 229, 0.8)' }}
      >
        <div className="flex items-center space-x-2">
          {onClose && (
            <button 
              onClick={onClose}
              className="xl:hidden p-1 mr-1 text-slate-400 hover:text-slate-900 transition-colors bg-slate-100 rounded-full"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
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

      {/* Quick Actions */}
      <div className="px-4 py-2 border-b border-slate-100 flex gap-2 overflow-x-auto hide-scrollbar scrollbar-hide bg-white/50">
        {[
          { label: 'Summarize', prompt: 'Summarize this note in 5 bullet points.' },
          { label: 'Concepts', prompt: 'What are the 3 key concepts in this note?' },
          { label: 'Exam Tips', prompt: 'Generate 3 exam tips based on this note.' },
          { label: 'Explain', prompt: 'Explain this note to me like I am 5.' }
        ].map(action => (
          <button
            key={action.label}
            onClick={() => handleSend(action.prompt)}
            disabled={isLoading}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all border border-blue-100/50"
          >
            {action.label}
          </button>
        ))}
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
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
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
                    onClick={() => handleCopy(message.content, message.id)}
                    className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:bg-blue-50 bg-white border border-slate-200 rounded-full"
                  >
                    {copiedId === message.id ? <Check className="w-3 h-3 mr-1.5" /> : <Copy className="w-3 h-3 mr-1.5" />}
                    {copiedId === message.id ? 'Copied' : 'Copy'}
                  </Button>
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
      <div 
        className="p-4 border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] z-20"
        style={{ backgroundColor: '#f9f6e5' }}
      >
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
          Empowering focus. Powered by Groq.
        </p>
      </div>
    </div>
  )
}
