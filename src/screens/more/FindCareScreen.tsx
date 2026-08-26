import { useEffect, useState } from 'react'
import { SubHeader } from '../../components/atoms'
import { getCountryCapabilities, getCurrentHouseholdId, getInsuranceInfo, requestAppointment, type CountryCapabilities } from '../../services'
import { supabase } from '../../services/supabaseClient'

// MBCST-31: fallback shown only until the real distinct specialties load
// below -- never the final option set, so a real specialty that doesn't
// match one of these common labels is never silently unreachable.
const FALLBACK_SERVICES = ['Pediatrician', 'Pediatric Urgent Care', 'Family Physician', 'Telehealth', 'Pediatric Specialist']
const WHEN = ['Today', 'This Week', 'Any Time']
const LANGUAGES = ['English', 'Spanish', 'Bengali', 'Japanese', 'French', 'Mandarin', 'Arabic']

interface HealthcareResult {
  id: string; practice_name: string | null; specialty: string; credential_type: string
  languages: string[]; telehealth_enabled: boolean; in_person_enabled: boolean
  service_city: string | null; service_postal_code: string | null
  accepted_insurance_networks: string[]; rating: number | null; review_count: number
}

function DoctorProfileSheet({ result, householdId, insurerName, onClose }: {
  result: HealthcareResult; householdId: string | null; insurerName: string | null; onClose: () => void
}) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const insuranceMatch = insurerName && result.accepted_insurance_networks.some(n => n.toLowerCase().includes(insurerName.toLowerCase()) || insurerName.toLowerCase().includes(n.toLowerCase()))

  const submit = async () => {
    if (!householdId || !date || !time) return
    setRequesting(true)
    setError(null)
    const scheduledAt = new Date(`${date}T${time}`).toISOString()
    const { data: userData } = supabase ? await supabase.auth.getUser() : { data: { user: null } }
    if (!userData.user) { setError('Sign in to request an appointment.'); setRequesting(false); return }
    const res = await requestAppointment({
      household_id: householdId,
      created_by: userData.user.id,
      category: 'medical',
      title: `${result.specialty} — ${result.practice_name ?? result.credential_type}`,
      scheduled_at: scheduledAt,
      duration_minutes: 30,
      healthcare_provider_id: result.id,
      notes: notes.trim() || null,
    })
    setRequesting(false)
    if (!res.ok) { setError(res.error ?? 'Something went wrong.'); return }
    setRequested(true)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col" style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '90%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: '#EBF2FC' }}>🩺</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg text-[#242424] leading-tight">{result.practice_name ?? result.credential_type}</h3>
              <p className="text-xs text-[#6E6E73] mt-0.5">{result.specialty} · {result.credential_type}</p>
            </div>
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-3">
          <div className="glass-card rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-[#6E6E73]">Location</span><span className="text-[#242424]">{result.service_city ?? '—'}{result.service_postal_code ? `, ${result.service_postal_code}` : ''}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#6E6E73]">Languages</span><span className="text-[#242424]">{result.languages.join(', ') || '—'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#6E6E73]">Options</span><span className="text-[#242424]">{[result.in_person_enabled && 'In-person', result.telehealth_enabled && 'Telehealth'].filter(Boolean).join(' · ') || '—'}</span></div>
            {result.rating != null && <div className="flex justify-between text-sm"><span className="text-[#6E6E73]">Rating</span><span className="text-[#242424]">⭐ {result.rating} ({result.review_count})</span></div>}
          </div>

          {result.accepted_insurance_networks.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Accepted insurance networks</p>
              <div className="flex flex-wrap gap-1.5">
                {result.accepted_insurance_networks.map(n => (
                  <span key={n} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: insuranceMatch ? '#E6F4ED' : '#F0E8E4', color: insuranceMatch ? '#3D8A60' : '#6E6E73' }}>{n}</span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl px-3.5 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
            <p className="text-xs text-[#7A6010]">Insurance network information can change. Please confirm coverage with your insurance company and healthcare provider before receiving care.</p>
          </div>

          {!householdId ? (
            <div className="rounded-2xl px-4 py-4 text-center" style={{ background: '#F0E8E4' }}>
              <p className="text-sm text-[#6E6E73]">Sign in to request an appointment.</p>
            </div>
          ) : requested ? (
            <div className="rounded-2xl px-4 py-4 text-center" style={{ background: '#E6F4ED', border: '1.5px solid #A8D9BC' }}>
              <p className="text-sm font-semibold text-[#3D8A60]">✓ Appointment requested — view it in Planner</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Request an appointment</p>
              {error && <div className="rounded-xl px-3 py-2 text-xs text-[#D9534F]" style={{ background: '#FAECEC', border: '1px solid #ECA0A0' }}>{error}</div>}
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="cartoon-input px-3 py-2.5 text-sm text-[#242424]" />
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="cartoon-input px-3 py-2.5 text-sm text-[#242424]" />
              </div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What's this visit for? (optional)" rows={2}
                className="cartoon-input w-full px-3.5 py-2.5 text-sm text-[#242424] placeholder-[#C0B8B4] resize-none" />
              <button onClick={submit} disabled={!date || !time || requesting}
                className="action-btn w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#6299D5,#7FB0E8)' }}>
                {requesting ? 'Requesting…' : 'Request Appointment'}
              </button>
              <p className="text-[10px] text-[#B0A8A4]">This sends a request — the provider still needs to confirm it (Provider Portal doesn't yet have a real accept/decline flow for healthcare appointments, a documented next step).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function FindCareSubScreen({ onBack }: { onBack: () => void }) {
  const [caps, setCaps] = useState<CountryCapabilities | null>(null)
  const [services, setServices] = useState<string[]>(FALLBACK_SERVICES)
  const [service, setService] = useState(FALLBACK_SERVICES[0])
  const [when, setWhen] = useState(WHEN[0])
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState<HealthcareResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<HealthcareResult | null>(null)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [insurerName, setInsurerName] = useState<string | null>(null)

  useEffect(() => {
    getCountryCapabilities().then(setCaps)
    getCurrentHouseholdId().then(async id => {
      setHouseholdId(id)
      if (id) {
        const info = await getInsuranceInfo(id)
        setInsurerName(info?.insurer_name ?? null)
      }
    })
    // MBCST-31: derive the specialty filter list from real distinct values
    // in public_healthcare_providers instead of only the static fallback,
    // so a real specialty that isn't one of the common labels above is
    // still selectable.
    if (supabase) {
      supabase.from('public_healthcare_providers').select('specialty').then(({ data, error }) => {
        if (error || !data) return
        const real = Array.from(new Set(data.map(r => r.specialty).filter(Boolean))).sort()
        if (real.length > 0) { setServices(real); setService(real[0]) }
      })
    }
  }, [])

  const toggleLanguage = (l: string) => setLanguages(ls => ls.includes(l) ? ls.filter(x => x !== l) : [...ls, l])

  const search = async () => {
    setSearching(true)
    setSearched(true)
    if (supabase) {
      let query = supabase.from('public_healthcare_providers')
        .select('id,practice_name,specialty,credential_type,languages,telehealth_enabled,in_person_enabled,service_city,service_postal_code,accepted_insurance_networks,rating,review_count')
        .ilike('specialty', `%${service}%`)
      if (city.trim()) query = query.ilike('service_city', `%${city.trim()}%`)
      if (postalCode.trim()) query = query.eq('service_postal_code', postalCode.trim())
      if (when === 'Today') query = query.eq('telehealth_enabled', true) // proxy: no live calendar exists, telehealth is the only same-day-realistic option we can honestly claim
      const { data, error } = await query
      if (error) console.error('Find Care search failed:', error.message)
      let rows = (data ?? []) as HealthcareResult[]
      if (languages.length > 0) rows = rows.filter(r => languages.some(l => r.languages.includes(l)))
      if (insurerName) {
        rows = rows.slice().sort((a, b) => {
          const aMatch = a.accepted_insurance_networks.some(n => n.toLowerCase().includes(insurerName.toLowerCase())) ? 0 : 1
          const bMatch = b.accepted_insurance_networks.some(n => n.toLowerCase().includes(insurerName.toLowerCase())) ? 0 : 1
          return aMatch - bMatch
        })
      }
      setResults(rows)
    } else {
      setResults([])
    }
    setSearching(false)
  }

  const enabled = caps?.healthcareBookingEnabled ?? false

  return (
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Find Care" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 pt-2 space-y-3">
        <div className="glass-card-strong rounded-2xl p-4" style={{ background: 'linear-gradient(135deg,#EBF2FC,#F5F9FF)' }}>
          <p className="text-2xl mb-1">🩺</p>
          <p className="font-display text-base text-[#242424]">Find Care Near You</p>
          <p className="text-xs text-[#6E6E73] mt-1">Search verified pediatricians, urgent care, and telehealth — never invented results, only real, admin-approved providers.</p>
        </div>

        {!enabled && (
          <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
            <p className="text-xs text-[#7A6010]">
              {caps ? `Doctor booking isn't enabled for ${caps.countryName} yet — we're working on adding a real, verified provider directory.` : 'Checking availability for your country…'}
            </p>
          </div>
        )}

        {insurerName && (
          <div className="rounded-xl px-3.5 py-2.5" style={{ background: '#E6F4ED', border: '1px solid #A8D9BC' }}>
            <p className="text-xs text-[#3D8A60]">🏥 Prioritizing results that accept <strong>{insurerName}</strong> (from your saved Insurance settings)</p>
          </div>
        )}

        <div className="glass-card rounded-2xl p-4 space-y-3">
          <div>
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Service</p>
            <div className="flex flex-wrap gap-2">
              {services.map(s => (
                <button key={s} onClick={() => setService(s)}
                  className="action-btn px-3 py-2 rounded-xl text-xs font-semibold"
                  style={service === s ? { background: '#EBF2FC', border: '2px solid #6299D5', color: '#3D6FA8' } : { background: '#F0E8E4', border: '2px solid #E8E0DC', color: '#6E6E73' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="cartoon-input px-3.5 py-2.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
            <input value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="ZIP / postal code" className="cartoon-input px-3.5 py-2.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">When</p>
            <div className="flex gap-2">
              {WHEN.map(w => (
                <button key={w} onClick={() => setWhen(w)}
                  className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold"
                  style={when === w ? { background: '#EBF2FC', border: '2px solid #6299D5', color: '#3D6FA8' } : { background: '#F0E8E4', border: '2px solid #E8E0DC', color: '#6E6E73' }}>
                  {w}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Language</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(l => (
                <button key={l} onClick={() => toggleLanguage(l)}
                  className="action-btn px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={languages.includes(l) ? { background: '#EBF2FC', border: '2px solid #6299D5', color: '#3D6FA8' } : { background: '#F0E8E4', border: '2px solid #E8E0DC', color: '#6E6E73' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button onClick={search} disabled={searching}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#6299D5,#7FB0E8)', border: '2px solid #3D6FA8', boxShadow: '0 4px 0 #3D6FA8' }}>
            {searching ? 'Searching…' : '🔍 Find Care'}
          </button>
        </div>

        {searched && !searching && results.length === 0 && (
          <div className="rounded-2xl px-4 py-6 text-center" style={{ background: '#F0E8E4' }}>
            <p className="text-2xl mb-1">🔍</p>
            <p className="text-sm font-semibold text-[#242424]">No verified providers found</p>
            <p className="text-xs text-[#6E6E73] mt-1">No real, admin-approved {service.toLowerCase()} providers match these filters in your area yet.</p>
          </div>
        )}

        {results.map(r => {
          const insuranceMatch = insurerName && r.accepted_insurance_networks.some(n => n.toLowerCase().includes(insurerName.toLowerCase()))
          return (
            <button key={r.id} onClick={() => setSelected(r)} className="action-btn w-full text-left glass-card rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#EBF2FC' }}>🩺</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-sm text-[#242424]">{r.practice_name ?? r.credential_type}</p>
                  {insuranceMatch && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#E6F4ED', color: '#3D8A60' }}>IN-NETWORK</span>}
                </div>
                <p className="text-xs text-[#6E6E73]">{r.specialty} · {r.credential_type}{r.service_city ? ` · ${r.service_city}` : ''}</p>
                {r.rating != null && <p className="text-xs text-[#6E6E73]">⭐ {r.rating} ({r.review_count})</p>}
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#B0A8A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )
        })}

        <p className="text-[10px] text-[#B0A8A4] text-center px-4 pt-2">Results reflect only real, license-verified providers who have completed MomBestie's admin approval process. We never show unverified or estimated availability.</p>
      </div>

      {selected && (
        <DoctorProfileSheet result={selected} householdId={householdId} insurerName={insurerName} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
