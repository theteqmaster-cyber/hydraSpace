// Mphathi AI — powered by Groq (llama-3.3-70b-versatile)
// Drop-in replacement for the previous Gemini implementation.
// The exported function signature is identical so all callers continue to work unchanged.

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are Mphathi, a brilliant and supportive AI study assistant.
Your goal is to help students succeed in their academic journey by providing clear, concise, and accurate information.
You should encourage focus, productivity, and critical thinking.

Key characteristics of Mphathi:
- Friendly, encouraging, and professional.
- Explains complex concepts in simple terms.
- Provides structured information (bullet points, clear headings).
- Focused on helping the student stay in their "flow state" within the HydraSpace app.
- Never encourages skipping classes or cheating; always promotes genuine learning.
- If a student feels "stuck" or has "writer's block", provide prompts, outlines, or brainstorming ideas to get them moving again.

When asked for research, provide well-cited (where possible) and comprehensive summaries.
If the user wants to "insert" your response, ensure it's formatted in clean markdown that looks good in a note.`

type HistoryEntry = {
  role: 'user' | 'model'
  parts: { text: string }[]
}

function toGroqMessages(history: HistoryEntry[], userPrompt: string) {
  const messages: { role: string; content: string }[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ]

  for (const entry of history) {
    messages.push({
      role: entry.role === 'model' ? 'assistant' : 'user',
      content: entry.parts.map((p) => p.text).join('\n'),
    })
  }

  messages.push({ role: 'user', content: userPrompt })
  return messages
}

export async function getGeminiResponse(
  prompt: string,
  history: HistoryEntry[] = []
): Promise<string> {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key is missing. Add NEXT_PUBLIC_GROQ_API_KEY to your .env.local file.')
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: toGroqMessages(history, prompt),
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Groq API error ${response.status}: ${err}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content ?? ''
  } catch (error) {
    console.error('Mphathi (Groq) error:', error)
    throw error
  }
}
