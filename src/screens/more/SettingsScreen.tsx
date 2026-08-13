import { useState } from 'react'
import { useLang } from '../../i18n'
import { SubHeader } from '../../components/atoms'
import { LanguageSheet } from './SecurityScreen'

export function SettingsSubScreen({ onBack, darkMode, setDarkMode }: { onBack: () => void; darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const { lang, setLang, t } = useLang()
  const [units, setUnits] = useState<'imperial' | 'metric'>('imperial')
  const [activeSheet, setActiveSheet] = useState<'language' | 'rate' | 'feedback' | 'help' | 'terms' | null>(null)
  const [rating, setRating] = useState(0)
  const [ratingDone, setRatingDone] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackSending, setFeedbackSending] = useState(false)

  const dk = darkMode
  const bg = dk ? '#27272A' : '#FFFCFA'
  const card = dk ? 'rgba(39,39,42,0.95)' : undefined
  const border = dk ? '#3F3F46' : '#F0E8E4'
  const text = dk ? '#F4F4F5' : '#242424'
  const sub = dk ? '#A1A1AA' : '#6E6E73'
  const iconBg = dk ? '#3F3F46' : '#F0E8E4'

  const SheetWrap = ({ title, icon, children, footer }: { title: string; icon: string; children: React.ReactNode; footer?: React.ReactNode }) => (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={() => setActiveSheet(null)} />
      <div className="relative z-10 rounded-t-3xl flex flex-col" style={{ background: bg, boxShadow: '0 -12px 48px rgba(0,0,0,0.18)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: border }} />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: iconBg }}>{icon}</div>
            <h3 className="font-display text-lg" style={{ color: text }}>{title}</h3>
            <button onClick={() => setActiveSheet(null)} className="action-btn ml-auto w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: iconBg, border: `1.5px solid ${border}` }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke={sub} strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-3">{children}</div>
        {footer && <div className="flex-shrink-0 px-5 pb-6 pt-3" style={{ borderTop: `1px solid ${border}` }}>{footer}</div>}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 overflow-hidden slide-up" style={{ position: 'relative', background: dk ? '#18181B' : undefined }}>
      <SubHeader title={t('settings')} onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">

        {/* Preferences */}
        <div className="glass-card rounded-2xl overflow-hidden divide-y" style={{ background: card, borderColor: border }}>
          {/* Dark Mode */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderColor: border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: dk ? '#3F3F46' : '#F0E8E4' }}>{dk ? '🌙' : '☀️'}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: text }}>{t('dark_mode')}</p>
              <p className="text-xs" style={{ color: sub }}>{t('dark_mode_sub')}</p>
            </div>
            <button onClick={() => setDarkMode(!darkMode)}
              className="action-btn w-12 h-6 rounded-full transition-all flex-shrink-0"
              style={{ background: darkMode ? '#EE674E' : '#E0D8D4' }}>
              <div className="w-4 h-4 bg-white rounded-full shadow transition-all" style={{ marginLeft: darkMode ? '24px' : '2px' }} />
            </button>
          </div>

          {/* Measurement Units */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderColor: border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: iconBg }}>📏</div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: text }}>{t('measurement_units')}</p>
            </div>
            <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: iconBg }}>
              {(['imperial', 'metric'] as const).map(u => (
                <button key={u} onClick={() => setUnits(u)}
                  className="action-btn px-2.5 py-1 rounded-md text-xs font-bold transition-all"
                  style={units === u ? { background: '#EE674E', color: '#fff', boxShadow: '0 2px 0 #C94930' } : { color: sub }}>
                  {u === 'imperial' ? 'oz/lbs' : 'ml/kg'}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <button onClick={() => setActiveSheet('language')} className="action-btn w-full flex items-center gap-3 px-4 py-3.5 text-left" style={{ borderColor: border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: iconBg }}>🌐</div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: text }}>{t('language')}</p>
              <p className="text-xs" style={{ color: sub }}>{lang}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke={sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* About & Support */}
        <div className="glass-card rounded-2xl overflow-hidden divide-y" style={{ background: card, borderColor: border }}>
          {[
            { icon: '⭐', label: t('rate_mombestie'), key: 'rate' as const },
            { icon: '💬', label: t('send_feedback'), key: 'feedback' as const },
            { icon: '❓', label: t('help_support'), key: 'help' as const },
            { icon: '📄', label: t('terms_privacy'), key: 'terms' as const },
          ].map((r) => (
            <button key={r.key} onClick={() => setActiveSheet(r.key)}
              className="action-btn w-full flex items-center gap-3 px-4 py-3.5 text-left" style={{ borderColor: border }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: iconBg }}>{r.icon}</div>
              <p className="text-sm font-semibold flex-1" style={{ color: text }}>{r.label}</p>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke={sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>

        <p className="text-center text-[10px]" style={{ color: sub }}>MomBestie AI v2.4.1 · Made with ❤️ for moms</p>
      </div>

      {/* ── Language Sheet ── */}
      {activeSheet === 'language' && (
        <LanguageSheet
          current={lang}
          bg={bg} card={card} border={border} text={text} sub={sub} iconBg={iconBg}
          onSelect={(l) => { setLang(l); setActiveSheet(null) }}
          onClose={() => setActiveSheet(null)}
        />
      )}

      {/* ── Rate Sheet ── */}
      {activeSheet === 'rate' && (
        <SheetWrap title="Rate MomBestie" icon="⭐"
          footer={!ratingDone && <button onClick={() => { if (rating > 0) setRatingDone(true) }} disabled={rating === 0}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
            style={rating === 0 ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' } : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            Submit Rating
          </button>}>
          {ratingDone ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="text-5xl pop-in">🎉</div>
              <p className="font-display text-xl" style={{ color: text }}>Thank you!</p>
              <p className="text-sm text-center" style={{ color: sub }}>Your rating helps other moms discover MomBestie.</p>
              <div className="flex gap-1">{[1,2,3,4,5].map(s => <span key={s} className="text-2xl">{s <= rating ? '⭐' : '☆'}</span>)}</div>
            </div>
          ) : (<>
            <p className="text-sm text-center font-semibold" style={{ color: text }}>How would you rate MomBestie?</p>
            <div className="flex justify-center gap-3 py-4">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} className="action-btn text-4xl transition-transform" style={{ transform: s <= rating ? 'scale(1.2)' : 'scale(1)' }}>
                  {s <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Easy to use', 'Saves time', 'Love the AI', 'Great design', 'Very helpful', 'Recommend it'].map(tag => (
                <div key={tag} className="px-3 py-2 rounded-xl text-center text-xs font-semibold" style={{ background: iconBg, color: sub }}>{tag}</div>
              ))}
            </div>
          </>)}
        </SheetWrap>
      )}

      {/* ── Feedback Sheet ── */}
      {activeSheet === 'feedback' && (
        <SheetWrap title="Send Feedback" icon="💬"
          footer={!feedbackSent && <button onClick={() => { if (feedbackText.trim()) { setFeedbackSending(true); setTimeout(() => { setFeedbackSending(false); setFeedbackSent(true) }, 1400) } }}
            disabled={!feedbackText.trim() || feedbackSending}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
            style={!feedbackText.trim() ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' } : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            {feedbackSending ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Sending…</span> : '📨 Send Feedback'}
          </button>}>
          {feedbackSent ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="text-5xl pop-in">💌</div>
              <p className="font-display text-xl" style={{ color: text }}>Feedback received!</p>
              <p className="text-sm text-center" style={{ color: sub }}>Our team reads every message. Thank you for helping us improve MomBestie!</p>
            </div>
          ) : (<>
            <p className="text-xs" style={{ color: sub }}>Share your thoughts, suggestions, or report a bug.</p>
            <div className="flex gap-2 flex-wrap">
              {['Bug report', 'Feature request', 'Praise', 'Other'].map(t => (
                <button key={t} className="action-btn px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: iconBg, color: sub }}>{t}</button>
              ))}
            </div>
            <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
              placeholder="Tell us what you think…"
              rows={5} className="cartoon-input w-full px-4 py-3 text-sm resize-none"
              style={{ color: text, background: dk ? '#3F3F46' : undefined, borderColor: dk ? '#52525B' : undefined }} />
          </>)}
        </SheetWrap>
      )}

      {/* ── Help & Support Sheet ── */}
      {activeSheet === 'help' && (
        <SheetWrap title="Help & Support" icon="❓">
          <p className="text-xs" style={{ color: sub }}>Find answers or get in touch with our team.</p>
          {[
            { q: 'How do I add a caregiver?', a: 'Go to More → Family & Caregivers → Invite Caregiver.' },
            { q: 'How does the AI work?', a: "MomBestie's AI learns from your baby's patterns to provide personalised advice." },
            { q: 'Is my data private?', a: 'Yes. Visit Privacy Center to manage and control all your data.' },
            { q: 'How do I cancel my subscription?', a: 'Go to More → MomBestie Plus → Manage Subscription.' },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ background: iconBg, border: `1px solid ${border}` }}>
              <p className="text-sm font-semibold mb-1" style={{ color: text }}>❓ {item.q}</p>
              <p className="text-xs leading-relaxed" style={{ color: sub }}>{item.a}</p>
            </div>
          ))}
          <div className="rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg,#FFF3EE,#FFD6C9)', border: '1.5px solid #F6B6A5' }}>
            <p className="text-sm font-bold text-[#EE674E] mb-1">Still need help?</p>
            <p className="text-xs text-[#6E6E73]">Email us at hello@mombestie.ai — we reply within 24 hours.</p>
          </div>
        </SheetWrap>
      )}

      {/* ── Terms & Privacy Sheet ── */}
      {activeSheet === 'terms' && (
        <SheetWrap title="Terms & Privacy" icon="📄">
          {[
            { title: '📋 Terms of Service', body: 'By using MomBestie, you agree to use the app for personal, non-commercial purposes. We reserve the right to update these terms at any time with notice.' },
            { title: '🔒 Privacy Policy', body: "We collect only what's needed to provide the service. Your data is never sold to third parties. You can export or delete your data at any time from Privacy Center." },
            { title: '🍪 Cookie Policy', body: 'We use essential cookies to keep you signed in. No tracking or advertising cookies are used.' },
            { title: '👶 Child Data', body: "Data about your child is treated with the highest sensitivity. It's stored encrypted and only accessible to you and the family members you invite." },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ background: iconBg, border: `1px solid ${border}` }}>
              <p className="text-sm font-bold mb-2" style={{ color: text }}>{s.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: sub }}>{s.body}</p>
            </div>
          ))}
          <p className="text-center text-[10px]" style={{ color: sub }}>Last updated: August 2026</p>
        </SheetWrap>
      )}
    </div>
  )
}
