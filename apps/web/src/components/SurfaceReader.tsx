import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface Props {
  text: string;
  title?: string;
  subtitle?: string;
  dateLine?: string;
}

/**
 * The reader pane — the centerpiece of the reading experience.
 *
 * Renders the case's surface text in the voice of a literary manuscript:
 * parchment background, classical typography, drop-cap opening, generous
 * margins. Scrollytelling.
 */
export function SurfaceReader({ text, title, subtitle, dateLine }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, rotateY: -8 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="paper max-w-2xl mx-auto my-12 px-12 py-16 rounded-sm relative"
    >
      {title && (
        <header className="text-center mb-12 pb-6 border-b border-ink-900/10">
          {dateLine && (
            <p className="text-xs uppercase tracking-[0.3em] text-ink-900/50 mb-4 font-sans">
              {dateLine}
            </p>
          )}
          <h1 className="font-display text-4xl md:text-5xl font-light text-ink-900 mb-3 italic">
            {title}
          </h1>
          {subtitle && (
            <p className="font-serif text-ink-900/60 italic">{subtitle}</p>
          )}
        </header>
      )}

      <div className="letter-body font-serif text-ink-900 text-[1.05rem] leading-relaxed">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p>{children}</p>,
            em: ({ children }) => <em className="italic">{children}</em>,
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>

      <footer className="mt-16 pt-6 border-t border-ink-900/10 text-center">
        <p className="ornament text-ink-900/40 text-sm font-display italic">
          read once with the surface — read again with the silence
        </p>
      </footer>
    </motion.article>
  );
}
