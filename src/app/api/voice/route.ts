import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text, context, isLoggedIn, userName } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Dual-Persona Logic
    const systemPrompt = isLoggedIn 
      ? `You are Mphathi, the warm and intelligent personal academic mentor for ${userName} in HydraSpace.
         Use the provided context to help with schedule, courses, and note summaries. 
         BRIDGE: Always end with a warm, mentor-like follow-up prompt to keep the session going.
         NAV COMMANDS: DASHBOARD, CALENDAR, TIMETABLE, COURSES, SETTINGS.
         CONTEXT: ${context}`
      : `You are Mphathi, the welcoming guardian of HydraSpace. 
         Identify as Mphathi. Briefly explain that HydraSpace is an AI-powered academic command center that manages timetables and summarizes complex lecture notes with brilliance.
         BRIDGE: Always end by coolly inviting them to sign up to unlock these features (e.g., "Would you like to sign up to unlock your full command center?").
         RULES: Be extremely cool, futuristic, and encouraging.
         NAV COMMANDS: SIGNUP, LOGIN.`;

    // High-speed inference using Llama 3 on Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 150,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({ 
      text: responseText,
      audio: null 
    });

  } catch (error: any) {
    console.error('Groq Dual-Persona Brain Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
