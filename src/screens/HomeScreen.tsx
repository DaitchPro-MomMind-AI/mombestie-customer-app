import { useState, useEffect } from 'react'
import { useLang } from '../i18n'
import { Avatar, StatCard, QuickAction } from '../components/atoms'
import type { Screen } from '../types'
import { DEMO_CHILD_ID, buildTimeline, useTrackingLogs } from '../services'
import type { NewTrackingLog } from '../services'

function LogSheet({ activeLog, onClose, onSave }: { activeLog: string; onClose: () => void; onSave: (input: Omit<NewTrackingLog, 'childId'>) => void }) {
  const [saved, setSaved] = useState(false)
  const [amount, setAmount] = useState(5)
  const [feedMethod, setFeedMethod] = useState<'Bottle' | 'Breast' | 'Formula'>('Bottle')
  const [diaperType, setDiaperType] = useState<'Wet' | 'Dirty' | 'Mixed'>('Wet')
  const [sleepActive, setSleepActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [mealFoods, setMealFoods] = useState<string[]>([])
  const [customFood, setCustomFood] = useState('')
  const [growth, setGrowth] = useState<{ heightCm?: number; weightKg?: number; headCm?: number }>({})
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!sleepActive) return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [sleepActive])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  const toggleFood = (f: string) => setMealFoods(fs => fs.includes(f) ? fs.filter(x => x !== f) : [...fs, f])

  const handleSave = () => {
    const notesField = notes || undefined
    switch (activeLog) {
      case 'Feed':
        onSave({ type: 'Feed', notes: notesField, feed: { amountOz: amount, method: feedMethod } })
        break
      case 'Sleep':
        onSave({ type: 'Sleep', notes: notesField, sleep: { durationSec: elapsed } })
        break
      case 'Diaper':
        onSave({ type: 'Diaper', notes: notesField, diaper: { kind: diaperType } })
        break
      case 'Meal':
        onSave({ type: 'Meal', notes: notesField, meal: { foods: customFood.trim() ? [...mealFoods, customFood.trim()] : mealFoods } })
        break
      case 'Growth':
        onSave({ type: 'Growth', notes: notesField, growth })
        break
      default:
        // Medicine / Appointment / Activity / Vaccine / Temperature aren't
        // modeled by the Tracking Service yet — close rather than pretend
        // to persist them with a false "Saved" state.
        onClose()
        return
    }
    setSaved(true)
    setTimeout(onClose, 900)
  }

  const configs: Record<string, { icon: string; color: string; bg: string }> = {
    Feed:   { icon: '🍼', color: '#6299D5', bg: '#EBF2FC' },
    Sleep:  { icon: '🌙', color: '#B0A0F0', bg: '#F0EEF9' },
    Diaper: { icon: '🧷', color: '#F47B66', bg: '#FEEAE6' },
    Meal:   { icon: '🥣', color: '#55A67A', bg: '#E6F4ED' },
    Growth: { icon: '📏', color: '#F8C85E', bg: '#FEF7E0' },
  }
  const cfg = configs[activeLog] ?? { icon: '📋', color: '#EE674E', bg: '#FFD6C9' }

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 rounded-t-3xl px-5 pt-5 pb-8"
        style={{ background: '#FFFCFA', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}>

        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: cfg.bg }}>
              {cfg.icon}
            </div>
            <div>
              <p className="font-display text-lg text-[#242424]">Log {activeLog}</p>
              <p className="text-xs text-[#6E6E73]">Maya · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F0E8E4] flex items-center justify-center text-[#6E6E73] text-sm font-bold">✕</button>
        </div>

        {/* Feed */}
        {activeLog === 'Feed' && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide">Amount (oz)</p>
            <div className="flex items-center justify-between gap-4">
              <button onClick={() => setAmount(a => Math.max(1, a - 1))}
                className="action-btn w-12 h-12 rounded-2xl text-xl font-bold text-[#EE674E] flex items-center justify-center"
                style={{ background: '#FFD6C9', border: '2px solid #F6B6A5', boxShadow: '0 3px 0 #F6B6A5' }}>−</button>
              <div className="flex-1 text-center">
                <span className="font-display text-5xl text-[#242424]">{amount}</span>
                <span className="text-lg text-[#6E6E73] ml-1">oz</span>
              </div>
              <button onClick={() => setAmount(a => a + 1)}
                className="action-btn w-12 h-12 rounded-2xl text-xl font-bold text-[#EE674E] flex items-center justify-center"
                style={{ background: '#FFD6C9', border: '2px solid #F6B6A5', boxShadow: '0 3px 0 #F6B6A5' }}>+</button>
            </div>
            <div className="flex gap-2">
              {(['Bottle', 'Breast', 'Formula'] as const).map(t => (
                <button key={t} onClick={() => setFeedMethod(t)} className="action-btn flex-1 py-2.5 rounded-xl text-xs font-semibold"
                  style={feedMethod === t
                    ? { background: '#6299D5', border: '1.5px solid #4A7FBF', color: 'white' }
                    : { background: '#EBF2FC', border: '1.5px solid #C5D9F0', color: '#6299D5' }}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {/* Sleep */}
        {activeLog === 'Sleep' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5 text-center" style={{ background: '#F0EEF9' }}>
              <p className="text-4xl font-display text-[#242424] mb-1">{fmt(elapsed)}</p>
              <p className="text-xs text-[#6E6E73]">{sleepActive ? 'Maya is sleeping…' : 'Tap to start timer'}</p>
            </div>
            <button
              onClick={() => setSleepActive(v => !v)}
              className="action-btn w-full py-3.5 rounded-2xl font-bold text-base"
              style={sleepActive
                ? { background: '#FFD6C9', border: '2px solid #F6B6A5', color: '#C94930', boxShadow: '0 4px 0 #F6B6A5' }
                : { background: 'linear-gradient(135deg,#B0A0F0,#9080E0)', border: '2px solid #8070C0', color: 'white', boxShadow: '0 4px 0 #8070C0' }}>
              {sleepActive ? '⏹ Stop Sleep' : '▶ Start Sleep'}
            </button>
          </div>
        )}

        {/* Diaper */}
        {activeLog === 'Diaper' && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide">Type</p>
            <div className="grid grid-cols-3 gap-3">
              {(['Wet', 'Dirty', 'Mixed'] as const).map(t => (
                <button key={t} onClick={() => setDiaperType(t)}
                  className="action-btn py-4 rounded-2xl flex flex-col items-center gap-1.5 transition-all"
                  style={diaperType === t
                    ? { background: '#FEEAE6', border: '2.5px solid #F47B66', boxShadow: '0 3px 0 #F47B66' }
                    : { background: '#FFF8F4', border: '2px solid #F6B6A5' }}>
                  <span className="text-2xl">{t === 'Wet' ? '💧' : t === 'Dirty' ? '💩' : '🔄'}</span>
                  <span className="text-xs font-semibold text-[#242424]">{t}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meal */}
        {activeLog === 'Meal' && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide">What did Maya eat?</p>
            <div className="flex flex-wrap gap-2">
              {['Banana', 'Oatmeal', 'Sweet potato', 'Chicken', 'Avocado', 'Yogurt', 'Peas', 'Carrot'].map(f => (
                <button key={f} onClick={() => toggleFood(f)} className="action-btn px-3 py-1.5 rounded-full text-xs font-medium"
                  style={mealFoods.includes(f)
                    ? { background: '#55A67A', border: '1.5px solid #3D8A60', color: 'white' }
                    : { background: '#E6F4ED', border: '1.5px solid #A8D9BC', color: '#55A67A' }}>{f}</button>
              ))}
            </div>
            <input value={customFood} onChange={e => setCustomFood(e.target.value)} placeholder="Or type custom food…" className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]" />
          </div>
        )}

        {/* Growth */}
        {activeLog === 'Growth' && (
          <div className="space-y-3">
            {([
              { key: 'heightCm', label: 'Height', unit: 'cm', placeholder: '68' },
              { key: 'weightKg', label: 'Weight', unit: 'kg', placeholder: '7.2' },
              { key: 'headCm', label: 'Head', unit: 'cm', placeholder: '43' },
            ] as const).map(f => (
              <div key={f.label} className="flex items-center gap-3">
                <p className="text-sm font-medium text-[#242424] w-16">{f.label}</p>
                <div className="flex-1 relative">
                  <input type="number" placeholder={f.placeholder}
                    value={growth[f.key] ?? ''}
                    onChange={e => setGrowth(g => ({ ...g, [f.key]: e.target.value === '' ? undefined : Number(e.target.value) }))}
                    className="cartoon-input w-full px-4 py-3 pr-12 text-sm text-[#242424] placeholder-[#C0B8B4]" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6E6E73] font-medium">{f.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shared notes */}
        <div className="mt-4">
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Add a note (optional)…"
            className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]" />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="action-btn w-full mt-4 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 text-white"
          style={saved
            ? { background: '#55A67A', border: '2.5px solid #3D8A60', boxShadow: '0 4px 0 #3D8A60' }
            : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2.5px solid #C94930', boxShadow: '0 5px 0 #C94930' }}>
          {saved ? '✅ Saved!' : `Save ${activeLog} Log`}
        </button>
      </div>
    </div>
  )
}


const ALL_LOGS = [
  { icon: '🍼', label: 'Feed',         color: '#6299D5', bg: '#EBF2FC' },
  { icon: '🌙', label: 'Sleep',        color: '#B0A0F0', bg: '#F0EEF9' },
  { icon: '🧷', label: 'Diaper',       color: '#F47B66', bg: '#FEEAE6' },
  { icon: '🥣', label: 'Meal',         color: '#55A67A', bg: '#E6F4ED' },
  { icon: '📏', label: 'Growth',       color: '#F8C85E', bg: '#FEF7E0' },
  { icon: '💊', label: 'Medicine',     color: '#D9534F', bg: '#FAECEC' },
  { icon: '🏥', label: 'Appointment',  color: '#6299D5', bg: '#EBF2FC' },
  { icon: '🧸', label: 'Activity',     color: '#EE674E', bg: '#FFD6C9' },
  { icon: '💉', label: 'Vaccine',      color: '#55A67A', bg: '#E6F4ED' },
  { icon: '🌡️', label: 'Temperature', color: '#D9534F', bg: '#FAECEC' },
]


function AllLogsSheet({ onSelect, onClose }: { onSelect: (l: string) => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl px-5 pt-5 pb-8"
        style={{ background: '#FFFCFA', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}>
        <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
        <div className="flex items-center justify-between mb-5">
          <p className="font-display text-lg text-[#242424]">Log for Maya</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F0E8E4] flex items-center justify-center text-[#6E6E73] text-sm font-bold">✕</button>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {ALL_LOGS.map(item => (
            <button key={item.label}
              onClick={() => onSelect(item.label)}
              className="action-btn flex flex-col items-center gap-1.5 py-3 rounded-2xl"
              style={{ background: item.bg, border: `1.5px solid ${item.color}22` }}>
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] font-semibold text-[#242424] leading-tight text-center">{item.label}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-[#6E6E73] mt-4">Tap a category to log</p>
      </div>
    </div>
  )
}


export function HomeScreen({ onVoice, onSignOut, onNavigate }: { onVoice: () => void; onSignOut: () => void; onNavigate: (s: Screen) => void }) {
  const { t } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLog, setActiveLog] = useState<string | null>(null)
  const [showAllLogs, setShowAllLogs] = useState(false)
  const { logs, summary, save } = useTrackingLogs(DEMO_CHILD_ID)
  const homeTimeline = buildTimeline(logs)

  const openLog = (label: string) => {
    setShowAllLogs(false)
    setActiveLog(label)
  }

  return (
    <>
    <div className="scroll-area flex-1 px-4 pt-2 pb-4 space-y-4 slide-up">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-display text-2xl text-[#242424]">{t('good_morning')}, Sarah 👋</h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">Here's how Maya's day is looking.</p>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(v => !v)}>
            <Avatar size={44} initials="M" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#55A67A] rounded-full border-2 border-white" />
          </button>
          {menuOpen && (
            <>
              <div className="absolute inset-0 z-20" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-12 z-30 w-48 rounded-2xl overflow-hidden"
                style={{ background: '#FFF8F4', border: '2px solid #F6B6A5', boxShadow: '0 8px 24px rgba(238,103,78,0.15)' }}>
                <div className="px-4 py-3 border-b border-[#F6EDE8]">
                  <p className="font-semibold text-sm text-[#242424]">Sarah Mitchell</p>
                  <p className="text-xs text-[#6E6E73]">MomBestie Plus</p>
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FFF3EE]"
                  onClick={() => setMenuOpen(false)}>
                  <span className="text-base">⚙️</span>
                  <span className="text-sm text-[#242424]">Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FFF3EE] border-t border-[#F6EDE8]"
                  onClick={() => { setMenuOpen(false); onSignOut() }}>
                  <span className="text-base">🚪</span>
                  <span className="text-sm font-semibold text-[#D9534F]">Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Baby card */}
      <button onClick={() => onNavigate('baby')} className="action-btn w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left">
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FFD6C9, #F6B6A5)' }}>
          <div className="w-full h-full flex items-center justify-center text-2xl">🍼</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#242424]">Maya</p>
          <p className="text-sm text-[#6E6E73]">7 months, 12 days</p>
          <div className="flex gap-1 mt-1">
            {['Sleep', 'Feed', 'Diaper'].map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD6C9] text-[#C94930] font-medium">{t}</span>
            ))}
          </div>
        </div>
        <div className="text-[#EE674E]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </button>

      {/* AI Insight */}
      <div className="glass-card-strong rounded-3xl p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #EE674E, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 coral-gradient rounded-full flex items-center justify-center text-white text-xs">✨</div>
          <span className="text-xs font-semibold text-[#EE674E] uppercase tracking-wide">MomBestie Insight</span>
        </div>
        <p className="text-[15px] text-[#242424] leading-relaxed font-medium">
          Maya slept 9h 42m last night. Her first nap will likely fall between{' '}
          <span className="text-[#EE674E] font-semibold">9:35–10:05 AM</span>.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onNavigate('ai')}
            className="action-btn flex-1 coral-gradient text-white text-sm font-semibold py-2.5 rounded-xl">
            Ask MomBestie
          </button>
          <button
            onClick={() => onNavigate('planner')}
            className="action-btn flex-1 bg-[#FFD6C9] text-[#C94930] text-sm font-semibold py-2.5 rounded-xl">
            View Today
          </button>
        </div>
      </div>

      {/* Next Up */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#EE674E] uppercase tracking-wider">Next Up</span>
          <span className="text-[10px] text-[#6E6E73]">Based on last 7 days</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-xl text-[#242424]">Nap</p>
            <p className="text-sm text-[#6E6E73] mt-0.5">9:35–10:05 AM</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 bg-[#E8F5EE] text-[#55A67A] text-xs font-semibold px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#55A67A]" />
              High confidence
            </div>
            <p className="text-xs text-[#6E6E73] mt-1.5">About 42 minutes</p>
          </div>
        </div>
      </div>

      {/* Quick Log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-[#242424]">Quick Log</p>
          <button
            onClick={() => setShowAllLogs(true)}
            className="action-btn text-xs font-semibold text-[#EE674E] px-3 py-1 rounded-full"
            style={{ background: '#FFD6C9' }}>
            See all
          </button>
        </div>
        <div className="flex justify-between">
          {[
            { icon: '🍼', label: 'Feed' },
            { icon: '🌙', label: 'Sleep' },
            { icon: '🧷', label: 'Diaper' },
            { icon: '🥣', label: 'Meal' },
            { icon: '📏', label: 'Growth' },
          ].map(a => (
            <QuickAction key={a.label} icon={a.icon} label={a.label} onTap={() => openLog(a.label)} />
          ))}
          <QuickAction icon="➕" label="More" onTap={() => setShowAllLogs(true)} />
        </div>
      </div>

      {/* Today's Summary */}
      <div>
        <p className="font-semibold text-[#242424] mb-3">Today's Summary</p>
        <div className="grid grid-cols-5 gap-2">
          <StatCard icon="🌙" label="Sleep" value={`${Math.floor(summary.sleepMinutes / 60)}h ${summary.sleepMinutes % 60}m`} />
          <StatCard icon="🍼" label="Milk" value={`${summary.milkOz} oz`} />
          <StatCard icon="🥣" label="Meals" value={String(summary.meals)} />
          <StatCard icon="🧷" label="Diapers" value={String(summary.diapers)} />
          <StatCard icon="🎯" label="Activities" value="3" sub="not tracked yet" />
        </div>
      </div>

      {/* Timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-[#242424]">Today's Timeline</p>
          <button className="text-xs text-[#EE674E] font-medium">Full view</button>
        </div>
        <div className="glass-card rounded-2xl p-4 space-y-0">
          {homeTimeline.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="timeline-dot mt-0.5"
                  style={{
                    background: item.predicted ? 'transparent' : item.color,
                    border: item.predicted ? `2px dashed ${item.color}` : 'none',
                    opacity: item.done ? 1 : 0.6,
                  }}
                />
                {i < homeTimeline.length - 1 && (
                  <div className="w-px flex-1 my-0.5" style={{ background: 'rgba(110,110,115,0.15)', minHeight: 20 }} />
                )}
              </div>
              <div className={`pb-3 flex-1 ${i === homeTimeline.length - 1 ? 'pb-0' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-[13px] font-medium ${item.done ? 'text-[#242424]' : 'text-[#6E6E73]'}`}>
                      {item.icon} {item.label}
                    </p>
                    {item.predicted && (
                      <span className="text-[10px] text-[#B0A0F0] font-medium">Predicted</span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#6E6E73] flex-shrink-0 ml-2">{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice shortcut */}
      <button
        onClick={onVoice}
        className="action-btn w-full glass-card-strong rounded-2xl p-4 flex items-center gap-3"
      >
        <div className="w-10 h-10 coral-gradient rounded-xl flex items-center justify-center text-white text-lg">🎙️</div>
        <div className="text-left flex-1">
          <p className="font-semibold text-[#242424] text-sm">Voice Mode</p>
          <p className="text-xs text-[#6E6E73]">Tap to talk to MomBestie</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#FFD6C9] flex items-center justify-center text-[#EE674E]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-90 7 7)"/></svg>
        </div>
      </button>
    </div>

    {/* Quick Log bottom sheet */}
    {activeLog && <LogSheet activeLog={activeLog} onClose={() => setActiveLog(null)} onSave={save} />}

    {/* All Logs bottom sheet */}
    {showAllLogs && (
      <AllLogsSheet
        onSelect={label => openLog(label)}
        onClose={() => setShowAllLogs(false)}
      />
    )}
    </>
  )
}
