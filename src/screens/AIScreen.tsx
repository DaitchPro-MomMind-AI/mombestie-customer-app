import { useState, useEffect, useRef } from 'react'
import { AI_SELF_DISCLOSURE, HEALTH_DISCLAIMER, needsHealthDisclaimer } from '../services'

const chatHistory: { role: 'ai' | 'user'; text: string; disclaimer?: boolean }[] = [
  { role: 'ai', text: AI_SELF_DISCLOSURE },
]

const suggestions = [
  'How was last night?',
  'Plan our day',
  'When should Maya nap?',
  'What to cook today?',
  'Create caregiver handoff',
]

export function AIScreen({ onVoice }: { onVoice: () => void }) {
  const [messages, setMessages] = useState(chatHistory)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const aiReplies: Record<string, string> = {
    'How was last night?': 'Last night was great! Maya slept from 7:52 PM to 7:34 AM — a total of 9h 42m. That\'s 18 minutes longer than her 7-day average. No wake-ups recorded. 🌙',
    'Plan our day': 'Here\'s a suggested plan for today:\n\n9:35 AM — Nap (predicted, 60–90 min)\n11:00 AM — Bottle feed + lunch\n12:30 PM — Playtime / tummy time\n2:00 PM — Pediatric appointment\n3:30 PM — Afternoon nap\n5:30 PM — Dinner\n7:45 PM — Bedtime routine',
    'When should Maya nap?': 'Based on Maya\'s wake time at 7:10 AM and her typical wake window of 2h 20m, I\'d expect her to be ready for a nap around 9:35–10:05 AM. 82% confidence.',
    'What to cook today?': 'For Maya today I\'d suggest:\n\n🥣 Breakfast: Banana oatmeal (already had)\n🥕 Lunch: Sweet potato & chicken purée\n🥑 Dinner: Avocado pasta\n\nAll safe for 7-month-olds and quick to prepare!',
    'Create caregiver handoff': 'Creating handoff for Maya\'s evening...\n\nLast feeding: 4:20 PM — 5 oz\nLast nap: 2:05–3:22 PM\nNext feeding: ~7:15 PM\nBedtime: ~7:45 PM\nDinner: Sweet potato + chicken\n\nNote: Bottle prepared in refrigerator.\n\nShare with caregiver?',
  }

  const send = (text: string) => {
    if (!text.trim()) return
    setMessages(m => [...m, { role: 'user', text }])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      const reply = aiReplies[text] || 'I\'ll look into that for you. Based on Maya\'s recent patterns, I\'ll have a detailed answer ready in a moment!'
      // Client-side stand-in for the real AI Gateway safety classifier — see
      // docs/ARCHITECTURE.md §4.1. Flags the message so the UI can render the
      // doctor-consult disclaimer distinctly rather than burying it in the reply text.
      const disclaimer = needsHealthDisclaimer(text) || needsHealthDisclaimer(reply)
      setMessages(m => [...m, { role: 'ai', text: reply, disclaimer }])
      setThinking(false)
    }, 1200)
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  return (
    <div className="flex-1 flex flex-col slide-up overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl text-[#242424]">MomMind AI</h1>
          <p className="text-xs text-[#6E6E73]">Your parenting copilot</p>
        </div>
        <button
          onClick={onVoice}
          className="action-btn w-10 h-10 coral-gradient rounded-xl flex items-center justify-center text-white text-lg shadow-lg"
        >
          🎙️
        </button>
      </div>

      {/* AI Orb */}
      <div className="flex justify-center pt-2 pb-4">
        <div className="ai-orb ai-orb-pulse rounded-full w-16 h-16 flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
      </div>

      {/* Chat */}
      <div ref={scrollRef} className="scroll-area flex-1 px-4 pb-2 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 coral-gradient rounded-full flex items-center justify-center text-white text-xs mr-2 flex-shrink-0 mt-0.5">✨</div>
            )}
            <div className="max-w-[80%]">
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'coral-gradient text-white rounded-br-sm'
                    : 'glass-card text-[#242424] rounded-bl-sm'
                }`}
              >
                {m.text}
              </div>
              {m.disclaimer && (
                <div className="flex items-start gap-1.5 mt-1.5 px-1">
                  <span className="text-xs mt-0.5">⚕️</span>
                  <p className="text-[11px] text-[#B0806E] leading-snug">{HEALTH_DISCLAIMER}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 coral-gradient rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✨</div>
            <div className="glass-card px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#EE674E]"
                  style={{ animation: `orbPulse 1s ease-in-out infinite ${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none' }}>
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="action-btn flex-shrink-0 px-3 py-2 rounded-xl bg-[#FFD6C9] text-[#C94930] text-xs font-medium"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-1">
        <div className="glass-card rounded-2xl flex items-center gap-2 px-3 py-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask MomMind anything…"
            className="flex-1 bg-transparent text-sm text-[#242424] placeholder-[#B0A8A4] outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            className="action-btn w-8 h-8 coral-gradient rounded-xl flex items-center justify-center text-white disabled:opacity-40 flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── VOICE SCREEN ─────────────────────────────────────────────────────────────

export function VoiceScreen({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [disclaimer, setDisclaimer] = useState(false)

  useEffect(() => {
    // Spoken self-disclosure at the start of every voice session — see
    // docs/ARCHITECTURE.md §4.1. Not skippable: the assistant introduces
    // itself as AI before anything else happens.
    setState('speaking')
    setResponse(AI_SELF_DISCLOSURE)
    const t0 = setTimeout(() => {
      setResponse('')
      setState('listening')
    }, 2600)
    const t1 = setTimeout(() => {
      setTranscript('Maya just drank five ounces.')
      setState('thinking')
    }, 2600 + 2200)
    const t2 = setTimeout(() => {
      const reply = 'Got it. I logged a 5 oz bottle for Maya at 2:15 PM.'
      setDisclaimer(needsHealthDisclaimer('Maya just drank five ounces.') || needsHealthDisclaimer(reply))
      setResponse(reply)
      setState('speaking')
    }, 2600 + 3800)
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const stateLabel = { idle: 'Tap to speak', listening: 'Listening…', thinking: 'Thinking…', speaking: 'MomMind is responding' }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center"
      style={{ background: 'linear-gradient(160deg, #EE674E 0%, #F47B66 35%, #F6B6A5 70%, #FFD6C9 100%)' }}>
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="blob" style={{ width: 300, height: 300, background: 'rgba(255,255,255,0.12)', top: '5%', left: '-10%' }} />
        <div className="blob" style={{ width: 250, height: 250, background: 'rgba(255,255,255,0.08)', bottom: '20%', right: '-5%' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between w-full px-5 pt-14 pb-4">
        <div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Voice Mode</p>
          <p className="text-white font-semibold">MomMind AI</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Orb */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 px-5">
        {/* Waveform rings */}
        <div className="relative flex items-center justify-center">
          {state === 'listening' && [1, 2, 3].map(r => (
            <div key={r} className="absolute rounded-full border border-white/20"
              style={{
                width: 96 + r * 52,
                height: 96 + r * 52,
                animation: `orbPulse ${1.5 + r * 0.3}s ease-in-out infinite ${r * 0.2}s`,
              }}
            />
          ))}
          <div className="w-24 h-24 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border border-white/40 shadow-2xl"
            style={state === 'listening' ? { animation: 'orbPulse 1.2s ease-in-out infinite' } : {}}>
            <span className="text-4xl">✨</span>
          </div>
        </div>

        {/* Waveform bars */}
        {state === 'listening' && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="wave-bar"
                style={{
                  animationDuration: `${0.5 + Math.random() * 0.6}s`,
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0.7 + Math.random() * 0.3,
                }}
              />
            ))}
          </div>
        )}

        <div className="text-center">
          <p className="text-white font-semibold text-lg">{stateLabel[state]}</p>
          {transcript && (
            <div className="mt-3 bg-white/20 rounded-2xl px-4 py-2.5 max-w-xs">
              <p className="text-white/70 text-xs font-medium mb-1">You said</p>
              <p className="text-white text-sm">"{ transcript}"</p>
            </div>
          )}
          {response && (
            <div className="mt-3 bg-white/30 rounded-2xl px-4 py-2.5 max-w-xs">
              <p className="text-white/70 text-xs font-medium mb-1">MomMind AI</p>
              <p className="text-white text-sm font-medium">"{response}"</p>
              {disclaimer && (
                <p className="text-white/80 text-[11px] mt-2 leading-snug">⚕️ {HEALTH_DISCLAIMER}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center gap-5 pb-14 px-5">
        <button className="w-14 h-14 rounded-full bg-white/20 flex flex-col items-center justify-center gap-0.5 border border-white/30">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14" stroke="white" strokeWidth="1.8" strokeLinecap="round" transform="rotate(45 10 10)"/></svg>
          <span className="text-white/70 text-[9px]">Mute</span>
        </button>
        <button className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
          <div className="w-5 h-5 rounded-sm bg-[#EE674E]" />
        </button>
        <button className="w-14 h-14 rounded-full bg-white/20 flex flex-col items-center justify-center gap-0.5 border border-white/30">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="4" width="4" height="12" rx="1" fill="white"/><rect x="12" y="4" width="4" height="12" rx="1" fill="white"/></svg>
          <span className="text-white/70 text-[9px]">End</span>
        </button>
      </div>
    </div>
  )
}
