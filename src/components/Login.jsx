import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowRight, Lock, Mail, Loader2, LayoutDashboard } from 'lucide-react'
import anime from 'animejs'

export default function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })

  const MAX_LENGTH = 30

  const handleEmailChange = (val) => {
    setEmail(val)
    if (val.length > MAX_LENGTH) {
      setErrors(prev => ({ ...prev, email: `Email must be ${MAX_LENGTH} characters or fewer` }))
    } else {
      setErrors(prev => ({ ...prev, email: '' }))
    }
  }

  const handlePasswordChange = (val) => {
    setPassword(val)
    if (val.length > MAX_LENGTH) {
      setErrors(prev => ({ ...prev, password: `Password must be ${MAX_LENGTH} characters or fewer` }))
    } else if (val.length > 0 && val.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }))
    } else {
      setErrors(prev => ({ ...prev, password: '' }))
    }
  }

  const isValid = email.length <= MAX_LENGTH && password.length <= MAX_LENGTH && password.length >= 6 && email.length > 0

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

    // HARD VALIDATION GATE — blocks before ANY API call
    if (email.length > MAX_LENGTH) {
      setErrors(prev => ({ ...prev, email: `Email must be ${MAX_LENGTH} characters or fewer` }))
      return
    }
    if (password.length > MAX_LENGTH) {
      setErrors(prev => ({ ...prev, password: `Password must be ${MAX_LENGTH} characters or fewer` }))
      return
    }
    if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }))
      return
    }

    setLoading(true)
    
    try {
      if (isSignup) {
        // Step 1: Create the account
        const { error: signUpError } = await supabase.auth.signUp({ email, password })
        
        if (signUpError) {
          if (signUpError.message.includes('fetch')) {
            alert('CONNECTION ERROR: Cannot reach the authentication server. Verify your Supabase configuration.')
          } else {
            alert(signUpError.message)
          }
          setLoading(false)
          return
        }

        // Step 2: Immediately attempt auto-login
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        
        if (loginError) {
          // Email confirmation is likely enabled — user must verify first
          alert('Account created! Please check your email inbox to confirm your account, then sign in.')
          setIsSignup(false) // Switch to sign-in view
        }
        // If no loginError, onAuthStateChange fires automatically → redirect to dashboard
        
      } else {
        // Standard sign-in
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          if (error.message.includes('fetch')) {
            alert('CONNECTION ERROR: Cannot reach the authentication server. Verify your Supabase configuration.')
          } else if (error.message.includes('Invalid login')) {
            alert('Invalid credentials. Please check your email and password.')
          } else if (error.message.includes('Email not confirmed')) {
            alert('Your email has not been confirmed yet. Please check your inbox.')
          } else {
            alert(error.message)
          }
        }
      }
    } catch (err) {
      alert('Unexpected error: ' + err.message)
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
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] font-semibold text-white/25 uppercase tracking-[0.15em]">Email</label>
              <span className={`text-[10px] font-bold tabular-nums transition-colors ${email.length > MAX_LENGTH ? 'text-rose-400' : 'text-white/10'}`}>{email.length}/{MAX_LENGTH}</span>
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15 group-focus-within:text-white/40 transition-colors" />
              <input 
                type="email"
                placeholder="you@company.com"
                maxLength={MAX_LENGTH}
                className={`w-full bg-white/[0.04] border rounded-xl py-3.5 pl-11 pr-4 text-[14px] focus:outline-none focus:bg-white/[0.06] transition-all placeholder:text-white/15 ${errors.email ? 'border-rose-500/40 focus:border-rose-500/60' : 'border-white/[0.06] focus:border-white/20'}`}
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-400 mt-1.5 font-medium">{errors.email}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] font-semibold text-white/25 uppercase tracking-[0.15em]">Password</label>
              <span className={`text-[10px] font-bold tabular-nums transition-colors ${password.length > MAX_LENGTH ? 'text-rose-400' : 'text-white/10'}`}>{password.length}/{MAX_LENGTH}</span>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15 group-focus-within:text-white/40 transition-colors" />
              <input 
                type="password"
                placeholder="••••••••"
                maxLength={MAX_LENGTH}
                className={`w-full bg-white/[0.04] border rounded-xl py-3.5 pl-11 pr-4 text-[14px] focus:outline-none focus:bg-white/[0.06] transition-all placeholder:text-white/15 ${errors.password ? 'border-rose-500/40 focus:border-rose-500/60' : 'border-white/[0.06] focus:border-white/20'}`}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
              />
            </div>
            {errors.password && <p className="text-[11px] text-rose-400 mt-1.5 font-medium">{errors.password}</p>}
          </div>

          <button 
            type="submit"
            disabled={loading || !isValid}
            className={`w-full font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group mt-6 active:scale-[0.98] ${isValid ? 'bg-white text-[#0a0a0a] hover:bg-white/90' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
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
