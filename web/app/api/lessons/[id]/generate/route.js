import { withAuth, ok, err } from '@lib/api';
import { getOpenAI } from '@lib/openai';
import { buildLessonPrompt } from '@lib/prompts/lesson';

export const POST = withAuth(async (_req, { supabase, user, params }) => {
  const { id } = await params;

  // Fetch the lesson to get generation inputs
  const { data: lesson, error: fetchErr } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (fetchErr) return err('Lesson not found', 404);
  if (!lesson.subject || !lesson.topic) return err('Lesson must have subject and topic set before generating', 400);

  const { system, user: userPrompt } = buildLessonPrompt({
    subject:          lesson.subject,
    gradeLevel:       lesson.grade_level,
    topic:            lesson.topic,
    studentInterests: lesson.student_interests,
    learningStyles:   lesson.learning_styles,
    adhdTypes:        lesson.adhd_types,
    durationMinutes:  lesson.duration_minutes
  });

  let generated;
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: userPrompt }
      ]
    });
    generated = JSON.parse(response.choices[0].message.content);
  } catch (aiErr) {
    console.error('[lesson/generate] OpenAI error:', aiErr);
    return err('AI generation failed. Please try again.', 502);
  }

  // Extract live_content (slides) from the generated plan
  const liveContent = {
    slides: generated.live_slides ?? [],
    timer_per_slide: 5
  };

  // Persist both preview and live content, advance status to 'preview'
  const { data, error: updateErr } = await supabase
    .from('lessons')
    .update({
      preview_content: generated,
      live_content:    liveContent,
      status:          'preview',
      updated_at:      new Date().toISOString()
    })
    .eq('id', id)
    .eq('teacher_id', user.id)
    .select()
    .single();

  if (updateErr) return err(updateErr.message, 500);
  return ok(data);
});
