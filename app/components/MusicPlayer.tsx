import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

// Curated list of copyright-free lo-fi playlists and tracks
// Using YouTube embeds for royalty-free/creative commons content
const PLAYLISTS = [
  {
    id: 'jfKfPfyJRdk',
    name: 'Lofi Girl - Study Beats',
    description: 'Relaxing beats to study/relax to',
    type: 'livestream' as const,
  },
  {
    id: 'rUxyKA_-grg',
    name: 'Chill Lo-Fi Hip Hop',
    description: 'Peaceful background music',
    type: 'playlist' as const,
  },
  {
    id: 'lTRiuFIWV54',
    name: 'Ambient Study Music',
    description: 'Calm atmospheric sounds',
    type: 'playlist' as const,
  },
  {
    id: 'q0BVR5jRXxE',
    name: 'Jazz Hop Cafe',
    description: 'Smooth jazz beats',
    type: 'playlist' as const,
  },
];

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState(PLAYLISTS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle play/pause by reloading iframe with appropriate parameters
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePlaylistChange = (playlist: typeof PLAYLISTS[0]) => {
    setCurrentPlaylist(playlist);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Build YouTube embed URL with parameters
  const getEmbedUrl = () => {
    const baseUrl = `https://www.youtube.com/embed/${currentPlaylist.id}`;
    const params = new URLSearchParams({
      autoplay: isPlaying ? '1' : '0',
      mute: isMuted ? '1' : '0',
      controls: '0',
      modestbranding: '1',
      rel: '0',
      playsinline: '1',
    });
    return `${baseUrl}?${params.toString()}`;
  };

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
            <p className="text-xs text-[#8A8A8A]">{currentPlaylist.name}</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="w-8 h-8 rounded-full hover:bg-[#D4CFC6] text-[#6B7B6B]"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className={`w-10 h-10 rounded-full ${
              isPlaying 
                ? 'bg-[#6B9B7A] text-white' 
                : 'bg-[#F4A261] text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Hidden YouTube Player */}
      <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden bg-[#D4CFC6]">
        <iframe
          ref={iframeRef}
          src={getEmbedUrl()}
          title="Music Player"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Playlist Selection */}
      <div className="mt-3 space-y-1">
        <p className="text-xs text-[#8A8A8A] mb-2">Select playlist:</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {PLAYLISTS.map((playlist) => (
            <motion.button
              key={playlist.id}
              onClick={() => handlePlaylistChange(playlist)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-left transition-all duration-200 ${
                currentPlaylist.id === playlist.id
                  ? 'bg-[#6B9B7A] text-white'
                  : 'bg-[#D4CFC6] text-[#5A5A5A] hover:bg-[#C9C4BB]'
              }`}
            >
              <p className="text-xs font-medium whitespace-nowrap">{playlist.name}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Open on YouTube */}
      <a
        href={`https://youtube.com/watch?v=${currentPlaylist.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 mt-3 text-xs text-[#8A8A8A] hover:text-[#6B7B6B] transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        Open on YouTube
      </a>
    </motion.div>
  );
}
