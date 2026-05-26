'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@lib/supabase/client';

/* ── SVG icons (no emoji) ── */
function IcoClipboard() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
}
function IcoUsers() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IcoPencil() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function IcoStar() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function IcoPlay() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}
function IcoArrow() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function IcoClock() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IcoPlus() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IcoMessage() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function IcoBook() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}
function IcoBot() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M12 11V5"/><circle cx="12" cy="4" r="1"/><line x1="8" y1="15" x2="8" y2="15" strokeWidth="3"/><line x1="16" y1="15" x2="16" y2="15" strokeWidth="3"/><line x1="10" y1="19" x2="14" y2="19"/></svg>;
}

const STATUS_COLORS = {
  draft: 'db-badge--draft', preview: 'db-badge--preview',
  approved: 'db-badge--approved', live: 'db-badge--live',
  completed: 'db-badge--completed', archived: 'db-badge--draft'
};

const SUBJECT_MAP = {
  math: 'IcoPencil', mathematics: 'IcoPencil',
  reading: 'IcoBook', english: 'IcoBook',
  science: 'IcoClipboard',
};

function subjectColor(subject = '') {
  const k = subject.toLowerCase();
  if (k.includes('math')) return 'var(--lavender-soft)';
  if (k.includes('read') || k.includes('english')) return 'var(--mint)';
  if (k.includes('science')) return 'var(--peach)';
  if (k.includes('art')) return 'var(--yellow-soft)';
  if (k.includes('music')) return 'var(--pink)';
  return 'var(--lavender-soft)';
}

function subjectInitial(subject = '') {
  return subject ? subject[0].toUpperCase() : '?';
}

function StatCard({ icon, label, value, sub, color = 'lavender', action }) {
  return (
    <div className={`db-stat-card db-stat-card--${color}`}>
      <div className="db-stat-card__icon">{icon}</div>
      <div className="db-stat-card__label">{label}</div>
      <div className="db-stat-card__value">{value}</div>
      {sub && <div className="db-stat-card__sub">{sub}</div>}
      {action && <div className="db-stat-card__action">{action}</div>}
    </div>
  );
}

function LessonRow({ lesson, onStartLive }) {
  return (
    <div className="db-lesson-card">
      <div className="db-lesson-card__icon" style={{ background: subjectColor(lesson.subject) }}>
        <span style={{ fontWeight: 800, fontSize: 15 }}>{subjectInitial(lesson.subject)}</span>
      </div>
      <div className="db-lesson-card__body">
        <h3>{lesson.title}</h3>
        <p>{lesson.subject ?? '–'} · Grade {lesson.grade_level ?? '–'}</p>
        <div className="db-lesson-card__meta">
          <span className={`db-badge ${STATUS_COLORS[lesson.status] ?? 'db-badge--draft'}`}>{lesson.status}</span>
          {lesson.duration_minutes && (
            <span style={{ display:'flex',alignItems:'center',gap:4,fontSize:11,color:'var(--gray-400)' }}>
              <IcoClock /> {lesson.duration_minutes} min
            </span>
          )}
        </div>
      </div>
      <div className="db-lesson-card__actions">
        {(lesson.status === 'preview' || lesson.status === 'approved') && (
          <button className="btn primary sm" onClick={() => onStartLive(lesson.id)} style={{ display:'flex',alignItems:'center',gap:5 }}>
            <IcoPlay /> Live
          </button>
        )}
        <Link href={`/dashboard/lessons/${lesson.id}`} className="btn ghost sm" style={{ display:'grid',placeItems:'center',width:32 }}>
          <IcoArrow />
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="db-lesson-card">
      <div className="db-skeleton" style={{ width:42,height:42,borderRadius:10,flexShrink:0 }} />
      <div style={{ flex:1,display:'flex',flexDirection:'column',gap:7 }}>
        <div className="db-skeleton" style={{ height:14,width:'52%' }} />
        <div className="db-skeleton" style={{ height:11,width:'33%' }} />
      </div>
      <div className="db-skeleton" style={{ width:72,height:30,borderRadius:20 }} />
    </div>
  );
}

function StudentRow({ student }) {
  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();
  const points   = student.student_rewards?.[0]?.total_points ?? 0;
  return (
    <div style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid rgba(11,18,32,0.06)' }}>
      <div style={{ width:34,height:34,borderRadius:'50%',border:'2px solid var(--ink)',background:'var(--lavender)',display:'grid',placeItems:'center',fontSize:12,fontWeight:800,flexShrink:0 }}>
        {initials}
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontWeight:700,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{student.first_name} {student.last_name}</div>
        <div style={{ fontSize:11,color:'var(--gray-400)' }}>Grade {student.grade_level ?? '–'}</div>
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:3,fontSize:12,fontWeight:700,color:'#d97706',flexShrink:0 }}>
        <IcoStar /> {points}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [lessons, setLessons]       = useState([]);
  const [students, setStudents]     = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [liveLoading, setLiveLoading] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [lr, sr] = await Promise.all([
        supabase.from('lessons').select('id,title,subject,grade_level,status,duration_minutes,preview_content')
          .eq('teacher_id', user.id).neq('status','archived').order('updated_at',{ascending:false}).limit(8),
        supabase.from('students').select('id,first_name,last_name,grade_level,adhd_type,student_rewards(total_points)')
          .eq('teacher_id', user.id).eq('is_active',true).order('created_at',{ascending:false}).limit(5),
      ]);
      const all = lr.data ?? [];
      setLessons(all);
      setStudents(sr.data ?? []);
      setStats({ ready: all.filter(l=>['preview','approved'].includes(l.status)).length, students: sr.data?.length ?? 0, total: all.length });
      setLoading(false);
    };
    load();
  }, []);

  const handleStartLive = async (lessonId) => {
    setLiveLoading(lessonId);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/live`, { method:'POST' });
      if (res.ok) { const { session } = await res.json(); router.push(`/dashboard/lessons/${lessonId}/live/${session.id}`); }
    } finally { setLiveLoading(null); }
  };

  const readyLessons  = lessons.filter(l => ['preview','approved'].includes(l.status));
  const readyIds      = new Set(readyLessons.map(l => l.id));
  // Remaining lessons not already shown in "Ready to Teach"
  const otherLessons  = lessons.filter(l => !readyIds.has(l.id)).slice(0, 4);

  return (
    <>
      <div className="db-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Here&apos;s what&apos;s happening in your classroom today.</p>
        </div>
        <Link href="/dashboard/lessons/new" className="btn primary db-page-header__action">
          <IcoPlus /> New Lesson
        </Link>
      </div>

      {/* Stats */}
      <div className="db-stat-grid">
        <StatCard icon={<IcoClipboard />} label="Ready to Teach" value={loading ? '–' : stats?.ready ?? 0} sub="lessons approved" color="lavender" />
        <StatCard icon={<IcoUsers />}     label="Active Students" value={loading ? '–' : stats?.students ?? 0} sub="in your roster" color="mint" />
        <StatCard icon={<IcoPencil />}    label="Total Lessons"   value={loading ? '–' : stats?.total ?? 0} sub="created so far" color="peach" />
        <StatCard
          icon={<IcoBot />}
          label="Focus Bot"
          value="Ready"
          sub="ask anything"
          color="yellow"
          action={<Link href="/dashboard/bot" className="btn sm full" style={{ display:'flex',alignItems:'center',gap:5,justifyContent:'center' }}><IcoBot /> Open Chat</Link>}
        />
      </div>

      {/* Main two-column */}
      <div className="db-grid-2">
        {/* Left: Lessons */}
        <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
          {/* Ready to teach */}
          {(loading || readyLessons.length > 0) && (
            <section>
              <div className="db-section-header">
                <h2>Ready to Teach</h2>
                <Link href="/dashboard/lessons" className="btn text sm" style={{ display:'flex',alignItems:'center',gap:4 }}>
                  View all <IcoArrow />
                </Link>
              </div>
              <div className="db-lesson-list">
                {loading ? [1,2].map(i => <SkeletonCard key={i} />) : readyLessons.map(l => <LessonRow key={l.id} lesson={l} onStartLive={handleStartLive} />)}
              </div>
            </section>
          )}

          {/* Other recent (no duplicates) */}
          {(loading || otherLessons.length > 0) && (
            <section>
              <div className="db-section-header">
                <h2>Recent Lessons</h2>
                <Link href="/dashboard/lessons" className="btn text sm" style={{ display:'flex',alignItems:'center',gap:4 }}>
                  Lesson Studio <IcoArrow />
                </Link>
              </div>
              <div className="db-lesson-list">
                {loading
                  ? [1,2].map(i => <SkeletonCard key={i} />)
                  : otherLessons.length > 0
                    ? otherLessons.map(l => <LessonRow key={l.id} lesson={l} onStartLive={handleStartLive} />)
                    : (
                      <div className="db-empty">
                        <div className="db-empty__icon"><IcoPencil /></div>
                        <p>No other lessons yet.</p>
                        <Link href="/dashboard/lessons/new" className="btn primary" style={{ display:'inline-flex',alignItems:'center',gap:6 }}>
                          <IcoPlus /> Create a Lesson
                        </Link>
                      </div>
                    )
                }
              </div>
            </section>
          )}

          {/* Empty state when no lessons at all */}
          {!loading && lessons.length === 0 && (
            <div className="db-empty">
              <div className="db-empty__icon"><IcoPencil /></div>
              <p>No lessons yet. Create your first ADHD-tailored lesson in minutes.</p>
              <Link href="/dashboard/lessons/new" className="btn primary" style={{ display:'inline-flex',alignItems:'center',gap:6 }}>
                <IcoPlus /> Create a Lesson
              </Link>
            </div>
          )}
        </div>

        {/* Right: Quick actions + students + insight */}
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>

          {/* Quick actions */}
          <div style={{ background:'var(--white)',border:'2px solid var(--ink)',borderRadius:14,padding:16,boxShadow:'3px 3px 0 var(--lavender-deep)' }}>
            <div className="db-section-header" style={{ marginBottom:10 }}><h2>Quick Actions</h2></div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
              {[
                { href:'/dashboard/lessons/new', icon:<IcoPencil />,  label:'New Lesson',    color:'var(--lavender-soft)' },
                { href:'/dashboard/students',    icon:<IcoUsers />,   label:'Add Student',   color:'var(--mint)' },
                { href:'/dashboard/parents',     icon:<IcoMessage />, label:'Message Parent',color:'var(--peach)' },
                { href:'/dashboard/training',    icon:<IcoBook />,    label:'Training',      color:'var(--yellow-soft)' },
              ].map(a => (
                <Link key={a.href} href={a.href} style={{
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  gap:8,padding:'14px 8px',border:'2px solid var(--ink)',borderRadius:12,
                  background:a.color,textDecoration:'none',color:'var(--ink)',
                  fontSize:12,fontWeight:700,textAlign:'center',lineHeight:1.3,
                  boxShadow:'2px 2px 0 rgba(11,18,32,0.1)',transition:'transform 0.18s,box-shadow 0.18s',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translate(-2px,-2px)';e.currentTarget.style.boxShadow='4px 4px 0 rgba(11,18,32,0.15)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='2px 2px 0 rgba(11,18,32,0.1)';}}
                >
                  <span style={{ width:32,height:32,borderRadius:8,border:'2px solid var(--ink)',background:'rgba(255,255,255,0.6)',display:'grid',placeItems:'center' }}>{a.icon}</span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Student roster */}
          <div style={{ background:'var(--white)',border:'2px solid var(--ink)',borderRadius:14,padding:16,boxShadow:'3px 3px 0 var(--lavender-deep)' }}>
            <div className="db-section-header" style={{ marginBottom:4 }}>
              <h2>Students</h2>
              <Link href="/dashboard/students" className="btn text sm" style={{ display:'flex',alignItems:'center',gap:4 }}>View all <IcoArrow /></Link>
            </div>
            {loading ? (
              <div style={{ display:'flex',flexDirection:'column',gap:9,paddingTop:6 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ display:'flex',gap:10,alignItems:'center' }}>
                    <div className="db-skeleton" style={{ width:34,height:34,borderRadius:'50%' }} />
                    <div style={{ flex:1,display:'flex',flexDirection:'column',gap:5 }}>
                      <div className="db-skeleton" style={{ height:12,width:'50%' }} />
                      <div className="db-skeleton" style={{ height:10,width:'32%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : students.length > 0 ? (
              students.map(s => <StudentRow key={s.id} student={s} />)
            ) : (
              <div className="db-empty" style={{ padding:'20px 12px' }}>
                <p style={{ margin:'0 0 10px' }}>Add your first student to get started.</p>
                <Link href="/dashboard/students" className="btn sm">Add Student</Link>
              </div>
            )}
          </div>

          {/* ADHD insight */}
          <div style={{ background:'var(--lavender-soft)',border:'2px solid var(--ink)',borderRadius:14,padding:'14px 16px',boxShadow:'3px 3px 0 var(--lavender-deep)' }}>
            <div style={{ fontSize:12,fontWeight:700,color:'var(--purple)',marginBottom:5,display:'flex',alignItems:'center',gap:6 }}>
              <IcoBook /> ADHD Insight
            </div>
            <p style={{ fontSize:13,lineHeight:1.6,color:'var(--gray-600)',margin:'0 0 8px' }}>
              Students with ADHD perform best in 10–15 min focused blocks with brief movement breaks between.
            </p>
            <Link href="/dashboard/training" style={{ fontSize:12,fontWeight:700,color:'var(--purple)',textDecoration:'none' }}>
              See training modules →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
