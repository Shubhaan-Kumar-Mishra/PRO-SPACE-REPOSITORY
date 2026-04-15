import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Projects from './components/Projects'
import Teams from './components/Teams'
import Settings from './components/Settings'
import Board from './components/Board'
import Login from './components/Login'
import Landing from './components/Landing'
import { Command, Search, Star, Zap, Settings as SettingsIcon, LayoutDashboard, Kanban, Users, ListFilter } from 'lucide-react'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [showLanding, setShowLanding] = useState(true)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) setShowLanding(false)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) setShowLanding(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Command Palette Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(prev => !prev)
      }
      if (e.key === 'Escape') setIsCommandPaletteOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navigateTo = (view, projectId = null) => {
    setCurrentView(view)
    if (projectId) setSelectedProjectId(projectId)
    setIsCommandPaletteOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-10 h-10 border-t-2 border-accent-blue rounded-full animate-spin"></div>
      </div>
    )
  }

  if (showLanding && !session) {
    return <Landing onGetStarted={() => setShowLanding(false)} />
  }

  if (!session) {
    return <Login />
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard setCurrentView={setCurrentView} />
      case 'projects': return <Projects onProjectSelect={(id) => navigateTo('board', id)} />
      case 'board': return <Board projectId={selectedProjectId} onBack={() => navigateTo('projects')} />
      case 'teams': return <Teams />
      case 'settings': return <Settings session={session} />
      default: return <Dashboard setCurrentView={setCurrentView} />
    }
  }

  return (
    <div className="relative">
      <Layout currentView={currentView} setCurrentView={setCurrentView} session={session}>
        {renderView()}
      </Layout>

      {/* ─── COMMAND PALETTE ─── */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCommandPaletteOpen(false)}></div>
          <div className="w-full max-w-2xl bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up">
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <Search className="w-5 h-5 text-white/30" />
              <input
                autoFocus
                type="text"
                placeholder="Search commands, views, or projects..."
                className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder:text-white/20"
              />
              <kbd className="bg-white/5 text-white/20 px-2 py-0.5 rounded text-[10px] font-mono border border-white/5">ESC</kbd>
            </div>

            <div className="p-2 max-h-[400px] overflow-y-auto font-sans">
              <p className="px-4 py-2 text-[10px] uppercase font-bold text-white/20 tracking-widest">Navigation</p>
              {[
                { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard },
                { id: 'projects', label: 'Go to Projects', icon: Kanban },
                { id: 'board', label: 'Go to Task Board', icon: ListFilter },
                { id: 'teams', label: 'Go to Teams', icon: Users },
                { id: 'settings', label: 'Open Settings', icon: SettingsIcon },
              ].map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => navigateTo(cmd.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-[14px] font-medium text-white/60 hover:text-white transition-all group"
                >
                  <cmd.icon className="w-4 h-4 text-white/20 group-hover:text-amber-400" />
                  {cmd.label}
                  <span className="ml-auto text-[10px] font-mono text-white/10 opacity-0 group-hover:opacity-100 italic">Enter</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
