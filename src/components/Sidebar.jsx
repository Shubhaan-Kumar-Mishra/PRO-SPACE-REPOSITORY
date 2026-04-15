import React, { useState } from 'react'
import { LayoutDashboard, Kanban, Users, Settings, LogOut, FolderPlus, Menu, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Sidebar({ currentView, setCurrentView }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'projects', icon: Kanban, label: 'Projects' },
    { id: 'teams', icon: Users, label: 'Teams' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleNav = (id) => {
    setCurrentView(id)
    setMobileOpen(false)
  }

  return (
    <>
      {/* MOBILE: Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between px-4 z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-[#0a0a0a] rounded-[4px]"></div>
          </div>
          <span className="text-[13px] font-bold text-white/60 uppercase tracking-widest">ProSpace</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE: Slide-over Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[55]">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
          <div className="absolute right-0 top-14 bottom-0 w-64 bg-[#0a0a0a] border-l border-white/[0.06] p-6 flex flex-col gap-2 animate-slide-in">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-left ${
                  currentView === item.id 
                    ? 'bg-white/[0.08] text-white' 
                    : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[14px] font-bold">{item.label}</span>
              </button>
            ))}
            <div className="h-px bg-white/[0.06] my-4"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[14px] font-bold">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* MOBILE: Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.06] flex items-center justify-around px-2 z-[60]">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              currentView === item.id 
                ? 'text-blue-400' 
                : 'text-white/20'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>

      {/* DESKTOP: Vertical Sidebar */}
      <aside className="hidden lg:flex w-[80px] h-screen border-r border-white/[0.04] flex-col items-center py-8 bg-[#0a0a0a] z-50 shrink-0 sticky top-0">
        {/* Brand */}
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-10 shadow-lg shadow-white/5 active:scale-95 transition-transform cursor-pointer">
          <div className="w-5 h-5 bg-[#0a0a0a] rounded-[6px]"></div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-3">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative group ${
                currentView === item.id 
                  ? 'bg-white/[0.08] text-white shadow-inner' 
                  : 'text-white/20 hover:text-white/50 hover:bg-white/[0.03]'
              }`}
            >
              <item.icon className="w-[20px] h-[20px]" />
              <div className="absolute left-16 bg-white text-black text-[11px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-[100]">
                {item.label}
              </div>
            </button>
          ))}
          
          <div className="h-px w-8 bg-white/[0.06] my-4 mx-auto"></div>

          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/10 hover:text-white/30 transition-all mx-auto">
            <FolderPlus className="w-4 h-4" />
          </button>
        </nav>

        {/* Bottom */}
        <div className="flex flex-col gap-4">
          <button className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center overflow-hidden group">
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
    </>
  )
}
