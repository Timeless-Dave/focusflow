import { NextResponse } from 'next/server';
import { getOpenAI } from '@lib/openai';

const SYSTEM_PROMPT = `You are the FocusFlow Guide — a friendly, concise assistant on the FocusFlow website.

FocusFlow is an AI-powered platform for teachers and homeschool parents supporting students with ADHD.

Key features you can describe:
- AI Lesson Studio: Generate ADHD-tailored lesson plans with GPT-4o in ~20 seconds
- Live Mode: Present lessons with built-in ADHD recovery tools and slide navigation
- Focus Bot: The full AI teaching coach (available after signing up)
- Family Hub: AI-generated parent messages with practical action steps
- ADHD Training: Evidence-based professional development modules
- Student Profiles: Track interests, ADHD types, rewards and progress

Navigation you can help with:
- /how-it-works — See how FocusFlow works
- /features — Explore all features
- /training — ADHD training modules
- /homeschool — Homeschool support
- /onboarding — Register (free)
- /login — Sign in

Rules:
- Be warm, brief, and helpful (max 3 sentences per reply unless asked for more)
- If they ask to sign up or try it, direct them to /onboarding
- If they ask about pricing, say free tier is available with premium plans coming
- Never make up features that don't exist
- If they ask something you can't answer, say so and suggest they sign up to try Focus Bot`;

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json();
    if (!message?.trim()) return NextResponse.json({ error: 'No message' }, { status: 400 });

    const openai = getOpenAI();

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 200,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "I'm not sure about that — try signing up to access Focus Bot for full ADHD teaching support!";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "I ran into a hiccup. For full support, sign up and try Focus Bot!" });
  }
}
