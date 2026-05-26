import { withAuth, ok, err } from '@lib/api';
import { z } from 'zod';

const UpdateSchema = z.object({
  first_name:            z.string().min(1).max(80).optional(),
  last_name:             z.string().min(1).max(80).optional(),
  grade_level:           z.string().max(20).optional(),
  adhd_type:             z.enum(['inattentive','hyperactive','combined','unspecified']).optional(),
  attention_span_minutes: z.number().int().min(1).max(60).optional(),
  learning_style:        z.enum(['visual','auditory','kinesthetic','reading','mixed']).optional(),
  interests:             z.array(z.string().max(50)).optional(),
  parent_email:          z.string().email().optional(),
  parent_name:           z.string().max(120).optional(),
  parent_phone:          z.string().max(30).optional(),
  notes:                 z.string().max(2000).optional(),
  is_active:             z.boolean().optional()
});

export const GET = withAuth(async (_req, { supabase, user, params }) => {
  const { id } = await params;

  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      student_rewards ( * ),
      student_progress ( assessment_date, subject, understanding_score, engagement_score, task_completion_rate )
    `)
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (error) return err(error.code === 'PGRST116' ? 'Student not found' : error.message, error.code === 'PGRST116' ? 404 : 500);
  return ok(data);
});

export const PATCH = withAuth(async (req, { supabase, user, params }) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  const { data, error } = await supabase
    .from('students')
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

  // Soft delete — set is_active = false
  const { error } = await supabase
    .from('students')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('teacher_id', user.id);

  if (error) return err(error.message, 500);
  return ok({ deactivated: true });
});
