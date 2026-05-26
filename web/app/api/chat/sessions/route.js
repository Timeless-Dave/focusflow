import { withAuth, ok, err } from '@lib/api';

export const GET = withAuth(async (req, { supabase, user }) => {
  const { searchParams } = new URL(req.url);
  const id          = searchParams.get('id');
  const contextType = searchParams.get('context_type');
  const limit       = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);

  // Single session by ID (used to load message history)
  if (id) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', id)
      .eq('teacher_id', user.id)
      .single();
    if (error) return err(error.message, 500);
    return ok(data);
  }

  // Session list
  let query = supabase
    .from('chat_sessions')
    .select('id, title, context_type, created_at, updated_at, messages')
    .eq('teacher_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (contextType) query = query.eq('context_type', contextType);

  const { data, error } = await query;
  if (error) return err(error.message, 500);
  return ok(data ?? []);
});

export const PATCH = withAuth(async (req, { supabase, user }) => {
  const { id, title } = await req.json();
  if (!id || !title?.trim()) return err('id and title required', 400);

  const { data, error } = await supabase
    .from('chat_sessions')
    .update({ title: title.trim().slice(0, 80), updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('teacher_id', user.id)
    .select('id, title')
    .single();

  if (error) return err(error.message, 500);
  return ok(data);
});

export const DELETE = withAuth(async (req, { supabase, user }) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return err('id required', 400);

  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', id)
    .eq('teacher_id', user.id);

  if (error) return err(error.message, 500);
  return ok({ deleted: true });
});
