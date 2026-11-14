/**
 * CHAT TAB (students + FROGs)
 * Students: Announcements (read-only) · My FROG (private DM) · Group
 * FROGs:    Announcements · Group · one DM per group member
 *
 * Messages are stored in the `messages` table (see useChat.js), so history
 * persists across sessions and devices and updates live via Realtime.
 *
 * TODO:
 * - [ ] Unread dots
 */
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../lib/auth/useAuth';
import ChannelTabs from './ChannelTabs';
import MessageThread from './MessageThread';
import { useChat } from './UseChat';

/**
 * Chat page: channel tabs, persisted message thread, composer.
 * @returns {import('react').JSX.Element}
 */
export default function ChatPage() {
  const { profile } = useAuth();
  const isFrog = profile.role === 'frog';
  const { members, threads, loading, error, send } = useChat(profile);

  const channels = isFrog
    ? [
        { id: 'announcements', label: '📣 Announcements' },
        { id: 'group', label: 'Group' },
        ...members.map((m) => ({ id: `dm:${m.id}`, label: m.display_name.split(' ')[0] })),
      ]
    : [
        { id: 'announcements', label: '📣 Announcements' },
        { id: 'frog', label: 'My FROG' },
        { id: 'group', label: 'Group' },
      ];

  const [active, setActive] = useState('announcements');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const readOnly = active === 'announcements' && !isFrog;
  const messages = threads[active] ?? [];

  // Keep the newest message in view when switching channels or when one arrives.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [active, messages.length, loading]);

  /** @param {import('react').FormEvent} e */
  async function onSubmit(e) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    const ok = await send(active, draft);
    setSending(false);
    if (ok) setDraft('');
  }

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col">
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-extrabold text-frog-900">Chat</h1>
        <p className="text-sm text-neutral-500">{profile.frog_group?.name}</p>
      </div>
      <ChannelTabs channels={channels} active={active} onSelect={setActive} />

      <div className="flex-1">
        {loading ? (
          <p className="p-6 text-center text-sm text-neutral-400">Loading messages…</p>
        ) : (
          <MessageThread messages={messages} />
        )}
        <div ref={bottomRef} className="h-16" />
      </div>

      <div className="sticky bottom-16 border-t border-frog-100 bg-white p-3">
        {error && (
          <p role="alert" className="mb-2 text-center text-xs text-red-600">
            {error}
          </p>
        )}
        {readOnly ? (
          <p className="text-center text-xs text-neutral-500">
            Only your FROG can post announcements.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={2000}
              placeholder={active === 'announcements' ? 'Post an announcement…' : 'Message…'}
              className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-frog-500"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="rounded-full bg-frog-600 px-5 text-base font-semibold text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
