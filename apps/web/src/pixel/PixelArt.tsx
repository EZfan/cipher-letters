/**
 * SVG pixel-art renderer. Each character cell becomes one <rect>.
 * `shapeRendering="crispEdges"` keeps pixels sharp at any scale; the
 * slight overdraw (1.03) prevents hairline seams between pixels.
 */

import type { CSSProperties } from 'react';
import type { Sprite } from './sprites';
import { PALETTE } from './sprites';

interface Props {
  sprite: Sprite;
  /** Displayed size in CSS pixels per sprite pixel. */
  scale?: number;
  className?: string;
  style?: CSSProperties;
  /** Accessible description; sprites are decorative by default. */
  label?: string;
}

export function PixelArt({ sprite, scale = 6, className, style, label }: Props) {
  return (
    <svg
      viewBox={`0 0 ${sprite.size} ${sprite.size}`}
      width={sprite.size * scale}
      height={sprite.size * scale}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {sprite.rows.flatMap((row, y) =>
        [...row].map((ch, x) => {
          const color = PALETTE[ch];
          if (!color) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width={1.03} height={1.03} fill={color} />;
        }),
      )}
    </svg>
  );
}
