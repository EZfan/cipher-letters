import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '../store';
import { solvedSound, wrongSound } from '../pixel/useBlips';

export function Reveal() {
  const verdict = useGameStore((s) => s.verdict);
  const theme = useGameStore((s) => s.theme);
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const returnToLobby = useGameStore((s) => s.returnToLobby);
  const setPhase = useGameStore((s) => s.setPhase);
  const pixel = theme === 'pixel';

  // One-shot stinger when the verdict lands.
  useEffect(() => {
    if (!verdict || !audioEnabled) return;
    if (verdict.verdict === 'solved') solvedSound();
    if (verdict.verdict === 'wrong') wrongSound();
  }, []);

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
        <VerdictSeal verdict={verdict.verdict} pixel={pixel} />
        <p className="font-serif italic text-parchment-100 text-xl mt-8 max-w-xl mx-auto leading-relaxed">
          {verdict.message}
        </p>
        <p className="text-xs text-parchment-200/40 mt-4 font-sans uppercase tracking-wider">
          {pixel
            ? `EVIDENCE CITED · ${Math.round(verdict.fairPlayScore * 100)}% · ${
                verdict.judgedBy === 'llm' ? 'JUDGED BY THE KEEPER' : 'JUDGED BY THE VALIDATOR'
              }`
            : `fair-play score · ${Math.round(verdict.fairPlayScore * 100)}% · ${
                verdict.judgedBy === 'llm'
                  ? 'judged by the keeper'
                  : 'judged by the local validator'
              }`}
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
            {pixel ? 'WHAT THE FILE NEVER SAID' : 'The truth, as it was'}
          </p>
          <p className="font-serif text-ink-900 text-lg leading-relaxed mb-8">
            {verdict.hiddenTruth}
          </p>

          {verdict.metaReflection && (
            <>
              <div className="ornament text-ink-900/40 my-8 text-xl" />
              <p className="text-xs text-ink-900/40 font-sans uppercase tracking-wider mb-4">
                {pixel ? 'AFTERWORD · READ ONCE, THEN CLOSE THE FILE' : 'Afterword'}
              </p>
              <p className="font-serif text-ink-900/80 text-base leading-relaxed italic">
                {verdict.metaReflection}
              </p>
            </>
          )}

          {verdict.meta && (
            <p className="font-serif text-ink-900/60 text-sm mt-8 italic">{verdict.meta}</p>
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
            {pixel ? '◂ RETURN TO THE INTERVIEW' : '← back to the ghost'}
          </button>
        </motion.div>
      )}

      <div className="text-center mt-16">
        <button
          onClick={returnToLobby}
          className="font-display italic text-parchment-200/50 hover:text-parchment-50 transition-colors"
        >
          {pixel ? 'CLOSE THE FILE' : 'close the file'}
        </button>
      </div>
    </motion.div>
  );
}

function VerdictSeal({
  verdict,
  pixel,
}: {
  verdict: 'solved' | 'partial' | 'wrong';
  pixel: boolean;
}) {
  if (verdict === 'solved') {
    return (
      <div className="inline-block">
        <motion.div
          initial={{ rotate: -12, scale: 0 }}
          animate={{ rotate: -8, scale: 1 }}
          transition={{ type: 'spring', delay: 0.6, damping: 8 }}
          className="border-2 border-ember-600 text-ember-600 px-8 py-3 rounded-sm font-display italic text-2xl"
        >
          {pixel ? '✦ CASE CLOSED ✦' : '✦ solved ✦'}
        </motion.div>
      </div>
    );
  }
  if (verdict === 'partial') {
    return (
      <div className="inline-block px-8 py-3 rounded-sm font-display italic text-2xl text-parchment-200/70 border border-parchment-200/30">
        {pixel ? 'PARTIAL — KEEP DIGGING' : '~ partial ~'}
      </div>
    );
  }
  return (
    <div className="inline-block px-8 py-3 rounded-sm font-display italic text-2xl text-parchment-200/50 border border-parchment-200/20">
      {pixel ? 'UNSUPPORTED — READ AGAIN' : '… not yet …'}
    </div>
  );
}
