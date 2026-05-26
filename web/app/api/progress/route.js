import { withAuth, ok, err } from '@lib/api';
import { z } from 'zod';

const CreateSchema = z.object({
  student_id:           z.string().uuid(),
  lesson_session_id:    z.string().uuid().optional(),
  subject:              z.string().max(100).optional(),
  assessment_date:      z.string().optional(),
  understanding_score:  z.number().int().min(1).max(5).optional(),
  engagement_score:     z.number().int().min(1).max(5).optional(),
  task_completion_rate: z.number().min(0).max(1).optional(),
  notes:                z.string().max(2000).optional()
});

export const GET = withAuth(async (req, { supabase, user }) => {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const subject   = searchParams.get('subject');
  const from      = searchParams.get('from');
  const to        = searchParams.get('to');
  const limit     = Math.min(parseInt(searchParams.get('limit') ?? '30', 10), 200);

  let query = supabase
    .from('student_progress')
    .select(`
      *,
      students ( first_name, last_name )
    `, { count: 'exact' })
    .eq('teacher_id', user.id)
    .order('assessment_date', { ascending: false })
    .limit(limit);

  if (studentId) query = query.eq('student_id', studentId);
  if (subject)   query = query.eq('subject', subject);
  if (from)      query = query.gte('assessment_date', from);
  if (to)        query = query.lte('assessment_date', to);

  const { data, error, count } = await query;
  if (error) return err(error.message, 500);
  return ok({ progress: data, total: count });
});

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
    .from('student_progress')
    .insert({
      ...parsed.data,
      teacher_id:      user.id,
      assessment_date: parsed.data.assessment_date ?? new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(data, 201);
});
