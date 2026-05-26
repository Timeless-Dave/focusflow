import { NextResponse } from 'next/server';
import { createClient } from './supabase/server';

/** Wrap a route handler with Supabase auth. Passes (request, { supabase, user, params }) */
export function withAuth(handler) {
  return async (request, context) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      return handler(request, { supabase, user, params: context?.params ?? {} });
    } catch (err) {
      console.error('[API error]', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

export function ok(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
