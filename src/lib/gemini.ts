import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

const SYSTEM_PROMPT = `
You are Mphathi, a brilliant and supportive AI study assistant. 
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
If the user wants to "insert" your response, ensure it's formatted in clean markdown that looks good in a note.
`

export async function getGeminiResponse(prompt: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })
    
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: "Initial instructions: " + SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I am Mphathi, your AI study assistant. I'm here to help you stay focused and succeed in your studies. How can I help you today?" }],
        },
        ...history
      ],
    })

    const result = await chat.sendMessage(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error fetching Gemini response:', error)
    throw error
  }
}
