import { motion } from 'motion/react';
import { useGameStore } from '../store';
import { SurfaceReader } from '../components/SurfaceReader';

export function ReadingRoom() {
  const session = useGameStore((s) => s.session);

  if (!session || !session.case) return null;
  const c = session.case;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="text-center mb-8"
      >
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-parchment-200/50 mb-2">
          The file
        </p>
        <h1 className="font-display text-3xl italic text-parchment-50">{c.title}</h1>
        <p className="font-serif text-parchment-200/70 mt-2 italic">{c.setting}</p>
      </motion.div>

      <SurfaceReader
        text={session.surfaceText}
        title={c.title}
        subtitle={`A ${c.genre} by ${c.author}, ${c.year}`}
        dateLine={c.setting}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="text-center mt-12 mb-16"
      >
        <p className="font-serif text-parchment-200/60 italic mb-8 max-w-xl mx-auto">
          Read once with the surface. Read again with the silence.
          <br />
          When you are ready, sit across from the ghost.
        </p>
        <button
          onClick={() => useGameStore.getState().setPhase('conversation')}
          className="group relative px-8 py-4 bg-ember-600/20 hover:bg-ember-600/30 border border-ember-600/40 hover:border-ember-400 rounded-sm transition-all"
        >
          <span className="font-display italic text-xl text-parchment-50 group-hover:text-parchment-50 transition-colors">
            sit across from the ghost
          </span>
        </button>
      </motion.div>
    </div>
  );
}
