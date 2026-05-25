'use client';

import { useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Splash, { useSplash } from './components/Splash';
import Header from './components/landing/Header';
import LandingPage from './components/landing/LandingPage';
import AuthOverlay from './components/auth/AuthOverlay';
import ClickSpark from './components/ui/ClickSpark/ClickSpark';
import AssistantFab from './components/ui/AssistantFab/AssistantFab';
import { clickSparkDefaults } from './config';
import { useStickyHeader } from './hooks/useEffects';
import { useSectionScroll } from './hooks/useSectionScroll';
import { authPathFromView, authViewFromPath, routes } from './lib/routes';

export default function AppShell() {
  const pathname = usePathname();
  const router = useRouter();
  const authView = authViewFromPath(pathname);
  const isAuthOpen = authView !== null;

  const { visible: splashVisible, phase: splashPhase } = useSplash();

  useStickyHeader();
  useSectionScroll(pathname, !isAuthOpen);

  useEffect(() => {
    document.body.style.overflow = isAuthOpen || splashVisible ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthOpen, splashVisible]);

  useEffect(() => {
    if (isAuthOpen) {
      window.scrollTo(0, 0);
    }
  }, [isAuthOpen]);

  const navigate = useCallback(
    (target) => {
      const path = authPathFromView(target);
      router.push(path);
    },
    [router]
  );

  return (
    <>
      <Splash visible={splashVisible} phase={splashPhase} />
      <ClickSpark className="click-spark-page" {...clickSparkDefaults}>
        <div className={`page page--ready${isAuthOpen ? ' page--auth-open' : ''}${splashVisible ? ' page--loading' : ''}`}>
          <div className="site-header-sticky">
            <div className="shell">
              <Header onAuth={navigate} activePath={pathname} />
            </div>
          </div>
          <LandingPage onAuth={navigate} hidden={isAuthOpen} />
        </div>
      </ClickSpark>
      {isAuthOpen && <AuthOverlay view={authView} onAuth={navigate} onClose={() => router.push(routes.home)} />}
      {!isAuthOpen && !splashVisible && <AssistantFab />}
    </>
  );
}
