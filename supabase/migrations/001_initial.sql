-- ============================================================
-- FocusFlow — Initial Database Schema
-- ============================================================

-- ──────────────────────────────────────────
-- EXTENSIONS
-- ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy text search

-- ──────────────────────────────────────────
-- PROFILES  (mirrors auth.users)
-- ──────────────────────────────────────────
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  email         TEXT,
  role          TEXT NOT NULL DEFAULT 'teacher'
                  CHECK (role IN ('teacher','homeschool')),
  school_name   TEXT,
  grade_levels  TEXT[]        DEFAULT '{}',
  avatar_url    TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Auto-create a profile row whenever a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at on every change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ──────────────────────────────────────────
-- STUDENTS
-- ──────────────────────────────────────────
CREATE TABLE students (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  grade_level           TEXT,
  -- ADHD profile
  adhd_type             TEXT CHECK (adhd_type IN ('inattentive','hyperactive','combined','unspecified')),
  attention_span_minutes INT  NOT NULL DEFAULT 15 CHECK (attention_span_minutes > 0),
  learning_style        TEXT CHECK (learning_style IN ('visual','auditory','kinesthetic','reading','mixed')),
  interests             TEXT[]        DEFAULT '{}',
  -- Contact
  parent_email          TEXT,
  parent_name           TEXT,
  parent_phone          TEXT,
  -- Meta
  notes                 TEXT,
  is_active             BOOLEAN       NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_students_teacher ON students(teacher_id);
CREATE INDEX idx_students_active  ON students(teacher_id, is_active);

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ──────────────────────────────────────────
-- LESSONS
-- ──────────────────────────────────────────
CREATE TABLE lessons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  subject           TEXT,
  grade_level       TEXT,
  topic             TEXT,
  duration_minutes  INT  DEFAULT 45,
  status            TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','preview','approved','live','completed','archived')),
  -- AI-generated structured content stored as JSONB
  preview_content   JSONB,   -- full lesson plan: { overview, slides[], worksheets[], videos[], notes }
  live_content      JSONB,   -- approved slide deck: { slides[], timer_per_slide }
  -- Personalization signals passed to the AI
  student_interests TEXT[]   DEFAULT '{}',
  learning_styles   TEXT[]   DEFAULT '{}',
  adhd_types        TEXT[]   DEFAULT '{}',
  -- Optional PDF upload stored in Supabase Storage
  pdf_url           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lessons_teacher        ON lessons(teacher_id);
CREATE INDEX idx_lessons_teacher_status ON lessons(teacher_id, status);

CREATE TRIGGER trg_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ──────────────────────────────────────────
-- LESSON SESSIONS  (a live run of a lesson)
-- ──────────────────────────────────────────
CREATE TABLE lesson_sessions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id            UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  teacher_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_slide_index  INT  NOT NULL DEFAULT 0,
  -- Real-time event logs stored as append-only JSONB arrays
  disruptions          JSONB NOT NULL DEFAULT '[]',
  recovery_actions     JSONB NOT NULL DEFAULT '[]',
  verbal_instructions  JSONB NOT NULL DEFAULT '[]', -- { ts, raw_text, structured_steps[] }
  status               TEXT NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','paused','completed','cancelled')),
  started_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at             TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_teacher ON lesson_sessions(teacher_id);
CREATE INDEX idx_sessions_lesson  ON lesson_sessions(lesson_id);
CREATE INDEX idx_sessions_active  ON lesson_sessions(teacher_id, status);

-- ──────────────────────────────────────────
-- DAILY / WEEKLY / SEMESTER PLANS
-- ──────────────────────────────────────────
CREATE TABLE plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id  UUID REFERENCES students(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  plan_type   TEXT NOT NULL DEFAULT 'daily'
                CHECK (plan_type IN ('daily','weekly','semester')),
  plan_date   DATE,           -- for daily/weekly
  start_date  DATE,           -- for semester
  end_date    DATE,
  -- tasks: [{ id, title, time_block, duration_min, subject, completed, order }]
  tasks       JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plans_teacher ON plans(teacher_id);
CREATE INDEX idx_plans_student ON plans(student_id);

CREATE TRIGGER trg_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ──────────────────────────────────────────
-- TASK COMPLETIONS  (student daily check-offs)
-- ──────────────────────────────────────────
CREATE TABLE task_completions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id         UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  plan_id            UUID REFERENCES plans(id) ON DELETE SET NULL,
  lesson_session_id  UUID REFERENCES lesson_sessions(id) ON DELETE SET NULL,
  task_title         TEXT NOT NULL,
  completed          BOOLEAN NOT NULL DEFAULT false,
  completed_at       TIMESTAMPTZ,
  reward_points      INT  NOT NULL DEFAULT 0,
  date               DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_completions_student ON task_completions(student_id, date);

-- ──────────────────────────────────────────
-- STUDENT REWARDS
-- ──────────────────────────────────────────
CREATE TABLE student_rewards (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  total_points   INT  NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  -- badges: [{ id, name, icon, earned_at }]
  badges         JSONB NOT NULL DEFAULT '[]',
  streak_days    INT  NOT NULL DEFAULT 0,
  last_earned_at TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create reward row when a student is added
CREATE OR REPLACE FUNCTION create_student_rewards()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO student_rewards (student_id) VALUES (NEW.id)
  ON CONFLICT (student_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_student_rewards
  AFTER INSERT ON students
  FOR EACH ROW EXECUTE FUNCTION create_student_rewards();

-- When a task_completion is marked done, add reward points
CREATE OR REPLACE FUNCTION update_reward_on_completion()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed = false OR OLD.completed IS NULL) THEN
    UPDATE student_rewards
    SET
      total_points   = total_points + NEW.reward_points,
      last_earned_at = now(),
      updated_at     = now()
    WHERE student_id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reward_on_task_complete
  AFTER UPDATE ON task_completions
  FOR EACH ROW EXECUTE FUNCTION update_reward_on_completion();

-- ──────────────────────────────────────────
-- PARENT MESSAGES
-- ──────────────────────────────────────────
CREATE TABLE parent_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  message_type    TEXT NOT NULL DEFAULT 'daily_update'
                    CHECK (message_type IN ('daily_update','behavior','progress','homework','general')),
  subject         TEXT,
  content         TEXT NOT NULL,
  -- Structured action steps for parents — FocusFlow's differentiator
  practical_steps JSONB NOT NULL DEFAULT '[]',
  email_sent      BOOLEAN NOT NULL DEFAULT false,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at         TIMESTAMPTZ
);

CREATE INDEX idx_parent_messages_teacher ON parent_messages(teacher_id);
CREATE INDEX idx_parent_messages_student ON parent_messages(student_id, sent_at DESC);

-- ──────────────────────────────────────────
-- CLASS SUMMARIES  (end-of-lesson / end-of-day)
-- ──────────────────────────────────────────
CREATE TABLE class_summaries (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_session_id        UUID REFERENCES lesson_sessions(id) ON DELETE SET NULL,
  teacher_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  summary_date             DATE NOT NULL DEFAULT CURRENT_DATE,
  ai_summary               TEXT,
  -- Per-student self-assessment: [{ student_id, understood: bool, completed_all: bool }]
  student_responses        JSONB NOT NULL DEFAULT '[]',
  -- Aggregate metrics
  completed_tasks_count    INT  NOT NULL DEFAULT 0,
  total_tasks_count        INT  NOT NULL DEFAULT 0,
  areas_needing_attention  TEXT[] DEFAULT '{}',
  next_steps               TEXT[] DEFAULT '{}',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_summaries_teacher ON class_summaries(teacher_id, summary_date DESC);

-- ──────────────────────────────────────────
-- STUDENT PROGRESS  (longitudinal tracking)
-- ──────────────────────────────────────────
CREATE TABLE student_progress (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_session_id     UUID REFERENCES lesson_sessions(id) ON DELETE SET NULL,
  subject               TEXT,
  assessment_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  -- 1-5 Likert scales
  understanding_score   INT  CHECK (understanding_score BETWEEN 1 AND 5),
  engagement_score      INT  CHECK (engagement_score BETWEEN 1 AND 5),
  task_completion_rate  FLOAT CHECK (task_completion_rate BETWEEN 0 AND 1),
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_progress_student ON student_progress(student_id, assessment_date DESC);
CREATE INDEX idx_progress_teacher ON student_progress(teacher_id, assessment_date DESC);

-- ──────────────────────────────────────────
-- ADHD TRAINING MODULES
-- ──────────────────────────────────────────
CREATE TABLE training_modules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  category         TEXT NOT NULL
                     CHECK (category IN (
                       'transitions','focus','instructions',
                       'redirection','engagement','communication',
                       'organization','sensory','emotional_regulation'
                     )),
  duration_minutes INT  NOT NULL DEFAULT 10,
  order_index      INT  NOT NULL DEFAULT 0,
  -- content: { type, sections: [{ heading, body, video_url, script, examples[], tip_cards[] }] }
  content          JSONB NOT NULL DEFAULT '{}',
  reward_points    INT  NOT NULL DEFAULT 50,
  is_published     BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_modules_category ON training_modules(category, order_index);

CREATE TRIGGER trg_modules_updated_at
  BEFORE UPDATE ON training_modules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ──────────────────────────────────────────
-- TEACHER TRAINING PROGRESS
-- ──────────────────────────────────────────
CREATE TABLE teacher_training_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id     UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  completed     BOOLEAN NOT NULL DEFAULT false,
  completed_at  TIMESTAMPTZ,
  reward_points INT  NOT NULL DEFAULT 0,
  UNIQUE (teacher_id, module_id)
);

CREATE INDEX idx_training_teacher ON teacher_training_progress(teacher_id);

-- ──────────────────────────────────────────
-- CHAT SESSIONS  (Focus Bot conversations)
-- ──────────────────────────────────────────
CREATE TABLE chat_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL DEFAULT 'general'
                 CHECK (context_type IN (
                   'general','lesson_planning','student_support',
                   'parent_message','daily_plan','recovery'
                 )),
  context_id   UUID,  -- optional: lesson_id / student_id etc.
  title        TEXT,  -- auto-generated summary title
  -- messages: [{ role: 'user'|'assistant', content, ts }]
  messages     JSONB NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_teacher ON chat_sessions(teacher_id, updated_at DESC);

CREATE TRIGGER trg_chat_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ──────────────────────────────────────────
-- EMAIL SUBSCRIPTIONS  (marketing list)
-- ──────────────────────────────────────────
CREATE TABLE subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  source     TEXT DEFAULT 'landing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────
-- ROW-LEVEL SECURITY
-- ──────────────────────────────────────────

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile only" ON profiles
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher owns students" ON students
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher owns lessons" ON lessons
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- lesson_sessions
ALTER TABLE lesson_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher owns sessions" ON lesson_sessions
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- plans
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher owns plans" ON plans
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- task_completions — owned by teacher via student
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher sees own student completions" ON task_completions
  USING (
    student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid())
  );

-- student_rewards
ALTER TABLE student_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher sees own student rewards" ON student_rewards
  USING (
    student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid())
  );

-- parent_messages
ALTER TABLE parent_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher owns messages" ON parent_messages
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- class_summaries
ALTER TABLE class_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher owns summaries" ON class_summaries
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- student_progress
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher owns progress" ON student_progress
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- training_modules — readable by all authenticated users
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read modules" ON training_modules
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_published = true);

-- teacher_training_progress
ALTER TABLE teacher_training_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher owns training progress" ON teacher_training_progress
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher owns chat sessions" ON chat_sessions
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- subscriptions — insert-only for anon
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON subscriptions
  FOR INSERT WITH CHECK (true);

-- ──────────────────────────────────────────
-- STORAGE BUCKETS
-- ──────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('lesson-pdfs',   'lesson-pdfs',   false),
  ('avatars',       'avatars',       true)
ON CONFLICT (id) DO NOTHING;

-- Teachers can upload their own lesson PDFs
CREATE POLICY "Teacher uploads own PDFs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lesson-pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Teacher reads own PDFs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lesson-pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public avatars
CREATE POLICY "Public avatar read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Owner avatar upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ──────────────────────────────────────────
-- SEED: ADHD TRAINING MODULES
-- ──────────────────────────────────────────
INSERT INTO training_modules (title, description, category, duration_minutes, order_index, reward_points, is_published, content) VALUES

('Understanding ADHD in the Classroom',
 'A foundational overview of ADHD types, how they look in real classrooms, and why traditional approaches often miss the mark.',
 'focus', 12, 1, 75, true,
 '{"sections":[{"heading":"What ADHD Actually Looks Like","body":"ADHD is not just about being hyper. The inattentive type can sit quietly while completely checked out. The combined type can appear disruptive when their brain is desperately seeking stimulation. Understanding this distinction changes everything about how you intervene.","tip_cards":["Look for consistent patterns, not one-off behavior","Inattentive students often go undiagnosed longer","Energy dysregulation, not defiance, drives most disruptions"]},{"heading":"The ADHD Brain vs. The Traditional Classroom","body":"Traditional classrooms demand sustained attention, impulse control, and seamless transitions — exactly the three areas where ADHD brains struggle most. FocusFlow restructures the lesson around how attention actually works.","tip_cards":["15-minute attention windows are typical for elementary ADHD","Novelty resets the attention clock — use it intentionally","Predictable structure paradoxically frees attention"]}]}'
),

('Mastering Transitions Without Meltdowns',
 'Practical scripts and visual supports for the hardest moments of the school day.',
 'transitions', 8, 2, 50, true,
 '{"sections":[{"heading":"Why Transitions Are Hard","body":"Executive function — the ability to switch mental gears — is a core deficit in ADHD. Abrupt transitions without warning force the brain to abandon a current task mid-stream, which triggers frustration, resistance, and emotional dysregulation.","tip_cards":["Give 5-minute and 2-minute countdowns before every transition","Use visual timers students can see","Assign a transition job (e.g. line leader) to redirect energy"]},{"heading":"The FocusFlow Transition Script","body":"Try this exact script: ''In 5 minutes we are finishing math and moving to reading. I need pencils down and books on desks. You can do this.'' The specificity and calm confidence matter.","examples":["Pencils down in 60 seconds — watch the timer","Next: get your reading book and open to page 12","Great transition! That earns us 2 bonus minutes at the end"]}]}'
),

('Giving Clear Instructions Students Can Follow',
 'How to turn multi-step verbal instructions into clear, actionable steps for students with ADHD.',
 'instructions', 10, 3, 50, true,
 '{"sections":[{"heading":"The 3-Instruction Rule","body":"ADHD working memory holds roughly 1–2 instructions at once. Giving 5 verbal steps in a row guarantees failure. FocusFlow''s verbal-to-written feature captures your instructions and breaks them into numbered steps displayed on the classroom screen.","tip_cards":["Never give more than 2 instructions at a time","Follow verbal with written/visual","Check for understanding before releasing students to work"]},{"heading":"Instruction Design That Works","body":"Start instructions with the action verb: ''Open your book to page 42'' — not ''What you need to do now is...'' Brevity and concreteness are the two levers that matter most.","examples":["''Open page 42'' → ''Read paragraph 1'' → ''Circle 3 key words''","Pair every verbal instruction with a written version on screen","Ask one student to repeat back the steps to confirm comprehension"]}]}'
),

('Positive Redirection: Keeping Students On Track Calmly',
 'Replace punitive reactions with research-backed redirection techniques that actually work.',
 'redirection', 9, 4, 50, true,
 '{"sections":[{"heading":"Why Punishment Backfires with ADHD","body":"Shame-based correction activates the amygdala and shuts down the prefrontal cortex — the very part of the brain students with ADHD need to regulate behavior. Positive redirection bypasses the shame response and re-engages executive function.","tip_cards":["Redirect privately whenever possible","Acknowledge the feeling before correcting the behavior","Use proximity, not volume, to get attention"]},{"heading":"The FocusFlow Redirection Toolkit","body":"Five tools you can use in under 10 seconds: (1) Silent signal — a pre-agreed hand gesture. (2) Proximity — move toward the student, say nothing. (3) Choice offer — ''Would you like to finish seated or standing?'' (4) Task chunk — break the current task in half. (5) Movement break — 60-second reset for the whole class.","examples":["''Hey Jason, I need eyes on me. Thank you.''","''I see you''re having a hard time — do you want to try standing for the next 5 minutes?''","Class movement break: stand up, 10 jumping jacks, sit down, back to work."]}]}'
),

('Boosting Engagement During Independent Work',
 'Strategies to sustain focus when students work alone — where ADHD attention loss is highest.',
 'engagement', 11, 5, 50, true,
 '{"sections":[{"heading":"The Independent Work Problem","body":"Unstructured work time is where students with ADHD are most likely to disengage. Without a teacher prompting and environmental novelty, the brain searches for stimulation elsewhere. The fix is structured micro-goals and visual progress.","tip_cards":["Use a Pomodoro-style timer visible to students","Break worksheets into numbered segments, not one long block","Check in after the first 3 minutes to catch confusion early"]},{"heading":"Engagement Design Principles","body":"Add novelty: change the format (whiteboard, tablet, paper). Add movement: students can stand. Add purpose: ''When you finish problem 5, bring it to me.'' Add music: low-tempo instrumental reduces off-task behavior by up to 40% in research settings.","examples":["''Your goal for the next 10 minutes: finish problems 1–5.''","Use a class Pomodoro: 12 min work, 3 min break","Play lo-fi instrumental music during independent work periods"]}]}'
),

('Communicating with Parents of Students with ADHD',
 'How to write messages that inform and empower parents — not just alert them.',
 'communication', 8, 6, 50, true,
 '{"sections":[{"heading":"What Parents Need to Hear","body":"Parents of students with ADHD often spend evenings managing homework battles and morning routines alone. A message that simply says ''Taylor didn''t finish his work'' leaves them without a path forward. FocusFlow''s Parent Hub rewrites this dynamic by pairing every update with practical next steps.","tip_cards":["Lead with one positive before sharing a concern","Give a specific action, not a vague reminder","Keep messages under 120 words — brevity increases reading rate"]},{"heading":"The FocusFlow Message Formula","body":"Progress observation → Successful strategy used → What needs reinforcement at home → Specific action steps with timing.","examples":["''Taylor completed 6/10 problems. He stayed focused in 10-minute chunks. Tonight: problems 7–10 using a timer, then a 5-minute break before bed.''","''Maya had a great transition to reading today — we used a 2-minute countdown. At home: give her a 5-minute warning before switching activities."]}]}'
);
