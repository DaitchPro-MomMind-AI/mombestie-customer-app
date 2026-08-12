/**
 * Client-side stand-in for the real AI Gateway safety classifier
 * (docs/ARCHITECTURE.md §4.1). This is NOT sufficient on its own for
 * production — a client-side keyword check is trivially bypassable and
 * only covers English. It exists here to make the UI pattern (disclose +
 * disclaim) real before a backend model exists, not as the actual safety
 * boundary.
 */

const HEALTH_KEYWORDS = [
  "fever", "temperature", "rash", "vomit", "vomiting", "diarrhea", "medication", "medicine",
  "dose", "dosage", "prescription", "sick", "illness", "cough", "breathing", "choking",
  "allergy", "allergic", "bleeding", "seizure", "infection", "antibiotic", "pain", "hurt",
]

export function needsHealthDisclaimer(text: string): boolean {
  const lower = text.toLowerCase()
  return HEALTH_KEYWORDS.some(k => lower.includes(k))
}

export const HEALTH_DISCLAIMER =
  "This is general guidance based on common patterns, not medical advice. For anything involving diagnosis, medication, or a prescription, please consult Maya's doctor."

/** Shown once per chat/voice session — see docs/ARCHITECTURE.md §4.1 on why this isn't optional. */
export const AI_SELF_DISCLOSURE =
  "Hi, I'm MomMind's AI assistant — I'm here to help with Maya's day. I'll always say when something needs a real doctor."
