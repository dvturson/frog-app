// TODO: replace with a real fetch from JMU BeInvolved (likely needs a small
// serverless proxy because of CORS). Shape is guessed; adjust when known.
/** @type {{ id: string, title: string, when: string, where: string }[]} */
const MOCK_BEINVOLVED = [
  { id: 'b1', title: 'Student Org Fair', when: 'Tomorrow · 4:00 PM', where: 'Festival Lawn' },
  {
    id: 'b2',
    title: 'UREC Open House',
    when: 'Sat · 11:00 AM',
    where: 'University Recreation Center',
  },
  { id: 'b3', title: 'Late Night Breakfast', when: 'Sat · 10:00 PM', where: 'E-Hall' },
];

export const BEINVOLVED_URL = 'https://beinvolved.jmu.edu/events';

/** Next 3 non-FROG Weeks of Welcome events + link out to BeInvolved. */
export default function BeInvolvedList() {
  return (
    <div>
      <ul className="mb-3 space-y-2">
        {MOCK_BEINVOLVED.map((e) => (
          <li key={e.id} className="rounded-xl bg-neutral-50 px-3 py-2">
            <p className="text-sm font-semibold">{e.title}</p>
            <p className="text-xs text-neutral-500">
              {e.when} · {e.where}
            </p>
          </li>
        ))}
      </ul>
      <a
        href={BEINVOLVED_URL}
        target="_blank"
        rel="noreferrer"
        className="block w-full rounded-xl border-2 border-frog-600 px-4 py-3 text-center text-sm font-semibold text-frog-700 hover:bg-frog-50"
      >
        See more on BeInvolved!
      </a>
    </div>
  );
}
