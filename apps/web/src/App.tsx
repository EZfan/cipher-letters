import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useGameStore } from './store';
import { Lobby } from './views/Lobby';
import { ReadingRoom } from './views/ReadingRoom';
import { Interrogation } from './views/Interrogation';
import { Accusation } from './views/Accusation';
import { Reveal } from './views/Reveal';
import { TopBar } from './components/TopBar';
import { ErrorBanner } from './components/ErrorBanner';

export function App() {
  const phase = useGameStore((s) => s.phase);
  const theme = useGameStore((s) => s.theme);
  const loadCases = useGameStore((s) => s.loadCases);
  const checkLlm = useGameStore((s) => s.checkLlm);

  useEffect(() => {
    loadCases();
    checkLlm();
  }, [loadCases, checkLlm]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <TopBar />
      <ErrorBanner />
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {phase === 'lobby' && (
            <motion.div key="lobby" {...pageTransition}>
              <Lobby />
            </motion.div>
          )}
          {phase === 'reading' && (
            <motion.div key="reading" {...pageTransition}>
              <ReadingRoom />
            </motion.div>
          )}
          {phase === 'conversation' && (
            <motion.div key="conversation" {...pageTransition}>
              <Interrogation />
            </motion.div>
          )}
          {phase === 'accusation' && (
            <motion.div key="accusation" {...pageTransition}>
              <Accusation />
            </motion.div>
          )}
          {phase === 'reveal' && (
            <motion.div key="reveal" {...pageTransition}>
              <Reveal />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <footer className="relative z-10 text-center py-8 text-parchment-200/40 text-sm">
        <span className="ornament">The Cipher Letters — local-first literary mysteries</span>
      </footer>
    </div>
  );
}

const pageTransition = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};
