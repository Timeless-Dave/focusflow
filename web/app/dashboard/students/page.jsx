'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@lib/supabase/client';

const ADHD_LABELS = { inattentive: '🌀 Inattentive', hyperactive: '⚡ Hyperactive', combined: '🔄 Combined', unspecified: 'ADHD' };

function AddStudentModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ first_name:'', last_name:'', grade_level:'', adhd_type:'combined', learning_style:'visual', interests:'', parent_email:'', parent_name:'' });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const interests = form.interests.split(',').map(s=>s.trim()).filter(Boolean);
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, interests })
    });
    setSaving(false);
    if (res.ok) { onSaved(await res.json()); onClose(); }
  };

  return (
    <div style={{ position:'fixed',inset:0,zIndex:500,background:'rgba(11,18,32,0.4)',display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'var(--white)',border:'2px solid var(--ink)',borderRadius:18,padding:28,maxWidth:520,width:'100%',boxShadow:'6px 6px 0 var(--lavender-deep)' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
          <h3 style={{ margin:0,fontSize:'1.2rem',fontWeight:800 }}>Add Student</h3>
          <button onClick={onClose} style={{ border:'2px solid var(--ink)',borderRadius:'50%',width:32,height:32,background:'var(--white)',cursor:'pointer',fontSize:18 }}>×</button>
        </div>
        <form onSubmit={handleSave} style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
          {[['first_name','First Name',true],['last_name','Last Name',true]].map(([k,l,r]) => (
            <div key={k} style={{ display:'flex',flexDirection:'column',gap:5 }}>
              <label style={{ fontSize:12,fontWeight:700,color:'var(--gray-500)' }}>{l}{r&&<span style={{color:'var(--purple)'}}> *</span>}</label>
              <input className="input" value={form[k]} onChange={e=>set(k,e.target.value)} required={r} />
            </div>
          ))}
          <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
            <label style={{ fontSize:12,fontWeight:700,color:'var(--gray-500)' }}>Grade Level</label>
            <input className="input" placeholder="e.g. Grade 3" value={form.grade_level} onChange={e=>set('grade_level',e.target.value)} />
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
            <label style={{ fontSize:12,fontWeight:700,color:'var(--gray-500)' }}>ADHD Type</label>
            <select className="input" value={form.adhd_type} onChange={e=>set('adhd_type',e.target.value)} style={{ appearance:'none' }}>
              {Object.entries(ADHD_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:5,gridColumn:'1/-1' }}>
            <label style={{ fontSize:12,fontWeight:700,color:'var(--gray-500)' }}>Interests (comma-separated)</label>
            <input className="input" placeholder="e.g. dinosaurs, space, Minecraft" value={form.interests} onChange={e=>set('interests',e.target.value)} />
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
            <label style={{ fontSize:12,fontWeight:700,color:'var(--gray-500)' }}>Parent Email</label>
            <input className="input" type="email" value={form.parent_email} onChange={e=>set('parent_email',e.target.value)} />
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
            <label style={{ fontSize:12,fontWeight:700,color:'var(--gray-500)' }}>Parent Name</label>
            <input className="input" value={form.parent_name} onChange={e=>set('parent_name',e.target.value)} />
          </div>
          <div style={{ gridColumn:'1/-1',display:'flex',justifyContent:'flex-end',gap:10,marginTop:6 }}>
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Add Student'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('students')
        .select('id, first_name, last_name, grade_level, adhd_type, interests, student_rewards(total_points, badges)')
        .eq('teacher_id', user.id)
        .eq('is_active', true)
        .order('first_name')
        .then(({ data }) => { setStudents(data ?? []); setLoading(false); });
    });
  }, []);

  return (
    <>
      {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} onSaved={s => setStudents(p => [s, ...p])} />}
      <div className="db-page-header">
        <div>
          <h1>Students</h1>
          <p>Manage your students&apos; profiles, interests, and progress.</p>
        </div>
        <button className="btn primary" onClick={() => setShowAdd(true)}>+ Add Student</button>
      </div>

      {loading ? (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16 }}>
          {[1,2,3,4].map(i => <div key={i} className="db-skeleton" style={{ height:120,borderRadius:12 }} />)}
        </div>
      ) : students.length === 0 ? (
        <div className="db-empty">
          <div className="db-empty__icon">👤</div>
          <p>No students yet. Add your first student to build their ADHD profile and track progress.</p>
        </div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16 }}>
          {students.map(s => {
            const initials = `${s.first_name[0]}${s.last_name[0]}`.toUpperCase();
            const pts = s.student_rewards?.[0]?.total_points ?? 0;
            return (
              <div key={s.id} style={{ background:'var(--white)',border:'2px solid var(--ink)',borderRadius:'var(--radius)',padding:18,boxShadow:'3px 3px 0 var(--lavender-deep)',display:'flex',flexDirection:'column',gap:12 }}>
                <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                  <div style={{ width:44,height:44,borderRadius:'50%',border:'2px solid var(--ink)',background:'var(--lavender)',display:'grid',placeItems:'center',fontSize:15,fontWeight:800,flexShrink:0 }}>{initials}</div>
                  <div>
                    <div style={{ fontWeight:800,fontSize:15 }}>{s.first_name} {s.last_name}</div>
                    <div style={{ fontSize:12,color:'var(--gray-400)' }}>Grade {s.grade_level ?? '–'}</div>
                  </div>
                  <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,color:'#d97706' }}>⭐ {pts}</div>
                </div>
                {s.adhd_type && <span className="db-badge db-badge--preview">{ADHD_LABELS[s.adhd_type] ?? s.adhd_type}</span>}
                {s.interests?.length > 0 && (
                  <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                    {s.interests.slice(0,3).map((interest,i) => (
                      <span key={i} style={{ fontSize:11,padding:'2px 8px',border:'1px solid var(--gray-200)',borderRadius:20,background:'var(--cream)',color:'var(--gray-500)',fontWeight:600 }}>
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
