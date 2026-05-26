'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { brandPaths } from '@/config';
import './AssistantFab.css';

const PROMPTS = [
  'How does Live Mode help ADHD students?',
  'What makes FocusFlow different?',
  'Can parents get actionable next steps?',
  'Is there homeschool support?',
];

function TypingDots() {
  return (
    <div style={{ display:'flex',gap:4,alignItems:'center',padding:'8px 12px',background:'var(--cream)',borderRadius:16,width:'fit-content',marginTop:8 }}>
      {[0,1,2].map(i => (
        <span key={i} style={{ width:7,height:7,borderRadius:'50%',background:'var(--lavender-deep)',display:'block',animation:`fab-bounce 1.2s ${i*0.18}s ease-in-out infinite` }} />
      ))}
    </div>
  );
}

export default function AssistantFab() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const endRef   = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, loading]);
  useEffect(() => { if (open && started) inputRef.current?.focus(); }, [open, started]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setStarted(true);
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, { role:'user', content:msg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role:'assistant', content: data.reply ?? 'Sorry, something went wrong.' }]);
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content:'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`@keyframes fab-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>

      <motion.button
        type="button"
        className="assistant-fab"
        aria-label="FocusFlow guide"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <span className="assistant-fab__ring" aria-hidden />
        <img src={brandPaths.logoMark} alt="" className="assistant-fab__logo" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              className="assistant-fab__backdrop"
              aria-label="Close guide"
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              exit={{ opacity:0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="assistant-fab__panel"
              role="dialog"
              aria-label="FocusFlow Guide"
              initial={{ opacity:0, y:16, scale:0.96 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:12, scale:0.98 }}
              transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
            >
              {/* Header */}
              <div className="assistant-fab__head">
                <img src={brandPaths.logoMark} alt="" />
                <div>
                  <strong>FocusFlow Guide</strong>
                  <p>Ask me anything about FocusFlow</p>
                </div>
              </div>

              {/* Messages area */}
              {!started ? (
                <ul className="assistant-fab__prompts">
                  {PROMPTS.map(q => (
                    <li key={q}>
                      <button type="button" onClick={() => send(q)}>{q}</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ maxHeight:220,overflowY:'auto',display:'flex',flexDirection:'column',gap:8,marginBottom:10 }}>
                  {messages.map((m,i) => (
                    <div key={i} style={{
                      alignSelf: m.role==='user'?'flex-end':'flex-start',
                      maxWidth:'88%',padding:'8px 12px',borderRadius:m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px',
                      background:m.role==='user'?'var(--purple)':'var(--cream)',
                      color:m.role==='user'?'#fff':'var(--ink)',
                      fontSize:13,lineHeight:1.55,fontWeight:m.role==='user'?600:500,
                    }}>
                      {m.content}
                    </div>
                  ))}
                  {loading && <TypingDots />}
                  <div ref={endRef} />
                </div>
              )}

              {/* Input */}
              <div style={{ display:'flex',gap:6,marginTop: started ? 4 : 12 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key==='Enter') send(); }}
                  placeholder="Ask anything…"
                  style={{ flex:1,padding:'8px 12px',border:'2px solid var(--gray-200)',borderRadius:10,fontSize:13,fontFamily:'inherit',outline:'none',transition:'border-color 0.18s' }}
                  onFocus={e=>{e.target.style.borderColor='var(--purple)';}}
                  onBlur={e=>{e.target.style.borderColor='var(--gray-200)';}}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => send()}
                  disabled={!input.trim()||loading}
                  style={{ padding:'8px 12px',borderRadius:10,border:'2px solid var(--ink)',background:input.trim()&&!loading?'var(--purple)':'var(--gray-200)',color:input.trim()&&!loading?'#fff':'var(--gray-400)',cursor:input.trim()&&!loading?'pointer':'not-allowed',fontSize:14,fontWeight:700,transition:'all 0.18s' }}
                >
                  ↑
                </button>
              </div>

              <p className="assistant-fab__note">
                Powered by FocusFlow AI · For full ADHD teaching support,{' '}
                <a href="/onboarding" style={{ color:'var(--purple)',fontWeight:700 }}>sign up free →</a>
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
