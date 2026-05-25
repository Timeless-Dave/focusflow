/** Marquee chips below hero — icon + label, full-bleed scroll */
export const MARQUEE_ITEMS = [
  { id: 'preview', label: 'Preview Mode', icon: '📋', color: '#E8E2F8' },
  { id: 'live', label: 'Live Recovery', icon: '▶', color: '#FFD6A5' },
  { id: 'coach', label: 'Lesson Coach', icon: '🎯', color: '#B8F5D4' },
  { id: 'parent', label: 'Parent Hub', icon: '👪', color: '#FFE4E6' },
  { id: 'train', label: 'ADHD Training', icon: '📚', color: '#C7C1FF' },
  { id: 'homeschool', label: 'Homeschool', icon: '🏠', color: '#FFD66B' }
];

export const CAROUSEL_ITEMS = [
  {
    id: 1,
    title: 'Preview Mode',
    description: 'Customize ADHD-tailored lessons before students ever see them.',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=480&fit=crop&q=80',
    icon: (
      <svg className="carousel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    )
  },
  {
    id: 2,
    title: 'Live Mode',
    description: 'Run approved slideshow lessons with timers and real-time recovery.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=340&fit=crop&q=80',
    icon: (
      <svg className="carousel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
      </svg>
    )
  },
  {
    id: 3,
    title: 'Parent Hub',
    description: 'Send practical next steps — not just reminders — to caregivers.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop&q=80',
    icon: (
      <svg className="carousel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    id: 4,
    title: 'ADHD Training',
    description: 'Short modules teachers can apply in the classroom immediately.',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=340&fit=crop&q=80',
    icon: (
      <svg className="carousel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    )
  }
];

export const GALLERY_ITEMS = [
  { image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop&q=80', text: 'Lesson Coach' },
  { image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop&q=80', text: 'Live Recovery' },
  { image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop&q=80', text: 'ADHD Training' },
  { image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&q=80', text: 'Homeschool' },
  { image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600&fit=crop&q=80', text: 'Classroom Calm' },
  { image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=80', text: 'Parent Hub' }
];

/** Partner logos — SVG marks synced to /brand/partners/ */
export const PARTNER_LOGOS = [
  { label: 'ClassDojo', image: '/brand/partners/classdojo.svg' },
  { label: 'Google Classroom', image: '/brand/partners/googleclassroom.svg' },
  { label: 'Canvas', image: '/brand/partners/canvas.svg' },
  { label: 'Clever', image: '/brand/partners/clever.svg' },
  { label: 'Schoology', image: '/brand/partners/schoology.svg' },
  { label: 'Apptegy', image: '/brand/partners/apptegy.svg' }
];

export const FEATURE_FOCUS_PHRASES = [
  'Lesson planning',
  'Live Recovery',
  'Attention dips',
  'Positive redirection'
];
