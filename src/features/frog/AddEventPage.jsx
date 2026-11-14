/**
 * FROG / ADD EVENT: create one of up to 3 optional events for a day.
 * The database enforces the 30-minute minimum and the 3-per-day limit too.
 * FrogAI button (bottom right) opens FrogAISheet, which uses preset responses
 * from frogAIPresets.js (no real AI). Picking an idea fills in the form.
 * TODO:
 * - [ ] Location picker with common JMU spots
 * - [ ] Auto-post an announcement to the group chat when an event is created
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import FrogMascot from '../../components/FrogMascot';
import FrogAISheet from './FrogAISheet';

const MIN_MINUTES = 30;

/** @returns {string} today as YYYY-MM-DD in local time */
function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Adds minutes to an "HH:MM" time, clamped to 23:59 so it stays on the same day.
 * @param {string} time
 * @param {number} minutes
 * @returns {string}
 */
function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
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

  /**
   * Fills the form from a FrogAI idea. Sets the end time too if a start time is set.
   * @param {import('./frogAIPresets').FrogAIIdea} idea
   */
  function pickIdea(idea) {
    setForm((f) => ({
      ...f,
      title: idea.title,
      location: idea.location,
      description: idea.description,
      end: f.start ? addMinutes(f.start, Math.max(idea.minutes, MIN_MINUTES)) : f.end,
    }));
    setAiOpen(false);
  }

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
        className="text-base font-semibold text-frog-700"
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
        className="fixed bottom-24 right-[max(1rem,calc(50%-195px+1rem))] z-30 flex items-center gap-2 rounded-full bg-frog-700 py-2 pl-2 pr-4 text-base font-bold text-white shadow-lg"
      >
        <FrogMascot mood="happy" size={32} /> FrogAI
      </button>

      <FrogAISheet open={aiOpen} onClose={() => setAiOpen(false)} onPick={pickIdea} />
    </div>
  );
}
