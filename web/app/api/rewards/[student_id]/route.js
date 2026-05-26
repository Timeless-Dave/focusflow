import { withAuth, ok, err } from '@lib/api';
import { z } from 'zod';

const BadgeSchema = z.object({
  id:        z.string(),
  name:      z.string(),
  icon:      z.string(),
  earned_at: z.string()
});

const AwardSchema = z.object({
  points: z.number().int().min(1).max(500).optional(),
  badge:  BadgeSchema.optional()
});

export const GET = withAuth(async (_req, { supabase, user, params }) => {
  const { student_id } = await params;

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('id', student_id)
    .eq('teacher_id', user.id)
    .single();

  if (!student) return err('Student not found', 404);

  const { data, error } = await supabase
    .from('student_rewards')
    .select('*')
    .eq('student_id', student_id)
    .single();

  if (error) return err(error.message, 500);
  return ok(data);
});

/** POST — manually award points or a badge */
export const POST = withAuth(async (req, { supabase, user, params }) => {
  const { student_id } = await params;
  const body = await req.json();
  const parsed = AwardSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('id', student_id)
    .eq('teacher_id', user.id)
    .single();

  if (!student) return err('Student not found', 404);

  const { data: current } = await supabase
    .from('student_rewards')
    .select('total_points, badges')
    .eq('student_id', student_id)
    .single();

  const newPoints  = (current?.total_points ?? 0) + (parsed.data.points ?? 0);
  const newBadges  = parsed.data.badge
    ? [...(current?.badges ?? []), parsed.data.badge]
    : (current?.badges ?? []);

  const { data, error } = await supabase
    .from('student_rewards')
    .update({
      total_points:   newPoints,
      badges:         newBadges,
      last_earned_at: new Date().toISOString(),
      updated_at:     new Date().toISOString()
    })
    .eq('student_id', student_id)
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(data);
});
