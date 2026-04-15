import React, { useEffect, useRef } from 'react'
import { ArrowRight, Play, LayoutDashboard, ChevronRight, Sparkles, Shield, Zap, Globe, BarChart3, Users, Clock, ArrowUpRight } from 'lucide-react'
import anime from 'animejs'

export default function Landing({ onGetStarted }) {
  useEffect(() => {
    anime.timeline({ easing: 'easeOutExpo' })
      .add({
        targets: '.hero-word',
        translateY: [80, 0],
        opacity: [0, 1],
        delay: anime.stagger(120),
        duration: 1400,
      })
      .add({
        targets: '.hero-fade',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
      }, '-=600')
      .add({
        targets: '.bento-card',
        opacity: [0, 1],
        translateY: [30, 0],
        delay: anime.stagger(80),
        duration: 700,
      }, '-=400')
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-[#0a0a0a]" />
            </div>
            <span className="text-lg font-semibold tracking-tight">ProSpace</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[13px] font-medium text-white/50">
            <a href="#features" className="hover:text-white transition-colors duration-300">Features</a>
            <a href="#solutions" className="hover:text-white transition-colors duration-300">Solutions</a>
            <a href="#enterprise" className="hover:text-white transition-colors duration-300">Enterprise</a>
            <a href="#pricing" className="hover:text-white transition-colors duration-300">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onGetStarted} className="text-[13px] font-medium text-white/60 hover:text-white transition-colors">Sign in</button>
            <button onClick={onGetStarted} className="bg-white text-black px-5 py-2 rounded-full text-[13px] font-semibold hover:bg-white/90 active:scale-95 transition-all">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/hero.png" alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-10 hero-fade">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[12px] font-medium text-white/60">Now with AI-powered project insights</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-[88px] font-bold tracking-[-0.04em] leading-[0.95] mb-8 overflow-hidden">
            <span className="hero-word inline-block">Manage projects</span><br />
            <span className="hero-word inline-block text-white/40">like never before.</span>
          </h1>

          <p className="hero-fade text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            The command center for high-velocity teams. Real-time dashboards,
            seamless collaboration, and AI-driven insights — all in one place.
          </p>

          <div className="hero-fade flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={onGetStarted} className="bg-white text-black px-8 py-4 rounded-full text-[15px] font-semibold flex items-center gap-3 hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-white/10">
              Start Building Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-3 text-[15px] text-white/60 hover:text-white transition-colors group">
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                <Play className="w-4 h-4 ml-0.5" />
              </div>
              Watch demo
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="hero-fade relative z-10 mt-24 flex flex-wrap justify-center gap-16 text-center">
          <div>
            <div className="text-4xl font-bold tracking-tight">20%</div>
            <div className="text-[13px] text-white/40 mt-1">Faster delivery</div>
          </div>
          <div className="w-px bg-white/10"></div>
          <div>
            <div className="text-4xl font-bold tracking-tight">15k+</div>
            <div className="text-[13px] text-white/40 mt-1">Active teams</div>
          </div>
          <div className="w-px bg-white/10"></div>
          <div>
            <div className="text-4xl font-bold tracking-tight">99.9%</div>
            <div className="text-[13px] text-white/40 mt-1">Uptime SLA</div>
          </div>
        </div>
      </section>

      {/* ─── BENTO FEATURE SECTION ─── */}
      <section id="features" className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Built for human<br />confidence.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[280px]">
          {/* Large card - left */}
          <div className="bento-card md:col-span-7 rounded-3xl overflow-hidden relative group cursor-pointer">
            <img src="/forest.png" alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <h3 className="text-2xl font-bold mb-2">Real-time Sync</h3>
              <p className="text-white/50 text-sm max-w-md leading-relaxed">Every change propagates instantly across your entire team. No refresh, no delay, no conflicts.</p>
            </div>
          </div>

          {/* Two stacked cards - right */}
          <div className="md:col-span-5 grid grid-rows-2 gap-4">
            <div className="bento-card rounded-3xl bg-[#141414] border border-white/5 p-8 flex flex-col justify-between hover:border-white/10 transition-colors cursor-pointer">
              <Shield className="w-8 h-8 text-emerald-400" />
              <div>
                <h3 className="text-lg font-semibold mb-1">Enterprise Security</h3>
                <p className="text-white/40 text-sm">SOC 2 Type II, SSO, and end-to-end encryption as standard.</p>
              </div>
            </div>
            <div className="bento-card rounded-3xl bg-[#141414] border border-white/5 p-8 flex flex-col justify-between hover:border-white/10 transition-colors cursor-pointer">
              <Zap className="w-8 h-8 text-amber-400" />
              <div>
                <h3 className="text-lg font-semibold mb-1">Lightning Performance</h3>
                <p className="text-white/40 text-sm">Sub-50ms latency globally with edge computing infrastructure.</p>
              </div>
            </div>
          </div>

          {/* Bottom row - three cards */}
          <div className="bento-card md:col-span-4 rounded-3xl bg-[#141414] border border-white/5 p-8 flex flex-col justify-between hover:border-white/10 transition-colors cursor-pointer">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold mb-1">AI Analytics</h3>
              <p className="text-white/40 text-sm">Predictive project health scoring powered by machine learning.</p>
            </div>
          </div>
          <div className="bento-card md:col-span-4 rounded-3xl bg-[#141414] border border-white/5 p-8 flex flex-col justify-between hover:border-white/10 transition-colors cursor-pointer">
            <Users className="w-8 h-8 text-violet-400" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Team Velocity</h3>
              <p className="text-white/40 text-sm">Track sprint cadence, individual output, and team health at a glance.</p>
            </div>
          </div>
          <div className="bento-card md:col-span-4 rounded-3xl bg-[#141414] border border-white/5 p-8 flex flex-col justify-between hover:border-white/10 transition-colors cursor-pointer">
            <Clock className="w-8 h-8 text-rose-400" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Time Intelligence</h3>
              <p className="text-white/40 text-sm">Smart scheduling and capacity planning with resource optimization.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── IMMERSIVE SPLIT SECTION ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-3xl overflow-hidden relative aspect-[4/3] group cursor-pointer">
            <img src="/landscape.png" alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-semibold">Collaboration</span>
              <h3 className="text-3xl font-bold mt-2 leading-tight">Engage with<br />your team, daily.</h3>
            </div>
          </div>
          <div className="rounded-3xl bg-[#141414] border border-white/5 p-12 flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-semibold mb-6">How it works</span>
            <h3 className="text-3xl font-bold mb-6 leading-tight">Simple setup.<br />Powerful results.</h3>
            <div className="space-y-6">
              {[
                { step: '01', title: 'Connect your tools', desc: 'Import from Jira, Linear, Asana, or GitHub in one click.' },
                { step: '02', title: 'Define your workflow', desc: 'Customize boards, sprints, and automation rules.' },
                { step: '03', title: 'Ship faster', desc: 'Let AI surface blockers and optimize your pipeline.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-5 group cursor-pointer">
                  <span className="text-[13px] font-mono text-white/20 mt-1 group-hover:text-white/60 transition-colors">{item.step}</span>
                  <div>
                    <h4 className="text-[15px] font-semibold mb-1 group-hover:text-white transition-colors">{item.title}</h4>
                    <p className="text-[13px] text-white/30 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIGHT SECTION — Social Proof ─── */}
      <section className="bg-[#f5f5f0] text-[#0a0a0a] py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            See how enterprises are<br />
            <span className="text-black/40">reimagining work with ProSpace.</span>
          </h2>
          <p className="text-black/40 text-lg max-w-xl mx-auto mb-16">
            Trusted by engineering, product, and design teams at the world's most ambitious companies.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-30">
            {['Apple', 'Google', 'Stripe', 'Vercel'].map((name) => (
              <div key={name} className="text-2xl font-bold tracking-tight">{name}</div>
            ))}
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: '"ProSpace cut our sprint planning time by 60%."', author: 'Sarah K.', role: 'VP of Engineering' },
              { quote: '"The real-time dashboards are a game changer for our distributed team."', author: 'Marcus L.', role: 'CTO' },
              { quote: '"Finally, a PM tool that developers actually enjoy using."', author: 'Aria T.', role: 'Lead Developer' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 text-left shadow-sm border border-black/5">
                <p className="text-[15px] leading-relaxed text-black/70 mb-6">{t.quote}</p>
                <div>
                  <div className="text-sm font-semibold text-black">{t.author}</div>
                  <div className="text-xs text-black/40">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero.png" alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/90"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Start building your<br />
            <span className="text-white/40">future, today.</span>
          </h2>
          <p className="text-white/40 text-lg mb-12 max-w-lg mx-auto">Free for teams up to 10. No credit card required.</p>
          <button
            onClick={onGetStarted}
            className="bg-white text-black px-10 py-5 rounded-full text-[16px] font-bold flex items-center gap-3 hover:scale-[1.03] active:scale-95 transition-all mx-auto shadow-2xl shadow-white/10"
          >
            Get Started for Free <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
                <LayoutDashboard className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-[15px] font-semibold">ProSpace</span>
            </div>
            <p className="text-[13px] text-white/30 max-w-xs">The command center for teams that ship fast and think big.</p>
          </div>
          <div className="flex gap-20 text-[13px]">
            <div className="space-y-3">
              <div className="text-white/20 font-semibold uppercase text-[11px] tracking-widest mb-4">Product</div>
              <a href="#" className="block text-white/40 hover:text-white transition-colors">Features</a>
              <a href="#" className="block text-white/40 hover:text-white transition-colors">Pricing</a>
              <a href="#" className="block text-white/40 hover:text-white transition-colors">Changelog</a>
            </div>
            <div className="space-y-3">
              <div className="text-white/20 font-semibold uppercase text-[11px] tracking-widest mb-4">Company</div>
              <a href="#" className="block text-white/40 hover:text-white transition-colors">About</a>
              <a href="#" className="block text-white/40 hover:text-white transition-colors">Blog</a>
              <a href="#" className="block text-white/40 hover:text-white transition-colors">Careers</a>
            </div>
            <div className="space-y-3">
              <div className="text-white/20 font-semibold uppercase text-[11px] tracking-widest mb-4">Connect</div>
              <a href="#" className="block text-white/40 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="block text-white/40 hover:text-white transition-colors">GitHub</a>
              <a href="#" className="block text-white/40 hover:text-white transition-colors">Discord</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex justify-between text-[12px] text-white/20">
          <span>&copy; 2026 ProSpace Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/40 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/40 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
