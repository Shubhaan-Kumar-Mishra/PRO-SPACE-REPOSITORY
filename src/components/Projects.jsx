import React, { useEffect, useState } from 'react'
import { Kanban, Search, Filter, MoreVertical, Plus, X, ArrowUpRight } from 'lucide-react'
import anime from 'animejs'
import { useSupabaseTable, supabaseInsert } from '../lib/hooks'
import { supabase } from '../lib/supabase'

export default function Projects({ onProjectSelect }) {
  const { data: projects, loading, refresh } = useSupabaseTable('projects', '*, teams(name)')
  const { data: teams } = useSupabaseTable('teams')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newProject, setNewProject] = useState({ name: '', team_id: '', status: 'In Progress' })

  useEffect(() => {
    if (!loading && projects.length > 0) {
      anime({
        targets: '.project-card',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(80),
        duration: 700,
        easing: 'easeOutExpo'
      })
    }
  }, [loading, projects])

  const handleAddProject = async (e) => {
    e.preventDefault()
    const { error } = await supabaseInsert('projects', {
      id: 'p' + Math.random().toString(36).substr(2, 8),
      ...newProject,
      progress: 0,
      color_class: 'bg-blue-500',
    })

    if (!error) {
      setIsModalOpen(false)
      setNewProject({ name: '', team_id: '', status: 'In Progress' })
      refresh()
    } else {
      alert('Failed to create project: ' + error.message)
    }
  }

  const handleDeleteProject = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this project?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) refresh()
  }

  const filtered = projects.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-t-2 border-accent-blue rounded-full animate-spin"></div>
      </div>
    )
  }

  const statusColor = (s) => {
    if (s === 'Completed') return 'text-emerald-400 bg-emerald-500/10'
    if (s === 'Delayed') return 'text-amber-400 bg-amber-500/10'
    return 'text-blue-400 bg-blue-500/10'
  }

  return (
    <div className="space-y-8 animate-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Portfolio</p>
          <h1 className="text-3xl font-bold tracking-tight">Active Projects</h1>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="Filter workspace..."
              className="bg-white/[0.04] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-[13px] focus:outline-none focus:border-white/15 w-56 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Launch Project
          </button>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="glass-card p-16 text-center border-dashed">
          <Kanban className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-[15px] font-bold mb-2">
            {searchQuery ? 'Search yield 0 RESULTS' : 'INITIATE FIRST STAGE'}
          </p>
          <p className="text-white/10 text-[12px] mb-6 font-medium uppercase tracking-[0.1em]">No project data found in current cluster</p>
          <button className="btn-primary mx-auto" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" /> Start Build
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => onProjectSelect(p.id)}
              className="project-card glass-card p-6 group cursor-pointer hover:border-white/10 transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Kanban className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDeleteProject(e, p.id)}
                    className="text-white/10 hover:text-rose-400 p-1 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <ArrowUpRight className="w-4 h-4 text-white/5 group-hover:text-white/40 transition-colors" />
                </div>
              </div>

              <h3 className="text-[16px] font-bold mb-1">{p.name}</h3>
              <p className="text-[11px] text-white/20 font-bold uppercase tracking-[0.15em] mb-5">{p.teams?.name || 'Vanguard'} Command</p>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[13px] font-bold tabular-nums">
                  <span className="text-white/60">{p.progress || 0}% Complete</span>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm ${statusColor(p.status)}`}>
                    {p.status || 'Active'}
                  </span>
                </div>
                <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${p.color_class || 'bg-blue-500'}`} style={{ width: `${p.progress || 0}%` }}></div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-white/[0.04] pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/150?u=${p.id}${i}`} className="w-7 h-7 rounded-full border-2 border-[#141414] grayscale group-hover:grayscale-0 transition-all" alt="" />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-white/20 group-hover:text-blue-400 transition-colors uppercase tracking-widest">Enter Board →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass-card w-full max-w-md p-8 relative z-10 border-white/[0.08] shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Launch Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-white/25 uppercase tracking-[0.15em] mb-2 block">Identity</label>
                <input
                  type="text"
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 px-4 text-[14px] focus:outline-none focus:border-white/20 transition-all"
                  placeholder="e.g. Project Odyssey"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-white/25 uppercase tracking-[0.15em] mb-2 block">Allocated Command</label>
                <select
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 px-4 text-[14px] focus:outline-none focus:border-white/20 appearance-none transition-all"
                  value={newProject.team_id}
                  onChange={(e) => setNewProject({ ...newProject, team_id: e.target.value })}
                  required
                >
                  <option value="" disabled className="bg-[#141414]">Assign to...</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#141414]">{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" className="btn-secondary w-full justify-center" onClick={() => setIsModalOpen(false)}>Abort</button>
                <button type="submit" className="btn-primary w-full justify-center">Initiate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
