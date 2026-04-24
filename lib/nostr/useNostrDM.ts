// lib/nostr/useNostrDM.ts
// Wire this up to replace mock messages in dm-page.tsx
//
// Install: npm install @nostr-dev-kit/ndk

import { useState, useEffect, useCallback } from "react";

interface Message {
  id: string;
  content: string;
  pubkey: string;
  created_at: number;
  pending?: boolean;
}

interface UseNostrDMOptions {
  recipientPubkey: string;  // npub or hex pubkey of the match
  relays?: string[];
}

const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
];

export function useNostrDM({ recipientPubkey, relays = DEFAULT_RELAYS }: UseNostrDMOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [ndk, setNdk] = useState<any>(null);
  const [myPubkey, setMyPubkey] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Dynamic import so it doesn't break SSR
        const { default: NDK, NDKPrivateKeySigner } = await import("@nostr-dev-kit/ndk");

        // Get session key from localStorage (set during LNURL-auth)
        const sessionKey = localStorage.getItem("matchsats_nsec");
        if (!sessionKey) throw new Error("No session key");

        const signer = new NDKPrivateKeySigner(sessionKey);
        const ndkInstance = new NDK({ explicitRelayUrls: relays, signer });

        await ndkInstance.connect();

        const user = await signer.user();
        if (mounted) {
          setMyPubkey(user.pubkey);
          setNdk(ndkInstance);
          setStatus("connected");
        }

        // Subscribe to DM history + live messages
        const filter = {
          kinds: [4], // NIP-04 encrypted DMs
          "#p": [user.pubkey],
          authors: [recipientPubkey],
          limit: 50,
        };

        const sub = ndkInstance.subscribe(filter, { closeOnEose: false });

        sub.on("event", async (event: any) => {
          try {
            // Decrypt the message content
            const decrypted = await signer.decrypt(
              { pubkey: recipientPubkey } as any,
              event.content
            );

            const msg: Message = {
              id: event.id,
              content: decrypted,
              pubkey: event.pubkey === user.pubkey ? "me" : "them",
              created_at: event.created_at * 1000,
            };

            if (mounted) {
              setMessages(prev => {
                // Deduplicate
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg].sort((a, b) => a.created_at - b.created_at);
              });
            }
          } catch (err) {
            console.error("Failed to decrypt message:", err);
          }
        });

      } catch (err) {
        console.error("NDK init error:", err);
        if (mounted) setStatus("error");
      }
    }

    init();
    return () => { mounted = false; };
  }, [recipientPubkey]);

  const sendMessage = useCallback(async (content: string) => {
    if (!ndk || !content.trim()) return;

    const pendingId = Date.now().toString();
    const pending: Message = {
      id: pendingId,
      content,
      pubkey: "me",
      created_at: Date.now(),
      pending: true,
    };

    setMessages(prev => [...prev, pending]);

    try {
      const { NDKEvent } = await import("@nostr-dev-kit/ndk");
      const event = new NDKEvent(ndk);
      event.kind = 4;

      // Encrypt content for recipient
      event.content = await ndk.signer!.encrypt(
        { pubkey: recipientPubkey } as any,
        content
      );
      event.tags = [["p", recipientPubkey]];

      await event.publish();

      // Mark as sent
      setMessages(prev =>
        prev.map(m => m.id === pendingId ? { ...m, pending: false, id: event.id ?? pendingId } : m)
      );
    } catch (err) {
      console.error("Failed to send:", err);
      // Mark as failed
      setMessages(prev =>
        prev.map(m => m.id === pendingId ? { ...m, pending: false, failed: true } : m)
      );
    }
  }, [ndk, recipientPubkey]);

  return { messages, status, sendMessage, myPubkey };
}