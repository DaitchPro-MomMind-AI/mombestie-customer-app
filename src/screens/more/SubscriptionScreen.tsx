import { useState } from 'react'
import { SubHeader } from '../../components/atoms'
import { detectCountry, planPrice } from '../../services'

function TrialStartSheet({ planName, price, onClose, onConfirm }: {
  planName: string; price: string; onClose: () => void; onConfirm: () => void
}) {
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  const formatCard = (v: string) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d }
  const canStart = card.replace(/\s/g,'').length === 16 && expiry.length === 5 && cvv.length >= 3 && agreed

  const handleStart = () => {
    setProcessing(true)
    setTimeout(() => { setProcessing(false); setDone(true); setTimeout(onConfirm, 1200) }, 1600)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '90%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 coral-gradient rounded-xl flex items-center justify-center text-xl flex-shrink-0">✨</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">Start Free Trial</h3>
              <p className="text-xs text-[#6E6E73]">{planName} · 7 days free, then {price}/mo</p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
          {done ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-20 h-20 rounded-full bg-[#E6F4ED] flex items-center justify-center text-4xl pop-in">🎉</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Trial Started!</p>
                <p className="text-sm text-[#6E6E73] mt-1">7 days free. Cancel anytime before day 7.</p>
              </div>
            </div>
          ) : (<>
            {/* Trial banner */}
            <div className="rounded-2xl px-4 py-3.5 text-center" style={{ background: 'linear-gradient(135deg,#FFD6C9,#FFF3EE)', border: '1.5px solid #F6B6A5' }}>
              <p className="font-bold text-sm text-[#EE674E]">🎁 7-Day Free Trial</p>
              <p className="text-xs text-[#6E6E73] mt-0.5">Your card won't be charged until day 8. Cancel anytime.</p>
            </div>

            {/* Card input */}
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Payment details</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">💳</span>
                <input value={card} onChange={e => setCard(formatCard(e.target.value))}
                  placeholder="1234 5678 9012 3456" inputMode="numeric"
                  className="cartoon-input w-full pl-11 pr-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
              </div>
              <div className="flex gap-3">
                <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY" inputMode="numeric"
                  className="cartoon-input flex-1 px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
                <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))}
                  placeholder="CVV" inputMode="numeric"
                  className="cartoon-input flex-1 px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                {['🔒 Stripe','Visa','Mastercard'].map(b => (
                  <span key={b} className="text-[10px] font-bold text-[#B0A8A4] px-2 py-1 rounded-lg" style={{ background: '#F0E8E4' }}>{b}</span>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Order summary</p>
              {[
                { label: 'Plan', val: planName },
                { label: 'Trial period', val: '7 days free' },
                { label: 'Then billed', val: `${price}/month` },
                { label: 'Due today', val: '$0.00' },
              ].map((r,i) => (
                <div key={i} className="flex justify-between items-center">
                  <p className="text-xs text-[#6E6E73]">{r.label}</p>
                  <p className={`text-sm font-semibold ${r.label === 'Due today' ? 'text-[#55A67A]' : 'text-[#242424]'}`}>{r.val}</p>
                </div>
              ))}
            </div>

            {/* Agreement */}
            <button onClick={() => setAgreed(v => !v)}
              className="action-btn w-full flex items-start gap-3 text-left py-1">
              <div className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border-2 mt-0.5 transition-all"
                style={{ background: agreed ? '#EE674E' : 'white', borderColor: agreed ? '#EE674E' : '#F6B6A5' }}>
                {agreed && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <p className="text-xs text-[#6E6E73] leading-relaxed flex-1">
                I agree to the <span className="text-[#EE674E] font-semibold">Terms of Service</span>. After 7 days, {price}/month will be charged automatically unless cancelled.
              </p>
            </button>
          </>)}
        </div>

        {!done && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            <button onClick={onClose}
              className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={handleStart} disabled={!canStart || processing}
              className="action-btn flex-1 py-3.5 rounded-2xl font-bold text-sm text-white"
              style={!canStart
                ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
                : processing
                  ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 2px 0 #E8A090' }
                  : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
              {processing
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Processing…</span>
                : '✨ Start My Free Trial'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


export function SubscriptionSubScreen({ onBack }: { onBack: () => void }) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [activePlan, setActivePlan] = useState<string>('Free')
  const [trialPlan, setTrialPlan] = useState<{ name: string; price: string } | null>(null)
  // Country-config-driven pricing — see docs/ARCHITECTURE.md §7.1/§7.2. Same
  // mechanism and same reference numbers as apps/website/src/i18n.ts.
  const [country] = useState(() => detectCountry())

  const plans = [
    {
      id: 'free', name: 'Free', price: `${country.symbol}0`, period: 'forever', color: '#6E6E73', accent: '#F0E8E4',
      features: ['1 child', 'Core tracking', 'Basic summary', 'Limited AI (5/day)', 'Marketplace browsing'],
      cta: 'Current Plan', highlight: false, badge: null, trial: false,
    },
    {
      id: 'plus', name: 'MomMind Plus', price: planPrice(country, 'plus', billing),
      period: billing === 'monthly' ? '/month' : '/month (billed annually)', color: '#EE674E', accent: '#FFD6C9',
      features: ['Everything in Free', 'Unlimited AI assistant', 'AI Voice logging', 'BabyPredict', 'Smart meal planning', 'Development activities', 'Data exports'],
      cta: 'Start Free Trial', highlight: true, badge: 'Most Popular', trial: true,
    },
    {
      id: 'family', name: 'Family', price: planPrice(country, 'family', billing),
      period: billing === 'monthly' ? '/month' : '/month (billed annually)', color: '#6299D5', accent: '#EBF2FC',
      features: ['Everything in Plus', 'Multiple children', 'Partner & grandparent access', 'Caregiver handoffs', 'Shared tasks', 'Advanced permissions'],
      cta: 'Start Family Plan', highlight: false, badge: null, trial: true,
    },
    {
      id: 'custom', name: 'MomMind Pro', price: 'Custom',
      period: '— tailored pricing', color: '#B0A0F0', accent: '#F0EEF9',
      features: ['Everything in Family', 'Multiple family groups', 'Dedicated account manager', 'White-glove onboarding', 'API access', 'Custom integrations', 'Priority 24/7 support'],
      cta: 'Contact Us', highlight: false, badge: '🌟 Enterprise', trial: false,
    },
  ]

  const handleCTA = (plan: typeof plans[0]) => {
    if (plan.id === 'free' || activePlan === plan.name) return
    if (plan.id === 'custom') return // contact flow TBD
    setTrialPlan({ name: plan.name, price: plan.price })
  }

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Choose Your Plan" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">
        <p className="text-sm text-[#6E6E73] text-center">Grows with your family</p>

        {/* Active plan banner */}
        {activePlan !== 'Free' && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: '#E6F4ED', border: '1.5px solid #A8D9BC' }}>
            <span className="text-xl">✅</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#55A67A]">Active: {activePlan}</p>
              <p className="text-xs text-[#3D8A60]">7-day trial · Cancel anytime in settings</p>
            </div>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex gap-1 bg-[#F6EDE8] p-1 rounded-xl">
          {(['monthly', 'annual'] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)}
              className={`tab-pill flex-1 py-2 rounded-lg text-xs font-semibold ${billing === b ? 'bg-white text-[#EE674E] shadow-sm' : 'text-[#6E6E73]'}`}>
              {b === 'annual' ? '🏷 Annual (Save 17%)' : 'Monthly'}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        {plans.map((plan) => {
          const isCurrent = activePlan === plan.name
          const isCustom = plan.id === 'custom'
          return (
            <div key={plan.id} className={`rounded-2xl p-4 ${plan.highlight ? 'glass-card-strong' : 'glass-card'}`}
              style={isCurrent
                ? { border: `2px solid ${plan.color}`, boxShadow: `0 0 0 4px ${plan.color}18` }
                : plan.highlight
                  ? { border: `2px solid #EE674E` }
                  : isCustom
                    ? { border: `2px dashed ${plan.color}88`, background: 'linear-gradient(135deg,#F8F4FF,#F0EEF9)' }
                    : {}}>

              {/* Badge row */}
              <div className="flex items-center gap-2 mb-2">
                {plan.badge && (
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white ${plan.highlight ? 'coral-gradient' : ''}`}
                    style={!plan.highlight ? { background: plan.color } : {}}>
                    {plan.badge}
                  </span>
                )}
                {isCurrent && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-[#55A67A]"
                    style={{ background: '#E6F4ED' }}>✓ Active</span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-end gap-1 mb-1">
                <span className="font-display text-3xl text-[#242424]">{plan.price}</span>
                <span className="text-xs text-[#6E6E73] mb-1">{plan.period}</span>
              </div>
              <p className="font-bold text-sm text-[#242424] mb-3">{plan.name}</p>

              {/* Features */}
              <div className="space-y-1.5 mb-4">
                {plan.features.map((f, fi) => (
                  <div key={fi} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: plan.accent }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke={plan.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-xs text-[#6E6E73]">{f}</span>
                  </div>
                ))}
              </div>

              {/* Trial note for paid plans */}
              {plan.trial && !isCurrent && (
                <p className="text-[10px] text-[#6E6E73] text-center mb-2">🎁 7-day free trial · No charge until day 8</p>
              )}

              {/* CTA */}
              <button
                onClick={() => handleCTA(plan)}
                className="action-btn w-full py-3 rounded-xl font-bold text-sm"
                style={isCurrent
                  ? { background: '#F0E8E4', color: '#6E6E73', cursor: 'default' }
                  : isCustom
                    ? { background: 'linear-gradient(135deg,#B0A0F0,#C8B8FF)', border: '2px solid #9880E0', boxShadow: '0 4px 0 #9880E0', color: 'white' }
                    : plan.highlight
                      ? { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930', color: 'white' }
                      : { background: plan.accent, border: `1.5px solid ${plan.color}66`, boxShadow: `0 3px 0 ${plan.color}44`, color: plan.color }}>
                {isCurrent ? '✓ Current Plan' : plan.cta}
              </button>
            </div>
          )
        })}

        {/* Footer note */}
        <p className="text-[10px] text-[#B0A8A4] text-center px-4 leading-relaxed">
          Cancel anytime. Subscriptions auto-renew unless cancelled at least 24 hours before the end of the billing period.
        </p>
      </div>
    </div>

    {trialPlan && (
      <TrialStartSheet
        planName={trialPlan.name}
        price={trialPlan.price}
        onClose={() => setTrialPlan(null)}
        onConfirm={() => { setActivePlan(trialPlan.name); setTrialPlan(null) }}
      />
    )}
    </>
  )
}
