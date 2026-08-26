import { useEffect, useState } from 'react'
import { buildTimeline, useTrackingLogs, isAnyGrowthReferenceLoaded } from '../services'
import { useSelectedChild } from '../selectedChild'

function ageLabel(birthdate: string): string {
  const birth = new Date(birthdate)
  const now = new Date()
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  let days = now.getDate() - birth.getDate()
  if (days < 0) { months -= 1; days += 30 }
  if (months < 0) return ''
  return months === 0 ? `${days} day${days === 1 ? '' : 's'}` : `${months} month${months === 1 ? '' : 's'}, ${days} day${days === 1 ? '' : 's'}`
}

const kgToLb = (kg: number) => kg * 2.20462
const lbToKg = (lb: number) => lb / 2.20462
const cmToIn = (cm: number) => cm / 2.54
const inToCm = (inches: number) => inches * 2.54

export function BabyScreen() {
  const [tab, setTab] = useState<'overview' | 'timeline' | 'growth' | 'milestones'>('overview')
  const { childId, children: householdChildren, setChildId } = useSelectedChild()
  const selectedChild = householdChildren.find(c => c.id === childId)
  const { logs, summary, save } = useTrackingLogs(childId)
  const babyTimeline = buildTimeline(logs)
  const feedSessions = logs.filter(l => l.type === 'Feed').length

  const growthLogs = logs.filter(l => l.type === 'Growth').slice().sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  const latestGrowth = growthLogs[0]

  const [referenceLoaded, setReferenceLoaded] = useState(false)
  useEffect(() => { isAnyGrowthReferenceLoaded().then(setReferenceLoaded) }, [])

  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg')
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm')
  const [showGrowthForm, setShowGrowthForm] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [heightInput, setHeightInput] = useState('')
  const [headInput, setHeadInput] = useState('')

  const logGrowth = () => {
    const weightKg = weightInput ? (weightUnit === 'kg' ? parseFloat(weightInput) : lbToKg(parseFloat(weightInput))) : undefined
    const heightCm = heightInput ? (heightUnit === 'cm' ? parseFloat(heightInput) : inToCm(parseFloat(heightInput))) : undefined
    const headCm = headInput ? (heightUnit === 'cm' ? parseFloat(headInput) : inToCm(parseFloat(headInput))) : undefined
    if (weightKg == null && heightCm == null && headCm == null) return
    save({ type: 'Growth', growth: { weightKg, heightCm, headCm } })
    setWeightInput(''); setHeightInput(''); setHeadInput(''); setShowGrowthForm(false)
  }

  const displayWeight = (kg: number) => weightUnit === 'kg' ? `${kg.toFixed(1)} kg` : `${kgToLb(kg).toFixed(1)} lb`
  const displayHeight = (cm: number) => heightUnit === 'cm' ? `${cm.toFixed(1)} cm` : `${cmToIn(cm).toFixed(1)} in`

  const milestones = [
    { icon: '😊', label: 'First Smile', date: 'March 14', done: true },
    { icon: '🍓', label: 'First Solid Food', date: 'May 2', done: true },
    { icon: '🦷', label: 'First Tooth', date: 'June 18', done: true },
    { icon: '🗣️', label: 'First Word', date: 'Coming soon…', done: false },
    { icon: '🚶', label: 'First Steps', date: 'Coming soon…', done: false },
  ]

  const overviewCards = [
    { icon: '🌙', label: 'Sleep', value: `${Math.floor(summary.sleepMinutes / 60)}h ${summary.sleepMinutes % 60}m`, sub: 'Today', color: '#B0A0F0' },
    { icon: '🍼', label: 'Feeding', value: `${feedSessions} sessions`, sub: `${summary.milkOz} oz total`, color: '#6299D5' },
    { icon: '🥣', label: 'Meals', value: `${summary.meals} meals`, sub: summary.meals > 0 ? 'Logged today' : 'None yet', color: '#55A67A' },
    { icon: '🧷', label: 'Diapers', value: `${summary.diapers} changes`, sub: 'Today', color: '#F47B66' },
    {
      icon: '📏', label: 'Growth',
      value: latestGrowth?.growth ? [latestGrowth.growth.heightCm != null && displayHeight(latestGrowth.growth.heightCm), latestGrowth.growth.weightKg != null && displayWeight(latestGrowth.growth.weightKg)].filter(Boolean).join(' · ') : 'Not logged yet',
      sub: latestGrowth ? new Date(latestGrowth.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Log in Growth tab',
      color: '#F8C85E',
    },
    { icon: '🎯', label: 'Development', value: '3 activities', sub: 'This week', color: '#EE674E' },
  ]

  return (
    <div className="scroll-area flex-1 px-4 pt-2 pb-4 slide-up">
      {/* Header -- MBCST-33: real child name/age from the `children` table
          when the household has one on file, falling back to the demo
          persona name only while no real child exists yet. */}
      <div className="flex items-center gap-4 py-3 mb-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FFD6C9, #F47B66)' }}>
          🍼
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl text-[#242424]">{selectedChild?.name ?? 'Maya'}</h1>
          <p className="text-sm text-[#6E6E73]">{selectedChild ? ageLabel(selectedChild.birthdate) : '7 months, 12 days'}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full bg-[#55A67A]" />
            <span className="text-xs text-[#55A67A] font-medium">All good today</span>
          </div>
        </div>
      </div>

      {/* Child switcher -- only shown once a household has more than one
          real child on file (MBCST-33 "correctly scoped per child" AC). */}
      {householdChildren.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
          {householdChildren.map(c => (
            <button
              key={c.id}
              onClick={() => setChildId(c.id)}
              className={`action-btn flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                c.id === childId ? 'bg-[#EE674E] text-white' : 'bg-[#F6EDE8] text-[#6E6E73]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F6EDE8] p-1 rounded-xl mb-4">
        {(['overview', 'timeline', 'growth', 'milestones'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tab-pill flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize ${
              tab === t ? 'bg-white text-[#EE674E] shadow-sm' : 'text-[#6E6E73]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {overviewCards.map(c => (
              <div key={c.label} className="glass-card rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm"
                    style={{ background: `${c.color}22` }}>
                    {c.icon}
                  </div>
                  <span className="text-xs text-[#6E6E73] font-medium">{c.label}</span>
                </div>
                <p className="font-semibold text-[#242424] text-sm">{c.value}</p>
                <p className="text-[11px] text-[#6E6E73]">{c.sub}</p>
              </div>
            ))}
          </div>
          <div className="glass-card-strong rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#EE674E] uppercase tracking-wide mb-2">BabyPredict ✨</p>
            <p className="text-sm text-[#242424] font-medium">Next nap: <span className="text-[#EE674E]">9:35–10:05 AM</span></p>
            <p className="text-xs text-[#6E6E73] mt-0.5">82% confidence · Based on 7-day pattern</p>
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="glass-card rounded-2xl p-4 space-y-0">
          {babyTimeline.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="timeline-dot mt-0.5" style={{ background: item.predicted ? 'transparent' : item.color, border: item.predicted ? `2px dashed ${item.color}` : 'none' }} />
                {i < babyTimeline.length - 1 && <div className="w-px flex-1 my-0.5 bg-[#F0E8E4]" style={{ minHeight: 20 }} />}
              </div>
              <div className="pb-3 flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-[13px] font-medium text-[#242424]">{item.icon} {item.label}</p>
                  <span className="text-[11px] text-[#6E6E73] ml-2 flex-shrink-0">{item.time}</span>
                </div>
                {item.predicted && <span className="text-[10px] text-[#B0A0F0] font-medium">Predicted</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'growth' && (
        <div className="space-y-3">
          {/* Unit toggles */}
          <div className="flex gap-2">
            <div className="flex gap-1 bg-[#F6EDE8] p-1 rounded-lg">
              {(['kg', 'lb'] as const).map(u => (
                <button key={u} onClick={() => setWeightUnit(u)} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase ${weightUnit === u ? 'bg-white text-[#EE674E] shadow-sm' : 'text-[#6E6E73]'}`}>{u}</button>
              ))}
            </div>
            <div className="flex gap-1 bg-[#F6EDE8] p-1 rounded-lg">
              {(['cm', 'in'] as const).map(u => (
                <button key={u} onClick={() => setHeightUnit(u)} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase ${heightUnit === u ? 'bg-white text-[#EE674E] shadow-sm' : 'text-[#6E6E73]'}`}>{u}</button>
              ))}
            </div>
          </div>

          <div className="glass-card-strong rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide mb-3">Current Measurements</p>
            {latestGrowth?.growth ? (
              <div className="grid grid-cols-3 gap-4">
                {latestGrowth.growth.heightCm != null && <div><p className="text-xs text-[#6E6E73] mb-1">Length/Height</p><p className="text-sm font-semibold text-[#242424]">{displayHeight(latestGrowth.growth.heightCm)}</p></div>}
                {latestGrowth.growth.weightKg != null && <div><p className="text-xs text-[#6E6E73] mb-1">Weight</p><p className="text-sm font-semibold text-[#242424]">{displayWeight(latestGrowth.growth.weightKg)}</p></div>}
                {latestGrowth.growth.headCm != null && <div><p className="text-xs text-[#6E6E73] mb-1">Head</p><p className="text-sm font-semibold text-[#242424]">{displayHeight(latestGrowth.growth.headCm)}</p></div>}
              </div>
            ) : (
              <p className="text-sm text-[#6E6E73]">No measurements logged yet.</p>
            )}
            <p className="text-[11px] text-[#6E6E73] mt-3">
              {referenceLoaded
                ? 'Plotted against the selected pediatric growth reference.'
                : "Percentiles aren't available yet — MomBestie hasn't loaded a pediatric growth reference dataset for this measurement type. Measurements are still saved and tracked over time."}
              {' '}A single measurement can't determine overall health or development — your pediatrician can interpret {selectedChild?.name ?? 'your child'}'s growth pattern in the context of their medical history.
            </p>
          </div>

          {!showGrowthForm ? (
            <button onClick={() => setShowGrowthForm(true)}
              className="action-btn w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm"
              style={{ background: '#FFFCFA', border: '2px dashed #F6B6A5', color: '#EE674E' }}>
              + Log a Measurement
            </button>
          ) : (
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide">New measurement</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] text-[#6E6E73] mb-1">Weight ({weightUnit})</p>
                  <input value={weightInput} onChange={e => setWeightInput(e.target.value)} inputMode="decimal" placeholder="0.0" className="cartoon-input w-full px-2.5 py-2 text-sm text-[#242424]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#6E6E73] mb-1">Length ({heightUnit})</p>
                  <input value={heightInput} onChange={e => setHeightInput(e.target.value)} inputMode="decimal" placeholder="0.0" className="cartoon-input w-full px-2.5 py-2 text-sm text-[#242424]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#6E6E73] mb-1">Head ({heightUnit})</p>
                  <input value={headInput} onChange={e => setHeadInput(e.target.value)} inputMode="decimal" placeholder="0.0" className="cartoon-input w-full px-2.5 py-2 text-sm text-[#242424]" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowGrowthForm(false)} className="action-btn flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#6E6E73]" style={{ background: '#F0E8E4' }}>Cancel</button>
                <button onClick={logGrowth} disabled={!weightInput && !heightInput && !headInput}
                  className="action-btn flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)' }}>Save</button>
              </div>
            </div>
          )}

          {growthLogs.length > 0 && (
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide mb-3">History</p>
              <div className="space-y-2">
                {growthLogs.map(g => (
                  <div key={g.id} className="flex items-center justify-between text-sm">
                    <span className="text-[#6E6E73]">{new Date(g.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-[#242424]">
                      {[g.growth?.heightCm != null && displayHeight(g.growth.heightCm), g.growth?.weightKg != null && displayWeight(g.growth.weightKg), g.growth?.headCm != null && `head ${displayHeight(g.growth.headCm)}`].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'milestones' && (
        <div className="space-y-3">
          <div className="glass-card-strong rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#EE674E] uppercase tracking-wide mb-3">{selectedChild?.name ?? 'Maya'}'s Milestones</p>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${m.done ? '' : 'opacity-40'}`}
                    style={{ background: m.done ? '#FFD6C9' : '#F0E8E4' }}>
                    {m.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${m.done ? 'text-[#242424]' : 'text-[#6E6E73]'}`}>{m.label}</p>
                    <p className="text-xs text-[#6E6E73]">{m.date}</p>
                  </div>
                  {m.done && <div className="w-5 h-5 rounded-full bg-[#E8F5EE] flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#55A67A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
