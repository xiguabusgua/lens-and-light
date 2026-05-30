import { useEffect, useCallback, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

type CursorState = 'idle' | 'hover' | 'click' | 'image' | 'text';

export function CustomCursor() {
  const [cursorState, setCursorState] = useState<CursorState>('idle');
  const [isPressed, setIsPressed] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const updateCursor = useCallback((e: MouseEvent) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
  }, [cursorX, cursorY]);

  const handleMouseDown = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleMouseEnter = useCallback((e: Event) => {
    const target = e.target as HTMLElement;

    if (target.tagName === 'IMG' || target.closest('img') || target.dataset.cursor === 'image') {
      setCursorState('image');
      return;
    }

    if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button') ||
        target.role === 'button' || target.dataset.cursor === 'hover' || target.dataset.cursor === 'view') {
      setCursorState('hover');
      return;
    }

    if (target.tagName === 'P' || target.tagName === 'SPAN' || target.tagName === 'H1' || target.tagName === 'H2' ||
        target.tagName === 'H3' || target.tagName === 'H4' || target.tagName === 'H5' || target.tagName === 'H6' ||
        target.dataset.cursor === 'text') {
      setCursorState('text');
      return;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCursorState('idle');
  }, []);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isFinePointer || prefersReducedMotion || isTouchDevice) {
      return;
    }

    document.body.classList.add('custom-cursor-active');

    window.addEventListener('mousemove', updateCursor, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    const addListeners = () => {
      const elements = document.querySelectorAll('a, button, img, p, span, h1, h2, h3, h4, h5, h6, [data-cursor], [role="button"]');
      elements.forEach(el => {
        if (!el.getAttribute('data-cursor-listened')) {
          el.addEventListener('mouseenter', handleMouseEnter);
          el.addEventListener('mouseleave', handleMouseLeave);
          el.setAttribute('data-cursor-listened', 'true');
        }
      });
    };

    addListeners();

    const observer = new MutationObserver(() => {
      addListeners();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', updateCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      observer.disconnect();
      const elements = document.querySelectorAll('[data-cursor-listened]');
      elements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.removeAttribute('data-cursor-listened');
      });
    };
  }, [updateCursor, handleMouseDown, handleMouseUp, handleMouseEnter, handleMouseLeave]);

  const dotScale =
    cursorState === 'hover' ? 4 :
    cursorState === 'image' ? 2.5 :
    cursorState === 'text' ? 1.5 :
    isPressed ? 0.8 : 1;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <div className="relative">
        <motion.div
          className="w-2 h-2 bg-accent rounded-full"
          animate={{ scale: dotScale }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        />

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            opacity: cursorState === 'hover' ? 1 : 0,
            scale: cursorState === 'hover' ? 1 : 0.5,
          }}
          transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="w-8 h-8 rounded-full border-2 border-accent bg-transparent" />
        </motion.div>

        <motion.span
          className="absolute inset-0 flex items-center justify-center font-ui text-[10px] font-medium uppercase tracking-widest text-accent whitespace-nowrap"
          animate={{
            opacity: cursorState === 'hover' ? 1 : 0,
            scale: cursorState === 'hover' ? 1 : 0.8,
          }}
          transition={{ duration: 0.15, delay: 0.05 }}
        >
          {cursorState === 'image' ? 'VIEW' : 'GO'}
        </motion.span>

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{
            opacity: cursorState === 'image' ? 1 : 0,
            scale: cursorState === 'image' ? 1 : 0.8,
          }}
          transition={{ duration: 0.15 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white">
            <line x1="10" y1="0" x2="10" y2="6" stroke="currentColor" strokeWidth="1" />
            <line x1="10" y1="14" x2="10" y2="20" stroke="currentColor" strokeWidth="1" />
            <line x1="0" y1="10" x2="6" y2="10" stroke="currentColor" strokeWidth="1" />
            <line x1="14" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute -top-px -left-px w-1.5 h-1.5 border-l border-t border-accent"
          animate={{ opacity: cursorState === 'image' ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        />
        <motion.div
          className="absolute -top-px -right-px w-1.5 h-1.5 border-r border-t border-accent"
          animate={{ opacity: cursorState === 'image' ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        />
        <motion.div
          className="absolute -bottom-px -left-px w-1.5 h-1.5 border-b border-l border-accent"
          animate={{ opacity: cursorState === 'image' ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        />
        <motion.div
          className="absolute -bottom-px -right-px w-1.5 h-1.5 border-b border-r border-accent"
          animate={{ opacity: cursorState === 'image' ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        />
      </div>

      {isPressed && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-accent/50"
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}
    </motion.div>
  );
}
