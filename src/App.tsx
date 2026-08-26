import { useState, useEffect } from 'react'
import { LangContext, RTL_LANGS, makeT } from './i18n'
import type { AppState, Screen, AIScreen as AIScreenName } from './types'
import { BlobBackground } from './components/atoms'
import { BottomNav } from './components/BottomNav'
import { LoginScreen } from './screens/LoginScreen'
import { HomeScreen } from './screens/HomeScreen'
import { BabyScreen } from './screens/BabyScreen'
import { AIScreen, VoiceScreen } from './screens/AIScreen'
import { PlannerScreen } from './screens/PlannerScreen'
import { MoreScreen } from './screens/MoreScreen'
import { hasActiveSession, onAuthStateChange, signOut } from './services'

export default function App() {
  // MBCST-22: start in a real "checking" state rather than assuming
  // signed-out. `resumingSession` stays true only until the real Supabase
  // session check below resolves, so a reload never flashes the login
  // screen for someone who's genuinely still signed in.
  const [appState, setAppState] = useState<AppState>('login')
  const [resumingSession, setResumingSession] = useState(true)
  const [screen, setScreen] = useState<Screen>('home')
  const [darkMode, setDarkMode] = useState(false)
  const [lang, setLang] = useState('English')
  const t = makeT(lang)
  const isRTL = RTL_LANGS.has(lang)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [aiSubScreen, setAISubScreen] = useState<AIScreenName>('chat')

  useEffect(() => {
    let cancelled = false
    hasActiveSession().then(signedIn => {
      if (!cancelled) {
        setAppState(signedIn ? 'app' : 'login')
        setResumingSession(false)
      }
    })
    // A real sign-out (or session expiry / another tab signing out) should
    // return this app to the login screen too, not just the explicit button.
    const unsubscribe = onAuthStateChange(signedIn => {
      if (!signedIn) setAppState('login')
    })
    return () => { cancelled = true; unsubscribe() }
  }, [])

  const handleSignOut = () => {
    // MBCST-22: clear the real Supabase session (and any cached household
    // state that depends on it) instead of only flipping local UI state --
    // previously this left the real session intact, so a signed-out screen
    // was reachable while the account was still technically authenticated.
    void signOut()
    setAppState('login')
  }

  const handleVoice = () => {
    setVoiceOpen(true)
    setAISubScreen('voice')
  }

  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const [vh, setVh] = useState(typeof window !== 'undefined' ? window.innerHeight : 844)
  useEffect(() => {
    const onResize = () => { setVw(window.innerWidth); setVh(window.innerHeight) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Responsive layout decisions
  const isMobile = vw < 640

  // On mobile: fill screen. On tablet/desktop: phone frame scaled to fit,
  // centered with no side panel — see docs/ARCHITECTURE.md for why the
  // desktop marketing sidebar was removed (2026-08-11, user request: match
  // the phone-only mockup on every viewport).
  const frameW = 390
  const frameH = 844
  const scale = isMobile ? 1 : Math.min(1, (vw * 0.9) / frameW, (vh * 0.95) / frameH)
  const borderRad = isMobile ? 0 : 44

  return (
    <div
      className="flex items-center justify-center overflow-hidden"
      style={{
        minHeight: '100dvh',
        background: isMobile
          ? '#FFFCFA'
          : 'radial-gradient(ellipse at 20% 30%, #FFE8DE 0%, #FFF8F4 45%, #EEF4FF 100%)',
      }}
    >
      {/* Decorative blobs visible on desktop behind the phone */}
      {!isMobile && (
        <>
          <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'rgba(246,182,165,0.22)', filter: 'blur(80px)', top: '-100px', left: '-120px', pointerEvents: 'none' }} />
          <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: 'rgba(98,153,213,0.13)', filter: 'blur(70px)', bottom: '-80px', right: '-100px', pointerEvents: 'none' }} />
        </>
      )}

      {/* Phone frame */}
      <div
        className="relative flex flex-col overflow-hidden"
        data-dark={darkMode ? 'true' : undefined}
        style={{
          width: isMobile ? '100%' : frameW,
          height: isMobile ? '100dvh' : frameH,
          maxWidth: isMobile ? '100%' : frameW,
          borderRadius: borderRad,
          background: darkMode ? '#18181B' : '#FFFCFA',
          transform: isMobile ? 'none' : `scale(${scale})`,
          transformOrigin: 'center center',
          boxShadow: isMobile ? 'none' : '0 32px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10)',
          flexShrink: 0,
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
      <LangContext.Provider value={{ lang, setLang, t }}>
        {resumingSession ? (
          // Real session check in flight (MBCST-22) -- deliberately blank
          // rather than the login screen, so a genuinely signed-in person
          // never sees a false "please sign in" flash on reload.
          <div style={{ width: '100%', height: '100%' }} />
        ) : appState === 'login' ? (
          <LoginScreen onLogin={() => setAppState('app')} />
        ) : (
          <>
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <BlobBackground />
            </div>

            {/* Status bar */}
            <div className="relative z-10 flex items-center justify-between px-8 pt-4 pb-1">
              <span className="text-xs font-semibold text-[#242424]">9:41</span>
              <div className="flex items-center gap-1.5">
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <rect x="0" y="6" width="3" height="6" rx="0.5" fill="#242424" />
                  <rect x="4.5" y="4" width="3" height="8" rx="0.5" fill="#242424" />
                  <rect x="9" y="2" width="3" height="10" rx="0.5" fill="#242424" />
                  <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" fill="#242424" />
                </svg>
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <path d="M8 2.5C10.5 2.5 12.8 3.6 14.3 5.4L15.5 4.1C13.7 2 11 .8 8 .8s-5.7 1.2-7.5 3.3L1.7 5.4C3.2 3.6 5.5 2.5 8 2.5z" fill="#242424"/>
                  <path d="M8 5.5c1.6 0 3 .7 4 1.8l1.2-1.3C11.7 4.6 10 3.8 8 3.8S4.3 4.6 2.8 6L4 7.3C5 6.2 6.4 5.5 8 5.5z" fill="#242424"/>
                  <circle cx="8" cy="10.5" r="1.5" fill="#242424"/>
                </svg>
                <div className="flex items-center gap-0.5">
                  <div className="w-5.5 h-3 rounded-sm border border-[#242424]/40 p-0.5 flex">
                    <div className="w-3/4 h-full rounded-xs bg-[#55A67A]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Screen content */}
            <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
              {screen === 'home' && <HomeScreen onVoice={handleVoice} onSignOut={handleSignOut} onNavigate={setScreen} />}
              {screen === 'baby' && <BabyScreen />}
              {screen === 'ai' && <AIScreen onVoice={handleVoice} />}
              {screen === 'planner' && <PlannerScreen />}
              {screen === 'more' && <MoreScreen onSignOut={handleSignOut} darkMode={darkMode} setDarkMode={setDarkMode} />}
            </div>

            {/* Bottom navigation */}
            <div className="relative z-10">
              <BottomNav screen={screen} onChange={setScreen} onVoice={handleVoice} />
            </div>

            {/* Voice overlay */}
            {voiceOpen && <VoiceScreen onClose={() => setVoiceOpen(false)} />}
          </>
        )}
      </LangContext.Provider>
      </div>
    </div>
  )
}
