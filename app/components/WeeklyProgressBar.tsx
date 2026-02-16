import { motion } from 'framer-motion';
import { Calendar, Target } from 'lucide-react';
import { getWeekStart } from '@/app/hooks/useWeeklyProgress';

interface WeeklyProgressBarProps {
  completedCount: number;
  targetCount?: number;
}

/**
 * Weekly Progress Bar Component
 * 
 * Displays a visual progress bar showing how many tasks were completed
 * in the current week. Automatically resets when a new week starts.
 */
export function WeeklyProgressBar({ 
  completedCount, 
  targetCount = 10 // Default target: 10 tasks per week
}: WeeklyProgressBarProps) {
  const percentage = Math.min((completedCount / targetCount) * 100, 100);
  
  // Get current week info
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#E8E4DC] rounded-2xl p-4 mb-4 shadow-md"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#6B9B7A]/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-[#6B9B7A]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2D4A35]">Weekly Progress</h3>
            <p className="text-xs text-[#8A8A8A]">
              {formatDate(weekStart)} - {formatDate(weekEnd.toISOString().split('T')[0])}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3 text-[#F4A261]" />
          <span className="text-sm font-bold text-[#6B9B7A]">
            {completedCount}/{targetCount}
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-3 bg-[#D4CFC6] rounded-full overflow-hidden">
        {/* Background segments for visual reference */}
        <div className="absolute inset-0 flex">
          {[...Array(targetCount)].map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-[#C9C4BB] last:border-r-0"
            />
          ))}
        </div>
        
        {/* Animated Progress Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#6B9B7A] to-[#8AB89A] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 0.6, 
            ease: [0.22, 1, 0.36, 1],
            delay: 0.1 
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: 'linear',
              repeatDelay: 1 
            }}
          />
        </motion.div>

        {/* Milestone markers */}
        {[25, 50, 75].map((milestone) => (
          <div
            key={milestone}
            className="absolute top-0 bottom-0 w-px bg-white/30"
            style={{ left: `${milestone}%` }}
          />
        ))}
      </div>

      {/* Progress Labels */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-[#8A8A8A]">
          {percentage < 25 && "Keep going!"}
          {percentage >= 25 && percentage < 50 && "Good start!"}
          {percentage >= 50 && percentage < 75 && "Halfway there!"}
          {percentage >= 75 && percentage < 100 && "Almost done!"}
          {percentage === 100 && "Weekly goal reached!"}
        </span>
        <span className="text-xs font-medium text-[#6B9B7A]">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Celebration animation when goal reached */}
      {percentage === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 text-center"
        >
          <motion.span
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="inline-block text-lg"
          >
            🎉
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );
}
