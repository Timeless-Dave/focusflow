import { withAuth, ok, err } from '@lib/api';
import { getOpenAI } from '@lib/openai';
import { buildRecoveryPrompt, buildVerbalToStepsPrompt } from '@lib/prompts/lesson';
import { z } from 'zod';

const RecoverySchema = z.object({
  disruption_type: z.enum([
    'loss_of_attention',
    'hyperactivity',
    'emotional_dysregulation',
    'refusal',
    'whole_class_off_task',
    'verbal_outburst',
    'transition_difficulty'
  ]),
  verbal_instruction: z.string().max(1000).optional()
});

/**
 * POST — log a disruption and get an AI recovery strategy.
 * If verbal_instruction is provided, also converts it to written steps.
 */
export const POST = withAuth(async (req, { supabase, user, params }) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = RecoverySchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten(), 422);

  const { data: session, error: fetchErr } = await supabase
    .from('lesson_sessions')
    .select('disruptions, recovery_actions, verbal_instructions, current_slide_index, lessons(topic, grade_level)')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (fetchErr) return err('Session not found', 404);

  const topic      = session.lessons?.topic      ?? 'current lesson';
  const gradeLevel = session.lessons?.grade_level ?? 'unknown grade';
  const openai     = getOpenAI();

  // Run recovery + (optional) verbal-to-steps in parallel
  const tasks = [
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        ...buildRecoveryPrompt({
          disruptionType:    parsed.data.disruption_type,
          currentSlideIndex: session.current_slide_index,
          lessonTopic:       topic,
          gradeLevel
        })
      ].map(({ system, user: u }) =>
        system ? [{ role: 'system', content: system }, { role: 'user', content: u }] : []
      ).flat()
    })
  ];

  // Actually build the message array properly
  const recoveryMessages = (() => {
    const { system, user: u } = buildRecoveryPrompt({
      disruptionType:    parsed.data.disruption_type,
      currentSlideIndex: session.current_slide_index,
      lessonTopic:       topic,
      gradeLevel
    });
    return [{ role: 'system', content: system }, { role: 'user', content: u }];
  })();

  const verbalMessages = parsed.data.verbal_instruction
    ? (() => {
        const { system, user: u } = buildVerbalToStepsPrompt({
          rawText:       parsed.data.verbal_instruction,
          studentCount:  null
        });
        return [{ role: 'system', content: system }, { role: 'user', content: u }];
      })()
    : null;

  let recoveryResult, verbalResult;
  try {
    const promises = [
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.5,
        response_format: { type: 'json_object' },
        messages: recoveryMessages
      })
    ];
    if (verbalMessages) {
      promises.push(
        openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: verbalMessages
        })
      );
    }
    const results = await Promise.all(promises);
    recoveryResult = JSON.parse(results[0].choices[0].message.content);
    if (results[1]) verbalResult = JSON.parse(results[1].choices[0].message.content);
  } catch (aiErr) {
    console.error('[recovery] OpenAI error:', aiErr);
    return err('Recovery AI failed. Please try again.', 502);
  }

  const now        = new Date().toISOString();
  const disruption = { ts: now, type: parsed.data.disruption_type };
  const recovery   = { ts: now, ...recoveryResult };

  // Append to JSONB arrays using Supabase RPC or raw update
  const newDisruptions      = [...(session.disruptions       ?? []), disruption];
  const newRecoveries       = [...(session.recovery_actions  ?? []), recovery];
  const newVerbalInstructions = verbalResult
    ? [...(session.verbal_instructions ?? []), { ts: now, raw: parsed.data.verbal_instruction, ...verbalResult }]
    : (session.verbal_instructions ?? []);

  await supabase
    .from('lesson_sessions')
    .update({
      disruptions:         newDisruptions,
      recovery_actions:    newRecoveries,
      verbal_instructions: newVerbalInstructions
    })
    .eq('id', id);

  return ok({
    recovery: recoveryResult,
    verbal_steps: verbalResult ?? null
  });
});
