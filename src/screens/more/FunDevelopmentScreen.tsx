import { useEffect, useState } from 'react'
import { SubHeader } from '../../components/atoms'
import {
  listApprovedActivities, listFavoriteIds, toggleFavorite, logActivityCompletion,
  getCurrentHouseholdId, type Activity,
} from '../../services'

const AGE_BANDS = [
  { label: 'Newborn', months: 1 }, { label: '0–3mo', months: 2 }, { label: '3–6mo', months: 4 },
  { label: '6–12mo', months: 9 }, { label: '12–18mo', months: 15 }, { label: '18–24mo', months: 21 },
  { label: '2–3y', months: 30 },
]

const AREA_ICON: Record<string, string> = {
  visual_tracking: '👀', sensory: '🧶', gross_motor: '🏃', fine_motor: '✋', cognitive: '🧠',
  social_emotional: '😊', language: '🗣️', creative: '🎨', listening: '🎵', life_skills: '🧺',
}
function iconFor(a: Activity) {
  for (const area of a.development_areas) if (AREA_ICON[area]) return AREA_ICON[area]
  return '🌟'
}

const SUPERVISION_LABEL: Record<Activity['supervision_level'], string> = {
  constant_arms_reach: 'Constant supervision — stay within arm’s reach',
  close: 'Close supervision — stay in the same room, watching',
  moderate: 'Moderate supervision — check in frequently',
}

function SafetyBadges({ a }: { a: Activity }) {
  const items: string[] = []
  if (a.choking_risk) items.push('⚠️ Choking risk')
  if (a.water_risk) items.push('💧 Water risk')
  if (a.allergy_food_related) items.push('🥜 Allergy-related')
  if (items.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(i => (
        <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FAECEC', color: '#D9534F' }}>{i}</span>
      ))}
    </div>
  )
}

function ActivityDetailSheet({ activity, isFavorite, householdId, onToggleFavorite, onClose }: {
  activity: Activity; isFavorite: boolean; householdId: string | null
  onToggleFavorite: () => void; onClose: () => void
}) {
  const [logging, setLogging] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [logged, setLogged] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleLog = async () => {
    if (!householdId) return
    setSaving(true)
    const ok = await logActivityCompletion(householdId, activity.id, rating, notes.trim() || null)
    setSaving(false)
    if (ok) setLogged(true)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col" style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '90%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: '#FFD6C9' }}>{iconFor(activity)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg text-[#242424] leading-tight">{activity.name}</h3>
              <p className="text-xs text-[#6E6E73] mt-0.5">{activity.min_age_months}–{activity.max_age_months}mo · ⏱ {activity.duration_minutes} min · {activity.setting}</p>
            </div>
            {householdId && (
              <button onClick={onToggleFavorite} className="action-btn w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isFavorite ? '#FFD6C9' : '#F0E8E4' }}>
                {isFavorite ? '❤️' : '🤍'}
              </button>
            )}
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-3">
          <p className="text-sm text-[#242424] leading-relaxed">{activity.description}</p>

          <div className="rounded-2xl px-4 py-3" style={{ background: '#FFF3EE', border: '1.5px solid #F6B6A5' }}>
            <p className="text-xs font-bold text-[#EE674E] mb-0.5">🛡️ Supervision required</p>
            <p className="text-xs text-[#7A5040]">{SUPERVISION_LABEL[activity.supervision_level]}</p>
          </div>

          <SafetyBadges a={activity} />
          {activity.safety_warnings.length > 0 && (
            <ul className="text-xs text-[#6E6E73] list-disc pl-4 space-y-1">
              {activity.safety_warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          )}

          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">How to do it</p>
            <p className="text-sm text-[#242424] leading-relaxed">{activity.instructions}</p>
          </div>

          {activity.materials_required.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activity.materials_required.map(m => (
                <span key={m} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#F0E8E4', color: '#6E6E73' }}>{m}</span>
              ))}
            </div>
          )}

          {householdId ? (
            logged ? (
              <div className="rounded-2xl px-4 py-4 text-center" style={{ background: '#E6F4ED', border: '1.5px solid #A8D9BC' }}>
                <p className="text-sm font-semibold text-[#3D8A60]">✓ Logged to activity history</p>
              </div>
            ) : logging ? (
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">How did it go?</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setRating(n)} className="action-btn text-xl">{(rating ?? 0) >= n ? '⭐' : '☆'}</button>
                  ))}
                </div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2}
                  className="cartoon-input w-full px-3.5 py-2.5 text-sm text-[#242424] placeholder-[#C0B8B4] resize-none" />
                <button onClick={handleLog} disabled={saving}
                  className="action-btn w-full py-3 rounded-xl font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg,#55A67A,#78C49A)', border: '2px solid #3D8A60', boxShadow: '0 3px 0 #3D8A60' }}>
                  {saving ? 'Saving…' : 'Save to History'}
                </button>
              </div>
            ) : (
              <button onClick={() => setLogging(true)}
                className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
                ✓ Mark as Done
              </button>
            )
          ) : (
            <div className="rounded-2xl px-4 py-3 text-center" style={{ background: '#F0E8E4' }}>
              <p className="text-xs text-[#6E6E73]">Sign in to save favorites and log completed activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type QuickMode = null | 'bored' | 'few-minutes' | 'no-toys'

const WEEKLY_THEMES: { day: string; theme: string; area: string }[] = [
  { day: 'Monday', theme: 'Sensory', area: 'sensory' },
  { day: 'Tuesday', theme: 'Music', area: 'listening' },
  { day: 'Wednesday', theme: 'Outdoor Adventure', area: 'gross_motor' },
  { day: 'Thursday', theme: 'Creative', area: 'creative' },
  { day: 'Friday', theme: 'Movement', area: 'gross_motor' },
  { day: 'Saturday', theme: 'Family Fun', area: 'social_emotional' },
  { day: 'Sunday', theme: 'Calm & Connection', area: 'language' },
]

/**
 * Real algorithm over live `activities` rows (docs/ARCHITECTURE.md §14.23) --
 * sequences activities to roughly fill the available time, never invents an
 * activity. Greedy pick: largest activities first that still fit, so a short
 * time budget doesn't end up empty just because the first pick was too big.
 */
function TodaysFunPlanSheet({ ageMonths, onClose }: { ageMonths: number; onClose: () => void }) {
  const [availableMinutes, setAvailableMinutes] = useState(30)
  const [energy, setEnergy] = useState<'high' | 'low'>('high')
  const [environment, setEnvironment] = useState<'indoor' | 'outdoor'>('indoor')
  const [plan, setPlan] = useState<Activity[] | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    const pool = await listApprovedActivities({ ageMonths, setting: environment })
    if (!pool) { setPlan([]); setLoading(false); return }
    // High energy prioritizes gross_motor first; low energy avoids it.
    const scored = pool.slice().sort((a, b) => {
      const aActive = a.development_areas.includes('gross_motor') ? 1 : 0
      const bActive = b.development_areas.includes('gross_motor') ? 1 : 0
      return energy === 'high' ? bActive - aActive : aActive - bActive
    })
    const selected: Activity[] = []
    let remaining = availableMinutes
    for (const a of scored) {
      if (a.duration_minutes <= remaining) { selected.push(a); remaining -= a.duration_minutes }
      if (remaining <= 0) break
    }
    setPlan(selected)
    setLoading(false)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col" style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <h3 className="font-display text-lg text-[#242424]">Today's Fun Plan</h3>
          <p className="text-xs text-[#6E6E73] mt-0.5">Real activities, sequenced to fit your time — never invented.</p>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-3">
          {!plan && (
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Available time</p>
                <div className="flex gap-2">
                  {[15, 30, 45, 60].map(m => (
                    <button key={m} onClick={() => setAvailableMinutes(m)} className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold"
                      style={availableMinutes === m ? { background: '#FFD6C9', border: '2px solid #EE674E', color: '#C94930' } : { background: '#F0E8E4', border: '2px solid #E8E0DC', color: '#6E6E73' }}>{m} min</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Child's energy</p>
                <div className="flex gap-2">
                  {(['high', 'low'] as const).map(e => (
                    <button key={e} onClick={() => setEnergy(e)} className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold capitalize"
                      style={energy === e ? { background: '#FFD6C9', border: '2px solid #EE674E', color: '#C94930' } : { background: '#F0E8E4', border: '2px solid #E8E0DC', color: '#6E6E73' }}>{e}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Environment</p>
                <div className="flex gap-2">
                  {(['indoor', 'outdoor'] as const).map(e => (
                    <button key={e} onClick={() => setEnvironment(e)} className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold capitalize"
                      style={environment === e ? { background: '#FFD6C9', border: '2px solid #EE674E', color: '#C94930' } : { background: '#F0E8E4', border: '2px solid #E8E0DC', color: '#6E6E73' }}>{e}</button>
                  ))}
                </div>
              </div>
              <button onClick={generate} disabled={loading}
                className="action-btn w-full py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)' }}>
                {loading ? 'Building plan…' : 'Generate Plan'}
              </button>
            </div>
          )}
          {plan && (
            <>
              {plan.length === 0 ? (
                <div className="rounded-2xl px-4 py-6 text-center" style={{ background: '#F0E8E4' }}>
                  <p className="text-sm text-[#6E6E73]">No approved activities fit these filters yet — try a different time budget or environment.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {plan.map((a, i) => (
                    <div key={a.id} className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#EE674E' }}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#242424]">{a.name}</p>
                        <p className="text-xs text-[#6E6E73]">⏱ {a.duration_minutes} min · {a.supervision_level.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-[#6E6E73] text-center pt-1">Total: {plan.reduce((s, a) => s + a.duration_minutes, 0)} min</p>
                </div>
              )}
              <button onClick={() => setPlan(null)} className="action-btn w-full py-2.5 rounded-xl text-sm font-semibold text-[#6E6E73]" style={{ background: '#F0E8E4' }}>← Adjust</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function WeeklyFunPlanSheet({ ageMonths, onClose }: { ageMonths: number; onClose: () => void }) {
  const [plan, setPlan] = useState<Record<string, Activity | null> | null>(null)

  useEffect(() => {
    listApprovedActivities({ ageMonths }).then(pool => {
      if (!pool) { setPlan(null); return }
      const byDay: Record<string, Activity | null> = {}
      WEEKLY_THEMES.forEach(({ day, area }) => {
        const matches = pool.filter(a => a.development_areas.includes(area))
        byDay[day] = matches[0] ?? pool[0] ?? null
      })
      setPlan(byDay)
    })
  }, [ageMonths])

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col" style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <h3 className="font-display text-lg text-[#242424]">Weekly Fun Plan</h3>
          <p className="text-xs text-[#6E6E73] mt-0.5">A themed day-by-day rotation, matched to real activities in the library.</p>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-2">
          {!plan ? (
            <div className="text-center py-8"><span className="w-6 h-6 rounded-full border-2 border-[#F0E8E4] border-t-[#EE674E] inline-block spin-slow" /></div>
          ) : WEEKLY_THEMES.map(({ day, theme }) => {
            const a = plan[day]
            return (
              <div key={day} className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-16 flex-shrink-0">
                  <p className="text-xs font-bold text-[#EE674E]">{day.slice(0, 3)}</p>
                  <p className="text-[10px] text-[#6E6E73]">{theme}</p>
                </div>
                <div className="flex-1 min-w-0">
                  {a ? (
                    <><p className="text-sm font-semibold text-[#242424]">{a.name}</p><p className="text-xs text-[#6E6E73]">⏱ {a.duration_minutes} min</p></>
                  ) : <p className="text-xs text-[#6E6E73]">No approved activity for this theme yet</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function FunDevelopmentSubScreen({ onBack }: { onBack: () => void }) {
  const [configured, setConfigured] = useState(true)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [ageBand, setAgeBand] = useState(AGE_BANDS[3]) // default 6-12mo
  const [setting, setSetting] = useState<'any' | 'indoor' | 'outdoor'>('any')
  const [quickMode, setQuickMode] = useState<QuickMode>(null)
  const [fewMinutesDuration, setFewMinutesDuration] = useState<10 | 15 | 20 | 30>(15)
  const [selected, setSelected] = useState<Activity | null>(null)
  const [showTodaysPlan, setShowTodaysPlan] = useState(false)
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const filters = {
      ageMonths: ageBand.months,
      setting: setting === 'any' ? undefined : setting,
      noEquipment: quickMode === 'no-toys',
      maxDurationMinutes: quickMode === 'few-minutes' ? fewMinutesDuration : undefined,
    }
    listApprovedActivities(filters).then(result => {
      if (cancelled) return
      if (result === null) { setConfigured(false); setActivities([]) }
      else { setConfigured(true); setActivities(result) }
      setLoading(false)
    })
    getCurrentHouseholdId().then(id => { if (!cancelled) setHouseholdId(id) })
    return () => { cancelled = true }
  }, [ageBand, setting, quickMode, fewMinutesDuration])

  useEffect(() => {
    if (!householdId) { setFavoriteIds(new Set()); return }
    listFavoriteIds(householdId).then(setFavoriteIds)
  }, [householdId])

  const handleToggleFavorite = async (activityId: string) => {
    if (!householdId) return
    const wasFavorite = favoriteIds.has(activityId)
    const ok = await toggleFavorite(householdId, activityId, wasFavorite)
    if (ok) {
      setFavoriteIds(prev => {
        const next = new Set(prev)
        wasFavorite ? next.delete(activityId) : next.add(activityId)
        return next
      })
    }
  }

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden slide-up">
        <SubHeader title="Fun & Development" onBack={onBack} />
        <div className="scroll-area flex-1 px-4 pb-6 pt-2 space-y-3">

          {/* Plans */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setShowTodaysPlan(true)}
              className="action-btn py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)' }}>📅 Today's Fun Plan</button>
            <button onClick={() => setShowWeeklyPlan(true)}
              className="action-btn py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm"
              style={{ background: '#FFFCFA', border: '2px solid #F6B6A5', color: '#EE674E' }}>🗓️ Weekly Plan</button>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2">
            {([
              { key: 'bored' as QuickMode, icon: '😩', label: 'Toddler Bored?' },
              { key: 'few-minutes' as QuickMode, icon: '⏱️', label: 'Few Minutes' },
              { key: 'no-toys' as QuickMode, icon: '🧺', label: 'No Toys' },
            ]).map(m => (
              <button key={m.key} onClick={() => setQuickMode(q => q === m.key ? null : m.key)}
                className="action-btn py-3 rounded-2xl flex flex-col items-center gap-1 text-center"
                style={quickMode === m.key
                  ? { background: '#FFD6C9', border: '2px solid #EE674E', boxShadow: '0 3px 0 #C94930' }
                  : { background: '#FFFCFA', border: '2px solid #F0E8E4' }}>
                <span className="text-xl">{m.icon}</span>
                <span className="text-[10px] font-bold text-[#6E6E73]">{m.label}</span>
              </button>
            ))}
          </div>

          {quickMode === 'few-minutes' && (
            <div className="glass-card rounded-2xl p-3.5 space-y-2.5">
              <div className="flex gap-2">
                {([10, 15, 20, 30] as const).map(d => (
                  <button key={d} onClick={() => setFewMinutesDuration(d)}
                    className="action-btn flex-1 py-2 rounded-xl text-xs font-bold"
                    style={fewMinutesDuration === d ? { background: '#FFD6C9', border: '2px solid #EE674E', color: '#C94930' } : { background: '#F0E8E4', border: '2px solid #E8E0DC', color: '#6E6E73' }}>{d} min</button>
                ))}
              </div>
              <p className="text-[11px] text-[#7A5040]">🛡️ Even for a few minutes, always check the supervision level on each activity below — none of these mean it's safe to leave a young child unattended.</p>
            </div>
          )}

          {/* Age band filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {AGE_BANDS.map(b => (
              <button key={b.label} onClick={() => setAgeBand(b)}
                className="action-btn flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
                style={ageBand.label === b.label
                  ? { background: 'linear-gradient(135deg,#EE674E,#F47B66)', color: 'white', border: '2px solid #C94930' }
                  : { background: '#F0E8E4', color: '#6E6E73', border: '2px solid #E8E0DC' }}>
                {b.label}
              </button>
            ))}
          </div>

          {/* Setting filter */}
          <div className="flex gap-1 bg-[#F6EDE8] p-1 rounded-xl">
            {(['any', 'indoor', 'outdoor'] as const).map(s => (
              <button key={s} onClick={() => setSetting(s)}
                className={`tab-pill flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize ${setting === s ? 'bg-white text-[#EE674E] shadow-sm' : 'text-[#6E6E73]'}`}>{s}</button>
            ))}
          </div>

          {!configured && (
            <div className="rounded-2xl px-4 py-4 text-center" style={{ background: '#F0E8E4' }}>
              <p className="text-sm text-[#6E6E73]">Backend not connected in this environment — activity library is unavailable.</p>
            </div>
          )}

          {configured && loading && (
            <div className="text-center py-8"><span className="w-6 h-6 rounded-full border-2 border-[#F0E8E4] border-t-[#EE674E] inline-block spin-slow" /></div>
          )}

          {configured && !loading && activities.length === 0 && (
            <div className="rounded-2xl px-4 py-6 text-center" style={{ background: '#FFF3EE', border: '1.5px dashed #F6B6A5' }}>
              <p className="text-2xl mb-1">🌱</p>
              <p className="text-sm font-semibold text-[#242424]">No approved activities match these filters yet</p>
              <p className="text-xs text-[#6E6E73] mt-1">MomMind's activity library is still growing — check back soon, or try a different age range.</p>
            </div>
          )}

          {configured && !loading && activities.map(a => (
            <button key={a.id} onClick={() => setSelected(a)} className="action-btn w-full glass-card rounded-2xl p-3.5 flex items-center gap-3 text-left">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#FFD6C9' }}>{iconFor(a)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-sm text-[#242424]">{a.name}</p>
                  {favoriteIds.has(a.id) && <span className="text-xs">❤️</span>}
                </div>
                <p className="text-xs text-[#6E6E73]">⏱ {a.duration_minutes} min · {a.min_age_months}–{a.max_age_months}mo</p>
                <p className="text-[10px] text-[#B0A8A4] mt-0.5">{SUPERVISION_LABEL[a.supervision_level].split(' — ')[0]}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#B0A8A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <ActivityDetailSheet
          activity={selected}
          isFavorite={favoriteIds.has(selected.id)}
          householdId={householdId}
          onToggleFavorite={() => handleToggleFavorite(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
      {showTodaysPlan && <TodaysFunPlanSheet ageMonths={ageBand.months} onClose={() => setShowTodaysPlan(false)} />}
      {showWeeklyPlan && <WeeklyFunPlanSheet ageMonths={ageBand.months} onClose={() => setShowWeeklyPlan(false)} />}
    </>
  )
}
