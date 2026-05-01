# MatchSats ⚡

> **AI Matchmaking + Lightning Escrow for Conferences.**  
> Built in Africa, for Africa. Powered by Bitcoin.

🔗 **Live:** [matchsats.onrender.com](https://matchsats.onrender.com)  
📦 **Repo:** [github.com/Zeegaths/MatchSats](https://github.com/Zeegaths/MatchSats)

---

## The Problem

You go to a conference. You meet 50 people. You remember 3. You follow up with none.

Conference networking is broken because **there's no cost to ghosting**. People say they'll meet and don't show. Valuable connections are missed because there's no system to find the right person in a crowd of 500.

---

## The Solution

MatchSats introduces **economic integrity** to conference networking.

```
1. AI reads your profile → finds your top 3 matches
2. Both parties lock 2,100 sats via Lightning escrow
3. You meet. Confirm attendance → sats refunded instantly.
4. Ghost → sats gone. No more no-shows.
```

> *"Remove Bitcoin and you have an app a VC already built. Keep it and you have something nobody else has shipped."*

---

## Features

| Feature | Status |
|---------|--------|
| LNURL-auth (no email, no password) | ✅ Live |
| AI profile matching (GPT-4o-mini) | ✅ Live |
| Lightning escrow (LNbits + Voltage) | ✅ Live |
| Whisper meeting transcription | ✅ Live |
| Swahili + English AI summaries | ✅ Live |
| Conference map (Mapbox) | ✅ Live |
| Nostr DMs (NDK) | 🔄 In progress |
| Email auth (non-wallet users) | 🔄 Planned |
| Multi-chain escrow (EVM/USDC) | 🔄 Planned |
| Conference room / invite codes | 🔄 Planned |
| Reputation system | 🔄 Planned |

---

## Tech Stack

```
Frontend      Next.js 15 (App Router, Turbopack)
Auth          LNURL-auth + iron-session
Database      SQLite (better-sqlite3) on Render persistent disk
AI Matching   OpenAI GPT-4o-mini
Transcription OpenAI Whisper + GPT-4o-mini (EN + SW)
Escrow        LNbits (Voltage cloud) — hold invoices
Identity      Nostr (NDK) — encrypted DMs
Maps          Mapbox GL JS
Deployment    Render (Web Service + persistent disk)
```

---

## How It Works

### Auth — LNURL
No email. No password. Just your Lightning wallet.

```
Server generates k1 challenge →
Wallet signs k1 with private key →
Server verifies signature →
Session cookie set (iron-session)
```

Supports: Alby extension (one-click), Phoenix, Zeus, Blue Wallet, Breez, Mutiny

### AI Matching
GPT-4o-mini reads your profile — what you're building, what you need, your vibe — and scores every other attendee profile. Returns top 3 with a score (0-100) and a concrete rationale.

### Lightning Escrow
Both parties lock 2,100 sats before meeting. LNbits creates hold invoices. Webhook fires on payment. After meeting, both confirm → invoices cancelled → sats refunded. If one party disputes → funds frozen for review.

### Whisper Transcription
Record your meeting in the app. Audio sent to OpenAI Whisper → transcript → GPT-4o-mini summarises in English and Swahili. Key points and next steps extracted automatically.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Lightning wallet (Alby, Phoenix, Zeus)
- OpenAI API key
- LNbits instance (Voltage recommended)
- Mapbox token (free tier)

### Install

```bash
git clone https://github.com/Zeegaths/MatchSats
cd MatchSats
npm install
```

### Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SESSION_SECRET=<run: openssl rand -base64 32>

OPENAI_API_KEY=sk-...

NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

LNBITS_URL=https://your-node.voltage.app
LNBITS_ADMIN_KEY=your-admin-key
LNBITS_INVOICE_KEY=your-invoice-key
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

Deployed on **Render** with a persistent disk for SQLite.

### Render Setup

1. Connect GitHub repo
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start`
4. **Disk:** Mount `/data` (1GB) for SQLite persistence
5. Add environment variables in Render dashboard
6. Set `NEXT_PUBLIC_BASE_URL` to your Render URL

### Environment Variables on Render

Same as local, plus:
- `NEXT_PUBLIC_BASE_URL` = `https://your-app.onrender.com`
- `RENDER` = auto-set by Render (controls DB path)

---

## Project Structure

```
app/
  (authenticated)/          # Protected routes (session required)
    matches/                # Match list + AI matching
    matches/[id]/           # Match detail + escrow
    matches/[id]/review/    # Meeting review + Whisper
    matches/[id]/dm/        # Nostr DM thread
    profile/                # Profile setup
    map/                    # Conference map
  (pages)/
    login/                  # LNURL-auth login
  api/
    auth/lnurl/             # Generate k1 challenge
    auth/callback/          # Verify signature + set session
    auth/me/                # Check session
    auth/logout/            # Clear session
    profile/                # Save/fetch profile
    match/                  # AI matching (GET existing, POST run AI)
    match/[id]/             # Single match data
    escrow/                 # Create LNbits invoice
    escrow/webhook/         # LNbits payment webhook
    escrow/confirm/         # Confirm/dispute meeting
    transcribe/             # Whisper + GPT summary
lib/
  db.ts                     # SQLite connection + schema
  session.ts                # iron-session helpers
```

---

## Roadmap

### v1.1 — Conference Rooms
- Organizer creates a conference with invite code
- Attendees join via QR at registration
- AI matching scoped to conference attendees only

### v1.2 — Broader Auth
- Email OTP (Magic link via Resend)
- WalletConnect (EVM wallets)
- Social login with Nostr npub

### v1.3 — Multi-chain Escrow
- USDC on Base/Arbitrum via smart contract
- Same UX — lock before meeting, release after

### v1.4 — Reputation
- On-chain meeting confirmations
- Nostr-verifiable reputation scores
- No-show history visible to matches

---

## Contributing

Built for Bitcoin Unconference Nairobi. PRs welcome.

```bash
git checkout -b feature/your-feature
git commit -m "feat: your feature"
git push origin feature/your-feature
```

---

## License

MIT

---

