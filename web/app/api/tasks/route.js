import { withAuth, ok, err } from '@lib/api';
import { z } from 'zod';

const CreateSchema = z.object({
  student_id:        z.string().uuid(),
  plan_id:           z.string().uuid().optional(),
  lesson_session_id: z.string().uuid().optional(),
  task_title:        z.string().min(1).max(200),
  reward_points:     z.number().int().min(0).max(100).default(10),
  date:              z.string().optional()
});

const CompleteSchema = z.object({
  task_id:    z.string().uuid(),
  completed:  z.boolean()
});

/** GET — list task completions for a student on a given date */
export const GET = withAuth(async (req, { supabase, user }) => {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const date      = searchParams.get('date') ?? new Date().toISOString().split('T')[0];

  if (!studentId) return err('student_id is required', 400);

  // Verify student belongs to teacher
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('id', studentId)
    .eq('teacher_id', user.id)
    .single();

  if (!student) return err('Student not found', 404);

  const { data, error } = await supabase
    .from('task_completions')
    .select('*')
    .eq('student_id', studentId)
    .eq('date', date)
    .order('created_at', { ascending: true });

  if (error) return err(error.message, 500);
  return ok({ tasks: data, date });
});

/** POST — create a new task for a student */
export const POST = withAuth(async (req, { supabase, user }) => {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  // Verify student belongs to teacher
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('id', parsed.data.student_id)
    .eq('teacher_id', user.id)
    .single();

  if (!student) return err('Student not found', 404);

  const { data, error } = await supabase
    .from('task_completions')
    .insert({
      ...parsed.data,
      date: parsed.data.date ?? new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(data, 201);
});

/** PATCH — mark a task complete/incomplete */
export const PATCH = withAuth(async (req, { supabase, user }) => {
  const body = await req.json();
  const parsed = CompleteSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  // Verify task's student belongs to teacher
  const { data: task } = await supabase
    .from('task_completions')
    .select('id, student_id, students(teacher_id)')
    .eq('id', parsed.data.task_id)
    .single();

  if (!task || task.students?.teacher_id !== user.id) return err('Task not found', 404);

  const { data, error } = await supabase
    .from('task_completions')
    .update({
      completed:    parsed.data.completed,
      completed_at: parsed.data.completed ? new Date().toISOString() : null
    })
    .eq('id', parsed.data.task_id)
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(data);
});
