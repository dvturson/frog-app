import FrogScene from '../../components/FrogScene';

/**
 * Chat bubbles. Your messages sit on the right in green.
 * @param {{ messages: { id: number | string, author: string, mine?: boolean, body: string, time: string }[] }} props
 */
export default function MessageThread({ messages }) {
  if (messages.length === 0) {
    return <FrogScene scene="tea">No messages yet. Say hi!</FrogScene>;
  }
  return (
    <ul className="space-y-3 px-4 py-3">
      {messages.map((m) => (
        <li key={m.id} className={`flex flex-col ${m.mine ? 'items-end' : 'items-start'}`}>
          {!m.mine && (
            <span className="mb-0.5 text-xs font-semibold text-neutral-500">{m.author}</span>
          )}
          <p
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
              m.mine ? 'rounded-br-sm bg-frog-600 text-white' : 'rounded-bl-sm bg-neutral-100'
            }`}
          >
            {m.body}
          </p>
          <span className="mt-0.5 text-[10px] text-neutral-400">{m.time}</span>
        </li>
      ))}
    </ul>
  );
}
