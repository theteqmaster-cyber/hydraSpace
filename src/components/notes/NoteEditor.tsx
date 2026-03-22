'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Eye, EyeOff, FileText, BookOpen, AlertCircle, 
  CheckCircle, Bold, Italic, Heading, List, Code, Quote, RefreshCw, ArrowLeft, Cloud, CloudOff, CloudLightning, Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Note, Course } from '@/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ResearchPanel } from './ResearchPanel'

interface NoteEditorProps {
  note?: Note
  course?: Course | null
  courses: Course[]
  courseId: string
  onSave: (note: Partial<Note>) => Promise<Note | void>
  onBack: () => void
  defaultType?: Note['type']
}

export const NoteEditorComponent = ({ 
  note, 
  course,
  courses,
  courseId, 
  onSave, 
  onBack,
  defaultType
}: NoteEditorProps) => {
  const initialType = note?.type || defaultType || 'lecture'
  const [trackedNoteId, setTrackedNoteId] = useState<string | undefined>(note?.id)
  
  const [formData, setFormData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    type: initialType as typeof initialType,
    lecture_number: note?.lecture_number || undefined,
    is_shared: note?.is_shared || false
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const [viewMode, setViewMode] = useState<'write' | 'preview' | 'split'>('split')
  const [rightPaneMode, setRightPaneMode] = useState<'preview' | 'research'>('preview')
  const [researchQuery, setResearchQuery] = useState('')
  const [debouncedContent, setDebouncedContent] = useState(formData.content)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<any>(null)
  const debounceTimeoutRef = useRef<any>(null)
  const lastSavedRef = useRef<string>(JSON.stringify(formData))

  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedContent(formData.content)
    }, 300)
    return () => clearTimeout(debounceTimeoutRef.current)
  }, [formData.content])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (viewMode === 'split') setViewMode('write')
      } else {
        setViewMode('split')
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [viewMode])

  const noteTypes = [
    { value: 'lecture', label: 'Lecture', icon: BookOpen },
    { value: 'assignment', label: 'Assignment', icon: FileText },
    { value: 'test', label: 'Exam Tip', icon: AlertCircle },
    { value: 'concept', label: 'Concept', icon: CheckCircle }
  ] as const

  // Local storage draft backup
  useEffect(() => {
    const draftKey = `hydra_note_draft_${courseId}_${note?.id || 'new'}`
    if (!note) {
      const savedDraft = localStorage.getItem(draftKey)
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft)
          if (confirm('You have an unsaved draft. Would you like to restore it?')) {
            setFormData(parsed)
          } else {
            localStorage.removeItem(draftKey)
          }
        } catch (e) {
          console.error('Failed to parse draft')
        }
      }
    }
  }, [courseId, note])

  useEffect(() => {
    const draftKey = `hydra_note_draft_${courseId}_${note?.id || 'new'}`
    if (hasUnsavedChanges) {
      localStorage.setItem(draftKey, JSON.stringify(formData))
    }
  }, [formData, hasUnsavedChanges, courseId, note])

  const handleAutoSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return

    try {
      setIsSaving(true)
      setSaveStatus('saving')
      
      const savedNote = await onSave({
        ...formData,
        course_id: courseId,
        id: trackedNoteId
      })
      
      if (savedNote && savedNote.id) {
        setTrackedNoteId(savedNote.id)
      }
      
      lastSavedRef.current = JSON.stringify(formData)
      setHasUnsavedChanges(false)
      setSaveStatus('saved')
    } catch (error) {
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const currentData = JSON.stringify(formData)
    if (currentData !== lastSavedRef.current) {
      setHasUnsavedChanges(true)
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave()
      }, 1000)
    }
    return () => clearTimeout(autoSaveTimeoutRef.current)
  }, [formData])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
    
    setIsSaving(true)
    setSaveStatus('saving')
    try {
      const savedNote = await onSave({
        ...formData,
        course_id: courseId,
        id: trackedNoteId
      })
      
      if (savedNote && savedNote.id) {
        setTrackedNoteId(savedNote.id)
      }
      
      lastSavedRef.current = JSON.stringify(formData)
      setHasUnsavedChanges(false)
      const draftKey = `hydra_note_draft_${courseId}_${trackedNoteId || 'new'}`
      localStorage.removeItem(draftKey)
      
      setSaveStatus('saved')
    } catch (error) {
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackClick = async () => {
    if (hasUnsavedChanges) {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
      await handleSave()
    }
    onBack()
  }

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return
    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const text = formData.content
    const before = text.substring(0, start)
    const selection = text.substring(start, end)
    const after = text.substring(end)
    
    const newText = `${before}${prefix}${selection || 'text'}${suffix}${after}`
    setFormData(prev => ({ ...prev, content: newText }))
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newCursorPos = start + prefix.length + (selection ? selection.length : 4)
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const handleLookupText = () => {
    if (!textareaRef.current) {
      setRightPaneMode('research')
      setViewMode(window.innerWidth < 768 ? 'preview' : 'split')
      return
    }
    
    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const selection = formData.content.substring(start, end).trim()
    
    if (selection) {
      setResearchQuery(selection)
    }
    setRightPaneMode('research')
    setViewMode(window.innerWidth < 768 ? 'preview' : 'split')
  }

  const handleInsertFromResearch = (text: string) => {
    insertMarkdown(text, '')
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden text-slate-900 border-none rounded-none w-full">
      {/* Super minimalist top bar */}
      <div className="px-5 md:px-8 py-4 border-b border-slate-200 shrink-0 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white w-full">
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleBackClick}
            className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 min-w-0 pr-0 md:pr-4">
            <input
              type="text"
              placeholder="Untitled Note"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-2xl md:text-3xl font-black bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-slate-300 truncate"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide hide-scrollbar">
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="text-xs font-bold uppercase tracking-tight text-slate-500 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 px-3 shrink-0"
          >
            {noteTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <button
            onClick={() => setFormData({ ...formData, is_shared: !formData.is_shared })}
            className={`flex items-center justify-center space-x-1.5 h-9 px-3 rounded-lg border transition-all text-xs font-bold uppercase tracking-widest shrink-0 ${
              formData.is_shared 
                ? 'text-green-600 bg-green-50 border-green-100' 
                : 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {formData.is_shared ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{formData.is_shared ? 'Shared' : 'Private'}</span>
          </button>
        </div>
      </div>

      {/* Editor Toolbar (slim) */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between overflow-x-auto shrink-0 hide-scrollbar scrollbar-hide w-full">
        <div className="flex items-center space-x-1 min-w-max">
          <button onClick={() => insertMarkdown('**', '**')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="Bold">
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => insertMarkdown('*', '*')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="Italic">
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-300 mx-2" />
          <button onClick={() => insertMarkdown('### ')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="Heading">
            <Heading className="w-4 h-4" />
          </button>
          <button onClick={() => insertMarkdown('- ')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="List">
            <List className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-300 mx-2" />
          <button onClick={() => insertMarkdown('`', '`')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="Code">
            <Code className="w-4 h-4" />
          </button>
          <button onClick={() => insertMarkdown('> ')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="Quote">
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-300 mx-2" />
          <button 
            onClick={handleLookupText} 
            className="flex items-center space-x-1 p-1.5 px-3 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" 
            title="Lookup selected text"
          >
            <Search className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide">Research</span>
          </button>
          
          {/* Status Indicator */}
          <div className="flex items-center ml-4 pl-4 border-l border-slate-300 space-x-2 w-32">
            {saveStatus === 'saving' && (
              <div className="flex items-center text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Syncing
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-md">
                <Cloud className="w-3 h-3 mr-1" /> Saved
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-1 rounded-md">
                <CloudOff className="w-3 h-3 mr-1" /> Offline
              </div>
            )}
            {hasUnsavedChanges && saveStatus === 'idle' && (
              <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                <CloudLightning className="w-3 h-3 mr-1" /> Draft
              </div>
            )}
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex md:hidden bg-slate-200 p-0.5 rounded-md min-w-max ml-2">
          <button onClick={() => setViewMode('write')} className={`px-3 py-1 text-[10px] font-bold rounded uppercase ${viewMode === 'write' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Write</button>
          <button onClick={() => setViewMode('preview')} className={`px-3 py-1 text-[10px] font-bold rounded uppercase ${viewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Preview</button>
        </div>
      </div>

      {/* Split Pane Content */}
      <div className="flex-1 flex overflow-hidden bg-white w-full">
        {/* Write Pane */}
        {(viewMode === 'write' || viewMode === 'split') && (
          <div className={`flex-1 flex flex-col ${viewMode === 'split' ? 'border-r border-slate-200' : ''}`}>
             <textarea
              ref={textareaRef}
              className="flex-1 w-full p-6 md:p-10 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-slate-800 font-mono text-sm leading-loose custom-scrollbar"
              placeholder="What are we learning today?"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
        )}

        {/* Right Pane (Preview or Research) */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
            
            {/* Embedded Right Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
              <button 
                onClick={() => setRightPaneMode('preview')} 
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${rightPaneMode === 'preview' ? 'text-blue-700 bg-white border-t-2 border-t-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100 border-t-2 border-t-transparent'}`}
              >
                Output
              </button>
              <button 
                onClick={() => setRightPaneMode('research')} 
                className={`flex-1 flex items-center justify-center py-3 text-xs font-bold uppercase tracking-widest transition-colors ${rightPaneMode === 'research' ? 'text-blue-700 bg-white border-t-2 border-t-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100 border-t-2 border-t-transparent'}`}
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                Research
              </button>
            </div>

            {rightPaneMode === 'preview' ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {debouncedContent ? (
                  <div className="prose prose-sm md:prose-base prose-slate max-w-none p-6 md:p-10 w-full mx-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {debouncedContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center justify-center text-slate-200 text-center">
                      <FileText className="w-16 h-16 opacity-30 mb-4" />
                      <p className="text-sm font-medium tracking-wide opacity-50">PREVIEW RENDER</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-hidden relative border-l border-slate-100 min-h-0">
                <div className="absolute inset-0">
                  <ResearchPanel 
                    initialQuery={researchQuery} 
                    onInsert={handleInsertFromResearch} 
                  />
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  )
}

export default NoteEditorComponent
