'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Plus, X, Music } from 'lucide-react';
import type { CustomPlaylist } from '@/app/types';

const DEFAULT_PLAYLISTS: CustomPlaylist[] = [
  { id: 'jfKfPfyJRdk', name: 'Lofi Girl', addedAt: 0 },
  { id: 'rUxyKA_-grg', name: 'Chill Lo-Fi', addedAt: 0 },
  { id: 'lTRiuFIWV54', name: 'Ambient Study', addedAt: 0 },
  { id: 'q0BVR5jRXxE', name: 'Jazz Hop', addedAt: 0 },
];

function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1).split('?')[0];
      if (id.length === 11) return id;
    }
    const v = url.searchParams.get('v');
    if (v && v.length === 11) return v;
    const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    const liveMatch = url.pathname.match(/\/live\/([a-zA-Z0-9_-]{11})/);
    if (liveMatch) return liveMatch[1];
  } catch {
    // Not a valid URL
  }
  return null;
}

interface MusicPlayerProps {
  customPlaylists: CustomPlaylist[];
  onAddPlaylist: (playlist: CustomPlaylist) => void;
  onRemovePlaylist: (id: string) => void;
}

export const MusicPlayer = memo(function MusicPlayer({
  customPlaylists,
  onAddPlaylist,
  onRemovePlaylist,
}: MusicPlayerProps) {
  const allPlaylists = [...DEFAULT_PLAYLISTS, ...customPlaylists];

  const [current, setCurrent] = useState(allPlaylists[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');

  const handlePlaylistChange = (playlist: CustomPlaylist) => {
    setCurrent(playlist);
  };

  const handleAddCustom = () => {
    setError('');
    const videoId = extractYouTubeId(urlInput);
    if (!videoId) {
      setError('URL atau ID YouTube tidak valid');
      return;
    }
    if (allPlaylists.some(p => p.id === videoId)) {
      setError('Playlist ini sudah ada');
      return;
    }
    const name = nameInput.trim() || `Custom ${customPlaylists.length + 1}`;
    const newEntry: CustomPlaylist = { id: videoId, name, addedAt: Date.now() };
    onAddPlaylist(newEntry);
    setCurrent(newEntry);
    setUrlInput('');
    setNameInput('');
    setShowAddForm(false);
  };

  const handleRemove = (id: string) => {
    onRemovePlaylist(id);
    if (current.id === id) {
      setCurrent(DEFAULT_PLAYLISTS[0]);
    }
  };

  const embedUrl = (() => {
    const params = new URLSearchParams({
      autoplay: '1',
      controls: '1',
      modestbranding: '1',
      rel: '0',
      playsinline: '1',
    });
    return `https://www.youtube.com/embed/${current.id}?${params.toString()}`;
  })();

  const isCustom = (id: string) => customPlaylists.some(p => p.id === id);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-3xl p-4 shadow-xl overflow-hidden"
      style={{ backgroundColor: "var(--pomo-card)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
             style={{ backgroundColor: "var(--pomo-accent)" }}>
          <Music className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--pomo-text)" }}>Focus Music</h3>
          <p className="text-xs max-w-[200px] truncate" style={{ color: "var(--pomo-text-muted)" }}>{current.name}</p>
        </div>
      </div>

      {/* YouTube iframe */}
      <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden"
           style={{ backgroundColor: "var(--pomo-input)" }}>
        <iframe
          key={current.id}
          src={embedUrl}
          title="Music Player"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Playlist chips */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs" style={{ color: "var(--pomo-text-muted)" }}>Playlist</p>
          <button
            onClick={() => { setShowAddForm(p => !p); setError(''); }}
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: "var(--pomo-primary)" }}
          >
            <Plus className="w-3 h-3" />
            Tambah
          </button>
        </div>

        {/* Add custom form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 overflow-hidden"
            >
              <div className="rounded-xl p-3 space-y-2"
                   style={{ backgroundColor: "var(--pomo-input)" }}>
                <input
                  type="text"
                  value={urlInput}
                  onChange={e => { setUrlInput(e.target.value); setError(''); }}
                  placeholder="Paste URL atau ID YouTube..."
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                  style={{
                    backgroundColor: "var(--pomo-card)",
                    color: "var(--pomo-text)",
                  }}
                />
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="Nama playlist (opsional)"
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                  style={{
                    backgroundColor: "var(--pomo-card)",
                    color: "var(--pomo-text)",
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddCustom(); }}
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCustom}
                    className="flex-1 py-1.5 text-white text-xs font-medium rounded-lg transition-colors duration-150"
                    style={{ backgroundColor: "var(--pomo-primary)" }}
                  >
                    Tambahkan
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setError(''); setUrlInput(''); setNameInput(''); }}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors duration-150"
                    style={{
                      backgroundColor: "var(--pomo-input-hover)",
                      color: "var(--pomo-text-secondary)",
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allPlaylists.map(playlist => (
            <div
              key={playlist.id}
              className="group flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: current.id === playlist.id ? "var(--pomo-primary)" : "var(--pomo-input)",
                color: current.id === playlist.id ? "white" : "var(--pomo-text-secondary)",
              }}
              onClick={() => handlePlaylistChange(playlist)}
            >
              <span className="text-xs font-medium whitespace-nowrap max-w-[100px] truncate">
                {playlist.name}
              </span>
              {isCustom(playlist.id) && (
                <button
                  onClick={e => { e.stopPropagation(); handleRemove(playlist.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Open on YouTube */}
      <a
        href={`https://youtube.com/watch?v=${current.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 mt-3 text-xs transition-colors"
        style={{ color: "var(--pomo-text-muted)" }}
      >
        <ExternalLink className="w-3 h-3" />
        Buka di YouTube
      </a>
    </motion.div>
  );
});
