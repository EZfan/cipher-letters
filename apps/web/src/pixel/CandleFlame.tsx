/**
 * A candle whose flame flickers between two hand-drawn frames.
 * Purely decorative.
 */

import { useEffect, useState } from 'react';
import { PixelArt } from './PixelArt';
import { CANDLE_FRAMES } from './sprites';

interface Props {
  scale?: number;
  className?: string;
}

export function CandleFlame({ scale = 6, className }: Props) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 320);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={className} aria-hidden>
      <PixelArt sprite={CANDLE_FRAMES[frame] ?? CANDLE_FRAMES[0]} scale={scale} />
    </div>
  );
}
