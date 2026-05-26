import { withAuth, ok, err } from '@lib/api';

export const GET = withAuth(async (_req, { supabase, user, params }) => {
  const { id } = await params;

  const [{ data: module, error: modErr }, { data: progress }] = await Promise.all([
    supabase
      .from('training_modules')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single(),
    supabase
      .from('teacher_training_progress')
      .select('completed, completed_at, reward_points')
      .eq('module_id', id)
      .eq('teacher_id', user.id)
      .maybeSingle()
  ]);

  if (modErr) return err(modErr.code === 'PGRST116' ? 'Module not found' : modErr.message, modErr.code === 'PGRST116' ? 404 : 500);
  return ok({ module, progress: progress ?? null });
});
