import { useState } from 'react'
import { SubHeader } from '../../components/atoms'

type PrivacySheet = 'ai-memory' | 'family-access' | 'voice-data' | 'connected' | 'download' | 'delete' | null

function PrivacySheetWrapper({ title, icon, iconBg, onClose, children, footer }: {
  title: string; icon: string; iconBg: string; onClose: () => void
  children: React.ReactNode; footer?: React.ReactNode
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: iconBg }}>{icon}</div>
            <h3 className="font-display text-lg text-[#242424]">{title}</h3>
            <button onClick={onClose} className="action-btn ml-auto w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="#6E6E73" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-3">{children}</div>
        {footer && <div className="flex-shrink-0 px-5 pb-6 pt-3 border-t border-[#F0E8E4]">{footer}</div>}
      </div>
    </div>
  )
}


function AIMemorySheet({ onClose }: { onClose: () => void }) {
  const [memories, setMemories] = useState([
    { id: 1, text: 'Maya usually goes to bed around 7:45 PM.' },
    { id: 2, text: "Maya's average nap is 75 minutes." },
    { id: 3, text: 'Sarah prefers bottle feeding reminders every 3 hours.' },
    { id: 4, text: 'Maya dislikes broccoli (logged 3 times).' },
  ])
  const [input, setInput] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [cleared, setCleared] = useState(false)

  const addMemory = () => {
    if (!input.trim()) return
    setMemories(m => [...m, { id: Date.now(), text: input.trim() }])
    setInput('')
  }
  const forget = (id: number) => setMemories(m => m.filter(x => x.id !== id))
  const clearAll = () => { setMemories([]); setCleared(true); setConfirmClear(false) }

  return (
    <PrivacySheetWrapper title="AI Memory" icon="🧠" iconBg="#FFD6C9" onClose={onClose}>
      <p className="text-xs text-[#6E6E73]">These are the insights MomMind has learned about your family. You can delete individual memories or clear all at once.</p>

      {cleared ? (
        <div className="flex flex-col items-center py-6 gap-3">
          <span className="text-4xl">🧹</span>
          <p className="font-semibold text-sm text-[#242424]">All memories cleared</p>
          <p className="text-xs text-[#6E6E73]">MomMind will learn fresh from your activity</p>
        </div>
      ) : (
        <div className="space-y-2">
          {memories.map(m => (
            <div key={m.id} className="flex items-start gap-3 p-3 rounded-2xl"
              style={{ background: '#FFF3EE', border: '1px solid #F6B6A5' }}>
              <p className="text-xs text-[#242424] flex-1 leading-relaxed">{m.text}</p>
              <button onClick={() => forget(m.id)}
                className="action-btn flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#D9534F]"
                style={{ background: '#FAECEC', border: '1px solid #ECA0A0' }}>Forget</button>
            </div>
          ))}
        </div>
      )}

      {/* Add new memory */}
      {!cleared && (
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMemory()}
            placeholder="Add a custom memory note…"
            className="cartoon-input flex-1 px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]" />
          <button onClick={addMemory} disabled={!input.trim()}
            className="action-btn w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: input.trim() ? 'linear-gradient(135deg,#EE674E,#F47B66)' : '#F0E8E4', border: input.trim() ? '2px solid #C94930' : '2px solid #E0D8D4', boxShadow: input.trim() ? '0 3px 0 #C94930' : 'none' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke={input.trim() ? 'white' : '#B0A8A4'} strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      )}

      {!cleared && memories.length > 0 && (
        confirmClear ? (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>
            <p className="text-xs font-semibold text-[#D9534F] flex-1">Clear all {memories.length} memories?</p>
            <button onClick={() => setConfirmClear(false)} className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-[#6E6E73]" style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>Cancel</button>
            <button onClick={clearAll} className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#D9534F', border: '1.5px solid #B03030', boxShadow: '0 2px 0 #B03030' }}>Clear All</button>
          </div>
        ) : (
          <button onClick={() => setConfirmClear(true)}
            className="action-btn w-full py-2.5 rounded-xl text-xs font-bold text-[#D9534F]"
            style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>
            🗑️ Clear All Memories
          </button>
        )
      )}
    </PrivacySheetWrapper>
  )
}


function FamilyAccessSheet({ onClose }: { onClose: () => void }) {
  const dataTypes = ['Timeline & logs', 'Feeding data', 'Sleep data', 'Growth charts', 'Meal plans', 'Private notes', 'Photos & memories']
  const [members, setMembers] = useState([
    { name: 'David', role: 'Dad', color: '#6299D5', perms: [0,1,2,3,4] },
    { name: 'Grandma', role: 'Caregiver', color: '#55A67A', perms: [0,1,2] },
    { name: 'Nanny', role: 'Caregiver', color: '#B0A0F0', perms: [0,1,2,3] },
  ])
  const [expanded, setExpanded] = useState<number | null>(0)

  const toggle = (mi: number, pi: number) => setMembers(ms => ms.map((m, i) => i === mi
    ? { ...m, perms: m.perms.includes(pi) ? m.perms.filter(x => x !== pi) : [...m.perms, pi] } : m))

  return (
    <PrivacySheetWrapper title="Family Access" icon="👨‍👩‍👧" iconBg="#EBF2FC" onClose={onClose}>
      <p className="text-xs text-[#6E6E73]">Control exactly what each family member and caregiver can see.</p>
      {members.map((m, mi) => (
        <div key={mi} className="glass-card rounded-2xl overflow-hidden">
          <button onClick={() => setExpanded(expanded === mi ? null : mi)}
            className="action-btn w-full flex items-center gap-3 px-4 py-3 text-left">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${m.color},${m.color}99)` }}>{m.name[0]}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#242424]">{m.name}</p>
              <p className="text-xs text-[#6E6E73]">{m.role} · {m.perms.length}/{dataTypes.length} items</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              style={{ transform: expanded === mi ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M5 3l4 4-4 4" stroke="#B0A8A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {expanded === mi && (
            <div className="px-4 pb-3 space-y-2 border-t border-[#F0E8E4] pt-2">
              {dataTypes.map((d, pi) => (
                <div key={pi} className="flex items-center justify-between">
                  <p className="text-xs text-[#242424]">{d}</p>
                  <button onClick={() => toggle(mi, pi)}
                    className="action-btn w-10 h-5 rounded-full transition-all"
                    style={{ background: m.perms.includes(pi) ? m.color : '#E0D8D4' }}>
                    <div className="w-3.5 h-3.5 bg-white rounded-full shadow transition-all"
                      style={{ marginLeft: m.perms.includes(pi) ? '22px' : '2px' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </PrivacySheetWrapper>
  )
}


function VoiceDataSheet({ onClose }: { onClose: () => void }) {
  const [retention, setRetention] = useState('30')
  const [autoDelete, setAutoDelete] = useState(true)
  const [confirmClear, setConfirmClear] = useState(false)
  const [cleared, setCleared] = useState(false)
  const recordings = ['Aug 10 · 0:14 — feeding log', 'Aug 9 · 0:08 — sleep log', 'Aug 9 · 0:22 — note', 'Aug 8 · 0:11 — diaper log']
  const [recs, setRecs] = useState(recordings)

  return (
    <PrivacySheetWrapper title="Voice Data" icon="🎙️" iconBg="#E6F4ED" onClose={onClose}>
      <p className="text-xs text-[#6E6E73]">Voice recordings are transcribed and deleted based on your retention setting.</p>
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-semibold text-[#242424]">Auto-delete recordings</p><p className="text-xs text-[#6E6E73]">After transcription</p></div>
          <button onClick={() => setAutoDelete(v => !v)} className="action-btn w-12 h-6 rounded-full transition-all"
            style={{ background: autoDelete ? '#EE674E' : '#E0D8D4' }}>
            <div className="w-4 h-4 bg-white rounded-full shadow transition-all" style={{ marginLeft: autoDelete ? '24px' : '2px' }} />
          </button>
        </div>
        <div>
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Retention period</p>
          <div className="flex gap-2">
            {['7','14','30','90'].map(d => (
              <button key={d} onClick={() => setRetention(d)}
                className="action-btn flex-1 py-2 rounded-xl text-xs font-bold"
                style={retention === d ? { background: '#FFD6C9', border: '2px solid #EE674E', color: '#EE674E' } : { background: '#F0E8E4', color: '#6E6E73' }}>
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Stored recordings ({recs.length})</p>
        {cleared || recs.length === 0 ? (
          <div className="flex flex-col items-center py-4 gap-2"><span className="text-2xl">✅</span><p className="text-xs text-[#6E6E73]">No recordings stored</p></div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
            {recs.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-base flex-shrink-0">🎤</span>
                <p className="text-xs text-[#242424] flex-1">{r}</p>
                <button onClick={() => setRecs(rs => rs.filter((_,idx) => idx !== i))}
                  className="action-btn px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#D9534F]"
                  style={{ background: '#FAECEC', border: '1px solid #ECA0A0' }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {recs.length > 0 && !cleared && (
        confirmClear ? (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>
            <p className="text-xs font-semibold text-[#D9534F] flex-1">Delete all recordings?</p>
            <button onClick={() => setConfirmClear(false)} className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-[#6E6E73]" style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>Cancel</button>
            <button onClick={() => { setRecs([]); setCleared(true); setConfirmClear(false) }} className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#D9534F', border: '1.5px solid #B03030', boxShadow: '0 2px 0 #B03030' }}>Delete All</button>
          </div>
        ) : (
          <button onClick={() => setConfirmClear(true)} className="action-btn w-full py-2.5 rounded-xl text-xs font-bold text-[#D9534F]"
            style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>🗑️ Delete All Recordings</button>
        )
      )}
    </PrivacySheetWrapper>
  )
}


function ConnectedServicesSheet({ onClose }: { onClose: () => void }) {
  const [services, setServices] = useState([
    { icon: '📅', name: 'Apple Calendar', desc: 'Syncs appointments', connected: true, color: '#6299D5' },
    { icon: '🏥', name: 'Baby Health App', desc: 'Shares growth data', connected: true, color: '#55A67A' },
    { icon: '🛒', name: 'Amazon Baby', desc: 'Supply tracking', connected: false, color: '#F8C85E' },
    { icon: '📊', name: 'Google Fit', desc: 'Activity data', connected: false, color: '#EE674E' },
  ])
  const [confirmDisconnect, setConfirmDisconnect] = useState<number | null>(null)

  const toggle = (i: number) => {
    if (services[i].connected) { setConfirmDisconnect(i) }
    else setServices(sv => sv.map((s, idx) => idx === i ? { ...s, connected: true } : s))
  }

  return (
    <PrivacySheetWrapper title="Connected Services" icon="🔗" iconBg="#EBF2FC" onClose={onClose}>
      <p className="text-xs text-[#6E6E73]">Apps and services that have access to your MomMind data. Disconnect any time.</p>
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
        {services.map((s, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: s.connected ? `${s.color}22` : '#F0E8E4' }}>{s.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#242424]">{s.name}</p>
                <p className="text-xs text-[#6E6E73]">{s.desc}</p>
              </div>
              <button onClick={() => toggle(i)} className="action-btn w-12 h-6 rounded-full transition-all"
                style={{ background: s.connected ? s.color : '#E0D8D4' }}>
                <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                  style={{ marginLeft: s.connected ? '24px' : '2px' }} />
              </button>
            </div>
            {confirmDisconnect === i && (
              <div className="mx-3 mb-2 rounded-xl px-3 py-2 flex items-center gap-2"
                style={{ background: '#FEF3CD', border: '1px solid #F8C85E' }}>
                <p className="text-xs text-[#7A6010] flex-1">Disconnect {s.name}?</p>
                <button onClick={() => setConfirmDisconnect(null)} className="action-btn px-2 py-1 rounded-lg text-[10px] font-bold text-[#6E6E73]" style={{ background: '#fff' }}>Cancel</button>
                <button onClick={() => { setServices(sv => sv.map((x, idx) => idx === i ? { ...x, connected: false } : x)); setConfirmDisconnect(null) }}
                  className="action-btn px-2 py-1 rounded-lg text-[10px] font-bold text-white" style={{ background: '#D9534F' }}>Disconnect</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
        <p className="text-xs text-[#7A6010]">ℹ️ Disconnecting a service stops future data sharing but does not delete data already shared.</p>
      </div>
    </PrivacySheetWrapper>
  )
}


function DownloadDataSheet({ onClose }: { onClose: () => void }) {
  const [format, setFormat] = useState<'JSON' | 'CSV'>('JSON')
  const [selected, setSelected] = useState([0,1,2,3,4])
  const dataTypes = ['Activity logs', 'Growth data', 'Meal records', 'AI conversations', 'Photos & memories']
  const [preparing, setPreparing] = useState(false)
  const [ready, setReady] = useState(false)

  const toggle = (i: number) => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])
  const handleExport = () => {
    setPreparing(true)
    setTimeout(() => { setPreparing(false); setReady(true) }, 1800)
  }

  return (
    <PrivacySheetWrapper title="Download My Data" icon="⬇️" iconBg="#E6F4ED" onClose={onClose}
      footer={
        ready ? (
          <button onClick={onClose} className="action-btn w-full py-3.5 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#55A67A,#78C49A)', border: '2px solid #3D8A60', boxShadow: '0 4px 0 #3D8A60' }}>
            ✅ Download Ready — Save File
          </button>
        ) : (
          <button onClick={handleExport} disabled={selected.length === 0 || preparing}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
            style={selected.length === 0 ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
              : preparing ? { background: '#F6B6A5', border: '2px solid #E8A090' }
              : { background: 'linear-gradient(135deg,#55A67A,#78C49A)', border: '2px solid #3D8A60', boxShadow: '0 4px 0 #3D8A60' }}>
            {preparing
              ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Preparing export…</span>
              : `⬇️ Export ${selected.length} categories as ${format}`}
          </button>
        )
      }>
      <p className="text-xs text-[#6E6E73]">Export a full copy of your data. Choose what to include and your preferred format.</p>

      {ready && (
        <div className="flex flex-col items-center py-4 gap-3">
          <div className="w-14 h-14 rounded-full bg-[#E6F4ED] flex items-center justify-center text-3xl pop-in">📦</div>
          <p className="font-semibold text-sm text-[#242424]">Export ready!</p>
          <p className="text-xs text-[#6E6E73]">{selected.length} categories · {format} format</p>
        </div>
      )}

      {!ready && (<>
        <div>
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Format</p>
          <div className="flex gap-2">
            {(['JSON','CSV'] as const).map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className="action-btn flex-1 py-3 rounded-xl font-bold text-sm"
                style={format === f ? { background: '#E6F4ED', border: '2px solid #55A67A', color: '#55A67A', boxShadow: '0 3px 0 #A8D9BC' } : { background: '#F0E8E4', color: '#6E6E73' }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Include</p>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
            {dataTypes.map((d, i) => (
              <button key={i} onClick={() => toggle(i)} className="action-btn w-full flex items-center gap-3 px-4 py-3 text-left">
                <div className="w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all flex-shrink-0"
                  style={{ background: selected.includes(i) ? '#55A67A' : 'white', borderColor: selected.includes(i) ? '#55A67A' : '#F6B6A5' }}>
                  {selected.includes(i) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <p className="text-sm text-[#242424] flex-1">{d}</p>
              </button>
            ))}
          </div>
        </div>
      </>)}
    </PrivacySheetWrapper>
  )
}


function DeleteDataSheet({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1|2|3>(1)
  const [typed, setTyped] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const handleDelete = () => {
    setDeleting(true)
    setTimeout(() => { setDeleting(false); setDeleted(true) }, 2000)
  }

  return (
    <PrivacySheetWrapper title="Delete My Data" icon="🗑️" iconBg="#FAECEC" onClose={onClose}>
      {deleted ? (
        <div className="flex flex-col items-center py-8 gap-4">
          <span className="text-4xl">✅</span>
          <div className="text-center">
            <p className="font-semibold text-sm text-[#242424]">Deletion request submitted</p>
            <p className="text-xs text-[#6E6E73] mt-1">Your data will be permanently removed within 30 days. You'll receive a confirmation email.</p>
          </div>
          <button onClick={onClose} className="action-btn w-full py-3 rounded-2xl font-bold text-sm text-[#6E6E73]"
            style={{ background: '#F0E8E4', border: '2px solid #E0D8D4' }}>Close</button>
        </div>
      ) : step === 1 ? (<>
        <div className="rounded-2xl px-4 py-4 text-center" style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>
          <p className="text-2xl mb-2">⚠️</p>
          <p className="font-bold text-sm text-[#D9534F]">This cannot be undone</p>
          <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">All your data — logs, memories, AI conversations, and account — will be permanently deleted.</p>
        </div>
        {[['📊','Activity & growth logs'],['🧠','AI memory & conversations'],['📸','Photos & memories'],['👨‍👩‍👧','Family access data'],['💳','Subscription & billing']].map(([icon, label], i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: '#FFF3EE' }}>
            <span className="text-base">{icon}</span>
            <p className="text-xs text-[#242424]">{label}</p>
            <span className="ml-auto text-[10px] font-bold text-[#D9534F]">Will be deleted</span>
          </div>
        ))}
        <button onClick={() => setStep(2)} className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
          style={{ background: '#D9534F', border: '2px solid #B03030', boxShadow: '0 4px 0 #B03030' }}>
          I understand, continue →
        </button>
        <button onClick={onClose} className="action-btn w-full py-2.5 rounded-xl text-sm font-semibold text-[#6E6E73]"
          style={{ background: '#F0E8E4' }}>Keep my data</button>
      </>) : step === 2 ? (<>
        <p className="text-sm text-[#242424] font-semibold">Type <span className="text-[#D9534F]">DELETE</span> to confirm</p>
        <input value={typed} onChange={e => setTyped(e.target.value)}
          placeholder="Type DELETE here"
          className="cartoon-input w-full px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]"
          style={{ borderColor: typed === 'DELETE' ? '#D9534F' : undefined }} />
        <button onClick={() => setStep(3)} disabled={typed !== 'DELETE'}
          className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
          style={typed !== 'DELETE' ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' } : { background: '#D9534F', border: '2px solid #B03030', boxShadow: '0 4px 0 #B03030' }}>
          Continue to final step →
        </button>
      </>) : (<>
        <div className="rounded-2xl px-4 py-4 text-center" style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>
          <p className="font-bold text-sm text-[#D9534F]">Final confirmation</p>
          <p className="text-xs text-[#6E6E73] mt-1">Your account and all data will be permanently deleted. This action is irreversible.</p>
        </div>
        <button onClick={handleDelete} disabled={deleting}
          className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
          style={{ background: deleting ? '#F6B6A5' : '#D9534F', border: '2px solid #B03030', boxShadow: deleting ? 'none' : '0 4px 0 #B03030' }}>
          {deleting ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Deleting…</span> : '🗑️ Permanently Delete My Data'}
        </button>
        <button onClick={() => setStep(1)} className="action-btn w-full py-2.5 rounded-xl text-sm font-semibold text-[#6E6E73]"
          style={{ background: '#F0E8E4' }}>Cancel — Keep my account</button>
      </>)}
    </PrivacySheetWrapper>
  )
}


export function PrivacyCenterSubScreen({ onBack }: { onBack: () => void }) {
  const [activeSheet, setActiveSheet] = useState<PrivacySheet>(null)

  const rows = [
    { key: 'ai-memory' as PrivacySheet,   icon: '🧠',      label: 'AI Memory',           sub: 'What MomMind remembers',     danger: false },
    { key: 'family-access' as PrivacySheet, icon: '👨‍👩‍👧',  label: 'Family Access',        sub: 'Who can see what',           danger: false },
    { key: 'voice-data' as PrivacySheet,  icon: '🎙️',      label: 'Voice Data',           sub: 'Recording storage · 30 days',danger: false },
    { key: 'connected' as PrivacySheet,   icon: '🔗',      label: 'Connected Services',   sub: '2 services linked',          danger: false },
    { key: 'download' as PrivacySheet,    icon: '⬇️',      label: 'Download My Data',     sub: 'Full export as JSON/CSV',    danger: false },
    { key: 'delete' as PrivacySheet,      icon: '🗑️',      label: 'Delete My Data',       sub: 'Permanently remove all data',danger: true  },
  ]

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Privacy Center" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-3">
        <div className="glass-card-strong rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg,#FFF3EE,#FFD6C9)' }}>
          <p className="text-3xl mb-2">🔒</p>
          <p className="font-display text-lg text-[#242424]">Your Family. Your Data.</p>
          <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">You control everything MomMind knows and stores about your family.</p>
        </div>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
          {rows.map((r, i) => (
            <button key={i} onClick={() => setActiveSheet(r.key)}
              className="action-btn w-full flex items-center gap-3 px-4 py-3.5 text-left">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: r.danger ? '#FAECEC' : '#F0E8E4' }}>{r.icon}</div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${r.danger ? 'text-[#D9534F]' : 'text-[#242424]'}`}>{r.label}</p>
                <p className="text-xs text-[#6E6E73]">{r.sub}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke={r.danger ? '#ECA0A0' : '#B0A8A4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>
      </div>
    </div>

    {activeSheet === 'ai-memory'     && <AIMemorySheet         onClose={() => setActiveSheet(null)} />}
    {activeSheet === 'family-access' && <FamilyAccessSheet     onClose={() => setActiveSheet(null)} />}
    {activeSheet === 'voice-data'    && <VoiceDataSheet        onClose={() => setActiveSheet(null)} />}
    {activeSheet === 'connected'     && <ConnectedServicesSheet onClose={() => setActiveSheet(null)} />}
    {activeSheet === 'download'      && <DownloadDataSheet     onClose={() => setActiveSheet(null)} />}
    {activeSheet === 'delete'        && <DeleteDataSheet       onClose={() => setActiveSheet(null)} />}
    </>
  )
}
