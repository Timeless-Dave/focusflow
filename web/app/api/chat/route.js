import { withAuth, err } from '@lib/api';
import { getOpenAI } from '@lib/openai';
import { buildBotSystemPrompt } from '@lib/prompts/bot';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const MessageSchema = z.object({
  session_id:   z.string().uuid().nullish(),
  context_type: z.enum(['general','lesson_planning','student_support','parent_message','daily_plan','recovery']).default('general'),
  context_id:   z.string().uuid().optional(),
  message:      z.string().min(1).max(4000),
  stream:       z.boolean().default(false)
});

/**
 * POST /api/chat
 * Sends a message to Focus bot. Persists the conversation in chat_sessions.
 * Supports streaming (stream: true) for real-time typewriter output.
 */
export const POST = withAuth(async (req, { supabase, user }) => {
  const body = await req.json();
  const parsed = MessageSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  // Fetch teacher profile for personalisation
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  // Load or create chat session
  let session;
  if (parsed.data.session_id) {
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', parsed.data.session_id)
      .eq('teacher_id', user.id)
      .single();
    session = data;
  }

  // Fetch context data if context_id provided
  let contextData = null;
  if (parsed.data.context_id && parsed.data.context_type !== 'general') {
    const tableMap = {
      lesson_planning: 'lessons',
      student_support: 'students',
      daily_plan:      'students'
    };
    const table = tableMap[parsed.data.context_type];
    if (table) {
      const { data } = await supabase
        .from(table)
        .select('*')
        .eq('id', parsed.data.context_id)
        .single();
      contextData = data;
    }
  }

  const systemPrompt = buildBotSystemPrompt({
    contextType: parsed.data.context_type,
    contextData,
    teacherName: profile?.full_name?.split(' ')[0],
    role:        profile?.role
  });

  const previousMessages = (session?.messages ?? []).map(m => ({
    role:    m.role,
    content: m.content
  }));

  const newUserMessage = { role: 'user', content: parsed.data.message };
  const allMessages    = [
    { role: 'system', content: systemPrompt },
    ...previousMessages,
    newUserMessage
  ];

  const openai = getOpenAI();

  if (parsed.data.stream) {
    // Streaming response
    const stream = openai.chat.completions.stream({
      model:       'gpt-4o',
      temperature: 0.7,
      max_tokens:  600,
      messages:    allMessages
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent = '';
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          fullContent += delta;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();

        // Persist after stream completes
        const now = new Date().toISOString();
        const updatedMessages = [
          ...(session?.messages ?? []),
          { ...newUserMessage, ts: now },
          { role: 'assistant', content: fullContent, ts: now }
        ];
        await persistSession(supabase, user.id, session, parsed.data, updatedMessages);
      }
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive'
      }
    });
  }

  // Non-streaming
  let assistantContent;
  try {
    const response = await openai.chat.completions.create({
      model:       'gpt-4o',
      temperature: 0.7,
      max_tokens:  600,
      messages:    allMessages
    });
    assistantContent = response.choices[0].message.content;
  } catch (aiErr) {
    console.error('[chat] OpenAI error:', aiErr);
    return err('Focus is unavailable right now. Please try again.', 502);
  }

  const now = new Date().toISOString();
  const updatedMessages = [
    ...(session?.messages ?? []),
    { ...newUserMessage, ts: now },
    { role: 'assistant', content: assistantContent, ts: now }
  ];

  session = await persistSession(supabase, user.id, session, parsed.data, updatedMessages);

  return NextResponse.json({
    reply:      assistantContent,
    session_id: session?.id,
    messages:   updatedMessages.slice(-10) // last 10 for client state
  });
});

async function persistSession(supabase, userId, existingSession, parsed, messages) {
  if (existingSession) {
    const { data } = await supabase
      .from('chat_sessions')
      .update({ messages, updated_at: new Date().toISOString() })
      .eq('id', existingSession.id)
      .select('id')
      .single();
    return data;
  }

  // Auto-title from first user message
  const title = parsed.message.slice(0, 60) + (parsed.message.length > 60 ? '…' : '');
  const { data } = await supabase
    .from('chat_sessions')
    .insert({
      teacher_id:   userId,
      context_type: parsed.context_type,
      context_id:   parsed.context_id,
      title,
      messages
    })
    .select('id')
    .single();
  return data;
}
