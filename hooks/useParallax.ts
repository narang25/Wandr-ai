'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook that returns a scroll-based Y offset for parallax effects.
 * @param speed - Multiplier for the parallax speed (0.1 = slow, 1 = match scroll)
 * @param max - Maximum offset in pixels to prevent content from moving too far
 */
export function useParallax(speed: number = 0.3, max: number = 200) {
  const [offset, setOffset] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const value = Math.min(scrollY * speed, max);
    setOffset(value);
  }, [speed, max]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return offset;
}
