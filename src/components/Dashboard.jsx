import React, { useEffect, useState, useCallback } from 'react'
import { 
  TrendingUp, CheckCircle, Heart, Bell, Plus, ArrowUpRight, 
  Clock, Activity, Sparkles, Search, Zap, Calendar, 
  ChevronRight, MoreHorizontal, MousePointer2, Loader2, Target, X, Trash2, Kanban
} from 'lucide-react'
import anime from 'animejs'
import { supabase } from '../lib/supabase'

export default function Dashboard({ setCurrentView }) {
  const [data, setData] = useState({
    metrics: [],
    activities: [],
    projects: [],
    agenda: [],
    workload: [],
    throughput: []
  })
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [
        { data: tasks },
        { data: projects },
        { data: activities },
        { data: teams }
      ] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('teams').select('*, tasks(id)')
      ])

      const completedTasks = tasks?.filter(t => t.status === 'done').length || 0
      const activeTasks = tasks?.filter(t => t.status !== 'done').length || 0
      const velocity = Math.round((completedTasks / (tasks?.length || 1)) * 100) || 0
      const health = Math.round((projects?.filter(p => p.status !== 'Delayed').length / (projects?.length || 1)) * 100) || 0

      const metrics = [
        { label: 'Flow Velocity', value: velocity, unit: '%', trend: '+12%', icon: TrendingUp, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
        { label: 'System Queue', value: activeTasks, unit: 'tasks', trend: 'Live', icon: CheckCircle, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
        { label: 'Cluster Health', value: health, unit: '%', trend: 'Stable', icon: Heart, color: 'text-rose-400', bgColor: 'bg-rose-500/10' },
        { label: 'Total Output', value: tasks?.length || 0, unit: 'units', trend: '+8%', icon: Zap, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
      ]

      const workload = teams?.map(t => ({
        label: t.name,
        val: Math.min(100, (t.tasks?.length || 0) * 20),
        color: t.id === 't1' ? 'bg-blue-500' : t.id === 't2' ? 'bg-violet-500' : 'bg-emerald-500'
      })) || []

      const agenda = tasks?.filter(t => t.due_date).slice(0, 3).map(t => ({
        title: t.title,
        time: t.due_date.slice(-2) + ':00'
      })) || []

      setData({
        metrics,
        activities: activities || [],
        projects: projects || [],
        agenda,
        workload,
        throughput: [40, 65, 45, 90, 55, 75, 85, 30, 60, 95, 80, 100]
      })
    } catch (err) {
      console.error('Dashboard Fetch Error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    const sub = supabase.channel('dashboard-omni')
      .on('postgres_changes', { event: '*', table: 'tasks' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', table: 'projects' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', table: 'activities' }, fetchDashboardData)
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [fetchDashboardData])

  useEffect(() => {
    if (!loading) {
      anime({ targets: '.animate-in', opacity: [0, 1], translateY: [15, 0], delay: anime.stagger(60), duration: 800, easing: 'easeOutExpo' })
    }
  }, [loading])

  const deleteProject = async (id) => {
    if (!confirm('PERMANENT PURGE: Dissolve this infrastructure node?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) fetchDashboardData()
  }

  const deleteActivity = async (id) => {
    await supabase.from('activities').delete().eq('id', id)
    fetchDashboardData()
  }

  if (loading && data.metrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em]">Synchronizing Secure Cluster...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-[0.2em]">Secured Mainframe</span>
            <div className="w-1 h-1 rounded-full bg-blue-500/20"></div>
            <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest">{new Date().toLocaleDateString()}</p>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Executive Control</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => fetchDashboardData()} className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors`}>
            <Bell className="w-[18px] h-[18px]" />
          </button>
          <button className="btn-primary" onClick={() => setCurrentView('projects')}>
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </header>

      {/* METRICS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in">
        {data.metrics.map((m, idx) => (
          <div key={idx} className="glass-card p-6 group hover:border-white/10 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-9 h-9 rounded-xl ${m.bgColor} flex items-center justify-center`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-white/5 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-2xl font-black tabular-nums">{m.value}</span>
              <span className="text-white/20 text-[12px] font-black">{m.unit}</span>
            </div>
            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-3">{m.label}</p>
          </div>
        ))}
      </section>

      {/* CENTER GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-in">
        {/* NEW METHOD TO DELETE PROJECTS (Dashboard List) */}
        <div className="lg:col-span-8 glass-card p-8 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Active Infrastructure</h2>
            <button onClick={() => setCurrentView('projects')} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-white transition-colors">Manage Full Portfolio →</button>
          </div>
          
          <div className="space-y-3">
            {data.projects.length === 0 ? (
              <p className="text-[11px] text-white/10 font-bold uppercase tracking-widest text-center py-10">No active nodes</p>
            ) : data.projects.map(p => (
              <div key={p.id} className="flex items-center justify-between group p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Kanban className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-white/90">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                       <div className="w-24 bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${p.progress}%` }}></div>
                       </div>
                       <span className="text-[10px] font-bold text-white/20 tabular-nums">{p.progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => deleteProject(p.id)} className="p-2.5 rounded-xl bg-rose-500/5 text-white/10 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all" title="Dissolve Node">
                    <Trash2 className="w-4 h-4" />
                   </button>
                   <button onClick={() => setCurrentView('projects')} className="p-2.5 rounded-xl bg-white/5 text-white/10 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECURE ACTIVITY FEED (Shows all messages) */}
        <div className="lg:col-span-4 glass-card p-7">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Omni-Log Stream</h2>
            <div className="flex items-center gap-1.5 text-[9px] text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div> Secure
            </div>
          </div>
          
          <div className="space-y-4">
            {data.activities.length === 0 ? (
              <p className="text-[11px] text-white/10 font-bold uppercase tracking-widest text-center py-20">Awaiting Log Data...</p>
            ) : data.activities.map((a, i) => (
              <div key={a.id} className="flex gap-4 items-start group p-2 -m-2 rounded-xl hover:bg-white/[0.02] transition-colors relative">
                <div className="w-8 h-8 rounded-full bg-blue-500/5 flex items-center justify-center text-blue-400 shrink-0">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-white/60 leading-tight">
                    <span className="text-white font-bold">{a.user_name}</span> {a.action} <span className="text-white/30">{a.target}</span>
                  </p>
                  <span className="text-[9px] text-white/10 font-black uppercase tracking-widest">{new Date(a.created_at).toLocaleTimeString()}</span>
                </div>
                <button onClick={() => deleteActivity(a.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/5 text-white/10 hover:text-rose-400 transition-all absolute right-0 top-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in">
        <div className="glass-card p-7">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 mb-8">System Roster</h2>
          <div className="space-y-6">
            {data.workload.map((w, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] font-black mb-2">
                  <span className="text-white/20 uppercase tracking-[0.2em]">{w.label}</span>
                  <span className="text-white/40">{w.val}%</span>
                </div>
                <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${w.color}`} style={{ width: `${w.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-7 lg:col-span-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 mb-8">Throughput Metrics</h2>
          <div className="flex items-end justify-between gap-1.5 h-32">
            {data.throughput.map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-blue-500/5 to-blue-500/40 rounded-t-[2px] hover:from-blue-400 hover:to-blue-600 transition-all cursor-pointer group relative" style={{ height: `${h}%` }}>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all z-50">{h}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
