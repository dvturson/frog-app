/**
 * FrogAI preset responses. There is no real AI behind FrogAI (yet): the sheet on
 * AddEventPage picks one of these by chip or by keyword match on what the FROG types.
 * Edit freely: add a preset, tweak ideas, or add keywords.
 */

/**
 * @typedef {object} FrogAIIdea
 * @property {string} title
 * @property {string} location
 * @property {string} description
 * @property {number} minutes      suggested length (≥ 30)
 * @property {string} icebreaker   one line the FROG can read aloud
 */

/**
 * @typedef {object} FrogAIPreset
 * @property {string} id
 * @property {string} label        chip text
 * @property {string[]} keywords   lowercase words that select this preset when typed
 * @property {string} reply        what FrogAI "says" above the ideas
 * @property {FrogAIIdea[]} ideas
 */

/** @type {FrogAIPreset[]} */
export const FROG_AI_PRESETS = [
  {
    id: 'surprise',
    label: '🎲 Surprise me',
    keywords: [],
    reply: "Here's a mix of crowd favorites from past FROG Weeks. Each one gets people talking.",
    ideas: [
      {
        title: 'Sit with Strangers at D-Hall',
        location: 'D-Hall',
        description: 'Split up and sit at a table with people you have never met, then regroup.',
        minutes: 45,
        icebreaker: 'Find someone at your table who grew up farther away than you.',
      },
      {
        title: 'Downtown Scavenger Hunt',
        location: 'Court Square',
        description: 'Teams race to snap photos at downtown Harrisonburg landmarks.',
        minutes: 75,
        icebreaker: 'Each team picks a name that combines everyone’s hometowns.',
      },
      {
        title: 'Two Truths and a Lie on the Quad',
        location: 'The Quad',
        description: 'Circle up on the grass and guess who is bluffing.',
        minutes: 30,
        icebreaker: 'Make one of your truths something nobody here would guess.',
      },
    ],
  },
  {
    id: 'outdoors',
    label: '🌳 Outdoors',
    keywords: ['outdoor', 'outside', 'nature', 'walk', 'hike', 'sun', 'fresh air', 'park'],
    reply: 'Get them outside! These use some of the best spots on and around campus.',
    ideas: [
      {
        title: 'Arboretum Walk & Talk',
        location: 'Edith J. Carrier Arboretum',
        description: 'Walk the trails in pairs and swap partners at every bridge.',
        minutes: 60,
        icebreaker: 'Tell your partner about the best view you have ever seen.',
      },
      {
        title: 'Sunset on the Hill',
        location: 'Hillside Field',
        description: 'Bring a snack and watch the sunset with your group.',
        minutes: 45,
        icebreaker: 'What is one thing you want to do before graduation?',
      },
      {
        title: 'Quad Frisbee Mixer',
        location: 'The Quad',
        description: 'Casual ultimate frisbee where teams reshuffle every point.',
        minutes: 60,
        icebreaker: 'High-five everyone on your new team and learn one name.',
      },
    ],
  },
  {
    id: 'chill',
    label: '😌 Chill',
    keywords: ['chill', 'relax', 'calm', 'low key', 'lowkey', 'quiet', 'easy', 'tired'],
    reply: 'Low energy, still social. Good for the night after a big mandatory event.',
    ideas: [
      {
        title: 'Late-Night Board Games',
        location: 'Rose Library',
        description: 'Bring a game from home or borrow one. Swap tables every round.',
        minutes: 90,
        icebreaker: 'What game did your family always fight over?',
      },
      {
        title: 'Coffee & Questions',
        location: 'Starbucks at Carrier',
        description: 'Grab a drink and pull random question cards from a cup.',
        minutes: 45,
        icebreaker: 'What is your go-to order, and what does it say about you?',
      },
      {
        title: 'Playlist Swap',
        location: 'Student Union',
        description: 'Everyone adds two songs to a group playlist and explains one.',
        minutes: 30,
        icebreaker: 'Which song would play when you walk into a room?',
      },
    ],
  },
  {
    id: 'rainy',
    label: '🌧️ Rainy day',
    keywords: ['rain', 'indoor', 'inside', 'storm', 'wet', 'cold'],
    reply: 'Rain plan, sorted. All of these happen under a roof.',
    ideas: [
      {
        title: 'Club Meeting Crash',
        location: 'Student Union',
        description: 'Go together to a club meeting none of you would try alone.',
        minutes: 60,
        icebreaker: 'Pick the club you would never join, then go anyway.',
      },
      {
        title: 'UREC Rock Wall Challenge',
        location: 'UREC',
        description: 'Take turns on the climbing wall and cheer each other on.',
        minutes: 60,
        icebreaker: 'What is something you were scared to try but loved?',
      },
      {
        title: 'Festival Food Tour',
        location: 'Festival',
        description: 'Everyone tries one dish they have never had and rates it.',
        minutes: 45,
        icebreaker: 'What is the weirdest food combo you secretly love?',
      },
    ],
  },
  {
    id: 'icebreakers',
    label: '🧊 Just icebreakers',
    keywords: ['icebreaker', 'ice breaker', 'question', 'shy', 'awkward', 'quiet group', 'game'],
    reply: 'Shy group? Run any of these as its own event or at the start of another one.',
    ideas: [
      {
        title: 'Human Bingo',
        location: 'The Quad',
        description: 'Fill a bingo card by finding people who match each square.',
        minutes: 30,
        icebreaker: 'Find someone who has a pet that is not a cat or dog.',
      },
      {
        title: 'Speed Friending',
        location: 'Student Union',
        description: 'Two-minute chats, then rotate. Like speed dating, minus the dating.',
        minutes: 30,
        icebreaker: 'If you could add one class to JMU, what would it be?',
      },
      {
        title: 'Story Chain',
        location: 'Festival Lawn',
        description: 'Build a ridiculous story one sentence per person around the circle.',
        minutes: 30,
        icebreaker: 'Start the story with your name and a made-up superpower.',
      },
    ],
  },
];

/**
 * Picks the preset that best matches what the FROG typed.
 * Falls back to "Surprise me" when nothing matches.
 * @param {string} text
 * @returns {FrogAIPreset}
 */
export function matchPreset(text) {
  const q = text.toLowerCase();
  return FROG_AI_PRESETS.find((p) => p.keywords.some((k) => q.includes(k))) ?? FROG_AI_PRESETS[0];
}
