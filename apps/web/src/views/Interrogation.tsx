import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store';
import { GhostFigure } from '../pixel/GhostFigure';
import { PixelArt } from '../pixel/PixelArt';
import { MAGNIFIER, CASE_SPRITES } from '../pixel/sprites';
import { TypewriterText } from '../pixel/TypewriterText';
import { blip } from '../pixel/useBlips';

/**
 * The interrogation. In PIXEL theme this is a classic adventure-game
 * scene: the ghost's portrait breathes and blinks on the left, replies
 * type themselves out in an RPG dialog box, and a ▼ cursor waits for
 * the next question.
 */
export function Interrogation() {
  const session = useGameStore((s) => s.session);
  const sendMessage = useGameStore((s) => s.sendMessage);
  const requestHint = useGameStore((s) => s.requestHint);
  const ghostBusy = useGameStore((s) => s.ghostBusy);
  const hint = useGameStore((s) => s.hint);
  const theme = useGameStore((s) => s.theme);
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const setPhase = useGameStore((s) => s.setPhase);

  const [input, setInput] = useState('');
  const [typedDone, setTypedDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pixel = theme === 'pixel';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.conversation.length]);

  // Reset the "fully typed" flag whenever a new turn arrives.
  useEffect(() => {
    setTypedDone(false);
  }, [session?.conversation.length]);

  if (!session || !session.case) return null;
  const c = session.case;
  const turns = session.conversation;
  const lastGhostIndex = (() => {
    for (let i = turns.length - 1; i >= 0; i--) {
      if (turns[i]?.role === 'ghost') return i;
    }
    return -1;
  })();

  const submit = () => {
    if (!input.trim() || ghostBusy) return;
    const msg = input;
    setInput('');
    if (audioEnabled) blip(740, 0.05, 0.035);
    sendMessage(msg);
  };

  const inputPlaceholder = pixel ? 'ASK, AND MARK THE SILENCE_' : 'Ask the ghost a question…';

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-[1fr_2fr] gap-8">
        {/* Left — the ghost, the evidence count, the actions */}
        <aside className="space-y-6">
          <div className="paper p-6 rounded-sm">
            <p className="text-xs text-ink-900/40 font-sans uppercase tracking-wider mb-2">
              {pixel ? 'SUBJECT' : 'The ghost'}
            </p>

            {pixel && (
              <div className="flex justify-center mb-4">
                <GhostFigure caseId={session.caseId} scale={7} />
              </div>
            )}

            <h3 className="font-display text-2xl italic text-ink-900 mb-1">{c.ghost.name}</h3>
            <p className="text-xs text-ink-900/50 mb-4">
              {pixel ? c.ghost.state.toUpperCase().replace(/-/g, ' ') : c.ghost.state}
            </p>
            <p className="font-serif text-ink-900/70 text-sm leading-relaxed italic">
              "{c.ghost.voice}"
            </p>
          </div>

          <div className="paper p-6 rounded-sm">
            <p className="text-xs text-ink-900/40 font-sans uppercase tracking-wider mb-3">
              {pixel ? 'EVIDENCE LEDGER' : 'Evidence'}
            </p>
            <p className="font-serif text-ink-900/70 text-sm">
              <span className="font-display text-2xl text-ember-600">
                {session.citedClueIds.length}
              </span>{' '}
              <span className="text-ink-900/40">
                {pixel
                  ? 'THREADS FOUND — THE FILE HOLDS MORE'
                  : 'threads found — the case holds more'}
              </span>
            </p>
            {hint && (
              <p className="mt-4 text-sm font-serif text-ink-900/80 italic border-l-2 border-ember-600/40 pl-3">
                {pixel && (
                  <PixelArt
                    sprite={MAGNIFIER}
                    scale={2}
                    className="inline-block mr-2 align-middle"
                  />
                )}
                {hint.message}
              </p>
            )}
          </div>

          {pixel && CASE_SPRITES[session.caseId] && (
            <div className="paper p-4 rounded-sm flex justify-center">
              <PixelArt sprite={CASE_SPRITES[session.caseId]} scale={4} label="Case evidence" />
            </div>
          )}

          <button
            onClick={requestHint}
            className="w-full text-sm font-sans uppercase tracking-wider text-parchment-200/60 hover:text-parchment-50 py-3 border border-parchment-200/20 hover:border-parchment-200/40 rounded-sm transition-colors"
          >
            {pixel ? 'REQUEST GUIDANCE' : 'ask for a hint'}
          </button>

          <button
            onClick={() => setPhase('accusation')}
            className="w-full font-display italic text-lg text-ember-400 hover:text-ember-600 py-3 border border-ember-600/30 hover:border-ember-600/60 rounded-sm transition-all"
          >
            {pixel ? '▸ SUBMIT ACCUSATION' : 'I am ready to accuse →'}
          </button>
        </aside>

        {/* Right — the conversation */}
        <section className="paper rounded-sm flex flex-col h-[70vh]">
          <header className="px-6 py-4 border-b border-ink-900/10">
            <p className="text-xs text-ink-900/40 font-sans uppercase tracking-wider">
              {pixel ? `INTERVIEW LOG · ${turns.length} ENTRIES` : 'Across from the ghost'}
            </p>
            <p className="font-serif text-ink-900/70 italic text-sm mt-1">
              {pixel
                ? 'Answers are not promises. Watch what they avoid.'
                : 'The candles gutter. The kettle, somewhere, sings.'}
            </p>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 pt-4 pb-8 space-y-4 scroll-fade-mask"
          >
            {turns.length === 0 && (
              <p className="font-serif italic text-ink-900/40 text-center py-12">
                {pixel ? 'THE ROOM IS QUIET. SPEAK FIRST.' : 'Say something. They are listening.'}
              </p>
            )}
            <AnimatePresence initial={false}>
              {turns.map((turn, i) => {
                const isLastGhost = i === lastGhostIndex;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={turn.role === 'player' ? 'text-right' : 'text-left'}
                  >
                    <div
                      className={`inline-block max-w-[85%] px-4 py-3 rounded-sm font-serif leading-relaxed ${
                        turn.role === 'player'
                          ? 'bg-ember-600/10 text-ink-900'
                          : 'bg-ink-900/5 text-ink-900 border-l-2 border-ember-600/60'
                      }`}
                    >
                      {turn.role === 'ghost' && pixel && (
                        <p className="text-[0.6rem] font-display uppercase tracking-wider text-ember-600 mb-2 not-italic">
                          {c.ghost.name}
                        </p>
                      )}
                      {pixel && turn.role === 'ghost' && isLastGhost ? (
                        <TypewriterText
                          text={turn.text}
                          audioEnabled={audioEnabled}
                          onFinished={() => setTypedDone(true)}
                          className="text-[1.05rem]"
                        />
                      ) : (
                        <p className="text-[0.95rem]">{turn.text}</p>
                      )}
                      {turn.role === 'ghost' &&
                        'disclosureLevel' in turn &&
                        typeof turn.disclosureLevel === 'number' &&
                        (isLastGhost || !pixel) && (
                          <p className="mt-2 text-[0.65rem] uppercase tracking-wider text-ink-900/40 font-sans">
                            {pixel
                              ? `TRUST ${Math.round(turn.disclosureLevel * 100)}% ${
                                  isLastGhost && !typedDone ? '' : '▼'
                                }`
                              : `trust earned · ${Math.round(turn.disclosureLevel * 100)}%`}
                          </p>
                        )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {ghostBusy && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-left">
                <div className="inline-block px-4 py-3 bg-ink-900/5 border-l-2 border-ember-600/60">
                  <span className="font-serif italic text-ink-900/60 animate-pulse-soft">
                    {pixel ? '… THE GHOST CONSIDERS …' : '… the ghost is thinking …'}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-ink-900/10 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              disabled={ghostBusy}
              placeholder={inputPlaceholder}
              className="flex-1 bg-transparent border-b border-ink-900/30 focus:border-ember-600 outline-none font-serif text-ink-900 placeholder:text-ink-900/30 py-2 disabled:opacity-50"
              maxLength={1000}
            />
            <button
              onClick={submit}
              disabled={ghostBusy || !input.trim()}
              className="px-4 py-2 text-ink-900/60 hover:text-ember-600 disabled:opacity-30 transition-colors font-display italic text-lg"
            >
              {pixel ? '▸ SPEAK' : 'speak →'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
