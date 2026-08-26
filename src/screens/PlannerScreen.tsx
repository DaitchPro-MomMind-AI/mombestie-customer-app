import { useEffect, useState } from 'react'
import {
  DEMO_CHILD_ID, PLANNER_CATEGORY_TO_LOG_TYPE, reconcilePlanner, useTrackingLogs,
  getCurrentHouseholdId, listUpcomingAppointments, cancelAppointment, rescheduleAppointment, type Appointment,
} from '../services'

const CATEGORY_META: Record<Appointment['category'], { icon: string; label: string; color: string }> = {
  medical: { icon: '🩺', label: 'Medical', color: '#6299D5' },
  marketplace_booking: { icon: '🧑‍🍼', label: 'Provider booking', color: '#EE674E' },
  personal: { icon: '📌', label: 'Personal', color: '#B0A0F0' },
  development: { icon: '🎉', label: 'Development', color: '#55A67A' },
  family_task: { icon: '🏠', label: 'Family task', color: '#F8C85E' },
}

/**
 * Real appointments (docs/ARCHITECTURE.md §14.5) grouped by category --
 * separate from the local plannerItems slots below, which stay untouched.
 * This is additive, not a replacement: plannerItems models a recurring daily
 * routine, appointments models one-off scheduled events (medical visits,
 * confirmed marketplace bookings, etc.) from the real `appointments` table.
 */
function UpcomingAppointments() {
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [reschedulingId, setReschedulingId] = useState<string | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)

  const refresh = (hhId: string) => listUpcomingAppointments(hhId).then(a => { setAppointments(a); setLoading(false) })

  useEffect(() => {
    getCurrentHouseholdId().then(id => {
      setHouseholdId(id)
      if (id) refresh(id); else setLoading(false)
    })
  }, [])

  const startReschedule = (a: Appointment) => {
    const when = new Date(a.scheduled_at)
    setNewDate(when.toISOString().slice(0, 10))
    setNewTime(when.toTimeString().slice(0, 5))
    setRescheduleError(null)
    setReschedulingId(a.id)
  }

  const submitReschedule = async () => {
    if (!reschedulingId || !newDate || !newTime || !householdId) return
    const iso = new Date(`${newDate}T${newTime}`).toISOString()
    const res = await rescheduleAppointment(reschedulingId, iso)
    if (!res.ok) { setRescheduleError(res.error ?? 'Could not reschedule -- please try again.'); return }
    setReschedulingId(null)
    refresh(householdId)
  }

  if (!householdId || (!loading && appointments.length === 0)) return null

  return (
    <div className="mb-5">
      <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wider mb-2">Upcoming Appointments</p>
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-3"><span className="w-5 h-5 rounded-full border-2 border-[#F0E8E4] border-t-[#EE674E] inline-block spin-slow" /></div>
        ) : appointments.map(a => {
          const meta = CATEGORY_META[a.category]
          const when = new Date(a.scheduled_at)
          const isRescheduling = reschedulingId === a.id
          return (
            <div key={a.id} className="glass-card rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ background: `${meta.color}22` }}>{meta.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#242424]">{a.title}</p>
                  <p className="text-[11px] text-[#6E6E73]">{meta.label} · {when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, {when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => isRescheduling ? setReschedulingId(null) : startReschedule(a)}
                    className="action-btn text-[11px] font-semibold text-[#6299D5] px-2 py-1">{isRescheduling ? 'Close' : 'Reschedule'}</button>
                  <button onClick={async () => { await cancelAppointment(a.id); refresh(householdId) }}
                    className="action-btn text-[11px] font-semibold text-[#D9534F] px-2 py-1">Cancel</button>
                </div>
              </div>
              {isRescheduling && (
                <div className="mt-3 pt-3 border-t border-[#F0E8E4] space-y-2">
                  {rescheduleError && <p className="text-[11px] text-[#D9534F]">{rescheduleError}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="cartoon-input px-2.5 py-2 text-xs text-[#242424]" />
                    <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="cartoon-input px-2.5 py-2 text-xs text-[#242424]" />
                  </div>
                  <button onClick={submitReschedule} disabled={!newDate || !newTime}
                    className="action-btn w-full py-2 rounded-xl text-xs font-bold text-white disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg,#6299D5,#7FB0E8)' }}>
                    Save new time
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const plannerItems = [
  { time: '7:25 AM', label: 'Bottle feed', icon: '🍼', cat: 'Feeding', color: '#6299D5', done: true, section: 'Morning' },
  { time: '8:15 AM', label: 'Breakfast', icon: '🥣', cat: 'Meal', color: '#55A67A', done: true, section: 'Morning' },
  { time: '9:00 AM', label: 'Tummy-time', icon: '🧸', cat: 'Activity', color: '#EE674E', done: false, section: 'Morning' },
  { time: '9:45 AM', label: 'Nap (predicted)', icon: '🌙', cat: 'Sleep', color: '#B0A0F0', done: false, section: 'Morning', predicted: true },
  { time: '12:00 PM', label: 'Lunch', icon: '🥣', cat: 'Meal', color: '#55A67A', done: false, section: 'Afternoon' },
  { time: '1:30 PM', label: 'Bottle feed', icon: '🍼', cat: 'Feeding', color: '#6299D5', done: false, section: 'Afternoon' },
  { time: '2:00 PM', label: 'Pediatric appointment', icon: '🏥', cat: 'Appointment', color: '#6299D5', done: false, section: 'Afternoon' },
  { time: '5:00 PM', label: 'Bottle feed', icon: '🍼', cat: 'Feeding', color: '#6299D5', done: false, section: 'Evening' },
  { time: '7:00 PM', label: 'Bath time', icon: '🛁', cat: 'Routine', color: '#F47B66', done: false, section: 'Evening' },
  { time: '7:45 PM', label: 'Bedtime (predicted)', icon: '🌙', cat: 'Sleep', color: '#B0A0F0', done: false, section: 'Evening', predicted: true },
]

export function PlannerScreen() {
  // Feeding/Meal/Sleep slots reconcile against real TrackingLogs (nearest
  // match within 90 min) instead of a disconnected local checkbox — see
  // src/services/plannerReconcile.ts. Activity/Appointment/Routine and any
  // `predicted` slot stay local-only toggles; there's no service for those yet.
  const { logs, save, remove } = useTrackingLogs(DEMO_CHILD_ID)
  const reconciled = reconcilePlanner(plannerItems, logs)
  const [manualDone, setManualDone] = useState<Set<number>>(new Set())
  const sections = ['Morning', 'Afternoon', 'Evening'] as const

  const completed = [...new Set([...manualDone, ...reconciled.keys()])]

  const toggle = (i: number) => {
    const item = plannerItems[i]
    const logType = !item.predicted ? PLANNER_CATEGORY_TO_LOG_TYPE[item.cat] : undefined

    if (!logType) {
      setManualDone(s => {
        const next = new Set(s)
        next.has(i) ? next.delete(i) : next.add(i)
        return next
      })
      return
    }

    const existing = reconciled.get(i)
    if (existing) {
      remove(existing.id)
      return
    }
    if (logType === 'Feed') save({ type: 'Feed', feed: { amountOz: 5, method: 'Bottle' } })
    else if (logType === 'Meal') save({ type: 'Meal', meal: { foods: [item.label] } })
    else if (logType === 'Sleep') save({ type: 'Sleep', sleep: { durationSec: 0 } })
  }

  return (
    <div className="scroll-area flex-1 px-4 pt-2 pb-4 slide-up">
      {/* Header */}
      <div className="flex items-center justify-between py-3 mb-2">
        <div>
          <h1 className="font-display text-2xl text-[#242424]">Today</h1>
          <p className="text-sm text-[#6E6E73]">Monday, August 10</p>
        </div>
        <button className="action-btn coral-gradient text-white text-xs font-semibold px-3.5 py-2 rounded-xl">
          ✨ Optimize Day
        </button>
      </div>

      {/* Progress */}
      <div className="glass-card rounded-2xl p-3.5 mb-4 flex items-center gap-3">
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg width="48" height="48" className="progress-ring">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#FFD6C9" strokeWidth="4" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="#EE674E" strokeWidth="4"
              strokeDasharray={`${(completed.length / plannerItems.length) * 125.6} 125.6`}
              strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#EE674E]">
            {Math.round((completed.length / plannerItems.length) * 100)}%
          </span>
        </div>
        <div>
          <p className="font-semibold text-[#242424] text-sm">{completed.length} of {plannerItems.length} done</p>
          <p className="text-xs text-[#6E6E73]">Great progress, Sarah!</p>
        </div>
        <button className="ml-auto w-8 h-8 rounded-xl bg-[#FFD6C9] flex items-center justify-center text-[#EE674E] text-sm">+</button>
      </div>

      <UpcomingAppointments />

      {sections.map(section => {
        const items = plannerItems.filter(p => p.section === section)
        return (
          <div key={section} className="mb-5">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wider mb-2">{section}</p>
            <div className="space-y-2">
              {items.map((item, i) => {
                const idx = plannerItems.indexOf(item)
                const done = completed.includes(idx)
                return (
                  <button
                    key={i}
                    onClick={() => toggle(idx)}
                    className={`action-btn w-full glass-card rounded-xl p-3 flex items-center gap-3 text-left ${done ? 'opacity-60' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: `${item.color}22` }}>
                      {done ? '✓' : item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${done ? 'line-through text-[#6E6E73]' : 'text-[#242424]'}`}>
                        {item.label}
                        {item.predicted && <span className="ml-1 text-[10px] text-[#B0A0F0] font-normal no-underline">predicted</span>}
                      </p>
                      <p className="text-[11px] text-[#6E6E73]">{item.cat}</p>
                    </div>
                    <span className="text-[11px] text-[#6E6E73] flex-shrink-0">{item.time}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
