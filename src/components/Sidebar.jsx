import React from 'react'
import { LayoutDashboard, Kanban, Users, Settings, LogOut, Command, Globe, FolderPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Sidebar({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'projects', icon: Kanban, label: 'Projects' },
    { id: 'teams', icon: Users, label: 'Teams' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const spaces = [
    { initial: 'P', color: 'bg-blue-500', label: 'ProSpace HQ' },
    { initial: 'S', color: 'bg-emerald-500', label: 'SnehaVash' },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <aside className="w-[80px] h-screen border-r border-white/[0.04] flex flex-col items-center py-8 bg-[#0a0a0a] z-50 shrink-0">
      {/* Brand */}
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-10 shadow-lg shadow-white/5 active:scale-95 transition-transform cursor-pointer">
        <div className="w-5 h-5 bg-[#0a0a0a] rounded-[6px]"></div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col gap-3">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative group animate-in ${
              currentView === item.id 
                ? 'bg-white/[0.08] text-white shadow-inner' 
                : 'text-white/20 hover:text-white/50 hover:bg-white/[0.03]'
            }`}
          >
            <item.icon className="w-[20px] h-[20px]" />
            {/* Tooltip */}
            <div className="absolute left-16 bg-white text-black text-[11px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-[100]">
              {item.label}
            </div>
          </button>
        ))}
        
        <div className="h-px w-8 bg-white/[0.06] my-4 mx-auto"></div>

        {/* Space Switcher */}
        {spaces.map((s, i) => (
          <button key={i} className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold text-white/40 hover:text-white hover:bg-white/[0.05] transition-all relative group">
            <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center text-white text-[11px]`}>
              {s.initial}
            </div>
          </button>
        ))}
        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/10 hover:text-white/30 transition-all">
          <FolderPlus className="w-4 h-4" />
        </button>
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-4">
        <button className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/20 hover:text-white transition-all overflow-hidden group">
          <img src="https://i.pravatar.cc/150?u=current-user" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Profile" />
        </button>
        <button 
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/10 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          title="Sign Out"
        >
          <LogOut className="w-[18px] h-[18px]" />
        </button>
      </div>
    </aside>
  )
}
