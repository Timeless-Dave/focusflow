import { withAuth, ok, err } from '@lib/api';
import { getOpenAI } from '@lib/openai';
import { buildParentMessagePrompt } from '@lib/prompts/parent';
import { z } from 'zod';

const CreateSchema = z.object({
  student_id:       z.string().uuid(),
  message_type:     z.enum(['daily_update','behavior','progress','homework','general']).default('daily_update'),
  subject:          z.string().max(200).optional(),
  raw_content:      z.string().min(5).max(2000),
  completed_count:  z.number().int().min(0).optional(),
  total_count:      z.number().int().min(0).optional(),
  send_email:       z.boolean().default(false)
});

export const GET = withAuth(async (req, { supabase, user }) => {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const limit     = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
  const offset    = parseInt(searchParams.get('offset') ?? '0', 10);

  let query = supabase
    .from('parent_messages')
    .select(`
      id, student_id, message_type, subject, content, practical_steps,
      email_sent, sent_at,
      students ( first_name, last_name )
    `, { count: 'exact' })
    .eq('teacher_id', user.id)
    .order('sent_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (studentId) query = query.eq('student_id', studentId);

  const { data, error, count } = await query;
  if (error) return err(error.message, 500);
  return ok({ messages: data, total: count });
});

export const POST = withAuth(async (req, { supabase, user }) => {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  // Verify the student belongs to this teacher
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id, first_name, last_name, parent_email, parent_name')
    .eq('id', parsed.data.student_id)
    .eq('teacher_id', user.id)
    .single();

  if (studentErr || !student) return err('Student not found', 404);

  // AI-generate the structured parent message
  const { system, user: userPrompt } = buildParentMessagePrompt({
    studentName:    `${student.first_name} ${student.last_name}`,
    messageType:    parsed.data.message_type,
    rawContent:     parsed.data.raw_content,
    completedCount: parsed.data.completed_count,
    totalCount:     parsed.data.total_count,
    subject:        parsed.data.subject
  });

  let aiMessage;
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: userPrompt }
      ]
    });
    aiMessage = JSON.parse(response.choices[0].message.content);
  } catch (aiErr) {
    console.error('[parent/messages] OpenAI error:', aiErr);
    return err('Message generation failed. Please try again.', 502);
  }

  const { data: message, error: insertErr } = await supabase
    .from('parent_messages')
    .insert({
      teacher_id:     user.id,
      student_id:     parsed.data.student_id,
      message_type:   parsed.data.message_type,
      subject:        aiMessage.subject_line,
      content:        aiMessage.full_message,
      practical_steps: aiMessage.practical_steps ?? [],
      email_sent:     false
    })
    .select()
    .single();

  if (insertErr) return err(insertErr.message, 500);

  return ok({
    message,
    ai_output: aiMessage,
    parent_email: student.parent_email
  }, 201);
});
