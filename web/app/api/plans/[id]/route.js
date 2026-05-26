import { withAuth, ok, err } from '@lib/api';
import { z } from 'zod';

const UpdateSchema = z.object({
  title:      z.string().min(1).max(200).optional(),
  plan_date:  z.string().optional(),
  start_date: z.string().optional(),
  end_date:   z.string().optional(),
  tasks:      z.array(z.any()).optional()
});

export const GET = withAuth(async (_req, { supabase, user, params }) => {
  const { id } = await params;
  const { data, error } = await supabase
    .from('plans')
    .select(`*, students ( first_name, last_name )`)
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (error) return err(error.code === 'PGRST116' ? 'Plan not found' : error.message, error.code === 'PGRST116' ? 404 : 500);
  return ok(data);
});

export const PATCH = withAuth(async (req, { supabase, user, params }) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  const { data, error } = await supabase
    .from('plans')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('teacher_id', user.id)
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(data);
});

export const DELETE = withAuth(async (_req, { supabase, user, params }) => {
  const { id } = await params;
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', id)
    .eq('teacher_id', user.id);

  if (error) return err(error.message, 500);
  return ok({ deleted: true });
});
