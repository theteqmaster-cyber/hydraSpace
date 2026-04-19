'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Eye, EyeOff, FileText, BookOpen, AlertCircle, 
  CheckCircle, Bold, Italic, Heading, List, ListOrdered, Code, Quote, 
  RefreshCw, ArrowLeft, Cloud, CloudOff, CloudLightning, 
  Search, Sigma, Edit3, X, Plus, Calendar, Sparkles,
  Headphones, FileDown, Paperclip, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Note, Course } from '@/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { ResearchPanel } from './ResearchPanel'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Link from '@tiptap/extension-link'

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
  const [rightPaneMode, setRightPaneMode] = useState<'preview' | 'research' | 'pdf'>('preview')
  const [researchQuery, setResearchQuery] = useState('')
  const [debouncedContent, setDebouncedContent] = useState(formData.content)

  // Math panel state
  const [showMathPanel, setShowMathPanel] = useState(false)
  const [activeMathCategory, setActiveMathCategory] = useState<MathCategory>('Greek')
  const mathPanelRef = useRef<HTMLDivElement>(null)
  
  const autoSaveTimeoutRef = useRef<any>(null)
  const debounceTimeoutRef = useRef<any>(null)
  const lastSavedRef = useRef<string>(JSON.stringify(formData))
  const noteRef = useRef<HTMLDivElement>(null)
  
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isMphathiVisibleOnMobile, setIsMphathiVisibleOnMobile] = useState(false)

  // ─── TipTap Editor Setup ──────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepAttributes: true, keepMarks: true },
        orderedList: { keepAttributes: true, keepMarks: true },
      }),
      Markdown.configure({
        html: false,
      }),
      Placeholder.configure({
        placeholder: 'What are we learning today?',
      }),
      Typography,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: formData.content,
    editorProps: {
      attributes: {
        class: 'prose prose-base md:prose-lg prose-slate max-w-none focus:outline-none min-h-[500px] p-6 md:p-10 font-outfit [&>p]:mt-0 [&>p]:mb-4',
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = (editor as any).storage.markdown.getMarkdown()
      setFormData(prev => ({ ...prev, content: markdown }))
    },
  })

  // Sync external changes to editor (e.g. from ResearchPanel or initial load)
  useEffect(() => {
    if (editor && formData.content !== (editor as any).storage.markdown.getMarkdown()) {
      editor.commands.setContent(formData.content, false)
    }
  }, [formData.content, editor])

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
    const draftKey = `hydra_note_draft_${courseId}_${trackedNoteId || 'new'}`
    if (hasUnsavedChanges) {
      localStorage.setItem(draftKey, JSON.stringify(formData))
    }
  }, [formData, hasUnsavedChanges, courseId, trackedNoteId])

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
      console.error('AutoSave Failure:', error)
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
      console.error('Manual Save Failure:', error)
      setSaveStatus('error')
      alert('Save failed! Please check your connection or contact support. To prevent data loss, please copy your content manually.')
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

  const insertMarkdown = (text: string) => {
    if (editor) {
      editor.chain().focus().insertContent(text).run()
    }
  }
  
  const insertSymbol = (symbol: string) => {
    if (editor) {
      editor.chain().focus().insertContent(symbol).run()
    }
  }

  const handleLookupText = () => {
    if (editor) {
      const { from, to } = editor.state.selection
      const selection = editor.state.doc.textBetween(from, to, ' ').trim()
      if (selection) setResearchQuery(selection)
    }
    setRightPaneMode('research')
    setViewMode(window.innerWidth < 768 ? 'preview' : 'split')
  }

  const handleInsertFromResearch = (text: string) => {
    if (editor) {
      editor.chain().focus().insertContent(text).run()
    }
  }

  const handleDownloadPDF = async () => {
    if (!noteRef.current) return
    setIsExportingPDF(true)
    
    try {
      const element = noteRef.current
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        ignoreElements: (el) => {
          return el.tagName === 'SVG' || el.tagName === 'svg';
        },
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style');
          style.id = 'academic-pdf-style';
          style.innerHTML = `
            * { box-sizing: border-box; font-family: 'Outfit', sans-serif !important; -webkit-print-color-adjust: exact; }
            body { background-color: #ffffff !important; margin: 0; padding: 0; }
            #pdf-container { padding: 60px 80px; min-height: 100%; width: 100%; background-color: #ffffff !important; }
            h1 { font-size: 32pt; font-weight: 800; margin-bottom: 24pt; color: #000000 !important; letter-spacing: -0.02em; line-height: 1.1; }
            h2 { font-size: 18pt; font-weight: 700; margin-top: 32pt; margin-bottom: 12pt; border-bottom: 2pt solid #e2e8f0; padding-bottom: 4pt; color: #1a202c !important; }
            h3 { font-size: 14pt; font-weight: 600; margin-top: 20pt; margin-bottom: 8pt; color: #1a202c !important; }
            p { font-size: 12pt; line-height: 1.75; margin-bottom: 14pt; color: #2d3748 !important; }
            strong, b { font-weight: 700; color: #000000 !important; }
            ul, ol { margin-bottom: 18pt; padding-left: 22pt; }
            li { font-size: 12pt; line-height: 1.7; margin-bottom: 10pt; color: #2d3748 !important; }
            .pdf-header { margin-bottom: 40pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 24pt; }
            .pdf-branding-title { font-size: 16pt; font-weight: 900; color: #2563eb !important; margin-bottom: 4pt; }
            .pdf-branding-tagline { font-size: 9pt; color: #718096 !important; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; }
            .pdf-meta-grid { margin-top: 20pt; display: flex; gap: 40pt; }
            .pdf-meta-item { border-left: 3px solid #e2e8f0; padding-left: 12pt; }
            .pdf-meta-label { font-size: 8pt; color: #718096 !important; text-transform: uppercase; font-weight: 800; margin-bottom: 2pt; }
            .pdf-meta-value { font-size: 10pt; font-weight: 700; color: #1a202c !important; }
            .pdf-footer { margin-top: 60pt; pt-8; border-top: 1px solid #e2e8f0; color: #718096 !important; font-size: 9pt; text-align: center; font-style: italic; padding-top: 20pt; }
            .pdf-accent-line { background: #2563eb !important; height: 3pt; width: 40pt; margin-bottom: 12pt; }
          `;
          clonedDoc.head.appendChild(style);

          const elementsToKill = clonedDoc.querySelectorAll('link[rel="stylesheet"], style:not(#academic-pdf-style)');
          elementsToKill.forEach(el => el.remove());

          const content = clonedDoc.querySelector('article') || clonedDoc.body;
          const pdfWrapper = clonedDoc.createElement('div');
          pdfWrapper.id = 'pdf-container';
          
          while (content.firstChild) {
            pdfWrapper.appendChild(content.firstChild);
          }
          content.appendChild(pdfWrapper);

          const header = clonedDoc.createElement('div');
          header.className = 'pdf-header';
          header.innerHTML = `
            <div class="pdf-accent-line"></div>
            <div class="pdf-branding-title">HYDRASPACE SUITE</div>
            <div class="pdf-branding-tagline">Academic Productivity Interface</div>
            
            <div class="pdf-meta-grid">
              <div class="pdf-meta-item">
                <div class="pdf-meta-label">Course</div>
                <div class="pdf-meta-value">${course?.name || 'General Studies'}</div>
              </div>
              <div class="pdf-meta-item">
                <div class="pdf-meta-label">Category</div>
                <div class="pdf-meta-value">${formData.type.toUpperCase()}</div>
              </div>
              <div class="pdf-meta-item">
                <div class="pdf-meta-label">Date</div>
                <div class="pdf-meta-value">${new Date().toLocaleDateString()}</div>
              </div>
            </div>
          `;
          pdfWrapper.insertBefore(header, pdfWrapper.firstChild);

          const footer = clonedDoc.createElement('div');
          footer.className = 'pdf-footer';
          footer.innerHTML = `
            This document was generated using HydraSpace - The Ultimate Digital Academic Hub.<br/>
            &copy; ${new Date().getFullYear()} HydraSpace Academic Suite.
          `;
          pdfWrapper.appendChild(footer);

          const all = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < all.length; i++) {
            const el = all[i] as HTMLElement;
            if (el.getAttribute('style')) {
              let s = el.getAttribute('style') || '';
              s = s.replace(/lab\([^)]+\)/g, '#000000');
              s = s.replace(/oklch\([^)]+\)/g, '#000000');
              el.setAttribute('style', s);
            }
          }
        }
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      let heightLeft = pdfHeight
      let position = 0

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`HydraSpace_${formData.title || 'Note'}.pdf`)
    } catch (err) {
      console.error('PDF Export Error:', err)
      alert("PDF Export failed. Please try a different browser or check console.")
    } finally {
      setIsExportingPDF(false)
    }
  }

  const handleAudioStudy = () => {
    if (isAudioPlaying) {
      window.speechSynthesis.cancel()
      setIsAudioPlaying(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(formData.content)
    utterance.onend = () => setIsAudioPlaying(false)
    window.speechSynthesis.speak(utterance)
    setIsAudioPlaying(true)
  }

  const typeBadgeColor: Record<string, string> = {
    lecture: 'bg-blue-50 text-blue-700',
    assignment: 'bg-orange-50 text-orange-700',
    test: 'bg-red-50 text-red-700',
    concept: 'bg-emerald-50 text-emerald-700',
  }

  // ─── READ MODE ──────────────────────────────────────────────────────────────
  if (mode === 'read') {
    return (
      <div 
        className="flex flex-col h-screen overflow-hidden w-full"
        style={{ backgroundColor: '#f9f6e5', color: '#2d3748' }}
      >
        <div 
          className="px-5 md:px-10 py-4 border-b border-slate-100 shrink-0 flex items-center justify-between z-20 sticky top-0 overflow-x-auto hide-scrollbar scrollbar-hide"
          style={{ backgroundColor: '#f9f6e5' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="flex items-center justify-center w-9 h-9 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${typeBadgeColor[formData.type] || 'bg-slate-100 text-slate-600'}`}>
                {formData.type}
              </span>
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <p className="text-xs font-bold text-slate-400 truncate max-w-[100px] md:max-w-[150px]">{course?.name || 'General'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 min-w-max">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMphathiVisibleOnMobile(true)}
              className="xl:hidden flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold">Mphathi AI</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAudioStudy}
              className={`rounded-xl px-3 transition-all ${isAudioPlaying ? 'bg-orange-50 text-orange-600 border-orange-100' : 'text-slate-500 hover:bg-slate-50'}`}
              title="Listen to Note"
            >
              <Headphones className={`w-4 h-4 sm:mr-2 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{isAudioPlaying ? 'Stop Audio' : 'Study Audio'}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="text-slate-500 hover:bg-slate-50 rounded-xl px-3"
              title="Download PDF"
            >
              {isExportingPDF ? (
                <RefreshCw className="w-4 h-4 animate-spin sm:mr-2" />
              ) : (
                <FileDown className="w-4 h-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">{isExportingPDF ? 'Generating...' : 'Export PDF'}</span>
            </Button>

            <div className="h-6 w-px bg-slate-100 mx-2" />

            <button
              onClick={() => setMode('edit')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Read Content Area with Split Pane */}
        <div className="flex-1 flex overflow-hidden">
          <div 
            className="flex-1 overflow-y-auto custom-scrollbar"
            style={{ backgroundColor: '#f9f6e5' }}
          >
            {/* PDF Export Container */}
            <div 
              ref={noteRef} 
              className="min-h-full"
              style={{ backgroundColor: '#f9f6e5' }}
            >
              <article className="max-w-3xl mx-auto px-8 md:px-12 py-12 md:py-20 relative">
                {/* Academic Header Branding (PDF visible) */}
                <div className="mb-12 flex justify-between items-start border-b border-slate-100 pb-8">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 leading-tight">
                      {formData.title || 'Untitled Note'}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1" /> {course?.name || 'General Academic'}</span>
                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="premium-gradient w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl mb-1 ml-auto">H</div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">HydraSpace Suite</p>
                  </div>
                </div>

                {formData.content ? (
                  <div className="prose prose-base md:prose-lg prose-slate max-w-none [&>p]:mt-0 [&>p]:mb-4">
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
                    <p className="text-sm font-medium tracking-wide uppercase">Empty Learning Space</p>
                  </div>
                )}

                {/* Academic Footer Branding */}
                <div className="mt-20 pt-8 border-t border-slate-100 text-center">
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                     This document was generated using HydraSpace - The Ultimate Digital Academic Hub
                   </p>
                </div>
              </article>
            </div>
          </div>

          {/* Mphathi AI Workspace Panel (visible on large screens) */}
          <div className="hidden xl:block w-96 border-l border-slate-100 bg-paper">
            <ResearchPanel
              initialQuery={formData.title}
              context={formData.content}
              onInsert={() => {}} // No insert needed in Read Mode
              onClose={() => {}} // Permanent on large screens
            />
          </div>
        </div>

        {/* Mobile Mphathi Overlay */}
        <AnimatePresence>
          {isMphathiVisibleOnMobile && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[100] bg-white xl:hidden"
            >
              <ResearchPanel
                initialQuery={formData.title}
                context={formData.content}
                onInsert={handleInsertFromResearch}
                onClose={() => setIsMphathiVisibleOnMobile(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ─── EDIT MODE ──────────────────────────────────────────────────────────────
  return (
    <div 
      className="flex flex-col h-screen overflow-hidden w-full font-outfit"
      style={{ backgroundColor: '#f9f6e5', color: '#2d3748' }}
    >
      {/* Edit Header */}
      <div 
        className="px-5 md:px-8 py-4 border-b border-slate-200 shrink-0 flex flex-nowrap items-center justify-between w-full overflow-x-auto hide-scrollbar scrollbar-hide"
        style={{ backgroundColor: '#f9f6e5' }}
      >
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={note ? () => setMode('read') : handleBackClick}
            className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            title={note ? 'Back to Read View' : 'Go Back'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0 pr-2">
            <input
              type="text"
              placeholder="Untitled Note"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xl md:text-3xl font-black bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-slate-300 truncate"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 min-w-max">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMphathiVisibleOnMobile(true)}
            className="xl:hidden flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold">Mphathi</span>
          </Button>

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
      <div className="bg-paper/50 backdrop-blur-sm border-b border-slate-200 px-4 py-2 flex items-center justify-between overflow-x-auto shrink-0 hide-scrollbar scrollbar-hide w-full">
        <div className="flex items-center space-x-1 min-w-max">
          <button 
            onClick={() => editor?.chain().focus().toggleBold().run()} 
            className={`p-1.5 rounded transition-colors ${editor?.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleItalic().run()} 
            className={`p-1.5 rounded transition-colors ${editor?.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-300 mx-1" />
          <button 
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} 
            className={`p-1.5 rounded transition-colors ${editor?.isActive('heading', { level: 3 }) ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
            title="Heading"
          >
            <Heading className="w-4 h-4" />
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleBulletList().run()} 
            className={`p-1.5 rounded transition-colors ${editor?.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
            title="Bullet List (Type '- ' or '* ' to start)"
          >
            <List className="w-4 h-4" />
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleOrderedList().run()} 
            className={`p-1.5 rounded transition-colors ${editor?.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
            title="Numbered List (Type '1. ' to start)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-300 mx-1" />
          <button 
            onClick={() => editor?.chain().focus().toggleCode().run()} 
            className={`p-1.5 rounded transition-colors ${editor?.isActive('code') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleBlockquote().run()} 
            className={`p-1.5 rounded transition-colors ${editor?.isActive('blockquote') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button 
            onClick={() => editor?.chain().focus().insertContent('$$\n\nf(x) = \n\n$$').run()} 
            className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors" 
            title="Block Equation"
          >
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
          <div 
            className={`flex-1 flex flex-col min-w-0 ${viewMode === 'split' ? 'border-r border-slate-200' : ''}`}
            style={{ backgroundColor: '#f9f6e5' }}
          >
            <div 
              className="flex-1 w-full bg-paper overflow-y-auto custom-scrollbar"
              onClick={() => editor?.chain().focus().run()}
            >
              <EditorContent editor={editor} />
              
              {/* Bubble Menu for context-sensitive formatting */}
              {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                  <div className="flex bg-white rounded-lg shadow-xl border border-slate-200 p-1 gap-1">
                    <button
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('bold') ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('italic') ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('heading', { level: 3 }) ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                    >
                      <Heading className="w-4 h-4" />
                    </button>
                  </div>
                </BubbleMenu>
              )}
            </div>
          </div>
        )}

        {/* Right pane (preview / research) */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`flex-1 flex flex-col min-w-0 ${viewMode === 'split' ? '' : 'w-full'}`}>
            {rightPaneMode === 'research' ? (
              <ResearchPanel
                initialQuery={formData.title}
                context={formData.content}
                onInsert={handleInsertFromResearch}
                onClose={() => setViewMode('write')}
              />
            ) : (
              <div 
                className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar"
                style={{ backgroundColor: '#f9f6e5' }}
              >
                <article className="prose prose-base md:prose-lg prose-slate max-w-none [&>p]:mt-0 [&>p]:mb-4">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {debouncedContent || '*Preview content will appear here...*'}
                  </ReactMarkdown>
                </article>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Mphathi Overlay */}
      <AnimatePresence>
        {isMphathiVisibleOnMobile && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white xl:hidden"
          >
            <ResearchPanel
              initialQuery={formData.title}
              onInsert={handleInsertFromResearch}
              onClose={() => setIsMphathiVisibleOnMobile(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NoteEditorComponent
