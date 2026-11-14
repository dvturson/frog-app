// TODO: delete this file once ChatPage reads from the `messages` table.

/** @type {{ id: string, display_name: string }[]} */
export const MOCK_MEMBERS = [
  { id: 'a0000000-0000-0000-0000-000000000001', display_name: 'Maya Johnson' },
  { id: 'a0000000-0000-0000-0000-000000000002', display_name: 'Ethan Nguyen' },
  { id: 'a0000000-0000-0000-0000-000000000003', display_name: 'Olivia Martinez' },
  { id: 'a0000000-0000-0000-0000-000000000004', display_name: 'Noah Williams' },
];

/**
 * Keyed by channel id ('announcements', 'group', 'frog', or 'dm:<memberId>').
 * @type {Record<string, { id: number, author: string, mine?: boolean, body: string, time: string }[]>}
 */
export const MOCK_MESSAGES = {
  announcements: [
    {
      id: 1,
      author: 'Alex (FROG)',
      body: 'Welcome, Duke Dogs! Meet at the Arboretum entrance at 1.',
      time: '11:02 AM',
    },
    {
      id: 2,
      author: 'Alex (FROG)',
      body: 'D-Hall lunch is starting! Sit with someone NOT in our group.',
      time: '12:55 PM',
    },
  ],
  group: [
    {
      id: 3,
      author: 'Maya',
      body: 'Anyone want to walk to the Arboretum together from Eagle?',
      time: '11:30 AM',
    },
    { id: 4, author: 'Ethan', body: 'Yes! Lobby at 12:45', time: '11:32 AM' },
    { id: 5, author: 'Noah', body: 'We are SO winning the relay tomorrow', time: '12:30 PM' },
  ],
  frog: [
    {
      id: 6,
      author: 'You',
      mine: true,
      body: 'Is it okay if I come late to the walk?',
      time: '10:00 AM',
    },
    {
      id: 7,
      author: 'Alex (FROG)',
      body: 'Totally fine, just scan in when you get there!',
      time: '10:10 AM',
    },
  ],
};
