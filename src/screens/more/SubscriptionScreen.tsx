import { useState } from 'react'
import { SubHeader } from '../../components/atoms'
import { detectCountry, planPrice, FEATURES } from '../../services'

/**
 * MBCST-61: while FEATURES.realPayments is false, this app must never
 * simulate a successful charge or a fake "Active" subscription. The prior
 * version of this sheet collected a (fake, unsent) card number/expiry/CVV,
 * ran a setTimeout "Processing…", and then showed "Trial Started!" plus an
 * "✓ Active" plan badge -- a convincing fake checkout with no real gateway
 * behind it. Replaced with an honest disclosure: real plan/price (still
 * sourced from country_config via planPrice, unchanged), no payment fields,
 * no fabricated success state, and no plan is ever marked active from here.
 */
function TrialStartSheet({ planName, price, onClose }: {
  planName: string; price: string; onClose: () => void
}) {
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
              <h3 className="font-display text-lg text-[#242424]">{planName}</h3>
              <p className="text-xs text-[#6E6E73]">{price}/mo</p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
          <div className="rounded-2xl px-4 py-3.5" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
            <p className="font-bold text-sm text-[#7A6010]">⚠️ Not connected yet</p>
            <p className="text-xs text-[#7A6010] mt-1 leading-relaxed">
              Real billing isn't wired up yet -- there's no payment gateway behind this screen. No card is collected here and no plan is activated by closing this sheet. The price above is the real intended price for {planName}, not a placeholder.
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 px-5 pb-6 pt-3 border-t border-[#F0E8E4]">
          <button onClick={onClose}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}


export function SubscriptionSubScreen({ onBack }: { onBack: () => void }) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  // MBCST-61: no real subscriptions table/gateway exists yet (FEATURES.realPayments
  // is false), so every household is honestly on Free -- there is no real
  // "activePlan" to track client-side until that's wired up.
  const activePlan = 'Free'
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
      id: 'plus', name: 'MomBestie Plus', price: planPrice(country, 'plus', billing),
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
      id: 'custom', name: 'MomBestie Pro', price: 'Custom',
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

        {!FEATURES.realPayments && (
          <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
            <p className="text-xs font-bold text-[#7A6010]">⚠️ Not connected yet</p>
            <p className="text-[11px] text-[#7A6010] mt-0.5">Subscription purchases aren't processed yet -- prices below are real, but no plan can be activated or charged from this screen today.</p>
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

              {/* Trial note for paid plans -- describes the real intended trial
                  policy, not a claim that starting a trial here works today */}
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
      />
    )}
    </>
  )
}
