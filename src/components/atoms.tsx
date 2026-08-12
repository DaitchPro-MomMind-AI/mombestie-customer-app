export function BlobBackground() {
  return (
    <>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </>
  )
}

export function Avatar({ size = 44, initials = 'M', bg = '#F6B6A5' }: { size?: number; initials?: string; bg?: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white text-sm flex-shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, #EE674E)`, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  )
}

export function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="glass-card rounded-2xl p-3 flex flex-col gap-0.5 min-w-0">
      <span className="text-base">{icon}</span>
      <span className="text-xs text-[#6E6E73] leading-none">{label}</span>
      <span className="text-sm font-semibold text-[#242424] leading-tight">{value}</span>
      {sub && <span className="text-[10px] text-[#6E6E73]">{sub}</span>}
    </div>
  )
}

export function QuickAction({ icon, label, onTap }: { icon: string; label: string; onTap?: () => void }) {
  return (
    <button
      onClick={onTap}
      className="action-btn flex flex-col items-center gap-1.5"
    >
      <div className="glass-card rounded-2xl flex items-center justify-center text-xl"
        style={{ width: 52, height: 52 }}>
        {icon}
      </div>
      <span className="text-[11px] font-medium text-[#6E6E73]">{label}</span>
    </button>
  )
}

export function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0">
      <button onClick={onBack} className="action-btn w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: '#FFF8F4', border: '1.5px solid #F6B6A5', boxShadow: '0 2px 0 #F6B6A5' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#EE674E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <h2 className="font-display text-xl text-[#242424]">{title}</h2>
    </div>
  )
}
