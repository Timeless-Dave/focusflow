'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@lib/supabase/client';

/* ── SVG icons ── */
const Ico = {
  Mail:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Chevron: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Send:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Spark: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Draft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
};

const TONE_OPTIONS = [
  { value:'warm',        label:'Warm & Encouraging',  color:'#f59e0b' },
  { value:'informative', label:'Clear & Informative',  color:'#3b82f6' },
  { value:'urgent',      label:'Needs Attention',      color:'#ef4444' },
  { value:'celebratory', label:'Celebrating Progress', color:'#10b981' },
];

/* ── Compose modal ── */
function ComposeModal({ students, onClose, onSent }) {
  const [form, setForm] = useState({ student_id:'', observation:'', tone:'warm', send_email:false });
  const [step, setStep] = useState('form');
  const [draft, setDraft] = useState(null);
  const [sending, setSending] = useState(false);
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const handleGenerate = async (e) => {
    e.preventDefault();
    setStep('generating');
    const res = await fetch('/api/parents/messages', {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) { setDraft(await res.json()); setStep('preview'); }
    else setStep('form');
  };

  const selectedStudent = students.find(s => s.id===form.student_id);
  const selectedTone    = TONE_OPTIONS.find(t => t.value===form.tone);

  return (
    <div style={{ position:'fixed',inset:0,zIndex:600,background:'rgba(11,18,32,0.45)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px' }}>
      <div style={{ background:'var(--white)',border:'2px solid var(--ink)',borderRadius:20,maxWidth:580,width:'100%',boxShadow:'6px 6px 0 var(--lavender-deep)',overflow:'hidden',maxHeight:'90vh',display:'flex',flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'18px 24px 16px',borderBottom:'2px solid rgba(11,18,32,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div>
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:'0.09em',textTransform:'uppercase',color:'var(--purple)',marginBottom:3 }}>
              {step==='form'?'AI-Powered':step==='generating'?'Generating…':'Review Draft'}
            </div>
            <h3 style={{ margin:0,fontSize:'1.1rem',fontWeight:800 }}>Family Hub Message</h3>
          </div>
          {step!=='generating' && (
            <button onClick={onClose} style={{ border:'2px solid var(--ink)',borderRadius:'50%',width:32,height:32,background:'var(--white)',cursor:'pointer',fontSize:17,display:'grid',placeItems:'center',lineHeight:1 }}>×</button>
          )}
        </div>

        <div style={{ overflowY:'auto',flex:1 }}>
          {/* Form */}
          {step==='form' && (
            <form onSubmit={handleGenerate} style={{ padding:24,display:'flex',flexDirection:'column',gap:18 }}>
              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                <label style={{ fontSize:12,fontWeight:700,color:'var(--gray-500)' }}>Student <span style={{color:'var(--purple)'}}>*</span></label>
                <select className="input" value={form.student_id} onChange={e=>set('student_id',e.target.value)} required style={{ appearance:'none' }}>
                  <option value="">Select a student…</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
              </div>

              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                <label style={{ fontSize:12,fontWeight:700,color:'var(--gray-500)' }}>
                  What happened today? <span style={{color:'var(--purple)'}}>*</span>
                </label>
                <textarea className="input" style={{ resize:'vertical',minHeight:90,fontFamily:'inherit',lineHeight:1.6 }}
                  placeholder="e.g. Jamie struggled with transitions but showed great creativity during art…"
                  value={form.observation} onChange={e=>set('observation',e.target.value)} required />
                <p style={{ margin:0,fontSize:11,color:'var(--gray-400)' }}>AI always leads with something positive before sharing concerns.</p>
              </div>

              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                <label style={{ fontSize:12,fontWeight:700,color:'var(--gray-500)' }}>Tone</label>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                  {TONE_OPTIONS.map(t => (
                    <button key={t.value} type="button" onClick={()=>set('tone',t.value)}
                      style={{
                        padding:'10px 12px',border:'2px solid',
                        borderColor:form.tone===t.value?t.color:'var(--gray-200)',
                        borderRadius:12,fontSize:13,fontWeight:600,cursor:'pointer',textAlign:'left',
                        background:form.tone===t.value?t.color+'18':'var(--white)',
                        color:form.tone===t.value?t.color:'var(--gray-500)',
                        transition:'all 0.18s',fontFamily:'inherit',
                      }}
                    >{t.label}</button>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex',justifyContent:'flex-end',gap:10,paddingTop:4 }}>
                <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn primary" disabled={!form.student_id||!form.observation}
                  style={{ display:'flex',alignItems:'center',gap:6 }}
                ><Ico.Spark /> Generate Message</button>
              </div>
            </form>
          )}

          {/* Generating */}
          {step==='generating' && (
            <div style={{ padding:'52px 24px',display:'flex',flexDirection:'column',alignItems:'center',gap:20,textAlign:'center' }}>
              <div style={{ width:56,height:56,borderRadius:'50%',border:'3px solid var(--lavender-deep)',borderTopColor:'var(--purple)',animation:'spin 1.1s linear infinite' }} />
              <div>
                <div style={{ fontWeight:800,fontSize:'1.05rem',marginBottom:6 }}>Crafting your message…</div>
                <p style={{ margin:0,fontSize:13,color:'var(--gray-400)',maxWidth:280 }}>Writing a positive, practical message tailored to {selectedStudent?.first_name ?? 'this student'}.</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {step==='preview' && draft && (
            <div style={{ padding:24,display:'flex',flexDirection:'column',gap:16 }}>
              <div style={{ background:'var(--lavender-soft)',border:'1.5px solid rgba(124,58,237,0.2)',borderRadius:12,padding:14 }}>
                <div style={{ fontSize:10,fontWeight:700,color:'var(--purple)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:5 }}>Subject</div>
                <div style={{ fontWeight:700,fontSize:14 }}>{draft.subject_line}</div>
              </div>

              {selectedTone && (
                <div style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:20,background:selectedTone.color+'18',border:`1.5px solid ${selectedTone.color}44`,fontSize:12,fontWeight:700,color:selectedTone.color,width:'fit-content' }}>
                  {selectedTone.label}
                </div>
              )}

              <div style={{ border:'2px solid var(--ink)',borderRadius:12,overflow:'hidden' }}>
                <div style={{ padding:'10px 16px',background:'var(--cream)',borderBottom:'1.5px solid rgba(11,18,32,0.08)',fontSize:12,fontWeight:700,color:'var(--gray-500)' }}>Message Preview</div>
                <div style={{ padding:16,fontSize:14,lineHeight:1.75,whiteSpace:'pre-wrap',color:'var(--ink)' }}>{draft.full_message}</div>
              </div>

              {draft.practical_steps?.length>0 && (
                <div>
                  <div style={{ fontSize:12,fontWeight:700,color:'var(--gray-500)',marginBottom:10 }}>Action Steps for Parents</div>
                  <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                    {draft.practical_steps.map((step,i) => (
                      <div key={i} style={{ display:'flex',alignItems:'flex-start',gap:10,fontSize:13 }}>
                        <div style={{ width:22,height:22,borderRadius:'50%',background:'var(--lavender)',border:'1.5px solid var(--purple)',display:'grid',placeItems:'center',fontSize:11,fontWeight:800,flexShrink:0,color:'var(--purple)' }}>{i+1}</div>
                        <span style={{ lineHeight:1.6,paddingTop:2 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display:'flex',justifyContent:'space-between',gap:10,paddingTop:4 }}>
                <button className="btn ghost" onClick={()=>setStep('form')}>← Edit</button>
                <div style={{ display:'flex',gap:10 }}>
                  <button className="btn ghost" onClick={()=>{ onSent({...draft,status:'draft',created_at:new Date().toISOString()}); onClose(); }}>Save Draft</button>
                  <button className="btn primary" disabled={sending} onClick={()=>{ setSending(true); onSent({...draft,status:'sent',created_at:new Date().toISOString()}); onClose(); }}
                    style={{ display:'flex',alignItems:'center',gap:6 }}
                  ><Ico.Send /> {sending?'Sending…':'Send to Parent'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── Message card ── */
function MessageCard({ msg }) {
  const [open, setOpen] = useState(false);
  const STATUS = {
    draft: { cls: 'fh-badge--draft', label: 'Draft' },
    sent:  { cls: 'fh-badge--sent',  label: 'Sent'  },
    read:  { cls: 'fh-badge--read',  label: 'Read'  },
  };
  const s = STATUS[msg.status] ?? STATUS.draft;
  const name = msg.students ? `${msg.students.first_name} ${msg.students.last_name}` : 'Unknown';
  const init = msg.students ? `${msg.students.first_name?.[0] ?? ''}${msg.students.last_name?.[0] ?? ''}` : '?';

  return (
    <article className="fh-message">
      <div className="fh-message__row" onClick={() => setOpen(o => !o)}>
        <div className="fh-message__avatar">{init}</div>
        <div className="fh-message__meta">
          <div className="fh-message__name">{name}</div>
          <div className="fh-message__subject">{msg.subject_line || msg.subject || 'No subject'}</div>
        </div>
        <div className="fh-message__side">
          <span className={`fh-badge ${s.cls}`}>{s.label}</span>
          <span className="fh-message__date">
            {new Date(msg.created_at || msg.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <span style={{ color: 'var(--gray-400)', display: 'grid', placeItems: 'center', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <Ico.Chevron />
          </span>
        </div>
      </div>
      {open && (
        <div className="fh-message__body">
          {msg.full_message || msg.content || msg.core_observation || 'No message content.'}
          {msg.practical_steps?.length > 0 && (
            <div className="fh-steps">
              <div className="fh-steps__title">Action Steps for Parents</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {msg.practical_steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
                    <span style={{ color: 'var(--purple)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ── Main page ── */
export default function FamilyHubPage() {
  const [messages, setMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [msgRes, stuRes] = await Promise.all([
        supabase.from('parent_messages').select('*, students(first_name, last_name)').eq('teacher_id', user.id).order('created_at', { ascending:false }).limit(50),
        supabase.from('students').select('id, first_name, last_name').eq('teacher_id', user.id).eq('is_active', true).order('first_name'),
      ]);
      setMessages(msgRes.data ?? []);
      setStudents(stuRes.data ?? []);
      setLoading(false);
    });
  }, []);

  const handleSent = (draft) => setMessages(prev => [draft, ...prev]);

  const sentCount  = messages.filter(m => m.status==='sent'||m.status==='read').length;
  const draftCount = messages.filter(m => m.status==='draft').length;

  const filtered = tab==='all' ? messages : messages.filter(m => m.status===tab || (tab==='sent' && m.status==='read'));

  const TAB = (value, label, count) => (
    <button type="button" onClick={() => setTab(value)} className={`fh-tab${tab === value ? ' fh-tab--active' : ''}`}>
      {label}
      {count > 0 && <span className="fh-tab__count">{count}</span>}
    </button>
  );

  return (
    <>
      {showCompose && <ComposeModal students={students} onClose={() => setShowCompose(false)} onSent={handleSent} />}

      <div className="db-page-header">
        <div>
          <h1>Family Hub</h1>
          <p>Send positive, practical messages that help families support their child at home.</p>
        </div>
        <button className="btn primary" onClick={() => setShowCompose(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ico.Spark /> New Message
        </button>
      </div>

      <div className="fh-stats">
        <div className="fh-stat">
          <div className="fh-stat__icon" style={{ background: 'var(--lavender-soft)' }}><Ico.Send /></div>
          <div>
            <div className="fh-stat__value">{loading ? '–' : sentCount}</div>
            <div className="fh-stat__label">Messages sent</div>
          </div>
        </div>
        <div className="fh-stat">
          <div className="fh-stat__icon" style={{ background: 'var(--peach)' }}><Ico.Draft /></div>
          <div>
            <div className="fh-stat__value">{loading ? '–' : draftCount}</div>
            <div className="fh-stat__label">Drafts saved</div>
          </div>
        </div>
        <div className="fh-stat">
          <div className="fh-stat__icon" style={{ background: 'var(--mint)' }}><Ico.Users /></div>
          <div>
            <div className="fh-stat__value">{loading ? '–' : students.length}</div>
            <div className="fh-stat__label">Students in roster</div>
          </div>
        </div>
      </div>

      <div className="fh-layout">
        <aside className="fh-aside">
          <div className="fh-aside-card">
            <h3>Write with AI</h3>
            <p>Describe what happened in class — FocusFlow drafts a warm, practical message with home strategies.</p>
            <button className="btn primary full" type="button" onClick={() => setShowCompose(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Ico.Spark /> Compose Message
            </button>
          </div>
          <div className="fh-aside-card" style={{ background: 'var(--lavender-soft)' }}>
            <h3>FocusFlow difference</h3>
            <ul>
              <li>Lead with something positive first</li>
              <li>Include practical next steps at home</li>
              <li>Keep tone warm, clear, and actionable</li>
            </ul>
          </div>
        </aside>

        <section className="fh-main">
          <div className="fh-main__head">
            <strong style={{ fontSize: 14 }}>Messages</strong>
            <div className="fh-tabs">
              {TAB('all', 'All', messages.length)}
              {TAB('sent', 'Sent', sentCount)}
              {TAB('draft', 'Drafts', draftCount)}
            </div>
          </div>

          <div className="fh-main__body">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="db-skeleton" style={{ height: 70, borderRadius: 14 }} />)
            ) : filtered.length === 0 ? (
              <div className="db-empty" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
                <div className="db-empty__icon"><Ico.Mail /></div>
                <p>{tab === 'all' ? 'No messages yet. Send your first parent communication — AI makes it easy.' : `No ${tab} messages yet.`}</p>
                {tab === 'all' && <button className="btn primary" type="button" onClick={() => setShowCompose(true)}>Compose Message</button>}
              </div>
            ) : (
              filtered.map((msg, i) => <MessageCard key={msg.id ?? i} msg={msg} />)
            )}
          </div>
        </section>
      </div>
    </>
  );
}
