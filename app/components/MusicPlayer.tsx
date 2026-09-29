import { memo, useState } from "react";
import type { FormEvent } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import type { CustomPlaylist } from "../types";

const DEFAULT_PLAYLISTS: CustomPlaylist[] = [
  { id: "lTRiuFIWV54", name: "Ambient Study", addedAt: 0 },
];

export function extractYouTubeId(input: string): string | null {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const hostname = url.hostname.toLowerCase();
    if (hostname === "youtu.be") return /^[\w-]{11}$/.test(url.pathname.slice(1)) ? url.pathname.slice(1) : null;
    if (!["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"].includes(hostname)) return null;
    const candidate = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|live)\/([\w-]{11})$/)?.[1];
    return candidate && /^[\w-]{11}$/.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

interface MusicPlayerProps {
  customPlaylists: CustomPlaylist[];
  onAddPlaylist: (playlist: CustomPlaylist) => void;
  onRemovePlaylist: (id: string) => void;
}

export const MusicPlayer = memo(function MusicPlayer({ customPlaylists, onAddPlaylist, onRemovePlaylist }: MusicPlayerProps) {
  const [currentId, setCurrentId] = useState(DEFAULT_PLAYLISTS[0].id);
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const playlists = [...DEFAULT_PLAYLISTS, ...customPlaylists];
  const current = playlists.find(playlist => playlist.id === currentId) ?? playlists[0];

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = extractYouTubeId(url);
    if (!id) return setError("Masukkan URL atau ID YouTube yang valid.");
    if (playlists.some(playlist => playlist.id === id)) return setError("Video ini sudah ada.");
    onAddPlaylist({ id, name: name.trim() || `Pilihan ${customPlaylists.length + 1}`, addedAt: Date.now() });
    setCurrentId(id);
    setUrl(""); setName(""); setError(""); setAdding(false);
  };
  const remove = (id: string) => {
    onRemovePlaylist(id);
    if (currentId === id) setCurrentId(DEFAULT_PLAYLISTS[0].id);
  };

  return (
    <section className="surface p-5 sm:p-6" aria-labelledby="music-heading">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div><h2 id="music-heading" className="section-heading">Musik fokus</h2><p className="text-sm mt-1">{current.name}</p></div>
        <button type="button" className="header-action" onClick={() => setAdding(value => !value)} aria-expanded={adding}>
          <Plus size={17} aria-hidden="true" /><span>Tambah</span>
        </button>
      </div>
      <div className="aspect-video overflow-hidden rounded-md" style={{ backgroundColor: "var(--pomo-primary)" }}>
        <iframe
          key={current.id}
          src={`https://www.youtube.com/embed/${current.id}?autoplay=1&playsinline=1&rel=0`}
          title={`Pemutar musik: ${current.name}`}
          className="w-full h-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-4" aria-label="Pilihan musik">
        {playlists.map(playlist => (
          <div key={playlist.id} className="flex items-center gap-1">
            <button type="button" className="choice-button" aria-pressed={playlist.id === current.id} onClick={() => setCurrentId(playlist.id)}>{playlist.name}</button>
            {playlist.addedAt > 0 && <button type="button" className="header-action !w-9 !h-9 !p-0" onClick={() => remove(playlist.id)} aria-label={`Hapus ${playlist.name}`}><Trash2 size={15} aria-hidden="true" /></button>}
          </div>
        ))}
      </div>

      {adding && (
        <form className="grid gap-3 mt-5 border-t pt-4" style={{ borderColor: "var(--pomo-neutral-light)" }} onSubmit={add}>
          <div><label className="field-label" htmlFor="music-url">URL atau ID YouTube</label><input id="music-url" className="field-input" value={url} onChange={event => { setUrl(event.target.value); setError(""); }} required placeholder="https://www.youtube.com/watch?v=..." /></div>
          <div><label className="field-label" htmlFor="music-name">Nama pilihan</label><input id="music-name" className="field-input" value={name} onChange={event => setName(event.target.value)} placeholder="Opsional" maxLength={40} /></div>
          {error && <p role="alert" className="text-sm" style={{ color: "var(--pomo-priority-high)" }}>{error}</p>}
          <div className="flex gap-2"><button type="submit" className="action-button">Simpan</button><button type="button" className="action-button action-button-secondary" onClick={() => { setAdding(false); setError(""); }}>Batal</button></div>
        </form>
      )}
      <a className="inline-flex items-center gap-1 underline underline-offset-4 text-sm mt-5" href={`https://www.youtube.com/watch?v=${current.id}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} aria-hidden="true" /> Buka di YouTube</a>
    </section>
  );
});
