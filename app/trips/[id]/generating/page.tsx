'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plane, Sparkles, Map, Hotel, Receipt } from 'lucide-react';
import { api } from '@/lib/api';

const GENERATING_STEPS = [
  { icon: Map, text: 'Analyzing your destination preferences...' },
  { icon: Sparkles, text: 'Curating the perfect daily activities...' },
  { icon: Hotel, text: 'Finding the best hotel accommodations...' },
  { icon: Receipt, text: 'Calculating detailed budget breakdown...' },
  { icon: Plane, text: 'Finalizing your bespoke itinerary...' },
];

export default function GeneratingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState('');

  // 1. Cycle through loading text steps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % GENERATING_STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Poll the trip status
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const response = await api.getTrip(id);
        const trip = response.trip;

        if (trip.status === 'ready') {
          router.push(`/trips/${id}`);
          return;
        }

        if (trip.status === 'error') {
          setError('AI failed to generate itinerary. Please try again.');
          return;
        }
        
        if (trip.status === 'pending') {
          // If somehow still pending, trigger generate
          await api.generateTrip(id);
        }

        // Keep polling if still generating
        timeoutId = setTimeout(checkStatus, 2000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to check status');
        timeoutId = setTimeout(checkStatus, 3000);
      }
    };

    checkStatus();

    return () => clearTimeout(timeoutId);
  }, [id, router]);

  const CurrentIcon = GENERATING_STEPS[currentStepIndex].icon;

  if (error) {
    return (
      <main className="min-h-screen bg-void flex items-center justify-center p-6">
        <div className="bg-card border border-danger/30 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4 text-danger">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-bright mb-2">Generation Failed</h2>
          <p className="text-muted mb-6">{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-xl bg-subtle text-bright hover:bg-subtle/80 transition-colors w-full"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-void flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Particles/Stars */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() 
            }}
            animate={{ 
              y: [null, Math.random() * window.innerHeight],
              opacity: [null, 0.2, 0.8, 0.2]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity,
              ease: "linear" 
            }}
            className="absolute w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(0,229,255,1)]"
          />
        ))}
      </div>

      <div className="z-10 text-center max-w-md w-full">
        {/* Animated Plane */}
        <div className="relative h-32 flex items-center justify-center mb-8">
          <motion.div
            animate={{ 
              y: [0, -10, 0, 10, 0],
              x: [0, 5, 0, -5, 0],
              rotate: [0, -5, 0, 5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-primary z-20"
          >
            <Plane size={64} className="fill-primary/20 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
          </motion.div>
          
          {/* Cloud/Trail effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0.5, 2, 3], x: [-20, -100, -150] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute right-1/2 w-8 h-8 rounded-full bg-primary/20 blur-xl z-10"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: [0, 0.3, 0], scale: [0.5, 1.5, 2], x: [-10, -80, -120] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            className="absolute right-1/2 w-6 h-6 rounded-full bg-violet/20 blur-lg z-10"
          />
        </div>

        {/* Progress Text */}
        <h1 className="text-3xl font-display font-bold text-bright mb-4 animate-pulse">
          Crafting Your Journey
        </h1>
        
        <div className="h-16 flex items-center justify-center">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 text-muted bg-card/50 backdrop-blur-sm border border-subtle/50 px-6 py-3 rounded-full shadow-lg"
          >
            <CurrentIcon size={18} className="text-primary animate-pulse" />
            <span className="font-medium text-sm sm:text-base">{GENERATING_STEPS[currentStepIndex].text}</span>
          </motion.div>
        </div>

        <div className="mt-8">
          <div className="h-1 w-full bg-subtle rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-violet"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-xs text-dim mt-4">This usually takes 10-20 seconds. Grab a coffee!</p>
        </div>
      </div>
    </main>
  );
}
