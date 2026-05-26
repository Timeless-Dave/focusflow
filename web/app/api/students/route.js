import { withAuth, ok, err } from '@lib/api';
import { z } from 'zod';

const CreateSchema = z.object({
  first_name:            z.string().min(1).max(80),
  last_name:             z.string().min(1).max(80),
  grade_level:           z.string().max(20).optional(),
  adhd_type:             z.enum(['inattentive','hyperactive','combined','unspecified']).optional(),
  attention_span_minutes: z.number().int().min(1).max(60).default(15),
  learning_style:        z.enum(['visual','auditory','kinesthetic','reading','mixed']).optional(),
  interests:             z.array(z.string().max(50)).default([]),
  parent_email:          z.string().email().optional(),
  parent_name:           z.string().max(120).optional(),
  parent_phone:          z.string().max(30).optional(),
  notes:                 z.string().max(2000).optional()
});

export const GET = withAuth(async (req, { supabase, user }) => {
  const { searchParams } = new URL(req.url);
  const active = searchParams.get('active');
  const search = searchParams.get('q');

  let query = supabase
    .from('students')
    .select(`
      *,
      student_rewards ( total_points, badges, streak_days )
    `)
    .eq('teacher_id', user.id)
    .order('first_name', { ascending: true });

  if (active !== null) query = query.eq('is_active', active !== 'false');
  if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ students: data });
});

export const POST = withAuth(async (req, { supabase, user }) => {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  const { data, error } = await supabase
    .from('students')
    .insert({ ...parsed.data, teacher_id: user.id })
    .select(`*, student_rewards ( total_points, badges )`)
    .single();

  if (error) return err(error.message, 500);
  return ok(data, 201);
});
