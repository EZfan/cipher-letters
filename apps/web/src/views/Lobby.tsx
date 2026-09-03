import { motion } from 'motion/react';
import { useGameStore } from '../store';

export function Lobby() {
  const cases = useGameStore((s) => s.cases);
  const startCase = useGameStore((s) => s.startCase);
  const llmAvailable = useGameStore((s) => s.llmAvailable);
  const busy = useGameStore((s) => s.ghostBusy);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-20"
      >
        <p className="font-sans text-xs uppercase tracking-[0.4em] text-parchment-200/50 mb-6">
          A literary mystery in three parts
        </p>
        <h1 className="font-display text-6xl md:text-7xl italic text-parchment-50 mb-8 leading-tight">
          The Cipher Letters
        </h1>
        <p className="font-serif text-xl text-parchment-100/80 max-w-2xl mx-auto leading-relaxed">
          Read the words the writer left behind.
          <br />
          Hear the voice they did not mean to leave.
          <br />
          <span className="text-parchment-200/60">Then decide what really happened.</span>
        </p>
        <div className="ornament mt-10 text-parchment-200/40 text-2xl" />
      </motion.section>

      <section className="grid md:grid-cols-3 gap-6">
        {cases.map((c, idx) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 + idx * 0.15 }}
            whileHover={{ y: -4 }}
            onClick={() => startCase(c.id)}
            disabled={busy}
            className="text-left paper p-8 rounded-sm hover:shadow-2xl transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="seal">{c.genre}</span>
              <span className="text-xs text-ink-900/40 font-sans uppercase tracking-wider">
                {c.difficulty}
              </span>
            </div>

            <h2 className="font-display text-2xl italic text-ink-900 mb-3 group-hover:text-ember-600 transition-colors">
              {c.title}
            </h2>
            <p className="font-serif text-ink-900/70 text-sm leading-relaxed mb-6">
              {c.synopsis}
            </p>

            <div className="flex items-center justify-between text-xs text-ink-900/40 font-sans">
              <span>~{c.estimatedPlayMinutes} min</span>
              <span className="group-hover:text-ember-600 transition-colors">open the file →</span>
            </div>
          </motion.button>
        ))}
      </section>

      {llmAvailable === false && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center text-parchment-200/50 text-sm max-w-xl mx-auto"
        >
          <p>
            The ghost is silent — your LLM is not reachable. You can still play every case in
            pre-written mode; the surface text and the truth are both encoded in the case file
            itself, no model needed.
          </p>
        </motion.div>
      )}
    </div>
  );
}
