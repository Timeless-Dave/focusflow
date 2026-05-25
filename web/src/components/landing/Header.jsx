import Link from 'next/link';
import { brandPaths } from '@/config';
import { routes } from '@/lib/routes';
import SiteNav from './SiteNav';
import './Header.css';

const NAV_ITEMS = [
  { label: 'Home', href: routes.home },
  { label: 'How it Works', href: routes.howItWorks },
  { label: 'Features', href: routes.features },
  { label: 'Training', href: routes.training },
  { label: 'Homeschool', href: routes.homeschool }
];

export default function Header({ onAuth, activePath = routes.home }) {
  return (
    <header className="site-header focusflow-header">
      <div className="header-inner header-inner--pill">
        <Link href={routes.home} className="header-brand" aria-label="FocusFlow home">
          <img src={brandPaths.logoMark} alt="" className="header-brand__mark" aria-hidden="true" />
          <span className="header-brand__name">
            Focus<span className="header-brand__accent">Flow</span>
          </span>
        </Link>
        <SiteNav items={NAV_ITEMS} activePath={activePath} />
        <div className="header-cta">
          <button className="btn text" type="button" onClick={() => onAuth('login')}>
            Sign In
          </button>
          <button className="btn primary" type="button" onClick={() => onAuth('onboarding')}>
            Register
          </button>
        </div>
      </div>
    </header>
  );
}
