import { useState, useEffect, useRef } from 'react'
import { SubHeader } from '../../components/atoms'
import { DEMO_CHILD_ID, useBookings } from '../../services'

type Provider = { name: string; role: string; rating: number; reviews: number; price: string; avail: string; verified: boolean; color: string; category: string }

const ALL_PROVIDERS: Provider[] = [
  { name: 'Jessica M.', role: 'Babysitter',        rating: 4.9, reviews: 127, price: '$24/hr', avail: 'Available Sat',  verified: true,  color: '#EE674E', category: 'Babysitters' },
  { name: 'Maria L.',   role: 'Nanny',              rating: 5.0, reviews: 84,  price: '$28/hr', avail: 'Available today',verified: true,  color: '#6299D5', category: 'Nannies'     },
  { name: 'Priya K.',   role: 'Postpartum Support', rating: 4.8, reviews: 56,  price: '$35/hr', avail: 'Available Sun',  verified: true,  color: '#B0A0F0', category: 'Postpartum'  },
  { name: 'Amy T.',     role: 'House Cleaner',      rating: 4.7, reviews: 203, price: '$22/hr', avail: 'Available Mon',  verified: true,  color: '#55A67A', category: 'Cleaning'    },
  { name: 'Rosa G.',    role: 'Meal Prep Chef',     rating: 4.9, reviews: 41,  price: '$30/hr', avail: 'Available Wed',  verified: false, color: '#C49B30', category: 'Meal Prep'   },
  { name: 'Lily S.',    role: 'Baby Photographer',  rating: 5.0, reviews: 88,  price: '$120/session', avail: 'Available Fri', verified: true, color: '#F47B66', category: 'Photography' },
]


function MessageSheet({ provider, onClose }: { provider: Provider; onClose: () => void }) {
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState([
    { from: 'them', text: `Hi! I'm ${provider.name}. How can I help you today?` },
  ])
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const QUICK = ['What are your hours?', 'Are you available this weekend?', `What's your experience with infants?`]

  const send = (text: string) => {
    if (!text.trim()) return
    setMsgs(m => [...m, { from: 'me', text }])
    setInput('')
    setSending(true)
    const replies: Record<string, string> = {
      'What are your hours?': `I'm available Mon–Sat, 7am–9pm. Sundays by arrangement!`,
      'Are you available this weekend?': `Yes! I have Saturday afternoon free. Want me to pencil you in?`,
      "What's your experience with infants?": `I have 5+ years with newborns to 12 months. CPR certified and first-aid trained.`,
    }
    setTimeout(() => {
      setSending(false)
      setMsgs(m => [...m, { from: 'them', text: replies[text] || `Thanks for your message! I'll get back to you shortly 😊` }])
    }, 1200)
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col" style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', height: '78%' }}>

        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-[#F0E8E4]">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-3" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${provider.color},${provider.color}cc)` }}>{provider.name[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#242424]">{provider.name}</p>
              <p className="text-xs text-[#6E6E73]">{provider.role} · {provider.price}</p>
            </div>
            <button onClick={onClose}
              className="action-btn w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="#6E6E73" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="scroll-area flex-1 px-4 py-3 space-y-2">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={m.from === 'me'
                  ? { background: 'linear-gradient(135deg,#EE674E,#F47B66)', color: 'white', borderBottomRightRadius: 6 }
                  : { background: '#F0E8E4', color: '#242424', borderBottomLeftRadius: 6 }}>
                {m.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-[#F0E8E4]" style={{ borderBottomLeftRadius: 6 }}>
                <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#B0A8A4]" style={{ animation: `waveform 0.8s ease-in-out infinite ${i*0.2}s` }} />)}</div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        <div className="flex-shrink-0 px-4 pb-2 flex gap-2 overflow-x-auto">
          {QUICK.map(q => (
            <button key={q} onClick={() => send(q)}
              className="action-btn flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#EE674E] whitespace-nowrap"
              style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5' }}>{q}</button>
          ))}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-4 pb-5 pt-1 flex gap-2 items-center">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Type a message…"
            className="cartoon-input flex-1 px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]" />
          <button onClick={() => send(input)} disabled={!input.trim()}
            className="action-btn w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: input.trim() ? 'linear-gradient(135deg,#EE674E,#F47B66)' : '#F0E8E4', border: input.trim() ? '2px solid #C94930' : '2px solid #E0D8D4', boxShadow: input.trim() ? '0 3px 0 #C94930' : 'none' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8l12-5-5 12-2-5-5-2z" fill={input.trim() ? 'white' : '#B0A8A4'}/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}


function BookingSheet({ provider, onClose, onSave }: { provider: Provider; onClose: () => void; onSave: (input: { providerName: string; providerRole: string; day: string; slot: string; durationHrs: number; note?: string; estTotal: string }) => void }) {
  const days = ['Mon Aug 11','Tue Aug 12','Wed Aug 13','Thu Aug 14','Fri Aug 15','Sat Aug 16','Sun Aug 17']
  const slots = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM','6:00 PM']
  const durations = ['2 hrs','3 hrs','4 hrs','6 hrs','8 hrs']

  const [selDay, setSelDay] = useState<string|null>(null)
  const [selSlot, setSelSlot] = useState<string|null>(null)
  const [selDur, setSelDur] = useState('3 hrs')
  const [note, setNote] = useState('')
  const [step, setStep] = useState<1|2|3>(1)
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)

  const canNext = selDay && selSlot
  const hrs = parseInt(selDur)
  // provider.price is like "$24/hr" — parseInt() chokes on the leading "$"
  // and silently returns NaN, which used to only ever be displayed (never
  // persisted, so the bug was invisible). Strip to digits first.
  const hourlyRate = parseInt(provider.price.replace(/[^0-9.]/g, '')) || 0
  const total = selDur ? `$${hourlyRate * hrs}` : '—'

  const handleBook = () => {
    setBooking(true)
    setTimeout(() => {
      setBooking(false)
      setBooked(true)
      // Real persisted write — see docs/ARCHITECTURE.md §6/§13. Marketplace
      // is still mock (no live availability, no payment capture), but the
      // request itself is no longer thrown away.
      onSave({
        providerName: provider.name, providerRole: provider.role,
        day: selDay!, slot: selSlot!, durationHrs: hrs, note: note || undefined, estTotal: total,
      })
    }, 1400)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={step === 1 ? onClose : undefined} />
      <div className="relative z-10 rounded-t-3xl flex flex-col" style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '90%' }}>

        {/* Handle + header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />

          {/* Steps */}
          {!booked && (
            <div className="flex items-center gap-1 mb-4">
              {(['Date & Time','Details','Confirm'] as const).map((label, idx) => {
                const s = idx + 1
                return (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all`}
                      style={{ background: step > s ? '#55A67A' : step === s ? 'linear-gradient(135deg,#EE674E,#F47B66)' : '#F0E8E4', color: step >= s ? 'white' : '#B0A8A4' }}>
                      {step > s ? '✓' : s}
                    </div>
                    <span className={`text-[11px] font-semibold flex-1 ${step === s ? 'text-[#EE674E]' : step > s ? 'text-[#55A67A]' : 'text-[#B0A8A4]'}`}>{label}</span>
                    {s < 3 && <div className="w-3 h-px bg-[#F0E8E4]" />}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${provider.color},${provider.color}cc)` }}>{provider.name[0]}</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">{booked ? 'Booking Confirmed!' : 'Request Booking'}</h3>
              <p className="text-xs text-[#6E6E73]">{provider.name} · {provider.role} · {provider.price}</p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">

          {booked ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-20 h-20 rounded-full bg-[#E6F4ED] flex items-center justify-center text-4xl pop-in">🎉</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Request Sent!</p>
                <p className="text-sm text-[#6E6E73] mt-1">{provider.name} will confirm within 2 hours</p>
              </div>
              <div className="w-full glass-card rounded-2xl p-4 space-y-2.5">
                {[
                  { icon: '👤', label: 'Provider', val: provider.name },
                  { icon: '📅', label: 'Date', val: selDay! },
                  { icon: '🕐', label: 'Time', val: selSlot! },
                  { icon: '⏱', label: 'Duration', val: selDur },
                  { icon: '💰', label: 'Est. Total', val: total },
                ].map((r,i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-base w-5 text-center">{r.icon}</span>
                    <p className="text-xs text-[#6E6E73] w-16 flex-shrink-0">{r.label}</p>
                    <p className="text-sm font-semibold text-[#242424]">{r.val}</p>
                  </div>
                ))}
              </div>
              <button onClick={onClose}
                className="action-btn w-full py-3.5 rounded-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
                Done
              </button>
            </div>
          ) : step === 1 ? (<>
            {/* Day picker */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Select a day</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map(d => {
                  const parts = d.split(' ')
                  return (
                    <button key={d} onClick={() => setSelDay(d)}
                      className="action-btn flex-shrink-0 flex flex-col items-center py-2.5 px-3 rounded-2xl min-w-[58px]"
                      style={selDay === d
                        ? { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 3px 0 #C94930' }
                        : { background: '#F8F4F2', border: '2px solid #F0E8E4' }}>
                      <span className={`text-[10px] font-semibold ${selDay === d ? 'text-white/80' : 'text-[#6E6E73]'}`}>{parts[0]}</span>
                      <span className={`text-base font-bold ${selDay === d ? 'text-white' : 'text-[#242424]'}`}>{parts[2]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Select a time</p>
              <div className="grid grid-cols-4 gap-2">
                {slots.map(s => (
                  <button key={s} onClick={() => setSelSlot(s)}
                    className="action-btn py-2.5 rounded-xl text-xs font-semibold"
                    style={selSlot === s
                      ? { background: '#FFD6C9', border: '2px solid #EE674E', color: '#EE674E', boxShadow: '0 3px 0 #F6B6A5' }
                      : { background: '#F8F4F2', border: '2px solid #F0E8E4', color: '#6E6E73' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Duration</p>
              <div className="flex gap-2">
                {durations.map(d => (
                  <button key={d} onClick={() => setSelDur(d)}
                    className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold"
                    style={selDur === d
                      ? { background: '#FFD6C9', border: '2px solid #EE674E', color: '#EE674E', boxShadow: '0 3px 0 #F6B6A5' }
                      : { background: '#F0E8E4', border: '2px solid #E8E0DC', color: '#6E6E73' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {selDay && selSlot && (
              <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: '#E6F4ED', border: '1.5px solid #A8D9BC' }}>
                <span className="text-xl">💰</span>
                <div>
                  <p className="text-xs text-[#6E6E73]">Estimated total</p>
                  <p className="font-bold text-[#242424]">{total} <span className="font-normal text-xs text-[#6E6E73]">for {selDur}</span></p>
                </div>
              </div>
            )}

          </>) : step === 2 ? (<>
            {/* Additional notes */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Special instructions <span className="font-normal normal-case text-[#B0A8A4]">(optional)</span></p>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder={`Any notes for ${provider.name.split(' ')[0]}? e.g. allergies, routines, gate code…`}
                rows={3} className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4] resize-none" />
            </div>

            {/* Summary */}
            <div className="glass-card rounded-2xl p-4 space-y-2.5">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Booking summary</p>
              {[
                { icon: '👤', label: 'Provider', val: `${provider.name} · ${provider.role}` },
                { icon: '📅', label: 'Date', val: selDay! },
                { icon: '🕐', label: 'Time', val: selSlot! },
                { icon: '⏱', label: 'Duration', val: selDur },
                { icon: '💰', label: 'Est. Total', val: total },
              ].map((r,i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-base w-5 text-center">{r.icon}</span>
                  <p className="text-xs text-[#6E6E73] w-16 flex-shrink-0">{r.label}</p>
                  <p className="text-sm font-semibold text-[#242424] flex-1">{r.val}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
              <p className="text-xs text-[#7A6010]">ℹ️ Payment is collected after the session is completed. You can cancel up to 24 hours before.</p>
            </div>

          </>) : null}
        </div>

        {/* Footer */}
        {!booked && (
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
              onClick={() => step < 2 ? setStep(2) : handleBook()}
              disabled={(step === 1 && !canNext) || booking}
              className="action-btn flex-1 py-3.5 rounded-2xl font-bold text-sm text-white"
              style={(step === 1 && !canNext) || booking
                ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
                : { background: `linear-gradient(135deg,${provider.color},${provider.color}cc)`, border: `2px solid ${provider.color}99`, boxShadow: `0 4px 0 ${provider.color}66` }}>
              {booking
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Sending…</span>
                : step === 1 ? 'Next — Add Details →' : 'Confirm Booking 🎉'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


export function MarketplaceSubScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [messageProvider, setMessageProvider] = useState<Provider | null>(null)
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null)
  const { bookings, save: saveBooking } = useBookings(DEMO_CHILD_ID)

  const categories = [
    { icon: '👶', label: 'Babysitters', color: '#EE674E', bg: '#FFD6C9' },
    { icon: '🏠', label: 'Nannies',     color: '#6299D5', bg: '#EBF2FC' },
    { icon: '💆', label: 'Postpartum',  color: '#B0A0F0', bg: '#F0EEF9' },
    { icon: '🧹', label: 'Cleaning',    color: '#55A67A', bg: '#E6F4ED' },
    { icon: '🍳', label: 'Meal Prep',   color: '#C49B30', bg: '#FEF7E0' },
    { icon: '📸', label: 'Photography', color: '#F47B66', bg: '#FEEAE6' },
  ]

  const filtered = ALL_PROVIDERS.filter(p => {
    const matchCat = !activeCategory || p.category === activeCategory
    const matchQ = !query.trim() || p.name.toLowerCase().includes(query.toLowerCase()) || p.role.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchQ
  })

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Marketplace" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">

        {/* Search */}
        <div className="cartoon-input flex items-center gap-2 px-3 py-2.5">
          <span className="text-base">🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="What do you need help with?"
            className="flex-1 bg-transparent text-sm text-[#242424] placeholder-[#C0B8B4] outline-none" />
          {query && (
            <button onClick={() => setQuery('')} className="action-btn text-[#B0A8A4] text-sm">✕</button>
          )}
        </div>

        {/* Categories */}
        <div>
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Categories</p>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((c, i) => (
              <button key={i} onClick={() => setActiveCategory(activeCategory === c.label ? null : c.label)}
                className="action-btn py-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all"
                style={activeCategory === c.label
                  ? { background: c.bg, border: `2.5px solid ${c.color}`, boxShadow: `0 4px 0 ${c.color}55` }
                  : { background: c.bg, border: `1.5px solid ${c.color}33` }}>
                <span className="text-2xl">{c.icon}</span>
                <span className="text-[10px] font-bold text-[#242424]">{c.label}</span>
                {activeCategory === c.label && <div className="w-1 h-1 rounded-full" style={{ background: c.color }} />}
              </button>
            ))}
          </div>
          {activeCategory && (
            <button onClick={() => setActiveCategory(null)}
              className="action-btn mt-2 w-full py-2 rounded-xl text-xs font-semibold text-[#6E6E73]"
              style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
              ✕ Clear filter: {activeCategory}
            </button>
          )}
        </div>

        {/* Providers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">
              {activeCategory ? activeCategory : 'Top Providers Near You'}
            </p>
            <p className="text-xs text-[#6E6E73]">{filtered.length} found</p>
          </div>

          {filtered.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
              <span className="text-3xl">🔍</span>
              <p className="font-semibold text-sm text-[#242424]">No providers found</p>
              <p className="text-xs text-[#6E6E73]">Try a different search or category</p>
              <button onClick={() => { setQuery(''); setActiveCategory(null) }}
                className="action-btn px-4 py-2 rounded-xl text-xs font-bold text-[#EE674E]"
                style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5' }}>Clear filters</button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p, i) => (
                <div key={i} className="glass-card rounded-2xl p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${p.color},${p.color}cc)` }}>{p.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-sm text-[#242424]">{p.name}</p>
                        {p.verified && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-[#6299D5]" style={{ background: '#EBF2FC' }}>✓ Verified</span>}
                      </div>
                      <p className="text-xs text-[#6E6E73]">{p.role}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs font-semibold text-[#C49B30]">⭐ {p.rating}</span>
                        <span className="text-[10px] text-[#6E6E73]">{p.reviews} reviews</span>
                        <span className="text-xs font-bold text-[#242424]">{p.price}</span>
                      </div>
                      <p className="text-[10px] text-[#55A67A] font-medium mt-0.5">🟢 {p.avail}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setMessageProvider(p)}
                      className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-[#EE674E] flex items-center justify-center gap-1"
                      style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5', boxShadow: '0 2px 0 #F6B6A5' }}>
                      💬 Message
                    </button>
                    <button onClick={() => setBookingProvider(p)}
                      className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1"
                      style={{ background: `linear-gradient(135deg,${p.color},${p.color}cc)`, border: `1.5px solid ${p.color}99`, boxShadow: `0 3px 0 ${p.color}66` }}>
                      📅 Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Requests — real persisted bookings, see docs/ARCHITECTURE.md §6/§13 */}
        {bookings.length > 0 && (
          <div>
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">My Requests</p>
            <div className="space-y-2">
              {bookings.map(b => (
                <div key={b.id} className="glass-card rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#242424] truncate">{b.providerName}</p>
                    <p className="text-xs text-[#6E6E73]">{b.day} · {b.slot} · {b.durationHrs} hrs</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ background: '#FEF3CD', color: '#B8860B' }}>
                    Requested
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {messageProvider && <MessageSheet provider={messageProvider} onClose={() => setMessageProvider(null)} />}
    {bookingProvider && <BookingSheet provider={bookingProvider} onClose={() => setBookingProvider(null)} onSave={saveBooking} />}
    </>
  )
}
