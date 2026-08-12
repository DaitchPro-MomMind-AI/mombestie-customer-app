# MomMind AI — Customer App

The customer-facing mobile app for **MomMind AI**, a global AI-powered platform for mothers and children. React 19 + Vite + Tailwind CSS v4.

Covers baby tracking (feeding, sleep, diapers, meals, growth, milestones), an AI Mom Copilot with chat and voice, a daily planner, caregiver/family collaboration and handoff, a family services marketplace, subscriptions, and a privacy center — all in one app for parents of newborns and toddlers.

This is one repo in MomMind's poly-repo platform — see [mommind-docs](https://github.com/DaitchPro-MomMind-AI/mommind-docs) for the full system architecture, including how this app's Tracking Service, AI Assistant, and pricing integrate with the [website](https://github.com/DaitchPro-MomMind-AI/mommind-website), [provider portal](https://github.com/DaitchPro-MomMind-AI/mommind-provider-portal), and [admin portal](https://github.com/DaitchPro-MomMind-AI/mommind-admin-portal).

## Status

Frontend prototype. Baby tracking logs (Feed/Sleep/Diaper/Meal/Growth) persist for real via a local service layer designed to be swapped for a real backend API without touching components — see [`src/services`](./src/services). Everything else (auth, payments, marketplace, AI responses) is UI-complete but mocked; each mocked capability is flagged in [`src/services/features.ts`](./src/services/features.ts). Full detail in [mommind-docs](https://github.com/DaitchPro-MomMind-AI/mommind-docs)'s ARCHITECTURE.md.

## AI Assistant

MomMind's AI identifies itself as AI at the start of every chat/voice session, and automatically appends a "consult your doctor" disclaimer whenever a conversation touches a health topic (see [`src/services/aiSafety.ts`](./src/services/aiSafety.ts)). It's grounded in the child's own logged data rather than claiming to "know everything" — see mommind-docs §4 for the full design and why.

## Development

A Vite dev server runs this app; see [AGENTS.md](./AGENTS.md) for the Figma Make sandbox conventions this repo follows (project structure, styling, code quality rules).

```bash
npm install
npm run dev
```

## Project structure

- `src/App.tsx` — primary application component (all screens)
- `src/services/` — mock service layer (tracking, AI safety, feature flags), designed to be swapped for real API calls
- `src/index.css` — Tailwind v4 entrypoint + MomMind design tokens
- `vite.config.ts` — Vite + React + Tailwind v4 config
