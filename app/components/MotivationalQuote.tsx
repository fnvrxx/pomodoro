import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { getRandomQuoteExcluding } from "../data/motivationalQuotes";

export function MotivationalQuote({ show, completed }: { show: boolean; completed: boolean }) {
  const [quote, setQuote] = useState(() => getRandomQuoteExcluding(null));
  if (!show) return null;

  return (
    <aside className="surface motivation-panel p-5 sm:p-6" aria-label="Motivasi">
      {completed ? (
        <>
          <p className="font-bold mb-2">Semua tugas selesai. Bagus!</p>
          <blockquote className="font-semibold text-base leading-relaxed">“{quote.text}”</blockquote>
          <div className="flex justify-between items-center gap-3 mt-2 text-sm">
            <cite className="not-italic">{quote.author}</cite>
            <button type="button" className="header-action !min-h-9" onClick={() => setQuote(previous => getRandomQuoteExcluding(previous))} aria-label="Kutipan lain">
              <RotateCcw size={15} aria-hidden="true" />
            </button>
          </div>
        </>
      ) : <p className="font-semibold text-base leading-relaxed">Satu sesi dulu. Sisanya menyusul.</p>}
    </aside>
  );
}
