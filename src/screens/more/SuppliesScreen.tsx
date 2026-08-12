import { useState } from 'react'
import { SubHeader } from '../../components/atoms'

type Supply = { icon: string; name: string; qty: number; unit: string; days: number; status: string }

const STATUS_META: Record<string, { bg: string; text: string; label: string; bar: string }> = {
  critical: { bg: '#FAECEC', text: '#D9534F', label: 'Critical', bar: '#D9534F' },
  low:      { bg: '#FEF3CD', text: '#B8860B', label: 'Low',      bar: '#F8C85E' },
  ok:       { bg: '#E6F4ED', text: '#55A67A', label: 'Good',     bar: '#55A67A' },
}


function SupplyShoppingSheet({ items, onClose }: { items: Supply[]; onClose: () => void }) {
  const [checked, setChecked] = useState<string[]>([])
  const [added, setAdded] = useState(false)
  const toggle = (n: string) => setChecked(c => c.includes(n) ? c.filter(x => x !== n) : [...c, n])
  const handleAdd = () => { setAdded(true); setTimeout(onClose, 1200) }
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '82%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#FFD6C9' }}>🛒</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">Shopping List</h3>
              <p className="text-xs text-[#6E6E73]">{items.length} low/critical items</p>
            </div>
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-2">
          {added ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#E6F4ED] flex items-center justify-center text-3xl pop-in">✅</div>
              <p className="font-display text-xl text-[#242424]">Added to list!</p>
              <p className="text-sm text-[#6E6E73]">{checked.length || items.length} items saved to your shopping list</p>
            </div>
          ) : (<>
            <p className="text-xs text-[#6E6E73] pb-1">Select the items you want to add to your shopping list.</p>
            {items.map((s, i) => {
              const sc = STATUS_META[s.status]
              const on = checked.includes(s.name)
              return (
                <button key={i} onClick={() => toggle(s.name)}
                  className="action-btn w-full rounded-2xl p-3.5 flex items-center gap-3 text-left"
                  style={on ? { background: sc.bg, border: `2px solid ${sc.text}40`, boxShadow: `0 3px 0 ${sc.text}20` } : { background: '#F8F4F2', border: '2px solid #F0E8E4' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: on ? sc.bg : '#F0E8E4' }}>{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#242424]">{s.name}</p>
                    <p className="text-xs text-[#6E6E73]">{s.qty} {s.unit} left · ~{s.days} days</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                    style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: on ? sc.text : '#F0E8E4', border: `2px solid ${on ? sc.text : '#E0D8D4'}` }}>
                    {on && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </button>
              )
            })}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setChecked(items.map(s => s.name))}
                className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-[#EE674E]"
                style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5' }}>Select All</button>
              <button onClick={() => setChecked([])}
                className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-[#6E6E73]"
                style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>Clear</button>
            </div>
          </>)}
        </div>
        {!added && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            <button onClick={onClose}
              className="action-btn flex-1 py-3 rounded-2xl font-semibold text-sm text-[#6E6E73]"
              style={{ background: '#F0E8E4', border: '2px solid #E0D8D4' }}>Cancel</button>
            <button onClick={handleAdd}
              className="action-btn flex-1 py-3 rounded-2xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
              Add {checked.length > 0 ? `(${checked.length})` : 'All'} to List 🛒
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


function AddSupplySheet({ onClose, onSave }: { onClose: () => void; onSave: (s: Supply) => void }) {
  const SUPPLY_ICONS = ['🧷','🧻','🍼','🥣','🧴','👶','🛁','🧸','💊','🩹','🧃','🍭','👕','🧦','🛏️','🪣']
  const UNITS = ['left','packs','cans','pouches','bottles','boxes','rolls','bags','pieces']
  const [icon, setIcon] = useState('🧷')
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('left')
  const [days, setDays] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const status = !days ? 'ok' : parseInt(days) <= 2 ? 'critical' : parseInt(days) <= 5 ? 'low' : 'ok'
  const canSave = name.trim() && qty && days

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false); setSaved(true)
      const newItem: Supply = { icon, name: name.trim(), qty: parseInt(qty), unit, days: parseInt(days), status }
      setTimeout(() => { onSave(newItem); onClose() }, 900)
    }, 800)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: STATUS_META[status].bg }}>{icon}</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">New Supply Item</h3>
              <p className="text-xs text-[#6E6E73]">Track what you need for Maya</p>
            </div>
            {days && (
              <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: STATUS_META[status].bg, color: STATUS_META[status].text }}>
                {STATUS_META[status].label}
              </span>
            )}
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
          {saved ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl pop-in"
                style={{ background: STATUS_META[status].bg }}>{icon}</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Supply Added!</p>
                <p className="text-sm text-[#6E6E73] mt-1">{name} is now being tracked</p>
              </div>
            </div>
          ) : (<>
            {/* Icon */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Icon</p>
              <div className="grid grid-cols-8 gap-2">
                {SUPPLY_ICONS.map(ic => (
                  <button key={ic} onClick={() => setIcon(ic)}
                    className="action-btn h-10 rounded-xl flex items-center justify-center text-xl"
                    style={icon === ic
                      ? { background: '#FFD6C9', border: '2px solid #EE674E', boxShadow: '0 3px 0 #F6B6A5' }
                      : { background: '#F8F4F2', border: '2px solid #F0E8E4' }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Item name *</p>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Diapers Size 3"
                className="cartoon-input w-full px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
            </div>

            {/* Qty + unit */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Quantity *</p>
              <div className="flex gap-2">
                <input value={qty} onChange={e => setQty(e.target.value.replace(/\D/g,''))}
                  placeholder="e.g. 23" type="number" inputMode="numeric"
                  className="cartoon-input flex-1 px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
                <div className="relative flex-1">
                  <select value={unit} onChange={e => setUnit(e.target.value)}
                    className="cartoon-input w-full px-4 py-3.5 text-sm text-[#242424] appearance-none pr-8">
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="#B0A8A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            {/* Days remaining */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Days remaining *</p>
              <input value={days} onChange={e => setDays(e.target.value.replace(/\D/g,''))}
                placeholder="Estimated days before you run out"
                type="number" inputMode="numeric"
                className="cartoon-input w-full px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
              {days && (
                <div className="mt-2 h-2 rounded-full bg-[#F0E8E4] overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100,(parseInt(days)/14)*100)}%`, background: STATUS_META[status].bar }} />
                </div>
              )}
            </div>
          </>)}
        </div>

        {!saved && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            <button onClick={onClose}
              className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={handleSave} disabled={!canSave || saving}
              className="action-btn flex-1 py-3.5 rounded-2xl font-bold text-sm text-white"
              style={!canSave
                ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
                : saving
                  ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 2px 0 #E8A090' }
                  : { background: 'linear-gradient(135deg,#6299D5,#7AACE0)', border: '2px solid #4A82C0', boxShadow: '0 4px 0 #4A82C0' }}>
              {saving
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Saving…</span>
                : '+ Add to Supplies'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


export function BabySuppliesSubScreen({ onBack }: { onBack: () => void }) {
  const [supplies, setSupplies] = useState<Supply[]>([
    { icon: '🧷', name: 'Diapers',     qty: 23, unit: 'left',    days: 4,  status: 'low'      },
    { icon: '🧻', name: 'Wipes',       qty: 12, unit: 'packs',   days: 2,  status: 'critical' },
    { icon: '🍼', name: 'Formula',     qty: 1,  unit: 'can',     days: 6,  status: 'ok'       },
    { icon: '🥣', name: 'Baby Food',   qty: 8,  unit: 'pouches', days: 10, status: 'ok'       },
    { icon: '🧴', name: 'Baby Lotion', qty: 1,  unit: 'bottle',  days: 14, status: 'ok'       },
  ])
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null)

  const lowItems = supplies.filter(s => s.status === 'critical' || s.status === 'low')

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Baby Supplies" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-3">

        {/* Alert banner — tappable, dismissable */}
        {!alertDismissed && lowItems.length > 0 && (
          <div onClick={() => setShowShoppingList(true)}
            className="action-btn w-full rounded-2xl p-3.5 flex items-center gap-2.5 cursor-pointer"
            style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E', boxShadow: '0 3px 0 #F0D840' }}>
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#B8860B]">{lowItems.length} item{lowItems.length > 1 ? 's' : ''} need restocking soon</p>
              <p className="text-xs text-[#7A6010]">Tap to add to shopping list →</p>
            </div>
            <button onClick={e => { e.stopPropagation(); setAlertDismissed(true) }}
              className="action-btn w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#F8E88050', border: '1px solid #F8C85E80' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2L2 8" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        )}

        {/* Supply cards */}
        {supplies.map((s, i) => {
          const sc = STATUS_META[s.status]
          const pct = Math.min(100, (s.days / 14) * 100)
          return (
            <div key={i}>
              <div className="glass-card rounded-2xl p-3.5"
                style={confirmDeleteIdx === i ? { border: '1.5px solid #F6B6A5', background: 'rgba(255,214,201,0.4)' } : {}}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: sc.bg }}>{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <p className="font-semibold text-sm text-[#242424]">{s.name}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                    </div>
                    <p className="text-xs text-[#6E6E73]">{s.qty} {s.unit} · ~{s.days} days remaining</p>
                  </div>
                  <button onClick={() => setConfirmDeleteIdx(confirmDeleteIdx === i ? null : i)}
                    className="action-btn w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={confirmDeleteIdx === i
                      ? { background: '#FFD6C9', border: '1.5px solid #EE674E' }
                      : { background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5V3M3.5 3l.5 6.5h4L8.5 3" stroke={confirmDeleteIdx === i ? '#EE674E' : '#6E6E73'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
                <div className="h-1.5 rounded-full bg-[#F0E8E4] overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: sc.bar }} />
                </div>
              </div>
              {confirmDeleteIdx === i && (
                <div className="mx-1 rounded-b-2xl px-4 py-2.5 flex items-center gap-3"
                  style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5', borderTop: 'none', marginTop: -4 }}>
                  <p className="text-xs font-semibold text-[#EE674E] flex-1">Remove {s.name}?</p>
                  <button onClick={() => setConfirmDeleteIdx(null)}
                    className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-[#6E6E73]"
                    style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>Cancel</button>
                  <button onClick={() => { setSupplies(sv => sv.filter((_,idx) => idx !== i)); setConfirmDeleteIdx(null) }}
                    className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '1.5px solid #C94930', boxShadow: '0 2px 0 #C94930' }}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Action buttons */}
        <button onClick={() => setShowShoppingList(true)}
          className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
          🛒 Add All Low Items to Shopping List
          {lowItems.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[11px] font-bold text-[#EE674E]">{lowItems.length}</span>
          )}
        </button>
        <button onClick={() => setShowAddItem(true)}
          className="action-btn w-full py-3 rounded-2xl font-bold text-sm text-[#6299D5] flex items-center justify-center gap-2"
          style={{ background: '#EBF2FC', border: '2px solid #C5D9F0', boxShadow: '0 3px 0 #C5D9F0' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="#6299D5" strokeWidth="2" strokeLinecap="round"/></svg>
          Add New Supply Item
        </button>
      </div>
    </div>

    {showShoppingList && (
      <SupplyShoppingSheet items={lowItems} onClose={() => setShowShoppingList(false)} />
    )}
    {showAddItem && (
      <AddSupplySheet
        onClose={() => setShowAddItem(false)}
        onSave={item => setSupplies(sv => [...sv, item])}
      />
    )}
    </>
  )
}
