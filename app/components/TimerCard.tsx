import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { TimerMode, TimerSettings } from '@/app/types';

interface TimerCardProps {
  timer: {
    mode: TimerMode;
    timeRemaining: number;
    isRunning: boolean;
    completedSessions: number;
    formattedTime: string;
    progress: number;
    start: () => void;
    pause: () => void;
    reset: () => void;
    switchMode: (mode: TimerMode) => void;
    skip: () => void;
  };
  settings: TimerSettings;
}

export function TimerCard({ timer, settings }: TimerCardProps) {
  const isFocus = timer.mode === 'focus';
  const isBreak = timer.mode === 'break';
  const isLongBreak = timer.mode === 'longBreak';

  // Calculate sessions until long break
  const sessionsUntilLongBreak = settings.longBreakInterval - (timer.completedSessions % settings.longBreakInterval);

  return (
    <div className="bg-[#6B9B7A] rounded-3xl p-6 sm:p-8 shadow-xl">
      {/* Mode Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        <motion.button
          onClick={() => timer.switchMode('focus')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            isFocus 
              ? 'bg-[#E8E4DC] text-[#6B9B7A]' 
              : 'bg-transparent text-[#3D5A45] hover:bg-[#5A8A69]'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="tracking-widest">Focus</span>
        </motion.button>
        <motion.button
          onClick={() => timer.switchMode('break')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            isBreak 
              ? 'bg-[#E8E4DC] text-[#6B9B7A]' 
              : 'bg-transparent text-[#3D5A45] hover:bg-[#5A8A69]'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="tracking-widest">Break</span>
        </motion.button>
      </div>

      {/* Timer Display */}
      <div className="relative flex justify-center items-center mb-6">
        {/* Progress Ring (SVG) */}
        <svg className="absolute w-48 h-48 sm:w-56 sm:h-56" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            initial={{ strokeDashoffset: `${2 * Math.PI * 45}` }}
            animate={{ 
              strokeDashoffset: `${2 * Math.PI * 45 * (1 - timer.progress / 100)}` 
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            transform="rotate(-90 50 50)"
          />
        </svg>

        {/* Time Display */}
        <motion.div 
          className="text-6xl sm:text-7xl font-bold text-[#2D4A35] timer-digit z-10"
          key={timer.formattedTime}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {timer.formattedTime}
        </motion.div>
      </div>

      {/* Session Indicator */}
      {isFocus && (
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-xs text-[#3D5A45] bg-[#5A8A69]/30 px-3 py-1 rounded-full">
            {sessionsUntilLongBreak} session{sessionsUntilLongBreak !== 1 ? 's' : ''} until long break
          </span>
        </motion.div>
      )}

      {/* Mode Indicator */}
      {isLongBreak && (
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-sm font-medium text-[#E8E4DC] bg-[#F4A261] px-4 py-1 rounded-full">
            Long Break ☕
          </span>
        </motion.div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center items-center gap-3">
        {/* Reset Button */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={timer.reset}
            className="w-10 h-10 rounded-full bg-[#5A8A69] hover:bg-[#4A7A59] text-[#E8E4DC] transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Start/Pause Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={timer.isRunning ? timer.pause : timer.start}
            className={`px-8 py-6 rounded-xl font-bold text-lg tracking-widest transition-all duration-300 ${
              timer.isRunning
                ? 'bg-[#E8E4DC] text-[#6B9B7A] hover:bg-[#DDD8CE]'
                : 'bg-[#F4A261] text-[#2D4A35] hover:bg-[#E89150]'
            }`}
          >
            <motion.div
              className="flex items-center gap-2"
              initial={false}
              animate={{ scale: timer.isRunning ? 1 : [1, 1.02, 1] }}
              transition={{ 
                scale: { 
                  repeat: timer.isRunning ? 0 : Infinity, 
                  duration: 2 
                } 
              }}
            >
              {timer.isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  PAUSE
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  START
                </>
              )}
            </motion.div>
          </Button>
        </motion.div>

        {/* Skip Button */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={timer.skip}
            className="w-10 h-10 rounded-full bg-[#5A8A69] hover:bg-[#4A7A59] text-[#E8E4DC] transition-all duration-200"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Running Indicator */}
      {timer.isRunning && (
        <motion.div
          className="flex justify-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#E8E4DC]"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
