import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';

interface AnimationStep {
  filter?: string;
  opacity?: number;
  y?: number;
  [key: string]: any;
}

const buildKeyframes = (from: AnimationStep, steps: AnimationStep[]) => {
  const keys = new Set([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);

  const keyframes: Record<string, any[]> = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return keyframes;
};

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'characters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: AnimationStep;
  animationTo?: AnimationStep[];
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
  startDelay?: number;
  isActive?: boolean; // Nuevo prop para controlar si está activa
}

const BlurText = ({
  text = '',
  delay = 3000,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = (t) => t,
  onAnimationComplete,
  stepDuration = 0.35,
  startDelay = 0,
  isActive = false, // Por defecto inactiva
}: BlurTextProps) => {
  const [inView, setInView] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && ref.current) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, rootMargin]);

  // Efecto para mostrar/ocultar basado en isActive
  useEffect(() => {
    if (!inView) return;

    if (isActive) {
      // Si está activa, mostrar después del delay inicial
      setTimeout(() => {
        setIsVisible(true);
      }, startDelay);
    } else {
      // Si no está activa, ocultar inmediatamente
      setIsVisible(false);
    }
  }, [inView, isActive, startDelay]);

  const defaultFrom = useMemo(
    () =>
      direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, y: -50 }
        : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5,
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1)
  );

  return (
    <motion.p
      ref={ref}
      className={`blur-text ${className}`}
      initial={{ filter: 'blur(10px)', opacity: 0, y: -50 }}
      animate={isVisible ? { filter: 'blur(0px)', opacity: 1, y: 0 } : { filter: 'blur(10px)', opacity: 0, y: -50 }}
      transition={{
        duration: 0.8,
        ease: easing,
      }}
    >
      {text}
    </motion.p>
  );
};

export default BlurText;
