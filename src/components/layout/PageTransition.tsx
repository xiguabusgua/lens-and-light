import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevLocation = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevLocation.current) {
      setIsTransitioning(true);

      const exitTimeout = setTimeout(() => {
        setDisplayChildren(children);
        setIsTransitioning(false);
      }, 300);

      const completeTimeout = setTimeout(() => {
        prevLocation.current = location.pathname;
      }, 600);

      return () => {
        clearTimeout(exitTimeout);
        clearTimeout(completeTimeout);
      };
    } else {
      setDisplayChildren(children);
    }
  }, [children, location.pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1],
          }}
        >
          {displayChildren}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{
              clipPath: 'circle(0% at 50% 50%)',
              opacity: 0,
            }}
            animate={{
              clipPath: 'circle(150% at 50% 50%)',
              opacity: 1,
            }}
            exit={{
              clipPath: 'circle(150% at 50% 50%)',
              opacity: 0,
            }}
            transition={{
              duration: 0.5,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="fixed inset-0 z-[9997] bg-primary pointer-events-none"
          />
        )}
      </AnimatePresence>
    </>
  );
}