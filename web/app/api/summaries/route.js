import { withAuth, ok, err } from '@lib/api';
import { z } from 'zod';

const CreateSchema = z.object({
  lesson_session_id: z.string().uuid().optional(),
  summary_date:      z.string().optional(),
  student_responses: z.array(z.object({
    student_id:    z.string().uuid(),
    understood:    z.boolean(),
    completed_all: z.boolean()
  })).default([])
});

/** GET — list summaries for the teacher */
export const GET = withAuth(async (req, { supabase, user }) => {
  const { searchParams } = new URL(req.url);
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  const { data, error, count } = await supabase
    .from('class_summaries')
    .select(`
      id, summary_date, ai_summary, completed_tasks_count, total_tasks_count,
      areas_needing_attention, next_steps, created_at,
      lesson_sessions ( lessons ( title, subject ) )
    `, { count: 'exact' })
    .eq('teacher_id', user.id)
    .order('summary_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return err(error.message, 500);
  return ok({ summaries: data, total: count });
});

/** POST — create a standalone summary (without completing a session) */
export const POST = withAuth(async (req, { supabase, user }) => {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  const completedCount = parsed.data.student_responses.filter(r => r.completed_all).length;
  const totalCount     = parsed.data.student_responses.length;

  const { data, error } = await supabase
    .from('class_summaries')
    .insert({
      teacher_id:             user.id,
      lesson_session_id:      parsed.data.lesson_session_id,
      summary_date:           parsed.data.summary_date ?? new Date().toISOString().split('T')[0],
      student_responses:      parsed.data.student_responses,
      completed_tasks_count:  completedCount,
      total_tasks_count:      totalCount
    })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(data, 201);
});
