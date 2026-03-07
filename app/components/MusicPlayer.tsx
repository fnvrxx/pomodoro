'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ExternalLink, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { CustomPlaylist } from '@/app/types';

// Default curated playlists
const DEFAULT_PLAYLISTS: CustomPlaylist[] = [
  { id: 'jfKfPfyJRdk', name: 'Lofi Girl', addedAt: 0 },
  { id: 'rUxyKA_-grg', name: 'Chill Lo-Fi', addedAt: 0 },
  { id: 'lTRiuFIWV54', name: 'Ambient Study', addedAt: 0 },
  { id: 'q0BVR5jRXxE', name: 'Jazz Hop', addedAt: 0 },
];

/** Extract YouTube video ID from various URL formats or return raw ID */
function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();

  // Already a bare ID (11 chars, alphanumeric + - _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);

    // youtu.be/ID
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1).split('?')[0];
      if (id.length === 11) return id;
    }

    // youtube.com/watch?v=ID
    const v = url.searchParams.get('v');
    if (v && v.length === 11) return v;

    // youtube.com/embed/ID
    const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    // youtube.com/live/ID
    const liveMatch = url.pathname.match(/\/live\/([a-zA-Z0-9_-]{11})/);
    if (liveMatch) return liveMatch[1];
  } catch {
    // Not a valid URL, already handled above
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(allPlaylists[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');

  const handlePlaylistChange = (playlist: CustomPlaylist) => {
    setCurrent(playlist);
    setIsPlaying(true);
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
    setIsPlaying(true);
    setUrlInput('');
    setNameInput('');
    setShowAddForm(false);
  };

  const handleRemove = (id: string) => {
    onRemovePlaylist(id);
    // If removing the currently playing, switch to first default
    if (current.id === id) {
      setCurrent(DEFAULT_PLAYLISTS[0]);
      setIsPlaying(false);
    }
  };

  const embedUrl = (() => {
    const params = new URLSearchParams({
      autoplay: isPlaying ? '1' : '0',
      mute: isMuted ? '1' : '0',
      controls: '0',
      modestbranding: '1',
      rel: '0',
      playsinline: '1',
    });
    return `https://www.youtube.com/embed/${current.id}?${params.toString()}`;
  })();

  const iframeKey = `${current.id}-${isPlaying}-${isMuted}`;
  const isCustom = (id: string) => customPlaylists.some(p => p.id === id);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-[#E8E4DC] rounded-3xl p-4 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F4A261] flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2D4A35]">Focus Music</h3>
            <p className="text-xs text-[#8A8A8A] max-w-[140px] truncate">{current.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(p => !p)}
            className="w-8 h-8 rounded-full hover:bg-[#D4CFC6] text-[#6B7B6B]"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying(p => !p)}
            className={`w-10 h-10 rounded-full ${isPlaying ? 'bg-[#6B9B7A]' : 'bg-[#F4A261]'} text-white`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* YouTube iframe */}
      <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden bg-[#D4CFC6]">
        <iframe
          key={iframeKey}
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
          <p className="text-xs text-[#8A8A8A]">Playlist</p>
          <button
            onClick={() => { setShowAddForm(p => !p); setError(''); }}
            className="flex items-center gap-1 text-xs text-[#6B9B7A] hover:text-[#5A8A69] font-medium transition-colors"
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
              <div className="bg-[#D4CFC6] rounded-xl p-3 space-y-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={e => { setUrlInput(e.target.value); setError(''); }}
                  placeholder="Paste URL atau ID YouTube..."
                  className="w-full bg-[#E8E4DC] rounded-lg px-3 py-2 text-xs text-[#2D4A35]
                             placeholder:text-[#9A9A9A] outline-none focus:ring-1 focus:ring-[#6B9B7A]/50"
                />
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="Nama playlist (opsional)"
                  className="w-full bg-[#E8E4DC] rounded-lg px-3 py-2 text-xs text-[#2D4A35]
                             placeholder:text-[#9A9A9A] outline-none focus:ring-1 focus:ring-[#6B9B7A]/50"
                  onKeyDown={e => { if (e.key === 'Enter') handleAddCustom(); }}
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCustom}
                    className="flex-1 py-1.5 bg-[#6B9B7A] hover:bg-[#5A8A69] text-white text-xs
                               font-medium rounded-lg transition-colors duration-150"
                  >
                    Tambahkan
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setError(''); setUrlInput(''); setNameInput(''); }}
                    className="px-3 py-1.5 bg-[#C9C4BB] hover:bg-[#BDB8AE] text-[#5A5A5A] text-xs
                               rounded-lg transition-colors duration-150"
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
              className={`group flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                         transition-colors duration-150 cursor-pointer
                         ${current.id === playlist.id
                           ? 'bg-[#6B9B7A] text-white'
                           : 'bg-[#D4CFC6] text-[#5A5A5A] hover:bg-[#C9C4BB]'
                         }`}
              onClick={() => handlePlaylistChange(playlist)}
            >
              <span className="text-xs font-medium whitespace-nowrap max-w-[100px] truncate">
                {playlist.name}
              </span>
              {isCustom(playlist.id) && (
                <button
                  onClick={e => { e.stopPropagation(); handleRemove(playlist.id); }}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity duration-150
                             ${current.id === playlist.id ? 'text-white/70 hover:text-white' : 'text-[#8A8A8A] hover:text-red-400'}`}
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
        className="flex items-center justify-center gap-1.5 mt-3 text-xs text-[#8A8A8A]
                   hover:text-[#6B7B6B] transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        Buka di YouTube
      </a>
    </motion.div>
  );
});
