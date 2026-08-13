import { useEffect, useState } from 'react'
import { SubHeader } from '../../components/atoms'
import { getCountryCapabilities, getLocalDiscoverySources, type CountryCapabilities, type LocalDiscoverySourceStatus } from '../../services'

const CATEGORIES: { key: LocalDiscoverySourceStatus['category']; icon: string; label: string; examples: string }[] = [
  { key: 'food', icon: '🍽️', label: 'Food', examples: 'Baby-friendly restaurants, grocery, snacks' },
  { key: 'shopping', icon: '🛍️', label: 'Shopping', examples: 'Clothing, supplies, toys, safety products' },
  { key: 'activities_entertainment', icon: '🎡', label: 'Activities & Entertainment', examples: 'Parks, museums, indoor playgrounds, classes' },
]

export function ExploreSubScreen({ onBack }: { onBack: () => void }) {
  const [caps, setCaps] = useState<CountryCapabilities | null>(null)
  const [sources, setSources] = useState<LocalDiscoverySourceStatus[]>([])
  const [category, setCategory] = useState<LocalDiscoverySourceStatus['category']>('activities_entertainment')
  const [prompt, setPrompt] = useState('')
  const [asked, setAsked] = useState(false)

  useEffect(() => {
    getCountryCapabilities().then(c => {
      setCaps(c)
      if (c) getLocalDiscoverySources(c.countryCode).then(setSources)
    })
  }, [])

  const sourceForCategory = sources.find(s => s.category === category)
  const isLive = sourceForCategory?.status === 'active'

  return (
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Explore With Baby" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 pt-2 space-y-3">
        <div className="glass-card-strong rounded-2xl p-4" style={{ background: 'linear-gradient(135deg,#E6F4ED,#F2FBF6)' }}>
          <p className="text-2xl mb-1">🗺️</p>
          <p className="font-display text-base text-[#242424]">Discover Places For Baby</p>
          <p className="text-xs text-[#6E6E73] mt-1">Find food, shopping, and activities nearby — real local results only, never invented businesses.</p>
        </div>

        {!(caps?.localDiscoveryEnabled ?? false) && (
          <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
            <p className="text-xs text-[#7A6010]">
              {caps ? `Local discovery isn't enabled for ${caps.countryName} yet.` : 'Checking availability for your country…'}
            </p>
          </div>
        )}

        {/* Ask MomBestie */}
        <div className="glass-card rounded-2xl p-4 space-y-2">
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Ask MomBestie</p>
          <div className="flex gap-2">
            <input value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="What can I do with my toddler this afternoon?"
              className="cartoon-input flex-1 px-3.5 py-2.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
            <button onClick={() => setAsked(true)}
              className="action-btn px-4 rounded-xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#55A67A,#78C49A)', border: '2px solid #3D8A60' }}>
              Ask
            </button>
          </div>
          {asked && (
            <div className="rounded-xl px-3.5 py-3" style={{ background: '#FFF3EE', border: '1px solid #F6B6A5' }}>
              <p className="text-xs text-[#7A5040] leading-relaxed">
                I don't have a real local-places source connected for your area yet, so I can't recommend specific businesses or events without making them up — and I won't do that. Try the Fun & Development library instead for activities you can do right at home.
              </p>
            </div>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              className="action-btn flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
              style={category === c.key
                ? { background: 'linear-gradient(135deg,#55A67A,#78C49A)', color: 'white', border: '2px solid #3D8A60' }
                : { background: '#F0E8E4', color: '#6E6E73', border: '2px solid #E8E0DC' }}>
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl px-4 py-6 text-center" style={{ background: '#F0E8E4' }}>
          <p className="text-2xl mb-1">{CATEGORIES.find(c => c.key === category)?.icon}</p>
          <p className="text-sm font-semibold text-[#242424]">
            {isLive ? 'No results yet' : 'Not connected yet'}
          </p>
          <p className="text-xs text-[#6E6E73] mt-1 px-4">
            {sourceForCategory
              ? `Data source status: ${sourceForCategory.status.replace('_', ' ')}${sourceForCategory.vendorName ? ` (${sourceForCategory.vendorName})` : ''}.`
              : 'No local data source configured for this category yet.'} We only ever show real, verified places — see {CATEGORIES.find(c => c.key === category)?.examples.toLowerCase()}.
          </p>
        </div>
      </div>
    </div>
  )
}
