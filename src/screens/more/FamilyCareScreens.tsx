import { useState } from 'react'
import { Avatar, SubHeader } from '../../components/atoms'

export function ProfileSubScreen({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('Sarah Mitchell')
  const [email, setEmail] = useState('sarah@email.com')
  const [saved, setSaved] = useState(false)
  return (
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="My Profile" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="relative">
            <Avatar size={72} initials="S" bg="#F47B66" />
            <button className="absolute -bottom-1 -right-1 w-7 h-7 coral-gradient rounded-full flex items-center justify-center text-white text-xs border-2 border-white">✎</button>
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#242424]">Sarah Mitchell</p>
            <span className="text-[10px] px-3 py-1 rounded-full font-semibold text-[#EE674E]" style={{ background: '#FFD6C9' }}>MomBestie Plus ⭐</span>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Personal Info</p>
          {[{ label: 'Full Name', val: name, set: setName }, { label: 'Email', val: email, set: setEmail }].map(f => (
            <div key={f.label}>
              <p className="text-xs text-[#6E6E73] mb-1">{f.label}</p>
              <input value={f.val} onChange={e => f.set(e.target.value)} className="cartoon-input w-full px-4 py-3 text-sm text-[#242424]" />
            </div>
          ))}
        </div>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
          {[{ icon: '👶', label: "Maya's Profile", sub: '7 months' }, { icon: '🔑', label: 'Change Password', sub: '' }, { icon: '📱', label: 'Linked Devices', sub: '2 devices' }].map((r, i) => (
            <button key={i} className="action-btn w-full flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-xl bg-[#F0E8E4] flex items-center justify-center text-base">{r.icon}</div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-[#242424]">{r.label}</p>
                {r.sub && <p className="text-xs text-[#6E6E73]">{r.sub}</p>}
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#B0A8A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800) }}
          className="action-btn w-full py-4 rounded-2xl font-bold text-base text-white"
          style={saved ? { background: '#55A67A', border: '2.5px solid #3D8A60', boxShadow: '0 4px 0 #3D8A60' } : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2.5px solid #C94930', boxShadow: '0 5px 0 #C94930' }}>
          {saved ? '✅ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// ─── FAMILY & CAREGIVERS SUB-SCREEN ────────────────────────────────────────────

type InviteType = 'family' | 'caregiver' | null

function InviteSheet({ type, onClose, onSent }: {
  type: InviteType
  onClose: () => void
  onSent: (name: string, role: string) => void
}) {
  const isFamily = type === 'family'

  const familyRoles = ['Partner / Spouse', 'Grandparent', 'Sibling', 'Other Family']
  const caregiverRoles = ['Nanny', 'Au Pair', 'Babysitter', 'Night Nurse', 'Other Caregiver']
  const roles = isFamily ? familyRoles : caregiverRoles

  const allPerms = ['View timeline', 'Log feeding', 'Log sleep', 'View meals', 'View appointments', 'View private notes', 'Marketplace access']
  const defaultPerms = isFamily ? [0, 1, 2, 3, 4] : [0, 1, 2, 3]

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [role, setRole] = useState('')
  const [tempAccess, setTempAccess] = useState(false)
  const [until, setUntil] = useState('10:00 PM')
  const [perms, setPerms] = useState(defaultPerms)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const togglePerm = (i: number) =>
    setPerms(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])

  const handleSend = () => {
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      setTimeout(() => { onSent(name || (isFamily ? 'Family Member' : 'Caregiver'), role || roles[0]); onClose() }, 1200)
    }, 1400)
  }

  const canNext1 = contact.trim().length > 0 && role !== ''

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 rounded-t-3xl"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%', display: 'flex', flexDirection: 'column' }}>

        {/* Handle + header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'text-white' : 'text-[#B0A8A4]'}`}
                  style={{ background: step > s ? '#55A67A' : step === s ? 'linear-gradient(135deg,#EE674E,#F47B66)' : '#F0E8E4' }}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`text-[11px] font-semibold flex-1 ${step === s ? 'text-[#EE674E]' : step > s ? 'text-[#55A67A]' : 'text-[#B0A8A4]'}`}>
                  {s === 1 ? 'Details' : s === 2 ? 'Permissions' : 'Confirm'}
                </span>
                {s < 3 && <div className="w-4 h-px bg-[#F0E8E4] mx-1" />}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isFamily ? '' : ''}`}
              style={{ background: isFamily ? '#FFD6C9' : '#E6F4ED' }}>
              {isFamily ? '👨‍👩‍👧' : '🤝'}
            </div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">
                Invite {isFamily ? 'Family Member' : 'Caregiver'}
              </h3>
              <p className="text-xs text-[#6E6E73]">
                {isFamily ? "They'll have family access to Maya" : 'Set access for your caregiver'}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="scroll-area flex-1 px-5 pb-4">

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <div className="space-y-3 pt-1">
              <div>
                <p className="text-xs font-semibold text-[#6E6E73] mb-1.5">Their name <span className="text-[#B0A8A4]">(optional)</span></p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">😊</span>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder={isFamily ? 'e.g. Grandma Rose' : 'e.g. Maria'}
                    className="cartoon-input w-full pl-11 pr-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#6E6E73] mb-1.5">Email or phone number *</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">📧</span>
                  <input value={contact} onChange={e => setContact(e.target.value)}
                    placeholder="email@example.com or +1 555 0000"
                    className="cartoon-input w-full pl-11 pr-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#6E6E73] mb-1.5">Their role *</p>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      className="action-btn py-3 rounded-xl text-sm font-semibold transition-all text-left px-3.5"
                      style={role === r
                        ? { background: isFamily ? '#FFD6C9' : '#E6F4ED', border: `2px solid ${isFamily ? '#EE674E' : '#55A67A'}`, color: isFamily ? '#EE674E' : '#55A67A', boxShadow: `0 3px 0 ${isFamily ? '#F6B6A5' : '#A8D9BC'}` }
                        : { background: '#F8F4F2', border: '2px solid #F0E8E4', color: '#6E6E73' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {!isFamily && (
                <div className="glass-card rounded-2xl p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#242424]">Temporary access</p>
                      <p className="text-xs text-[#6E6E73]">Auto-revoke after a time</p>
                    </div>
                    <button onClick={() => setTempAccess(v => !v)}
                      className="action-btn w-12 h-6 rounded-full transition-all flex-shrink-0"
                      style={{ background: tempAccess ? '#EE674E' : '#E0D8D4' }}>
                      <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                        style={{ marginLeft: tempAccess ? '24px' : '2px' }} />
                    </button>
                  </div>
                  {tempAccess && (
                    <div className="mt-3 pt-3 border-t border-[#F0E8E4]">
                      <p className="text-xs text-[#6E6E73] mb-2">Access until</p>
                      <div className="flex gap-2">
                        {['6:00 PM', '8:00 PM', '10:00 PM', '12:00 AM'].map(t => (
                          <button key={t} onClick={() => setUntil(t)}
                            className="action-btn flex-1 py-2 rounded-lg text-[11px] font-semibold"
                            style={until === t
                              ? { background: '#FFD6C9', border: '1.5px solid #EE674E', color: '#EE674E' }
                              : { background: '#F0E8E4', border: '1.5px solid transparent', color: '#6E6E73' }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Permissions ── */}
          {step === 2 && (
            <div className="space-y-3 pt-1">
              <div className="glass-card-strong rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg,${isFamily ? '#EE674E' : '#55A67A'},${isFamily ? '#F47B66' : '#78C49A'})` }}>
                  {(name || (isFamily ? 'F' : 'C'))[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#242424]">{name || (isFamily ? 'Family Member' : 'Caregiver')}</p>
                  <p className="text-xs text-[#6E6E73]">{role} · {contact}</p>
                </div>
              </div>

              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">What can they access?</p>

              <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
                {allPerms.map((p, i) => {
                  const icons = ['📅', '🍼', '🌙', '🥣', '🏥', '📝', '🛍️']
                  const on = perms.includes(i)
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-base w-6 text-center flex-shrink-0">{icons[i]}</span>
                      <p className="text-sm text-[#242424] flex-1">{p}</p>
                      <button onClick={() => togglePerm(i)}
                        className="action-btn w-12 h-6 rounded-full transition-all flex-shrink-0"
                        style={{ background: on ? (isFamily ? '#EE674E' : '#55A67A') : '#E0D8D4' }}>
                        <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                          style={{ marginLeft: on ? '24px' : '2px' }} />
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setPerms(allPerms.map((_, i) => i))}
                  className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-[#EE674E]"
                  style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5' }}>
                  Select All
                </button>
                <button onClick={() => setPerms([])}
                  className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-[#6E6E73]"
                  style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm & Send ── */}
          {step === 3 && (
            <div className="space-y-3 pt-1">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#E6F4ED] flex items-center justify-center text-4xl">✅</div>
                  <div className="text-center">
                    <p className="font-display text-xl text-[#242424]">Invite sent!</p>
                    <p className="text-sm text-[#6E6E73] mt-1">
                      {name || 'They'} will receive an invite at{' '}
                      <span className="font-semibold text-[#242424]">{contact}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="glass-card-strong rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Invite Summary</p>
                    {[
                      { icon: '😊', label: 'Name', val: name || '—' },
                      { icon: '📧', label: 'Contact', val: contact },
                      { icon: '🎭', label: 'Role', val: role },
                      { icon: '🔐', label: 'Permissions', val: `${perms.length} of ${allPerms.length} enabled` },
                      ...(tempAccess ? [{ icon: '⏰', label: 'Access until', val: until }] : []),
                    ].map((r, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-base w-6 text-center">{r.icon}</span>
                        <p className="text-xs text-[#6E6E73] w-20 flex-shrink-0">{r.label}</p>
                        <p className="text-sm font-semibold text-[#242424] flex-1">{r.val}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
                    <p className="text-xs text-[#7A6010] leading-relaxed">
                      ⚠️ They'll receive a link to download MomBestie and join your family. You can remove access at any time.
                    </p>
                  </div>

                  {/* Send methods */}
                  <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Send invite via</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ icon: '📱', label: 'SMS' }, { icon: '📧', label: 'Email' }, { icon: '🔗', label: 'Copy Link' }].map(m => (
                      <button key={m.label} onClick={handleSend}
                        className="action-btn py-3.5 rounded-xl flex flex-col items-center gap-1.5"
                        style={{ background: '#F8F4F2', border: '2px solid #F0E8E4', boxShadow: '0 3px 0 #E8E0DC' }}>
                        <span className="text-2xl">{m.icon}</span>
                        <span className="text-xs font-semibold text-[#242424]">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {!sent && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
                className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
            <button
              onClick={() => step < 3 ? setStep(s => (s + 1) as 1 | 2 | 3) : handleSend()}
              disabled={step === 1 && !canNext1}
              className="action-btn flex-1 py-3.5 rounded-xl font-bold text-base text-white"
              style={step === 1 && !canNext1
                ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
                : sending
                  ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 2px 0 #E8A090' }
                  : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2.5px solid #C94930', boxShadow: '0 5px 0 #C94930' }}>
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />
                  Sending…
                </span>
              ) : step === 1 ? 'Next — Set Permissions →' : step === 2 ? 'Review Invite →' : 'Send Invite 🎉'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


export function FamilySubScreen({ onBack }: { onBack: () => void }) {
  const [inviteType, setInviteType] = useState<InviteType>(null)
  const [members, setMembers] = useState([
    { name: 'Sarah', role: 'Mom', tag: 'Owner', color: '#EE674E', bg: '#FFD6C9', online: true },
    { name: 'David', role: 'Dad', tag: 'Parent', color: '#6299D5', bg: '#EBF2FC', online: true },
    { name: 'Grandma', role: 'Temporary Caregiver', tag: 'Until 10 PM', color: '#55A67A', bg: '#E6F4ED', online: false },
    { name: 'Nanny', role: 'Caregiver', tag: 'Active', color: '#B0A0F0', bg: '#F0EEF9', online: false },
  ])
  const perms = ['View timeline', 'Log feeding', 'Log sleep', 'View meals', 'View appointments', 'View private notes', 'Marketplace access']
  const [selected, setSelected] = useState([0, 1, 2, 3])
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const handleInviteSent = (name: string, role: string) => {
    const colors = ['#EE674E', '#6299D5', '#55A67A', '#B0A0F0', '#F8C85E']
    const bgs   = ['#FFD6C9', '#EBF2FC', '#E6F4ED', '#F0EEF9', '#FEF7E0']
    const idx   = members.length % colors.length
    setMembers(m => [...m, { name, role, tag: 'Pending', color: colors[idx], bg: bgs[idx], online: false }])
  }

  const handleDelete = (i: number) => {
    setMembers(m => m.filter((_, idx) => idx !== i))
    setConfirmDelete(null)
  }

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Family & Caregivers" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">
        {/* Member list */}
        <div className="space-y-2">
          {members.map((m, i) => (
            <div key={i}>
              <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3"
                style={confirmDelete === i ? { border: '1.5px solid #F6B6A5', background: 'rgba(255,214,201,0.5)' } : {}}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                    style={{ background: `linear-gradient(135deg,${m.color},${m.color}99)` }}>{m.name[0]}</div>
                  {m.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#55A67A] rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#242424]">{m.name}</p>
                  <p className="text-xs text-[#6E6E73]">{m.role}</p>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: m.bg, color: m.color }}>{m.tag}</span>
                {/* Delete button — hidden for Owner */}
                {m.tag !== 'Owner' && (
                  <button
                    onClick={() => setConfirmDelete(confirmDelete === i ? null : i)}
                    className="action-btn w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ml-1"
                    style={confirmDelete === i
                      ? { background: '#FFD6C9', border: '1.5px solid #EE674E' }
                      : { background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 3.5h9M5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M3.5 3.5l.5 7h5l.5-7" stroke={confirmDelete === i ? '#EE674E' : '#6E6E73'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
              {/* Inline confirm row */}
              {confirmDelete === i && (
                <div className="mx-1 rounded-b-2xl px-4 py-3 flex items-center gap-3"
                  style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5', borderTop: 'none', marginTop: -4 }}>
                  <p className="text-xs font-semibold text-[#EE674E] flex-1">Remove {m.name} from family?</p>
                  <button onClick={() => setConfirmDelete(null)}
                    className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-[#6E6E73]"
                    style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(i)}
                    className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '1.5px solid #C94930', boxShadow: '0 2px 0 #C94930' }}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Invite buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setInviteType('family')}
            className="action-btn flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            <span className="text-base">👨‍👩‍👧</span> Invite Family
          </button>
          <button
            onClick={() => setInviteType('caregiver')}
            className="action-btn flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm text-[#55A67A]"
            style={{ background: '#E6F4ED', border: '2px solid #A8D9BC', boxShadow: '0 4px 0 #A8D9BC' }}>
            <span className="text-base">🤝</span> Invite Caregiver
          </button>
        </div>

        {/* Permissions */}
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Manage Permissions</p>
          <div className="space-y-3">
            {perms.map((p, i) => {
              const icons = ['📅','🍼','🌙','🥣','🏥','📝','🛍️']
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{icons[i]}</span>
                  <p className="text-sm text-[#242424] flex-1">{p}</p>
                  <button onClick={() => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])}
                    className="action-btn w-12 h-6 rounded-full transition-all flex-shrink-0"
                    style={{ background: selected.includes(i) ? '#EE674E' : '#E0D8D4' }}>
                    <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                      style={{ marginLeft: selected.includes(i) ? '24px' : '2px' }} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>

    {/* Invite bottom sheet */}
    {inviteType && (
      <InviteSheet
        type={inviteType}
        onClose={() => setInviteType(null)}
        onSent={handleInviteSent}
      />
    )}
    </>
  )
}

// ─── CAREGIVER HANDOFF SUB-SCREEN ──────────────────────────────────────────────

function HandoffShareSheet({ items, shared, onClose }: {
  items: { icon: string; label: string; val: string }[]
  shared: number[]
  onClose: () => void
}) {
  const caregivers = [
    { name: 'Grandma', role: 'Temporary Caregiver', color: '#55A67A', bg: '#E6F4ED' },
    { name: 'Nanny', role: 'Caregiver', color: '#B0A0F0', bg: '#F0EEF9' },
    { name: 'David', role: 'Dad', color: '#6299D5', bg: '#EBF2FC' },
  ]
  const methods = [
    { icon: '📱', label: 'SMS' },
    { icon: '📧', label: 'Email' },
    { icon: '💬', label: 'WhatsApp' },
    { icon: '🔗', label: 'Copy Link' },
  ]
  const [selectedCaregiver, setSelectedCaregiver] = useState(0)
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [note, setNote] = useState('')

  const sharedItems = items.filter((_, i) => shared.includes(i))

  const handleSend = (methodIdx: number) => {
    setSelectedMethod(methodIdx)
    setSending(true)
    setTimeout(() => { setSending(false); setSent(true) }, 1400)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '86%' }}>

        {/* Handle + header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 coral-gradient rounded-xl flex items-center justify-center text-white text-lg">📤</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">Share Handoff</h3>
              <p className="text-xs text-[#6E6E73]">{sharedItems.length} of {items.length} items selected</p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-2 space-y-4">
          {sent ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-20 h-20 rounded-full bg-[#E6F4ED] flex items-center justify-center text-4xl pop-in">✅</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Handoff Shared!</p>
                <p className="text-sm text-[#6E6E73] mt-1">
                  Sent to <span className="font-semibold text-[#242424]">{caregivers[selectedCaregiver].name}</span> via{' '}
                  <span className="font-semibold text-[#242424]">{methods[selectedMethod!].label}</span>
                </p>
              </div>
              <div className="glass-card rounded-2xl p-4 w-full space-y-2">
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">What was shared</p>
                {sharedItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <p className="text-xs text-[#242424]"><span className="text-[#6E6E73]">{item.label}:</span> {item.val}</p>
                  </div>
                ))}
              </div>
              <button onClick={onClose}
                className="action-btn w-full py-3.5 rounded-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Caregiver picker */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Send to</p>
                <div className="space-y-2">
                  {caregivers.map((c, i) => (
                    <button key={i} onClick={() => setSelectedCaregiver(i)}
                      className="action-btn w-full rounded-2xl p-3 flex items-center gap-3 text-left"
                      style={selectedCaregiver === i
                        ? { background: c.bg, border: `2px solid ${c.color}`, boxShadow: `0 3px 0 ${c.color}44` }
                        : { background: '#F8F4F2', border: '2px solid #F0E8E4' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                        style={{ background: `linear-gradient(135deg,${c.color},${c.color}99)` }}>{c.name[0]}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[#242424]">{c.name}</p>
                        <p className="text-xs text-[#6E6E73]">{c.role}</p>
                      </div>
                      {selectedCaregiver === i && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: c.color }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Handoff preview */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Handoff preview</p>
                <div className="glass-card rounded-2xl divide-y divide-[#F0E8E4] overflow-hidden">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5"
                      style={!shared.includes(i) ? { opacity: 0.35 } : {}}>
                      <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-[#6E6E73]">{item.label}</p>
                        <p className="text-sm font-medium text-[#242424] truncate">{item.val}</p>
                      </div>
                      {!shared.includes(i) && <span className="text-[10px] text-[#B0A8A4] font-medium">excluded</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional note */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Add a note <span className="font-normal normal-case">(optional)</span></p>
                <div className="relative">
                  <textarea value={note} onChange={e => setNote(e.target.value)}
                    placeholder={`Hi ${caregivers[selectedCaregiver].name}! Here's Maya's handoff for tonight...`}
                    rows={2}
                    className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4] resize-none" />
                </div>
              </div>

              {/* Send via */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Send via</p>
                <div className="grid grid-cols-4 gap-2">
                  {methods.map((m, i) => (
                    <button key={i} onClick={() => handleSend(i)}
                      disabled={sending}
                      className="action-btn py-3.5 rounded-2xl flex flex-col items-center gap-1.5"
                      style={sending && selectedMethod === i
                        ? { background: '#FFD6C9', border: '2px solid #F6B6A5', boxShadow: '0 2px 0 #F6B6A5' }
                        : { background: '#F8F4F2', border: '2px solid #F0E8E4', boxShadow: '0 3px 0 #E8E0DC' }}>
                      {sending && selectedMethod === i ? (
                        <span className="w-5 h-5 rounded-full border-2 border-[#F6B6A5] border-t-[#EE674E] inline-block spin-slow" />
                      ) : (
                        <span className="text-2xl">{m.icon}</span>
                      )}
                      <span className="text-[11px] font-semibold text-[#242424]">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {!sent && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3">
            <button onClick={onClose}
              className="action-btn w-full py-3 rounded-2xl font-semibold text-sm text-[#6E6E73]"
              style={{ background: '#F0E8E4', border: '2px solid #E0D8D4' }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


export function CaregiverHandoffSubScreen({ onBack }: { onBack: () => void }) {
  const [shared, setShared] = useState([0, 1, 2, 3, 4])
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const items = [
    { icon: '🍼', label: 'Last feeding', val: '4:20 PM — 5 oz' },
    { icon: '🌙', label: 'Last nap', val: '2:05–3:22 PM' },
    { icon: '⏰', label: 'Next feeding', val: 'Around 7:15 PM' },
    { icon: '🛏️', label: 'Bedtime', val: 'Around 7:45 PM' },
    { icon: '🥣', label: 'Dinner', val: 'Sweet potato + chicken' },
    { icon: '📝', label: 'Important notes', val: 'Bottle prepared in refrigerator.' },
  ]
  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Caregiver Handoff" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">
        <div className="glass-card-strong rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 coral-gradient rounded-xl flex items-center justify-center text-white text-sm">✨</div>
            <div>
              <p className="font-semibold text-sm text-[#242424]">Maya's Evening Handoff</p>
              <p className="text-xs text-[#6E6E73]">Auto-generated · Monday Aug 10</p>
            </div>
          </div>
          <div className="space-y-0 divide-y divide-[#F0E8E4]">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5">
                <button onClick={() => setShared(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])}
                  className="action-btn w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all"
                  style={{ background: shared.includes(i) ? '#EE674E' : 'white', borderColor: shared.includes(i) ? '#EE674E' : '#F6B6A5' }}>
                  {shared.includes(i) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#6E6E73]">{item.icon} {item.label}</p>
                  <p className="text-sm font-medium text-[#242424]">{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600) }}
            className="action-btn flex-1 py-3.5 rounded-xl font-semibold text-sm text-white"
            style={copied ? { background: '#55A67A', border: '2px solid #3D8A60', boxShadow: '0 3px 0 #3D8A60' } : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            {copied ? '✅ Copied!' : '📋 Copy Handoff'}
          </button>
          <button onClick={() => setShareOpen(true)}
            className="action-btn flex-1 py-3.5 rounded-xl font-semibold text-sm text-[#EE674E]"
            style={{ background: '#FFD6C9', border: '2px solid #F6B6A5', boxShadow: '0 4px 0 #F6B6A5' }}>
            📤 Share with Grandma
          </button>
        </div>
      </div>
    </div>
    {shareOpen && (
      <HandoffShareSheet
        items={items}
        shared={shared}
        onClose={() => setShareOpen(false)}
      />
    )}
    </>
  )
}
