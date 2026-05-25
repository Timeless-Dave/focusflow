/**
 * Shared animation presets for landing / hero (DRY tuning).
 */

export const brandPaths = {
  /** Full wordmark, transparent — header, footer */
  logoWordmark: '/brand/logo-wordmark-clear.png',
  /** F mark extracted from wordmark, transparent — pills, FAB, splash, auth */
  logoMark: '/brand/logo-mark.png',
  /** Browser tab icon (512px), same mark as logoMark */
  favicon: '/brand/favicon.png',
  faviconDark: '/brand/favicon-dark.png',
  appleIcon: '/brand/apple-icon.png',
  appleIconDark: '/brand/apple-icon-dark.png',
  authClassroom: '/brand/auth-classroom.svg',
  authVerify: '/brand/auth-verify.svg'
};

export const heroHeading = {
  words: ['Focus', 'Calm', 'Flow', 'Attention'],
  intervalMs: 2000
};

export const variableProximity = {
  radius: 80,
  maxScale: 1.04,
  minScale: 0.99,
  blurPx: 0
};

export const scrollFloat = {
  y: 32,
  duration: 0.85,
  ease: 'power2.out'
};

export const trueFocus = {
  blurInactive: '4px',
  transitionMs: 320
};

export const curvedLoopDefaults = {
  text: 'Calm classrooms · Adaptive lessons · Live recovery · ADHD-first design · ',
  speedPxPerSec: 48,
  curvature: 0.22
};

export const subscribeTextType = {
  text: 'We only email when we have something useful—early access invites, ADHD teaching tips, and launch news.',
  charDelayMs: 18,
  cursorBlinkMs: 520
};

export const blurHeading = {
  initialBlurPx: 14,
  duration: 1.05,
  staggerChars: true
};

export const clickSparkDefaults = {
  colors: ['#c4b5fd', '#a78bfa', '#e9d5ff'],
  particleCount: 5,
  sizeRatio: 0.028,
  spread: 48
};

export const ribbonsBackdrop = {
  opacity: 0.35,
  intensity: 0.52,
  colorA: '#7c3aed',
  colorB: '#a78bfa'
};

export const shapeBlurBackdrop = {
  opacity: 0.55,
  scale: 1.15,
  hue: '260deg'
};

export const imageTrailPreset = {
  maxPoints: 10,
  imageUrl:
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=120&q=60',
  size: 48
};
