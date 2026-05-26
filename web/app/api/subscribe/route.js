import { NextResponse } from 'next/server';
import { createClient } from '@lib/supabase/server';
import { z } from 'zod';

const Schema = z.object({
  email:  z.string().email(),
  source: z.string().max(50).default('landing')
});

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('subscriptions')
    .insert({ email: parsed.data.email, source: parsed.data.source });

  if (error) {
    // Duplicate email is fine — treat as success
    if (error.code === '23505') {
      return NextResponse.json({ subscribed: true, duplicate: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscribed: true }, { status: 201 });
}
