import { Link } from 'react-router-dom';
import { eventPhase, formatDay, formatTime } from './eventPhase';

/** @param {{ event: import('../../lib/types').LeapEvent }} props */
function EventBadges({ event }) {
  const phase = eventPhase(event);
  return (
    <div className="flex flex-wrap gap-1">
      {event.type === 'frogolympics' && (
        <span className="rounded-full bg-gold-400/25 px-2 py-0.5 text-[11px] font-semibold text-gold-500">
          FROGolympics
        </span>
      )}
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${event.is_mandatory ? 'bg-frog-100 text-frog-800' : 'bg-neutral-100 text-neutral-600'}`}
      >
        {event.is_mandatory ? 'Mandatory' : 'Optional'}
      </span>
      {(phase === 'checkin' || phase === 'attendance') && (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
          Live
        </span>
      )}
    </div>
  );
}

/**
 * Chronological list of events.
 * @param {{
 *   events: import('../../lib/types').LeapEvent[],
 *   showDay?: boolean,                          show the date on each row (for "All days")
 *   linkTo?: (event: import('../../lib/types').LeapEvent) => string,  make rows tappable
 *   emptyText?: string,
 * }} props
 */
export default function EventList({
  events,
  showDay = false,
  linkTo,
  emptyText = 'No events yet.',
}) {
  if (events.length === 0) return <p className="text-sm text-neutral-500">{emptyText}</p>;

  return (
    <ul className="divide-y divide-frog-100">
      {events.map((event) => {
        const body = (
          <div className="flex gap-3 py-3">
            <div className="w-16 shrink-0 text-xs font-semibold text-frog-700">
              {showDay && <div className="text-neutral-500">{formatDay(event.starts_at)}</div>}
              {formatTime(event.starts_at)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{event.title}</p>
              <p className="truncate text-xs text-neutral-500">
                {event.location_name} · until {formatTime(event.ends_at)}
              </p>
              <div className="mt-1">
                <EventBadges event={event} />
              </div>
            </div>
          </div>
        );
        return (
          <li key={event.id}>
            {linkTo ? (
              <Link to={linkTo(event)} className="block rounded-lg hover:bg-frog-50">
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}
