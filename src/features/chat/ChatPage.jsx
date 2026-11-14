/**
 * CHAT TAB (students + FROGs)
 * Students: Announcements (read-only) · My FROG (private DM) · Group
 * FROGs:    Announcements · Group · one DM per group member
 *
 * Currently MOCK DATA. TODO:
 * - [ ] Load messages: supabase.from('messages').select('*, author:profiles!messages_user_id_fkey(display_name)')
 *       filtered by channel (+ recipient for DMs). RLS already limits rows to your group.
 * - [ ] Realtime: supabase.channel(...).on('postgres_changes', { event: 'INSERT', table: 'messages' }, ...)
 *       (copy the pattern in features/leaderboard/useLeaderboard.js)
 * - [ ] Send: insert { frog_group_id, channel, recipient_id, body }. user_id is filled in by the DB.
 * - [ ] FROG member list from profiles where frog_group_id = mine and role = 'freshman'
 * - [ ] Auto-scroll to newest, unread dots
 */
import { useState } from 'react';
import { useAuth } from '../../lib/auth/useAuth';
import ChannelTabs from './ChannelTabs';
import MessageThread from './MessageThread';
import { MOCK_MEMBERS, MOCK_MESSAGES } from './mockMessages';

export default function ChatPage() {
  const { profile } = useAuth();
  const isFrog = profile.role === 'frog';

  const channels = isFrog
    ? [
        { id: 'announcements', label: '📣 Announcements' },
        { id: 'group', label: 'Group' },
        ...MOCK_MEMBERS.map((m) => ({ id: `dm:${m.id}`, label: m.display_name.split(' ')[0] })),
      ]
    : [
        { id: 'announcements', label: '📣 Announcements' },
        { id: 'frog', label: 'My FROG' },
        { id: 'group', label: 'Group' },
      ];

  const [active, setActive] = useState('announcements');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [draft, setDraft] = useState('');

  const readOnly = active === 'announcements' && !isFrog;

  /** @param {import('react').FormEvent} e */
  function send(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    // TODO: replace with a Supabase insert.
    const msg = { id: Date.now(), author: 'You', mine: true, body: draft.trim(), time: 'now' };
    setMessages((prev) => ({ ...prev, [active]: [...(prev[active] ?? []), msg] }));
    setDraft('');
  }

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col">
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-extrabold text-frog-900">Chat</h1>
        <p className="text-sm text-neutral-500">{profile.frog_group?.name}</p>
      </div>
      <ChannelTabs channels={channels} active={active} onSelect={setActive} />

      <div className="flex-1">
        <MessageThread messages={messages[active] ?? []} />
      </div>

      <div className="sticky bottom-16 border-t border-frog-100 bg-white p-3">
        {readOnly ? (
          <p className="text-center text-xs text-neutral-500">
            Only your FROG can post announcements.
          </p>
        ) : (
          <form onSubmit={send} className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={active === 'announcements' ? 'Post an announcement…' : 'Message…'}
              className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-frog-500"
            />
            <button
              type="submit"
              className="rounded-full bg-frog-600 px-4 text-sm font-semibold text-white"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
