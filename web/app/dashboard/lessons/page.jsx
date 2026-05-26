'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@lib/supabase/client';

const STATUS_COLORS = {
  draft:     'db-badge--draft',
  preview:   'db-badge--preview',
  approved:  'db-badge--approved',
  live:      'db-badge--live',
  completed: 'db-badge--completed'
};

function subjectIcon(subject = '') {
  const m = { math: '🔢', reading: '📖', science: '🔬', history: '🏛️', art: '🎨', music: '🎵' };
  const k = subject.toLowerCase();
  return Object.entries(m).find(([key]) => k.includes(key))?.[1] ?? '📋';
}

export default function LessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('lessons')
        .select('id, title, subject, grade_level, topic, status, duration_minutes, created_at')
        .eq('teacher_id', user.id)
        .neq('status', 'archived')
        .order('updated_at', { ascending: false })
        .then(({ data }) => {
          setLessons(data ?? []);
          setLoading(false);
        });
    });
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Archive this lesson?')) return;
    setDeleting(id);
    await fetch(`/api/lessons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'archived' })
    });
    setLessons(l => l.filter(x => x.id !== id));
    setDeleting(null);
  };

  const handleLive = async (id) => {
    const res = await fetch(`/api/lessons/${id}/live`, { method: 'POST' });
    if (res.ok) {
      const { session } = await res.json();
      router.push(`/dashboard/lessons/${id}/live/${session.id}`);
    }
  };

  return (
    <>
      <div className="db-page-header">
        <div>
          <h1>Lessons</h1>
          <p>All your ADHD-tailored lesson plans in one place.</p>
        </div>
        <Link href="/dashboard/lessons/new" className="btn primary">+ New Lesson</Link>
      </div>

      <div className="db-lesson-list">
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="db-lesson-card">
              <div className="db-skeleton" style={{ width:44,height:44,borderRadius:10,flexShrink:0 }} />
              <div style={{ flex:1,display:'flex',flexDirection:'column',gap:8 }}>
                <div className="db-skeleton" style={{ height:15,width:'45%' }} />
                <div className="db-skeleton" style={{ height:12,width:'30%' }} />
              </div>
              <div className="db-skeleton" style={{ width:90,height:34,borderRadius:20 }} />
            </div>
          ))
        ) : lessons.length === 0 ? (
          <div className="db-empty">
            <div className="db-empty__icon">✏️</div>
            <p>No lessons yet. Create your first ADHD-tailored lesson plan.</p>
            <Link href="/dashboard/lessons/new" className="btn primary">+ Create Lesson</Link>
          </div>
        ) : lessons.map(l => (
          <div key={l.id} className="db-lesson-card">
            <div className="db-lesson-card__icon" style={{ background: 'var(--lavender-soft)', fontSize: 22 }}>
              {subjectIcon(l.subject)}
            </div>
            <div className="db-lesson-card__body">
              <h3>{l.title}</h3>
              <p>{l.subject} · Grade {l.grade_level ?? '–'}</p>
              <div className="db-lesson-card__meta">
                <span className={`db-badge ${STATUS_COLORS[l.status] ?? 'db-badge--draft'}`}>{l.status}</span>
                {l.duration_minutes && (
                  <span style={{ fontSize:12, color:'var(--gray-400)' }}>{l.duration_minutes} min</span>
                )}
              </div>
            </div>
            <div className="db-lesson-card__actions">
              {!l.preview_content && l.status === 'draft' && (
                <Link href={`/dashboard/lessons/new`} className="btn sm">Generate</Link>
              )}
              {(l.status === 'preview' || l.status === 'approved') && (
                <button className="btn primary sm" onClick={() => handleLive(l.id)}>▶ Live</button>
              )}
              <Link href={`/dashboard/lessons/${l.id}`} className="btn ghost sm">View</Link>
              <button
                className="btn ghost sm"
                onClick={() => handleDelete(l.id)}
                disabled={deleting === l.id}
                style={{ color: deleting === l.id ? 'var(--gray-400)' : '#e11d48', borderColor: 'transparent' }}
              >
                {deleting === l.id ? '…' : '✕'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
