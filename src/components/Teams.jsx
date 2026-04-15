import React, { useEffect, useState } from 'react'
import { Users, Shield, Trash2, UserPlus, Code, Palette, Megaphone, Plus, X, MoreVertical } from 'lucide-react'
import anime from 'animejs'
import { useSupabaseTable, supabaseInsert } from '../lib/hooks'
import { supabase } from '../lib/supabase'

const iconMap = {
  'ph-code': Code,
  'ph-bezier-curve': Palette,
  'ph-megaphone': Megaphone,
  'ph-users': Users,
}

export default function Teams() {
  const { data: teams, loading, refresh: refreshTeams } = useSupabaseTable('teams')
  const { data: members, refresh: refreshMembers } = useSupabaseTable('members', '*, teams(name)')
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', description: '' })

  useEffect(() => {
    if (!loading && teams.length > 0) {
      anime({
        targets: '.team-card',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(80),
        duration: 700,
        easing: 'easeOutExpo'
      })
    }
  }, [loading, teams])

  const handleAddTeam = async (e) => {
    e.preventDefault()
    const { error } = await supabaseInsert('teams', {
      id: 't' + Math.random().toString(36).substr(2, 8),
      ...newTeam,
      icon: 'ph-users',
      color_class: 'accent-blue',
      bg: 'rgba(59, 130, 246, 0.1)',
    })
    if (!error) {
      setIsTeamModalOpen(false)
      setNewTeam({ name: '', description: '' })
      refreshTeams()
    } else {
      alert('Failed to create team: ' + error.message)
    }
  }

  const handleDeleteTeam = async (id) => {
    if (!confirm('Permanently dissolve this team? Internal members will be unassigned.')) return
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (!error) {
      refreshTeams()
      refreshMembers()
    } else {
      alert('Error dissolving team: ' + error.message)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const { error } = await supabaseInsert('members', {
      id: 'm' + Math.random().toString(36).substr(2, 8),
      first_name: fd.get('first'),
      last_name: fd.get('last'),
      email: fd.get('email'),
      team_id: fd.get('team'),
      role: 'Member',
      img: `https://i.pravatar.cc/150?u=${fd.get('email')}`,
    })
    if (!error) {
      setIsMemberModalOpen(false)
      refreshMembers()
    } else {
      alert('Failed to add member: ' + error.message)
    }
  }

  const handleDeleteMember = async (id) => {
    if (!confirm('Remove this member?')) return
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (!error) refreshMembers()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-t-2 border-accent-blue rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Organization</p>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => setIsTeamModalOpen(true)}>
            <Plus className="w-4 h-4" />
            New Team
          </button>
          <button className="btn-primary" onClick={() => setIsMemberModalOpen(true)}>
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </header>

      {/* Team Cards */}
      {teams.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Users className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-[15px] font-bold mb-6">NO ACTIVE TEAMS</p>
          <button className="btn-primary mx-auto" onClick={() => setIsTeamModalOpen(true)}>
            <Plus className="w-4 h-4" /> Create Team
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const TeamIcon = iconMap[team.icon] || Users
            const teamMembers = members.filter(m => m.team_id === team.id)
            return (
              <div key={team.id} className="team-card glass-card p-7 group hover:border-white/10 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <TeamIcon className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="p-1.5 rounded-lg bg-white/[0.02] text-white/10 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-xl font-bold mb-1">{team.name}</h3>
                <p className="text-[11px] text-white/20 font-bold uppercase tracking-widest mb-6">{teamMembers.length} ACTIVE NODES</p>
                <p className="text-[13px] text-white/25 leading-relaxed mb-8 line-clamp-2 font-medium">{team.description}</p>
                <div className="flex -space-x-2 pt-6 border-t border-white/[0.04]">
                  {teamMembers.slice(0, 4).map((m, i) => (
                    <img key={i} src={m.img || `https://i.pravatar.cc/150?u=${m.email}`} className="w-8 h-8 rounded-full border-2 border-[#141414] grayscale group-hover:grayscale-0 transition-all" alt="" />
                  ))}
                  {teamMembers.length > 4 && (
                    <div className="w-8 h-8 rounded-full border-2 border-[#141414] bg-white/[0.04] flex items-center justify-center text-[10px] font-bold text-white/40">
                      +{teamMembers.length - 4}
                    </div>
                  )}
                  {teamMembers.length === 0 && (
                    <span className="text-[11px] font-bold text-white/10 uppercase tracking-widest">Awaiting deployment</span>
                  )}
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* Members Table */}
      {members.length > 0 && (
        <section className="animate-in" style={{ animationDelay: '200ms' }}>
          <h2 className="text-[11px] font-bold text-white/20 uppercase tracking-[0.3em] mb-6">Deployment Roster</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                  <th className="px-6 py-5 text-[11px] font-bold text-white/20 uppercase tracking-[0.2em]">Member</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-white/20 uppercase tracking-[0.2em]">Affiliation</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-white/20 uppercase tracking-[0.2em]">Role</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img src={m.img || `https://i.pravatar.cc/150?u=${m.email}`} className="w-10 h-10 rounded-full grayscale group-hover:grayscale-0 transition-all" alt="" />
                        <div>
                          <div className="text-[14px] font-bold text-white/80">{m.first_name} {m.last_name}</div>
                          <div className="text-[11px] font-bold text-white/15 uppercase tracking-tighter">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[12px] font-bold text-blue-400/60 uppercase tracking-widest">
                        {m.teams?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[12px] font-bold text-white/30 uppercase tracking-widest">{m.role}</td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        className="p-2.5 rounded-xl bg-white/[0.02] text-white/10 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* New Team Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsTeamModalOpen(false)}></div>
          <div className="glass-card w-full max-w-md p-10 relative z-10 border-white/10 shadow-2xl animate-fade-in-up">
            <h2 className="text-xl font-bold tracking-tight mb-8">Establish Team</h2>
            <form onSubmit={handleAddTeam} className="space-y-6">
              <div>
                <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2.5 block">Nomenclature</label>
                <input type="text" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-4 text-[14px] font-bold focus:outline-none focus:border-blue-500/50 transition-all" placeholder="e.g. Core Systems" value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })} required autoFocus />
              </div>
              <div>
                <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2.5 block">Briefing</label>
                <textarea className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-4 text-[14px] font-bold focus:outline-none focus:border-blue-500/50 h-32 resize-none transition-all" placeholder="Primary objectives..." value={newTeam.description} onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })} required />
              </div>
              <div className="flex gap-4 mt-10 pt-6 border-t border-white/[0.04]">
                <button type="button" className="flex-1 py-4 text-[12px] font-bold text-white/20 uppercase tracking-widest" onClick={() => setIsTeamModalOpen(false)}>Abort</button>
                <button type="submit" className="btn-primary flex-1 justify-center py-4">Establish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsMemberModalOpen(false)}></div>
          <div className="glass-card w-full max-w-md p-10 relative z-10 border-white/10 shadow-2xl animate-fade-in-up">
            <h2 className="text-xl font-bold tracking-tight mb-8">Enlist Member</h2>
            <form onSubmit={handleAddMember} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2.5 block">First</label>
                  <input name="first" type="text" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-4 text-[14px] font-bold focus:outline-none focus:border-blue-500/50 transition-all" required />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2.5 block">Last</label>
                  <input name="last" type="text" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-4 text-[14px] font-bold focus:outline-none focus:border-blue-500/50 transition-all" required />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2.5 block">Comms Address</label>
                <input name="email" type="email" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-4 text-[14px] font-bold focus:outline-none focus:border-blue-500/50 transition-all" placeholder="user@domain.com" required />
              </div>
              <div>
                <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2.5 block">Deployment Node</label>
                <select name="team" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-4 text-[14px] font-bold focus:outline-none focus:border-blue-500/50 appearance-none transition-all" required>
                  <option value="" disabled className="bg-[#141414]">Assign to cluster...</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#141414] font-bold">{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 mt-10 pt-6 border-t border-white/[0.04]">
                <button type="button" className="flex-1 py-4 text-[12px] font-bold text-white/20 uppercase tracking-widest" onClick={() => setIsMemberModalOpen(false)}>Dismiss</button>
                <button type="submit" className="btn-primary flex-1 justify-center py-4">Enlist</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
