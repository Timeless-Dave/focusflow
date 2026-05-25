export const routes = {
  home: '/',
  login: '/login',
  onboarding: '/onboarding',
  forgot: '/forgot',
  howItWorks: '/how-it-works',
  features: '/features',
  training: '/training',
  homeschool: '/homeschool',
  partners: '/partners'
};

export const AUTH_ROUTES = [routes.login, routes.onboarding, routes.forgot];

export const SECTION_ROUTES = {
  [routes.howItWorks]: 'how-it-works',
  [routes.features]: 'features',
  [routes.training]: 'training',
  [routes.homeschool]: 'homeschool',
  [routes.partners]: 'partners'
};

export function authViewFromPath(pathname) {
  if (pathname === routes.login) return 'login';
  if (pathname === routes.onboarding) return 'onboarding';
  if (pathname === routes.forgot) return 'forgot';
  return null;
}

export function authPathFromView(view) {
  if (view === 'login') return routes.login;
  if (view === 'onboarding' || view === 'signup' || view === 'verify') return routes.onboarding;
  if (view === 'forgot') return routes.forgot;
  return routes.home;
}
