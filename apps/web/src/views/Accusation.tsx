import { motion } from 'motion/react';
import { useState } from 'react';
import { useGameStore } from '../store';

export function Accusation() {
  const submitAccusation = useGameStore((s) => s.submitAccusation);
  const ghostBusy = useGameStore((s) => s.ghostBusy);
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim() || text.length < 10) return;
    submitAccusation(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="max-w-3xl mx-auto px-6 py-16"
    >
      <header className="text-center mb-12">
        <p className="font-sans text-xs uppercase tracking-[0.4em] text-parchment-200/50 mb-4">
          The accusation
        </p>
        <h2 className="font-display text-4xl italic text-parchment-50 mb-6">
          What really happened.
        </h2>
        <p className="font-serif text-parchment-200/70 max-w-xl mx-auto leading-relaxed">
          Speak it plainly. No poetry. No metaphor. The ghost will not be persuaded by grace; only
          by truth. Cite what you found in the text.
        </p>
      </header>

      <div className="paper p-10 rounded-sm">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={ghostBusy}
          placeholder="I accuse…"
          rows={10}
          maxLength={2000}
          className="w-full bg-transparent outline-none font-serif text-ink-900 placeholder:text-ink-900/30 resize-none leading-relaxed text-lg"
        />
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-ink-900/10">
          <span className="text-xs text-ink-900/40 font-sans">{text.length} / 2000</span>
          <button
            onClick={submit}
            disabled={ghostBusy || text.length < 10}
            className="px-6 py-3 bg-ember-600/20 hover:bg-ember-600/30 border border-ember-600/40 hover:border-ember-600/60 disabled:opacity-30 disabled:cursor-not-allowed rounded-sm font-display italic text-ink-900 text-lg transition-all"
          >
            {ghostBusy ? 'the keeper is reading…' : 'submit the accusation'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
