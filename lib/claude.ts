import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface Profile {
  id:       string
  name:     string
  building: string
  need:     string
  offer:    string
}

interface Match {
  profile_id: string
  score:      number
  reason:     string
}

export async function runMatching(
  myProfile: Profile,
  allProfiles: Profile[]
): Promise<Match[]> {
  const prompt = `
You are matching conference attendees who want to meet each other.

My profile:
${JSON.stringify(myProfile, null, 2)}

All other attendees:
${JSON.stringify(allProfiles, null, 2)}

Return ONLY a JSON array of the top 3 matches. Each item:
- profile_id (string)
- score (integer 1-10)  
- reason (one sentence, max 20 words, specific — reference actual details from both profiles)

Raw JSON array only. No markdown. No preamble.
`

  const msg = await client.messages.create({
    model:      "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages:   [{ role: "user", content: prompt }],
  })

  const text = msg.content[0].type === "text" ? msg.content[0].text : "[]"
  return JSON.parse(text)
}
