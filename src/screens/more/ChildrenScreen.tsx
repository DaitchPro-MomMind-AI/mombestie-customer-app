import { useEffect, useState } from 'react'
import { SubHeader } from '../../components/atoms'
import { getCurrentHouseholdId } from '../../services/authService'
import { listChildren, addChild, updateChild, deleteChild, type Child } from '../../services/childrenService'
import { clearLocalTrackingData } from '../../services/trackingService'

function ageLabel(birthdate: string): string {
  const birth = new Date(birthdate)
  const now = new Date()
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months -= 1
  if (months < 0) return 'Not born yet'
  if (months < 1) return 'Newborn'
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  if (years === 0) return `${months} month${months === 1 ? '' : 's'} old`
  return remMonths === 0 ? `${years} year${years === 1 ? '' : 's'} old` : `${years}y ${remMonths}m old`
}

export function ChildrenSubScreen({ onBack }: { onBack: () => void }) {
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // MBCST-76: real edit of an existing child row (updateChild), alongside
  // the existing real add/remove -- a different form state from "add".
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editBirthdate, setEditBirthdate] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [editSaving, setEditSaving] = useState(false)

  const refresh = (id: string) => {
    setLoading(true)
    listChildren(id).then(rows => { setChildren(rows); setLoading(false) })
  }

  useEffect(() => {
    getCurrentHouseholdId().then(id => {
      setHouseholdId(id)
      if (id) refresh(id); else setLoading(false)
    })
  }, [])

  const submit = async () => {
    if (!householdId || saving) return
    setError(null)
    setSaving(true)
    const result = await addChild(householdId, name, birthdate)
    setSaving(false)
    if (!result.ok) { setError(result.error ?? 'Could not save this child profile -- please try again.'); return }
    setName(''); setBirthdate(''); setShowForm(false)
    refresh(householdId)
  }

  const remove = async (id: string) => {
    if (!householdId) return
    await deleteChild(id)
    // MBCST-76: no real dependent DB rows are confirmed to key off child_id
    // yet (children is the only real table this schema currently ties to a
    // specific child) -- the local tracking-log store is cleared explicitly
    // rather than left silently orphaned under a stale id.
    clearLocalTrackingData(id)
    refresh(householdId)
  }

  const startEdit = (c: Child) => {
    setEditingId(c.id)
    setEditName(c.name)
    setEditBirthdate(c.birthdate)
    setEditError(null)
  }

  const submitEdit = async () => {
    if (!householdId || !editingId || editSaving) return
    setEditError(null)
    setEditSaving(true)
    const result = await updateChild(editingId, { name: editName.trim(), birthdate: editBirthdate })
    setEditSaving(false)
    if (!result.ok) { setEditError(result.error ?? 'Could not save these changes -- please try again.'); return }
    setEditingId(null)
    refresh(householdId)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Children" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-3">
        {!householdId && !loading && (
          <div className="glass-card rounded-2xl p-4">
            <p className="text-sm text-[#6E6E73]">Sign in to manage your children's profiles.</p>
          </div>
        )}

        {loading && <p className="text-sm text-[#6E6E73] px-1">Loading…</p>}

        {!loading && householdId && children.length === 0 && !showForm && (
          <div className="glass-card rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">🍼</p>
            <p className="text-sm text-[#6E6E73]">No children added yet.</p>
          </div>
        )}

        {children.map(c => (
          editingId === c.id ? (
            <div key={c.id} className="glass-card rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide">Edit child</p>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Child's name"
                className="cartoon-input w-full px-3.5 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]"
              />
              <input
                type="date"
                value={editBirthdate}
                onChange={e => setEditBirthdate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="cartoon-input w-full px-3.5 py-3 text-sm text-[#242424]"
              />
              {editError && (
                <div className="rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#C94930]" style={{ background: '#FEEAE6', border: '1.5px solid #F6B6A5' }}>
                  ⚠️ {editError}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => { setEditingId(null); setEditError(null) }} className="action-btn flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#6E6E73]" style={{ background: '#F0E8E4' }}>Cancel</button>
                <button onClick={submitEdit} disabled={editSaving || !editName.trim() || !editBirthdate}
                  className="action-btn flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)' }}>
                  {editSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div key={c.id} className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: '#FFD6C9' }}>👶</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#242424]">{c.name}</p>
                <p className="text-xs text-[#6E6E73]">{ageLabel(c.birthdate)} · born {new Date(c.birthdate).toLocaleDateString()}</p>
              </div>
              <button onClick={() => startEdit(c)} className="action-btn text-xs font-semibold text-[#6299D5] px-2 py-1">Edit</button>
              <button onClick={() => remove(c.id)} className="action-btn text-xs font-semibold text-[#D9534F] px-2 py-1">Remove</button>
            </div>
          )
        ))}

        {householdId && (showForm ? (
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide">Add a child</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Child's name"
              className="cartoon-input w-full px-3.5 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]"
            />
            <input
              type="date"
              value={birthdate}
              onChange={e => setBirthdate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="cartoon-input w-full px-3.5 py-3 text-sm text-[#242424]"
            />
            {error && (
              <div className="rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#C94930]" style={{ background: '#FEEAE6', border: '1.5px solid #F6B6A5' }}>
                ⚠️ {error}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setShowForm(false); setError(null) }} className="action-btn flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#6E6E73]" style={{ background: '#F0E8E4' }}>Cancel</button>
              <button onClick={submit} disabled={saving || !name.trim() || !birthdate}
                className="action-btn flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)}
            className="action-btn w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm"
            style={{ background: '#FFFCFA', border: '2px dashed #F6B6A5', color: '#EE674E' }}>
            + Add a Child
          </button>
        ))}
      </div>
    </div>
  )
}
