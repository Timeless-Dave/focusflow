'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@lib/supabase/client';

const CATEGORY_ICONS = {
  focus:          '🎯',
  transitions:    '🔄',
  communication:  '💬',
  engagement:     '⚡',
  instructions:   '📋',
  behavior:       '🌱',
};

const DIFFICULTY_COLORS = {
  beginner:     { bg: 'var(--mint)',        color: '#065f46' },
  intermediate: { bg: 'var(--lavender)',    color: '#4c1d95' },
  advanced:     { bg: 'var(--peach)',       color: '#92400e' },
};

function ModuleCard({ module, progress, onComplete }) {
  const [expanded, setExpanded] = useState(false);
  const [completing, setCompleting] = useState(false);
  const isCompleted = !!progress;
  const diff = DIFFICULTY_COLORS[module.difficulty] ?? DIFFICULTY_COLORS.beginner;
  const icon = CATEGORY_ICONS[module.category] ?? '📚';

  const handleComplete = async (e) => {
    e.stopPropagation();
    setCompleting(true);
    await fetch(`/api/training/${module.id}/complete`, { method: 'POST' });
    setCompleting(false);
    onComplete(module.id);
  };

  return (
    <div
      style={{
        background:'var(--white)',border:'2px solid var(--ink)',borderRadius:16,overflow:'hidden',
        boxShadow: isCompleted ? '3px 3px 0 #6ee7b7' : '3px 3px 0 var(--lavender-deep)',
        transition:'box-shadow 0.2s',
      }}
    >
      {/* Card header */}
      <div
        style={{ padding:'18px 20px',cursor:'pointer',display:'flex',alignItems:'flex-start',gap:14 }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ width:48,height:48,borderRadius:12,border:'2px solid var(--ink)',background:isCompleted?'var(--mint)':'var(--lavender-soft)',display:'grid',placeItems:'center',fontSize:22,flexShrink:0 }}>
          {isCompleted ? '✅' : icon}
        </div>

        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4 }}>
            <h3 style={{ margin:0,fontSize:'0.95rem',fontWeight:800,lineHeight:1.3 }}>{module.title}</h3>
            {isCompleted && (
              <span style={{ fontSize:10,padding:'2px 8px',borderRadius:20,background:'var(--mint)',color:'#065f46',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em' }}>Completed</span>
            )}
          </div>
          <p style={{ margin:'0 0 8px',fontSize:12,color:'var(--gray-500)',lineHeight:1.5 }}>{module.description}</p>
          <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
            <span style={{ fontSize:11,padding:'2px 9px',borderRadius:20,background:diff.bg,color:diff.color,fontWeight:700 }}>{module.difficulty}</span>
            {module.category && (
              <span style={{ fontSize:11,color:'var(--gray-400)',fontWeight:600 }}>{icon} {module.category}</span>
            )}
            {module.points_value > 0 && (
              <span style={{ fontSize:11,color:'#d97706',fontWeight:700 }}>⭐ {module.points_value} pts</span>
            )}
            {module.estimated_minutes && (
              <span style={{ fontSize:11,color:'var(--gray-400)' }}>⏱ {module.estimated_minutes} min</span>
            )}
          </div>
        </div>

        <span style={{ fontSize:13,color:'var(--gray-400)',transition:'transform 0.2s',display:'inline-block',transform:expanded?'rotate(180deg)':'none',flexShrink:0,marginTop:4 }}>▾</span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop:'1.5px solid rgba(11,18,32,0.08)',padding:'18px 20px',display:'flex',flexDirection:'column',gap:16 }}>

          {/* Content sections */}
          {module.content?.objectives?.length > 0 && (
            <div>
              <div style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--purple)',marginBottom:8 }}>Learning Objectives</div>
              <ul style={{ margin:0,padding:'0 0 0 18px',display:'flex',flexDirection:'column',gap:5 }}>
                {module.content.objectives.map((obj, i) => (
                  <li key={i} style={{ fontSize:13,color:'var(--ink)',lineHeight:1.55 }}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {module.content?.key_points?.length > 0 && (
            <div>
              <div style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--purple)',marginBottom:8 }}>Key Points</div>
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                {module.content.key_points.map((pt, i) => (
                  <div key={i} style={{ display:'flex',alignItems:'flex-start',gap:10,padding:'10px 13px',background:'var(--cream)',borderRadius:10,border:'1px solid rgba(11,18,32,0.07)',fontSize:13 }}>
                    <span style={{ width:22,height:22,borderRadius:'50%',background:'var(--lavender)',border:'1.5px solid var(--purple)',display:'grid',placeItems:'center',fontSize:11,fontWeight:700,flexShrink:0 }}>{i+1}</span>
                    <span style={{ lineHeight:1.55 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {module.content?.strategies?.length > 0 && (
            <div>
              <div style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--purple)',marginBottom:8 }}>Classroom Strategies</div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8 }}>
                {module.content.strategies.map((s, i) => (
                  <div key={i} style={{ padding:'10px 13px',background:'var(--lavender-soft)',borderRadius:10,border:'1px solid rgba(124,58,237,0.15)',fontSize:12,fontWeight:600,lineHeight:1.45,color:'var(--ink)' }}>
                    💡 {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {module.content?.reflection_prompts?.length > 0 && (
            <div>
              <div style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--purple)',marginBottom:8 }}>Reflection Prompts</div>
              {module.content.reflection_prompts.map((p, i) => (
                <div key={i} style={{ fontSize:13,color:'var(--gray-600)',fontStyle:'italic',padding:'8px 14px',borderLeft:'3px solid var(--lavender-deep)',marginBottom:6,lineHeight:1.55 }}>
                  "{p}"
                </div>
              ))}
            </div>
          )}

          {!isCompleted && (
            <button
              className="btn primary"
              onClick={handleComplete}
              disabled={completing}
              style={{ alignSelf:'flex-start' }}
            >
              {completing ? 'Saving…' : `✅ Mark Complete (+${module.points_value ?? 10} pts)`}
            </button>
          )}

          {isCompleted && progress?.completed_at && (
            <div style={{ fontSize:12,color:'#065f46',fontWeight:600 }}>
              Completed on {new Date(progress.completed_at).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrainingPage() {
  const [modules, setModules]   = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [modRes, progRes] = await Promise.all([
        supabase.from('training_modules').select('*').eq('is_published', true).order('order_index'),
        supabase.from('teacher_training_progress').select('*').eq('teacher_id', user.id),
      ]);
      setModules(modRes.data ?? []);
      const progMap = {};
      (progRes.data ?? []).forEach(p => { progMap[p.module_id] = p; });
      setProgress(progMap);
      setLoading(false);
    });
  }, []);

  const handleComplete = (moduleId) => {
    setProgress(prev => ({ ...prev, [moduleId]: { module_id: moduleId, completed_at: new Date().toISOString() } }));
  };

  const categories = ['all', ...new Set(modules.map(m => m.category).filter(Boolean))];
  const filtered = filter === 'all' ? modules : modules.filter(m => m.category === filter);
  const completedCount = Object.keys(progress).length;
  const totalPoints = Object.keys(progress).reduce((sum, id) => {
    const mod = modules.find(m => m.id === id);
    return sum + (mod?.points_value ?? 0);
  }, 0);

  return (
    <>
      <div className="db-page-header">
        <div>
          <h1>ADHD Training</h1>
          <p>Evidence-based strategies to support your students with ADHD.</p>
        </div>
        <div style={{ display:'flex',gap:10,alignItems:'center' }}>
          <div style={{ background:'var(--white)',border:'2px solid var(--ink)',borderRadius:10,padding:'8px 14px',fontSize:13,fontWeight:700,boxShadow:'2px 2px 0 var(--lavender-deep)' }}>
            ⭐ {totalPoints} pts earned
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {!loading && modules.length > 0 && (
        <div style={{ background:'var(--white)',border:'2px solid var(--ink)',borderRadius:14,padding:'16px 20px',marginBottom:20,boxShadow:'3px 3px 0 var(--lavender-deep)' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
            <div style={{ fontWeight:700,fontSize:14 }}>Your Progress</div>
            <div style={{ fontSize:13,color:'var(--gray-500)' }}>{completedCount} / {modules.length} modules</div>
          </div>
          <div style={{ height:10,background:'var(--gray-100)',borderRadius:20,overflow:'hidden',border:'1.5px solid rgba(11,18,32,0.08)' }}>
            <div style={{ height:'100%',background:'linear-gradient(90deg,var(--purple),var(--lavender-deep))',borderRadius:20,width:`${modules.length?Math.round(completedCount/modules.length*100):0}%`,transition:'width 0.6s cubic-bezier(0.22,1,0.36,1)' }} />
          </div>
        </div>
      )}

      {/* Category filter */}
      {!loading && (
        <div style={{ display:'flex',flexWrap:'wrap',gap:8,marginBottom:20 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding:'6px 14px',border:'2px solid',borderColor:filter===cat?'var(--purple)':'var(--gray-200)',
                borderRadius:20,fontSize:12,fontWeight:700,cursor:'pointer',
                background:filter===cat?'var(--lavender)':'var(--white)',
                color:filter===cat?'var(--ink)':'var(--gray-500)',
                transition:'all 0.18s',textTransform:'capitalize'
              }}
            >
              {cat === 'all' ? '📚 All' : `${CATEGORY_ICONS[cat] ?? '📗'} ${cat}`}
            </button>
          ))}
        </div>
      )}

      {/* Module list */}
      {loading ? (
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {[1,2,3,4].map(i => <div key={i} className="db-skeleton" style={{ height:100,borderRadius:16 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="db-empty">
          <div className="db-empty__icon">📚</div>
          <p>No training modules available yet. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:14 }}>
          {filtered.map(mod => (
            <ModuleCard
              key={mod.id}
              module={mod}
              progress={progress[mod.id] ?? null}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </>
  );
}
