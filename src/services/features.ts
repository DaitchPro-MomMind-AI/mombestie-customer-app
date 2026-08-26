/**
 * Feature flags for capabilities that are UI-complete but not wired to a
 * real backend/vendor yet. Per docs/ARCHITECTURE.md — nothing here should
 * be presented to a user as fully functional until flipped to `true` by a
 * real integration. Keep this list honest: add a flag the moment you stub
 * something, don't wait.
 */
export const FEATURES = {
  /** Stripe/Paddle/Apple Pay/Google Pay/crypto are UI mockups only — no real charge is ever made. */
  realPayments: false,
  /** Marketplace provider list and booking requests are real (public_providers view, bookings table). Availability slots shown per provider are still illustrative -- no real per-slot calendar exists yet. */
  liveMarketplace: true,
  /** AI chat responses are canned/simulated, not a real model call. */
  realAIChat: false,
  /** Voice assistant is a simulated state machine, not real STT/TTS. */
  realVoice: false,
  /** BabyPredict nap/bedtime predictions are static demo values, not a trained model. */
  realPredictions: false,
} as const;
