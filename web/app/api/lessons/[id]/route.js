import { withAuth, ok, err } from '@lib/api';
import { z } from 'zod';

const UpdateSchema = z.object({
  title:            z.string().min(1).max(200).optional(),
  subject:          z.string().optional(),
  grade_level:      z.string().optional(),
  topic:            z.string().optional(),
  duration_minutes: z.number().int().min(10).max(180).optional(),
  status:           z.enum(['draft','preview','approved','live','completed','archived']).optional(),
  preview_content:  z.any().optional(),
  live_content:     z.any().optional(),
  student_interests: z.array(z.string()).optional(),
  learning_styles:  z.array(z.string()).optional(),
  adhd_types:       z.array(z.string()).optional(),
  pdf_url:          z.string().url().optional()
});

export const GET = withAuth(async (_req, { supabase, user, params }) => {
  const { id } = await params;
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (error) return err(error.code === 'PGRST116' ? 'Lesson not found' : error.message, error.code === 'PGRST116' ? 404 : 500);
  return ok(data);
});

export const PATCH = withAuth(async (req, { supabase, user, params }) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  const { data, error } = await supabase
    .from('lessons')
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
    .from('lessons')
    .delete()
    .eq('id', id)
    .eq('teacher_id', user.id);

  if (error) return err(error.message, 500);
  return ok({ deleted: true });
});
