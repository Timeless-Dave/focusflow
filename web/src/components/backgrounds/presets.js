/**
 * Preset configurations for SectionBackground variants.
 * Tune per-section without duplicating component props across the landing page.
 */
export const backgroundPresets = {
  heroGridScan: {
    type: 'grid-scan',
    sensitivity: 0.48,
    lineThickness: 1,
    linesColor: '#2F293A',
    gridScale: 0.1,
    scanColor: '#C7C1FF',
    scanOpacity: 0.52,
    enablePost: true,
    bloomIntensity: 0.65,
    chromaticAberration: 0.0025,
    noiseIntensity: 0.006,
    scanDuration: 2.6,
    scanDelay: 1.4
  },

  howItWorksDotGrid: {
    type: 'dot-grid',
    dotSize: 8,
    gap: 22,
    baseColor: '#C7C1FF',
    activeColor: '#7C3AED',
    proximity: 100,
    shockRadius: 180,
    shockStrength: 4,
    resistance: 750,
    returnDuration: 1.4
  },

  featuresShapeGrid: {
    type: 'shape-grid',
    speed: 0.35,
    squareSize: 36,
    direction: 'diagonal',
    borderColor: 'rgba(199, 193, 255, 0.45)',
    hoverFillColor: 'rgba(124, 58, 237, 0.12)',
    shape: 'square',
    hoverTrailAmount: 4
  },

  darkBandGridScan: {
    type: 'grid-scan',
    sensitivity: 0.45,
    lineThickness: 1,
    linesColor: '#3D3650',
    gridScale: 0.12,
    scanColor: '#7EE787',
    scanOpacity: 0.45,
    enablePost: true,
    bloomIntensity: 0.7,
    chromaticAberration: 0.003,
    noiseIntensity: 0.012,
    scanDirection: 'forward',
    scanDuration: 2.8,
    scanDelay: 1.2
  },

  trainingPixelSnow: {
    type: 'pixel-snow',
    color: '#C7C1FF',
    flakeSize: 0.008,
    minFlakeSize: 1.1,
    pixelResolution: 220,
    speed: 0.85,
    density: 0.18,
    direction: 140,
    brightness: 0.75,
    variant: 'round'
  },

  homeschoolDotGrid: {
    type: 'dot-grid',
    dotSize: 7,
    gap: 20,
    baseColor: '#FFD6A5',
    activeColor: '#F97316',
    proximity: 90,
    shockRadius: 160,
    shockStrength: 3.5,
    resistance: 800,
    returnDuration: 1.6
  },

  socialProofShapeGrid: {
    type: 'shape-grid',
    speed: 0.2,
    squareSize: 32,
    direction: 'right',
    borderColor: 'rgba(11, 18, 32, 0.08)',
    hoverFillColor: 'rgba(199, 193, 255, 0.2)',
    shape: 'circle',
    hoverTrailAmount: 3
  },

  subscribePixelSnow: {
    type: 'pixel-snow',
    color: '#FFD66B',
    flakeSize: 0.01,
    minFlakeSize: 1.25,
    pixelResolution: 180,
    speed: 1.1,
    density: 0.22,
    direction: 125,
    brightness: 0.65,
    variant: 'square'
  },

  authGridScan: {
    type: 'grid-scan',
    sensitivity: 0.35,
    lineThickness: 0.8,
    linesColor: '#B8B0E8',
    gridScale: 0.14,
    scanColor: '#A99BFF',
    scanOpacity: 0.25,
    enablePost: false,
    bloomIntensity: 0,
    noiseIntensity: 0.005,
    scanDuration: 3,
    scanDelay: 2.5
  },

  authPixelSnow: {
    type: 'pixel-snow',
    color: '#C7C1FF',
    flakeSize: 0.009,
    minFlakeSize: 1.15,
    pixelResolution: 200,
    speed: 0.75,
    density: 0.16,
    direction: 155,
    brightness: 0.7,
    variant: 'round'
  },

  authShapeGrid: {
    type: 'shape-grid',
    speed: 0.25,
    squareSize: 34,
    direction: 'diagonal',
    borderColor: 'rgba(184, 176, 232, 0.55)',
    hoverFillColor: 'rgba(124, 58, 237, 0.14)',
    shape: 'circle',
    hoverTrailAmount: 3
  }
};
