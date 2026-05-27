import Link from 'next/link';
import { brandPaths, heroHeading, variableProximity } from '@/config';
import { routes } from '@/lib/routes';
import { RotatingText, VariableProximity } from '../ui';

/** Hero — centered copy; section GridScan supplies ambient motion */
export default function AnimatedHero({ onAuth }) {
  return (
    <section className="hero reveal hero--clean hero--centered">
      <div className="hero-copy">
        <h1 className="hero-title">
          <span className="hero-title__lead">Teach with</span>
          <span className="hero-title__cluster">
            <span className="hero-word-pill">
              <span className="hero-word-pill__icon" aria-hidden="true">
                <img src={brandPaths.logoMark} alt="" />
              </span>
              <RotatingText
                words={heroHeading.words}
                intervalMs={heroHeading.intervalMs}
                className="hero-word-pill__text"
              />
            </span>
            <span className="hero-arrow-pill" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h12M13 7l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
          <span className="hero-title__tail">
            <VariableProximity text="Not Friction" radius={variableProximity.radius} ariaHidden />
          </span>
        </h1>
        <p className="lead lead--scan">
          FocusFlow is an AI-powered platform that helps elementary and middle school teachers support students with
          ADHD — redesigning lessons around how attention actually works.
        </p>
        <div className="cta-row">
          <button className="btn lavender" type="button" onClick={() => onAuth('onboarding')}>
            Get Started
          </button>
          <Link href={routes.howItWorks} className="play-link">
            <span className="play-icon" aria-hidden="true">
              ▶
            </span>
            Watch how it works
          </Link>
        </div>
      </div>
    </section>
  );
}
