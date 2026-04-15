import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowRight, Lock, Mail, Loader2, LayoutDashboard } from 'lucide-react'
import anime from 'animejs'

export default function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    anime({
      targets: '.login-card',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      easing: 'easeOutExpo'
    })
  }, [isSignup])

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = isSignup 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
      
    if (error) {
      alert(error.message)
    } else if (isSignup) {
      alert('Account created! Check your email to confirm.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-blue-500/[0.06] blur-[150px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/[0.04] blur-[150px] rounded-full"></div>

      <div className="login-card w-full max-w-[420px] relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-white/5">
            <LayoutDashboard className="w-6 h-6 text-[#0a0a0a]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {isSignup ? 'Create your account' : 'Sign in to ProSpace'}
          </h1>
          <p className="text-[13px] text-white/30">
            {isSignup ? 'Start your free trial today' : 'Welcome back — pick up where you left off'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-white/25 uppercase tracking-[0.15em] mb-2 block">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15 group-focus-within:text-white/40 transition-colors" />
              <input 
                type="email"
                placeholder="you@company.com"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-[14px] focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all placeholder:text-white/15"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-white/25 uppercase tracking-[0.15em] mb-2 block">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15 group-focus-within:text-white/40 transition-colors" />
              <input 
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-[14px] focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all placeholder:text-white/15"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-[#0a0a0a] hover:bg-white/90 font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group mt-6 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isSignup ? 'Create Account' : 'Continue'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[13px] text-white/25">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button 
              onClick={() => setIsSignup(!isSignup)}
              className="text-white/60 hover:text-white ml-1.5 font-medium transition-colors"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
