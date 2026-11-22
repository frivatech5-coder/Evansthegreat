import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Compass,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useRebirth } from '../context/RebirthContext';
import { PWAInstallButton } from './PWAComponents';

type AuthMode = 'signin' | 'signup' | 'reset';

export const AuthScreen: React.FC = () => {
  const {
    user,
    emailVerified,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    resendVerificationEmail,
    refreshEmailVerification,
    clearAuthError,
    signOutUser,
    authError,
  } = useRebirth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('Evans');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setLocalError(null);
    setInfoNotice(null);
    clearAuthError();
  };

  const handleGoogleSignIn = async () => {
    setBusy(true);
    setLocalError(null);
    setInfoNotice(null);
    try {
      await signInWithGoogle();
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setInfoNotice(null);
    clearAuthError();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setLocalError('Please enter your email address.');
      return;
    }

    if (mode === 'reset') {
      setBusy(true);
      try {
        await sendPasswordReset(trimmedEmail);
        setInfoNotice(
          `Password reset link sent to ${trimmedEmail}. Check your inbox or spam folder.`
        );
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Could not send reset email.');
      } finally {
        setBusy(false);
      }
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(trimmedEmail, password);
      } else {
        await signUpWithEmail(trimmedEmail, password, name.trim() || 'Evans');
        setInfoNotice('Account created. Verify your email address to enter.');
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleCheckVerified = async () => {
    setBusy(true);
    setLocalError(null);
    setInfoNotice(null);
    try {
      const ok = await refreshEmailVerification();
      if (!ok) {
        setInfoNotice(
          'Your email is not verified yet. Open the verification link in your inbox, then click this button again.'
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResendVerification = async () => {
    setBusy(true);
    setLocalError(null);
    setInfoNotice(null);
    try {
      await resendVerificationEmail();
      setInfoNotice(`Verification email sent again to ${user?.email || 'your email'}.`);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Could not resend verification email.');
    } finally {
      setBusy(false);
    }
  };

  const activeError = localError || authError;

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col">
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-8 border-b border-zinc-800/80">
        <span className="font-display text-xl font-semibold tracking-wide text-white whitespace-nowrap shrink-0">
          PROJECT REBIRTH
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <PWAInstallButton />
          {!user ? (
            <button
              type="button"
              onClick={() => void handleGoogleSignIn()}
              disabled={busy}
              className="px-4 py-2 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
            >
              {busy ? 'Connecting...' : 'Enter with Google'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-700 text-xs font-medium text-zinc-200 hover:bg-zinc-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 lg:py-14 grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-mono tracking-[0.2em] text-[#C8A24A] uppercase">
              Jishinde Ushinde · Conquer Yourself to Conquer
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold text-white leading-[1.08] [text-wrap:balance]">
              A personal mastery system for discipline, faith, craft, and independent thought.
            </h1>
            <p className="text-base text-zinc-400 max-w-xl leading-relaxed">
              Built for young builders committed to mastering software engineering, walking faithfully with Jesus Christ, stewarding money with wisdom, and standing free from peer pressure.
            </p>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-[#111114] h-52 sm:h-60">
            <img
              src="/src/assets/images/hero_rebirth_monolith_1795373490130.jpg"
              alt="Obsidian stone monolith with brushed gold geometric inlay representing PROJECT REBIRTH"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/40 to-transparent flex flex-col justify-end p-5">
              <p className="text-xs font-mono text-[#C8A24A] uppercase tracking-widest">
                Private Academy Operating System
              </p>
              <p className="text-sm text-zinc-200 mt-1">
                Every habit, prayer, line of code, and decision tracked privately under your verified account.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800/80">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-[#C8A24A]">
                <Code2 className="w-4 h-4" />
                <span>Pillar I · The Builder</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                10 structured engineering &amp; enterprise modules, projects, and coding logs.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-[#C8A24A]">
                <BookOpen className="w-4 h-4" />
                <span>Pillar II · Man of God</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Scripture study, prayer journal, 8 character virtues, and daily examination.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-[#C8A24A]">
                <Compass className="w-4 h-4" />
                <span>Pillar III · The Thinker</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Logic puzzles, financial ledger, self-discovery, and peer-pressure immunity.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Auth Card / Email Verification */}
        <div className="lg:col-span-5 rounded-xl border border-zinc-800 bg-[#111114] p-6 sm:p-7 space-y-5">
          {user && !emailVerified ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#C8A24A]">
                  Verification Required
                </p>
                <h2 className="text-2xl font-display font-semibold text-white">
                  Verify Your Email Address
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Private Firestore records require a verified email. Open the verification link sent to{' '}
                  <span className="text-zinc-100 font-medium">{user.email}</span> (check Spam if needed), then continue below.
                </p>
              </div>

              {activeError && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-xs text-red-200">
                  {activeError}
                </div>
              )}

              {infoNotice && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-xs text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{infoNotice}</span>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => void handleCheckVerified()}
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] transition-colors cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
                  <span>I&apos;ve Verified — Enter Academy</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleResendVerification()}
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-zinc-700 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Mail className="w-4 h-4" />
                  <span>Resend Verification Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => void signOutUser()}
                  disabled={busy}
                  className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Use a different email or Google account
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#C8A24A]">
                  Member Access
                </p>
                <h2 className="text-2xl font-display font-semibold text-white">
                  {mode === 'signin'
                    ? 'Sign In to Your Account'
                    : mode === 'signup'
                      ? 'Create Your Account'
                      : 'Reset Your Password'}
                </h2>
              </div>

              {mode !== 'reset' && (
                <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#09090B] border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className={`py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      mode === 'signin'
                        ? 'bg-[#18181C] text-[#C8A24A]'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Email Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className={`py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      mode === 'signup'
                        ? 'bg-[#18181C] text-[#C8A24A]'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {activeError && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-xs text-red-200 leading-relaxed">
                  {activeError}
                </div>
              )}

              {infoNotice && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-xs text-emerald-200 flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{infoNotice}</span>
                </div>
              )}

              <form onSubmit={(e) => void handleEmailSubmit(e)} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Evans"
                      className="w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#C8A24A]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={160}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#C8A24A]"
                  />
                </div>

                {mode !== 'reset' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-zinc-400">
                        Password
                      </label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => switchMode('reset')}
                          className="text-xs text-[#C8A24A] hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full rounded-lg border border-zinc-800 bg-[#09090B] pl-3.5 pr-10 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#C8A24A]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#C8A24A]"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] transition-colors cursor-pointer disabled:opacity-60"
                >
                  {mode === 'reset' ? (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>{busy ? 'Sending...' : 'Send Reset Link'}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {busy
                          ? 'Authenticating...'
                          : mode === 'signin'
                            ? 'Sign In with Email'
                            : 'Create Verified Account'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {mode === 'reset' && (
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    Back to Email Sign In
                  </button>
                )}
              </form>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#111114] px-3 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleGoogleSignIn()}
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2.5 py-2.5 rounded-lg border border-zinc-700 bg-[#18181C] text-zinc-100 text-xs font-semibold hover:border-[#C8A24A] transition-colors cursor-pointer disabled:opacity-60"
              >
                <span>{busy ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>

              <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C8A24A] shrink-0" />
                <span>Private user-isolated Firestore storage &amp; offline sync</span>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
