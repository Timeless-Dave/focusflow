import { withAuth, ok, err } from '@lib/api';

/** POST — mark a training module as completed and award points */
export const POST = withAuth(async (_req, { supabase, user, params }) => {
  const { id } = await params;

  const { data: module, error: modErr } = await supabase
    .from('training_modules')
    .select('id, reward_points')
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (modErr) return err('Module not found', 404);

  const { data, error } = await supabase
    .from('teacher_training_progress')
    .upsert(
      {
        teacher_id:    user.id,
        module_id:     id,
        completed:     true,
        completed_at:  new Date().toISOString(),
        reward_points: module.reward_points
      },
      { onConflict: 'teacher_id,module_id', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) return err(error.message, 500);

  // Calculate total completed modules and points for this teacher
  const { data: allProgress } = await supabase
    .from('teacher_training_progress')
    .select('reward_points')
    .eq('teacher_id', user.id)
    .eq('completed', true);

  const totalPoints = (allProgress ?? []).reduce((sum, p) => sum + (p.reward_points ?? 0), 0);

  return ok({ progress: data, total_points: totalPoints });
});
