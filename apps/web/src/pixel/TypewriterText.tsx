/**
 * Typewriter text — reveals a string character by character.
 *
 * Click anywhere on the text to reveal it all at once. Emits optional
 * 8-bit blips (every third character, randomized pitch) while typing
 * when audio is enabled.
 */

import { useEffect, useRef, useState } from 'react';
import { blip } from './useBlips';

interface Props {
  text: string;
  /** ms per character. */
  speed?: number;
  audioEnabled?: boolean;
  onFinished?: () => void;
  className?: string;
}

export function TypewriterText({ text, speed = 16, audioEnabled, onFinished, className }: Props) {
  const [shown, setShown] = useState(0);
  const finishedRef = useRef(false);

  // Restart whenever the text changes.
  useEffect(() => {
    setShown(0);
    finishedRef.current = false;
  }, [text]);

  useEffect(() => {
    if (shown >= text.length) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        onFinished?.();
      }
      return;
    }
    const t = setTimeout(
      () => {
        setShown((n) => n + 1);
        if (audioEnabled && shown % 3 === 0) {
          blip(520 + Math.random() * 260, 0.03, 0.015);
        }
      },
      /[.,;:!?—]/.test(text[shown] ?? '') ? speed * 7 : speed,
    );
    return () => clearTimeout(t);
  }, [shown, text, speed, audioEnabled, onFinished]);

  const done = shown >= text.length;

  return (
    <span
      className={`tw-text ${className ?? ''}`}
      onClick={() => setShown(text.length)}
      title={done ? undefined : 'click to reveal'}
    >
      {text.slice(0, shown)}
      {!done && <span className="tw-caret">▌</span>}
    </span>
  );
}
