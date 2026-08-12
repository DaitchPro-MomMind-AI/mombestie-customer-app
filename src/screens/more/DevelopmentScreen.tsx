import { useState, useEffect } from 'react'
import { SubHeader } from '../../components/atoms'

const ACTIVITIES = [
  {
    icon: '🎯', name: 'Object Transfer Game', duration: '5 min', durationSec: 300,
    area: 'Fine Motor', color: '#EE674E', bg: '#FFD6C9',
    desc: 'Help Maya build hand-eye coordination by passing objects between hands.',
    steps: ['Sit Maya comfortably on your lap facing you.', 'Hold a small soft toy in front of her.', 'Gently guide her to grasp it with one hand.', 'Encourage her to pass it to the other hand.', 'Repeat 5–8 times, cheering each transfer!'],
    tip: 'Use brightly coloured objects to keep her attention.',
    benefits: ['Hand-eye coordination', 'Fine motor control', 'Focus & attention'],
  },
  {
    icon: '🪞', name: 'Mirror Play', duration: '10 min', durationSec: 600,
    area: 'Social Development', color: '#6299D5', bg: '#EBF2FC',
    desc: 'Babies love faces! Mirror play builds self-awareness and social skills.',
    steps: ['Hold a baby-safe mirror in front of Maya.', 'Make exaggerated facial expressions.', 'Name the expressions: "Happy!", "Surprised!"', 'Let her touch the mirror and explore freely.', 'Copy any faces she makes back at her.'],
    tip: 'Try this right after a nap when she is most alert.',
    benefits: ['Self-awareness', 'Emotional recognition', 'Visual tracking'],
  },
  {
    icon: '🧸', name: 'Supported Sitting Play', duration: '10 min', durationSec: 600,
    area: 'Motor Skills', color: '#55A67A', bg: '#E6F4ED',
    desc: 'Strengthen Maya\'s core and improve balance with assisted sitting.',
    steps: ['Place Maya on a flat surface with a Boppy or cushions.', 'Sit close and spot her from both sides.', 'Place interesting toys just within reach.', 'Let her shift weight to grab toys.', 'Gradually reduce support as she steadies.'],
    tip: 'Keep sessions to 5–10 minutes to avoid fatigue.',
    benefits: ['Core strength', 'Balance', 'Independent play'],
  },
  {
    icon: '🎵', name: 'Singing & Clapping', duration: '5 min', durationSec: 300,
    area: 'Language', color: '#C49B30', bg: '#FEF7E0',
    desc: 'Rhythm and repetition are the building blocks of early language.',
    steps: ['Choose a favourite nursery rhyme — "Twinkle Twinkle" works great.', 'Sing slowly with exaggerated mouth movements.', 'Clap on the beat and guide Maya\'s hands to clap too.', 'Pause and wait — she may try to vocalise!', 'Repeat 2–3 times then switch to a new song.'],
    tip: 'The more animated you are, the more engaged she will be.',
    benefits: ['Language development', 'Rhythm & music', 'Bonding'],
  },
]


function ActivitySessionSheet({ activity, onClose }: {
  activity: typeof ACTIVITIES[0]
  onClose: () => void
}) {
  const [phase, setPhase] = useState<'preview' | 'active' | 'done'>('preview')
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setElapsed(e => {
      if (e + 1 >= activity.durationSec) { setRunning(false); setPhase('done'); return activity.durationSec }
      return e + 1
    }), 1000)
    return () => clearInterval(id)
  }, [running, activity.durationSec])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`
  const pct = elapsed / activity.durationSec
  const r = 42, circ = 2 * Math.PI * r

  const startSession = () => { setPhase('active'); setRunning(true) }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={phase === 'preview' ? onClose : undefined} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '90%' }}>

        {/* Handle */}
        <div className="flex-shrink-0 px-5 pt-4">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
        </div>

        {/* ── Preview phase ── */}
        {phase === 'preview' && (
          <>
            <div className="flex-shrink-0 px-5 pb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: activity.bg }}>{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg text-[#242424] leading-tight">{activity.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#6E6E73]">⏱ {activity.duration}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: activity.bg, color: activity.color }}>{activity.area}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#6E6E73] leading-relaxed">{activity.desc}</p>
            </div>
            <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
              {/* Steps */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">How to play</p>
                <div className="space-y-3">
                  {activity.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                        style={{ background: `linear-gradient(135deg,${activity.color},${activity.color}bb)` }}>{i + 1}</div>
                      <p className="text-sm text-[#242424] leading-relaxed flex-1">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Benefits */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Benefits for Maya</p>
                <div className="flex flex-wrap gap-2">
                  {activity.benefits.map(b => (
                    <span key={b} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: activity.bg, color: activity.color }}>✓ {b}</span>
                  ))}
                </div>
              </div>
              {/* Tip */}
              <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
                <p className="text-xs text-[#7A6010]">💡 <span className="font-semibold">Tip:</span> {activity.tip}</p>
              </div>
            </div>
            <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
              <button onClick={onClose}
                className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={startSession}
                className="action-btn flex-1 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg,${activity.color},${activity.color}cc)`, border: `2px solid ${activity.color}`, boxShadow: `0 4px 0 ${activity.color}88` }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 3l9 5-9 5V3z" fill="white"/></svg>
                Start Activity
              </button>
            </div>
          </>
        )}

        {/* ── Active phase ── */}
        {phase === 'active' && (
          <div className="flex flex-col flex-1 px-5 pb-6 items-center gap-5">
            {/* Circular timer */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={r} fill="none" stroke="#F0E8E4" strokeWidth="8" />
                <circle cx="55" cy="55" r={r} fill="none" stroke={activity.color} strokeWidth="8"
                  strokeLinecap="round" strokeDasharray={circ}
                  strokeDashoffset={circ - pct * circ}
                  transform="rotate(-90 55 55)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                <text x="55" y="50" textAnchor="middle" fontSize="18" fontWeight="700" fill="#242424" fontFamily="Inter,sans-serif">
                  {fmt(activity.durationSec - elapsed)}
                </text>
                <text x="55" y="66" textAnchor="middle" fontSize="10" fill="#6E6E73" fontFamily="Inter,sans-serif">remaining</text>
              </svg>
              <p className="font-display text-base text-[#242424]">{activity.name}</p>
            </div>

            {/* Step guide */}
            <div className="w-full glass-card rounded-2xl p-4 flex-1">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Current step</p>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg,${activity.color},${activity.color}bb)` }}>{currentStep + 1}</div>
                <p className="text-sm text-[#242424] leading-relaxed flex-1">{activity.steps[currentStep]}</p>
              </div>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button onClick={() => setCurrentStep(s => s - 1)}
                    className="action-btn flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#6E6E73]"
                    style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>← Prev</button>
                )}
                {currentStep < activity.steps.length - 1 && (
                  <button onClick={() => setCurrentStep(s => s + 1)}
                    className="action-btn flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: `linear-gradient(135deg,${activity.color},${activity.color}cc)`, border: `1.5px solid ${activity.color}` }}>
                    Next Step →
                  </button>
                )}
              </div>
              {/* Step dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {activity.steps.map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{ background: i === currentStep ? activity.color : '#E0D8D4' }} />
                ))}
              </div>
            </div>

            <div className="w-full flex gap-3">
              <button onClick={() => setRunning(r => !r)}
                className="action-btn flex-1 py-3 rounded-2xl font-bold text-sm"
                style={running
                  ? { background: '#FEF7E0', border: '2px solid #F8C85E', color: '#C49B30', boxShadow: '0 3px 0 #E8C040' }
                  : { background: `linear-gradient(135deg,${activity.color},${activity.color}cc)`, border: `2px solid ${activity.color}`, color: 'white', boxShadow: `0 3px 0 ${activity.color}88` }}>
                {running ? '⏸ Pause' : '▶ Resume'}
              </button>
              <button onClick={() => { setPhase('done'); setRunning(false) }}
                className="action-btn flex-1 py-3 rounded-2xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg,#55A67A,#78C49A)', border: '2px solid #3D8A60', boxShadow: '0 3px 0 #3D8A60' }}>
                ✓ Done Early
              </button>
            </div>
          </div>
        )}

        {/* ── Done phase ── */}
        {phase === 'done' && (
          <div className="flex flex-col items-center px-5 pb-8 gap-5">
            <div className="w-20 h-20 rounded-full bg-[#E6F4ED] flex items-center justify-center text-4xl pop-in">🎉</div>
            <div className="text-center">
              <p className="font-display text-2xl text-[#242424]">Activity Complete!</p>
              <p className="text-sm text-[#6E6E73] mt-1">Great work with Maya 👶</p>
            </div>
            <div className="w-full glass-card rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1">Today's win</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activity.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#242424]">{activity.name}</p>
                  <p className="text-xs text-[#6E6E73]">{fmt(elapsed)} completed · {activity.area}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl px-4 py-3 w-full" style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5' }}>
              <p className="text-xs text-[#EE674E] font-semibold text-center">💛 Logged to Maya's development journal</p>
            </div>
            <button onClick={onClose}
              className="action-btn w-full py-3.5 rounded-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
              Back to Activities
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


const AREA_OPTIONS = [
  { label: 'Fine Motor', color: '#EE674E', bg: '#FFD6C9' },
  { label: 'Gross Motor', color: '#6299D5', bg: '#EBF2FC' },
  { label: 'Motor Skills', color: '#55A67A', bg: '#E6F4ED' },
  { label: 'Language', color: '#C49B30', bg: '#FEF7E0' },
  { label: 'Social Development', color: '#B0A0F0', bg: '#F0EEF9' },
  { label: 'Cognitive', color: '#EE674E', bg: '#FFE8F0' },
  { label: 'Sensory', color: '#55A67A', bg: '#E0F4F0' },
  { label: 'Creative', color: '#F08060', bg: '#FFE8DC' },
]
const ICON_OPTIONS = ['🎯','🪞','🧸','🎵','🎨','🧩','🏃','🎭','🌿','📚','🎪','🧶','🦋','🌈','🎲','⭐']
const DURATION_OPTIONS = ['5 min','10 min','15 min','20 min','30 min']


function AddActivitySheet({ onClose, onSave }: {
  onClose: () => void
  onSave: (activity: typeof ACTIVITIES[0]) => void
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [area, setArea] = useState(AREA_OPTIONS[0])
  const [duration, setDuration] = useState('10 min')
  const [durationSec, setDurationSec] = useState(600)
  const [desc, setDesc] = useState('')
  const [steps, setSteps] = useState([''])
  const [tip, setTip] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [step, setStep] = useState<1|2|3>(1)

  const canNext1 = name.trim().length > 0
  const canSave = steps.filter(s => s.trim()).length > 0

  const addStep = () => setSteps(s => [...s, ''])
  const updateStep = (i: number, val: string) => setSteps(s => s.map((x, idx) => idx === i ? val : x))
  const removeStep = (i: number) => setSteps(s => s.filter((_, idx) => idx !== i))

  const handleDuration = (d: string) => {
    setDuration(d)
    setDurationSec(parseInt(d) * 60)
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      const newActivity = {
        icon, name: name.trim(),
        duration, durationSec,
        area: area.label, color: area.color, bg: area.bg,
        desc: desc || `A custom activity: ${name.trim()}`,
        steps: steps.filter(s => s.trim()),
        tip: tip || 'Have fun and follow Maya\'s lead!',
        benefits: [area.label, 'Bonding', 'Play'],
      }
      setTimeout(() => { onSave(newActivity); onClose() }, 1000)
    }, 900)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={step === 1 ? onClose : undefined} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '92%' }}>

        {/* Handle + header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />

          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-4">
            {(['Basics','Steps','Review'] as const).map((label, idx) => {
              const s = idx + 1
              return (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${step > s ? 'text-white' : step === s ? 'text-white' : 'text-[#B0A8A4]'}`}
                    style={{ background: step > s ? '#55A67A' : step === s ? 'linear-gradient(135deg,#EE674E,#F47B66)' : '#F0E8E4' }}>
                    {step > s ? '✓' : s}
                  </div>
                  <span className={`text-[11px] font-semibold flex-1 ${step === s ? 'text-[#EE674E]' : step > s ? 'text-[#55A67A]' : 'text-[#B0A8A4]'}`}>{label}</span>
                  {s < 3 && <div className="w-3 h-px bg-[#F0E8E4]" />}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: area.bg }}>{icon}</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">
                {step === 1 ? 'New Activity' : step === 2 ? 'Add Steps' : 'Review & Save'}
              </h3>
              <p className="text-xs text-[#6E6E73]">
                {step === 1 ? 'Set the basics' : step === 2 ? 'How to do this activity' : 'Check everything looks good'}
              </p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">

          {/* ── Step 1: Basics ── */}
          {step === 1 && (
            <>
              {/* Name */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Activity name *</p>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Bubble Chasing"
                  className="cartoon-input w-full px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
              </div>

              {/* Icon picker */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Pick an icon</p>
                <div className="grid grid-cols-8 gap-2">
                  {ICON_OPTIONS.map(ic => (
                    <button key={ic} onClick={() => setIcon(ic)}
                      className="action-btn h-10 rounded-xl flex items-center justify-center text-xl transition-all"
                      style={icon === ic
                        ? { background: area.bg, border: `2px solid ${area.color}`, boxShadow: `0 3px 0 ${area.color}66` }
                        : { background: '#F8F4F2', border: '2px solid #F0E8E4' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Development area */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Development area</p>
                <div className="grid grid-cols-2 gap-2">
                  {AREA_OPTIONS.map(a => (
                    <button key={a.label} onClick={() => setArea(a)}
                      className="action-btn py-2.5 px-3 rounded-xl text-left transition-all"
                      style={area.label === a.label
                        ? { background: a.bg, border: `2px solid ${a.color}`, boxShadow: `0 3px 0 ${a.color}44`, color: a.color }
                        : { background: '#F8F4F2', border: '2px solid #F0E8E4', color: '#6E6E73' }}>
                      <p className="text-xs font-bold">{a.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Duration</p>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map(d => (
                    <button key={d} onClick={() => handleDuration(d)}
                      className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={duration === d
                        ? { background: '#FFD6C9', border: '2px solid #EE674E', color: '#EE674E', boxShadow: '0 3px 0 #F6B6A5' }
                        : { background: '#F0E8E4', border: '2px solid #E8E0DC', color: '#6E6E73' }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Description <span className="font-normal normal-case text-[#B0A8A4]">(optional)</span></p>
                <textarea value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="What is this activity about?"
                  rows={2} className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4] resize-none" />
              </div>
            </>
          )}

          {/* ── Step 2: Steps ── */}
          {step === 2 && (
            <>
              <p className="text-xs text-[#6E6E73]">Add step-by-step instructions to guide you through the activity.</p>
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${area.color},${area.color}bb)` }}>{i + 1}</div>
                    <input value={s} onChange={e => updateStep(i, e.target.value)}
                      placeholder={`Step ${i + 1}...`}
                      className="cartoon-input flex-1 px-3.5 py-2.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
                    {steps.length > 1 && (
                      <button onClick={() => removeStep(i)}
                        className="action-btn w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: '#FFF0EE', border: '1.5px solid #F6B6A5' }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6" stroke="#EE674E" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addStep}
                className="action-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-[#EE674E]"
                style={{ background: '#FFF3EE', border: '1.5px dashed #F6B6A5' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="#EE674E" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Add Step
              </button>

              {/* Tip */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Pro tip <span className="font-normal normal-case text-[#B0A8A4]">(optional)</span></p>
                <input value={tip} onChange={e => setTip(e.target.value)}
                  placeholder="e.g. Best done after a nap"
                  className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]" />
              </div>
            </>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            saved ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl pop-in"
                  style={{ background: area.bg }}>{icon}</div>
                <div className="text-center">
                  <p className="font-display text-xl text-[#242424]">Activity Added!</p>
                  <p className="text-sm text-[#6E6E73] mt-1">{name} is ready to play</p>
                </div>
              </div>
            ) : (
              <>
                {/* Preview card */}
                <div className="glass-card-strong rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: area.bg }}>{icon}</div>
                  <div className="flex-1">
                    <p className="font-display text-base text-[#242424]">{name || 'Untitled'}</p>
                    <p className="text-xs text-[#6E6E73]">⏱ {duration} · {area.label}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ background: area.bg, color: area.color }}>{area.label}</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="glass-card rounded-2xl p-4 space-y-3">
                  {desc && (
                    <div>
                      <p className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide mb-1">Description</p>
                      <p className="text-sm text-[#242424]">{desc}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Steps ({steps.filter(s=>s.trim()).length})</p>
                    <div className="space-y-2">
                      {steps.filter(s => s.trim()).map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: area.color }}>{i+1}</div>
                          <p className="text-sm text-[#242424] flex-1">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {tip && (
                    <div className="rounded-xl px-3 py-2" style={{ background: '#FEF3CD', border: '1px solid #F8C85E' }}>
                      <p className="text-xs text-[#7A6010]">💡 {tip}</p>
                    </div>
                  )}
                </div>
              </>
            )
          )}
        </div>

        {/* Footer */}
        {!saved && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as 1|2|3)}
                className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
            {step === 1 && (
              <button onClick={onClose}
                className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
            <button
              onClick={() => step < 3 ? setStep(s => (s + 1) as 1|2|3) : handleSave()}
              disabled={(step === 1 && !canNext1) || (step === 3 && saving)}
              className="action-btn flex-1 py-3.5 rounded-2xl font-bold text-base text-white"
              style={(step === 1 && !canNext1)
                ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
                : saving
                  ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 2px 0 #E8A090' }
                  : { background: `linear-gradient(135deg,${area.color},${area.color}cc)`, border: `2px solid ${area.color}99`, boxShadow: `0 5px 0 ${area.color}66` }}>
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />
                  Saving…
                </span>
              ) : step === 1 ? 'Next — Add Steps →'
                : step === 2 ? 'Preview Activity →'
                : '✓ Save Activity'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


export function DevelopmentSubScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'activities' | 'milestones'>('activities')
  const [activeActivity, setActiveActivity] = useState<typeof ACTIVITIES[0] | null>(null)
  const [ageMonths, setAgeMonths] = useState(7)
  const [editingAge, setEditingAge] = useState(false)
  const [customActivities, setCustomActivities] = useState<typeof ACTIVITIES>([])
  const [showAddActivity, setShowAddActivity] = useState(false)
  const allActivities = [...ACTIVITIES, ...customActivities]
  const [milestones, setMilestones] = useState([
    { icon: '😊', label: 'Social Smile', done: true, date: 'March 14' },
    { icon: '🍓', label: 'First Solid Food', done: true, date: 'May 2' },
    { icon: '🦷', label: 'First Tooth', done: true, date: 'June 18' },
    { icon: '🤸', label: 'Rolls Both Ways', done: true, date: 'July 5' },
    { icon: '🗣️', label: 'Babbling (mama/dada)', done: false, date: '' },
    { icon: '🧍', label: 'Pulls to Stand', done: false, date: '' },
  ])

  const toggleMilestone = (i: number) => {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    setMilestones(ms => ms.map((m, idx) =>
      idx === i ? { ...m, done: !m.done, date: !m.done ? today : '' } : m
    ))
  }

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Grow With Maya" onBack={onBack} />
      <div className="flex gap-1 mx-4 bg-[#F6EDE8] p-1 rounded-xl mb-1">
        {(['activities', 'milestones'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`tab-pill flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize ${tab === t ? 'bg-white text-[#EE674E] shadow-sm' : 'text-[#6E6E73]'}`}>{t}</button>
        ))}
      </div>
      <div className="scroll-area flex-1 px-4 pb-6 mt-3 space-y-3">
        {tab === 'activities' && (<>
          {/* Age header — tappable to edit */}
          <button onClick={() => setEditingAge(true)}
            className="action-btn w-full glass-card-strong rounded-2xl p-3.5 flex items-center gap-3 text-left">
            <div className="w-10 h-10 coral-gradient rounded-xl flex items-center justify-center text-xl flex-shrink-0">👶</div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[#242424]">{ageMonths} months old</p>
              <p className="text-xs text-[#6E6E73]">This week's suggested activities</p>
            </div>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="#EE674E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </button>

          {/* Age picker inline */}
          {editingAge && (
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Maya's age</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {Array.from({ length: 24 }, (_, i) => i + 1).map(m => (
                  <button key={m} onClick={() => setAgeMonths(m)}
                    className="action-btn w-10 h-10 rounded-xl text-sm font-bold"
                    style={ageMonths === m
                      ? { background: 'linear-gradient(135deg,#EE674E,#F47B66)', color: 'white', border: '2px solid #C94930', boxShadow: '0 3px 0 #C94930' }
                      : { background: '#F0E8E4', color: '#6E6E73', border: '2px solid #E8E0DC' }}>
                    {m}
                  </button>
                ))}
              </div>
              <button onClick={() => setEditingAge(false)}
                className="action-btn w-full py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 3px 0 #C94930' }}>
                Save Age ✓
              </button>
            </div>
          )}

          {/* Activity cards */}
          {allActivities.map((a, i) => {
            const isCustom = i >= ACTIVITIES.length
            return (
              <div key={i} className="glass-card rounded-2xl p-3.5 flex items-center gap-3"
                style={isCustom ? { border: '1.5px solid #F6B6A5' } : {}}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: a.bg }}>{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm text-[#242424]">{a.name}</p>
                    {isCustom && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#FFD6C9', color: '#EE674E' }}>CUSTOM</span>}
                  </div>
                  <p className="text-xs text-[#6E6E73]">⏱ {a.duration}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ background: a.bg, color: a.color }}>{a.area}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isCustom && (
                    <button onClick={() => setCustomActivities(c => c.filter((_, ci) => ci !== i - ACTIVITIES.length))}
                      className="action-btn w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: '#FFF0EE', border: '1.5px solid #F6B6A5' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2a.5.5 0 0 1 .5-.5h1A.5.5 0 0 1 7 2v1M3.5 3l.5 6.5h4L8.5 3" stroke="#EE674E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )}
                  <button onClick={() => setActiveActivity(a)}
                    className="action-btn w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg,${a.color},${a.color}cc)`, border: `2px solid ${a.color}99`, boxShadow: `0 4px 0 ${a.color}66` }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 2.5l8 4.5-8 4.5V2.5z" fill="white"/></svg>
                  </button>
                </div>
              </div>
            )
          })}

          {/* Add Activity button */}
          <button onClick={() => setShowAddActivity(true)}
            className="action-btn w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm"
            style={{ background: '#FFFCFA', border: '2px dashed #F6B6A5', color: '#EE674E' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2v6M2 5h6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            Add Your Own Activity
          </button>
        </>)}

        {tab === 'milestones' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 mb-1">
              <p className="text-xs text-[#6E6E73]">{milestones.filter(m => m.done).length} of {milestones.length} reached</p>
              <div className="flex-1 mx-3 h-1.5 rounded-full bg-[#F0E8E4] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(milestones.filter(m => m.done).length / milestones.length) * 100}%`, background: 'linear-gradient(90deg,#EE674E,#55A67A)' }} />
              </div>
              <p className="text-xs font-bold text-[#EE674E]">{Math.round((milestones.filter(m => m.done).length / milestones.length) * 100)}%</p>
            </div>

            {milestones.map((m, i) => (
              <button key={i} onClick={() => toggleMilestone(i)}
                className="action-btn w-full glass-card rounded-2xl p-3.5 flex items-center gap-3 text-left transition-all"
                style={m.done ? {} : { opacity: 0.7 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all"
                  style={{ background: m.done ? '#FFD6C9' : '#F0E8E4' }}>{m.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm transition-all ${m.done ? 'text-[#242424]' : 'text-[#6E6E73]'}`}>{m.label}</p>
                  <p className="text-xs text-[#6E6E73]">{m.done ? `Reached · ${m.date}` : 'Tap to mark as reached'}</p>
                </div>
                {/* Toggle badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={m.done
                    ? { background: '#E6F4ED', border: '2px solid #A8D9BC', boxShadow: '0 2px 0 #A8D9BC' }
                    : { background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 2px 0 #D8D0CC' }}>
                  {m.done
                    ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3L11.5 4" stroke="#55A67A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 4v6M4 7h6" stroke="#B0A8A4" strokeWidth="2" strokeLinecap="round"/></svg>
                  }
                </div>
              </button>
            ))}

            <div className="rounded-2xl px-4 py-3 mt-2" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
              <p className="text-xs text-[#7A6010]">💡 Tap any milestone to mark it reached or unmark it. Dates are recorded automatically.</p>
            </div>
          </div>
        )}
      </div>
    </div>

    {activeActivity && (
      <ActivitySessionSheet activity={activeActivity} onClose={() => setActiveActivity(null)} />
    )}
    {showAddActivity && (
      <AddActivitySheet
        onClose={() => setShowAddActivity(false)}
        onSave={a => setCustomActivities(c => [...c, a])}
      />
    )}
    </>
  )
}
