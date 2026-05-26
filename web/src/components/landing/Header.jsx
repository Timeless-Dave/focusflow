'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { brandPaths } from '@/config';
import './Header.css';

const NAV = [
  {
    label: 'Product',
    dropdown: [
      { label: 'How it Works',   href: '/how-it-works',  icon: '⚡' },
      { label: 'Features',       href: '/features',       icon: '✨' },
      { label: 'Live Mode',      href: '/features',       icon: '▶' },
      { label: 'ADHD Training',  href: '/training',       icon: '📚' },
      { label: 'For Homeschool', href: '/homeschool',     icon: '🏠' },
    ]
  },
  { label: 'Pricing',  href: '/pricing' },
  {
    label: 'Resources',
    dropdown: [
      { label: 'ADHD Research',  href: '/training',   icon: '🔬' },
      { label: 'Partner Tools',  href: '/partners',   icon: '🤝' },
    ]
  },
  {
    label: 'Company',
    dropdown: [
      { label: 'About',    href: '/about',   icon: '🌱' },
      { label: 'Contact',  href: '/contact', icon: '✉️' },
    ]
  },
];

function DropdownMenu({ items, visible }) {
  return (
    <div className={`hdr-dropdown${visible ? ' hdr-dropdown--open' : ''}`} role="menu">
      {items.map(item => (
        <a
          key={item.href + item.label}
          href={item.href}
          className="hdr-dropdown__item"
          role="menuitem"
          onClick={e => {
            e.preventDefault();
            // Smooth-scroll if same-page section, else navigate
            const sectionMap = {
              '/how-it-works': 'how-it-works',
              '/features':     'features',
              '/training':     'training',
              '/homeschool':   'homeschool',
              '/partners':     'partners',
            };
            const id = sectionMap[item.href];
            if (id && document.getElementById(id)) {
              document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              window.location.href = item.href;
            }
          }}
        >
          {item.icon && <span className="hdr-dropdown__icon">{item.icon}</span>}
          {item.label}
        </a>
      ))}
    </div>
  );
}

function NavItem({ item, activePath }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = item.href
    ? activePath === item.href || activePath?.startsWith(item.href + '/')
    : item.dropdown?.some(d => activePath === d.href);

  if (item.dropdown) {
    return (
      <div ref={ref} className="hdr-nav__item hdr-nav__item--has-dropdown" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        <button
          className={`hdr-nav__link${isActive ? ' is-active' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-haspopup="true"
          aria-expanded={open}
          type="button"
        >
          {item.label}
          <svg className={`hdr-caret${open ? ' hdr-caret--open' : ''}`} width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
        <DropdownMenu items={item.dropdown} visible={open} />
      </div>
    );
  }

  return (
    <div className="hdr-nav__item">
      <a
        href={item.href}
        className={`hdr-nav__link${isActive ? ' is-active' : ''}`}
        onClick={e => {
          e.preventDefault();
          const sectionMap = { '/pricing': 'pricing', '/about': 'about', '/contact': 'contact' };
          const id = sectionMap[item.href];
          if (id && document.getElementById(id)) {
            document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.history.pushState({}, '', item.href);
          }
        }}
      >
        {item.label}
      </a>
    </div>
  );
}

export default function Header({ onAuth, activePath = '/' }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="site-header focusflow-header">
      <div className="header-inner header-inner--pill">
        <Link href="/" className="header-brand" aria-label="FocusFlow home">
          <img src={brandPaths.logoMark} alt="" className="header-brand__mark" aria-hidden="true" />
          <span className="header-brand__name">
            Focus<span className="header-brand__accent">Flow</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hdr-nav" aria-label="Primary">
          {NAV.map(item => <NavItem key={item.label} item={item} activePath={activePath} />)}
        </nav>

        <div className="header-cta">
          <button className="btn text" type="button" onClick={() => onAuth('login')}>Sign In</button>
          <button className="btn primary" type="button" onClick={() => onAuth('onboarding')}>Get Started</button>
          {/* Mobile toggle */}
          <button
            className="hdr-mobile-toggle"
            aria-label="Menu"
            type="button"
            onClick={() => setMobileOpen(o => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="hdr-mobile-drawer">
          {NAV.flatMap(item =>
            item.dropdown
              ? item.dropdown.map(d => (
                  <a key={d.href + d.label} href={d.href} className="hdr-mobile-link" onClick={() => setMobileOpen(false)}>
                    {d.icon && <span>{d.icon}</span>} {d.label}
                  </a>
                ))
              : [<a key={item.href} href={item.href} className="hdr-mobile-link" onClick={() => setMobileOpen(false)}>{item.label}</a>]
          )}
          <div className="hdr-mobile-cta">
            <button className="btn full" type="button" onClick={() => { onAuth('login'); setMobileOpen(false); }}>Sign In</button>
            <button className="btn primary full" type="button" onClick={() => { onAuth('onboarding'); setMobileOpen(false); }}>Get Started Free</button>
          </div>
        </div>
      )}
    </header>
  );
}
