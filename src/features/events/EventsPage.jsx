/**
 * EVENTS TAB
 * TODO:
 * - [ ] Group "All days" by date with a sticky day header
 * - [ ] Show "Checked in" / "Confirmed" badge from the user's checkins
 * - [ ] Pull-to-refresh or realtime refresh when FROGs add events
 * - [ ] Real BeInvolved feed (see BeInvolvedList.jsx)
 */
import { useState } from 'react';
import Card from '../../components/Card';
import DayToggle from './DayToggle';
import EventList from './EventList';
import BeInvolvedList from './BeInvolvedList';
import { useEvents } from './useEvents';

export default function EventsPage() {
  const [range, setRange] = useState(/** @type {'today' | 'all'} */ ('today'));
  const { events, loading, error } = useEvents(range);

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-extrabold text-frog-900">Events</h1>

      <Card title="FROG events" action={<DayToggle value={range} onChange={setRange} />}>
        {loading ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <EventList
            events={events}
            showDay={range === 'all'}
            emptyText="No FROG events scheduled."
          />
        )}
      </Card>

      <Card title="More Weeks of Welcome">
        <BeInvolvedList />
      </Card>
    </div>
  );
}
