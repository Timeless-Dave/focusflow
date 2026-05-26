import { withAuth, ok, err } from '@lib/api';

/** POST — approve lesson and create a live session */
export const POST = withAuth(async (_req, { supabase, user, params }) => {
  const { id } = await params;

  const { data: lesson, error: fetchErr } = await supabase
    .from('lessons')
    .select('id, status, live_content')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (fetchErr) return err('Lesson not found', 404);
  if (!lesson.live_content) return err('Generate the lesson preview first', 400);
  if (!['preview', 'approved'].includes(lesson.status)) {
    return err('Lesson must be in preview or approved state to start live mode', 400);
  }

  // Mark lesson as live
  await supabase
    .from('lessons')
    .update({ status: 'live', updated_at: new Date().toISOString() })
    .eq('id', id);

  // Create session
  const { data: session, error: sessionErr } = await supabase
    .from('lesson_sessions')
    .insert({
      lesson_id:  id,
      teacher_id: user.id,
      status:     'active',
      current_slide_index: 0
    })
    .select()
    .single();

  if (sessionErr) return err(sessionErr.message, 500);
  return ok({ session, lesson }, 201);
});
