/**
 * "Today | All days" segmented toggle.
 * @param {{ value: 'today' | 'all', onChange: (v: 'today' | 'all') => void }} props
 */
export default function DayToggle({ value, onChange }) {
  const options = [
    { id: 'today', label: 'Today' },
    { id: 'all', label: 'All days' },
  ];
  return (
    <div className="inline-flex rounded-full bg-frog-50 p-0.5 text-sm font-semibold" role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-3 py-1 ${value === o.id ? 'bg-white text-frog-800 shadow-sm' : 'text-frog-600'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
