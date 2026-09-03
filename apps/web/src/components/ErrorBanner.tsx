import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store';

export function ErrorBanner() {
  const error = useGameStore((s) => s.error);
  const setError = useGameStore((s) => s.setError);

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-ember-800/30 border-b border-ember-600/40 text-parchment-100 px-6 py-3 text-sm flex items-center justify-between"
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-parchment-200/60 hover:text-parchment-50 transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
