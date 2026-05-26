'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@lib/supabase/client';
import { brandPaths } from '@/config';

/* ── SVG icons ── */
const Ico = {
  Google:  () => <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
  Lock:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Check:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Save:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  User:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  School:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Bell:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Info:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

/* ── Section card ── */
function Section({ icon, title, children }) {
  return (
    <section className="db-settings-section">
      <div className="db-settings-section__head">
        <span style={{ opacity: 0.6 }}>{icon}</span>
        <span>{title}</span>
      </div>
      <div className="db-settings-section__body">{children}</div>
    </section>
  );
}

/* ── Field row ── */
function Field({ label, hint, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:18 }}>
      <label style={{ fontSize:13, fontWeight:700, color:'var(--gray-500)' }}>{label}</label>
      {children}
      {hint && <p style={{ margin:0, fontSize:11, color:'var(--gray-400)', lineHeight:1.5 }}>{hint}</p>}
    </div>
  );
}

/* ── Toggle switch ── */
function Toggle({ checked, onChange }) {
  return (
    <button onClick={()=>onChange(!checked)} type="button"
      style={{
        width:44, height:24, borderRadius:12, border:'2px solid var(--ink)', cursor:'pointer', position:'relative',
        background:checked?'var(--purple)':'var(--gray-200)', transition:'background 0.2s', flexShrink:0, padding:0,
      }}
    >
      <span style={{
        position:'absolute', top:2, left:checked?18:2, width:16, height:16, borderRadius:'50%',
        background:'var(--white)', border:'1.5px solid rgba(11,18,32,0.2)', transition:'left 0.2s',
      }} />
    </button>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function SettingsPage() {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [provider, setProvider] = useState('email');

  const [form, setForm] = useState({
    full_name:    '',
    display_name: '',
    school_name:  '',
    role:         'teacher',
  });
  const [prefs, setPrefs] = useState({
    emailDigest:     true,
    focusTips:       true,
    parentReminders: false,
  });
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setAuthEmail(user.email ?? '');
      const hasGoogle = (user.identities ?? []).some(i => i.provider==='google');
      setProvider(hasGoogle ? 'google' : 'email');
      const { data } = await supabase.from('profiles').select('full_name,display_name,school_name,role').eq('id', user.id).single();
      if (data) {
        setForm({ full_name:data.full_name??'', display_name:data.display_name??'', school_name:data.school_name??'', role:data.role??'teacher' });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const res = await fetch('/api/profile', {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ full_name:form.full_name, display_name:form.display_name||null, school_name:form.school_name, role:form.role }),
    });
    if (res.ok) { setSaved(true); setTimeout(()=>setSaved(false), 3000); }
    else { const d = await res.json(); setError(d.error??'Failed to save.'); }
    setSaving(false);
  };

  const initials = (form.display_name||form.full_name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const displayName = form.display_name || form.full_name || 'Your Name';

  const ROLE_OPTIONS = [
    { value:'teacher',    label:'Classroom Teacher' },
    { value:'homeschool', label:'Homeschool Parent' },
  ];

  if (loading) return (
    <div className="db-settings-page" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {[1,2,3].map(i => <div key={i} className="db-skeleton" style={{ height:160, borderRadius:16 }} />)}
    </div>
  );

  return (
    <form onSubmit={handleSave} className="db-settings-page">
      <div className="db-page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your profile, display name, and preferences.</p>
        </div>
      </div>

      {error && (
        <div style={{ padding:'10px 14px', border:'2px solid #fca5a5', borderRadius:10, background:'#fff1f2', color:'#e11d48', fontSize:13, fontWeight:600, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
          <Ico.Info /> {error}
        </div>
      )}
      {saved && (
        <div style={{ padding:'10px 14px', border:'2px solid #6ee7b7', borderRadius:10, background:'var(--mint)', color:'#065f46', fontSize:13, fontWeight:600, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
          <Ico.Check /> Settings saved successfully!
        </div>
      )}

      {/* ── Profile ── */}
      <Section icon={<Ico.User />} title="Profile">
        <div className="db-settings-profile">
          <div style={{ width:64, height:64, borderRadius:'50%', border:'3px solid var(--ink)', background:'var(--lavender)', display:'grid', placeItems:'center', fontSize:22, fontWeight:800, flexShrink:0, boxShadow:'3px 3px 0 var(--lavender-deep)' }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:17 }}>{displayName}</div>
            <div style={{ fontSize:13, color:'var(--gray-400)', marginTop:2 }}>{authEmail}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6, flexWrap:'wrap' }}>
              {provider==='google' ? (
                <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, padding:'3px 10px', borderRadius:20, background:'#fff', border:'1.5px solid #e5e7eb', fontWeight:700, color:'#374151' }}>
                  <Ico.Google /> Google Sign-In
                </span>
              ) : (
                <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, padding:'3px 10px', borderRadius:20, background:'var(--lavender-soft)', border:'1.5px solid rgba(124,58,237,0.2)', fontWeight:700, color:'var(--purple)' }}>
                  <Ico.Lock /> Email & Password
                </span>
              )}
              <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'var(--cream)', border:'1.5px solid var(--gray-200)', fontWeight:700, color:'var(--gray-500)' }}>
                {form.role==='homeschool' ? 'Homeschool' : 'Teacher'}
              </span>
            </div>
          </div>
        </div>

        <div className="db-settings-grid">
          <div className="db-settings-grid__full">
            <Field label="Full Name" hint="Used in AI-generated content and summaries.">
              <input className="input" value={form.full_name} onChange={e=>set('full_name',e.target.value)} placeholder="e.g. Sarah Johnson" />
            </Field>
          </div>
          <div className="db-settings-grid__full">
            <Field label="Display Name / Alias" hint="What the dashboard calls you. Great for privacy. Leave blank to use your full name.">
              <input className="input" value={form.display_name} onChange={e=>set('display_name',e.target.value)} placeholder="e.g. Ms. J, Coach S, or leave blank" />
            </Field>
          </div>
          <Field label="School / Organisation">
            <input className="input" value={form.school_name} onChange={e=>set('school_name',e.target.value)} placeholder="e.g. Riverside Elementary" />
          </Field>
          <Field label="Role">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {ROLE_OPTIONS.map(r => (
                <button key={r.value} type="button" onClick={()=>set('role',r.value)}
                  style={{
                    padding:'10px 14px', border:'2px solid', borderRadius:12, cursor:'pointer',
                    fontSize:13, fontWeight:600, textAlign:'left', fontFamily:'inherit', transition:'all 0.15s',
                    borderColor:form.role===r.value?'var(--purple)':'var(--gray-200)',
                    background:form.role===r.value?'var(--lavender-soft)':'var(--white)',
                    color:form.role===r.value?'var(--purple)':'var(--gray-500)',
                  }}
                >
                  {form.role===r.value && <span style={{ marginRight:6 }}>✓</span>}{r.label}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Section>

      {/* ── Authentication ── */}
      <Section icon={<Ico.Lock />} title="Authentication">
        {provider==='google' ? (
          <div style={{ display:'flex', alignItems:'flex-start', gap:12, fontSize:13, color:'var(--gray-600)', lineHeight:1.65 }}>
            <div style={{ width:36, height:36, borderRadius:10, border:'2px solid var(--ink)', background:'var(--cream)', display:'grid', placeItems:'center', flexShrink:0 }}>
              <Ico.Google />
            </div>
            <div>
              <strong style={{ color:'var(--ink)', display:'block', marginBottom:4 }}>Signed in with Google</strong>
              Your password and email are managed by Google. To change them, visit your{' '}
              <a href="https://myaccount.google.com" target="_blank" rel="noreferrer" style={{ color:'var(--purple)', fontWeight:700 }}>Google Account</a>.
              Your display name and alias above are stored in FocusFlow only.
            </div>
          </div>
        ) : (
          <>
            <Field label="Email Address" hint="To change your email, contact support.">
              <input className="input" value={authEmail} disabled style={{ opacity:0.55, cursor:'not-allowed' }} />
            </Field>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', background:'var(--cream)', borderRadius:10, fontSize:13, color:'var(--gray-600)', border:'1.5px solid rgba(11,18,32,0.07)' }}>
              <Ico.Lock />
              <span>Need to change your password?{' '}
                <a href="/forgot" style={{ color:'var(--purple)', fontWeight:700, textDecoration:'none' }}>Reset via email →</a>
              </span>
            </div>
          </>
        )}
      </Section>

      {/* ── Notifications ── */}
      <Section icon={<Ico.Bell />} title="Notifications">
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {[
            { key:'emailDigest',     label:'Weekly email digest',       hint:'Summary of your lessons, students, and tips every Monday.' },
            { key:'focusTips',       label:'ADHD teaching tips',        hint:'Occasional research-backed tips delivered to your inbox.' },
            { key:'parentReminders', label:'Parent message reminders',  hint:'Nudge when a student hasn\'t had a parent message in 2+ weeks.' },
          ].map((item, i, arr) => (
            <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'14px 0', borderBottom: i<arr.length-1?'1px solid rgba(11,18,32,0.06)':'none' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700 }}>{item.label}</div>
                <div style={{ fontSize:12, color:'var(--gray-400)', marginTop:2 }}>{item.hint}</div>
              </div>
              <Toggle checked={prefs[item.key]} onChange={v=>setPrefs(p=>({...p,[item.key]:v}))} />
            </div>
          ))}
        </div>
        <p style={{ margin:'14px 0 0', fontSize:11, color:'var(--gray-400)', fontStyle:'italic' }}>
          Notification preferences are saved locally. Full email integration coming soon.
        </p>
      </Section>

      {/* ── About ── */}
      <Section icon={<Ico.Info />} title="About FocusFlow">
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <img src={brandPaths.logoMark} alt="" style={{ width:40, height:40 }} />
          <div style={{ fontSize:13, color:'var(--gray-600)', lineHeight:1.65 }}>
            <strong style={{ color:'var(--ink)', display:'block', marginBottom:2 }}>FocusFlow v1.0</strong>
            AI-powered lesson planning for teachers who support students with ADHD.
            <br />
            <a href="mailto:support@focusflow.ai" style={{ color:'var(--purple)', fontWeight:700, textDecoration:'none', fontSize:12 }}>support@focusflow.ai</a>
          </div>
        </div>
      </Section>

      <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingBottom:32 }}>
        <button type="submit" className="btn primary" disabled={saving}
          style={{ display:'flex', alignItems:'center', gap:6 }}
        >
          {saving ? 'Saving…' : <><Ico.Save /> Save Changes</>}
        </button>
      </div>
    </form>
  );
}
