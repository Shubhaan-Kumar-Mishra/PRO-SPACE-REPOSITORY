import React, { useEffect, useRef } from 'react'
import Sidebar from './Sidebar'
import anime from 'animejs'

export default function Layout({ children, session, currentView, setCurrentView }) {
  const mainRef = useRef(null)

  useEffect(() => {
    if (mainRef.current) {
      anime({
        targets: mainRef.current,
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 600,
        easing: 'easeOutExpo'
      })
    }
  }, [currentView])

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-text-primary overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-5%] w-[500px] h-[500px] bg-blue-500/[0.03] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-violet-500/[0.03] blur-[150px] rounded-full"></div>
      </div>

      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main 
        key={currentView}
        ref={mainRef}
        className="flex-1 overflow-y-auto px-8 lg:px-12 pt-12 pb-12 relative z-10"
      >
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
