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

/**
 * Three-tier medical-safety classification — docs/ARCHITECTURE.md §14.6-14.7.
 * Same client-side-stand-in caveat as needsHealthDisclaimer above: this is a
 * keyword pattern to make the UI experience real, not the actual safety
 * boundary (that has to be a server-side classifier once a real model
 * exists). The urgent tier is deliberately much narrower than the routine
 * health-topic tier — it should only fire for genuinely emergent language.
 */
const URGENT_KEYWORDS = [
  "not breathing", "stopped breathing", "can't breathe", "cant breathe", "turning blue", "blue lips",
  "unresponsive", "unconscious", "won't wake up", "wont wake up", "seizure", "seizing",
  "severe allergic reaction", "anaphylaxis", "swallowed", "poison", "poisoning",
  "choking", "severe bleeding", "won't stop bleeding", "wont stop bleeding", "head injury", "fell hard",
]

export type HealthIntentTier = "routine" | "consult" | "urgent"

export function classifyHealthIntent(text: string): HealthIntentTier {
  const lower = text.toLowerCase()
  if (URGENT_KEYWORDS.some(k => lower.includes(k))) return "urgent"
  if (HEALTH_KEYWORDS.some(k => lower.includes(k))) return "consult"
  return "routine"
}

/**
 * Never a hardcoded US number — see docs/ARCHITECTURE.md §14.7. `emergencyNumber`
 * comes from the real, live `country_config.emergency_number` column
 * (mommind-backend migration 20260813000001); pass null when it isn't
 * configured for the detected country rather than guessing.
 */
export function urgentSafetyMessage(emergencyNumber: string | null): string {
  const callLine = emergencyNumber
    ? `If this is an emergency, please call ${emergencyNumber} or go to your nearest emergency room right away.`
    : "If this is an emergency, please contact your local emergency services or go to your nearest emergency room right away."
  return `I can't assess how urgent this is, and I don't want to delay you getting real help. ${callLine} I'm not able to diagnose Maya or tell you this can wait.`
}

export const CONSULT_DISCLAIMER =
  "I can't diagnose Maya — there are several possible explanations for what you're describing. Because she's an infant, it would be appropriate to contact a qualified healthcare professional. This is general information, not a medical diagnosis."
