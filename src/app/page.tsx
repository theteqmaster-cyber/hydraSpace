'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Footer } from '@/components/layout/Footer'
import { CourseCard } from '@/components/courses/CourseCard'
import { CreateCourseModal } from '@/components/courses/CreateCourseModal'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { AuthModal } from '@/components/auth/AuthModal'
import { Layout, LucideIcon, BookOpen, Clock, Users, Zap, ArrowRight, Share2, Sparkles, GraduationCap } from 'lucide-react'
import { useSpring, useMotionValue } from 'framer-motion'

// --- PREMIUM BACKGROUND AURA COMPONENT ---
const BackgroundAura = ({ mouseX, mouseY }: { mouseX: any, mouseY: any }) => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 bg-white">
      {/* Interactive Spotlight Aura */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
        }}
        className="absolute top-0 left-0 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-blue-400/10 rounded-full blur-[160px] pointer-events-none opacity-0 md:opacity-100"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 60, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px]"
      />
      
      {/* Architectural Grid Overlay */}
      <div className="absolute inset-0 w-full h-full opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  )
}

// --- SERENE SNOWFALL COMPONENT ---
const STATIC_FLAKES = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  initialX: `${Math.random() * 100}%`,
  sway: [0, Math.random() * 40 - 20],
  duration: 10 + Math.random() * 20,
  delay: Math.random() * 20
}))

const Snowfall = () => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-20">
      {STATIC_FLAKES.map((flake) => (
        <motion.div
          key={flake.id}
          initial={{ 
            y: -20, 
            opacity: 0 
          }}
          animate={{ 
            y: "110vh",
            x: flake.sway,
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{ 
            duration: flake.duration, 
            repeat: Infinity, 
            ease: "linear",
            delay: flake.delay 
          }}
          style={{
            left: flake.initialX,
          }}
          className="absolute w-[5px] h-[5px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] rounded-full blur-[0.5px]"
        />
      ))}
    </div>
  )
}

interface Course {
  id: string
  name: string
  code: string
  description?: string
  color?: string
  user_id: string
  created_at: string
  updated_at: string
}

interface Note {
  id: string
  title: string
  content: string
  type: 'lecture' | 'assignment' | 'test' | 'concept'
  lecture_number?: number
  is_shared: boolean
  user_id: string
  course_id: string
  created_at: string
  updated_at: string
}

function HomeContent() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { courses, notes, timetableEntries, isLoading, refreshData, isOffline, lastSyncTime } = useData()
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // -- INTERACTIVE MOUSE TRACKING --
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 })
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    mouseX.set(clientX)
    mouseY.set(clientY)
  }

  // --- REST OF LOGIC ---
  const handleCreateCourse = () => {
    setIsCreateCourseModalOpen(true)
  }

  const handleCourseClick = (course: any) => {
    // Navigate to course detail page instead of opening note editor
    router.push(`/courses/detail?id=${course.id}`)
  }

  const activeCourses = courses.filter(course => !course.is_archived)
  
  const getNotesCount = (courseId: string) => {
    return notes.filter(note => note.course_id === courseId).length
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const coursesThisWeek = courses.filter(c => new Date(c.created_at) > oneWeekAgo).length
  const notesThisWeek = notes.filter(n => new Date(n.created_at) > oneWeekAgo).length

  const getSharedCount = (courseId: string) => {
    return notes.filter(note => note.course_id === courseId && note.is_shared).length
  }

  const today = new Date().getDay()
  const todaysClasses = (timetableEntries || [])
    .filter((entry: any) => entry.day_of_week === today)
    .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time))


  if (!user) {
    return (
      <div 
        className="min-h-screen flex flex-col relative selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden"
        onMouseMove={handleMouseMove}
      >
        <BackgroundAura mouseX={smoothX} mouseY={smoothY} />
        <Snowfall />
        <Header onCreateCourse={() => {}} />
        
        {/* Elite Hero Section */}
        <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-32 overflow-visible">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-[0.2em] uppercase mb-10 shadow-lg"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>The Academic Operating System</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-6xl lg:text-8xl font-black text-slate-900 leading-[1] tracking-tighter mb-10"
              >
                Master Your Degree.<br />
                <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Zero Stress.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed md:font-medium"
              >
                Fragmented notes and lost lecture slides are a thing of the past. 
                HydraSpace is the all-in-one ecosystem where students win, build, and share.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <Button 
                  size="lg" 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="h-16 px-10 rounded-2xl text-lg font-black shadow-2xl shadow-blue-600/30 group bg-slate-900 hover:bg-black transition-all"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('features');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-16 px-10 rounded-2xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  How it Works
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Connected Architecture Visual */}
          <div className="mt-20 max-w-5xl mx-auto px-4 opacity-50">
             <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent w-full relative">
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-4 h-4 bg-white border border-slate-200 rounded-full shadow-sm"></div>
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center text-xs font-bold">H</div>
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-4 h-4 bg-white border border-slate-200 rounded-full shadow-sm"></div>
             </div>
          </div>
        </section>

        {/* Feature OS Section */}
        <section id="features" className="py-32 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  icon: <BookOpen className="w-6 h-6" />,
                  title: "Structured Notes",
                  desc: "Linked directly to your courses. Organize by lecture, assignment, or concept.",
                  color: "bg-blue-600"
                },
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "Study Assistance",
                  desc: "Integrated AI Research and Audio Study. Master complex materials at 2x speed.",
                  color: "bg-orange-600"
                },
                {
                  icon: <Users className="w-6 h-6" />,
                  title: "Academic Network",
                  desc: "Share notes with your peers and build a collective knowledge base for your university.",
                  color: "bg-emerald-600"
                }
              ].map((feat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -8 }}
                  className="bg-white/80 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-xl shadow-slate-200/50 group"
                >
                  <div className={`w-14 h-14 ${feat.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-500/20`}>
                    {feat.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{feat.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing Pitch */}
        <section className="py-40 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter">Your academic journey, optimized.</h2>
            <Button 
              size="lg" 
              onClick={() => setIsAuthModalOpen(true)}
              className="h-16 px-12 rounded-2xl bg-white text-slate-900 hover:bg-blue-50 text-xl font-black"
            >
              Start Building Now
            </Button>
            <p className="mt-8 text-slate-400 font-bold uppercase tracking-widest text-xs">Used by students from NUST & beyond</p>
          </div>
        </section>
        
        <Footer />
        
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            onAuthSuccess={() => router.push('/courses')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden" onMouseMove={handleMouseMove}>
      <Header onCreateCourse={handleCreateCourse} />
      
      <main className="flex-1 flex relative">
        <BackgroundAura mouseX={smoothX} mouseY={smoothY} />
        <Snowfall />
        <Sidebar aria-label="Main Navigation" />
        
        <main className="flex-1 p-4 md:p-8 mobile-safe-padding relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Elite Dashboard Header */}
            <div className="mb-12">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-2 text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4"
                  >
                    <div className="w-8 h-[2px] bg-blue-600"></div>
                     <span>Unified Command Center</span>
                  </motion.div>
                  <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                    Welcome back,<br />
                    <span className="text-blue-600">{user.name?.split(' ')[0] || 'Student'}</span>.
                  </h1>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={refreshData}
                    disabled={isLoading}
                    className="h-14 px-6 rounded-2xl bg-white/50 backdrop-blur-md border border-slate-200 hover:bg-white"
                  >
                    <Clock className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Syncing...' : 'Sync Data'}
                  </Button>
                  <Button 
                    size="lg" 
                    onClick={handleCreateCourse}
                    className="h-14 px-8 rounded-2xl font-black shadow-xl shadow-blue-500/20 bg-slate-900 group"
                  >
                    New Course
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-200 transition-colors p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xl">
                      📚
                    </div>
                    <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Active Courses</h3>
                  </div>
                </div>
                <div className="flex items-baseline space-x-3">
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">{courses.length}</p>
                  {coursesThisWeek > 0 && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md flex items-center border border-green-100">
                      <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {coursesThisWeek} new this week
                    </span>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-emerald-200 transition-colors p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-black text-xl">
                      📝
                    </div>
                    <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Total Notes</h3>
                  </div>
                </div>
                <div className="flex items-baseline space-x-3">
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">{notes.length}</p>
                  {notesThisWeek > 0 && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center border border-emerald-100">
                      <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {notesThisWeek} new this week
                    </span>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => router.push('/calendar')}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-orange-200 transition-all group relative"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100/50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                    <span className="text-lg">📅</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Classes Today</h3>
                </div>
                
                {todaysClasses.length > 0 ? (
                  <div className="space-y-2.5">
                    {todaysClasses.slice(0, 2).map((cls: any, i: number) => {
                       const course = courses.find(c => c.id === cls.course_id)
                       return (
                         <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                           <span className="font-semibold text-gray-700 truncate pr-2">{course?.code || cls.title}</span>
                           <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded text-xs shrink-0">{cls.start_time.slice(0, 5)}</span>
                         </div>
                       )
                    })}
                    {todaysClasses.length > 2 ? (
                      <div className="text-xs text-gray-400 font-medium pt-1">
                        +{todaysClasses.length - 2} more today
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 font-medium pt-1">
                        No more classes today
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 text-left">
                    <p className="text-2xl font-black text-gray-300">Free Day</p>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Ready to hit the network?</p>
                  </div>
                )}
                
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard
                    course={course}
                    notesCount={getNotesCount(course.id)}
                    sharedCount={getSharedCount(course.id)}
                    onClick={() => handleCourseClick(course)}
                  />
                </motion.div>
              ))}
            </div>

            {activeCourses.length === 0 && !isLoading && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl text-gray-400">📚</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No courses yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first course to start organizing your academic journey.
                </p>
                <Button onClick={handleCreateCourse}>
                  Create Your First Course
                </Button>
              </motion.div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading courses...</p>
              </div>
            )}
          </motion.div>
        </main>
      </main>

      <Footer />

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={isCreateCourseModalOpen}
        onClose={() => setIsCreateCourseModalOpen(false)}
        onCreateCourse={async (courseData) => {
          try {
            const { createCourse } = await import('@/lib/courses')
            await createCourse(courseData, user!.id)
            setIsCreateCourseModalOpen(false)
            refreshData()
          } catch (error) {
            console.error('Error creating course:', error)
          }
        }}
      />
      <BottomNav />
    </div>
  )
}

export default function HomePage() {
  return <HomeContent />
}
