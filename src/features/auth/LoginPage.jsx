/**
 * LOGIN: mock JMU SSO screen backed by Supabase email + password.
 * The "I am a…" choice must match the role on the roster; admins skip that check.
 * TODO:
 * - [ ] Make it look closer to JMU's real SSO page (designer)
 * - [ ] "Forgot password" for the demo (or hide it)
 * - [ ] Real JMU SSO (SAML) is out of scope for the hackathon
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';
import Button from '../../components/Button';
import FrogMascot from '../../components/FrogMascot';

export const SORRY_MESSAGE =
  'Sorry, you cannot use JMU LEAP at this time. Please contact somebody@jmu.edu if you believe that this is a mistake.';

/** Where each role lands after signing in. */
const HOME_BY_ROLE = { freshman: '/', frog: '/frog', admin: '/admin' };

/**
 * Public demo mode: one-tap demo buttons, and a wrong "I am a…" pick still signs in.
 * On by default. Set VITE_DEMO_MODE=false for a real deployment.
 */
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

/** Seeded demo accounts (see README). Both are in Duke Dogs, so their chats connect. */
const DEMO_ACCOUNTS = /** @type {const} */ ([
  { iAm: 'student', label: '🎓 Student', email: 'student1@leap.demo' },
  { iAm: 'frog', label: '🐸 FROG', email: 'frog1@leap.demo' },
]);
const DEMO_PASSWORD = 'LeapFrog2026!';

/** How long the filled-in form stays visible before a demo sign-in submits. */
const DEMO_SUBMIT_DELAY_MS = 600;

/**
 * Mock JMU SSO login, with one-tap demo accounts when DEMO_MODE is on.
 * @returns {import('react').JSX.Element}
 */
export default function LoginPage() {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [iAm, setIAm] = useState(/** @type {'student' | 'frog'} */ ('student'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  /** @param {import('react').FormEvent} e */
  function handleSubmit(e) {
    e.preventDefault();
    attemptSignIn(email, password, iAm);
  }

  /**
   * Fill the form with a demo account, show it briefly, then sign in.
   * @param {(typeof DEMO_ACCOUNTS)[number]} account
   */
  function handleDemo(account) {
    setIAm(account.iAm);
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setError('');
    setBusy(true);
    setTimeout(() => attemptSignIn(account.email, DEMO_PASSWORD, account.iAm), DEMO_SUBMIT_DELAY_MS);
  }

  /**
   * Sign in and send the user to their role's home page.
   * Values are passed in (not read from state) so demo buttons can call this right away.
   * @param {string} emailValue
   * @param {string} passwordValue
   * @param {'student' | 'frog'} iAmValue
   * @returns {Promise<void>}
   */
  async function attemptSignIn(emailValue, passwordValue, iAmValue) {
    setError('');
    setBusy(true);
    try {
      const profile = await signIn(emailValue.trim(), passwordValue);
      const role = profile?.role;

      if (role !== 'freshman' && role !== 'frog' && role !== 'admin') {
        await signOut();
        setError(SORRY_MESSAGE);
        return;
      }
      const expected = iAmValue === 'frog' ? 'frog' : 'freshman';
      // In demo mode a wrong pick is not worth blocking; go to the account's real home.
      if (!DEMO_MODE && role !== 'admin' && role !== expected) {
        await signOut();
        setError(
          `This account is registered as a ${role === 'frog' ? 'FROG' : 'Student'}. Pick that option and try again.`,
        );
        return;
      }
      navigate(HOME_BY_ROLE[role], { replace: true });
    } catch {
      setError('Wrong email or password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-frog-50">
      <div className="flex items-center gap-2 bg-frog-700 px-4 py-3 text-white">
        <Link to="/" className="text-sm font-bold">
          ← JMU LEAP
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pt-8">
        <FrogMascot mood="happy" size={80} />
        <form onSubmit={handleSubmit} className="mt-4 w-full rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
            JMU Single Sign-On (mock)
          </p>

          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-bold text-frog-900">I am a…</legend>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'frog', label: 'Frog' },
                { id: 'student', label: 'Student' },
              ].map((o) => (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-full border py-2 text-base font-semibold ${
                    iAm === o.id
                      ? 'border-frog-600 bg-frog-50 text-frog-800'
                      : 'border-neutral-200 text-neutral-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="iAm"
                    value={o.id}
                    checked={iAm === o.id}
                    onChange={() => setIAm(/** @type {'student' | 'frog'} */ (o.id))}
                    className="accent-frog-600"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-4 block text-sm font-semibold text-neutral-700">
            JMU email
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dukedog@leap.demo"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-frog-500 focus:ring-2 focus:ring-frog-200"
            />
          </label>
          <label className="mt-3 block text-sm font-semibold text-neutral-700">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-frog-500 focus:ring-2 focus:ring-frog-200"
            />
          </label>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {!isSupabaseConfigured && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Supabase isn&apos;t configured. Copy <code>.env.example</code> to <code>.env</code>{' '}
              and restart.
            </p>
          )}

          <Button type="submit" full className="mt-5" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        {DEMO_MODE ? (
          <div className="mt-4 w-full rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-center text-sm font-bold text-frog-900">Just exploring?</p>
            <p className="text-center text-xs text-neutral-500">Try the demo with one tap</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <Button
                  key={a.iAm}
                  type="button"
                  variant="secondary"
                  full
                  disabled={busy}
                  onClick={() => handleDemo(a)}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-center text-xs text-neutral-500">
            Demo accounts are listed in the README.
          </p>
        )}
      </div>
    </div>
  );
}
