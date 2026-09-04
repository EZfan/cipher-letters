import { useGameStore } from '../store';

export function TopBar() {
  const phase = useGameStore((s) => s.phase);
  const llmAvailable = useGameStore((s) => s.llmAvailable);
  const returnToLobby = useGameStore((s) => s.returnToLobby);

  return (
    <header className="relative z-20 border-b border-parchment-200/10 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={returnToLobby}
          className="flex items-center gap-3 group"
          aria-label="Return to lobby"
        >
          <span className="font-display text-2xl italic text-parchment-100 group-hover:text-parchment-50 transition-colors">
            The Cipher Letters
          </span>
          <span className="hidden sm:inline text-parchment-200/40 text-sm">
            — A literary mystery
          </span>
        </button>

        <div className="flex items-center gap-4 text-xs">
          {phase !== 'lobby' && (
            <button
              onClick={returnToLobby}
              className="text-parchment-200/60 hover:text-parchment-50 transition-colors"
            >
              ← abandon
            </button>
          )}
          <LlmStatusDot available={llmAvailable} />
        </div>
      </div>
    </header>
  );
}

function LlmStatusDot({ available }: { available: boolean | null }) {
  if (available === null) {
    return <span className="text-parchment-200/40">checking the voice…</span>;
  }
  if (available) {
    return (
      <span className="flex items-center gap-2 text-parchment-200/70">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
        ghost present
      </span>
    );
  }
  return (
    <span
      className="flex items-center gap-2 text-parchment-200/40"
      title="LLM is not reachable — read, hint, and accusation-judging all work locally; only the live conversation needs a model"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
      ghost silent — offline mode
    </span>
  );
}
