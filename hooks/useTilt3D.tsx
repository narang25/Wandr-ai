'use client';

import { useRef, useCallback, useState } from 'react';

interface TiltOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  glare?: boolean;
  maxGlare?: number;
}

/**
 * Hook that adds a 3D perspective tilt effect to an element.
 * Returns a ref and event handlers to apply to the target element.
 */
export function useTilt3D({
  maxTilt = 15,
  perspective = 1000,
  scale = 1.02,
  speed = 400,
  glare = true,
  maxGlare = 0.25,
}: TiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
      el.style.transition = `transform ${speed * 0.1}ms ease-out`;

      if (glare) {
        // Compute glare position & opacity based on mouse position
        const glareAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
        const glareDistance = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        const maxDistance = Math.sqrt(
          Math.pow(centerX, 2) + Math.pow(centerY, 2)
        );
        const glareOpacity = (glareDistance / maxDistance) * maxGlare;

        setGlareStyle({
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none' as const,
          borderRadius: 'inherit',
          zIndex: 50,
          opacity: glareOpacity,
          background: `linear-gradient(${glareAngle}deg, rgba(255,255,255,0.4) 0%, transparent 80%)`,
          transition: `opacity ${speed * 0.1}ms ease-out`,
        });
      }
    },
    [maxTilt, perspective, scale, speed, glare, maxGlare]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    el.style.transition = `transform ${speed}ms ease-out`;

    if (glare) {
      setGlareStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [perspective, speed, glare]);

  return {
    ref,
    tiltHandlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
    glareStyle,
    GlareElement: glare ? (
      <div style={glareStyle} aria-hidden="true" />
    ) : null,
  };
}
