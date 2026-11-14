/**
 * FROG / QR: rotating check-in QR for one event.
 *   upcoming   -> countdown ("QR appears 5 minutes before start")
 *   checkin    -> QR from get_event_code(), refreshed every 20 seconds
 *   attendance -> automatically switches to the Attendance page
 * TODO:
 * - [ ] Live count of students who have scanned (checkins realtime)
 * - [ ] Keep the screen awake (Wake Lock API) and max brightness hint
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../../lib/supabase';
import FrogMascot from '../../components/FrogMascot';
import { useEvent } from '../events/useEvents';
import { eventPhase, formatTime } from '../events/eventPhase';
import { encodeCheckinQR } from '../checkin/qrPayload';

const WINDOW_MS = 20_000;

export default function EventQRPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { event, loading, error } = useEvent(eventId);
  const [now, setNow] = useState(() => Date.now());
  const [code, setCode] = useState(/** @type {string | null} */ (null));
  const [codeError, setCodeError] = useState('');

  // Tick every second for the countdown + phase changes.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const phase = event ? eventPhase(event, now) : null;
  const windowIndex = Math.floor(now / WINDOW_MS);

  // Fetch a fresh code whenever a new 20s window starts.
  useEffect(() => {
    if (phase !== 'checkin') return;
    let cancelled = false;
    supabase.rpc('get_event_code', { p_event_id: eventId }).then(({ data, error: rpcError }) => {
      if (cancelled) return;
      setCode(data);
      setCodeError(rpcError?.message ?? '');
    });
    return () => {
      cancelled = true;
    };
  }, [phase, windowIndex, eventId]);

  // Halfway through: hand off to attendance.
  useEffect(() => {
    if (phase === 'attendance' || phase === 'over') {
      navigate(`/frog/events/${eventId}/attendance`, { replace: true });
    }
  }, [phase, eventId, navigate]);

  if (loading) return <p className="p-6 text-center text-sm text-neutral-500">Loading…</p>;
  if (error || !event)
    return <p className="p-6 text-center text-sm text-red-600">{error ?? 'Event not found'}</p>;

  const secondsLeft = Math.ceil((WINDOW_MS - (now % WINDOW_MS)) / 1000);
  const minutesUntilOpen = Math.ceil(
    (new Date(event.starts_at).getTime() - 5 * 60_000 - now) / 60_000,
  );

  return (
    <div className="flex flex-col items-center p-4 text-center">
      <button
        type="button"
        onClick={() => navigate('/frog')}
        className="self-start text-sm font-semibold text-frog-700"
      >
        ← FROG Tools
      </button>
      <h1 className="mt-2 text-xl font-extrabold text-frog-900">{event.title}</h1>
      <p className="text-sm text-neutral-500">
        {event.location_name} · {formatTime(event.starts_at)}–{formatTime(event.ends_at)}
      </p>

      {phase === 'upcoming' && (
        <div className="mt-8 flex flex-col items-center">
          <FrogMascot mood="wave" size={120} />
          <p className="mt-3 font-semibold text-frog-800">
            The QR code appears 5 minutes before start.
          </p>
          <p className="text-sm text-neutral-500">Opens in about {minutesUntilOpen} min.</p>
        </div>
      )}

      {phase === 'checkin' && (
        <div className="mt-6 flex flex-col items-center">
          {code ? (
            <div className="rounded-3xl border-4 border-frog-600 bg-white p-4">
              <QRCodeSVG value={encodeCheckinQR(event.id, code)} size={260} level="M" />
            </div>
          ) : (
            <div className="flex h-[292px] w-[292px] items-center justify-center rounded-3xl bg-frog-50 text-sm text-neutral-500">
              {codeError || 'Loading code…'}
            </div>
          )}
          <p className="mt-3 font-mono text-2xl font-bold tracking-[0.3em] text-frog-800">
            {code ?? '······'}
          </p>
          <div className="mt-3 h-2 w-64 overflow-hidden rounded-full bg-frog-100">
            <div
              className="h-full bg-frog-500 transition-all"
              style={{ width: `${(secondsLeft / 20) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-neutral-500">New code in {secondsLeft}s</p>
          <p className="mt-4 text-sm text-neutral-600">
            Have students scan this from the Path tab → Scan QR.
          </p>
        </div>
      )}
    </div>
  );
}
