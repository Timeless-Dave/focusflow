import Link from 'next/link';
import './SiteNav.css';

function isActive(pathname, href) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteNav({ items, activePath = '/' }) {
  return (
    <nav className="site-nav" aria-label="Primary">
      <ul className="site-nav__list">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`site-nav__link${isActive(activePath, item.href) ? ' is-active' : ''}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
