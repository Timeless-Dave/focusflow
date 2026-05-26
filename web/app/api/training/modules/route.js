import { withAuth, ok, err } from '@lib/api';

export const GET = withAuth(async (req, { supabase }) => {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  let query = supabase
    .from('training_modules')
    .select('id, title, description, category, duration_minutes, order_index, reward_points')
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ modules: data });
});
