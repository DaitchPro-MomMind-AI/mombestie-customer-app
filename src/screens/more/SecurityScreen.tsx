import { useState } from 'react'
import { useLang } from '../../i18n'
import { SubHeader } from '../../components/atoms'

export function SecuritySubScreen({ onBack }: { onBack: () => void }) {
  const { t } = useLang()
  const [faceId, setFaceId] = useState(true)
  const [twoStep, setTwoStep] = useState(true)

  type Device = { id: number; name: string; icon: string; last: string; current: boolean; location: string }
  const [devices, setDevices] = useState<Device[]>([
    { id: 1, name: 'iPhone 17 Pro', icon: '📱', last: 'Current device', current: true, location: 'New York, US' },
    { id: 2, name: 'Samsung Galaxy S25', icon: '📲', last: 'Last active yesterday', current: false, location: 'Brooklyn, US' },
    { id: 3, name: 'iPad Air', icon: '📋', last: 'Last active 3 days ago', current: false, location: 'New York, US' },
  ])
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [confirmAll, setConfirmAll] = useState(false)
  const [signingOut, setSigningOut] = useState<number | 'all' | null>(null)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  const signOutDevice = (id: number) => {
    setSigningOut(id)
    setTimeout(() => {
      setDevices(ds => ds.filter(d => d.id !== id))
      setConfirmId(null)
      setSigningOut(null)
      showToast('Device signed out successfully')
    }, 1200)
  }

  const signOutAll = () => {
    setSigningOut('all')
    setTimeout(() => {
      setDevices(ds => ds.filter(d => d.current))
      setConfirmAll(false)
      setSigningOut(null)
      showToast('All other devices signed out')
    }, 1400)
  }

  const otherDevices = devices.filter(d => !d.current)

  return (
    <div className="flex flex-col flex-1 overflow-hidden slide-up" style={{ position: 'relative' }}>
      <SubHeader title={t('security')} onBack={onBack} />

      {/* Toast notification */}
      {toast !== '' && (
        <div className="absolute top-14 left-4 right-4 z-50 pop-in">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: '#242424', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
            <span className="text-base">✅</span>
            <p className="text-sm font-semibold text-white flex-1">{toast}</p>
          </div>
        </div>
      )}

      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">

        {/* Biometrics & 2FA */}
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
          {[
            { icon: '👁️', label: t('face_id'), sub: t('face_id_sub'), state: faceId, set: setFaceId },
            { icon: '🔑', label: t('two_step'), sub: t('two_step_sub'), state: twoStep, set: setTwoStep },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: r.state ? '#FFD6C9' : '#F0E8E4' }}>{r.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#242424]">{r.label}</p>
                <p className="text-xs text-[#6E6E73]">{r.sub}</p>
              </div>
              <button onClick={() => r.set((v: boolean) => !v)}
                className="action-btn w-12 h-6 rounded-full transition-all flex-shrink-0"
                style={{ background: r.state ? '#EE674E' : '#E0D8D4' }}>
                <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                  style={{ marginLeft: r.state ? '24px' : '2px' }} />
              </button>
            </div>
          ))}
        </div>

        {/* Logged-in devices */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">{t('logged_in_devices')}</p>
            <span className="text-xs text-[#6E6E73]">{devices.length} active</span>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
            {devices.map((d) => (
              <div key={d.id}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: d.current ? '#E6F4ED' : '#F0E8E4' }}>{d.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-[#242424]">{d.name}</p>
                      {d.current && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold text-[#55A67A]"
                          style={{ background: '#E6F4ED' }}>This device</span>
                      )}
                    </div>
                    <p className="text-xs text-[#6E6E73]">{d.last} · {d.location}</p>
                  </div>
                  {!d.current && (
                    confirmId === d.id ? null : (
                      <button onClick={() => setConfirmId(d.id)}
                        className="action-btn px-3 py-1.5 rounded-xl text-xs font-bold text-[#D9534F] flex-shrink-0"
                        style={{ background: '#FAECEC', border: '1px solid #ECA0A0' }}>
                        Sign out
                      </button>
                    )
                  )}
                </div>

                {/* Inline confirm strip */}
                {confirmId === d.id && (
                  <div className="mx-3 mb-2.5 rounded-2xl px-4 py-3 flex items-center gap-2"
                    style={{ background: '#FFF3EE', border: '1.5px solid #F6B6A5' }}>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#242424]">Sign out {d.name}?</p>
                      <p className="text-[10px] text-[#6E6E73] mt-0.5">This device will need to log in again.</p>
                    </div>
                    <button onClick={() => setConfirmId(null)}
                      className="action-btn px-3 py-1.5 rounded-xl text-xs font-bold text-[#6E6E73] flex-shrink-0"
                      style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>Cancel</button>
                    <button onClick={() => signOutDevice(d.id)} disabled={signingOut === d.id}
                      className="action-btn px-3 py-1.5 rounded-xl text-xs font-bold text-white flex-shrink-0"
                      style={{ background: signingOut === d.id ? '#F6B6A5' : '#D9534F', border: '1.5px solid #B03030', boxShadow: signingOut === d.id ? 'none' : '0 2px 0 #B03030' }}>
                      {signingOut === d.id
                        ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Signing out…</span>
                        : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sign out all other devices */}
        {otherDevices.length > 0 ? (
          confirmAll ? (
            <div className="rounded-2xl px-4 py-4 space-y-3"
              style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-[#D9534F]">Sign out {otherDevices.length} other device{otherDevices.length > 1 ? 's' : ''}?</p>
                  <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
                    {otherDevices.map(d => d.name).join(' and ')} will be immediately logged out and need to sign in again.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmAll(false)}
                  className="action-btn flex-1 py-2.5 rounded-xl text-sm font-bold text-[#6E6E73]"
                  style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>Cancel</button>
                <button onClick={signOutAll} disabled={signingOut === 'all'}
                  className="action-btn flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: signingOut === 'all' ? '#F6B6A5' : '#D9534F', border: '1.5px solid #B03030', boxShadow: signingOut === 'all' ? 'none' : '0 3px 0 #B03030' }}>
                  {signingOut === 'all'
                    ? <span className="flex items-center justify-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Signing out…</span>
                    : '🚪 Sign Out All'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmAll(true)}
              className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-[#D9534F]"
              style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0', boxShadow: '0 3px 0 #E8A0A0' }}>
              🚪 {t('sign_out_all')}
            </button>
          )
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <span className="text-2xl">🔒</span>
            <p className="text-xs font-semibold text-[#55A67A]">{t('only_device')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SETTINGS SUB-SCREEN & ALL LANGUAGES ──────────────────────────────────────

const ALL_LANGUAGES = [
  // A
  'Abkhazian','Afar','Afrikaans','Akan','Albanian','Amharic','Arabic','Aragonese','Armenian','Assamese','Avaric','Avestan','Aymara','Azerbaijani',
  // B
  'Bambara','Bangla (বাংলা)','Bashkir','Basque','Belarusian','Bengali','Bihari','Bislama','Bosnian','Breton','Bulgarian','Burmese',
  // C
  'Catalan','Chamorro','Chechen','Chichewa','Chinese (Simplified)','Chinese (Traditional)','Chuvash','Cornish','Corsican','Cree','Croatian','Czech',
  // D
  'Danish','Divehi','Dutch','Dzongkha',
  // E
  'English','Esperanto','Estonian','Ewe',
  // F
  'Faroese','Fijian','Finnish','French','Fula',
  // G
  'Galician','Georgian','German','Greek','Guaraní','Gujarati',
  // H
  'Haitian Creole','Hausa','Hebrew','Herero','Hindi (हिन्दी)','Hiri Motu','Hungarian',
  // I
  'Interlingua','Indonesian','Interlingue','Irish','Igbo','Inupiaq','Ido','Icelandic','Italian','Inuktitut',
  // J
  'Japanese','Javanese',
  // K
  'Kalaallisut','Kannada','Kanuri','Kashmiri','Kazakh','Khmer','Kikuyu','Kinyarwanda','Kirghiz','Komi','Kongo','Korean','Kurdish','Kwanyama',
  // L
  'Latin','Luxembourgish','Luganda','Limburgish','Lingala','Lao','Lithuanian','Luba-Katanga','Latvian',
  // M
  'Manx','Macedonian','Malagasy','Malay','Malayalam','Maltese','Māori','Marathi','Marshallese','Mongolian',
  // N
  'Nauru','Navajo','Norwegian Bokmål','North Ndebele','Nepali','Ndonga','Norwegian Nynorsk','Norwegian','Nuosu','South Ndebele','Occitan','Ojibwe','Old Church Slavonic','Oromo','Oriya','Ossetian',
  // P
  'Pāli','Pashto','Persian (Farsi)','Polish','Portuguese','Punjabi',
  // Q
  'Quechua',
  // R
  'Romansh','Kirundi','Romanian','Russian',
  // S
  'Sanskrit','Sardinian','Sindhi','Northern Sami','Samoan','Sango','Serbian','Scottish Gaelic','Shona','Sinhala','Slovak','Slovenian','Somali','Southern Sotho','Spanish','Sundanese','Swahili','Swati','Swedish',
  // T
  'Tamil','Telugu','Tajik','Thai','Tigrinya','Tibetan','Turkmen','Tagalog','Tswana','Tonga','Turkish','Tsonga',
  // U
  'Urdu (اردو)','Uzbek','Uighur',
  // V
  'Venda','Vietnamese','Volapük',
  // W
  'Walloon','Welsh','Wolof',
  // X
  'Xhosa',
  // Y
  'Yiddish','Yoruba',
  // Z
  'Zhuang','Zulu',
]


export function LanguageSheet({ current, bg, card, border, text, sub, iconBg, onSelect, onClose }: {
  current: string; bg: string; card: string | undefined; border: string; text: string; sub: string; iconBg: string
  onSelect: (l: string) => void; onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const filtered = query.trim()
    ? ALL_LANGUAGES.filter(l => l.toLowerCase().includes(query.toLowerCase()))
    : ALL_LANGUAGES

  // Group by first letter
  const groups: Record<string, string[]> = {}
  filtered.forEach(l => {
    const letter = l[0].toUpperCase()
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(l)
  })

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col" style={{ background: bg, boxShadow: '0 -12px 48px rgba(0,0,0,0.18)', maxHeight: '92%' }}>
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: border }} />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: iconBg }}>🌐</div>
            <div className="flex-1">
              <h3 className="font-display text-lg leading-tight" style={{ color: text }}>Language</h3>
              <p className="text-xs" style={{ color: sub }}>{ALL_LANGUAGES.length} languages available</p>
            </div>
            <button onClick={onClose} className="action-btn w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: iconBg, border: `1.5px solid ${border}` }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke={sub} strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke={sub} strokeWidth="1.5"/>
              <path d="M9.5 9.5l3 3" stroke={sub} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search languages…"
              className="cartoon-input w-full pl-9 pr-4 py-2.5 text-sm"
              style={{ color: text, background: card, borderColor: border }} />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: sub }}>✕</button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="scroll-area flex-1 px-4 pb-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <span className="text-3xl">🔍</span>
              <p className="text-sm font-semibold" style={{ color: text }}>No languages found</p>
              <p className="text-xs" style={{ color: sub }}>Try a different search term</p>
            </div>
          ) : query.trim() ? (
            /* Flat list when searching */
            <div className="rounded-2xl overflow-hidden divide-y" style={{ background: card, border: `1px solid ${border}` }}>
              {filtered.map(l => (
                <button key={l} onClick={() => onSelect(l)}
                  className="action-btn w-full flex items-center justify-between px-4 py-3 text-left" style={{ borderColor: border }}>
                  <p className="text-sm font-medium" style={{ color: text }}>{l}</p>
                  {current === l && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="#EE674E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
              ))}
            </div>
          ) : (
            /* Grouped by letter */
            <div className="space-y-3">
              {Object.keys(groups).sort().map(letter => (
                <div key={letter}>
                  <p className="text-xs font-bold px-1 pb-1" style={{ color: '#EE674E' }}>{letter}</p>
                  <div className="rounded-2xl overflow-hidden divide-y" style={{ background: card, border: `1px solid ${border}` }}>
                    {groups[letter].map(l => (
                      <button key={l} onClick={() => onSelect(l)}
                        className="action-btn w-full flex items-center justify-between px-4 py-3 text-left" style={{ borderColor: border }}>
                        <p className="text-sm font-medium" style={{ color: text }}>{l}</p>
                        {current === l && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="#EE674E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
