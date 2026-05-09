# MatchSats

> AI Matchmaking + Lightning Escrow for Conferences.
> Built in Africa, for Africa. Powered by Bitcoin.

Live: https://matchsats.onrender.com
Repo: https://github.com/Zeegaths/MatchSats

---

## What Is This?

MatchSats solves the no-show problem at professional conferences. You go to a conference, meet 50 people, remember 3, follow up with none. Conference networking is broken because there is no cost to ghosting.

MatchSats introduces economic integrity to networking. AI finds your top matches at the event. Both parties lock 2,100 sats via Lightning escrow before meeting. Show up, get refunded. Ghost, and your sats are gone.

> "Remove Bitcoin and you have an app a VC already built. Keep it and you have something nobody else has shipped."

---

## How It Works

### Step 1 — Sign In

No email. No password. Scan a QR code with your Lightning wallet or use the Alby browser extension. Your wallet signs a cryptographic challenge. Session is set. Done.

Supported wallets: Alby (one-click browser extension), Phoenix, Zeus, Blue Wallet, Breez, Mutiny.

### Step 2 — Build Your Profile

Tell the app what you are building, what you need, and what kind of person you work well with. Select your interests and core vibe. Add your Lightning address. Enter your conference code to scope your matches to people at your event.

### Step 3 — AI Matching

Hit Find My Matches. GPT-4o-mini reads your profile and scores every other attendee. Returns your top 3 with a match score from 0 to 100 and a concrete rationale explaining why this specific person is valuable to you.

### Step 4 — Lock Sats

Tap a match, read their profile, and tap Lock Sats. Both parties pay a 2,100 sat Lightning invoice. LNbits holds the funds. Neither party gets them back until the meeting is confirmed.

### Step 5 — Meet

You are now both committed. The app shows your meeting is active with a countdown timer.

### Step 6 — Record and Review

After the meeting, open the review screen. Tap Record and speak for 30 to 60 seconds summarising what you discussed. The audio is sent to OpenAI Whisper, transcribed, and summarised by GPT-4o-mini in both English and Swahili. Key points and next steps are extracted automatically.

### Step 7 — Confirm Attendance

Both parties confirm they met. Sats are released instantly. If someone disputes, funds are frozen for review.

---

## Features

| Feature | Status |
|---|---|
| LNURL-auth login | Live |
| AI profile matching | Live |
| Lightning escrow | Live |
| Whisper transcription | Live |
| Swahili and English summaries | Live |
| Conference map | Live |
| Invite code conference rooms | Live |
| Nostr DMs | In Progress |
| Email auth | Planned |
| Multi-chain escrow USDC | Planned |
| Reputation system | Planned |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, App Router, Turbopack |
| Auth | LNURL-auth, iron-session |
| Database | SQLite via better-sqlite3, Render persistent disk |
| AI Matching | OpenAI GPT-4o-mini |
| Transcription | OpenAI Whisper, GPT-4o-mini |
| Escrow | LNbits on Voltage cloud |
| Identity | Nostr, NDK |
| Maps | Mapbox GL JS |
| Deployment | Render Web Service |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Lightning wallet: Alby, Phoenix, or Zeus
- OpenAI API key
- LNbits instance (Voltage recommended)
- Mapbox token (free tier is sufficient)

### Install

```bash
git clone https://github.com/Zeegaths/MatchSats
cd MatchSats
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SESSION_SECRET=generate with: openssl rand -base64 32
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

Open http://localhost:3000 in your browser.

---

## Deployment

MatchSats runs on Render with a persistent disk for SQLite storage.

### Render Setup

1. Connect your GitHub repo to Render
2. Set Build Command to: `npm install && npm run build`
3. Set Start Command to: `npm start`
4. Add a Disk with mount path `/data` and size 1 GB
5. Add all environment variables in the Render dashboard
6. Set `NEXT_PUBLIC_BASE_URL` to your Render service URL

Render automatically injects a `RENDER` environment variable which the app uses to switch the database path to `/data/matchsats.db`.

---

## Project Structure

```
app/
  (authenticated)/
    matches/               Match list and AI matching
    matches/[id]/          Match detail and escrow
    matches/[id]/review/   Meeting review and Whisper transcription
    matches/[id]/dm/       Nostr DM thread
    profile/               Profile setup
    map/                   Conference map
  (pages)/
    login/                 LNURL-auth login flow
  api/
    auth/lnurl/            Generate k1 challenge
    auth/callback/         Verify wallet signature and set session
    auth/me/               Check session status
    auth/logout/           Clear session
    profile/               Save and fetch profile
    match/                 Run AI matching and fetch existing matches
    match/[id]/            Fetch single match data
    escrow/                Create LNbits hold invoice
    escrow/webhook/        LNbits payment webhook
    escrow/confirm/        Confirm or dispute meeting
    transcribe/            Whisper transcription and GPT summary
lib/
  db.ts                    SQLite connection and schema
  session.ts               iron-session helpers
```

---

## API Reference

### Authentication

**GET /api/auth/lnurl**

Generates a fresh k1 challenge and returns a bech32-encoded LNURL for the wallet to sign.

Response:

```json
{
  "tag": "login",
  "k1": "32 byte hex string",
  "callback": "https://your-app.com/api/auth/callback",
  "lnurl": "LNURL1...",
  "qr": "raw callback URL for QR generation"
}
```

**GET /api/auth/callback**

Called by the wallet after signing the k1 challenge. Sets a session cookie on success.

Query parameters: k1, sig, key

Success response: `{ "status": "OK" }`

Error response: `{ "status": "ERROR", "reason": "Invalid or expired challenge" }`

**GET /api/auth/me**

Returns the current session state. Used by the login page to detect when a wallet has signed in.

Response: `{ "loggedIn": true, "pubkey": "...", "npub": "..." }`

**POST /api/auth/logout**

Destroys the session cookie and redirects to login.

---

### Profile

**POST /api/profile**

Saves or updates the authenticated user's profile. Uses upsert so repeated calls are safe.

Required body fields: name, core_vibe

Optional body fields: role, location, building, needs, vibe, lightning_addr, invite_code, interests (array), personality (object)

**GET /api/profile**

Returns the authenticated user's full profile with interests and personality parsed from JSON.

**GET /api/profile/me**

Returns a lightweight check: whether the user is logged in and whether they have a profile. Used to decide where to redirect after login.

---

### Matching

**POST /api/match**

Runs AI matching for the current user. Reads their profile and all profiles with the same invite code. Sends to GPT-4o-mini. Returns top 3 matches with scores and rationale. Saves to the matches table.

Returns an empty array with a message if the user has no invite code set.

**GET /api/match**

Returns all existing matches for the current user, joined with profile data for each matched person.

**GET /api/match/[id]**

Returns a single match with full profile data for the matched person and current escrow status for both parties.

---

### Escrow

**POST /api/escrow**

Creates a LNbits hold invoice for a match. Returns a Lightning payment request for the user to pay.

Request body: `{ "match_id": 1 }`

Success response:

```json
{
  "success": true,
  "payment_request": "lnbc21000n1...",
  "payment_hash": "abc123...",
  "amount_sats": 2100
}
```

**GET /api/escrow?match_id=1**

Returns escrow records for both parties on a match and whether both have paid.

**POST /api/escrow/webhook**

Called by LNbits when a hold invoice is paid. Marks that party's escrow as held. If both parties have paid, sets match status to both_locked.

**POST /api/escrow/confirm**

Confirms or disputes a meeting after it happens.

Request body: `{ "match_id": 1, "action": "confirm" }` or `{ "match_id": 1, "action": "dispute" }`

Confirm cancels both hold invoices and refunds both parties. Dispute freezes funds for manual review.

---

### Transcription

**POST /api/transcribe**

Accepts multipart form data with an audio recording. Sends to OpenAI Whisper for transcription then to GPT-4o-mini for summarisation. Saves the review to the database if a valid match_id is provided.

Form fields: audio (file, webm format), match_id (string, optional)

Response:

```json
{
  "success": true,
  "transcript": "Full text of the meeting...",
  "summary_en": "Two to three sentence summary in English",
  "summary_sw": "Muhtasari kwa Kiswahili",
  "key_points": ["Point one", "Point two"],
  "next_steps": ["Action one", "Action two"],
  "sentiment": "positive"
}
```

---

## Troubleshooting

**Login not working with Alby extension**

Generate a Master Key in Alby settings. LNURL-auth requires a local signing key and will fail with a managed Alby account until this is done.

**Find My Matches returns nothing**

You need at least one other profile in the system with the same conference code. Check your profile has a conference code set and that another user has used the same code.

**Lock Sats returns an error**

Confirm your LNbits environment variables are correct in the Render dashboard. The LNBITS_URL must not have a trailing slash. Verify your invoice key has permission to create invoices in LNbits.

**Whisper transcription times out**

Keep recordings under 90 seconds. The free Render plan has a 30 second function timeout for the summary step, though the Whisper call has a 60 second timeout set explicitly.

**Database errors after deploy**

Confirm the Render disk is mounted at `/data` with at least 1 GB allocated. The `RENDER` environment variable must be present and set automatically by Render for the database path to switch correctly.

---

## Roadmap

### v1.1 — Conference Rooms

Organizers create a conference with an invite code. Attendees join at registration via QR. AI matching is scoped to verified attendees only.

### v1.2 — Broader Auth

Email OTP via Resend for users without Lightning wallets. WalletConnect for EVM wallets. Nostr npub social login.

### v1.3 — Multi-chain Escrow

USDC on Base or Arbitrum via smart contract. Same user experience as Lightning escrow but accessible to non-Bitcoin users.

### v1.4 — Reputation

On-chain meeting confirmations. Nostr-verifiable reputation scores. No-show history visible to potential matches.

---

## Contributing

Built at the Bitcoin Unconference Nairobi hackathon. PRs welcome.

```bash
git checkout -b feature/your-feature
git commit -m "feat: your feature"
git push origin feature/your-feature
```

---

## License

MIT

---

Built with intent in Nairobi, Kenya.