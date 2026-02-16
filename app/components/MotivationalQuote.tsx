import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Sparkles, RefreshCw } from 'lucide-react';
import { getRandomQuoteExcluding, type Quote as QuoteType } from '@/app/data/motivationalQuotes';

interface MotivationalQuoteProps {
  show: boolean;
}

/**
 * Motivational Quote Component
 * 
 * Displays a random motivational quote when all tasks are completed.
 * Features smooth animations and the ability to get a new quote.
 */
export function MotivationalQuote({ show }: MotivationalQuoteProps) {
  const [currentQuote, setCurrentQuote] = useState<QuoteType | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Set initial quote when shown
  useEffect(() => {
    if (show && !currentQuote) {
      setCurrentQuote(getRandomQuoteExcluding(null));
    }
  }, [show, currentQuote]);

  // Get a new quote
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentQuote(prev => getRandomQuoteExcluding(prev));
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {show && currentQuote && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.22, 1, 0.36, 1]
          }}
          className="relative bg-gradient-to-br from-[#6B9B7A] to-[#5A8A69] rounded-2xl p-5 mt-4 overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-2 right-2 opacity-20">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -bottom-4 -left-4 opacity-10">
            <Quote className="w-24 h-24 text-white" />
          </div>

          {/* Confetti-like decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/30"
                style={{
                  left: `${15 + i * 15}%`,
                  top: '20%',
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="w-5 h-5 text-[#F4A261]" />
                </motion.div>
                <span className="text-sm font-bold text-white/90">Congratulations!</span>
              </div>
              <motion.button
                onClick={handleRefresh}
                disabled={isRefreshing}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <motion.div
                  animate={{ rotate: isRefreshing ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <RefreshCw className="w-4 h-4 text-white/70" />
                </motion.div>
              </motion.button>
            </div>

            {/* Quote */}
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={currentQuote.text}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center py-2"
              >
                <Quote className="w-6 h-6 text-white/30 mx-auto mb-2" />
                <p className="text-white text-lg font-medium leading-relaxed italic">
                  "{currentQuote.text}"
                </p>
                <footer className="mt-3">
                  <cite className="text-white/70 text-sm not-italic">
                    — {currentQuote.author}
                  </cite>
                </footer>
              </motion.blockquote>
            </AnimatePresence>

            {/* Action hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-white/50 text-xs mt-4"
            >
              Tap the refresh icon for another quote
            </motion.p>
          </div>

          {/* Bottom gradient line */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F4A261] to-transparent"
            animate={{ 
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
