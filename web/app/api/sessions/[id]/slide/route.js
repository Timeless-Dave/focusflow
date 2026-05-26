import { withAuth, ok, err } from '@lib/api';
import { z } from 'zod';

const SlideSchema = z.object({
  direction: z.enum(['next', 'prev', 'jump']),
  index: z.number().int().min(0).optional()
});

/** POST — advance, retreat, or jump to a specific slide */
export const POST = withAuth(async (req, { supabase, user, params }) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = SlideSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  const { data: session, error: fetchErr } = await supabase
    .from('lesson_sessions')
    .select('current_slide_index, lessons(live_content)')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (fetchErr) return err('Session not found', 404);
  if (session.status === 'completed') return err('Session is already completed', 400);

  const slides = session.lessons?.live_content?.slides ?? [];
  const maxIdx = Math.max(slides.length - 1, 0);

  let newIndex = session.current_slide_index;
  if (parsed.data.direction === 'next') newIndex = Math.min(newIndex + 1, maxIdx);
  if (parsed.data.direction === 'prev') newIndex = Math.max(newIndex - 1, 0);
  if (parsed.data.direction === 'jump') newIndex = Math.min(parsed.data.index ?? 0, maxIdx);

  const { data, error } = await supabase
    .from('lesson_sessions')
    .update({ current_slide_index: newIndex })
    .eq('id', id)
    .eq('teacher_id', user.id)
    .select('current_slide_index')
    .single();

  if (error) return err(error.message, 500);
  return ok({ current_slide_index: data.current_slide_index, slide: slides[data.current_slide_index] ?? null });
});
