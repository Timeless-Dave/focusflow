'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@lib/supabase/client';
import { brandPaths } from '@/config';

const Ico = {
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Mic: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Attach: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  Slide: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Lesson: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Chat: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  History: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  More: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>,
  X: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
};

const ACTION_MENU = [
  { id: 'slide', label: 'Generate slide', icon: <Ico.Slide />, type: 'mode', prefix: 'Generate a presentation slide for: ' },
  { id: 'lesson', label: 'Create lesson', icon: <Ico.Lesson />, type: 'link', href: '/dashboard/lessons/new' }
];

const STARTERS = [
  { icon: '🧠', text: 'How do I help a student stay focused during transitions?' },
  { icon: '🎯', text: 'Best ADHD strategies for keeping attention during math?' },
  { icon: '⚡', text: 'Quick energy reset activity for my class right now' },
  { icon: '📋', text: 'How do I break multi-step instructions into clear steps?' }
];

function TypingDots() {
  return (
    <div className="bot-typing">
      {[0, 1, 2].map(i => (
        <span key={i} className="bot-typing-dot" style={{ animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  );
}

function Msg({ msg, initials }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`bot-msg${isUser ? ' bot-msg--user' : ''}`}>
      {!isUser && (
        <div className="bot-msg-avatar bot-msg-avatar--bot">
          <img src={brandPaths.logoMark} alt="" />
        </div>
      )}
      <div className="bot-bubble">{msg.content}</div>
      {isUser && <div className="bot-msg-avatar bot-msg-avatar--user">{initials}</div>}
    </div>
  );
}

function FileChip({ file, onRemove }) {
  const isImage = file.type.startsWith('image/');
  return (
    <div className="bot-file">
      <span>{isImage ? '🖼' : '📎'}</span>
      <span className="bot-file-name">{file.name}</span>
      <span className="bot-file-size">{Math.round(file.size / 1024)}k</span>
      <button type="button" onClick={onRemove} aria-label="Remove file"><Ico.X /></button>
    </div>
  );
}

function ModeTag({ mode, onRemove }) {
  return (
    <span className="bot-mode-tag">
      {mode.icon}
      <span>{mode.label}</span>
      <button type="button" onClick={onRemove} aria-label={`Remove ${mode.label}`}><Ico.X /></button>
    </span>
  );
}

function SessionRow({ session, active, label, onSelect, onRename, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <div className={`bot-session-row${active ? ' bot-session-row--active' : ''}`}>
      <button type="button" className="bot-session" onClick={onSelect}>
        <Ico.Chat />
        <span>{label}</span>
      </button>
      <div className="bot-session-menu" ref={menuRef}>
        <button
          type="button"
          className="bot-session-menu__trigger"
          aria-label="Chat options"
          onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
        >
          <Ico.More />
        </button>
        {menuOpen && (
          <div className="bot-session-menu__dropdown">
            <button type="button" onClick={() => { setMenuOpen(false); onRename(session); }}>Rename</button>
            <button type="button" className="bot-session-menu__danger" onClick={() => { setMenuOpen(false); onDelete(session); }}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FocusBot() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [composerMode, setComposerMode] = useState(null);

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const mediaRef = useRef(null);
  const actionsRef = useRef(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('full_name,display_name').eq('id', user.id).single()
        .then(({ data }) => { if (data) setProfile(data); });
    });
  }, []);

  useEffect(() => {
    fetch('/api/chat/sessions')
      .then(r => (r.ok ? r.json() : []))
      .then(data => setSessions(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!actionsOpen) return;
    const close = (e) => {
      if (!actionsRef.current?.contains(e.target)) setActionsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [actionsOpen]);

  const initials = (profile?.display_name ?? profile?.full_name ?? '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const toggleVoice = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser.');
      return;
    }
    if (isListening) {
      mediaRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.onresult = e => { setInput(prev => prev + (prev ? ' ' : '') + e.results[0][0].transcript); };
    recog.onend = () => setIsListening(false);
    recog.onerror = () => setIsListening(false);
    recog.start();
    mediaRef.current = recog;
    setIsListening(true);
  }, [isListening]);

  const sendMessage = useCallback(async (text) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;
    const fullText = composerMode?.prefix ? `${composerMode.prefix}${userText}` : userText;
    setInput('');
    setComposerMode(null);
    setAttachments([]);
    setMessages(prev => [...prev, { role: 'user', content: fullText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: fullText, session_id: sessionId, context_type: 'general' })
      });
      if (!res.ok) throw new Error('API error');

      const ct = res.headers.get('content-type') ?? '';
      if (ct.includes('text/event-stream')) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let botText = '';
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value).split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') break;
            try {
              const p = JSON.parse(raw);
              const chunk = p.delta ?? p.content ?? '';
              if (chunk) {
                botText += chunk;
                setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: botText }]);
              }
              if (p.session_id && !sessionId) {
                setSessionId(p.session_id);
                setSessions(prev => [{ id: p.session_id, created_at: new Date().toISOString(), messages: [{ role: 'user', content: fullText }] }, ...prev]);
              }
            } catch {
              /* ignore partial chunks */
            }
          }
        }
      } else {
        const data = await res.json();
        if (data.session_id && !sessionId) {
          setSessionId(data.session_id);
          setSessions(prev => [{ id: data.session_id, created_at: new Date().toISOString(), messages: [{ role: 'user', content: fullText }] }, ...prev]);
        }
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? data.message ?? '…' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, sessionId, composerMode]);

  const loadSession = async (sid) => {
    setSessionId(sid);
    setMessages([]);
    setHistoryOpen(false);
    try {
      const res = await fetch(`/api/chat/sessions?id=${sid}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      }
    } catch {
      /* ignore */
    }
  };

  const newChat = () => {
    setSessionId(null);
    setMessages([]);
    setInput('');
    setComposerMode(null);
    setHistoryOpen(false);
    inputRef.current?.focus();
  };

  const renameSession = async (session) => {
    const current = session.title || sessionLabel(session);
    const next = window.prompt('Rename chat', current);
    if (!next?.trim() || next.trim() === current) return;
    try {
      const res = await fetch('/api/chat/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session.id, title: next.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(prev => prev.map(s => s.id === session.id ? { ...s, title: data.title } : s));
      }
    } catch {
      /* ignore */
    }
  };

  const deleteSession = async (session) => {
    if (!window.confirm('Delete this chat?')) return;
    try {
      const res = await fetch(`/api/chat/sessions?id=${session.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== session.id));
        if (sessionId === session.id) newChat();
      }
    } catch {
      /* ignore */
    }
  };

  const sessionLabel = (s) => {
    if (s.title?.trim()) return s.title.length > 38 ? `${s.title.slice(0, 38)}…` : s.title;
    const first = s.messages?.[0]?.content ?? 'Chat';
    return first.length > 38 ? `${first.slice(0, 38)}…` : first;
  };

  const handleAction = (action) => {
    setActionsOpen(false);
    if (action.type === 'mode') {
      setComposerMode(action);
      inputRef.current?.focus();
    } else if (action.type === 'link') {
      router.push(action.href);
    }
  };

  const inputPlaceholder = composerMode?.id === 'slide'
    ? 'Describe your slide topic…'
    : 'Message Focus Bot…';

  const isEmpty = messages.length === 0;
  const canSend = input.trim().length > 0 && !loading;
  const activeTitle = sessionId
    ? sessionLabel(sessions.find(s => s.id === sessionId) ?? { messages })
    : 'New chat';

  return (
    <div className="bot-embedded">
      {isMobile && historyOpen && (
        <button type="button" className="bot-history-overlay" aria-label="Close chat history" onClick={() => setHistoryOpen(false)} />
      )}

      <div className="bot-layout">
        <aside className={`bot-history${isMobile && historyOpen ? ' bot-history--mobile-open' : ''}`}>
          <div className="bot-history__head">
            <strong>Chat history</strong>
            <button type="button" className="bot-history__new" onClick={newChat} aria-label="New chat">
              <Ico.Plus />
            </button>
          </div>
          <div className="bot-history__list">
            {sessions.length === 0 ? (
              <p className="bot-history__empty">No past chats yet — start a conversation below.</p>
            ) : (
              sessions.map(s => (
                <SessionRow
                  key={s.id}
                  session={s}
                  active={s.id === sessionId}
                  label={sessionLabel(s)}
                  onSelect={() => loadSession(s.id)}
                  onRename={renameSession}
                  onDelete={deleteSession}
                />
              ))
            )}
          </div>
        </aside>

        <section className="bot-panel">
          <div className="bot-panel__head">
            <div className="bot-panel__head-title">
              {isMobile && (
                <button type="button" className="btn ghost sm" onClick={() => setHistoryOpen(true)} aria-label="Open chat history">
                  <Ico.History /> History
                </button>
              )}
              <img src={brandPaths.logoMark} alt="" />
              <span>{activeTitle}</span>
              <span className="bot-panel__badge">ADHD Coach</span>
            </div>
          </div>

          <div className="bot-panel__messages">
            {isEmpty ? (
              <div className="bot-empty">
                <div className="bot-empty__mark">
                  <img src={brandPaths.logoMark} alt="" />
                </div>
                <div>
                  <h2>How can I help today?</h2>
                  <p>Ask about ADHD strategies, lesson ideas, parent messages, or anything classroom-related.</p>
                </div>
                <div className="bot-starters">
                  {STARTERS.map((s, i) => (
                    <button key={i} type="button" onClick={() => sendMessage(s.text)}>
                      <span>{s.icon}</span>
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bot-thread">
                {messages.map((msg, i) => <Msg key={i} msg={msg} initials={initials} />)}
                {loading && (
                  <div className="bot-msg">
                    <div className="bot-msg-avatar bot-msg-avatar--bot">
                      <img src={brandPaths.logoMark} alt="" />
                    </div>
                    <TypingDots />
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>

          <div className="bot-panel__composer">
            {attachments.length > 0 && (
              <div className="bot-files">
                {attachments.map((f, i) => (
                  <FileChip key={i} file={f} onRemove={() => setAttachments(p => p.filter((_, j) => j !== i))} />
                ))}
              </div>
            )}

            {isListening && (
              <div className="bot-listening">
                <Ico.Mic />
                <span>Listening… speak now</span>
                <button type="button" onClick={toggleVoice}>Stop</button>
              </div>
            )}

            <div className={`bot-input-shell${composerMode ? ' bot-input-shell--tagged' : ''}`}>
              {composerMode && (
                <div className="bot-input-shell__tags">
                  <ModeTag mode={composerMode} onRemove={() => setComposerMode(null)} />
                </div>
              )}
              <div className="bot-input-shell__row">
              <div className="bot-input-tools bot-input-tools--left">
                <div className="bot-actions" ref={actionsRef}>
                  <button
                    type="button"
                    className={`bot-tool-btn${actionsOpen ? ' bot-tool-btn--active-menu' : ''}`}
                    aria-label="More actions"
                    aria-expanded={actionsOpen}
                    onClick={() => setActionsOpen(o => !o)}
                  >
                    <Ico.Plus />
                  </button>
                  {actionsOpen && (
                    <div className="bot-actions__menu">
                      {ACTION_MENU.map(item => (
                        <button key={item.id} type="button" className="bot-actions__item" onClick={() => handleAction(item)}>
                          {item.icon}
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="bot-tool-btn"
                  aria-label="Attach file"
                  onClick={() => fileRef.current?.click()}
                >
                  <Ico.Attach />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.txt"
                  hidden
                  onChange={e => {
                    setAttachments(p => [...p, ...Array.from(e.target.files ?? [])].slice(0, 5));
                    e.target.value = '';
                  }}
                />
              </div>

              <textarea
                ref={inputRef}
                className="bot-input-field"
                rows={1}
                placeholder={inputPlaceholder}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={loading}
              />

              <div className="bot-input-tools bot-input-tools--right">
                <button
                  type="button"
                  className={`bot-tool-btn${isListening ? ' bot-tool-btn--active' : ''}`}
                  aria-label={isListening ? 'Stop voice input' : 'Voice input'}
                  onClick={toggleVoice}
                >
                  <Ico.Mic />
                </button>
                <button
                  type="button"
                  className="bot-tool-btn bot-tool-btn--send"
                  aria-label="Send message"
                  onClick={() => sendMessage()}
                  disabled={!canSend}
                >
                  <Ico.Send />
                </button>
              </div>
              </div>
            </div>

            <p className="bot-hint">Focus Bot can make mistakes. Verify important classroom guidance. Shift+Enter for a new line.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
