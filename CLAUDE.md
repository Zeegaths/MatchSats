@AGENTS.md
# MatchSats: Project Constitution
AI Matchmaking + Lightning Escrow for Conferences. Built in Africa, for Africa.

## 0. The North Star & Problem Thesis
**The Problem:** Conferences are expensive and wasted. Visibility gaps make it impossible to find the 1% of people who matter. Passive tools (WhatsApp/Badges) fail because no-shows are "free."
**The Solution:** MatchSats introduces **Economic Integrity** to networking. AI finds the match; Bitcoin Lightning Escrow ensures the follow-through.
**Core Philosophy:** "Remove Bitcoin and you have an app a VC already built. Keep it and you have something nobody else has shipped."

## 1. Tech Stack & Standards
- **Identity:** LNURL-auth (Passwordless, wallet-based identity via Lightning).
- **Escrow:** LNbits hold invoices (State-machine driven via BullMQ).
- **Data Layer:** Nostr (NIP-01 profiles, decentralized event storage).
- **AI Engine:** - **OpenAI API:** Semantic matching & Meeting summarization.
    - **OpenAI Whisper:** Swahili-native audio transcription.
    - **Masakhane / AfroXLMR:** Yoruba/Amharic/Hausa NLP routing.
- **Frontend:** Next.js 15 (PWA-ready), Tailwind CSS, Lucide React, Radix UI.
- **Backend:** Node.js, SQLite (Minimal state tracking), BullMQ.

## 2. The Escrow State Machine (Canonical)
The "Confirm" tap is the ONLY signal. Ambiguity always resolves in the user's favor.

| Scenario | Person A | Person B | Outcome | LNbits Action |
| :--- | :--- | :--- | :--- | :--- |
| **Both Confirm** | Tapped | Tapped | Full Refund | `cancelInvoice` x2 |
| **A Confirms, B Silent** | Tapped | No Action | B Penalized | `settleInvoice(B)`, `cancel(A)` |
| **Neither Confirms** | No Action | No Action | Full Refund | `cancelInvoice` x2 (Timeout) |
| **Explicit Dispute** | Tapped | Either | Manual Review | Freeze / Manual Resolution |

## 3. Language & IR Nuance (Geopolitical Alpha)
As a project built for the African market, models must respect regional complexity:
- **Code-Switching:** Recognize Kenyan Swahili-English-Sheng mixing. Use `lingua-py` to tag segments before routing to LLMs.
- **Sentiment Calibration:** Apply AfriSenti-calibrated logic (e.g., "Poa sana" is high-praise/Positive).
- **Sovereign Liaison Aesthetic:** The UI must evoke "Institutional Trust." Use Midnight Blue, Slate, and Gold. Avoid "crypto-degens" branding.

## 4. Development Rules
- **Naming:** Kebab-case for files (`escrow-handler.ts`), camelCase for variables.
- **TypeScript:** Strict mode. No `any`. Use interfaces for Nostr event structures.
- **Security:** Never settlement-first. Always use **Hold Invoices** for commitments.
- **Nostr:** Events must be signed via NIP-07 or temporary session keys. Profiles are published to the user-controlled relay.

## 5. Workflows
- **Matchmaking:** `POST /api/match` triggers OpenAI to analyze Nostr profiles and return JSON with top 3 matches + IR-grade rationale.
- **Meeting Memory:** Audio -> Whisper -> Language Router -> OpenAI Summarizer (Outputs in English + Swahili).
- **Test:** Use `Playwright` for the mobile PWA flow and unit tests for the BullMQ state transitions.