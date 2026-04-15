import React, { useState, useEffect, useCallback } from 'react'
import {
  Search, Filter, Plus, MoreHorizontal,
  MessageSquare, Paperclip, Clock, ChevronRight,
  Layout, CheckCircle2, Circle, AlertCircle, X,
  ArrowLeft, Loader2, Calendar, Target, Flag, Users
} from 'lucide-react'
import anime from 'animejs'
import { supabase } from '../lib/supabase'

export default function Board({ projectId, onBack }) {
  const [tasks, setTasks] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [projectName, setProjectName] = useState('')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newTask, setNewTask] = useState({
    title: '',
    status: 'todo',
    team_id: '',
    priority: 'medium',
    estimate: 3,
    due_date: new Date().toISOString().split('T')[0]
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: proj } = await supabase.from('projects').select('name').eq('id', projectId).single()
    if (proj) setProjectName(proj.name)

    const [tasksRes, teamsRes] = await Promise.all([
      supabase.from('tasks').select('*, teams(name)').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('teams').select('id, name')
    ])

    setTasks(tasksRes.data || [])
    setTeams(teamsRes.data || [])
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!loading) {
      anime({
        targets: '.task-item',
        opacity: [0, 1],
        translateY: [10, 0],
        delay: anime.stagger(40),
        duration: 800,
        easing: 'easeOutExpo'
      })
    }
  }, [loading, tasks])

  const columns = [
    { id: 'todo', label: 'Backlog', icon: Circle, color: 'text-white/20' },
    { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-400' },
    { id: 'review', label: 'Review', icon: AlertCircle, color: 'text-amber-400' },
    { id: 'done', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-400' },
  ]

  const handleAddTask = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('tasks').insert({
      id: 'task-' + Math.random().toString(36).substr(2, 9),
      project_id: projectId,
      ...newTask
    })
    if (!error) {
      setIsTaskModalOpen(false)
      setNewTask({ title: '', status: 'todo', team_id: '', priority: 'medium', estimate: 3, due_date: new Date().toISOString().split('T')[0] })
      fetchData()
    }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    if (!error) fetchData()
  }

  const deleteTask = async (taskId) => {
    if (!confirm('Permanently remove this task?')) return
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (!error) fetchData()
  }

  const priorityColor = (p) => {
    if (p === 'high') return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    if (p === 'medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  }

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">Compiling Workspace...</span>
    </div>
  )

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/20 hover:text-white transition-all active:scale-90"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em]">{projectName} Cluster</span>
              <div className="w-1 h-1 rounded-full bg-white/20"></div>
              <span className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em]">Board Engine v2.0</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Active Sprints</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/50 transition-colors" />
            <input
              type="text"
              placeholder="Search sprint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl py-2.5 pl-9 pr-4 text-[13px] focus:outline-none focus:border-white/15 w-48 transition-all"
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => setIsTaskModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map((col) => {
          const columnTasks = filteredTasks.filter(t => t.status === col.id)
          return (
            <div key={col.id} className="flex flex-col gap-4 min-h-[600px]">
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <col.icon className={`w-4 h-4 ${col.color}`} />
                  <h3 className="text-[13px] font-bold text-white/70 uppercase tracking-widest">{col.label}</h3>
                  <span className="text-[10px] font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded-md">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="task-item glass-card p-6 group hover:border-white/10 transition-all cursor-move active:scale-[0.98] animate-in"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const droppedTaskId = e.dataTransfer.getData('taskId')
                      updateTaskStatus(droppedTaskId, col.id)
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${priorityColor(task.priority)}`}>
                          {task.priority || 'Medium'}
                        </span>
                        {task.teams?.name && (
                          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                            {task.teams.name}
                          </span>
                        )}
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/5 rounded-lg">
                        <X className="w-4 h-4 text-white/10 hover:text-rose-400" />
                      </button>
                    </div>

                    <h4 className="text-[14px] font-bold text-white/80 leading-snug mb-5 group-hover:text-white transition-colors">
                      {task.title}
                    </h4>

                    <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-white/20" />
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Target className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-400/60 font-mono">{task.estimate || 1} pts</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-1.5">
                        <img src={`https://i.pravatar.cc/150?u=${task.id}`} className="w-7 h-7 rounded-full border-2 border-[#141414] grayscale group-hover:grayscale-0 transition-all" alt="" />
                      </div>
                      <div className="flex items-center gap-1.5 text-white/10 font-mono text-[10px] uppercase">
                        ID: {task.id.slice(-4)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="flex-1 rounded-2xl border-2 border-dashed border-white/[0.01] hover:border-white/5 hover:bg-white/[0.01] transition-all min-h-[160px] flex items-center justify-center group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const taskId = e.dataTransfer.getData('taskId')
                  updateTaskStatus(taskId, col.id)
                }}
              >
                <Plus className="w-8 h-8 text-white/[0.01] group-hover:text-white/5 transition-colors" />
              </div>
            </div>
          )
        })}
      </div>

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={() => setIsTaskModalOpen(false)}></div>
          <div className="glass-card w-full max-w-xl p-12 relative z-10 animate-fade-in-up border-white/10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full translate-x-16 -translate-y-16"></div>

            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Create Mission</h2>
                <p className="text-[12px] text-white/20 font-medium uppercase tracking-[0.2em] mt-1">Sprint Initiation Proto 4.2</p>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-8">
              <div>
                <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 block">Task Brief</label>
                <input
                  type="text"
                  className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-5 px-6 text-[15px] font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
                  placeholder="Define the primary objective..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                    <Users className="w-3 h-3" /> Assigned Team
                  </label>
                  <select
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 text-[14px] font-bold focus:outline-none focus:border-blue-500/50 appearance-none transition-all"
                    value={newTask.team_id}
                    onChange={(e) => setNewTask({ ...newTask, team_id: e.target.value })}
                    required
                  >
                    <option value="" disabled className="bg-[#141414]">Select Deployment Team</option>
                    {teams.map(t => <option key={t.id} value={t.id} className="bg-[#141414]">{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                    <Flag className="w-3 h-3" /> Priority Level
                  </label>
                  <select
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 text-[14px] font-bold focus:outline-none focus:border-blue-500/50 appearance-none transition-all"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="low" className="bg-[#141414]">Standard (Low)</option>
                    <option value="medium" className="bg-[#141414]">Action (Medium)</option>
                    <option value="high" className="bg-[#141414]">Critical (High)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                    <Target className="w-3 h-3" /> Story Points
                  </label>
                  <input
                    type="number"
                    min="1" max="21"
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 text-[14px] font-bold focus:outline-none focus:border-blue-500/50 transition-all"
                    value={newTask.estimate}
                    onChange={(e) => setNewTask({ ...newTask, estimate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Deployment Deadline
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 text-[14px] font-bold focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-12 pt-8 border-t border-white/[0.04]">
                <button type="button" className="flex-1 py-4 text-[13px] font-extrabold text-white/20 hover:text-white uppercase tracking-[0.2em] transition-colors" onClick={() => setIsTaskModalOpen(false)}>Abort Mission</button>
                <button type="submit" className="btn-primary flex-1 justify-center py-5 shadow-3xl shadow-blue-500/20 text-[14px] font-black uppercase tracking-[0.1em]">Launch Deployment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
