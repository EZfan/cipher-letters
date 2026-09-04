import { useGameStore } from '../store';

/**
 * Top bar. Doubles as the control panel: theme switch (PIXEL/PAPER)
 * and the sound toggle live here, with the ghost-signal status.
 *
 * Both themes get their own voice — the manuscript speaks softly,
 * the terminal reports.
 */
export function TopBar() {
  const phase = useGameStore((s) => s.phase);
  const llmAvailable = useGameStore((s) => s.llmAvailable);
  const theme = useGameStore((s) => s.theme);
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const toggleTheme = useGameStore((s) => s.toggleTheme);
  const toggleAudio = useGameStore((s) => s.toggleAudio);
  const returnToLobby = useGameStore((s) => s.returnToLobby);
  const pixel = theme === 'pixel';

  return (
    <header className="relative z-20 border-b border-parchment-200/10 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
        <button
          onClick={returnToLobby}
          className="flex items-center gap-3 group text-left"
          aria-label="Return to lobby"
        >
          <span className="font-display text-xl md:text-2xl italic text-parchment-100 group-hover:text-parchment-50 transition-colors pixel-shadow-text">
            The Cipher Letters
          </span>
          <span className="hidden sm:inline text-parchment-200/40 text-sm font-sans">
            {pixel ? '— CASE FILES · 3 ENTRIES' : '— a literary mystery'}
          </span>
        </button>

        <div className="flex items-center gap-3 md:gap-4 text-xs font-sans">
          {phase !== 'lobby' && (
            <button
              onClick={returnToLobby}
              className="text-parchment-200/60 hover:text-parchment-50 transition-colors"
            >
              {pixel ? '◂ ABANDON' : '← abandon'}
            </button>
          )}

          <button
            onClick={toggleAudio}
            title={audioEnabled ? 'Mute the machine' : 'Unmute the machine'}
            className={
              'px-2 py-1 border transition-colors ' +
              (audioEnabled
                ? 'border-ember-600/60 text-ember-400'
                : 'border-parchment-200/20 text-parchment-200/40 hover:text-parchment-200/70')
            }
          >
            {audioEnabled ? '♪ ON' : '♪ OFF'}
          </button>

          <button
            onClick={toggleTheme}
            title="Switch between the pixel terminal and the manuscript"
            className="px-2 py-1 border border-parchment-200/20 text-parchment-200/60 hover:text-parchment-50 hover:border-parchment-200/40 transition-colors"
          >
            {pixel ? '▤ PIXEL' : '▤ PAPER'}
          </button>

          <LlmStatusDot available={llmAvailable} pixel={pixel} />
        </div>
      </div>
    </header>
  );
}

function LlmStatusDot({ available, pixel }: { available: boolean | null; pixel: boolean }) {
  if (available === null) {
    return (
      <span className="text-parchment-200/40">
        {pixel ? 'SIGNAL: SEARCHING…' : 'checking the voice…'}
      </span>
    );
  }
  if (available) {
    return (
      <span className="flex items-center gap-2 text-parchment-200/70">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
        {pixel ? 'GHOST PRESENT' : 'ghost present'}
      </span>
    );
  }
  return (
    <span
      className="flex items-center gap-2 text-parchment-200/40"
      title="LLM is not reachable — read, hint, and accusation-judging all work locally; only the live conversation needs a model"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
      {pixel ? 'OFFLINE MODE' : 'ghost silent — offline mode'}
    </span>
  );
}
