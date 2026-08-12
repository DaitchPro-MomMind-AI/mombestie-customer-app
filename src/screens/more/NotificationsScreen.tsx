import { useState } from 'react'
import { SubHeader } from '../../components/atoms'

export function NotificationsSubScreen({ onBack }: { onBack: () => void }) {
  const [quiet, setQuiet] = useState(false)
  const categories = [
    { icon: '🔮', label: 'Routine Predictions', sub: 'Nap & feed predictions', on: true },
    { icon: '🍼', label: 'Feeding Reminders', sub: 'Every 3-4 hours', on: true },
    { icon: '🌙', label: 'Sleep Reminders', sub: 'Bedtime & wake window', on: true },
    { icon: '🏥', label: 'Appointments', sub: 'Upcoming bookings', on: true },
    { icon: '👨‍👩‍👧', label: 'Family Activity', sub: 'When family logs data', on: false },
    { icon: '🛍️', label: 'Marketplace', sub: 'Booking updates', on: true },
    { icon: '📦', label: 'Supply Alerts', sub: 'When stock is low', on: true },
    { icon: '✨', label: 'MomMind Insights', sub: 'Daily AI summaries', on: true },
    { icon: '📣', label: 'Marketing', sub: 'Tips & promotions', on: false },
  ]
  const [states, setStates] = useState(categories.map(c => c.on))
  return (
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Notifications" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-3">
        <div className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌙</span>
            <div>
              <p className="text-sm font-semibold text-[#242424]">Quiet Hours</p>
              <p className="text-xs text-[#6E6E73]">10 PM – 7 AM · No alerts</p>
            </div>
          </div>
          <button onClick={() => setQuiet(v => !v)}
            className="action-btn w-12 h-6 rounded-full transition-all"
            style={{ background: quiet ? '#EE674E' : '#E0D8D4' }}>
            <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
              style={{ marginLeft: quiet ? '24px' : '2px' }} />
          </button>
        </div>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
          {categories.map((c, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <span className="text-lg">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#242424]">{c.label}</p>
                <p className="text-xs text-[#6E6E73]">{c.sub}</p>
              </div>
              <button onClick={() => setStates(s => s.map((v, j) => j === i ? !v : v))}
                className="action-btn w-11 h-6 rounded-full transition-all flex-shrink-0"
                style={{ background: states[i] ? '#EE674E' : '#E0D8D4' }}>
                <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                  style={{ marginLeft: states[i] ? '22px' : '2px' }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
