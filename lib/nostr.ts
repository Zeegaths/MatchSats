import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  SimplePool,
  type Event,
} from "nostr-tools"

const RELAY = process.env.NOSTR_RELAY || "wss://relay.damus.io"

export function generateKeypair() {
  const sk = generateSecretKey()
  const pk = getPublicKey(sk)
  return { sk: Buffer.from(sk).toString("hex"), pk }
}

export async function publishProfile(
  sk: Uint8Array,
  profile: Record<string, string>
): Promise<Event> {
  const event = finalizeEvent(
    {
      kind:       0,
      created_at: Math.floor(Date.now() / 1000),
      tags:       [],
      content:    JSON.stringify(profile),
    },
    sk
  )

  const pool = new SimplePool()
  await Promise.any(pool.publish([RELAY], event))
  return event
}

export async function fetchProfiles(pubkeys: string[]): Promise<Event[]> {
  const pool = new SimplePool()
  return pool.querySync([RELAY], {
    kinds:   [0],
    authors: pubkeys,
  })
}
