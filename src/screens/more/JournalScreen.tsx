import { useState, useEffect } from 'react'
import { SubHeader } from '../../components/atoms'

type Memory = { icon: string; title: string; date: string; color: string; bg: string; note: string }

const MEMORY_ICONS = ['😊','🍓','🦷','🤸','🎂','🗣️','👶','🌟','❤️','🎵','🛁','🌈','🤣','👣','🎯','🌙']
const MEMORY_COLORS = [
  { color: '#F47B66', bg: '#FFD6C9' },
  { color: '#55A67A', bg: '#E6F4ED' },
  { color: '#6299D5', bg: '#EBF2FC' },
  { color: '#B0A0F0', bg: '#F0EEF9' },
  { color: '#F8C85E', bg: '#FEF7E0' },
  { color: '#EE674E', bg: '#FFE8E0' },
]


function AddMemorySheet({ onClose, onSave }: { onClose: () => void; onSave: (m: Memory) => void }) {
  const [icon, setIcon] = useState('😊')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }))
  const [colorIdx, setColorIdx] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const palette = MEMORY_COLORS[colorIdx]
  const canSave = title.trim() && note.trim()

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false); setSaved(true)
      setTimeout(() => {
        onSave({ icon, title: title.trim(), note: note.trim(), date, ...palette })
        onClose()
      }, 900)
    }, 800)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '90%' }}>

        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: palette.bg }}>{icon}</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">New Memory</h3>
              <p className="text-xs text-[#6E6E73]">Capture a precious moment with Maya</p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
          {saved ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl pop-in"
                style={{ background: palette.bg }}>{icon}</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Memory Saved! 💛</p>
                <p className="text-sm text-[#6E6E73] mt-1">"{title}" added to Maya's story</p>
              </div>
            </div>
          ) : (<>
            {/* Icon */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Choose an icon</p>
              <div className="grid grid-cols-8 gap-2">
                {MEMORY_ICONS.map(ic => (
                  <button key={ic} onClick={() => setIcon(ic)}
                    className="action-btn h-10 rounded-xl flex items-center justify-center text-xl"
                    style={icon === ic
                      ? { background: palette.bg, border: `2px solid ${palette.color}`, boxShadow: `0 3px 0 ${palette.color}55` }
                      : { background: '#F8F4F2', border: '2px solid #F0E8E4' }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Colour */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Colour</p>
              <div className="flex gap-2">
                {MEMORY_COLORS.map((c, i) => (
                  <button key={i} onClick={() => setColorIdx(i)}
                    className="action-btn w-9 h-9 rounded-xl transition-all"
                    style={{ background: c.bg, border: colorIdx === i ? `2.5px solid ${c.color}` : '2.5px solid transparent', boxShadow: colorIdx === i ? `0 3px 0 ${c.color}66` : 'none' }} />
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Memory title *</p>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. First Steps!"
                className="cartoon-input w-full px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
            </div>

            {/* Note */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Your note *</p>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="Describe this precious moment…"
                rows={3}
                className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4] resize-none" />
            </div>

            {/* Date */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Date</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">📅</span>
                <input value={date} onChange={e => setDate(e.target.value)}
                  placeholder="e.g. August 10"
                  className="cartoon-input w-full pl-11 pr-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
              </div>
            </div>

            {/* Preview */}
            {title && note && (
              <div className="glass-card rounded-2xl p-4" style={{ borderLeft: `4px solid ${palette.color}` }}>
                <p className="text-[10px] font-bold text-[#B0A8A4] uppercase tracking-wide mb-2">Preview</p>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: palette.bg }}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-[#242424]">{title}</p>
                      <span className="text-[11px] text-[#6E6E73]">{date}</span>
                    </div>
                    <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed italic">"{note}"</p>
                  </div>
                </div>
              </div>
            )}
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
                  : { background: `linear-gradient(135deg,${palette.color},${palette.color}cc)`, border: `2px solid ${palette.color}99`, boxShadow: `0 4px 0 ${palette.color}66` }}>
              {saving
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Saving…</span>
                : '💛 Save Memory'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


function MonthlyStorySheet({ memories, onClose }: { memories: Memory[]; onClose: () => void }) {
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => { const t = setTimeout(() => setLoading(false), 2000); return () => clearTimeout(t) }, [])

  const story = `This month, Maya reached so many incredible milestones. It all started on ${memories[0]?.date} when ${memories[0]?.note.toLowerCase()} Every day brought something new and magical.\n\nBy ${memories[1]?.date}, she had already ${memories[1]?.note.toLowerCase()} The look of pure joy on her face made every sleepless night worth it.\n\nAs the weeks passed, she grew stronger and more curious. On ${memories[2]?.date}, ${memories[2]?.note.toLowerCase()} And just recently on ${memories[3]?.date}, she amazed us all when she ${memories[3]?.note.toLowerCase()}\n\nEvery moment with Maya is a gift. She is growing so fast, and watching her discover the world fills our hearts with endless love. Here's to many more beautiful memories ahead. 💛`

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '90%' }}>

        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 coral-gradient rounded-xl flex items-center justify-center text-xl flex-shrink-0">✨</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">Monthly Story</h3>
              <p className="text-xs text-[#6E6E73]">AI-written from Maya's memories</p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-5">
              <div className="w-16 h-16 rounded-full coral-gradient flex items-center justify-center ai-orb-pulse">
                <span className="text-2xl">✨</span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#242424]">Writing Maya's story…</p>
                <p className="text-xs text-[#6E6E73] mt-1">Weaving {memories.length} memories into a beautiful tale</p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#EE674E]"
                    style={{ animation: `waveform 0.8s ease-in-out infinite ${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          ) : saved ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-20 h-20 rounded-full bg-[#FFD6C9] flex items-center justify-center text-4xl pop-in">📖</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Story Saved!</p>
                <p className="text-sm text-[#6E6E73] mt-1">Maya's first 7 months, beautifully captured</p>
              </div>
              <button onClick={onClose}
                className="action-btn w-full py-3.5 rounded-2xl font-bold text-white mt-2"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
                Done 💛
              </button>
            </div>
          ) : (<>
            <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
              <p className="text-xs text-[#7A6010]">✨ Generated from {memories.length} memories · You can edit before saving</p>
            </div>
            <div className="glass-card-strong rounded-2xl p-4" style={{ background: 'linear-gradient(135deg,#FFF8F4,#FFF3EE)' }}>
              <p className="font-display text-base text-[#242424] mb-3">Maya's First 7 Months 📖</p>
              <p className="text-sm text-[#3A3A3A] leading-relaxed whitespace-pre-line">{story}</p>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5" style={{ background: '#F8F4F2' }}>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Memories included</p>
              </div>
              {memories.map((m, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-t border-[#F0E8E4]">
                  <span className="text-base">{m.icon}</span>
                  <p className="text-sm text-[#242424] flex-1">{m.title}</p>
                  <span className="text-xs text-[#6E6E73]">{m.date}</span>
                </div>
              ))}
            </div>
          </>)}
        </div>

        {!loading && !saved && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            <button onClick={onClose}
              className="action-btn flex-1 py-3 rounded-2xl font-semibold text-sm text-[#6E6E73]"
              style={{ background: '#F0E8E4', border: '2px solid #E0D8D4' }}>
              Regenerate
            </button>
            <button onClick={() => setSaved(true)}
              className="action-btn flex-1 py-3 rounded-2xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
              Save Story 📖
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


export function MemoryJournalSubScreen({ onBack }: { onBack: () => void }) {
  const [memories, setMemories] = useState<Memory[]>([
    { icon: '😊', title: 'First Smile',      date: 'March 14', color: '#F47B66', bg: '#FFD6C9', note: 'She smiled at me for the first time today. My heart melted.' },
    { icon: '🍓', title: 'First Solid Food', date: 'May 2',     color: '#55A67A', bg: '#E6F4ED', note: 'Tried banana purée. Made the funniest face but ate it all!' },
    { icon: '🦷', title: 'First Tooth',      date: 'June 18',   color: '#6299D5', bg: '#EBF2FC', note: 'Bottom left tooth appeared. Lots of drooling leading up to this!' },
    { icon: '🤸', title: 'Rolled Over!',     date: 'July 5',    color: '#B0A0F0', bg: '#F0EEF9', note: 'Rolled from tummy to back all by herself. So proud!' },
  ])
  const [showAddMemory, setShowAddMemory] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null)

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Maya's Story ❤️" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-3">

        {/* Header card */}
        <div className="glass-card-strong rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg,#FFF3EE,#FFD6C9)' }}>
          <p className="text-2xl mb-1">📖</p>
          <p className="font-display text-lg text-[#242424]">Maya's First 7 Months</p>
          <p className="text-xs text-[#6E6E73] mt-1">{memories.length} {memories.length === 1 ? 'memory' : 'memories'} captured</p>
          <button onClick={() => setShowStory(true)}
            className="action-btn mt-3 px-5 py-2.5 rounded-xl font-bold text-xs text-white"
            style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '1.5px solid #C94930', boxShadow: '0 3px 0 #C94930' }}>
            ✨ Create Monthly Story with AI
          </button>
        </div>

        {/* Memory cards */}
        {memories.map((m, i) => (
          <div key={i}>
            <div className="glass-card rounded-2xl p-4" style={{ borderLeft: `4px solid ${m.color}` }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: m.bg }}>{m.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-[#242424]">{m.title}</p>
                    <span className="text-[11px] text-[#6E6E73] flex-shrink-0">{m.date}</span>
                  </div>
                  <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed italic">"{m.note}"</p>
                </div>
                <button onClick={() => setConfirmDeleteIdx(confirmDeleteIdx === i ? null : i)}
                  className="action-btn w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={confirmDeleteIdx === i
                    ? { background: '#FFD6C9', border: '1.5px solid #EE674E' }
                    : { background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5V3M3.5 3l.5 6.5h4L8.5 3" stroke={confirmDeleteIdx === i ? '#EE674E' : '#6E6E73'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
            {confirmDeleteIdx === i && (
              <div className="mx-1 rounded-b-2xl px-4 py-2.5 flex items-center gap-3"
                style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5', borderTop: 'none', marginTop: -4 }}>
                <p className="text-xs font-semibold text-[#EE674E] flex-1">Delete "{m.title}"?</p>
                <button onClick={() => setConfirmDeleteIdx(null)}
                  className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-[#6E6E73]"
                  style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>Cancel</button>
                <button onClick={() => { setMemories(ms => ms.filter((_,idx) => idx !== i)); setConfirmDeleteIdx(null) }}
                  className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '1.5px solid #C94930', boxShadow: '0 2px 0 #C94930' }}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add button */}
        <button onClick={() => setShowAddMemory(true)}
          className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-[#EE674E] flex items-center justify-center gap-2"
          style={{ background: '#FFD6C9', border: '2px dashed #F6B6A5', boxShadow: '0 3px 0 #F0C8B8' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="#EE674E" strokeWidth="2" strokeLinecap="round"/></svg>
          Add New Memory
        </button>
      </div>
    </div>

    {showAddMemory && (
      <AddMemorySheet
        onClose={() => setShowAddMemory(false)}
        onSave={m => setMemories(ms => [...ms, m])}
      />
    )}
    {showStory && (
      <MonthlyStorySheet memories={memories} onClose={() => setShowStory(false)} />
    )}
    </>
  )
}
