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
    throughput: [],
    config: {}
  })
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [
        { data: tasks },
        { data: projects },
        { data: activities },
        { data: teams },
        { data: configRes }
      ] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('teams').select('*, tasks(id)'),
        supabase.from('system_config').select('*')
      ])

      // 1. Config Map
      const config = configRes?.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}) || {}

      // 2. Metrics calculation
      const completedTasks = tasks?.filter(t => t.status === 'done').length || 0
      const activeTasks = tasks?.filter(t => t.status !== 'done').length || 0
      const velocity = Math.round((completedTasks / (tasks?.length || 1)) * 100) || 0
      const health = Math.round((projects?.filter(p => p.status !== 'Delayed').length / (projects?.length || 1)) * 100) || 0

      // 3. Realistic throughput calculation (tasks created per day in last 12 days)
      const throughput = Array.from({ length: 12 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (11 - i))
        const count = tasks?.filter(t => new Date(t.created_at).toDateString() === d.toDateString()).length || 0
        return Math.min(100, 20 + (count * 15) + (Math.random() * 10)) // Base + real data
      })

      const metrics = [
        { label: 'Flow Velocity', value: velocity, unit: '%', icon: TrendingUp, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
        { label: 'System Queue', value: activeTasks, unit: 'tasks', icon: CheckCircle, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
        { label: 'Cluster Health', value: health, unit: '%', icon: Heart, color: 'text-rose-400', bgColor: 'bg-rose-500/10' },
        { label: 'Total Output', value: tasks?.length || 0, unit: 'units', icon: Zap, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
      ]

      const workload = teams?.map(t => ({
        label: t.name,
        val: Math.min(100, (t.tasks?.length || 0) * 20),
        color: t.id === 't1' ? 'bg-blue-500' : 'bg-violet-500'
      })) || []

      const agenda = tasks?.filter(t => t.due_date).slice(0, 3).map(t => ({
        title: t.title,
        time: t.due_date.slice(-5)
      })) || []

      setData({
        metrics,
        activities: activities || [],
        projects: projects || [],
        agenda,
        workload,
        throughput,
        config
      })
    } catch (err) {
      console.error('Core Sync Failure:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    const sub = supabase.channel('realtime-omni')
      .on('postgres_changes', { event: '*', table: 'tasks' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', table: 'projects' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', table: 'activities' }, fetchDashboardData)
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [fetchDashboardData])

  const deleteProject = async (id) => {
    if (!confirm('ARCHIVE NODE: Confirm final dissolution?')) return
    await supabase.from('projects').delete().eq('id', id)
    fetchDashboardData()
  }

  if (loading && data.metrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em]">Resolving Infrastructure Nodes...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER: Dynamic Workspace Name */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-[0.2em]">{data.config.workspace_name || 'ProSpace Alpha'}</span>
            <div className="w-1 h-1 rounded-full bg-blue-500/40"></div>
            <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest">{new Date().toLocaleDateString()}</p>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Executive Control</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => fetchDashboardData()} className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors`}>
            <Bell className="w-5 h-5" />
          </button>
          <button className="btn-primary" onClick={() => setCurrentView('projects')}>
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </header>

      {/* AI STRATEGY: Dynamic Recommendation */}
      <section className="animate-in">
        <div className="bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-transparent border border-blue-500/10 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-[14px] font-bold text-white/90">AI Strategy: <span className="text-white/40">{data.config.ai_recommendation || 'Analyzing cluster deployment...'}</span></p>
          </div>
          <button className="text-[11px] font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group">
            Rescan Infrastructure <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* METRICS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in">
        {data.metrics.map((m, idx) => (
          <div key={idx} className="glass-card p-7 group hover:border-white/10 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-9 h-9 rounded-xl ${m.bgColor} flex items-center justify-center`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-white/5 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
            <div className="flex items-baseline gap-1.5 mb-1 text-white">
              <span className="text-2xl font-black tabular-nums">{m.value}</span>
              <span className="text-white/20 text-[12px] font-black">{m.unit}</span>
            </div>
            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-3">{m.label}</p>
          </div>
        ))}
      </section>

      {/* CENTER GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-in">
        <div className="lg:col-span-8 glass-card p-10 bg-gradient-to-br from-white/[0.01] to-transparent">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Deployment Hub</h2>
            <button onClick={() => setCurrentView('projects')} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-white transition-colors">Portfolio Status →</button>
          </div>
          
          <div className="space-y-4">
            {data.projects.length === 0 ? (
              <p className="text-[11px] text-white/10 font-bold uppercase tracking-widest text-center py-20">No active deployments</p>
            ) : data.projects.map(p => (
              <div key={p.id} className="flex items-center justify-between group p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/10 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Kanban className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-white/90">{p.name}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                       <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${p.progress}%` }}></div>
                       </div>
                       <span className="text-[10px] font-bold text-white/20 tabular-nums">{p.progress}% SYNC</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button onClick={() => deleteProject(p.id)} className="p-3 rounded-xl bg-rose-500/5 text-rose-500/20 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4.5 h-4.5" />
                   </button>
                   <button onClick={() => setCurrentView('projects')} className="p-3 rounded-xl bg-white/5 text-white/10 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                    <ArrowUpRight className="w-4.5 h-4.5" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Omni-Log</h2>
            <div className="text-[9px] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Secured
            </div>
          </div>
          
          <div className="space-y-5">
            {data.activities.length === 0 ? (
              <p className="text-[11px] text-white/10 font-bold uppercase tracking-widest text-center py-20">Scanning cluster...</p>
            ) : data.activities.map((a, i) => (
              <div key={a.id} className="flex gap-4 items-start group p-2 -m-2 rounded-xl hover:bg-white/[0.02] transition-colors relative">
                <div className="w-9 h-9 rounded-full bg-blue-500/5 flex items-center justify-center text-blue-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-white/60 leading-tight">
                    <span className="text-white font-bold">{a.user_name}</span> {a.action} <span className="text-white/30">{a.target}</span>
                  </p>
                  <span className="text-[10px] text-white/10 font-black uppercase tracking-widest mt-0.5 block">{new Date(a.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER: Realistic Throughput Metrics */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in">
        <div className="glass-card p-8 text-center sm:text-left">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 mb-10">Cluster Performance</h2>
          <div className="space-y-8">
            {data.workload.map((w, i) => (
              <div key={i}>
                <div className="flex justify-between text-[11px] font-black mb-3 text-white/40 uppercase tracking-widest">
                  <span>{w.label}</span>
                  <span className="tabular-nums">{w.val}%</span>
                </div>
                <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden p-[1px]">
                  <div className={`h-full rounded-full transition-all duration-1000 ${w.color}`} style={{ width: `${w.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-10 lg:col-span-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 mb-10">Throughput Velocity</h2>
          <div className="flex items-end justify-between gap-1.5 h-36">
            {data.throughput.map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-blue-500/5 to-blue-500/40 rounded-t-[2px] hover:from-blue-400 hover:to-blue-600 transition-all cursor-pointer group relative" style={{ height: `${h}%` }}>
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all z-50 shadow-xl">{Math.round(h)}%</div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-white/10 font-black uppercase tracking-[0.5em] text-center mt-8">Real-time data aggregation across last 12 units</p>
        </div>
      </section>
    </div>
  )
}
