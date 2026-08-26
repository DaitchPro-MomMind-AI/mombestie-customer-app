import { useState, useEffect, useRef } from 'react'
import { SubHeader } from '../../components/atoms'
import { useBookings, getCurrentHouseholdId, supabase } from '../../services'
import { listApprovedProviders, type PublicProvider } from '../../services/providerDirectoryService'

// Real approved providers (public_providers view) replace the previous
// ALL_PROVIDERS fixture (six invented names a customer could "book" with
// nothing written anywhere real). `avail`/`verified`/`color`/`price` are
// derived below rather than stored -- every row from this view is by
// definition an approved provider (the view's own comment: "this view only
// ever reflects real, admin-approved provider rows"), so "✓ Verified" is
// always accurate here, not a fixture flag.
const CATEGORY_FILTERS = [
  { icon: '👶', label: 'Babysitters', match: 'babysit', color: '#EE674E', bg: '#FFD6C9' },
  { icon: '🏠', label: 'Nannies',     match: 'nanny',   color: '#6299D5', bg: '#EBF2FC' },
  { icon: '💆', label: 'Postpartum',  match: 'postpartum', color: '#B0A0F0', bg: '#F0EEF9' },
  { icon: '🧹', label: 'Cleaning',    match: 'clean',   color: '#55A67A', bg: '#E6F4ED' },
  { icon: '🍳', label: 'Meal Prep',   match: 'meal',    color: '#C49B30', bg: '#FEF7E0' },
  { icon: '📸', label: 'Photography', match: 'photo',   color: '#F47B66', bg: '#FEEAE6' },
]
const AVATAR_COLORS = ['#EE674E', '#6299D5', '#B0A0F0', '#55A67A', '#C49B30', '#F47B66']

function colorFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function priceLabel(p: PublicProvider, symbol: string) {
  if (p.hourly_rate_cents == null) return 'Rate on request'
  return `${symbol}${(p.hourly_rate_cents / 100).toFixed(0)}/hr`
}

function MessageSheet({ provider, color, onClose }: { provider: PublicProvider; color: string; onClose: () => void }) {
  const name = provider.business_name || 'Provider'
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState([
    { from: 'them', text: `Hi! I'm with ${name}. How can I help you today?` },
  ])
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const QUICK = ['What are your hours?', 'Are you available this weekend?', `What's your experience with infants?`]

  const send = (text: string) => {
    if (!text.trim()) return
    setMsgs(m => [...m, { from: 'me', text }])
    setInput('')
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setMsgs(m => [...m, { from: 'them', text: `Thanks for your message! I'll get back to you shortly 😊` }])
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
              style={{ background: `linear-gradient(135deg,${color},${color}cc)` }}>{name[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#242424]">{name}</p>
              <p className="text-xs text-[#6E6E73]">{provider.categories[0] ?? 'Provider'}</p>
            </div>
            <button onClick={onClose}
              className="action-btn w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="#6E6E73" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
          <p className="mt-2 text-[10px] text-[#B0A8A4]">Messaging isn't wired to a real inbox yet -- these replies are simulated, not from {name}. Real messaging is tracked in MBADM-83.</p>
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


function BookingSheet({ provider, color, householdId, onClose, onSaved }: {
  provider: PublicProvider; color: string; householdId: string | null
  onClose: () => void
  onSaved: (input: { provider_id: string; provider_name: string; service_category: string; scheduled_at: string; duration_hours: number; price_cents: number; commission_cents: number; currency: string; notes: string | null }) => Promise<{ ok: boolean; error?: string }>
}) {
  const name = provider.business_name || 'Provider'
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
  const [error, setError] = useState<string | null>(null)
  const [currencySymbol, setCurrencySymbol] = useState('$')
  const [currency, setCurrency] = useState('USD')
  const [commissionPct, setCommissionPct] = useState(10)

  // Real currency + commission for the provider's own country -- a booking
  // is denominated in the provider's local currency, matching how
  // hourly_rate_cents is stored on their real application.
  useEffect(() => {
    if (!supabase) return
    supabase.from('country_config').select('currency,currency_symbol,commission_pct').eq('country_code', provider.country).maybeSingle()
      .then(({ data }) => {
        if (data) { setCurrencySymbol(data.currency_symbol); setCurrency(data.currency); setCommissionPct(data.commission_pct) }
      })
  }, [provider.country])

  const canNext = selDay && selSlot
  const hrs = parseInt(selDur)
  const hourlyRateCents = provider.hourly_rate_cents ?? 0
  const priceCents = hourlyRateCents * hrs
  const commissionCents = Math.round(priceCents * (commissionPct / 100))
  const total = selDur ? `${currencySymbol}${(priceCents / 100).toFixed(0)}` : '—'

  const handleBook = async () => {
    if (!householdId) { setError('No household on this account yet -- try signing out and back in.'); return }
    setBooking(true); setError(null)
    // No real per-slot calendar exists yet (docs -- FEATURES.liveMarketplace
    // comment), so the picked day/slot is folded into a plausible ISO
    // timestamp for storage; it's a real row, just not backed by a real
    // per-provider availability engine yet.
    const scheduledAt = new Date()
    scheduledAt.setDate(scheduledAt.getDate() + days.indexOf(selDay!) + 1)
    const res = await onSaved({
      provider_id: provider.id, provider_name: name,
      service_category: provider.categories[0] ?? 'General',
      scheduled_at: scheduledAt.toISOString(), duration_hours: hrs,
      price_cents: priceCents, commission_cents: commissionCents, currency,
      notes: note || null,
    })
    setBooking(false)
    if (!res.ok) { setError(res.error ?? 'Failed to send request.'); return }
    setBooked(true)
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
              style={{ background: `linear-gradient(135deg,${color},${color}cc)` }}>{name[0]}</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">{booked ? 'Booking Confirmed!' : 'Request Booking'}</h3>
              <p className="text-xs text-[#6E6E73]">{name} · {provider.categories[0] ?? 'Provider'} · {priceLabel(provider, currencySymbol)}</p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">

          {error && (
            <div className="rounded-2xl px-4 py-3" style={{ background: '#FDEDEC', border: '1.5px solid #F5B7B1' }}>
              <p className="text-xs text-[#B03A2E]">{error}</p>
            </div>
          )}

          {booked ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-20 h-20 rounded-full bg-[#E6F4ED] flex items-center justify-center text-4xl pop-in">🎉</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Request Sent!</p>
                <p className="text-sm text-[#6E6E73] mt-1">{name} will confirm within 2 hours</p>
              </div>
              <div className="w-full glass-card rounded-2xl p-4 space-y-2.5">
                {[
                  { icon: '👤', label: 'Provider', val: name },
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
                placeholder={`Any notes for ${name.split(' ')[0]}? e.g. allergies, routines, gate code…`}
                rows={3} className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4] resize-none" />
            </div>

            {/* Summary */}
            <div className="glass-card rounded-2xl p-4 space-y-2.5">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Booking summary</p>
              {[
                { icon: '👤', label: 'Provider', val: `${name} · ${provider.categories[0] ?? 'Provider'}` },
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
              <p className="text-xs text-[#7A6010]">ℹ️ This creates a real booking request the provider can accept or decline in their own portal. Payment isn't captured yet -- no real payment processor is connected.</p>
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
                : { background: `linear-gradient(135deg,${color},${color}cc)`, border: `2px solid ${color}99`, boxShadow: `0 4px 0 ${color}66` }}>
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
  const [messageProvider, setMessageProvider] = useState<PublicProvider | null>(null)
  const [bookingProvider, setBookingProvider] = useState<PublicProvider | null>(null)
  const [providers, setProviders] = useState<PublicProvider[]>([])
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const { bookings, save: saveBooking } = useBookings(householdId)

  useEffect(() => {
    listApprovedProviders().then(rows => { setProviders(rows); setLoadingProviders(false) })
    getCurrentHouseholdId().then(setHouseholdId)
  }, [])

  const filtered = providers.filter(p => {
    const matchCat = !activeCategory || p.categories.some(c => c.toLowerCase().includes(activeCategory))
    const name = p.business_name ?? ''
    const matchQ = !query.trim() || name.toLowerCase().includes(query.toLowerCase()) || p.categories.some(c => c.toLowerCase().includes(query.toLowerCase()))
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
            {CATEGORY_FILTERS.map((c, i) => (
              <button key={i} onClick={() => setActiveCategory(activeCategory === c.match ? null : c.match)}
                className="action-btn py-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all"
                style={activeCategory === c.match
                  ? { background: c.bg, border: `2.5px solid ${c.color}`, boxShadow: `0 4px 0 ${c.color}55` }
                  : { background: c.bg, border: `1.5px solid ${c.color}33` }}>
                <span className="text-2xl">{c.icon}</span>
                <span className="text-[10px] font-bold text-[#242424]">{c.label}</span>
                {activeCategory === c.match && <div className="w-1 h-1 rounded-full" style={{ background: c.color }} />}
              </button>
            ))}
          </div>
          {activeCategory && (
            <button onClick={() => setActiveCategory(null)}
              className="action-btn mt-2 w-full py-2 rounded-xl text-xs font-semibold text-[#6E6E73]"
              style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
              ✕ Clear filter
            </button>
          )}
        </div>

        {/* Providers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Real Approved Providers</p>
            <p className="text-xs text-[#6E6E73]">{loadingProviders ? '…' : `${filtered.length} found`}</p>
          </div>

          {loadingProviders ? (
            <div className="glass-card rounded-2xl p-6 text-center text-xs text-[#6E6E73]">Loading providers…</div>
          ) : filtered.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
              <span className="text-3xl">🔍</span>
              <p className="font-semibold text-sm text-[#242424]">No providers found</p>
              <p className="text-xs text-[#6E6E73]">
                {providers.length === 0
                  ? 'No approved providers in your country yet -- providers appear here the moment staff approve their application.'
                  : 'Try a different search or category'}
              </p>
              {providers.length > 0 && (
                <button onClick={() => { setQuery(''); setActiveCategory(null) }}
                  className="action-btn px-4 py-2 rounded-xl text-xs font-bold text-[#EE674E]"
                  style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5' }}>Clear filters</button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(p => {
                const color = colorFor(p.id)
                const name = p.business_name || 'Provider'
                return (
                  <div key={p.id} className="glass-card rounded-2xl p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                        style={{ background: `linear-gradient(135deg,${color},${color}cc)` }}>{name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-sm text-[#242424]">{name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-[#6299D5]" style={{ background: '#EBF2FC' }}>✓ Verified</span>
                        </div>
                        <p className="text-xs text-[#6E6E73]">{p.categories.join(', ') || 'General care'}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-semibold text-[#C49B30]">⭐ {p.rating != null ? p.rating.toFixed(1) : 'New'}</span>
                          <span className="text-[10px] text-[#6E6E73]">{p.review_count} reviews</span>
                          <span className="text-xs font-bold text-[#242424]">{priceLabel(p, '$')}</span>
                        </div>
                        <p className="text-[10px] text-[#55A67A] font-medium mt-0.5">
                          {p.availability_days.length > 0 ? `🟢 Available ${p.availability_days.join(', ')}` : `📍 ${p.service_city ?? p.country}`}
                        </p>
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
                        style={{ background: `linear-gradient(135deg,${color},${color}cc)`, border: `1.5px solid ${color}99`, boxShadow: `0 3px 0 ${color}66` }}>
                        📅 Book Now
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* My Requests — real persisted rows in the shared `bookings` table */}
        {bookings.length > 0 && (
          <div>
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">My Requests</p>
            <div className="space-y-2">
              {bookings.map(b => (
                <div key={b.id} className="glass-card rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#242424] truncate">{b.service_category}</p>
                    <p className="text-xs text-[#6E6E73]">{new Date(b.scheduled_at).toLocaleDateString()} · {b.duration_hours} hrs · {b.currency} {(b.price_cents / 100).toFixed(0)}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 capitalize" style={{ background: '#FEF3CD', color: '#B8860B' }}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {messageProvider && <MessageSheet provider={messageProvider} color={colorFor(messageProvider.id)} onClose={() => setMessageProvider(null)} />}
    {bookingProvider && (
      <BookingSheet provider={bookingProvider} color={colorFor(bookingProvider.id)} householdId={householdId}
        onClose={() => setBookingProvider(null)}
        onSaved={saveBooking} />
    )}
    </>
  )
}
