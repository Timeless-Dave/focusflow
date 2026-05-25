import { SectionBackground } from '../backgrounds';
import {
  BlurText,
  Carousel,
  CircularGallery,
  FeatureMarquee,
  LogoLoop,
  MagicBento,
  ScrollFloat,
  SplitText,
  TextType
} from '../ui';
import {
  CAROUSEL_ITEMS,
  GALLERY_ITEMS,
  MARQUEE_ITEMS,
  PARTNER_LOGOS,
  blurHeading,
  brandPaths,
  subscribeTextType
} from '@/config';

import { useScrollReveal } from '@/hooks/useEffects';
import { routes } from '@/lib/routes';

import BouncingBalls from '../ui/BouncingBalls/BouncingBalls';
import AnimatedHero from './AnimatedHero';
import './LandingPage.css';

export default function LandingPage({ onAuth, hidden = false }) {
  useScrollReveal('.reveal', !hidden);

  return (
    <main id="view-landing" className={hidden ? 'landing-page landing-page--hidden' : 'landing-page'} aria-hidden={hidden}>
      <SectionBackground preset="heroGridScan" tone="hero" fullBleed className="landing-section landing-section--hero">
        <div className="shell">
          <AnimatedHero onAuth={onAuth} />
        </div>
      </SectionBackground>

      <FeatureMarquee items={MARQUEE_ITEMS} className="section-marquee" />

      <SectionBackground preset="howItWorksDotGrid" tone="soft" interactive fullBleed className="landing-section">
        <div className="shell">
          <section id="how-it-works" className="split reveal">
            <div className="split-media">
              <div className="media-frame media-frame--balls">
                <BouncingBalls count={10} />
              </div>
            </div>
            <div className="split-copy">
              <ScrollFloat className="split-copy-scroll">
                <div className="split-copy-intro">
                  <span className="eyebrow">Preview + Live Mode</span>
                  <h2 className="split-headline">
                    <span className="split-headline__line">
                      Plan with <span className="inline-chip inline-chip--preview">Preview</span>
                    </span>
                    <span className="split-headline__line">
                      teach with confidence in <span className="inline-chip inline-chip--live">Live</span>
                    </span>
                  </h2>
                  <p>
                    Upload a lesson plan or pick a topic. FocusFlow generates ADHD-tailored lessons with storytelling,
                    visual supports, movement breaks, and check-ins — then lets you preview, customize, and launch Live
                    Mode on the classroom screen.
                  </p>
                </div>
              </ScrollFloat>
              <div className="carousel-block">
                <Carousel
                  items={CAROUSEL_ITEMS}
                  baseWidth={420}
                  autoplay
                  autoplayDelay={2200}
                  pauseOnHover={false}
                  loop
                  round={false}
                />
              </div>
            </div>
          </section>
        </div>
      </SectionBackground>

      <SectionBackground preset="featuresShapeGrid" tone="soft" fullBleed className="landing-section">
        <div className="shell">
          <section id="features" className="reveal features-section">
            <div className="section-head section-head-features">
              <span className="eyebrow">Built for real classrooms</span>
              <SplitText
                as="h2"
                text="Every moment FocusFlow supports in your classroom"
                splitBy="word"
                once
              />
            </div>
            <div className="features-layout">
              <div className="magic-bento-section">
                <MagicBento
                  enableStars
                  enableSpotlight
                  enableBorderGlow
                  enableTilt
                  enableMagnetism
                  clickEffect
                  spotlightRadius={280}
                  particleCount={8}
                  glowColor="124, 58, 237"
                />
              </div>
            </div>
          </section>
        </div>
      </SectionBackground>

      <SectionBackground preset="darkBandGridScan" tone="dark" fullBleed className="landing-section landing-section--dark">
        <div className="shell">
          <section className="dark-band reveal">
            <div className="dark-inner dark-inner--gallery">
              <div className="dark-copy">
                <BlurText
                  as="h2"
                  text="Get real-time support when live teaching gets hard"
                  splitBy="word"
                  initialBlurPx={blurHeading.initialBlurPx}
                  duration={blurHeading.duration}
                />
                <p>
                  Live Mode updates instantly when attention drops. Verbal instructions become simple written steps students
                  can follow — so you stay calm and your class stays on track.
                </p>
                <button className="btn" type="button" onClick={() => onAuth('onboarding')}>
                  Request Early Access
                </button>
              </div>
              <div className="gallery-block gallery-block--large">
                <CircularGallery
                  items={GALLERY_ITEMS}
                  bend={2.2}
                  textColor="#ffffff"
                  borderRadius={0.06}
                  scrollEase={0.07}
                  scrollSpeed={3.8}
                  font="bold 36px Inter, sans-serif"
                />
              </div>
            </div>
          </section>
        </div>
      </SectionBackground>

      <FeatureMarquee items={MARQUEE_ITEMS} reverse className="section-marquee section-marquee--muted" />

      <SectionBackground preset="trainingPixelSnow" tone="soft" fullBleed className="landing-section">
        <div className="shell">
          <section id="training" className="split reverse reveal">
            <div className="split-media">
              <div className="media-frame">
                <div className="media-bg yellow" />
                <div
                  className="media-photo"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80')"
                  }}
                />
              </div>
            </div>
            <div className="split-copy">
              <ScrollFloat className="split-copy-scroll">
                <div className="split-copy-intro">
                  <span className="eyebrow">ADHD Training & Support</span>
                  <SplitText
                    as="h2"
                    text="Making classrooms calm, creative, and confident"
                    splitBy="word"
                    once
                  />
                  <p>
                    Short, practical training modules help teachers understand ADHD and apply strategies immediately —
                    from transitions to positive redirection.
                  </p>
                </div>
              </ScrollFloat>
              <ul className="checks">
                <li>Critical classroom strategies</li>
                <li>Creativity & engagement</li>
                <li>Clear instruction design</li>
                <li>Teacher-parent communication</li>
              </ul>
            </div>
          </section>
        </div>
      </SectionBackground>

      <SectionBackground preset="homeschoolDotGrid" tone="soft" interactive fullBleed className="landing-section">
        <div className="shell">
          <section id="homeschool" className="split reveal">
            <div className="split-media">
              <div className="media-frame">
                <div className="media-bg" />
                <div
                  className="media-photo"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80')"
                  }}
                />
              </div>
            </div>
            <div className="split-copy">
              <span className="eyebrow">Homeschool Option</span>
              <SplitText
                as="h2"
                text="Structured support beyond the traditional classroom"
                splitBy="word"
                once
              />
              <p>
                FocusFlow includes a simplified homeschool tab with daily planners, Pomodoro timers, checklists, and student
                rewards — so every learner gets the structure they need.
              </p>
            </div>
          </section>
        </div>
      </SectionBackground>

      <SectionBackground preset="socialProofShapeGrid" tone="soft" fullBleed className="landing-section landing-section--compact">
        <div className="shell">
          <section id="partners" className="social-proof reveal">
            <h2 className="social-proof__title">Works alongside the tools your school already uses</h2>
            <p className="social-proof__subtitle">Trusted by educators rethinking ADHD support in classrooms</p>
            <LogoLoop className="social-proof__logos" items={PARTNER_LOGOS} reverse />
          </section>
        </div>
      </SectionBackground>

      <SectionBackground preset="subscribePixelSnow" tone="warm" fullBleed className="landing-section landing-section--compact">
        <div className="shell">
          <section className="subscribe subscribe--launch reveal">
            <img src={brandPaths.logoMark} alt="" className="subscribe__mark subscribe__mark--corner" aria-hidden="true" />
            <div className="subscribe__body">
              <div className="subscribe__copy">
                <SplitText as="h3" text="Subscribe for launch updates" splitBy="word" duration={0.45} stagger={0.035} />
                <p className="subscribe-typelead">
                  <TextType text={subscribeTextType.text} charDelayMs={subscribeTextType.charDelayMs} cursorBlinkMs={subscribeTextType.cursorBlinkMs} />
                </p>
              </div>
              <form className="sub-form sub-form--large" onSubmit={e => e.preventDefault()}>
                <input type="email" placeholder="Enter your email address" aria-label="Email address" />
                <button className="btn lavender" type="submit">
                  Send now
                </button>
              </form>
            </div>
          </section>
        </div>
      </SectionBackground>

      <footer className="site-footer">
        <div className="shell">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src={brandPaths.logoWordmark} alt="FocusFlow" className="footer-logo" />
              <p>AI-powered classroom support for teachers helping elementary and middle school students with ADHD learn, focus, and thrive.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <a href={routes.features}>Features</a>
              <a href={routes.howItWorks}>How it Works</a>
              <a href={routes.homeschool}>Homeschool</a>
              <a href={routes.features}>Pricing</a>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href={routes.training}>ADHD Training</a>
              <a href="#">Blog</a>
              <a href="#">Help Center</a>
              <a href="#">Documentation</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 FocusFlow. Built for teachers, loved by students.</span>
            <span>Terms · Privacy · Cookies</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
