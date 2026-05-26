'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

const STATUS_COLORS = {
  draft:     { bg:'#f3f4f6',       color:'#374151' },
  preview:   { bg:'var(--lavender)',color:'#4c1d95' },
  approved:  { bg:'var(--mint)',    color:'#065f46' },
  live:      { bg:'#fee2e2',       color:'#dc2626' },
  completed: { bg:'#dcfce7',       color:'#15803d' },
  archived:  { bg:'#f3f4f6',       color:'#9ca3af' },
};

const SEGMENT_TYPE_STYLES = {
  visual:      { bg:'var(--lavender-soft)', color:'var(--purple)' },
  auditory:    { bg:'var(--peach)',          color:'#92400e' },
  kinesthetic: { bg:'var(--mint)',           color:'#065f46' },
  mixed:       { bg:'var(--yellow-soft)',    color:'#78350f' },
  break:       { bg:'#f0f9ff',              color:'#0369a1' },
};

function SectionCard({ title, children, icon, accent }) {
  return (
    <div style={{ background:'var(--white)',border:'2px solid var(--ink)',borderRadius:16,overflow:'hidden',boxShadow:'3px 3px 0 var(--lavender-deep)' }}>
      <div style={{ padding:'14px 20px',borderBottom:'1.5px solid rgba(11,18,32,0.08)',background:accent??'var(--cream)',display:'flex',alignItems:'center',gap:10 }}>
        {icon && <span style={{ fontSize:18 }}>{icon}</span>}
        <h3 style={{ margin:0,fontSize:'0.95rem',fontWeight:800 }}>{title}</h3>
      </div>
      <div style={{ padding:'16px 20px' }}>{children}</div>
    </div>
  );
}

function SegmentRow({ seg, index }) {
  const typeStyle = SEGMENT_TYPE_STYLES[seg.type] ?? SEGMENT_TYPE_STYLES.mixed;
  return (
    <div style={{ padding:'12px 14px',border:'1.5px solid rgba(11,18,32,0.1)',borderRadius:12,background:'var(--white)',display:'flex',flexDirection:'column',gap:8 }}>
      <div style={{ display:'flex',alignItems:'center',gap:10,flexWrap:'wrap' }}>
        <span style={{ width:26,height:26,borderRadius:'50%',background:'var(--lavender)',border:'1.5px solid var(--purple)',display:'grid',placeItems:'center',fontSize:12,fontWeight:800,flexShrink:0 }}>{index+1}</span>
        <span style={{ fontWeight:700,fontSize:14,flex:1 }}>{seg.title}</span>
        <span style={{ fontSize:11,padding:'2px 9px',borderRadius:20,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',...typeStyle }}>
          {seg.type ?? 'mixed'}
        </span>
        {seg.duration_minutes && (
          <span style={{ fontSize:12,color:'var(--gray-400)' }}>⏱ {seg.duration_minutes} min</span>
        )}
      </div>
      {seg.teacher_action && (
        <p style={{ margin:0,fontSize:13,color:'var(--gray-600)',lineHeight:1.55 }}>{seg.teacher_action}</p>
      )}
      {seg.student_activity && (
        <div style={{ padding:'8px 12px',background:'var(--cream)',borderRadius:8,fontSize:12,color:'var(--gray-600)',lineHeight:1.5 }}>
          <strong style={{ color:'var(--ink)' }}>Students: </strong>{seg.student_activity}
        </div>
      )}
      {seg.adhd_support && (
        <div style={{ display:'flex',alignItems:'flex-start',gap:6,fontSize:12,color:'var(--purple)',padding:'6px 10px',background:'var(--lavender-soft)',borderRadius:8 }}>
          <span style={{ flexShrink:0 }}>🧠</span>
          <span>{seg.adhd_support}</span>
        </div>
      )}
    </div>
  );
}

export default function LessonDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [lesson, setLesson]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [launching, setLaunching] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/lessons/${id}`)
      .then(r => r.json())
      .then(data => { setLesson(data); setLoading(false); })
      .catch(() => { setError('Failed to load lesson.'); setLoading(false); });
  }, [id]);

  const handleApprove = async () => {
    setApproving(true);
    const res = await fetch(`/api/lessons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    if (res.ok) setLesson(l => ({ ...l, status: 'approved' }));
    setApproving(false);
  };

  const handleLive = async () => {
    setLaunching(true);
    const res = await fetch(`/api/lessons/${id}/live`, { method: 'POST' });
    if (res.ok) {
      const { session } = await res.json();
      router.push(`/dashboard/lessons/${id}/live/${session.id}`);
    } else {
      setError('Could not start live session.');
      setLaunching(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth:820,margin:'0 auto' }}>
        <div className="db-skeleton" style={{ height:28,width:'40%',borderRadius:8,marginBottom:24 }} />
        <div className="db-skeleton" style={{ height:120,borderRadius:16,marginBottom:16 }} />
        <div className="db-skeleton" style={{ height:300,borderRadius:16 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="db-empty">
        <div className="db-empty__icon">⚠️</div>
        <p>{error}</p>
        <Link href="/dashboard/lessons" className="btn ghost">← Back to Lessons</Link>
      </div>
    );
  }

  const pc = lesson?.preview_content ?? {};
  const statusStyle = STATUS_COLORS[lesson?.status] ?? STATUS_COLORS.draft;
  const canLaunch = lesson?.status === 'preview' || lesson?.status === 'approved';

  return (
    <div style={{ maxWidth:820,margin:'0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--gray-400)',marginBottom:20 }}>
        <Link href="/dashboard/lessons" style={{ color:'var(--gray-400)',fontWeight:600,textDecoration:'none' }}>Lessons</Link>
        <span>›</span>
        <span style={{ fontWeight:700,color:'var(--ink)' }}>{lesson?.title ?? 'Lesson'}</span>
      </div>

      {/* Hero card */}
      <div style={{ background:'var(--white)',border:'2px solid var(--ink)',borderRadius:18,padding:'24px 28px',marginBottom:20,boxShadow:'5px 5px 0 var(--lavender-deep)' }}>
        <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap' }}>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:8 }}>
              <span style={{ fontSize:11,padding:'3px 10px',borderRadius:20,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',background:statusStyle.bg,color:statusStyle.color }}>
                {lesson?.status}
              </span>
              {lesson?.subject && <span style={{ fontSize:12,color:'var(--gray-400)',fontWeight:600 }}>{lesson.subject}</span>}
              {lesson?.grade_level && <span style={{ fontSize:12,color:'var(--gray-400)' }}>· Grade {lesson.grade_level}</span>}
              {lesson?.duration_minutes && <span style={{ fontSize:12,color:'var(--gray-400)' }}>· {lesson.duration_minutes} min</span>}
            </div>
            <h1 style={{ margin:'0 0 8px',fontSize:'clamp(1.3rem,2.5vw,1.8rem)',fontWeight:800,letterSpacing:'-0.02em',lineHeight:1.2 }}>
              {lesson?.title}
            </h1>
            {lesson?.topic && <p style={{ margin:'0 0 12px',fontSize:14,color:'var(--gray-500)',lineHeight:1.55 }}>{lesson.topic}</p>}
            {pc.overview?.objective && (
              <div style={{ padding:'10px 14px',background:'var(--lavender-soft)',borderRadius:10,fontSize:13,color:'var(--ink)',lineHeight:1.6,border:'1px solid rgba(124,58,237,0.15)' }}>
                <strong>🎯 Objective: </strong>{pc.overview.objective}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex',flexDirection:'column',gap:8,flexShrink:0 }}>
            {canLaunch && (
              <button className="btn primary" onClick={handleLive} disabled={launching} style={{ whiteSpace:'nowrap' }}>
                {launching ? 'Starting…' : '▶ Start Live Mode'}
              </button>
            )}
            {lesson?.status === 'preview' && (
              <button className="btn ghost" onClick={handleApprove} disabled={approving}>
                {approving ? 'Approving…' : '✅ Approve'}
              </button>
            )}
            {lesson?.status === 'draft' && (
              <Link href="/dashboard/lessons/new" className="btn ghost">✨ Generate</Link>
            )}
          </div>
        </div>
      </div>

      {/* ADHD profile */}
      {pc.overview && (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10,marginBottom:20 }}>
          {[
            { label:'ADHD Focus',     value:pc.overview.adhd_focus_type },
            { label:'Learning Style', value:pc.overview.learning_style },
            { label:'Energy Level',   value:pc.overview.energy_level },
            { label:'Grouping',       value:pc.overview.grouping },
          ].filter(r => r.value).map(row => (
            <div key={row.label} style={{ background:'var(--white)',border:'2px solid var(--ink)',borderRadius:12,padding:'12px 16px',boxShadow:'2px 2px 0 var(--lavender-deep)' }}>
              <div style={{ fontSize:11,fontWeight:700,color:'var(--gray-400)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4 }}>{row.label}</div>
              <div style={{ fontWeight:700,fontSize:14,textTransform:'capitalize' }}>{row.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex',flexDirection:'column',gap:16 }}>

        {/* Hook */}
        {pc.hook && (
          <SectionCard title="Opening Hook" icon="🎣" accent="var(--peach)">
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {pc.hook.type && <span style={{ fontSize:12,padding:'2px 10px',background:'var(--lavender-soft)',color:'var(--purple)',borderRadius:20,fontWeight:700,width:'fit-content',textTransform:'capitalize' }}>{pc.hook.type}</span>}
              {pc.hook.description && <p style={{ margin:0,fontSize:14,lineHeight:1.65 }}>{pc.hook.description}</p>}
              {pc.hook.teacher_script && (
                <div style={{ padding:'12px 16px',background:'var(--cream)',borderRadius:10,border:'1.5px solid rgba(11,18,32,0.08)',fontStyle:'italic',fontSize:13,color:'var(--gray-600)',lineHeight:1.65 }}>
                  <strong style={{ color:'var(--ink)',fontStyle:'normal' }}>Script: </strong>"{pc.hook.teacher_script}"
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Segments */}
        {pc.segments?.length > 0 && (
          <SectionCard title={`Lesson Segments (${pc.segments.length})`} icon="📋">
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {pc.segments.map((seg, i) => <SegmentRow key={i} seg={seg} index={i} />)}
            </div>
          </SectionCard>
        )}

        {/* Resources row */}
        {(pc.video_suggestions?.length > 0 || pc.music_suggestion || pc.worksheet) && (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16 }}>
            {pc.video_suggestions?.length > 0 && (
              <SectionCard title="Video Suggestions" icon="🎥" accent="var(--cream)">
                <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                  {pc.video_suggestions.map((v, i) => (
                    <div key={i} style={{ padding:'8px 12px',background:'var(--cream)',borderRadius:8,fontSize:13 }}>
                      <div style={{ fontWeight:700,marginBottom:2 }}>{v.title}</div>
                      <div style={{ color:'var(--gray-400)',fontSize:12 }}>{v.reason}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
            {pc.music_suggestion && (
              <SectionCard title="Background Music" icon="🎵" accent="var(--mint)">
                <div style={{ fontSize:13,lineHeight:1.6 }}>
                  <div style={{ fontWeight:700,marginBottom:4 }}>{pc.music_suggestion.genre}</div>
                  <div style={{ color:'var(--gray-500)' }}>{pc.music_suggestion.reason}</div>
                </div>
              </SectionCard>
            )}
            {pc.worksheet && (
              <SectionCard title="Worksheet" icon="📄" accent="var(--cream)">
                <div style={{ fontSize:13,lineHeight:1.6 }}>
                  {pc.worksheet.title && <div style={{ fontWeight:700,marginBottom:4 }}>{pc.worksheet.title}</div>}
                  {pc.worksheet.instructions && <p style={{ margin:'0 0 8px',color:'var(--gray-600)' }}>{pc.worksheet.instructions}</p>}
                  {pc.worksheet.questions?.length > 0 && (
                    <ul style={{ margin:0,padding:'0 0 0 16px',display:'flex',flexDirection:'column',gap:4 }}>
                      {pc.worksheet.questions.slice(0,3).map((q,i) => <li key={i} style={{ fontSize:12,color:'var(--gray-500)' }}>{q}</li>)}
                      {pc.worksheet.questions.length > 3 && <li style={{ fontSize:12,color:'var(--gray-400)' }}>+ {pc.worksheet.questions.length-3} more…</li>}
                    </ul>
                  )}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {/* Reward moment + Transition cues */}
        {(pc.reward_moment || pc.transition_cues?.length > 0) && (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16 }}>
            {pc.reward_moment && (
              <SectionCard title="Reward Moment" icon="⭐" accent="var(--yellow-soft)">
                <div style={{ fontSize:13,lineHeight:1.6 }}>
                  {pc.reward_moment.type && <div style={{ fontWeight:700,textTransform:'capitalize',marginBottom:4 }}>{pc.reward_moment.type}</div>}
                  {pc.reward_moment.description && <p style={{ margin:0,color:'var(--gray-600)' }}>{pc.reward_moment.description}</p>}
                </div>
              </SectionCard>
            )}
            {pc.transition_cues?.length > 0 && (
              <SectionCard title="Transition Cues" icon="🔔" accent="var(--cream)">
                <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                  {pc.transition_cues.map((cue, i) => (
                    <div key={i} style={{ display:'flex',alignItems:'flex-start',gap:8,fontSize:13 }}>
                      <span style={{ width:20,height:20,borderRadius:'50%',background:'var(--lavender)',display:'grid',placeItems:'center',fontSize:11,fontWeight:700,flexShrink:0 }}>{i+1}</span>
                      <span style={{ lineHeight:1.5 }}>{cue}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        )}

      </div>

      {/* Bottom CTA */}
      {canLaunch && (
        <div style={{ marginTop:24,padding:'20px 24px',background:'linear-gradient(135deg,var(--lavender) 0%,var(--lavender-soft) 100%)',border:'2px solid var(--ink)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap',boxShadow:'4px 4px 0 var(--lavender-deep)' }}>
          <div>
            <div style={{ fontWeight:800,fontSize:'1.05rem',marginBottom:4 }}>Ready to teach?</div>
            <p style={{ margin:0,fontSize:13,color:'var(--gray-600)' }}>Launch Live Mode to present this lesson with ADHD recovery tools built in.</p>
          </div>
          <button className="btn primary" onClick={handleLive} disabled={launching} style={{ whiteSpace:'nowrap' }}>
            {launching ? 'Starting…' : '▶ Start Live Mode'}
          </button>
        </div>
      )}
    </div>
  );
}
