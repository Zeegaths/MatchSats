const BASE    = process.env.LNBITS_URL!
const API_KEY = process.env.LNBITS_API_KEY!

const headers = {
  "X-Api-Key":   API_KEY,
  "Content-Type": "application/json",
}

export async function createHoldInvoice(amountSats: number, memo: string) {
  const res = await fetch(`${BASE}/api/v1/payments`, {
    method:  "POST",
    headers,
    body: JSON.stringify({
      out:    false,
      amount: amountSats,
      memo,
      expiry: 3600,
    }),
  })
  if (!res.ok) throw new Error(`LNbits error: ${await res.text()}`)
  return res.json() as Promise<{
    payment_hash:    string
    payment_request: string
    preimage:        string
  }>
}

export async function checkInvoice(paymentHash: string): Promise<"pending" | "paid"> {
  const res = await fetch(`${BASE}/api/v1/payments/${paymentHash}`, { headers })
  if (!res.ok) throw new Error(`LNbits error: ${await res.text()}`)
  const data = await res.json()
  return data.paid ? "paid" : "pending"
}

export async function settleInvoice(preimage: string) {
  const res = await fetch(`${BASE}/holdrequest/v1/settle`, {
    method:  "POST",
    headers,
    body: JSON.stringify({ preimage }),
  })
  if (!res.ok) throw new Error(`Settle error: ${await res.text()}`)
  return res.json()
}

export async function cancelInvoice(paymentHash: string) {
  const res = await fetch(`${BASE}/holdrequest/v1/cancel`, {
    method:  "POST",
    headers,
    body: JSON.stringify({ payment_hash: paymentHash }),
  })
  if (!res.ok) throw new Error(`Cancel error: ${await res.text()}`)
  return res.json()
}
