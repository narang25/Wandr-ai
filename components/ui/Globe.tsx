'use client';

import { useEffect, useRef, useState } from 'react';
import createGlobe, { COBEOptions } from 'cobe';

interface GlobeProps {
  /** Array of [lat, lng] coordinate pairs to mark on the globe */
  markers?: [number, number][];
  className?: string;
  size?: number;
}

export function Globe({ markers = [], className = '', size = 400 }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const phiRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const pointerMovement = useRef(0);
  const rafRef = useRef<number>(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    let width = canvasRef.current.offsetWidth;

    const opts: COBEOptions = {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.5,
      mapSamples: 20000,
      mapBrightness: 8,
      baseColor: [0.15, 0.15, 0.2],
      markerColor: [0, 0.9, 1],
      glowColor: [0.1, 0.1, 0.15],
      markers: markers.map(([lat, lng]) => ({
        location: [lat, lng] as [number, number],
        size: 0.08,
      })),
    };

    const globe = createGlobe(canvasRef.current, opts);
    globeRef.current = globe;

    // Animation loop for auto-rotation
    const animate = () => {
      if (!pointerInteracting.current) {
        phiRef.current += 0.003;
      }
      globe.update({
        phi: phiRef.current + pointerMovement.current,
        width: width * 2,
        height: width * 2,
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [markers]);

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: '100%',
        maxWidth: size,
        aspectRatio: '1',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 1s ease-out',
      }}
    >
      {/* Glow behind globe */}
      <div className="absolute inset-0 rounded-full bg-primary/10 blur-[60px] scale-90 pointer-events-none" />
      
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerMovement.current;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerMovement.current = delta / 100;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerMovement.current = delta / 100;
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'grab',
          contain: 'layout paint size',
        }}
      />
    </div>
  );
}
