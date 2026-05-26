import { withAuth, ok, err } from '@lib/api';
import { z } from 'zod';

const TaskSchema = z.object({
  id:           z.string().default(() => crypto.randomUUID()),
  title:        z.string().min(1).max(200),
  time_block:   z.string().max(20).optional(),
  duration_min: z.number().int().min(1).max(240).default(15),
  subject:      z.string().max(100).optional(),
  completed:    z.boolean().default(false),
  order:        z.number().int().default(0)
});

const CreateSchema = z.object({
  title:      z.string().min(1).max(200),
  plan_type:  z.enum(['daily','weekly','semester']).default('daily'),
  student_id: z.string().uuid().optional(),
  plan_date:  z.string().optional(),
  start_date: z.string().optional(),
  end_date:   z.string().optional(),
  tasks:      z.array(TaskSchema).default([])
});

export const GET = withAuth(async (req, { supabase, user }) => {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const planType  = searchParams.get('plan_type');
  const date      = searchParams.get('date');

  let query = supabase
    .from('plans')
    .select(`*, students ( first_name, last_name )`)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  if (studentId) query = query.eq('student_id', studentId);
  if (planType)  query = query.eq('plan_type', planType);
  if (date)      query = query.eq('plan_date', date);

  const { data, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ plans: data });
});

export const POST = withAuth(async (req, { supabase, user }) => {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  const { data, error } = await supabase
    .from('plans')
    .insert({ ...parsed.data, teacher_id: user.id })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(data, 201);
});
