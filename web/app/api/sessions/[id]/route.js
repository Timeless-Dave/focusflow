import { withAuth, ok, err } from '@lib/api';
import { z } from 'zod';

const UpdateSchema = z.object({
  current_slide_index: z.number().int().min(0).optional(),
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional()
});

export const GET = withAuth(async (_req, { supabase, user, params }) => {
  const { id } = await params;
  const { data, error } = await supabase
    .from('lesson_sessions')
    .select(`
      *,
      lessons ( id, title, subject, grade_level, topic, live_content )
    `)
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (error) return err(error.code === 'PGRST116' ? 'Session not found' : error.message, error.code === 'PGRST116' ? 404 : 500);
  return ok(data);
});

export const PATCH = withAuth(async (req, { supabase, user, params }) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  const update = { ...parsed.data };
  if (parsed.data.status === 'completed') {
    update.ended_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('lesson_sessions')
    .update(update)
    .eq('id', id)
    .eq('teacher_id', user.id)
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(data);
});
