/**
 * Horizontally scrolling channel chips.
 * @param {{
 *   channels: { id: string, label: string }[],
 *   active: string,
 *   onSelect: (id: string) => void,
 * }} props
 */
export default function ChannelTabs({ channels, active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2" role="tablist">
      {channels.map((c) => (
        <button
          key={c.id}
          type="button"
          role="tab"
          aria-selected={active === c.id}
          onClick={() => onSelect(c.id)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-base font-semibold ${
            active === c.id ? 'bg-frog-600 text-white' : 'bg-frog-50 text-frog-700'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
