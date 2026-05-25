import GridScan from './GridScan';
import PixelSnow from './PixelSnow';
import DotGrid from './DotGrid';
import ShapeGrid from './ShapeGrid';
import { backgroundPresets } from './presets';
import './SectionBackground.css';

const BACKGROUND_COMPONENTS = {
  'grid-scan': GridScan,
  'pixel-snow': PixelSnow,
  'dot-grid': DotGrid,
  'shape-grid': ShapeGrid
};

/**
 * Reusable section wrapper with React Bits animated backgrounds.
 *
 * @example
 * <SectionBackground preset="heroGridScan" tone="hero">
 *   <HeroContent />
 * </SectionBackground>
 *
 * @example
 * <SectionBackground type="dot-grid" dotSize={8} interactive tone="soft">
 *   {children}
 * </SectionBackground>
 */
export default function SectionBackground({
  preset,
  type,
  tone = 'soft',
  interactive = false,
  fullBleed = false,
  className = '',
  overlay = true,
  children,
  ...overrideProps
}) {
  const config = preset ? backgroundPresets[preset] : null;
  const resolvedType = type ?? config?.type;

  if (!resolvedType) {
    return <section className={`section-bg ${className}`}>{children}</section>;
  }

  const { type: _ignored, ...presetProps } = config ?? {};
  const Background = BACKGROUND_COMPONENTS[resolvedType];
  const props = { ...presetProps, ...overrideProps };

  const toneClass = tone ? `section-bg--${tone}` : '';
  const bleedClass = fullBleed ? 'section-bg--full-bleed' : '';

  return (
    <section className={`section-bg ${toneClass} ${bleedClass} ${className}`.trim()}>
      <div
        className={`section-bg__canvas${interactive ? ' section-bg__canvas--interactive' : ''}`}
        aria-hidden={!interactive}
      >
        <Background {...props} style={{ width: '100%', height: '100%', position: 'relative' }} />
      </div>
      {overlay && <div className="section-bg__overlay" aria-hidden="true" />}
      <div className="section-bg__content">{children}</div>
    </section>
  );
}

export { backgroundPresets };
