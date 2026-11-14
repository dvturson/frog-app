import { useEffect, useRef, useState } from 'react';
import Button from '../../components/Button';
import FrogMascot from '../../components/FrogMascot';
import Sheet from '../../components/Sheet';
import { FROG_AI_PRESETS, matchPreset } from './frogAIPresets';

/** Fake "thinking" time so FrogAI feels like it's working. */
const THINK_MS = 900;

/**
 * FrogAI bottom sheet. Uses preset responses (see frogAIPresets.js), not a real AI.
 * The FROG taps a chip or types a vibe; FrogAI "thinks", then shows ideas to pick from.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onPick: (idea: import('./frogAIPresets').FrogAIIdea) => void,
 * }} props
 * @returns {import('react').ReactElement}
 */
export default function FrogAISheet({ open, onClose, onPick }) {
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  /** @type {[import('./frogAIPresets').FrogAIPreset | null, Function]} */
  const [preset, setPreset] = useState(null);
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  /** @param {import('./frogAIPresets').FrogAIPreset} next */
  function respond(next) {
    clearTimeout(timer.current);
    setThinking(true);
    setPreset(null);
    timer.current = window.setTimeout(() => {
      setPreset(next);
      setThinking(false);
    }, THINK_MS);
  }

  return (
    <Sheet open={open} onClose={onClose} title="FrogAI">
      <div className="mb-3 flex items-start gap-2">
        <FrogMascot mood={thinking ? 'wave' : 'happy'} size={40} className="shrink-0" />
        <p className="rounded-2xl rounded-tl-sm bg-frog-50 px-3 py-2 text-sm text-frog-900">
          {thinking
            ? 'Hmm, let me think…'
            : (preset?.reply ?? 'Ribbit! What kind of event are you planning?')}
        </p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          respond(matchPreset(text));
        }}
      >
        <input
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-frog-500 focus:ring-2 focus:ring-frog-200"
          placeholder="e.g. something outdoors"
          maxLength={200}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" disabled={thinking}>
          Ask
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {FROG_AI_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={thinking}
            onClick={() => respond(p)}
            className="rounded-full border border-frog-300 px-3 py-1 text-xs font-semibold text-frog-800 hover:bg-frog-50 disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset && (
        <ul className="mt-4 space-y-2">
          {preset.ideas.map((idea) => (
            <li key={idea.title}>
              <button
                type="button"
                onClick={() => onPick(idea)}
                className="w-full rounded-xl bg-frog-50 px-3 py-2 text-left text-sm font-semibold text-frog-800 hover:bg-frog-100"
              >
                {idea.title}
                <span className="block text-xs font-normal text-neutral-500">
                  {idea.location} · {idea.minutes} min
                </span>
                <span className="mt-1 block text-xs font-normal text-neutral-700">
                  {idea.description}
                </span>
                <span className="mt-1 block text-xs font-normal italic text-frog-700">
                  Icebreaker: {idea.icebreaker}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
