import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight > 0) {
        const scrollPercent = (scrollTop / docHeight) * 100;
        setProgress(Math.min(scrollPercent, 100));
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    updateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (progress > 80) {
      const timeout = setTimeout(() => {
        setIsPulsing(true);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setIsPulsing(false);
    }
  }, [progress]);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[9998] bg-primary/10">
      <motion.div
        className="h-full bg-accent relative"
        style={{ width: `${Math.min(progress, 100)}%` }}
        transition={{
          duration: 0.15,
          ease: [0.25, 1, 0.5, 1],
        }}
      >
        <AnimatePresence>
          {progress > 5 && (
            <motion.div
              key="glow-dot"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[4px] h-[4px] rounded-full bg-accent"
              style={{
                boxShadow: '0 0 8px rgba(var(--color-accent) / 0.8), 0 0 16px rgba(var(--color-accent) / 0.4)',
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isPulsing && progress > 80 && (
            <motion.div
              key="pulse-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-accent/50 blur-[4px]"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isPulsing && progress > 80 && (
            <motion.div
              key="pulse-glow"
              initial={{ opacity: 0, scaleX: 1 }}
              animate={{ opacity: [0.5, 1, 0.5], scaleX: [1, 1.02, 1] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-accent origin-right"
              style={{
                filter: 'blur(2px)',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}