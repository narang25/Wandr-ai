'use client';

import React from 'react';
import { useTilt3D } from '@/hooks/useTilt3D';

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  glare?: boolean;
}

/**
 * A wrapper component that adds 3D tilt + glare to its children.
 * Use this in any page (including server components by importing it as a client component).
 */
export function Tilt3DCard({ 
  children, 
  className = '', 
  maxTilt = 12, 
  scale = 1.02,
  glare = true 
}: Tilt3DCardProps) {
  const { ref, tiltHandlers, GlareElement } = useTilt3D({
    maxTilt,
    scale,
    glare,
    maxGlare: 0.15,
    perspective: 800,
    speed: 400,
  });

  return (
    <div 
      ref={ref} 
      {...tiltHandlers} 
      className={`relative ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
      {GlareElement}
    </div>
  );
}
