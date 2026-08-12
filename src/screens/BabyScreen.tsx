import { useState } from 'react'
import { DEMO_CHILD_ID, buildTimeline, useTrackingLogs } from '../services'

export function BabyScreen() {
  const [tab, setTab] = useState<'overview' | 'timeline' | 'growth' | 'milestones'>('overview')
  const { logs, summary } = useTrackingLogs(DEMO_CHILD_ID)
  const babyTimeline = buildTimeline(logs)
  const feedSessions = logs.filter(l => l.type === 'Feed').length

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
    // Growth/Development aren't aggregated from logs yet — see docs/ARCHITECTURE.md NEXT list.
    { icon: '📏', label: 'Growth', value: '68 cm · 7.2 kg', sub: 'Last measured', color: '#F8C85E' },
    { icon: '🎯', label: 'Development', value: '3 activities', sub: 'This week', color: '#EE674E' },
  ]

  return (
    <div className="scroll-area flex-1 px-4 pt-2 pb-4 slide-up">
      {/* Header */}
      <div className="flex items-center gap-4 py-3 mb-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FFD6C9, #F47B66)' }}>
          🍼
        </div>
        <div>
          <h1 className="font-display text-2xl text-[#242424]">Maya</h1>
          <p className="text-sm text-[#6E6E73]">7 months, 12 days</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full bg-[#55A67A]" />
            <span className="text-xs text-[#55A67A] font-medium">All good today</span>
          </div>
        </div>
      </div>

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
          <div className="glass-card-strong rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide mb-3">Current Measurements</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Height', value: '68 cm', pct: 62 },
                { label: 'Weight', value: '7.2 kg', pct: 48 },
                { label: 'Head', value: '43 cm', pct: 55 },
                { label: 'BMI', value: 'Healthy', pct: 50 },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-[#6E6E73]">{m.label}</span>
                    <span className="text-xs font-semibold text-[#242424]">{m.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F0E8E4] overflow-hidden">
                    <div className="h-full rounded-full coral-gradient" style={{ width: `${m.pct}%` }} />
                  </div>
                  <p className="text-[10px] text-[#6E6E73] mt-1">{m.pct}th percentile</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide mb-3">Weight History</p>
            <div className="flex items-end gap-2 h-16">
              {[5.1, 5.8, 6.3, 6.7, 7.0, 7.2].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md" style={{ height: `${(v / 7.2) * 100}%`, background: i === 5 ? '#EE674E' : '#FFD6C9' }} />
                  <span className="text-[9px] text-[#6E6E73]">{['2m', '3m', '4m', '5m', '6m', '7m'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'milestones' && (
        <div className="space-y-3">
          <div className="glass-card-strong rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#EE674E] uppercase tracking-wide mb-3">Maya's Milestones</p>
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
