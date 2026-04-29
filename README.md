# KYA Signal

Bitcoin-anchored cross-chain agent reputation. Portable. Permissionless. Verified.

## What it does

KYA Signal is a portable reputation layer for autonomous agents. It indexes agent behavior across Solana and Ethereum, normalizes it into a 0–100 score using a versioned, hash-committed config, and settles that score on Bitcoin via Stacks. Any protocol queries any agent — no whitelist, no partnership required.

The Mezo integration gates MUSD borrowing LTV directly from the on-chain score:

| Score | Status | LTV |
|-------|--------|-----|
| 0–84 | Base | 60% |
| 85–94 | KYA Verified | 80% |
| 95–100 | KYA Premium | 90% |

## Architecture

Two Clarity contracts on Stacks: `kya-score` handles score storage, dispute flags, and Bitcoin anchoring. `mezo-lender-query` handles LTV gating with rate limiting, synced from `kya-score`.

The backend has chain listeners for Solana (vault rebalances, liquidations) and Ethereum (Aave supply/liquidation events), a versioned normalization engine with config hashing, a Stacks oracle that submits scores on-chain, a Redis TTL cache (scores 60s, LTV responses 30s), a Fastify REST API, and Zepto Mail alert templates.

The frontend has a landing page, agent registration flow, live score dashboard with chain breakdown, full audit trail with hash verification, dispute management, public read-only agent scorecard, and normalization config version history.

## Setup

Requires Node.js 20+, PostgreSQL (or [Neon](https://neon.tech)), and Redis (or [Upstash](https://upstash.com)).

```bash
git clone https://github.com/Zeegaths/KYA-Signal

# Backend
cd kya-signal/backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx tsx src/seed.ts
npm run dev

# Frontend (separate terminal)
cd kya-signal/frontend
npm install
cp .env.example .env.local
npm run dev
```

For Clarity contracts, install [Clarinet](https://github.com/hirosystems/clarinet), run `clarinet check` inside `contracts/`, then `clarinet deployments apply --testnet`. Copy the deployed address into `backend/.env` as `KYA_CONTRACT_ADDRESS`.

## API

`POST /agents/register` — registers an agent, returns a deterministic GEID derived as `sha256(sourceChainKey:stacksKey)`.

`GET /agents/:geid/score` — returns `normalizedScore`, `verified`, `premium`, `suggestedLtv`, `btcBlockHeight`, `configHash`, `rawInputsHash`. Cached 60s.

`POST /protocol/query` — rate-limited to 20 queries per BTC block per protocol. Returns `{ verified: bool, suggestedLtv: uint }`.

`GET /agents/:geid/audit` — paginated event history with `configHash` and `rawInputsHash` per event.

`POST /disputes` — flags a score event. `GET /disputes/:geid` — returns dispute history with status and resolution.

`GET /configs` and `GET /configs/:version` — all normalization config versions with their hashes.

## Verifying a score

Every score stores two hashes on-chain: `config_hash` proves which normalization weights produced the score, `raw_inputs_hash` proves which chain events were fed in. To verify, get the `configHash` from the audit trail, match it to a version at `GET /configs`, and re-run `sha256(JSON.stringify(weights))` yourself. The same hash is on the Stacks contract — no need to trust this API.

## Design decisions

- **GEID = sha256(sourceChainKey:stacksKey)** — deterministic, no DB lookup needed to verify identity
- **Versioned normalization configs** — changing weights never invalidates old scores; each score is permanently attributable to the config that produced it
- **raw_inputs_hash on-chain** — proves what data produced a score, not just that a score was submitted
- **Rate limiting (20/BTC block)** — prevents fishing attacks on the protocol query endpoint
- **Dispute mechanism** — agents flag inaccurate events on-chain; status flows OPEN → RESOLVED via contract owner

## Services

| Service | Purpose |
|---------|---------|
| Stacks / Hiro | Bitcoin settlement, Clarity contracts |
| Mezo | MUSD LTV integration |
| Helius / QuickNode | Solana RPC |
| Alchemy | Ethereum RPC |
| Neon | Hosted Postgres |
| Upstash | Hosted Redis |
| Zepto Mail | Email alerts |
| Vercel | Frontend deployment |