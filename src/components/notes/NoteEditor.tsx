'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Eye, EyeOff, FileText, BookOpen, AlertCircle, 
  CheckCircle, Bold, Italic, Heading, List, Code, Quote, 
  RefreshCw, ArrowLeft, Cloud, CloudOff, CloudLightning, 
  Search, Sigma, Edit3, X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Note, Course } from '@/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { ResearchPanel } from './ResearchPanel'

// ─── Math symbol categories ───────────────────────────────────────────────────
const MATH_SYMBOLS = {
  Greek: [
    { label: 'α', insert: 'α' }, { label: 'β', insert: 'β' },
    { label: 'γ', insert: 'γ' }, { label: 'δ', insert: 'δ' },
    { label: 'ε', insert: 'ε' }, { label: 'θ', insert: 'θ' },
    { label: 'λ', insert: 'λ' }, { label: 'μ', insert: 'μ' },
    { label: 'ν', insert: 'ν' }, { label: 'π', insert: 'π' },
    { label: 'ρ', insert: 'ρ' }, { label: 'σ', insert: 'σ' },
    { label: 'τ', insert: 'τ' }, { label: 'φ', insert: 'φ' },
    { label: 'χ', insert: 'χ' }, { label: 'ψ', insert: 'ψ' },
    { label: 'ω', insert: 'ω' }, { label: 'Γ', insert: 'Γ' },
    { label: 'Δ', insert: 'Δ' }, { label: 'Σ', insert: 'Σ' },
    { label: 'Π', insert: 'Π' }, { label: 'Φ', insert: 'Φ' },
    { label: 'Ψ', insert: 'Ψ' }, { label: 'Ω', insert: 'Ω' },
  ],
  Statistics: [
    { label: 'x̄', insert: 'x̄' }, { label: 'ȳ', insert: 'ȳ' },
    { label: 'ŷ', insert: 'ŷ' }, { label: 'σ²', insert: 'σ²' },
    { label: 's²', insert: 's²' }, { label: 'β₀', insert: 'β₀' },
    { label: 'β₁', insert: 'β₁' }, { label: 'H₀', insert: 'H₀' },
    { label: 'H₁', insert: 'H₁' }, { label: 'n!', insert: 'n!' },
    { label: 'P(A)', insert: 'P(A)' }, { label: 'P(A|B)', insert: 'P(A|B)' },
    { label: '∩', insert: '∩' }, { label: '∪', insert: '∪' },
    { label: '∅', insert: '∅' }, { label: 'ρ', insert: 'ρ' },
    { label: 'χ²', insert: 'χ²' }, { label: 'df', insert: 'df' },
    { label: 'CI', insert: 'CI' }, { label: 'SE', insert: 'SE' },
    { label: 'SD', insert: 'SD' }, { label: 'IQR', insert: 'IQR' },
    { label: 'r²', insert: 'r²' }, { label: 'R²', insert: 'R²' },
  ],
  Operators: [
    { label: '∑', insert: '∑' }, { label: '∏', insert: '∏' },
    { label: '∫', insert: '∫' }, { label: '∂', insert: '∂' },
    { label: '∇', insert: '∇' }, { label: '√', insert: '√' },
    { label: '∛', insert: '∛' }, { label: '∞', insert: '∞' },
    { label: '±', insert: '±' }, { label: '×', insert: '×' },
    { label: '÷', insert: '÷' }, { label: '·', insert: '·' },
    { label: '°', insert: '°' }, { label: '′', insert: '′' },
    { label: '″', insert: '″' }, { label: '|x|', insert: '|x|' },
    { label: 'log', insert: 'log' }, { label: 'ln', insert: 'ln' },
    { label: 'lim', insert: 'lim' }, { label: 'max', insert: 'max' },
    { label: 'min', insert: 'min' }, { label: 'avg', insert: 'avg' },
    { label: 'Σx²', insert: 'Σx²' }, { label: 'n²', insert: 'n²' },
  ],
  Relations: [
    { label: '≈', insert: '≈' }, { label: '≠', insert: '≠' },
    { label: '≤', insert: '≤' }, { label: '≥', insert: '≥' },
    { label: '≪', insert: '≪' }, { label: '≫', insert: '≫' },
    { label: '∈', insert: '∈' }, { label: '∉', insert: '∉' },
    { label: '⊂', insert: '⊂' }, { label: '⊃', insert: '⊃' },
    { label: '⊆', insert: '⊆' }, { label: '⊇', insert: '⊇' },
    { label: '∧', insert: '∧' }, { label: '∨', insert: '∨' },
    { label: '¬', insert: '¬' }, { label: '⟹', insert: '⟹' },
    { label: '⟺', insert: '⟺' }, { label: '∀', insert: '∀' },
    { label: '∃', insert: '∃' }, { label: '∝', insert: '∝' },
    { label: '∴', insert: '∴' }, { label: '∵', insert: '∵' },
    { label: '⊥', insert: '⊥' }, { label: '∥', insert: '∥' },
  ],
}

type MathCategory = keyof typeof MATH_SYMBOLS

// ─── Props ────────────────────────────────────────────────────────────────────
interface NoteEditorProps {
  note?: Note
  course?: Course | null
  courses: Course[]
  courseId: string
  onSave: (note: Partial<Note>) => Promise<Note | void>
  onBack: () => void
  defaultType?: Note['type']
}

// ─── Component ────────────────────────────────────────────────────────────────
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

  // READ mode for existing notes, EDIT mode for new ones
  const [mode, setMode] = useState<'read' | 'edit'>(note ? 'read' : 'edit')
  
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

  // Math panel state
  const [showMathPanel, setShowMathPanel] = useState(false)
  const [activeMathCategory, setActiveMathCategory] = useState<MathCategory>('Greek')
  const mathPanelRef = useRef<HTMLDivElement>(null)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<any>(null)
  const debounceTimeoutRef = useRef<any>(null)
  const lastSavedRef = useRef<string>(JSON.stringify(formData))

  // Close math panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mathPanelRef.current && !mathPanelRef.current.contains(e.target as Node)) {
        setShowMathPanel(false)
      }
    }
    if (showMathPanel) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMathPanel])

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
        if (viewMode !== 'split') setViewMode('split')
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const noteTypes = [
    { value: 'lecture', label: 'Lecture', icon: BookOpen },
    { value: 'assignment', label: 'Assignment', icon: FileText },
    { value: 'test', label: 'Exam Tip', icon: AlertCircle },
    { value: 'concept', label: 'Concept', icon: CheckCircle }
  ] as const

  // Draft backup
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
      const savedNote = await onSave({ ...formData, course_id: courseId, id: trackedNoteId })
      if (savedNote && savedNote.id) setTrackedNoteId(savedNote.id)
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
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
      autoSaveTimeoutRef.current = setTimeout(() => handleAutoSave(), 1500)
    }
    return () => clearTimeout(autoSaveTimeoutRef.current)
  }, [formData])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = '' }
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
      const savedNote = await onSave({ ...formData, course_id: courseId, id: trackedNoteId })
      if (savedNote && savedNote.id) setTrackedNoteId(savedNote.id)
      lastSavedRef.current = JSON.stringify(formData)
      setHasUnsavedChanges(false)
      localStorage.removeItem(`hydra_note_draft_${courseId}_${trackedNoteId || 'new'}`)
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

  const insertSymbol = (symbol: string) => {
    if (!textareaRef.current) {
      setFormData(prev => ({ ...prev, content: prev.content + symbol }))
      return
    }
    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const text = formData.content
    const newText = text.substring(0, start) + symbol + text.substring(end)
    setFormData(prev => ({ ...prev, content: newText }))
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(start + symbol.length, start + symbol.length)
      }
    }, 0)
  }

  const handleLookupText = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const selection = formData.content.substring(start, end).trim()
      if (selection) setResearchQuery(selection)
    }
    setRightPaneMode('research')
    setViewMode(window.innerWidth < 768 ? 'preview' : 'split')
  }

  const handleInsertFromResearch = (text: string) => insertMarkdown(text, '')

  const typeBadgeColor: Record<string, string> = {
    lecture: 'bg-blue-50 text-blue-700',
    assignment: 'bg-orange-50 text-orange-700',
    test: 'bg-red-50 text-red-700',
    concept: 'bg-emerald-50 text-emerald-700',
  }

  // ─── READ MODE ──────────────────────────────────────────────────────────────
  if (mode === 'read') {
    return (
      <div className="flex flex-col h-screen bg-white overflow-hidden w-full">
        {/* Read Header */}
        <div className="px-5 md:px-10 py-4 border-b border-slate-100 shrink-0 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="flex items-center justify-center w-9 h-9 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${typeBadgeColor[formData.type] || 'bg-slate-100 text-slate-600'}`}>
                  {formData.type}
                </span>
                {formData.is_shared && (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-50 text-green-600">Shared</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setMode('edit')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-blue-600/20"
          >
            <Edit3 className="w-4 h-4" />
            Edit Note
          </button>
        </div>

        {/* Read Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <article className="max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-16">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 leading-tight">
              {formData.title || 'Untitled Note'}
            </h1>
            {formData.content ? (
              <div className="prose prose-base md:prose-lg prose-slate max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {formData.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-slate-200">
                <FileText className="w-16 h-16 mb-4" />
                <p className="text-sm font-medium tracking-wide uppercase">No content yet</p>
                <button
                  onClick={() => setMode('edit')}
                  className="mt-4 text-blue-500 text-sm font-bold hover:text-blue-700 transition-colors"
                >
                  Start writing →
                </button>
              </div>
            )}
          </article>
        </div>
      </div>
    )
  }

  // ─── EDIT MODE ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-slate-900 w-full">

      {/* Edit Header */}
      <div className="px-5 md:px-8 py-4 border-b border-slate-200 shrink-0 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white w-full">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={note ? () => setMode('read') : handleBackClick}
            className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            title={note ? 'Back to Read View' : 'Go Back'}
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

      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between overflow-x-auto shrink-0 hide-scrollbar scrollbar-hide w-full">
        <div className="flex items-center space-x-1 min-w-max">
          <button onClick={() => insertMarkdown('**', '**')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
          <button onClick={() => insertMarkdown('*', '*')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-slate-300 mx-1" />
          <button onClick={() => insertMarkdown('### ')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="Heading"><Heading className="w-4 h-4" /></button>
          <button onClick={() => insertMarkdown('- ')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="List"><List className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-slate-300 mx-1" />
          <button onClick={() => insertMarkdown('`', '`')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="Code"><Code className="w-4 h-4" /></button>
          <button onClick={() => insertMarkdown('> ')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="Quote"><Quote className="w-4 h-4" /></button>
          <button onClick={() => insertMarkdown('$$\n', '\n$$')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" title="Block Equation">
            <span className="text-[13px] font-mono font-bold">f(x)</span>
          </button>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          {/* Math Symbol Panel trigger */}
          <div className="relative" ref={mathPanelRef}>
            <button
              onClick={() => setShowMathPanel(v => !v)}
              className={`flex items-center space-x-1 p-1.5 px-2.5 rounded-md text-xs font-bold transition-colors ${showMathPanel ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
              title="Math & Statistics Symbols"
            >
              <Sigma className="w-4 h-4" />
              <span>Symbols</span>
            </button>

            {/* Dropdown panel */}
            {showMathPanel && (
              <div className="absolute top-full mt-2 left-0 z-50 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/80 overflow-hidden">
                {/* Category tabs */}
                <div className="flex border-b border-slate-100 bg-slate-50">
                  {(Object.keys(MATH_SYMBOLS) as MathCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveMathCategory(cat)}
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                        activeMathCategory === cat
                          ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {/* Symbols grid */}
                <div className="p-3 grid grid-cols-8 gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {MATH_SYMBOLS[activeMathCategory].map((sym) => (
                    <button
                      key={sym.label}
                      onClick={() => insertSymbol(sym.insert)}
                      title={sym.insert}
                      className="flex items-center justify-center h-8 w-full rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-transparent hover:border-indigo-100"
                    >
                      {sym.label}
                    </button>
                  ))}
                </div>
                <div className="px-3 pb-3">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center">
                    Click any symbol to insert at cursor
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          <button
            onClick={handleLookupText}
            className="flex items-center space-x-1 p-1.5 px-3 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Lookup selected text with Mphathi AI"
          >
            <Search className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide">Research</span>
          </button>

          {/* Save status */}
          <div className="flex items-center ml-3 pl-3 border-l border-slate-200 space-x-2">
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

        {/* Mobile toggle */}
        <div className="flex md:hidden bg-slate-200 p-0.5 rounded-md min-w-max ml-2">
          <button onClick={() => setViewMode('write')} className={`px-3 py-1 text-[10px] font-bold rounded uppercase ${viewMode === 'write' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Write</button>
          <button onClick={() => setViewMode('preview')} className={`px-3 py-1 text-[10px] font-bold rounded uppercase ${viewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
            {rightPaneMode === 'research' ? 'Research' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Editor split pane */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Write pane */}
        {(viewMode === 'write' || viewMode === 'split') && (
          <div className={`flex-1 flex flex-col min-w-0 ${viewMode === 'split' ? 'border-r border-slate-200' : ''}`}>
            <textarea
              ref={textareaRef}
              className="flex-1 w-full p-6 md:p-10 bg-white border-none focus:outline-none focus:ring-0 resize-none text-slate-800 font-mono text-sm leading-loose custom-scrollbar"
              placeholder="What are we learning today?"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
        )}

        {/* Right pane (preview / research) */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white shrink-0">
              <button
                onClick={() => setRightPaneMode('preview')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${rightPaneMode === 'preview' ? 'text-blue-700 bg-white border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                Output
              </button>
              <button
                onClick={() => setRightPaneMode('research')}
                className={`flex-1 flex items-center justify-center py-3 text-xs font-bold uppercase tracking-widest transition-colors ${rightPaneMode === 'research' ? 'text-blue-700 bg-white border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <Search className="w-3.5 h-3.5 mr-1.5" /> Research
              </button>
            </div>

            {rightPaneMode === 'preview' ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {debouncedContent ? (
                  <div className="prose prose-sm md:prose-base prose-slate max-w-none p-6 md:p-10 w-full mx-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {debouncedContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center justify-center text-slate-200 text-center">
                      <FileText className="w-16 h-16 opacity-30 mb-4" />
                      <p className="text-sm font-medium tracking-wide opacity-50 uppercase">Preview Render</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 top-[40px] overflow-hidden">
                <ResearchPanel
                  initialQuery={researchQuery}
                  onInsert={handleInsertFromResearch}
                  onClose={() => { setRightPaneMode('preview'); setViewMode(window.innerWidth < 768 ? 'write' : 'split') }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NoteEditorComponent
