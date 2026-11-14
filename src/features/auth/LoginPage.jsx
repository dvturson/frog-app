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

export default function LoginPage() {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [iAm, setIAm] = useState(/** @type {'student' | 'frog'} */ ('student'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  /** @param {import('react').FormEvent} e */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const profile = await signIn(email.trim(), password);
      const role = profile?.role;

      if (role !== 'freshman' && role !== 'frog' && role !== 'admin') {
        await signOut();
        setError(SORRY_MESSAGE);
        return;
      }
      const expected = iAm === 'frog' ? 'frog' : 'freshman';
      if (role !== 'admin' && role !== expected) {
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
        <p className="mt-4 text-center text-xs text-neutral-500">
          Demo accounts are listed in the README.
        </p>
      </div>
    </div>
  );
}
