import { motion } from 'motion/react';
import { useGameStore } from '../store';
import { PixelArt } from '../pixel/PixelArt';
import { CandleFlame } from '../pixel/CandleFlame';
import { CASE_SPRITES, STAR } from '../pixel/sprites';
import { selectSound } from '../pixel/useBlips';

/**
 * The lobby. In PIXEL theme it plays like a title screen: two candles,
 * a handful of stars, three evidence files. In MANUSCRIPT theme it
 * stays what it always was — a quiet desk with three folders on it.
 */

// Fixed star positions (percentages), each with its own twinkle delay.
const STARS: readonly { x: string; y: string; delay: string }[] = [
  { x: '12%', y: '14%', delay: '0s' },
  { x: '28%', y: '6%', delay: '0.9s' },
  { x: '55%', y: '10%', delay: '1.7s' },
  { x: '78%', y: '5%', delay: '0.4s' },
  { x: '90%', y: '18%', delay: '2.1s' },
  { x: '6%', y: '34%', delay: '1.2s' },
  { x: '94%', y: '40%', delay: '2.6s' },
];

export function Lobby() {
  const cases = useGameStore((s) => s.cases);
  const startCase = useGameStore((s) => s.startCase);
  const theme = useGameStore((s) => s.theme);
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const llmAvailable = useGameStore((s) => s.llmAvailable);
  const busy = useGameStore((s) => s.ghostBusy);
  const pixel = theme === 'pixel';

  const open = (caseId: string) => {
    if (audioEnabled) selectSound();
    startCase(caseId);
  };

  return (
    <div className="relative max-w-6xl mx-auto px-6 py-16">
      {pixel && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {STARS.map((star, i) => (
            <div
              key={i}
              className="twinkle absolute"
              style={{ left: star.x, top: star.y, animationDelay: star.delay }}
            >
              <PixelArt sprite={STAR} scale={2} />
            </div>
          ))}
        </div>
      )}

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-center mb-20"
      >
        <p className="font-sans text-xs uppercase tracking-[0.4em] text-parchment-200/50 mb-6">
          {pixel
            ? 'AN INTERACTIVE MYSTERY · RUNS ENTIRELY ON YOUR MACHINE'
            : 'A literary mystery in three parts'}
        </p>

        <div className="flex items-center justify-center gap-6 mb-2">
          {pixel && <CandleFlame scale={5} />}
          <h1 className="font-display text-6xl md:text-7xl italic text-parchment-50 leading-tight pixel-shadow-text">
            The Cipher
            <br />
            Letters
          </h1>
          {pixel && <CandleFlame scale={5} />}
        </div>

        <p className="font-serif text-xl text-parchment-100/80 max-w-2xl mx-auto leading-relaxed mt-8">
          {pixel ? (
            <>
              THREE FILES. THREE VOICES THAT SHOULD BE SILENT.
              <br />
              READ WHAT THEY LEFT BEHIND. DECIDE WHAT IT MEANS.
            </>
          ) : (
            <>
              Read the words the writer left behind.
              <br />
              Hear the voice they did not mean to leave.
              <br />
              <span className="text-parchment-200/60">Then decide what really happened.</span>
            </>
          )}
        </p>
        <div className="ornament mt-10 text-parchment-200/40 text-2xl" />
      </motion.section>

      <section className="relative grid md:grid-cols-3 gap-6">
        {cases.map((c, idx) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 + idx * 0.15 }}
            whileHover={{ y: -4 }}
            onClick={() => open(c.id)}
            disabled={busy}
            className="text-left paper p-8 hover:shadow-2xl transition-shadow group"
          >
            {pixel && CASE_SPRITES[c.id] && (
              <div className="flex justify-center mb-5">
                <PixelArt
                  sprite={CASE_SPRITES[c.id]}
                  scale={6}
                  label={`Evidence sprite for ${c.title}`}
                />
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <span className="seal">{c.genre}</span>
              <span className="text-xs text-ink-900/40 font-sans uppercase tracking-wider">
                {pixel ? c.difficulty.toUpperCase() : c.difficulty}
              </span>
            </div>

            <h2 className="font-display text-2xl italic text-ink-900 mb-3 group-hover:text-ember-600 transition-colors">
              {c.title}
            </h2>
            <p className="font-serif text-ink-900/70 text-sm leading-relaxed mb-6">{c.synopsis}</p>

            <div className="flex items-center justify-between text-xs text-ink-900/40 font-sans">
              <span>
                {pixel ? `~${c.estimatedPlayMinutes} MIN` : `~${c.estimatedPlayMinutes} min`}
              </span>
              <span className="group-hover:text-ember-600 transition-colors">
                {pixel ? 'OPEN FILE ▸' : 'open the file →'}
              </span>
            </div>
          </motion.button>
        ))}
      </section>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="text-center mt-12 text-parchment-200/50 font-sans text-xs tracking-[0.3em]"
      >
        {pixel ? (
          <span className="pixel-blink inline-block">▸ SELECT A CASE FILE TO BEGIN</span>
        ) : (
          <span>choose a file to begin</span>
        )}
      </motion.p>

      {llmAvailable === false && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-14 text-center text-parchment-200/50 text-sm max-w-xl mx-auto"
        >
          <p>
            {pixel ? (
              <>
                SIGNAL: SILENT — no model is running. Every file still opens: reading, hints and
                accusations are judged locally. Only the live conversation needs a model.
              </>
            ) : (
              <>
                The ghost is silent — your LLM is not reachable. You can still play every case in
                offline mode: the surface text is shipped with the game, hints are local, and your
                accusation is judged by the local validator. Only the live conversation needs a
                model.
              </>
            )}
          </p>
        </motion.div>
      )}
    </div>
  );
}
