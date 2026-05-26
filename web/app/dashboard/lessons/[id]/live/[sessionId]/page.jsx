'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

const DISRUPTION_TYPES = [
  { value:'attention_loss',   icon:'😶',  label:'Attention Lost' },
  { value:'hyperactivity',    icon:'⚡',  label:'Hyperactivity' },
  { value:'frustration',      icon:'😤',  label:'Frustration' },
  { value:'transition',       icon:'🔄',  label:'Transition' },
  { value:'off_task',         icon:'🌀',  label:'Off Task' },
  { value:'sensory',          icon:'👂',  label:'Sensory Overload' },
];

function RecoveryModal({ onClose, onSubmit, loading, result }) {
  const [type, setType] = useState('');
  const [verbal, setVerbal] = useState('');

  return (
    <div style={{ position:'fixed',inset:0,zIndex:600,background:'rgba(11,18,32,0.55)',display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'var(--white)',border:'2px solid var(--ink)',borderRadius:18,maxWidth:540,width:'100%',boxShadow:'6px 6px 0 var(--lavender-deep)',overflow:'hidden' }}>

        <div style={{ padding:'18px 22px',borderBottom:'2px solid rgba(11,18,32,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'#dc2626',marginBottom:3 }}>Live Recovery</div>
            <h3 style={{ margin:0,fontSize:'1.05rem',fontWeight:800 }}>What&apos;s happening?</h3>
          </div>
          {!loading && !result && (
            <button onClick={onClose} style={{ border:'2px solid var(--ink)',borderRadius:'50%',width:32,height:32,background:'var(--white)',cursor:'pointer',fontSize:18,display:'grid',placeItems:'center' }}>×</button>
          )}
        </div>

        {!result ? (
          <div style={{ padding:22,display:'flex',flexDirection:'column',gap:16 }}>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
              {DISRUPTION_TYPES.map(d => (
                <button
                  key={d.value}
                  onClick={() => setType(d.value)}
                  style={{
                    padding:'12px 10px',border:'2px solid',borderRadius:12,cursor:'pointer',
                    borderColor:type===d.value?'var(--purple)':'var(--gray-200)',
                    background:type===d.value?'var(--lavender)':'var(--white)',
                    display:'flex',flexDirection:'column',alignItems:'center',gap:6,
                    fontSize:12,fontWeight:700,color:type===d.value?'var(--ink)':'var(--gray-500)',
                    transition:'all 0.18s'
                  }}
                >
                  <span style={{ fontSize:22 }}>{d.icon}</span>
                  {d.label}
                </button>
              ))}
            </div>

            <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
              <label style={{ fontSize:12,fontWeight:700,color:'var(--gray-500)' }}>Verbal instruction to convert to steps <span style={{ color:'var(--gray-400)',fontWeight:400 }}>(optional)</span></label>
              <textarea
                className="input"
                style={{ resize:'none',minHeight:72,fontFamily:'inherit',fontSize:13 }}
                placeholder="e.g. Everyone put your materials away, go to your next class, make sure you have your homework…"
                value={verbal}
                onChange={e => setVerbal(e.target.value)}
              />
            </div>

            <div style={{ display:'flex',justifyContent:'flex-end',gap:10 }}>
              <button className="btn ghost" onClick={onClose}>Cancel</button>
              <button className="btn primary" onClick={() => onSubmit(type, verbal)} disabled={!type || loading}>
                {loading ? (
                  <span style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{ width:14,height:14,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',animation:'spin 1s linear infinite',display:'inline-block' }} />
                    Generating…
                  </span>
                ) : '🧠 Get Recovery Strategy'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding:22,display:'flex',flexDirection:'column',gap:14 }}>
            {/* Strategy result */}
            <div style={{ padding:'14px 18px',background:'var(--lavender-soft)',border:'1.5px solid rgba(124,58,237,0.2)',borderRadius:12 }}>
              <div style={{ fontWeight:800,fontSize:'1rem',marginBottom:6 }}>{result.strategy_title}</div>
              <div style={{ fontSize:13,color:'var(--ink)',lineHeight:1.6,marginBottom:8 }}>{result.immediate_action}</div>
              {result.estimated_recovery_minutes && (
                <span style={{ fontSize:11,padding:'2px 9px',background:'var(--lavender)',borderRadius:20,fontWeight:700,color:'#4c1d95' }}>
                  ⏱ ~{result.estimated_recovery_minutes} min to recover
                </span>
              )}
            </div>

            {result.teacher_script && (
              <div style={{ padding:'12px 16px',background:'var(--cream)',border:'1.5px solid rgba(11,18,32,0.08)',borderRadius:12,fontSize:13,fontStyle:'italic',color:'var(--gray-600)',lineHeight:1.65 }}>
                <strong style={{ color:'var(--ink)',fontStyle:'normal',display:'block',marginBottom:4 }}>📢 Say this:</strong>
                "{result.teacher_script}"
              </div>
            )}

            {result.board_message && (
              <div style={{ padding:'12px 16px',background:'var(--mint)',border:'1.5px solid rgba(6,95,70,0.2)',borderRadius:12,fontSize:13,fontWeight:700,color:'#065f46',lineHeight:1.55 }}>
                <strong style={{ display:'block',marginBottom:4 }}>🖊 Write on Board:</strong>
                {result.board_message}
              </div>
            )}

            {/* Verbal-to-steps result */}
            {result.verbal_steps?.steps?.length > 0 && (
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                <div style={{ fontSize:12,fontWeight:700,color:'var(--gray-500)' }}>
                  Visual Steps — write these on the board
                </div>
                {result.verbal_steps.steps.map((step, i) => (
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 13px',background:'var(--white)',border:'1.5px solid rgba(11,18,32,0.1)',borderRadius:10,fontSize:13,fontWeight:600 }}>
                    <span style={{ width:24,height:24,borderRadius:'50%',background:'var(--lavender)',border:'1.5px solid var(--purple)',display:'grid',placeItems:'center',fontSize:12,fontWeight:800,flexShrink:0 }}>{i+1}</span>
                    {step}
                  </div>
                ))}
              </div>
            )}

            <button className="btn primary" onClick={onClose} style={{ alignSelf:'flex-end' }}>
              ✅ Got it — resume lesson
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function EndSessionModal({ onClose, onEnd }) {
  const [saving, setSaving] = useState(false);
  const handleEnd = async () => {
    setSaving(true);
    await onEnd();
  };

  return (
    <div style={{ position:'fixed',inset:0,zIndex:600,background:'rgba(11,18,32,0.55)',display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'var(--white)',border:'2px solid var(--ink)',borderRadius:18,maxWidth:420,width:'100%',boxShadow:'6px 6px 0 var(--lavender-deep)',padding:28 }}>
        <h3 style={{ margin:'0 0 10px',fontSize:'1.1rem',fontWeight:800 }}>End Session?</h3>
        <p style={{ margin:'0 0 20px',fontSize:14,color:'var(--gray-500)',lineHeight:1.6 }}>
          FocusFlow will generate an AI summary of this session — what went well, disruptions, and suggested follow-ups.
        </p>
        <div style={{ display:'flex',justifyContent:'flex-end',gap:10 }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleEnd} disabled={saving} style={{ background:'#dc2626',borderColor:'#dc2626' }}>
            {saving ? 'Ending…' : '🔴 End & Generate Summary'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LiveModePage() {
  const { id, sessionId } = useParams();
  const router = useRouter();

  const [session, setSession]   = useState(null);
  const [lesson, setLesson]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showEnd, setShowEnd]   = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState(null);
  const [elapsed, setElapsed]   = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!sessionId || !id) return;
    Promise.all([
      fetch(`/api/sessions/${sessionId}`).then(r => r.json()),
      fetch(`/api/lessons/${id}`).then(r => r.json()),
    ]).then(([sess, les]) => {
      setSession(sess);
      setLesson(les);
      setSlideIndex(sess.current_slide_index ?? 0);
      setLoading(false);
    });
  }, [sessionId, id]);

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const navigate = useCallback(async (direction) => {
    const slides = lesson?.live_content?.slides ?? lesson?.preview_content?.live_slides ?? [];
    const next = direction === 'next'
      ? Math.min(slideIndex + 1, slides.length - 1)
      : Math.max(slideIndex - 1, 0);
    setSlideIndex(next);
    await fetch(`/api/sessions/${sessionId}/slide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction, index: next }),
    });
  }, [slideIndex, lesson, sessionId]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') navigate('next');
      if (e.key === 'ArrowLeft') navigate('prev');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  const handleRecovery = async (disruptionType, verbalInstruction) => {
    setRecovering(true);
    const res = await fetch(`/api/sessions/${sessionId}/recovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disruption_type: disruptionType, verbal_instruction: verbalInstruction }),
    });
    if (res.ok) {
      const data = await res.json();
      setRecoveryResult(data);
    }
    setRecovering(false);
  };

  const handleEndSession = async () => {
    await fetch(`/api/sessions/${sessionId}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student_responses: [] }) });
    router.push(`/dashboard/lessons/${id}`);
  };

  if (loading) {
    return (
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:20 }}>
        <div style={{ width:48,height:48,borderRadius:'50%',border:'3px solid var(--lavender-deep)',borderTopColor:'var(--purple)',animation:'spin 1s linear infinite' }} />
        <div style={{ fontWeight:700 }}>Loading Live Mode…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const slides = lesson?.live_content?.slides ?? lesson?.preview_content?.live_slides ?? [];
  const currentSlide = slides[slideIndex] ?? null;
  const totalSlides = slides.length;
  const disruptionCount = session?.disruptions?.length ?? 0;

  return (
    <div style={{ position:'fixed',inset:0,background:'#0b1220',display:'flex',flexDirection:'column',zIndex:200,color:'#fff' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-live { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>

      {showRecovery && (
        <RecoveryModal
          onClose={() => { setShowRecovery(false); setRecoveryResult(null); }}
          onSubmit={handleRecovery}
          loading={recovering}
          result={recoveryResult}
        />
      )}
      {showEnd && (
        <EndSessionModal
          onClose={() => setShowEnd(false)}
          onEnd={handleEndSession}
        />
      )}

      {/* Top bar */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 20px',borderBottom:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',flexShrink:0,flexWrap:'wrap',gap:10 }}>
        <div style={{ display:'flex',alignItems:'center',gap:14 }}>
          <div style={{ display:'flex',alignItems:'center',gap:6 }}>
            <span style={{ width:8,height:8,borderRadius:'50%',background:'#ef4444',display:'block',animation:'pulse-live 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize:12,fontWeight:700,color:'#ef4444',textTransform:'uppercase',letterSpacing:'0.08em' }}>Live</span>
          </div>
          <div style={{ width:1,height:20,background:'rgba(255,255,255,0.15)' }} />
          <span style={{ fontSize:14,fontWeight:600,color:'rgba(255,255,255,0.8)',maxWidth:260,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{lesson?.title}</span>
        </div>

        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ fontSize:13,fontWeight:700,fontVariantNumeric:'tabular-nums',color:'rgba(255,255,255,0.6)' }}>
            {formatTime(elapsed)}
          </div>
          {totalSlides > 0 && (
            <div style={{ fontSize:13,color:'rgba(255,255,255,0.5)' }}>{slideIndex + 1} / {totalSlides}</div>
          )}
          <button
            onClick={() => setShowRecovery(true)}
            style={{ padding:'7px 14px',borderRadius:8,border:'1.5px solid rgba(239,68,68,0.5)',background:'rgba(239,68,68,0.12)',color:'#fca5a5',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all 0.18s' }}
          >
            🆘 Recovery
          </button>
          <button
            onClick={() => setShowEnd(true)}
            style={{ padding:'7px 14px',borderRadius:8,border:'1.5px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.6)',fontSize:13,fontWeight:700,cursor:'pointer' }}
          >
            End Session
          </button>
        </div>
      </div>

      {/* Main slide area */}
      <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',overflow:'hidden' }}>
        {currentSlide ? (
          <div style={{ maxWidth:780,width:'100%',animation:'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
            <style>{`@keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: none; } }`}</style>

            {/* Slide type pill */}
            {currentSlide.type && (
              <div style={{ marginBottom:16,display:'flex',alignItems:'center',gap:10 }}>
                <span style={{ fontSize:11,padding:'3px 12px',borderRadius:20,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',background:'rgba(124,58,237,0.25)',color:'#c4b5fd' }}>
                  {currentSlide.type}
                </span>
                {currentSlide.duration_minutes && (
                  <span style={{ fontSize:12,color:'rgba(255,255,255,0.4)' }}>⏱ {currentSlide.duration_minutes} min</span>
                )}
              </div>
            )}

            {/* Main content */}
            <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.8rem)',fontWeight:800,letterSpacing:'-0.03em',lineHeight:1.15,marginBottom:20,color:'#fff' }}>
              {currentSlide.headline ?? currentSlide.title ?? `Slide ${slideIndex + 1}`}
            </h2>

            {currentSlide.content && (
              <p style={{ fontSize:'clamp(1rem,2vw,1.25rem)',color:'rgba(255,255,255,0.72)',lineHeight:1.65,marginBottom:24,maxWidth:640 }}>
                {currentSlide.content}
              </p>
            )}

            {/* Bullet points */}
            {currentSlide.points?.length > 0 && (
              <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:24 }}>
                {currentSlide.points.map((pt, i) => (
                  <div key={i} style={{ display:'flex',alignItems:'flex-start',gap:12,fontSize:'clamp(0.9rem,1.8vw,1.1rem)',color:'rgba(255,255,255,0.8)' }}>
                    <span style={{ width:28,height:28,borderRadius:'50%',background:'rgba(124,58,237,0.35)',border:'1.5px solid rgba(124,58,237,0.6)',display:'grid',placeItems:'center',fontSize:13,fontWeight:800,flexShrink:0,marginTop:2 }}>{i+1}</span>
                    <span style={{ lineHeight:1.55 }}>{pt}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Teacher note */}
            {currentSlide.teacher_note && (
              <div style={{ padding:'12px 16px',borderLeft:'3px solid rgba(124,58,237,0.6)',background:'rgba(124,58,237,0.1)',borderRadius:'0 10px 10px 0',fontSize:13,color:'rgba(255,255,255,0.6)',lineHeight:1.6,marginBottom:20 }}>
                <span style={{ fontWeight:700,color:'rgba(196,181,253,0.9)' }}>Teacher note: </span>
                {currentSlide.teacher_note}
              </div>
            )}

            {/* ADHD support note */}
            {currentSlide.adhd_support && (
              <div style={{ padding:'10px 14px',background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.3)',borderRadius:10,fontSize:13,color:'#6ee7b7',lineHeight:1.6 }}>
                🧠 {currentSlide.adhd_support}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign:'center',opacity:0.5 }}>
            <div style={{ fontSize:48,marginBottom:16 }}>📋</div>
            <div style={{ fontSize:18,fontWeight:600 }}>No slide content available</div>
            <div style={{ fontSize:13,marginTop:8 }}>Use the lesson preview to view generated content</div>
          </div>
        )}
      </div>

      {/* Bottom nav bar */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 24px',borderTop:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.03)',flexShrink:0,flexWrap:'wrap',gap:12 }}>

        {/* Progress + disruption count */}
        <div style={{ display:'flex',alignItems:'center',gap:16 }}>
          {totalSlides > 0 && (
            <div style={{ display:'flex',gap:4,alignItems:'center' }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={async () => {
                    setSlideIndex(i);
                    await fetch(`/api/sessions/${sessionId}/slide`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ direction:'jump', index:i }) });
                  }}
                  style={{ width: i === slideIndex ? 20 : 8, height:8, borderRadius:20, background: i === slideIndex ? 'var(--purple)' : i < slideIndex ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', transition:'all 0.25s', padding:0 }}
                />
              ))}
            </div>
          )}
          {disruptionCount > 0 && (
            <span style={{ fontSize:12,color:'rgba(252,165,165,0.8)',fontWeight:600 }}>
              🆘 {disruptionCount} disruption{disruptionCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Prev / Next */}
        <div style={{ display:'flex',gap:10 }}>
          <button
            onClick={() => navigate('prev')}
            disabled={slideIndex === 0}
            style={{ padding:'9px 20px',borderRadius:10,border:'1.5px solid rgba(255,255,255,0.15)',background:slideIndex===0?'transparent':'rgba(255,255,255,0.08)',color:slideIndex===0?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.8)',fontSize:14,fontWeight:700,cursor:slideIndex===0?'not-allowed':'pointer',transition:'all 0.18s' }}
          >
            ← Prev
          </button>
          <button
            onClick={() => navigate('next')}
            disabled={slideIndex === totalSlides - 1}
            style={{ padding:'9px 20px',borderRadius:10,border:'1.5px solid',borderColor:slideIndex===totalSlides-1?'rgba(255,255,255,0.1)':'var(--purple)',background:slideIndex===totalSlides-1?'transparent':'var(--purple)',color:slideIndex===totalSlides-1?'rgba(255,255,255,0.25)':'#fff',fontSize:14,fontWeight:700,cursor:slideIndex===totalSlides-1?'not-allowed':'pointer',transition:'all 0.18s' }}
          >
            Next → {totalSlides > 0 && slideIndex < totalSlides - 1 && <span style={{ opacity:0.6,fontSize:12 }}>{String(slideIndex+2)}/{totalSlides}</span>}
          </button>
        </div>

        <div style={{ fontSize:12,color:'rgba(255,255,255,0.3)' }}>
          ← → or Space to navigate
        </div>
      </div>
    </div>
  );
}
