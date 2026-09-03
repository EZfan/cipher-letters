import { motion } from 'motion/react';
import { useGameStore } from '../store';

export function Reveal() {
  const verdict = useGameStore((s) => s.verdict);
  const returnToLobby = useGameStore((s) => s.returnToLobby);
  const setPhase = useGameStore((s) => s.setPhase);

  if (!verdict) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="max-w-3xl mx-auto px-6 py-16"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-12"
      >
        <VerdictSeal verdict={verdict.verdict} />
        <p className="font-serif italic text-parchment-100 text-xl mt-8 max-w-xl mx-auto leading-relaxed">
          {verdict.message}
        </p>
        <p className="text-xs text-parchment-200/40 mt-4 font-sans uppercase tracking-wider">
          fair-play score · {Math.round(verdict.fairPlayScore * 100)}%
        </p>
      </motion.div>

      {verdict.verdict === 'solved' && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="paper p-10 rounded-sm mt-12"
        >
          <p className="text-xs text-ink-900/40 font-sans uppercase tracking-wider mb-4">
            The truth, as it was
          </p>
          <p className="font-serif text-ink-900 text-lg leading-relaxed mb-8">
            {verdict.hiddenTruth}
          </p>

          {verdict.metaReflection && (
            <>
              <div className="ornament text-ink-900/40 my-8 text-xl" />
              <p className="text-xs text-ink-900/40 font-sans uppercase tracking-wider mb-4">
                Afterword
              </p>
              <p className="font-serif text-ink-900/80 text-base leading-relaxed italic">
                {verdict.metaReflection}
              </p>
            </>
          )}

          {verdict.meta && (
            <p className="font-serif text-ink-900/60 text-sm mt-8 italic">
              {verdict.meta}
            </p>
          )}
        </motion.section>
      )}

      {verdict.verdict !== 'solved' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => setPhase('conversation')}
            className="text-parchment-200/70 hover:text-parchment-50 transition-colors font-display italic text-lg"
          >
            ← back to the ghost
          </button>
        </motion.div>
      )}

      <div className="text-center mt-16">
        <button
          onClick={returnToLobby}
          className="font-display italic text-parchment-200/50 hover:text-parchment-50 transition-colors"
        >
          close the file
        </button>
      </div>
    </motion.div>
  );
}

function VerdictSeal({ verdict }: { verdict: 'solved' | 'partial' | 'wrong' }) {
  if (verdict === 'solved') {
    return (
      <div className="inline-block">
        <motion.div
          initial={{ rotate: -12, scale: 0 }}
          animate={{ rotate: -8, scale: 1 }}
          transition={{ type: 'spring', delay: 0.6, damping: 8 }}
          className="border-2 border-ember-600 text-ember-600 px-8 py-3 rounded-sm font-display italic text-2xl"
        >
          ✦ solved ✦
        </motion.div>
      </div>
    );
  }
  if (verdict === 'partial') {
    return (
      <div className="inline-block px-8 py-3 rounded-sm font-display italic text-2xl text-parchment-200/70 border border-parchment-200/30">
        ~ partial ~
      </div>
    );
  }
  return (
    <div className="inline-block px-8 py-3 rounded-sm font-display italic text-2xl text-parchment-200/50 border border-parchment-200/20">
      … not yet …
    </div>
  );
}
