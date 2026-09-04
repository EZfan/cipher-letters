/**
 * A ghost portrait that breathes (slow vertical float) and blinks
 * (random 2.4–5.2 s interval, 160 ms closed eyes).
 */

import { useEffect, useState } from 'react';
import { PixelArt } from './PixelArt';
import { GHOST_SPRITES } from './sprites';

interface Props {
  caseId: string;
  scale?: number;
  className?: string;
}

export function GhostFigure({ caseId, scale = 6, className }: Props) {
  const frames = GHOST_SPRITES[caseId];
  const [eyesClosed, setEyesClosed] = useState(false);

  useEffect(() => {
    if (!frames) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          setEyesClosed(true);
          setTimeout(() => {
            setEyesClosed(false);
            schedule();
          }, 160);
        },
        2400 + Math.random() * 2800,
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, [frames]);

  if (!frames) return null;
  const sprite = eyesClosed ? frames.closed : frames.open;

  return (
    <div className={`ghost-float ${className ?? ''}`}>
      <PixelArt sprite={sprite} scale={scale} label="The ghost" />
    </div>
  );
}
