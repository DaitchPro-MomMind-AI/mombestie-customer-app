/**
 * Country-config-driven pricing for the customer app — mirrors
 * apps/website/src/i18n.ts's COUNTRY_PROFILES (same 4 example countries, same
 * numbers) so the price a customer sees on the website matches what they see
 * in-app. This file intentionally carries pricing only, not translated UI
 * copy — the app's existing 15-language i18n system (LangContext / TKey)
 * already owns that, separately.
 *
 * detectCountry() uses the browser locale as a stand-in for real geo-IP —
 * see docs/ARCHITECTURE.md §7.1 for why that's not production-reliable.
 */

export type CountryCode = "US" | "GB" | "BD" | "JP"

export interface CountryProfile {
  code: CountryCode
  name: string
  currency: string
  symbol: string
  plusMonthly: number
  familyMonthly: number
  /** Annual billing discount factor applied to the monthly price (matches the ~17% discount the UI already advertised for US). */
  annualFactor: number
}

// Keep in sync with apps/website/src/i18n.ts's COUNTRY_PROFILES.
export const COUNTRY_PROFILES: CountryProfile[] = [
  { code: "US", name: "United States", currency: "USD", symbol: "$", plusMonthly: 14.99, familyMonthly: 24.99, annualFactor: 0.834 },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£", plusMonthly: 12.99, familyMonthly: 21.99, annualFactor: 0.834 },
  { code: "BD", name: "Bangladesh", currency: "BDT", symbol: "৳", plusMonthly: 499, familyMonthly: 899, annualFactor: 0.834 },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥", plusMonthly: 1800, familyMonthly: 3200, annualFactor: 0.834 },
]

const LOCALE_TO_COUNTRY: Record<string, CountryCode> = {
  bn: "BD", "bn-bd": "BD", "bn-in": "BD",
  ja: "JP", "ja-jp": "JP",
  "en-gb": "GB",
}

export function detectCountry(): CountryProfile {
  const fallback = COUNTRY_PROFILES[0]
  if (typeof navigator === "undefined") return fallback
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const raw of langs) {
    if (!raw) continue
    const lower = raw.toLowerCase()
    const code = LOCALE_TO_COUNTRY[lower] ?? LOCALE_TO_COUNTRY[lower.split("-")[0]]
    if (code) return COUNTRY_PROFILES.find(c => c.code === code) ?? fallback
  }
  return fallback
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function formatPrice(country: CountryProfile, amount: number): string {
  return `${country.symbol}${amount.toLocaleString(undefined, amount % 1 === 0 ? undefined : { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function planPrice(country: CountryProfile, plan: "plus" | "family", billing: "monthly" | "annual"): string {
  const base = plan === "plus" ? country.plusMonthly : country.familyMonthly
  const amount = billing === "annual" ? round2(base * country.annualFactor) : base
  return formatPrice(country, amount)
}
