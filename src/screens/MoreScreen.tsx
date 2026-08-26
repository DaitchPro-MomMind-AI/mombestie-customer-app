import { useState } from 'react'
import { useLang } from '../i18n'
import { Avatar } from '../components/atoms'
import { ProfileSubScreen, FamilySubScreen, CaregiverHandoffSubScreen } from './more/FamilyCareScreens'
import { ChildrenSubScreen } from './more/ChildrenScreen'
import { ToddlerMealsSubScreen } from './more/MealsScreen'
import { DevelopmentSubScreen } from './more/DevelopmentScreen'
import { BabySuppliesSubScreen } from './more/SuppliesScreen'
import { MemoryJournalSubScreen } from './more/JournalScreen'
import { MarketplaceSubScreen } from './more/MarketplaceScreen'
import { SubscriptionSubScreen } from './more/SubscriptionScreen'
import { NotificationsSubScreen } from './more/NotificationsScreen'
import { PrivacyCenterSubScreen } from './more/PrivacyCenterScreen'
import { SecuritySubScreen } from './more/SecurityScreen'
import { SettingsSubScreen } from './more/SettingsScreen'
import { FunDevelopmentSubScreen } from './more/FunDevelopmentScreen'
import { FindCareSubScreen } from './more/FindCareScreen'
import { ExploreSubScreen } from './more/ExploreScreen'

type MoreSub = 'profile' | 'children' | 'family' | 'handoff' | 'meals' | 'development' | 'supplies' | 'journal' | 'marketplace' | 'subscription' | 'notifications' | 'privacy' | 'security' | 'settings' | 'fun' | 'findcare' | 'explore' | null

export function MoreScreen({ onSignOut, darkMode, setDarkMode }: { onSignOut: () => void; darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const [sub, setSub] = useState<MoreSub>(null)

  if (sub === 'profile') return <ProfileSubScreen onBack={() => setSub(null)} />
  if (sub === 'children') return <ChildrenSubScreen onBack={() => setSub(null)} />
  if (sub === 'family') return <FamilySubScreen onBack={() => setSub(null)} />
  if (sub === 'handoff') return <CaregiverHandoffSubScreen onBack={() => setSub(null)} />
  if (sub === 'meals') return <ToddlerMealsSubScreen onBack={() => setSub(null)} />
  if (sub === 'development') return <DevelopmentSubScreen onBack={() => setSub(null)} />
  if (sub === 'supplies') return <BabySuppliesSubScreen onBack={() => setSub(null)} />
  if (sub === 'journal') return <MemoryJournalSubScreen onBack={() => setSub(null)} />
  if (sub === 'marketplace') return <MarketplaceSubScreen onBack={() => setSub(null)} />
  if (sub === 'subscription') return <SubscriptionSubScreen onBack={() => setSub(null)} />
  if (sub === 'notifications') return <NotificationsSubScreen onBack={() => setSub(null)} />
  if (sub === 'privacy') return <PrivacyCenterSubScreen onBack={() => setSub(null)} />
  if (sub === 'security') return <SecuritySubScreen onBack={() => setSub(null)} />
  if (sub === 'settings') return <SettingsSubScreen onBack={() => setSub(null)} darkMode={darkMode} setDarkMode={setDarkMode} />
  if (sub === 'fun') return <FunDevelopmentSubScreen onBack={() => setSub(null)} />
  if (sub === 'findcare') return <FindCareSubScreen onBack={() => setSub(null)} />
  if (sub === 'explore') return <ExploreSubScreen onBack={() => setSub(null)} />

  const { t } = useLang()
  const sections = [
    { label: t('section_family'), items: [
      { icon: '👶', label: 'Children', sub: 'Add or manage profiles', key: 'children' as MoreSub },
      { icon: '👨‍👩‍👧', label: t('family_caregivers'), sub: '3 members', key: 'family' as MoreSub },
      { icon: '📋', label: t('caregiver_handoff'), sub: 'Generate handoff', key: 'handoff' as MoreSub },
    ]},
    { label: t('section_baby_care'), items: [
      { icon: '🥣', label: t('toddler_meals'), sub: "Today's plan ready", key: 'meals' as MoreSub },
      { icon: '🌱', label: t('development_screen'), sub: '3 activities this week', key: 'development' as MoreSub },
      { icon: '📦', label: t('baby_supplies'), sub: '2 items running low', key: 'supplies' as MoreSub },
      { icon: '❤️', label: t('memory_journal'), sub: "Maya's Story", key: 'journal' as MoreSub },
    ]},
    { label: t('section_services'), items: [
      { icon: '🛍️', label: t('marketplace'), sub: 'Find family services', key: 'marketplace' as MoreSub },
    ]},
    { label: 'Health & Discovery', items: [
      { icon: '🎉', label: 'Fun & Development', sub: 'Age-based activity library', key: 'fun' as MoreSub },
      { icon: '🩺', label: 'Find Care', sub: 'Doctors & telehealth near you', key: 'findcare' as MoreSub },
      { icon: '🗺️', label: 'Explore With Baby', sub: 'Food, shopping & outings nearby', key: 'explore' as MoreSub },
    ]},
    { label: t('section_account'), items: [
      { icon: '⭐', label: 'MomBestie Plus', sub: t('upgrade_plan'), key: 'subscription' as MoreSub, highlight: true },
      { icon: '🔔', label: t('notifications'), sub: t('manage_alerts'), key: 'notifications' as MoreSub },
      { icon: '🔒', label: t('privacy_center'), sub: t('your_family_your_data'), key: 'privacy' as MoreSub },
      { icon: '🛡️', label: t('security'), sub: 'Face ID · 2-step on', key: 'security' as MoreSub },
      { icon: '⚙️', label: t('settings'), sub: '', key: 'settings' as MoreSub },
    ]},
  ]

  return (
    <div className="scroll-area flex-1 px-4 pt-2 pb-4 slide-up">
      {/* Profile */}
      <button onClick={() => setSub('profile')} className="action-btn w-full flex items-center gap-3 py-4 text-left">
        <Avatar size={52} initials="S" bg="#F47B66" />
        <div className="flex-1">
          <p className="font-semibold text-[#242424]">Sarah Mitchell</p>
          <p className="text-xs text-[#6E6E73]">MomBestie Plus · sarah@email.com</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-[#F0E8E4] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#6E6E73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </button>

      {/* Supply warning */}
      <div className="glass-card-strong rounded-xl p-3 flex items-center gap-2.5 mb-4 border border-[#F8C85E]/40">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: '#FEF3CD' }}>⚠️</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#242424]">Supplies running low</p>
          <p className="text-xs text-[#6E6E73]">Wipes · Diapers ~4 days left</p>
        </div>
        <button onClick={() => setSub('supplies')}
          className="action-btn text-xs font-bold text-white px-3 py-1.5 rounded-lg"
          style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)' }}>
          View
        </button>
      </div>

      {sections.map(s => (
        <div key={s.label} className="mb-4">
          <p className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-wider mb-2 px-1">{s.label}</p>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
            {s.items.map((item, i) => (
              <button key={i} onClick={() => setSub(item.key)}
                className={`action-btn w-full flex items-center gap-3 px-4 py-3 text-left ${(item as any).highlight ? 'bg-gradient-to-r from-[#FFF3EF] to-transparent' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${(item as any).highlight ? 'coral-gradient' : 'bg-[#F0E8E4]'}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${(item as any).highlight ? 'text-[#EE674E]' : 'text-[#242424]'}`}>{item.label}</p>
                  {item.sub && <p className="text-xs text-[#6E6E73]">{item.sub}</p>}
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#B0A8A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            ))}
          </div>
        </div>
      ))}

      <button onClick={onSignOut} className="w-full py-3 text-sm text-[#D9534F] font-semibold">🚪 Sign Out</button>
    </div>
  )
}
