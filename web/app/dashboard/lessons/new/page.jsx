'use client';

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { brandPaths } from '@/config';
import './lesson-studio.css';

/* ── Chips data ── */
const LEARNING_STYLE_CHIPS = [
  { id: 'visual',      label: '👁️ Visual' },
  { id: 'auditory',    label: '🎧 Auditory' },
  { id: 'kinesthetic', label: '🤸 Kinesthetic' },
  { id: 'reading',     label: '📖 Reading/Writing' }
];

const ADHD_TYPE_CHIPS = [
  { id: 'inattentive',  label: '🌀 Inattentive' },
  { id: 'hyperactive',  label: '⚡ Hyperactive' },
  { id: 'combined',     label: '🔄 Combined' }
];

const GRADE_OPTIONS = [
  'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
  'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'
];

const SUBJECT_OPTIONS = [
  'Mathematics', 'Reading / ELA', 'Science', 'Social Studies',
  'Writing', 'Art', 'Music', 'Physical Education', 'Other'
];

/* ── Step labels shown during generation ── */
const GEN_STEPS = [
  'Analysing learning styles and ADHD profile…',
  'Designing the lesson hook and storytelling opener…',
  'Breaking content into ADHD-friendly segments…',
  'Adding movement breaks and check-ins…',
  'Generating worksheets and visual supports…',
  'Building the Live Mode slide deck…',
  'Finalising your lesson plan…'
];

/* ── Helpers ── */
function ChipToggle({ chips, selected, onChange }) {
  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  return (
    <div className="ls-chip-group">
      {chips.map(c => (
        <button
          key={c.id}
          type="button"
          className={`ls-chip${selected.includes(c.id) ? ' ls-chip--active' : ''}`}
          onClick={() => toggle(c.id)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function StrategyBadge({ strategy }) {
  const map = {
    visual: 'ls-segment-chip__type--visual',
    auditory: 'ls-segment-chip__type--auditory',
    kinesthetic: 'ls-segment-chip__type--kinesthetic',
    reading_writing: 'ls-segment-chip__type--visual',
    mixed: 'ls-segment-chip__type--mixed'
  };
  return (
    <span className={`ls-segment-chip__type ${map[strategy] ?? 'ls-segment-chip__type--mixed'}`}>
      {strategy?.replace('_', '/')}
    </span>
  );
}

/* ── Generating animation ── */
function GeneratingState({ lessonTitle }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i < GEN_STEPS.length) setActiveStep(i);
      else clearInterval(id);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="ls-card ls-state">
      <div className="ls-generating">
        {/* Orbital rings */}
        <div className="ls-generating__orbit">
          <div className="ls-generating__ring" />
          <div className="ls-generating__ring ls-generating__ring--2" />
          <div className="ls-generating__core">
            <img src={brandPaths.logoMark} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
        </div>

        <div>
          <h2>Crafting your lesson…</h2>
          <p style={{ marginTop: 6 }}>
            FocusFlow is designing an ADHD-optimised plan for <strong>{lessonTitle}</strong>.
            <br />This takes about 15–20 seconds.
          </p>
        </div>

        <div className="ls-generating__steps">
          {GEN_STEPS.map((step, i) => {
            const state = i < activeStep ? 'done' : i === activeStep ? 'active' : '';
            return (
              <div key={i} className={`ls-generating__step${state ? ` ls-generating__step--${state}` : ''}`}>
                <span className="ls-step-dot" />
                {state === 'done' ? '✓ ' : ''}{step}
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>
          Powered by FocusFlow AI · Grounded in ADHD research
        </p>
      </div>
    </div>
  );
}

/* ── Success state ── */
function SuccessState({ lesson, router }) {
  const preview = lesson?.preview_content;
  const overview = preview?.overview;
  const segments = preview?.segments?.slice(0, 4) ?? [];
  const slides   = preview?.live_slides?.length ?? 0;

  return (
    <div className="ls-state">
      {/* Success badge */}
      <div className="ls-success">
        <div className="ls-success__badge">
          <div className="ls-success__check">✓</div>
          <div className="ls-success__badge-text">
            <h3>Your lesson is ready!</h3>
            <p>ADHD-tailored plan generated · {slides} slides built for Live Mode</p>
          </div>
        </div>

        {/* Lesson overview preview */}
        {overview && (
          <div className="ls-overview">
            <div className="ls-overview__header">
              <h4>{overview.title ?? lesson.title}</h4>
              <span className="db-badge db-badge--preview">Preview</span>
            </div>
            <div className="ls-overview__body">
              <div className="ls-overview__row">
                <span className="ls-overview__key">Objective</span>
                <span className="ls-overview__val">{overview.objective}</span>
              </div>
              <div className="ls-overview__row">
                <span className="ls-overview__key">Duration</span>
                <span className="ls-overview__val">{overview.duration_minutes} minutes</span>
              </div>
              {overview.adhd_strategies_used?.length > 0 && (
                <div className="ls-overview__row">
                  <span className="ls-overview__key">Strategies</span>
                  <span className="ls-overview__val">
                    <div className="ls-chip-group" style={{ marginTop: 2 }}>
                      {overview.adhd_strategies_used.slice(0, 4).map((s, i) => (
                        <span key={i} className="ls-chip ls-chip--active" style={{ fontSize: 12, padding: '3px 10px' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </span>
                </div>
              )}
              {segments.length > 0 && (
                <div className="ls-overview__row">
                  <span className="ls-overview__key">Segments</span>
                  <span className="ls-overview__val" style={{ flex: 1 }}>
                    <div className="ls-segments">
                      {segments.map((seg, i) => (
                        <div key={i} className="ls-segment-chip">
                          <StrategyBadge strategy={seg.strategy} />
                          <span style={{ fontWeight: 600, flex: 1 }}>{seg.title}</span>
                          <span style={{ color: 'var(--gray-400)', fontSize: 11 }}>{seg.duration_minutes}m</span>
                        </div>
                      ))}
                    </div>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick info pills */}
        {preview?.hook && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span className="eyebrow" style={{ fontSize: 11 }}>
              {preview.hook.type === 'story' ? '📖' : preview.hook.type === 'activity' ? '🤸' : '🎬'} Hook: {preview.hook.type}
            </span>
            {preview.video_suggestions?.length > 0 && (
              <span className="eyebrow" style={{ fontSize: 11, background: 'var(--peach)' }}>
                🎥 {preview.video_suggestions.length} video suggestions
              </span>
            )}
            {preview.worksheet && (
              <span className="eyebrow" style={{ fontSize: 11, background: 'var(--mint)' }}>
                📄 Worksheet included
              </span>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="ls-cta-row">
          <Link
            href={`/dashboard/lessons/${lesson.id}`}
            className="btn primary"
            style={{ justifyContent: 'center' }}
          >
            Review &amp; Edit Preview
          </Link>
          <button
            type="button"
            className="btn lavender"
            style={{ justifyContent: 'center' }}
            onClick={async () => {
              const res = await fetch(`/api/lessons/${lesson.id}/live`, { method: 'POST' });
              if (res.ok) {
                const { session } = await res.json();
                router.push(`/dashboard/lessons/${lesson.id}/live/${session.id}`);
              }
            }}
          >
            ▶ Start Live Mode
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/dashboard/lessons/new" className="btn text sm">
            + Create another lesson
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */
/* ── File attachment chip ── */
function AttachChip({ file, onRemove }) {
  const ext  = file.name.split('.').pop().toLowerCase();
  const icon = ['jpg','jpeg','png','gif','webp'].includes(ext) ? '🖼' :
               ['mp4','mov','avi','webm'].includes(ext) ? '🎬' :
               ['mp3','wav','m4a','ogg'].includes(ext) ? '🎵' :
               ['pdf'].includes(ext) ? '📄' :
               ['ppt','pptx'].includes(ext) ? '📊' :
               ['doc','docx'].includes(ext) ? '📝' : '📎';
  const kb = Math.round(file.size / 1024);
  return (
    <div style={{ display:'flex',alignItems:'center',gap:6,padding:'5px 11px',border:'1.5px solid var(--gray-200)',borderRadius:20,background:'var(--white)',fontSize:12,fontWeight:600,maxWidth:200 }}>
      <span>{icon}</span>
      <span style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1 }}>{file.name}</span>
      <span style={{ color:'var(--gray-400)',fontSize:10,flexShrink:0 }}>{kb}k</span>
      <button type="button" onClick={onRemove} style={{ border:'none',background:'none',cursor:'pointer',color:'var(--gray-400)',lineHeight:1,padding:0,fontSize:14,flexShrink:0 }}>×</button>
    </div>
  );
}

export default function NewLessonPage() {
  const router   = useRouter();
  const fileRef  = useRef(null);

  const [state, setState]       = useState('form');   // 'form' | 'generating' | 'success'
  const [lesson, setLesson]     = useState(null);
  const [error, setError]       = useState('');
  const [attachments, setAttachments] = useState([]);
  const [resourceUrl, setResourceUrl] = useState('');
  const [form, setForm]         = useState({
    title:            '',
    subject:          '',
    grade_level:      '',
    topic:            '',
    duration_minutes: 45,
    student_interests: '',
    learning_styles:  [],
    adhd_types:       []
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    setAttachments(prev => [...prev, ...files].slice(0, 8));
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.subject || !form.grade_level || !form.topic.trim()) {
      setError('Please fill in all required fields: Title, Subject, Grade Level, and Topic.');
      return;
    }

    setState('generating');

    const interests = form.student_interests
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Step 1: create lesson draft
    let lessonId;
    try {
      const createRes = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:             form.title,
          subject:           form.subject,
          grade_level:       form.grade_level,
          topic:             form.topic,
          duration_minutes:  Number(form.duration_minutes),
          student_interests: interests,
          learning_styles:   form.learning_styles,
          adhd_types:        form.adhd_types
        })
      });

      if (!createRes.ok) {
        const { error: msg } = await createRes.json();
        throw new Error(msg ?? 'Failed to create lesson');
      }

      const created = await createRes.json();
      lessonId = created.id;
    } catch (err) {
      setState('form');
      setError(err.message);
      return;
    }

    // Step 2: generate AI content
    try {
      const genRes = await fetch(`/api/lessons/${lessonId}/generate`, { method: 'POST' });
      if (!genRes.ok) {
        const { error: msg } = await genRes.json();
        throw new Error(msg ?? 'AI generation failed');
      }
      const generated = await genRes.json();
      setLesson(generated);
      setState('success');
    } catch (err) {
      setState('form');
      setError(err.message);
    }
  };

  if (state === 'generating') {
    return (
      <div className="ls-page">
        <GeneratingState lessonTitle={form.title} />
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="ls-page">
        <div className="ls-breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span>›</span>
          <Link href="/dashboard/lessons">Lesson Studio</Link>
          <span>›</span>
          <span>Lesson Generated</span>
        </div>
        <SuccessState lesson={lesson} router={router} />
      </div>
    );
  }

  /* ── Form state ── */
  return (
    <div className="ls-page">
      <div className="ls-breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span>›</span>
        <Link href="/dashboard/lessons">Lesson Studio</Link>
        <span>›</span>
        <span>New Lesson</span>
      </div>

      <div className="ls-card ls-state">
        <div className="ls-header">
          <div className="eyebrow">✨ AI Lesson Studio</div>
          <h1>Create an ADHD-Tailored Lesson</h1>
          <p>
            Tell FocusFlow what you want to teach. We&apos;ll generate a structured, engagement-first lesson plan
            with visual supports, movement breaks, and a ready-to-use Live Mode slide deck.
          </p>
        </div>

        {error && <div className="ls-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="ls-form-grid">

            {/* Title */}
            <div className="ls-field ls-field--full">
              <label className="ls-label">
                Lesson Title <span className="ls-label-req">*</span>
              </label>
              <input
                className="ls-input"
                type="text"
                placeholder="e.g. Addition with Dinosaurs"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                required
              />
            </div>

            {/* Subject */}
            <div className="ls-field">
              <label className="ls-label">
                Subject <span className="ls-label-req">*</span>
              </label>
              <select
                className="ls-select"
                value={form.subject}
                onChange={e => set('subject', e.target.value)}
                required
              >
                <option value="">Select subject…</option>
                {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Grade */}
            <div className="ls-field">
              <label className="ls-label">
                Grade Level <span className="ls-label-req">*</span>
              </label>
              <select
                className="ls-select"
                value={form.grade_level}
                onChange={e => set('grade_level', e.target.value)}
                required
              >
                <option value="">Select grade…</option>
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Topic */}
            <div className="ls-field ls-field--full">
              <label className="ls-label">
                Core Topic <span className="ls-label-req">*</span>
              </label>
              <textarea
                className="ls-textarea"
                placeholder="e.g. Single-digit addition using objects and counting strategies"
                value={form.topic}
                onChange={e => set('topic', e.target.value)}
                required
              />
              <p className="ls-hint">Be specific — the more context you give, the better the lesson.</p>
            </div>

            {/* Duration */}
            <div className="ls-field">
              <label className="ls-label">Duration (minutes)</label>
              <input
                className="ls-input"
                type="number"
                min={10}
                max={180}
                step={5}
                value={form.duration_minutes}
                onChange={e => set('duration_minutes', e.target.value)}
              />
            </div>

            {/* Interests */}
            <div className="ls-field">
              <label className="ls-label">Student Interests</label>
              <input
                className="ls-input"
                type="text"
                placeholder="e.g. dinosaurs, space, Minecraft"
                value={form.student_interests}
                onChange={e => set('student_interests', e.target.value)}
              />
              <p className="ls-hint">Comma-separated. FocusFlow weaves these into the lesson hook.</p>
            </div>

          </div>

          <div className="ls-divider" />

          {/* Optional resources */}
          <div className="ls-field ls-field--full" style={{ marginBottom: 20 }}>
            <label className="ls-label">
              Existing Resources <span style={{ fontWeight:400,color:'var(--gray-400)',fontSize:11 }}>(optional)</span>
            </label>
            <p className="ls-hint" style={{ marginBottom: 8 }}>
              Upload slides, documents, audio, video, or paste a link — AI will incorporate this material into the lesson.
            </p>

            {/* File drop zone */}
            <div
              style={{ border:'2px dashed var(--gray-200)',borderRadius:12,padding:'16px 20px',background:'rgba(255,255,255,0.6)',cursor:'pointer',transition:'border-color 0.18s,background 0.18s' }}
              onClick={() => fileRef.current?.click()}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--purple)';e.currentTarget.style.background='var(--lavender-soft)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--gray-200)';e.currentTarget.style.background='rgba(255,255,255,0.6)';}}
            >
              <div style={{ display:'flex',alignItems:'center',gap:10,fontSize:13,color:'var(--gray-500)',fontWeight:600 }}>
                <span style={{ fontSize:22 }}>📎</span>
                <div>
                  <div>Click to attach files</div>
                  <div style={{ fontSize:11,fontWeight:400,color:'var(--gray-400)' }}>PDF, Word, PowerPoint, images, audio, video · up to 8 files</div>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
                style={{ display:'none' }}
                onChange={handleFileChange}
              />
            </div>

            {/* Attached files */}
            {attachments.length > 0 && (
              <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginTop:10 }}>
                {attachments.map((f,i) => (
                  <AttachChip key={i} file={f} onRemove={() => setAttachments(prev => prev.filter((_,j)=>j!==i))} />
                ))}
              </div>
            )}

            {/* Resource URL */}
            <div style={{ marginTop:10 }}>
              <input
                className="ls-input"
                type="url"
                placeholder="Or paste a link to a resource, video, or article…"
                value={resourceUrl}
                onChange={e => setResourceUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="ls-divider" />

          {/* Learning styles */}
          <div className="ls-field" style={{ marginBottom: 20 }}>
            <label className="ls-label">Primary Learning Styles in Your Class</label>
            <ChipToggle
              chips={LEARNING_STYLE_CHIPS}
              selected={form.learning_styles}
              onChange={v => set('learning_styles', v)}
            />
          </div>

          {/* ADHD types */}
          <div className="ls-field">
            <label className="ls-label">ADHD Profile(s) Present</label>
            <ChipToggle
              chips={ADHD_TYPE_CHIPS}
              selected={form.adhd_types}
              onChange={v => set('adhd_types', v)}
            />
          </div>

          <div className="ls-submit-row">
            <span className="ls-submit-note">
              <img src={brandPaths.logoMark} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
              Powered by FocusFlow AI + GPT-4o
            </span>
            <button type="submit" className="btn primary" style={{ minWidth: 200 }}>
              ✨ Generate Lesson Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
