import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp } from 'lucide-react';

interface TaskCompletionProgressProps {
  completedCount: number;
  totalCount: number;
}

/**
 * Task Completion Progress Component
 * 
 * Displays an animated progress bar showing the percentage of completed tasks.
 * Updates smoothly when tasks are checked/unchecked.
 */
export function TaskCompletionProgress({ 
  completedCount, 
  totalCount 
}: TaskCompletionProgressProps) {
  // Calculate percentage
  const percentage = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0;

  // Determine color based on progress
  const getProgressColor = () => {
    if (percentage === 0) return 'bg-[#D4CFC6]';
    if (percentage < 30) return 'bg-[#F4A261]';
    if (percentage < 70) return 'bg-[#6B9B7A]';
    return 'bg-gradient-to-r from-[#6B9B7A] to-[#4A8A5A]';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#E8E4DC] rounded-2xl p-4 mt-4 shadow-md"
    >
      {/* Header with stats */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#6B9B7A]/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#6B9B7A]" />
          </div>
          <span className="text-sm font-bold text-[#2D4A35]">Task Progress</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8A8A8A]">
            <span className="font-bold text-[#6B9B7A]">{completedCount}</span>
            {' '}of{' '}
            <span className="font-bold text-[#2D4A35]">{totalCount}</span>
          </span>
          <motion.span
            key={percentage}
            initial={{ scale: 1.2, color: '#F4A261' }}
            animate={{ scale: 1, color: percentage === 100 ? '#6B9B7A' : '#2D4A35' }}
            className="text-lg font-bold min-w-[3rem] text-right"
          >
            {percentage}%
          </motion.span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 bg-[#D4CFC6] rounded-full overflow-hidden">
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)',
          }}
        />
        
        {/* Animated Progress Fill */}
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${getProgressColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 0.5, 
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          {/* Glow effect at the edge */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-white/40 to-transparent" />
          
          {/* Subtle pulse animation when complete */}
          {percentage === 100 && (
            <motion.div
              className="absolute inset-0 bg-white/30 rounded-full"
              animate={{ 
                opacity: [0, 0.5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}
        </motion.div>

        {/* Percentage markers */}
        {[0, 25, 50, 75, 100].map((marker) => (
          <div
            key={marker}
            className="absolute top-0 bottom-0 w-px bg-white/40"
            style={{ left: `${marker}%` }}
          />
        ))}
      </div>

      {/* Status message */}
      <motion.div 
        className="mt-2 text-center"
        key={percentage}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className={`
          text-xs font-medium
          ${percentage === 0 ? 'text-[#8A8A8A]' : ''}
          ${percentage > 0 && percentage < 50 ? 'text-[#F4A261]' : ''}
          ${percentage >= 50 && percentage < 100 ? 'text-[#6B9B7A]' : ''}
          ${percentage === 100 ? 'text-[#4A8A5A]' : ''}
        `}>
          {percentage === 0 && "Start completing tasks to see progress"}
          {percentage > 0 && percentage < 25 && "Good start! Keep going!"}
          {percentage >= 25 && percentage < 50 && "You're making progress!"}
          {percentage >= 50 && percentage < 75 && "More than halfway there!"}
          {percentage >= 75 && percentage < 100 && "Almost done!"}
          {percentage === 100 && (
            <span className="flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              All tasks completed! Amazing work!
            </span>
          )}
        </span>
      </motion.div>
    </motion.div>
  );
}
