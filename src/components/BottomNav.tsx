import type { JSX } from 'react'
import { useLang } from '../i18n'
import type { Screen } from '../types'

export function BottomNav({ screen, onChange, onVoice }: {
  screen: Screen
  onChange: (s: Screen) => void
  onVoice: () => void
}) {
  const { t } = useLang()
  const items: { id: Screen; label: string; icon: (active: boolean) => JSX.Element }[] = [
    {
      id: 'home', label: t('nav_home'),
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H6a1 1 0 01-1-1V9.5z" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.7" strokeLinejoin="round" fill={a ? '#FFD6C9' : 'none'} />
          <path d="M8 20v-7h6v7" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'baby', label: t('nav_baby'),
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="9" r="5" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.7" fill={a ? '#FFD6C9' : 'none'} />
          <path d="M3 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'planner', label: t('nav_planner'),
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="5" width="16" height="15" rx="2" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.7" fill={a ? '#FFD6C9' : 'none'} />
          <path d="M7 2v4M15 2v4M3 10h16" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M7 14h4M7 17h6" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'more', label: t('nav_more'),
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="6" r="1.5" fill={a ? '#EE674E' : '#B0A8A4'} />
          <circle cx="11" cy="11" r="1.5" fill={a ? '#EE674E' : '#B0A8A4'} />
          <circle cx="11" cy="16" r="1.5" fill={a ? '#EE674E' : '#B0A8A4'} />
        </svg>
      ),
    },
  ]

  return (
    <div className="glass-card-strong border-t border-white/60 px-2 pt-2 pb-5 flex items-center">
      {/* Home + Baby */}
      {items.slice(0, 2).map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className="bottom-nav-item flex-1 flex flex-col items-center gap-0.5 py-1"
        >
          {item.icon(screen === item.id)}
          <span className={`text-[10px] font-medium ${screen === item.id ? 'text-[#EE674E]' : 'text-[#B0A8A4]'}`}>
            {item.label}
          </span>
        </button>
      ))}

      {/* Center AI Button */}
      <div className="flex-1 flex justify-center -mt-7">
        <button
          onClick={() => screen === 'ai' ? onVoice() : onChange('ai')}
          className="action-btn w-14 h-14 coral-gradient rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-lg"
          style={{ boxShadow: '0 4px 20px rgba(238,103,78,0.45)' }}
        >
          <span className="text-xl">✨</span>
          <span className="text-[9px] font-bold text-white/90 uppercase tracking-wide">{t('nav_ai')}</span>
        </button>
      </div>

      {/* Planner + More */}
      {items.slice(2).map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className="bottom-nav-item flex-1 flex flex-col items-center gap-0.5 py-1"
        >
          {item.icon(screen === item.id)}
          <span className={`text-[10px] font-medium ${screen === item.id ? 'text-[#EE674E]' : 'text-[#B0A8A4]'}`}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}
