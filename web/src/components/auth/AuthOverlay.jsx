import { useState } from 'react';
import { Stepper, Step, ShapeBlur } from '../ui';
import { GridScan, PixelSnow, ShapeGrid } from '../backgrounds';
import { backgroundPresets } from '../backgrounds/presets';
import { brandPaths } from '@/config';
import './auth.css';

function GoogleButton() {
  return (
    <button className="google-btn" type="button">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Continue with Google
    </button>
  );
}

function AuthPanel({ variant = 'login', wide = false, children }) {
  return (
    <div className={`auth-panel auth-panel--${variant}${wide ? ' auth-panel--wide' : ''}`}>
      {variant === 'login' && <ShapeBlur className="auth-panel__blur" opacity={0.32} scale={1.2} />}
      {variant === 'onboarding' && <div className="auth-panel__stripe" aria-hidden="true" />}
      {variant === 'forgot' && <div className="auth-panel__dots" aria-hidden="true" />}
      <div className="auth-panel__inner">{children}</div>
    </div>
  );
}

const VISUAL_BACKGROUNDS = {
  login: { Component: PixelSnow, preset: backgroundPresets.authPixelSnow },
  onboarding: { Component: GridScan, preset: backgroundPresets.authGridScan },
  forgot: { Component: ShapeGrid, preset: backgroundPresets.authShapeGrid }
};

function AuthVisualPanel({ variant, title, illustration }) {
  const { Component, preset } = VISUAL_BACKGROUNDS[variant] ?? VISUAL_BACKGROUNDS.onboarding;
  const { type: _t, ...bgProps } = preset;

  return (
    <div className="auth-visual">
      <div className="auth-visual-bg" aria-hidden="true">
        <div className="auth-visual-bg__fill">
          <Component {...bgProps} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
      <div className="auth-visual-content">
        <div className="auth-visual__top">
          <div className="auth-brand-row">
            <img src={brandPaths.logoMark} alt="" className="auth-brand" aria-hidden="true" />
            <span className="auth-brand-name">
              Focus<span className="accent">Flow</span>
            </span>
          </div>
          <h2>{title}</h2>
        </div>
        <div className="auth-illustration">
          <img src={illustration} alt="" width="420" height="280" />
        </div>
      </div>
    </div>
  );
}

export function LoginPanel({ onAuth }) {
  return (
    <div className="auth-page auth-page--flipped">
      <div className="auth-right auth-right--centered">
        <AuthPanel variant="login">
          <div className="auth-form auth-form--compact auth-form--centered">
            <div className="auth-icon" aria-hidden="true">▶</div>
            <h3>Welcome back</h3>
            <p className="subtitle">Sign in to your teacher dashboard</p>
            <label htmlFor="login-email">Email address</label>
            <div className="input-wrap">
              <input id="login-email" className="input" type="email" placeholder="name@email.com" autoComplete="email" />
            </div>
            <label htmlFor="login-password">Password</label>
            <div className="input-wrap">
              <input id="login-password" className="input password" type="password" placeholder="••••••••" autoComplete="current-password" />
            </div>
            <div className="form-row">
              <label><input type="checkbox" /> Remember me</label>
              <button type="button" className="link-btn" onClick={() => onAuth('forgot')}>Forgot password?</button>
            </div>
            <button className="btn auth-primary" type="button">Sign In</button>
            <p className="auth-switch">
              New user? <button type="button" className="link-btn" onClick={() => onAuth('onboarding')}>Create account</button>
            </p>
            <div className="divider">Or</div>
            <GoogleButton />
          </div>
        </AuthPanel>
      </div>
      <AuthVisualPanel
        variant="login"
        title={<>Learning without limits, right where you are with <span className="accent">FocusFlow</span></>}
        illustration={brandPaths.authClassroom}
      />
    </div>
  );
}

export function ForgotPasswordPanel({ onAuth }) {
  return (
    <div className="auth-page auth-page--flipped">
      <div className="auth-right auth-right--centered">
        <AuthPanel variant="forgot">
          <div className="auth-form auth-form--compact auth-form--centered">
            <div className="auth-icon" aria-hidden="true">✉</div>
            <h3>Reset your password</h3>
            <p className="subtitle">Enter the email linked to your account and we&apos;ll send reset instructions.</p>
            <label htmlFor="forgot-email">Email address</label>
            <div className="input-wrap">
              <input id="forgot-email" className="input" type="email" placeholder="name@email.com" autoComplete="email" />
            </div>
            <button className="btn auth-primary" type="button">Send reset link</button>
            <p className="auth-switch">
              Remember your password? <button type="button" className="link-btn" onClick={() => onAuth('login')}>Sign in</button>
            </p>
          </div>
        </AuthPanel>
      </div>
      <AuthVisualPanel
        variant="forgot"
        title={<>We&apos;ll get you back to calm, focused teaching with <span className="accent">FocusFlow</span></>}
        illustration={brandPaths.authVerify}
      />
    </div>
  );
}

export function OnboardingPanel({ onAuth, onComplete }) {
  const [role, setRole] = useState('teacher');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const maskedEmail = form.email
    ? `${form.email.slice(0, 3)}••••@${form.email.split('@')[1] || 'gmail.com'}`
    : 'your••••@email.com';

  const handleCodeInput = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
  };

  return (
    <div className="auth-page">
      <AuthVisualPanel
        variant="onboarding"
        title={<>Join teachers building calmer, more focused classrooms with <span className="accent">FocusFlow</span></>}
        illustration={brandPaths.authClassroom}
      />
      <div className="auth-right auth-right--centered">
        <AuthPanel variant="onboarding" wide>
          <div className="auth-stepper-wrap">
            <Stepper
              initialStep={1}
              backButtonText="Previous"
              nextButtonText="Continue"
              onFinalStepCompleted={onComplete}
              stepCircleContainerClassName="focusflow-stepper"
              contentClassName="focusflow-stepper-content"
              footerClassName="focusflow-stepper-footer"
              backButtonProps={{ className: 'stepper-back-btn' }}
              nextButtonProps={{ className: 'stepper-next-btn' }}
            >
              <Step>
                <div className="step-panel step-panel--center">
                  <h3>Welcome to FocusFlow</h3>
                  <p className="step-lead">Tell us how you&apos;ll use FocusFlow so we can tailor your experience.</p>
                  <div className="role-grid">
                    <button
                      type="button"
                      className={`role-card${role === 'teacher' ? ' active' : ''}`}
                      onClick={() => setRole('teacher')}
                    >
                      <span className="role-icon">👩‍🏫</span>
                      <strong>Classroom Teacher</strong>
                      <span>Elementary & middle school</span>
                    </button>
                    <button
                      type="button"
                      className={`role-card${role === 'homeschool' ? ' active' : ''}`}
                      onClick={() => setRole('homeschool')}
                    >
                      <span className="role-icon">🏠</span>
                      <strong>Homeschool Parent</strong>
                      <span>Structured daily support</span>
                    </button>
                  </div>
                  <p className="auth-switch">
                    Already have an account? <button type="button" className="link-btn" onClick={() => onAuth('login')}>Sign in</button>
                  </p>
                </div>
              </Step>

              <Step>
                <div className="step-panel step-panel--center">
                  <h3>Create your account</h3>
                  <p className="step-lead">Start supporting students with ADHD in minutes.</p>
                  <label htmlFor="ob-name">Full name</label>
                  <div className="input-wrap">
                    <input
                      id="ob-name"
                      className="input"
                      type="text"
                      placeholder="Alex Johnson"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      autoComplete="name"
                    />
                  </div>
                  <label htmlFor="ob-email">Email address</label>
                  <div className="input-wrap">
                    <input
                      id="ob-email"
                      className="input"
                      type="email"
                      placeholder="name@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      autoComplete="email"
                    />
                  </div>
                  <label htmlFor="ob-password">Password</label>
                  <div className="input-wrap">
                    <input
                      id="ob-password"
                      className="input"
                      type="password"
                      placeholder="Create a password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="divider">Or</div>
                  <GoogleButton />
                  <p className="auth-switch">
                    Already have an account? <button type="button" className="link-btn" onClick={() => onAuth('login')}>Sign in</button>
                  </p>
                </div>
              </Step>

              <Step>
                <div className="step-panel step-panel--center">
                  <div className="auth-icon" aria-hidden="true">✉</div>
                  <h3>Verify your email</h3>
                  <p className="step-lead">A 6-digit code was sent to <strong>{maskedEmail}</strong></p>
                  <div className="code-boxes" role="group" aria-label="Verification code">
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        maxLength={1}
                        inputMode="numeric"
                        pattern="[0-9]"
                        aria-label={`Digit ${i + 1}`}
                        value={digit}
                        onChange={(e) => handleCodeInput(i, e.target.value)}
                      />
                    ))}
                  </div>
                  <p className="auth-switch">Didn&apos;t receive a code? <a className="link" href="#">Resend</a></p>
                </div>
              </Step>

              <Step>
                <div className="step-panel step-panel--center">
                  <div className="success-badge" aria-hidden="true">✓</div>
                  <h3>You&apos;re all set!</h3>
                  <p className="step-lead">
                    Welcome to FocusFlow{form.name ? `, ${form.name.split(' ')[0]}` : ''}. Your {role === 'homeschool' ? 'homeschool' : 'classroom'} workspace is ready.
                  </p>
                </div>
              </Step>
            </Stepper>
          </div>
        </AuthPanel>
      </div>
    </div>
  );
}

export default function AuthOverlay({ view, onAuth, onClose }) {
  if (!view) return null;

  return (
    <div id="auth-overlay" className="auth-overlay active" aria-hidden="false">
      {view === 'login' && <LoginPanel onAuth={onAuth} />}
      {view === 'forgot' && <ForgotPasswordPanel onAuth={onAuth} />}
      {(view === 'onboarding' || view === 'signup' || view === 'verify') && (
        <OnboardingPanel onAuth={onAuth} onComplete={onClose} />
      )}
      <button type="button" className="auth-close" onClick={onClose} aria-label="Close auth">×</button>
    </div>
  );
}
