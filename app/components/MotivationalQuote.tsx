import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { messageForSession, motivationalQuotes } from "../data/motivationalQuotes";

interface MotivationalQuoteProps {
  show: boolean;
  completed: boolean;
  completedSessions: number;
}

export function MotivationalQuote({ show, completed, completedSessions }: MotivationalQuoteProps) {
  const [quoteOffset, setQuoteOffset] = useState(0);
  if (!show) return null;
  const quote = motivationalQuotes[(completedSessions + quoteOffset) % motivationalQuotes.length];

  return (
    <aside className="surface motivation-panel p-5 sm:p-6" aria-label="Motivasi">
      {completed ? (
        <>
          <p className="font-bold mb-2">Semua tugas selesai. Bagus!</p>
          <blockquote className="font-semibold text-base leading-relaxed" aria-live="polite">“{quote.text}”</blockquote>
          <div className="flex justify-between items-center gap-3 mt-2 text-sm">
            <cite className="not-italic">{quote.author}</cite>
            <button type="button" className="header-action !min-h-9" onClick={() => setQuoteOffset(previous => previous + 1)} aria-label="Kutipan lain">
              <RotateCcw size={15} aria-hidden="true" />
            </button>
          </div>
        </>
      ) : <p className="font-semibold text-base leading-relaxed" role="status">{messageForSession(completedSessions)}</p>}
    </aside>
  );
}
