/**
 * FROG / ADD EVENT: create one of up to 3 optional events for a day.
 * The database enforces the 30-minute minimum and the 3-per-day limit too.
 * FrogAI button (bottom right) is a placeholder.
 * TODO:
 * - [ ] FrogAI: call an LLM through a Supabase Edge Function (never put API keys
 *       in the frontend), seeded with previous years' FROG events
 * - [ ] Location picker with common JMU spots
 * - [ ] Auto-post an announcement to the group chat when an event is created
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import FrogMascot from '../../components/FrogMascot';
import Sheet from '../../components/Sheet';

const MIN_MINUTES = 30;

/** Static ideas until FrogAI is real. */
const IDEAS = [
  { title: 'Two Truths and a Lie on the Quad', location: 'The Quad' },
  { title: 'Sit with Strangers at D-Hall', location: 'D-Hall' },
  { title: 'Downtown Harrisonburg Scavenger Hunt', location: 'Court Square' },
  { title: 'Arboretum Walk & Talk', location: 'Edith J. Carrier Arboretum' },
  { title: 'Club Meeting Crash', location: 'Student Union' },
];

/** @returns {string} today as YYYY-MM-DD in local time */
function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const inputClass =
  'mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-frog-500 focus:ring-2 focus:ring-frog-200';

export default function AddEventPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    location: '',
    date: todayString(),
    start: '',
    end: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  /** @param {keyof typeof form} key */
  const field = (key) => ({
    value: form[key],
    onChange: (/** @type {import('react').ChangeEvent<HTMLInputElement>} */ e) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  /** @param {import('react').FormEvent} e */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const startsAt = new Date(`${form.date}T${form.start}`);
    const endsAt = new Date(`${form.date}T${form.end}`);
    if ((endsAt.getTime() - startsAt.getTime()) / 60000 < MIN_MINUTES) {
      setError(`Events must be at least ${MIN_MINUTES} minutes long.`);
      return;
    }

    setBusy(true);
    const { error: dbError } = await supabase.from('events').insert({
      title: form.title.trim(),
      location_name: form.location.trim(),
      description: form.description.trim() || null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      frog_group_id: profile.frog_group_id,
    });
    setBusy(false);
    if (dbError) setError(dbError.message);
    else navigate('/frog', { replace: true });
  }

  return (
    <div className="p-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm font-semibold text-frog-700"
      >
        ← Back
      </button>
      <h1 className="mt-2 text-2xl font-extrabold text-frog-900">Add optional event</h1>
      <p className="text-sm text-neutral-500">Up to 3 per day. At least 30 minutes long.</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block text-sm font-semibold">
          Event name
          <input required className={inputClass} {...field('title')} />
        </label>
        <label className="block text-sm font-semibold">
          Location
          <input required className={inputClass} {...field('location')} />
        </label>
        <label className="block text-sm font-semibold">
          Date
          <input type="date" required className={inputClass} {...field('date')} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold">
            Starts
            <input type="time" required className={inputClass} {...field('start')} />
          </label>
          <label className="block text-sm font-semibold">
            Ends
            <input type="time" required className={inputClass} {...field('end')} />
          </label>
        </div>
        <label className="block text-sm font-semibold">
          Description (optional)
          <input className={inputClass} {...field('description')} />
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <Button type="submit" full disabled={busy}>
          {busy ? 'Creating…' : 'Create event'}
        </Button>
      </form>

      {/* FrogAI floating button, pinned to the phone column's bottom-right */}
      <button
        type="button"
        onClick={() => setAiOpen(true)}
        className="fixed bottom-24 right-[max(1rem,calc(50%-195px+1rem))] z-30 flex items-center gap-2 rounded-full bg-frog-700 py-2 pl-2 pr-4 text-sm font-bold text-white shadow-lg"
      >
        <FrogMascot mood="happy" size={32} /> FrogAI
      </button>

      <Sheet open={aiOpen} onClose={() => setAiOpen(false)} title="FrogAI (coming soon)">
        <p className="mb-3 text-sm text-neutral-500">
          FrogAI will suggest icebreakers and events based on previous years. For now, tap an idea
          to use it:
        </p>
        <ul className="space-y-2">
          {IDEAS.map((idea) => (
            <li key={idea.title}>
              <button
                type="button"
                className="w-full rounded-xl bg-frog-50 px-3 py-2 text-left text-sm font-semibold text-frog-800 hover:bg-frog-100"
                onClick={() => {
                  setForm((f) => ({ ...f, title: idea.title, location: idea.location }));
                  setAiOpen(false);
                }}
              >
                {idea.title}
                <span className="block text-xs font-normal text-neutral-500">{idea.location}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  );
}
