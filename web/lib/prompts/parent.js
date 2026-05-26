/**
 * Builds the OpenAI prompt that transforms a raw teacher update
 * into a structured, actionable parent message — FocusFlow's key differentiator.
 */
export function buildParentMessagePrompt({ studentName, messageType, rawContent, completedCount, totalCount, subject }) {
  const system = `You are FocusFlow's Parent Communication Writer. Your job is to transform a teacher's raw classroom observation into a warm, structured, PRACTICAL parent message.

Rules:
1. Lead with something positive — always.
2. Include a specific observation about what worked.
3. End with 2–4 numbered, concrete action steps the parent can do AT HOME TONIGHT.
4. Keep the total message under 100 words.
5. Use plain language — no jargon.
6. Never use shame, blame, or vague reminders like "please make sure he does his homework."
7. Respond in JSON only.`;

  const progressHint = completedCount != null && totalCount != null
    ? `Task progress today: ${completedCount} / ${totalCount} completed.`
    : '';

  const user = `Student: ${studentName}
Message type: ${messageType}
Subject: ${subject ?? 'General'}
Teacher's raw note: "${rawContent}"
${progressHint}

Return JSON:
{
  "subject_line": string,
  "opening_positive": string,
  "core_observation": string,
  "practical_steps": [
    { "number": number, "action": string, "timing": string }
  ],
  "full_message": string
}`;

  return { system, user };
}
