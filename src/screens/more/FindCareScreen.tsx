import { useEffect, useState } from 'react'
import { SubHeader } from '../../components/atoms'
import { getCountryCapabilities, type CountryCapabilities } from '../../services'
import { supabase } from '../../services/supabaseClient'

const SERVICES = ['Pediatrician', 'Pediatric Urgent Care', 'Family Physician', 'Telehealth', 'Pediatric Specialist']
const WHEN = ['Today', 'This Week', 'Any Time']

interface HealthcareResult {
  id: string; practice_name: string | null; specialty: string; credential_type: string
  languages: string[]; telehealth_enabled: boolean; in_person_enabled: boolean
  rating: number | null; review_count: number
}

export function FindCareSubScreen({ onBack }: { onBack: () => void }) {
  const [caps, setCaps] = useState<CountryCapabilities | null>(null)
  const [service, setService] = useState(SERVICES[0])
  const [when, setWhen] = useState(WHEN[0])
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState<HealthcareResult[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => { getCountryCapabilities().then(setCaps) }, [])

  const search = async () => {
    setSearching(true)
    setSearched(true)
    if (supabase) {
      const { data, error } = await supabase
        .from('public_healthcare_providers')
        .select('id,practice_name,specialty,credential_type,languages,telehealth_enabled,in_person_enabled,rating,review_count')
        .ilike('specialty', `%${service}%`)
      if (error) console.error('Find Care search failed:', error.message)
      setResults((data ?? []) as HealthcareResult[])
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

        <div className="glass-card rounded-2xl p-4 space-y-3">
          <div>
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Service</p>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map(s => (
                <button key={s} onClick={() => setService(s)}
                  className="action-btn px-3 py-2 rounded-xl text-xs font-semibold"
                  style={service === s ? { background: '#EBF2FC', border: '2px solid #6299D5', color: '#3D6FA8' } : { background: '#F0E8E4', border: '2px solid #E8E0DC', color: '#6E6E73' }}>
                  {s}
                </button>
              ))}
            </div>
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
            <p className="text-xs text-[#6E6E73] mt-1">No real, admin-approved {service.toLowerCase()} providers are onboarded in your area yet.</p>
          </div>
        )}

        {results.map(r => (
          <div key={r.id} className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#EBF2FC' }}>🩺</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#242424]">{r.practice_name ?? r.credential_type}</p>
              <p className="text-xs text-[#6E6E73]">{r.specialty} · {r.credential_type}</p>
              {r.rating != null && <p className="text-xs text-[#6E6E73]">⭐ {r.rating} ({r.review_count})</p>}
            </div>
          </div>
        ))}

        <p className="text-[10px] text-[#B0A8A4] text-center px-4 pt-2">Results reflect only real, license-verified providers who have completed MomMind's admin approval process. We never show unverified or estimated availability.</p>
      </div>
    </div>
  )
}
