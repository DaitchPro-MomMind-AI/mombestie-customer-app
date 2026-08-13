import { useState } from 'react'
import { detectCountry, formatPrice, signIn, signUp } from '../services'

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<'landing' | 'signin' | 'signup' | 'payment' | 'confirm-email'>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  // Supabase's "Confirm email" setting is on for this project (see
  // docs/PROJECT_REPORT.md §10 Phase 1) -- signUp() succeeds but returns no
  // session until the user clicks the emailed link, so we can't call
  // onLogin() yet even though their account is real.
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  // Country-config-driven pricing — see docs/ARCHITECTURE.md §7.1/§7.2. Same
  // mechanism and same reference numbers as apps/website/src/i18n.ts.
  const [country] = useState(() => detectCountry())
  const plusPrice = formatPrice(country, country.plusMonthly)

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  }

  const submit = async () => {
    if (loading) return
    setAuthError(null)

    if (mode === 'signup') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setAuthError('Please fill in your name, email, and password.')
        return
      }
      setLoading(true)
      const result = await signUp(email.trim(), password, name.trim())
      setLoading(false)
      if (!result.ok) { setAuthError(result.error ?? 'Sign up failed — please try again.'); return }
      setNeedsConfirmation(!!result.needsEmailConfirmation)
      setMode('payment')
      return
    }

    if (mode === 'payment') {
      // Payment itself stays UI-only — FEATURES.realPayments is false, see
      // docs/ARCHITECTURE.md §9. The account was already created for real
      // in the signup step above; this just completes the trial-start UX.
      if (needsConfirmation) { setMode('confirm-email'); return }
      setLoading(true)
      setTimeout(() => { setLoading(false); onLogin() }, 1200)
      return
    }

    // signin
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter your email and password.')
      return
    }
    setLoading(true)
    const result = await signIn(email.trim(), password)
    setLoading(false)
    if (!result.ok) { setAuthError(result.error ?? 'Sign in failed — check your email and password.'); return }
    onLogin()
  }

  // ── Floating decorations ──────────────────────────────────────────────────
  const Decorations = () => (
    <>
      {/* Stars */}
      {[
        { x: 28, y: 90, s: 1.0, d: 0 },
        { x: 340, y: 110, s: 0.7, d: 0.4 },
        { x: 60, y: 200, s: 0.5, d: 0.9 },
        { x: 350, y: 260, s: 0.8, d: 1.2 },
        { x: 20, y: 310, s: 0.6, d: 0.6 },
        { x: 360, y: 380, s: 0.55, d: 1.8 },
      ].map((s, i) => (
        <svg key={i} className="star-twinkle absolute pointer-events-none"
          style={{ left: s.x, top: s.y, animationDelay: `${s.d}s`, transform: `scale(${s.s})` }}
          width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1l1.5 4h4.2l-3.4 2.5 1.3 4L7 9.2 3.4 11.5l1.3-4L1.3 5H5.5z" fill="#F8C85E" stroke="#F4A800" strokeWidth="0.5"/>
        </svg>
      ))}

      {/* Floating hearts */}
      <div className="float-a absolute pointer-events-none" style={{ left: 18, top: 160 }}>
        <svg width="28" height="26" viewBox="0 0 28 26" fill="none">
          <path d="M14 23S3 15.5 3 8.5A5.5 5.5 0 0114 5.2 5.5 5.5 0 0125 8.5C25 15.5 14 23 14 23z" fill="#F47B66" stroke="#C94930" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="float-c absolute pointer-events-none" style={{ right: 22, top: 200 }}>
        <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
          <path d="M10 16S2 10.5 2 5.8A4 4 0 0110 3.4 4 4 0 0118 5.8C18 10.5 10 16 10 16z" fill="#FFD6C9" stroke="#F47B66" strokeWidth="1.2"/>
        </svg>
      </div>

      {/* Cloud */}
      <div className="cloud-drift absolute pointer-events-none" style={{ right: 10, top: 130 }}>
        <svg width="64" height="36" viewBox="0 0 64 36" fill="none">
          <ellipse cx="32" cy="26" rx="28" ry="10" fill="white" fillOpacity="0.9"/>
          <ellipse cx="22" cy="22" rx="14" ry="12" fill="white" fillOpacity="0.9"/>
          <ellipse cx="38" cy="20" rx="16" ry="13" fill="white" fillOpacity="0.9"/>
          <ellipse cx="32" cy="26" rx="28" ry="10" stroke="#F6B6A5" strokeWidth="1"/>
          <ellipse cx="22" cy="22" rx="14" ry="12" stroke="#F6B6A5" strokeWidth="1"/>
          <ellipse cx="38" cy="20" rx="16" ry="13" stroke="#F6B6A5" strokeWidth="1"/>
        </svg>
      </div>
      <div className="cloud-drift absolute pointer-events-none" style={{ left: 5, top: 280, animationDelay: '2s', opacity: 0.7 }}>
        <svg width="48" height="28" viewBox="0 0 48 28" fill="none">
          <ellipse cx="24" cy="20" rx="20" ry="8" fill="white" fillOpacity="0.85"/>
          <ellipse cx="16" cy="16" rx="10" ry="9" fill="white" fillOpacity="0.85"/>
          <ellipse cx="28" cy="14" rx="12" ry="10" fill="white" fillOpacity="0.85"/>
        </svg>
      </div>

      {/* Baby bottle */}
      <div className="float-b absolute pointer-events-none" style={{ right: 26, top: 320 }}>
        <svg width="32" height="44" viewBox="0 0 32 44" fill="none">
          <rect x="10" y="0" width="12" height="6" rx="3" fill="#F6B6A5" stroke="#EE674E" strokeWidth="1.5"/>
          <rect x="8" y="6" width="16" height="34" rx="8" fill="#FFF8F4" stroke="#F6B6A5" strokeWidth="2"/>
          <rect x="10" y="10" width="6" height="2" rx="1" fill="#6299D5" opacity="0.4"/>
          <rect x="10" y="14" width="6" height="2" rx="1" fill="#6299D5" opacity="0.4"/>
          <rect x="10" y="18" width="6" height="2" rx="1" fill="#6299D5" opacity="0.4"/>
          <ellipse cx="16" cy="32" rx="4" ry="5" fill="#FFD6C9" opacity="0.6"/>
        </svg>
      </div>

      {/* Spinning ring */}
      <div className="spin-slow absolute pointer-events-none" style={{ left: 12, top: 380, opacity: 0.35 }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="18" stroke="#EE674E" strokeWidth="2.5" strokeDasharray="6 5"/>
        </svg>
      </div>
    </>
  )

  // ── Illustration (mama + baby) ─────────────────────────────────────────────
  const Illustration = () => (
    <div className="pop-in relative flex justify-center flex-shrink-0" style={{ height: 190, width: '100%' }}>
      {/* Background circle */}
      <div className="absolute rounded-full"
        style={{ width: 148, height: 148, background: 'linear-gradient(135deg, #FFD6C9 0%, #FFF8F4 100%)', border: '3px dashed #F6B6A5', top: 14, left: '50%', transform: 'translateX(-50%)' }} />

      {/* Mama body */}
      <svg width="180" height="185" viewBox="0 0 180 170" fill="none" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}>
        {/* Dress */}
        <path d="M70 95 Q60 130 55 155 Q90 165 125 155 Q120 130 110 95 Q100 88 90 88 Q80 88 70 95z" fill="#EE674E"/>
        <path d="M70 95 Q60 130 55 155 Q90 165 125 155 Q120 130 110 95z" fill="#EE674E"/>
        {/* Dress pattern dots */}
        <circle cx="78" cy="115" r="3" fill="#FFD6C9" opacity="0.6"/>
        <circle cx="95" cy="125" r="3" fill="#FFD6C9" opacity="0.6"/>
        <circle cx="108" cy="112" r="3" fill="#FFD6C9" opacity="0.6"/>
        <circle cx="85" cy="138" r="3" fill="#FFD6C9" opacity="0.6"/>
        {/* Arms */}
        <path d="M70 98 Q48 108 44 125 Q50 128 56 118 Q62 108 72 104z" fill="#F6B6A5"/>
        <path d="M110 98 Q132 108 136 125 Q130 128 124 118 Q118 108 108 104z" fill="#F6B6A5"/>
        {/* Neck */}
        <rect x="85" y="76" width="10" height="14" rx="5" fill="#F6B6A5"/>
        {/* Head */}
        <ellipse cx="90" cy="62" rx="26" ry="28" fill="#F6B6A5"/>
        {/* Hair */}
        <path d="M64 52 Q66 28 90 26 Q114 28 116 52 Q112 36 90 35 Q68 36 64 52z" fill="#C97B4B"/>
        <path d="M64 52 Q58 70 66 80 Q62 60 67 50z" fill="#C97B4B"/>
        <path d="M116 52 Q122 70 114 80 Q118 60 113 50z" fill="#C97B4B"/>
        {/* Hair bun */}
        <circle cx="90" cy="32" r="10" fill="#C97B4B"/>
        <circle cx="84" cy="29" r="4" fill="#B56A3A"/>
        {/* Eyes */}
        <ellipse cx="81" cy="62" rx="5" ry="6" fill="white"/>
        <ellipse cx="99" cy="62" rx="5" ry="6" fill="white"/>
        <circle cx="82" cy="63" r="3" fill="#3D2A1E"/>
        <circle cx="100" cy="63" r="3" fill="#3D2A1E"/>
        <circle cx="83" cy="61" r="1" fill="white"/>
        <circle cx="101" cy="61" r="1" fill="white"/>
        {/* Smile */}
        <path d="M83 74 Q90 80 97 74" stroke="#C94930" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Cheeks */}
        <ellipse cx="74" cy="71" rx="6" ry="4" fill="#F47B66" opacity="0.4"/>
        <ellipse cx="106" cy="71" rx="6" ry="4" fill="#F47B66" opacity="0.4"/>
        {/* Baby held in arms */}
        <ellipse cx="50" cy="118" rx="14" ry="12" fill="#FFD6C9" stroke="#F6B6A5" strokeWidth="1.5"/>
        <ellipse cx="50" cy="113" rx="9" ry="9" fill="#F6B6A5"/>
        {/* Baby eyes */}
        <circle cx="47" cy="112" r="2" fill="#3D2A1E"/>
        <circle cx="53" cy="112" r="2" fill="#3D2A1E"/>
        <circle cx="47.8" cy="111.2" r="0.6" fill="white"/>
        <circle cx="53.8" cy="111.2" r="0.6" fill="white"/>
        {/* Baby smile */}
        <path d="M46 116 Q50 119 54 116" stroke="#C94930" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        {/* Baby blanket */}
        <path d="M36 122 Q50 130 66 122 Q62 134 50 136 Q38 134 36 122z" fill="#6299D5" opacity="0.7"/>
      </svg>
    </div>
  )

  // ── Landing view ──────────────────────────────────────────────────────────
  if (mode === 'landing') return (
    <div className="relative flex flex-col" style={{ width: '100%', height: '100%', background: 'linear-gradient(175deg, #FFF3EE 0%, #FFD6C9 45%, #FFF8F4 100%)', overflow: 'hidden' }}>
      <Decorations />

      {/* Full-height flex column — illustration gets top half, content gets bottom half */}
      <div className="relative z-10 flex flex-col" style={{ height: '100%' }}>

        {/* ── TOP HALF: logo + illustration ── */}
        <div className="flex flex-col items-center justify-end" style={{ height: 340, paddingBottom: 16 }}>
          {/* Logo badge */}
          <div className="pop-in flex items-center gap-2 px-5 py-2 rounded-full mb-5"
            style={{ background: 'rgba(255,255,255,0.88)', border: '2px solid #F6B6A5', boxShadow: '0 3px 0 #F6B6A5' }}>
            <span className="text-base">✨</span>
            <span className="font-display text-[#EE674E] text-sm tracking-wide">MomMind AI</span>
          </div>

          {/* Illustration — big, centred in top half */}
          <div className="pop-in relative flex justify-center" style={{ width: 220, height: 210 }}>
            <div className="absolute rounded-full"
              style={{ width: 170, height: 170, background: 'linear-gradient(135deg,#FFD6C9,#FFF8F4)', border: '2.5px dashed #F6B6A5', top: 16, left: '50%', transform: 'translateX(-50%)' }} />
            <svg width="220" height="210" viewBox="0 0 180 170" fill="none" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}>
              <path d="M70 95 Q60 130 55 155 Q90 165 125 155 Q120 130 110 95 Q100 88 90 88 Q80 88 70 95z" fill="#EE674E"/>
              <circle cx="78" cy="115" r="3" fill="#FFD6C9" opacity="0.6"/>
              <circle cx="95" cy="125" r="3" fill="#FFD6C9" opacity="0.6"/>
              <circle cx="108" cy="112" r="3" fill="#FFD6C9" opacity="0.6"/>
              <path d="M70 98 Q48 108 44 125 Q50 128 56 118 Q62 108 72 104z" fill="#F6B6A5"/>
              <path d="M110 98 Q132 108 136 125 Q130 128 124 118 Q118 108 108 104z" fill="#F6B6A5"/>
              <rect x="85" y="76" width="10" height="14" rx="5" fill="#F6B6A5"/>
              <ellipse cx="90" cy="62" rx="26" ry="28" fill="#F6B6A5"/>
              <path d="M64 52 Q66 28 90 26 Q114 28 116 52 Q112 36 90 35 Q68 36 64 52z" fill="#C97B4B"/>
              <path d="M64 52 Q58 70 66 80 Q62 60 67 50z" fill="#C97B4B"/>
              <path d="M116 52 Q122 70 114 80 Q118 60 113 50z" fill="#C97B4B"/>
              <circle cx="90" cy="32" r="10" fill="#C97B4B"/>
              <circle cx="84" cy="29" r="4" fill="#B56A3A"/>
              <ellipse cx="81" cy="62" rx="5" ry="6" fill="white"/>
              <ellipse cx="99" cy="62" rx="5" ry="6" fill="white"/>
              <circle cx="82" cy="63" r="3" fill="#3D2A1E"/>
              <circle cx="100" cy="63" r="3" fill="#3D2A1E"/>
              <circle cx="83" cy="61" r="1" fill="white"/>
              <circle cx="101" cy="61" r="1" fill="white"/>
              <path d="M83 74 Q90 80 97 74" stroke="#C94930" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <ellipse cx="74" cy="71" rx="6" ry="4" fill="#F47B66" opacity="0.4"/>
              <ellipse cx="106" cy="71" rx="6" ry="4" fill="#F47B66" opacity="0.4"/>
              <ellipse cx="50" cy="118" rx="14" ry="12" fill="#FFD6C9" stroke="#F6B6A5" strokeWidth="1.5"/>
              <ellipse cx="50" cy="113" rx="9" ry="9" fill="#F6B6A5"/>
              <circle cx="47" cy="112" r="2" fill="#3D2A1E"/>
              <circle cx="53" cy="112" r="2" fill="#3D2A1E"/>
              <path d="M46 116 Q50 119 54 116" stroke="#C94930" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
              <path d="M36 122 Q50 130 66 122 Q62 134 50 136 Q38 134 36 122z" fill="#6299D5" opacity="0.7"/>
            </svg>
          </div>
        </div>

        {/* ── BOTTOM HALF: all text + buttons — justified to fill remaining space ── */}
        <div className="flex flex-col justify-between px-5" style={{ flex: 1, paddingBottom: 24, paddingTop: 4 }}>

          {/* Headline */}
          <div className="bounce-in text-center" style={{ animationDelay: '0.15s' }}>
            <h1 className="font-display text-[27px] text-[#242424] leading-snug">
              Your baby's{' '}
              <span style={{ color: '#EE674E', WebkitTextStroke: '0.5px #C94930' }}>best friend</span>
              {' '}is waiting! 🌟
            </h1>
            <p className="text-[13px] text-[#6E6E73] mt-1.5 leading-relaxed">
              Track, predict, and enjoy every precious moment.
            </p>
          </div>

          {/* Trial badge */}
          <div className="bounce-in flex justify-center" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: '#FEF3CD', border: '2px solid #F8C85E' }}>
              <span className="text-xs">⏰</span>
              <span className="text-xs font-bold text-[#B8860B]">7-Day Free Trial · Then {plusPrice}/mo</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="bounce-in space-y-2.5" style={{ animationDelay: '0.28s' }}>
            <button onClick={() => setMode('signup')}
              className="cartoon-btn w-full py-3.5 rounded-2xl text-white font-bold text-[15px]"
              style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2.5px solid #C94930', boxShadow: '0 5px 0 #C94930' }}>
              Start My Free Trial 🍼
            </button>
            <button onClick={() => setMode('signin')}
              className="cartoon-btn w-full py-3.5 rounded-2xl font-bold text-[15px]"
              style={{ background: '#FFF8F4', border: '2.5px solid #F6B6A5', boxShadow: '0 5px 0 #F6B6A5', color: '#EE674E' }}>
              I already have an account
            </button>
          </div>

          {/* Credit card note */}
          <div className="bounce-in" style={{ animationDelay: '0.34s' }}>
            <div className="rounded-2xl px-4 py-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.78)', border: '1.5px dashed #F6B6A5' }}>
              <p className="text-[11.5px] text-[#555] leading-relaxed">
                💳 <span className="font-semibold text-[#242424]">Credit card required.</span>{' '}
                No charge today — auto-renews at{' '}
                <span className="font-semibold text-[#EE674E]">{plusPrice}/mo</span> after 7 days unless cancelled.
              </p>
            </div>
          </div>

          {/* Social login */}
          <div className="bounce-in" style={{ animationDelay: '0.38s' }}>
            <div className="flex items-center gap-3 mb-2.5">
              <div className="flex-1 h-px bg-[#F6B6A5]" />
              <span className="text-xs text-[#6E6E73] font-medium">or continue with</span>
              <div className="flex-1 h-px bg-[#F6B6A5]" />
            </div>
            <div className="flex gap-2.5">
              {[
                { label: 'Google', icon: <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg> },
                { label: 'Apple', icon: <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M14.5 9.5c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.7-2.8-.7C5.8 4.8 4 6 3 7.8c-2 3.4-.5 8.5 1.4 11.2.9 1.4 2 2.9 3.5 2.8 1.4-.1 1.9-.9 3.6-.9 1.7 0 2.1.9 3.6.8 1.5 0 2.5-1.4 3.4-2.7.5-.8.9-1.6 1.1-2.4-2.8-1-4.7-3.8-4.1-7z" fill="#242424"/><path d="M12.4 3c.8-1 1.3-2.3 1.1-3.7-1.1.1-2.4.8-3.2 1.7-.7.8-1.3 2.1-1.1 3.4 1.2.1 2.4-.6 3.2-1.4z" fill="#242424"/></svg> },
                { label: 'Facebook', icon: <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="#1877F2"/><path d="M11.8 9H10v6H7.5V9H6V6.9h1.5V5.6c0-1.8.8-2.6 2.5-2.6H11.5v2.1H10.5c-.6 0-.5.3-.5.7V6.9h2l-.2 2.1z" fill="white"/></svg> },
              ].map(s => (
                <button key={s.label} className="cartoon-btn flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium text-[13px] text-[#242424]"
                  style={{ background: '#FFF8F4', border: '2px solid #F6B6A5', boxShadow: '0 3px 0 #F6B6A5' }}>
                  {s.icon}{s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Terms — pinned at very bottom, always fully visible */}
          <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(246,182,165,0.7)' }}>
            <p className="text-[11.5px] text-[#3A3A3A] text-center leading-relaxed">
              By continuing you agree to our{' '}
              <span className="text-[#EE674E] font-bold underline underline-offset-2">Terms</span>,{' '}
              <span className="text-[#EE674E] font-bold underline underline-offset-2">Privacy Policy</span> &{' '}
              <span className="text-[#EE674E] font-bold underline underline-offset-2">Subscription Terms</span>.
              {' '}Cancel before day 7 to avoid charges.
            </p>
          </div>

        </div>
      </div>
    </div>
  )

  // ── Sign In / Sign Up view ────────────────────────────────────────────────
  if (mode === 'signin' || mode === 'signup') {
  const isSignup = mode === 'signup'
  return (
    <div className="relative flex flex-col overflow-hidden" style={{ width: '100%', height: '100%', background: 'linear-gradient(175deg, #FFF3EE 0%, #FFD6C9 30%, #FFF8F4 100%)' }}>
      <Decorations />

      <div className="relative z-10 flex flex-col h-full px-6">
        {/* Back */}
        <button onClick={() => setMode('landing')} className="mt-14 w-10 h-10 rounded-2xl flex items-center justify-center self-start"
          style={{ background: '#FFF8F4', border: '2px solid #F6B6A5', boxShadow: '0 3px 0 #F6B6A5' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#EE674E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Mini illustration */}
        <div className="flex justify-center mt-4">
          <div className="pop-in relative">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFD6C9, #FFF8F4)', border: '2.5px dashed #F6B6A5' }}>
              <span className="text-5xl">{isSignup ? '🍼' : '👋'}</span>
            </div>
            {/* Sparkles */}
            <div className="star-twinkle absolute -top-2 -right-2">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1l1.8 5h5.2l-4.2 3 1.6 5L9 11.2 4.6 14l1.6-5L2 6h5.2z" fill="#F8C85E" stroke="#F4A800" strokeWidth="0.6"/>
              </svg>
            </div>
            <div className="star-twinkle absolute -bottom-1 -left-2" style={{ animationDelay: '0.7s' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1l1.4 3.8h4l-3.2 2.3 1.2 3.8L7 8.8l-3.4 2.1 1.2-3.8L1.6 4.8h4z" fill="#F47B66" stroke="#C94930" strokeWidth="0.5"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="bounce-in text-center mt-4" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-display text-2xl text-[#242424]">
            {isSignup ? 'Create your account! 🌸' : 'Welcome back! 🌟'}
          </h2>
          <p className="text-sm text-[#6E6E73] mt-1">
            {isSignup ? 'Step 1 of 2 — your details' : 'Maya is waiting for you'}
          </p>
          {isSignup && (
            <div className="flex justify-center gap-2 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full coral-gradient flex items-center justify-center text-white text-[10px] font-bold">1</div>
                <span className="text-[11px] font-semibold text-[#EE674E]">Account</span>
              </div>
              <div className="w-8 h-px bg-[#F6B6A5] self-center" />
              <div className="flex items-center gap-1.5 opacity-40">
                <div className="w-6 h-6 rounded-full border-2 border-[#F6B6A5] flex items-center justify-center text-[#6E6E73] text-[10px] font-bold">2</div>
                <span className="text-[11px] font-semibold text-[#6E6E73]">Payment</span>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bounce-in mt-6 space-y-3.5" style={{ animationDelay: '0.2s' }}>
          {isSignup && (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">👤</span>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="cartoon-input w-full pl-11 pr-4 py-4 text-sm font-medium text-[#242424] placeholder-[#C0B8B4]"
              />
            </div>
          )}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">📧</span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="cartoon-input w-full pl-11 pr-4 py-4 text-sm font-medium text-[#242424] placeholder-[#C0B8B4]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔒</span>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder={isSignup ? 'Create a password' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="cartoon-input w-full pl-11 pr-12 py-4 text-sm font-medium text-[#242424] placeholder-[#C0B8B4]"
            />
            <button onClick={() => setShowPass(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-base">
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>

          {!isSignup && (
            <div className="text-right">
              <button className="text-xs font-semibold text-[#EE674E] underline underline-offset-2">
                Forgot password?
              </button>
            </div>
          )}

          {authError && (
            <div className="rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#C94930]" style={{ background: '#FEEAE6', border: '1.5px solid #F6B6A5' }}>
              ⚠️ {authError}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={submit}
            disabled={loading}
            className="cartoon-btn w-full py-4 rounded-2xl text-white font-bold text-base mt-2 flex items-center justify-center gap-2"
            style={{
              background: loading ? '#F6B6A5' : 'linear-gradient(135deg, #EE674E, #F47B66)',
              border: `2.5px solid ${loading ? '#E8A090' : '#C94930'}`,
              boxShadow: loading ? '0 2px 0 #E8A090' : '0 6px 0 #C94930',
            }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white spin-slow" />
                {isSignup ? 'Creating your account…' : 'Signing in…'}
              </>
            ) : (
              isSignup ? 'Next — Add Payment 💳' : 'Sign In ✨'
            )}
          </button>
        </div>

        {/* Switch mode */}
        <div className="bounce-in text-center mt-5" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-[#6E6E73]">
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => setMode(isSignup ? 'signin' : 'signup')}
              className="font-bold text-[#EE674E] underline underline-offset-2">
              {isSignup ? 'Sign In' : 'Sign Up Free'}
            </button>
          </p>
        </div>

        {/* Bottom decoration strip */}
        <div className="mt-auto pb-10 flex justify-center gap-3 opacity-50">
          {['🍼', '🌙', '⭐', '🧸', '💕', '🌸'].map((e, i) => (
            <span key={i} className="text-xl" style={{ animationDelay: `${i * 0.15}s` }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  )

  } // end signin/signup

  // ── Payment / Trial confirmation view ─────────────────────────────────────
  if (mode === 'payment') return (
    <div className="relative flex flex-col overflow-hidden" style={{ width: '100%', height: '100%', background: 'linear-gradient(175deg, #FFF3EE 0%, #FFD6C9 30%, #FFF8F4 100%)' }}>
      <Decorations />
      <div className="relative z-10 flex flex-col h-full px-6">
        {/* Back */}
        <button onClick={() => setMode('signup')} className="mt-14 w-10 h-10 rounded-2xl flex items-center justify-center self-start"
          style={{ background: '#FFF8F4', border: '2px solid #F6B6A5', boxShadow: '0 3px 0 #F6B6A5' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#EE674E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Step indicator */}
        <div className="bounce-in flex justify-center gap-2 mt-4" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-1.5 opacity-40">
            <div className="w-6 h-6 rounded-full bg-[#55A67A] flex items-center justify-center text-white text-[10px] font-bold">✓</div>
            <span className="text-[11px] font-semibold text-[#55A67A]">Account</span>
          </div>
          <div className="w-8 h-px bg-[#F6B6A5] self-center" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full coral-gradient flex items-center justify-center text-white text-[10px] font-bold">2</div>
            <span className="text-[11px] font-semibold text-[#EE674E]">Payment</span>
          </div>
        </div>

        {/* Title */}
        <div className="pop-in text-center mt-5" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
              style={{ background: 'linear-gradient(135deg, #FFD6C9, #FFF8F4)', border: '2.5px dashed #F6B6A5' }}>
              💳
            </div>
          </div>
          <h2 className="font-display text-2xl text-[#242424]">Start your free trial 🎉</h2>
          <p className="text-sm text-[#6E6E73] mt-1 leading-relaxed">
            No charge today. Cancel anytime<br />before day 7 and pay nothing.
          </p>
        </div>

        {/* Trial summary card */}
        <div className="bounce-in mt-4" style={{ animationDelay: '0.18s' }}>
          <div className="rounded-2xl overflow-hidden" style={{ border: '2.5px solid #F6B6A5' }}>
            <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #FFF3EE, #FFD6C9)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <div>
                    <p className="font-bold text-sm text-[#242424]">MomMind Plus</p>
                    <p className="text-[11px] text-[#6E6E73]">Full access · All features</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#EE674E] text-sm">FREE</p>
                  <p className="text-[10px] text-[#6E6E73]">for 7 days</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 px-4 divide-y divide-[#F6EDE8]">
              {[
                { icon: '✅', text: 'Today — Trial starts', right: '$0.00' },
                { icon: '📅', text: 'Day 7 — Auto-renews', right: `${plusPrice}/mo`, warn: true },
                { icon: '❌', text: 'Cancel before day 7', right: 'No charge' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 gap-3">
                  <span className="text-sm flex-shrink-0">{row.icon}</span>
                  <span className="text-xs text-[#6E6E73] flex-1">{row.text}</span>
                  <span className={`text-xs font-bold flex-shrink-0 ${row.warn ? 'text-[#EE674E]' : 'text-[#55A67A]'}`}>{row.right}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card fields */}
        <div className="bounce-in mt-4 space-y-3" style={{ animationDelay: '0.24s' }}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">💳</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Card number"
              value={cardNumber}
              onChange={e => setCardNumber(formatCard(e.target.value))}
              className="cartoon-input w-full pl-11 pr-4 py-4 text-sm font-medium text-[#242424] placeholder-[#C0B8B4] tracking-wider"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                className="cartoon-input w-full px-4 py-4 text-sm font-medium text-[#242424] placeholder-[#C0B8B4]"
              />
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                placeholder="CVC"
                value={cardCvc}
                onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="cartoon-input w-full px-4 py-4 text-sm font-medium text-[#242424] placeholder-[#C0B8B4]"
              />
            </div>
          </div>

          {/* Secure badge */}
          <div className="flex items-center justify-center gap-1.5">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M6 1L1 3v4c0 3 2.3 5.5 5 6 2.7-.5 5-3 5-6V3L6 1z" fill="#55A67A" fillOpacity="0.2" stroke="#55A67A" strokeWidth="1.2"/><path d="M3.5 7l1.8 1.8L8.5 5.5" stroke="#55A67A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-[10px] text-[#55A67A] font-semibold">256-bit SSL · Secured by Stripe</span>
          </div>

          {/* No real processor is connected yet (FEATURES.realPayments=false,
             docs/ARCHITECTURE.md §9) -- these fields aren't validated or sent
             anywhere, so Continue already works with them empty. This button
             just fills Stripe's own public test-card number for anyone who
             wants the screen to look complete while testing. Remove this
             block entirely once real Stripe Elements replaces these inputs. */}
          <button
            type="button"
            onClick={() => { setCardNumber('4242 4242 4242 4242'); setCardExpiry('12/34'); setCardCvc('123') }}
            className="action-btn w-full text-center text-[11px] font-semibold text-[#EE674E] underline underline-offset-2"
          >
            Fill test card (testing only — no real charge, nothing is sent anywhere)
          </button>

          {/* Start trial button */}
          <button
            onClick={submit}
            disabled={loading}
            className="cartoon-btn w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
            style={{
              background: loading ? '#F6B6A5' : 'linear-gradient(135deg, #EE674E, #F47B66)',
              border: `2.5px solid ${loading ? '#E8A090' : '#C94930'}`,
              boxShadow: loading ? '0 2px 0 #E8A090' : '0 6px 0 #C94930',
            }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white spin-slow" />
                Activating trial…
              </>
            ) : needsConfirmation ? (
              'Continue →'
            ) : (
              'Start My Free Trial 🎉'
            )}
          </button>
        </div>

        {/* Fine print */}
        <p className="text-[10px] text-[#6E6E73] text-center mt-3 leading-relaxed px-2">
          By starting your trial you authorise MomMind to charge{' '}
          <span className="font-semibold text-[#242424]">{plusPrice}/month</span> automatically after your 7-day free trial
          unless you cancel before the trial period ends. You can cancel anytime in{' '}
          <span className="text-[#EE674E]">Settings → Subscription</span>.
        </p>

        <div className="mt-auto pb-8 flex justify-center gap-3 opacity-40">
          {['🔒', '💳', '✨', '🍼', '💕'].map((e, i) => (
            <span key={i} className="text-lg">{e}</span>
          ))}
        </div>
      </div>
    </div>
  )

  // Reached after a real signUp() when Supabase requires email confirmation
  // before a session exists — see docs/PROJECT_REPORT.md §10 Phase 1. The
  // account genuinely exists at this point; we just can't call onLogin()
  // honestly until they've confirmed, so this screen says so instead of
  // faking success.
  if (mode === 'confirm-email') return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden px-6 text-center" style={{ width: '100%', height: '100%', background: 'linear-gradient(175deg, #FFF3EE 0%, #FFD6C9 30%, #FFF8F4 100%)' }}>
      <Decorations />
      <div className="relative z-10">
        <div className="pop-in w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #FFD6C9, #FFF8F4)', border: '2.5px dashed #F6B6A5' }}>
          📬
        </div>
        <h2 className="font-display text-2xl text-[#242424] mb-2">Check your email</h2>
        <p className="text-sm text-[#6E6E73] leading-relaxed max-w-xs">
          We sent a confirmation link to <span className="font-semibold text-[#242424]">{email}</span>. Click it, then come back and sign in — your account is ready and waiting.
        </p>
        <button onClick={() => { setMode('signin'); setPassword('') }}
          className="cartoon-btn mt-6 px-6 py-3 rounded-2xl font-bold text-sm"
          style={{ background: '#FFF8F4', border: '2.5px solid #F6B6A5', boxShadow: '0 4px 0 #F6B6A5', color: '#EE674E' }}>
          Back to Sign In
        </button>
      </div>
    </div>
  )

  return null
}
