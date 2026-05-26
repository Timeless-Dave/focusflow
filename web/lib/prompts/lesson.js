/**
 * Builds the OpenAI system + user prompt for ADHD-tailored lesson generation.
 * Returns { system, user } strings ready for chat.completions.
 */
export function buildLessonPrompt({ subject, gradeLevel, topic, studentInterests, learningStyles, adhdTypes, durationMinutes }) {
  const interestsStr = studentInterests?.length
    ? `Student interests to weave in: ${studentInterests.join(', ')}.`
    : '';
  const stylesStr = learningStyles?.length
    ? `Primary learning styles in this class: ${learningStyles.join(', ')}.`
    : '';
  const adhdStr = adhdTypes?.length
    ? `ADHD profile(s) present: ${adhdTypes.join(', ')}.`
    : 'Assume combined-type ADHD.';

  const system = `You are FocusFlow's AI Lesson Coach — an expert in ADHD-inclusive pedagogy for elementary and middle school classrooms.

Your job is to transform a standard lesson topic into a fully structured, ADHD-tailored lesson plan. Every lesson you generate must:
1. Open with a hook/story that leverages student interests to capture attention immediately.
2. Break the content into short segments (no longer than 10–15 minutes each).
3. Embed the best instructional strategy for each segment (visual, auditory, kinesthetic, or reading/writing).
4. Include movement breaks, check-ins, and transition cues at appropriate intervals.
5. Provide simplified worksheets, modified assignments, and differentiated supports.
6. Suggest YouTube search terms (not URLs) for relevant videos.
7. Include a reward/celebration moment at the end.
8. Generate a parallel "Live Mode" slide deck: concise slides (max 15 words per slide headline, max 3 bullet points per slide) the teacher can display on the classroom screen.

Respond ONLY with a valid JSON object — no markdown fences, no commentary outside the JSON.`;

  const user = `Generate an ADHD-tailored lesson plan for:
- Subject: ${subject}
- Grade level: ${gradeLevel}
- Topic: ${topic}
- Duration: ${durationMinutes ?? 45} minutes
- ${interestsStr}
- ${stylesStr}
- ${adhdStr}

Return a JSON object with this exact shape:
{
  "overview": {
    "title": string,
    "subject": string,
    "grade": string,
    "topic": string,
    "duration_minutes": number,
    "objective": string,
    "adhd_strategies_used": string[]
  },
  "hook": {
    "type": "story" | "question" | "video" | "activity",
    "duration_minutes": number,
    "script": string,
    "teacher_note": string
  },
  "segments": [
    {
      "index": number,
      "title": string,
      "duration_minutes": number,
      "strategy": "visual" | "auditory" | "kinesthetic" | "reading_writing" | "mixed",
      "content": string,
      "teacher_script": string,
      "visual_support": string,
      "movement_break": { "included": boolean, "activity": string } | null,
      "check_in": string | null
    }
  ],
  "worksheet": {
    "title": string,
    "instructions": string,
    "problems": [{ "number": number, "prompt": string, "hint": string }],
    "modified_version": string
  },
  "video_suggestions": [{ "search_term": string, "purpose": string }],
  "music_suggestion": string,
  "reward_moment": string,
  "transition_cues": string[],
  "live_slides": [
    {
      "index": number,
      "headline": string,
      "bullets": string[],
      "speaker_note": string,
      "timer_minutes": number,
      "type": "hook" | "content" | "activity" | "check_in" | "break" | "reward"
    }
  ]
}`;

  return { system, user };
}

export function buildRecoveryPrompt({ disruptionType, currentSlideIndex, lessonTopic, gradeLevel }) {
  const system = `You are FocusFlow's Live Recovery Engine. Your job is to give a teacher an immediate, calm, evidence-based strategy to re-engage students with ADHD after a classroom disruption — in under 30 seconds of reading.

Keep every response under 80 words. Be direct and practical. Respond in JSON only.`;

  const user = `Classroom disruption detected.
- Type: ${disruptionType}
- Current lesson: ${lessonTopic} (${gradeLevel})
- Slide position: ${currentSlideIndex}

Return JSON:
{
  "strategy_title": string,
  "immediate_action": string,
  "teacher_script": string,
  "board_message": string,
  "estimated_recovery_minutes": number
}`;

  return { system, user };
}

export function buildVerbalToStepsPrompt({ rawText, studentCount }) {
  const system = `You are FocusFlow's Verbal-to-Written Instructions converter. Convert a teacher's verbal instruction into clear, numbered steps a student with ADHD can follow independently. Use simple language (max grade 3 reading level). Respond in JSON only.`;

  const user = `Teacher said: "${rawText}"
Class size: ${studentCount ?? 'unknown'}

Return JSON:
{
  "steps": [{ "number": number, "instruction": string, "emoji": string }],
  "board_headline": string
}`;

  return { system, user };
}
