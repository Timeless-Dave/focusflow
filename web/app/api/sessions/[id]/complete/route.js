import { withAuth, ok, err } from '@lib/api';
import { getOpenAI } from '@lib/openai';

/** POST — end a live session and generate an AI after-class summary */
export const POST = withAuth(async (req, { supabase, user, params }) => {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const { data: session, error: fetchErr } = await supabase
    .from('lesson_sessions')
    .select(`
      *,
      lessons ( title, subject, topic, grade_level, duration_minutes )
    `)
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (fetchErr) return err('Session not found', 404);
  if (session.status === 'completed') return err('Session already completed', 400);

  // Mark session complete
  await supabase
    .from('lesson_sessions')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', id);

  // Also mark lesson as completed
  await supabase
    .from('lessons')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', session.lesson_id);

  // Build summary context
  const disruptionCount = (session.disruptions ?? []).length;
  const recoveryCount   = (session.recovery_actions ?? []).length;
  const studentResponses = body.student_responses ?? [];

  const summaryPrompt = `You are FocusFlow's After-Class Summary engine. Produce a concise, teacher-friendly summary of this lesson session.

Lesson: ${session.lessons?.title} (${session.lessons?.subject}, ${session.lessons?.grade_level})
Topic: ${session.lessons?.topic}
Duration: ${session.lessons?.duration_minutes} min
Disruptions detected: ${disruptionCount}
Recovery strategies used: ${recoveryCount}
Student self-assessments (understood/completed): ${JSON.stringify(studentResponses)}

Return JSON:
{
  "ai_summary": string (2-3 sentences, warm and practical tone),
  "highlights": string[],
  "areas_needing_attention": string[],
  "next_steps": string[],
  "parent_message_draft": string
}`;

  let summaryData;
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: summaryPrompt }]
    });
    summaryData = JSON.parse(response.choices[0].message.content);
  } catch {
    summaryData = {
      ai_summary: 'Session completed. Summary generation unavailable — please check your API key.',
      highlights: [],
      areas_needing_attention: [],
      next_steps: [],
      parent_message_draft: ''
    };
  }

  const understoodCount = studentResponses.filter(r => r.understood).length;
  const completedCount  = studentResponses.filter(r => r.completed_all).length;

  const { data: summary, error: summaryErr } = await supabase
    .from('class_summaries')
    .insert({
      lesson_session_id:      id,
      teacher_id:             user.id,
      ai_summary:             summaryData.ai_summary,
      student_responses:      studentResponses,
      completed_tasks_count:  completedCount,
      total_tasks_count:      studentResponses.length,
      areas_needing_attention: summaryData.areas_needing_attention ?? [],
      next_steps:             summaryData.next_steps ?? []
    })
    .select()
    .single();

  if (summaryErr) return err(summaryErr.message, 500);

  return ok({
    summary,
    highlights:             summaryData.highlights,
    parent_message_draft:   summaryData.parent_message_draft,
    stats: {
      disruption_count:    disruptionCount,
      understood_count:    understoodCount,
      total_students:      studentResponses.length
    }
  });
});
