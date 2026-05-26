import { withAuth, ok, err } from '@lib/api';
import { z } from 'zod';

const UpdateSchema = z.object({
  full_name:    z.string().min(1).max(120).optional(),
  display_name: z.string().max(80).optional().nullable(),
  school_name:  z.string().max(200).optional(),
  grade_levels: z.array(z.string()).optional(),
  avatar_url:   z.string().url().optional(),
  onboarding_completed: z.boolean().optional(),
  role: z.enum(['teacher', 'homeschool']).optional()
});

export const GET = withAuth(async (_req, { supabase, user }) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return err(error.message, 500);
  return ok(data);
});

export const PATCH = withAuth(async (req, { supabase, user }) => {
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(data);
});
