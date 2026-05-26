import { withAuth, ok, err } from '@lib/api';
import { z } from 'zod';

const CreateSchema = z.object({
  title:            z.string().min(1).max(200),
  subject:          z.string().min(1).max(100),
  grade_level:      z.string().min(1).max(50),
  topic:            z.string().min(1).max(300),
  duration_minutes: z.number().int().min(10).max(180).default(45),
  student_interests: z.array(z.string()).default([]),
  learning_styles:  z.array(z.string()).default([]),
  adhd_types:       z.array(z.string()).default([]),
  pdf_url:          z.string().url().optional()
});

export const GET = withAuth(async (req, { supabase, user }) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  let query = supabase
    .from('lessons')
    .select('id, title, subject, grade_level, topic, status, duration_minutes, created_at, updated_at', { count: 'exact' })
    .eq('teacher_id', user.id)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) return err(error.message, 500);
  return ok({ lessons: data, total: count });
});

export const POST = withAuth(async (req, { supabase, user }) => {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  const { data, error } = await supabase
    .from('lessons')
    .insert({ ...parsed.data, teacher_id: user.id, status: 'draft' })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(data, 201);
});
