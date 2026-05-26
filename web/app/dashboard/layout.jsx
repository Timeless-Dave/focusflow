'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@lib/supabase/client';
import { brandPaths } from '@/config';
import './dashboard.css';

/* ── Icon components ── */
function IconGrid() {
  return (
    <svg className="nav-icon nav-icon--grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" className="ni-a" />
      <rect x="14" y="3" width="7" height="7" className="ni-b" />
      <rect x="3" y="14" width="7" height="7" className="ni-c" />
      <rect x="14" y="14" width="7" height="7" className="ni-d" />
    </svg>
  );
}
function IconPencil() {
  return (
    <svg className="nav-icon nav-icon--pencil" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg className="nav-icon nav-icon--users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconMessage() {
  return (
    <svg className="nav-icon nav-icon--message" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg className="nav-icon nav-icon--book" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path className="ni-book-l" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path className="ni-book-r" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function IconLogOut() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: '/dashboard',           label: 'Overview',       icon: <IconGrid />,    iconLabel: 'Overview' },
  { href: '/dashboard/lessons',   label: 'Lesson Studio',  icon: <IconPencil />,  iconLabel: 'Lessons' },
  { href: '/dashboard/students',  label: 'Students',       icon: <IconUsers />,   iconLabel: 'Students' },
  { href: '/dashboard/parents',   label: 'Family Hub',     icon: <IconMessage />, iconLabel: 'Family Hub' },
  { href: '/dashboard/training',  label: 'ADHD Training',  icon: <IconBook />,    iconLabel: 'Training' },
];

/* ── Search modal ── */
function SearchModal({ onClose, router }) {
  const [q, setQ] = useState('');
  const inputRef  = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const QUICK_LINKS = [
    { label: 'New Lesson', href: '/dashboard/lessons/new', icon: '✨' },
    { label: 'Students',   href: '/dashboard/students',    icon: '👥' },
    { label: 'Family Hub', href: '/dashboard/parents',     icon: '✉️' },
    { label: 'Training',   href: '/dashboard/training',    icon: '📚' },
    { label: 'Focus Bot',  href: '/dashboard/bot',          icon: '🤖' },
    { label: 'Settings',   href: '/dashboard/settings',    icon: '⚙️' },
  ];

  const filtered = q.trim()
    ? QUICK_LINKS.filter(l => l.label.toLowerCase().includes(q.toLowerCase()))
    : QUICK_LINKS;

  const go = (href) => { router.push(href); onClose(); };

  return (
    <div style={{ position:'fixed',inset:0,zIndex:9000,background:'rgba(11,18,32,0.5)',display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:80 }} onClick={onClose}>
      <div style={{ background:'var(--white)',border:'2px solid var(--ink)',borderRadius:18,width:'100%',maxWidth:520,boxShadow:'6px 6px 0 var(--lavender-deep)',overflow:'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex',alignItems:'center',gap:10,padding:'14px 16px',borderBottom:'1.5px solid rgba(11,18,32,0.08)' }}>
          <IconSearch />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search lessons, students, settings…"
            style={{ flex:1,border:'none',outline:'none',fontSize:15,fontFamily:'inherit',background:'transparent',color:'var(--ink)' }}
            onKeyDown={e => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && filtered[0]) go(filtered[0].href); }}
          />
          <kbd style={{ fontSize:11,padding:'2px 6px',borderRadius:5,border:'1.5px solid var(--gray-200)',color:'var(--gray-400)',fontFamily:'inherit' }}>Esc</kbd>
        </div>
        <div style={{ maxHeight:320,overflowY:'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding:'32px 16px',textAlign:'center',color:'var(--gray-400)',fontSize:14 }}>No results for "{q}"</div>
          ) : (
            filtered.map(l => (
              <button key={l.href} onClick={() => go(l.href)} style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px 16px',background:'transparent',border:'none',borderBottom:'1px solid rgba(11,18,32,0.05)',cursor:'pointer',textAlign:'left',fontSize:14,fontWeight:600,color:'var(--ink)',transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--lavender-soft)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize:18,width:24 }}>{l.icon}</span>
                {l.label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ profile, collapsed, onToggle, mobileOpen }) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const initials = profile?.display_name ?? profile?.full_name
    ? (profile.display_name ?? profile.full_name).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const displayName = profile?.display_name || profile?.full_name || 'Teacher';

  const isBotActive = pathname.startsWith('/dashboard/bot');

  const sidebarClass = [
    'db-sidebar',
    collapsed && 'db-sidebar--collapsed',
    mobileOpen && 'db-sidebar--mobile-open'
  ].filter(Boolean).join(' ');

  return (
    <aside className={sidebarClass}>
      {/* Brand */}
      <div className="db-sidebar__brand-row">
        <Link href="/dashboard" className="db-sidebar__brand">
          <img src={brandPaths.logoMark} alt="FocusFlow" className="db-sidebar__logo" />
          <span className="db-sidebar__brand-name">
            Focus<span style={{ color:'var(--purple)' }}>Flow</span>
          </span>
        </Link>
        <button
          type="button"
          className="db-sidebar__toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <IconChevronLeft />
        </button>
      </div>

      {/* Focus Bot promo card */}
      <div className="db-bot-card-wrap">
        <Link href="/dashboard/bot" className={`db-bot-card${isBotActive ? ' db-bot-card--active' : ''}`}>
          <img src={brandPaths.logoMark} alt="" className="db-bot-card__logo" />
          <div className="db-bot-card__text">
            <div className="db-bot-card__title">Focus Bot</div>
            <div className="db-bot-card__sub">Your AI teaching assistant</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="db-nav" role="navigation" aria-label="Dashboard navigation">
        <span className="db-nav__section-label">Menu</span>
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`db-nav__item${isActive ? ' db-nav__item--active' : ''}`}
              title={item.iconLabel}
            >
              <span className="db-nav__icon">{item.icon}</span>
              <span className="db-nav__label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom strip */}
      <div className="db-sidebar__bottom">
        <Link href="/dashboard/settings" className="db-profile-chip">
          <div className="db-avatar">{initials}</div>
          <div className="db-profile-info">
            <div className="db-profile-name">{displayName}</div>
            <div className="db-profile-role">{profile?.role === 'homeschool' ? 'Homeschool' : 'Teacher'}</div>
          </div>
        </Link>
        <button className="db-signout-btn" onClick={handleSignOut}>
          <span className="db-signout-icon"><IconLogOut /></span>
          <span className="db-signout-label">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [profile, setProfile]         = useState(null);
  const [showSearch, setShowSearch]   = useState(false);
  const router = useRouter();

  const isBotRoute = pathname.startsWith('/dashboard/bot');

  useEffect(() => {
    if (isBotRoute) setCollapsed(true);
  }, [isBotRoute]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('full_name, display_name, role').eq('id', user.id).single()
        .then(({ data }) => { if (data) setProfile(data); });
    });
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(s => !s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const initials = (profile?.display_name ?? profile?.full_name)
    ? (profile.display_name ?? profile.full_name).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const firstName = (profile?.display_name || profile?.full_name || '').split(' ')[0] || 'Teacher';
  const routeEyebrow = getRouteEyebrow(pathname);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="db-shell">
      {/* Search modal */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} router={router} />}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position:'fixed',inset:0,zIndex:90,background:'rgba(11,18,32,0.35)' }} onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar profile={profile} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} mobileOpen={mobileOpen} />

      <main className={`db-main${collapsed ? ' db-main--sidebar-collapsed' : ''}`}>
        {/* Top bar */}
        <div className="db-topbar">
          <div className="db-topbar__left">
            <button className="db-mobile-menu" onClick={() => setMobileOpen(o => !o)} aria-label="Open menu">
              <IconMenu />
            </button>
            <span className="eyebrow db-topbar__eyebrow">{routeEyebrow}</span>
          </div>
          <div className="db-topbar__center">
            <span className="db-topbar__greeting">
              {greeting()}, <strong>{firstName}</strong>
            </span>
          </div>
          <div className="db-topbar__right">
            {/* Search */}
            <button className="db-topbar__search" onClick={() => setShowSearch(true)} title="Search (⌘K)">
              <IconSearch />
              <span>Search…</span>
              <kbd>⌘K</kbd>
            </button>
            <Link href="/dashboard/settings" className="db-topbar__avatar" title="Settings">
              {initials}
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div className={`db-content${isBotRoute ? ' db-content--bot' : ' db-content--compact'}`}>
          {children}
        </div>
      </main>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getRouteEyebrow(pathname) {
  if (pathname === '/dashboard') return 'Control Room';
  if (pathname.startsWith('/dashboard/bot')) return 'AI Coach';
  if (pathname.startsWith('/dashboard/lessons')) return 'AI Lesson Studio';
  if (pathname.startsWith('/dashboard/students')) return 'Student Roster';
  if (pathname.startsWith('/dashboard/parents')) return 'AI-Powered';
  if (pathname.startsWith('/dashboard/training')) return 'Professional Development';
  if (pathname.startsWith('/dashboard/settings')) return 'Account';
  return 'FocusFlow';
}
