const SHORTCUTS = [
  ["Space", "Mulai atau jeda"],
  ["R", "Ulangi timer"],
  ["S", "Lewati sesi"],
  ["N", "Tugas baru"],
];

export function KeyboardShortcutsHint() {
  return (
    <details className="fixed bottom-4 left-4 z-20 surface px-3 py-2 text-sm shadow-sm focus-grayscale">
      <summary className="cursor-pointer font-bold">Pintasan keyboard</summary>
      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 mt-3 min-w-44">
        {SHORTCUTS.map(([key, label]) => (
          <div key={key} className="contents"><dt><kbd className="font-mono font-bold">{key}</kbd></dt><dd>{label}</dd></div>
        ))}
      </dl>
    </details>
  );
}
