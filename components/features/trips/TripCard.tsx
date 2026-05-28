'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trip } from '@/lib/types';
import { api } from '@/lib/api';
import { Calendar, Clock, Banknote, Trash2, Copy } from 'lucide-react';
import { useTilt3D } from '@/hooks/useTilt3D';

interface TripCardProps {
  trip: Trip;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

// Curated gradient themes for destinations
const DESTINATION_THEMES: [RegExp, { gradient: string; emoji: string }][] = [
  [/delhi/i, { gradient: 'from-amber-600/40 via-red-500/30 to-orange-400/40', emoji: '🕌' }],
  [/himachal|manali|shimla/i, { gradient: 'from-emerald-600/40 via-teal-500/30 to-cyan-400/40', emoji: '🏔️' }],
  [/goa/i, { gradient: 'from-yellow-500/40 via-orange-400/30 to-red-400/40', emoji: '🏖️' }],
  [/mumbai/i, { gradient: 'from-violet-600/40 via-purple-500/30 to-fuchsia-400/40', emoji: '🌃' }],
  [/rajasthan|jaipur|udaipur|jodhpur/i, { gradient: 'from-amber-500/40 via-yellow-500/30 to-orange-500/40', emoji: '🏰' }],
  [/kerala/i, { gradient: 'from-green-600/40 via-emerald-500/30 to-teal-400/40', emoji: '🌴' }],
  [/paris/i, { gradient: 'from-rose-500/40 via-pink-400/30 to-violet-400/40', emoji: '🗼' }],
  [/london/i, { gradient: 'from-slate-500/40 via-blue-400/30 to-indigo-400/40', emoji: '🇬🇧' }],
  [/tokyo|japan/i, { gradient: 'from-pink-500/40 via-rose-400/30 to-red-400/40', emoji: '🗾' }],
  [/new york|nyc/i, { gradient: 'from-blue-600/40 via-indigo-500/30 to-violet-400/40', emoji: '🗽' }],
  [/dubai/i, { gradient: 'from-amber-500/40 via-yellow-400/30 to-orange-300/40', emoji: '🌆' }],
  [/bali|indonesia/i, { gradient: 'from-emerald-500/40 via-green-400/30 to-lime-400/40', emoji: '🌺' }],
  [/rome|italy/i, { gradient: 'from-orange-500/40 via-amber-400/30 to-red-400/40', emoji: '🏛️' }],
  [/thailand|bangkok/i, { gradient: 'from-yellow-500/40 via-amber-400/30 to-orange-400/40', emoji: '🛕' }],
  [/switzerland/i, { gradient: 'from-sky-500/40 via-blue-400/30 to-cyan-400/40', emoji: '🏔️' }],
  [/maldives/i, { gradient: 'from-cyan-500/40 via-blue-400/30 to-teal-400/40', emoji: '🏝️' }],
  [/singapore/i, { gradient: 'from-violet-500/40 via-purple-400/30 to-blue-400/40', emoji: '🌃' }],
  [/australia|sydney/i, { gradient: 'from-blue-500/40 via-sky-400/30 to-cyan-400/40', emoji: '🦘' }],
  [/egypt|cairo/i, { gradient: 'from-amber-600/40 via-yellow-500/30 to-orange-500/40', emoji: '🏺' }],
  [/spain|barcelona/i, { gradient: 'from-red-500/40 via-orange-400/30 to-yellow-400/40', emoji: '💃' }],
  [/greece|santorini/i, { gradient: 'from-blue-500/40 via-sky-400/30 to-white/20', emoji: '🏛️' }],
  [/kashmir/i, { gradient: 'from-sky-500/40 via-teal-400/30 to-emerald-400/40', emoji: '🌷' }],
  [/varanasi|benaras/i, { gradient: 'from-orange-500/40 via-amber-400/30 to-yellow-400/40', emoji: '🪔' }],
  [/kolkata/i, { gradient: 'from-yellow-500/40 via-amber-400/30 to-red-400/40', emoji: '🌉' }],
  [/bangalore|bengaluru/i, { gradient: 'from-green-500/40 via-emerald-400/30 to-teal-400/40', emoji: '🌳' }],
];

const DEFAULT_THEMES = [
  { gradient: 'from-primary/30 via-violet/20 to-primary/30', emoji: '✈️' },
  { gradient: 'from-violet/30 via-primary/20 to-violet/30', emoji: '🌍' },
  { gradient: 'from-gold/30 via-amber-500/20 to-gold/30', emoji: '🧭' },
  { gradient: 'from-emerald-500/30 via-teal-500/20 to-cyan-500/30', emoji: '🗺️' },
  { gradient: 'from-rose-500/30 via-pink-500/20 to-violet/30', emoji: '🌄' },
];

function getTheme(destination: string) {
  for (const [pattern, theme] of DESTINATION_THEMES) {
    if (pattern.test(destination)) return theme;
  }
  // Deterministic fallback based on destination string
  const idx = destination.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % DEFAULT_THEMES.length;
  return DEFAULT_THEMES[idx];
}

export function TripCard({ trip, onDelete, onDuplicate }: TripCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const theme = getTheme(trip.destination);

  const badgeVariant =
    trip.status === 'ready'
      ? 'success'
      : trip.status === 'generating'
      ? 'gold'
      : trip.status === 'error'
      ? 'danger'
      : 'primary';

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    setIsDeleting(true);
    try {
      await api.deleteTrip(trip._id);
      onDelete?.();
    } catch (err) {
      console.error('Failed to delete trip:', err);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.duplicateTrip(trip._id);
      onDuplicate?.();
    } catch (err) {
      console.error('Failed to duplicate trip:', err);
    }
  };

  const { ref: tiltRef, tiltHandlers, GlareElement } = useTilt3D({
    maxTilt: 10,
    perspective: 800,
    scale: 1.03,
    speed: 400,
    glare: true,
    maxGlare: 0.2,
  });

  return (
    <Link href={trip.status === 'generating' || trip.status === 'pending' ? `/trips/${trip._id}/generating` : `/trips/${trip._id}`}>
      <div ref={tiltRef} {...tiltHandlers} className="h-full" style={{ transformStyle: 'preserve-3d' }}>
      <Card className="h-full flex flex-col overflow-hidden group relative">
        {/* Themed Header with Gradient + Emoji */}
        <div className="h-44 relative overflow-hidden">
          {/* Base gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />

          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />

          {/* Large emoji watermark */}
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-20 transform rotate-12 select-none group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500">
            {theme.emoji}
          </div>

          {/* Shimmer effect for hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000" />

          {/* Generating pulse effect */}
          {trip.status === 'generating' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          )}

          {/* Bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            <Badge variant={badgeVariant} className="capitalize shadow-lg backdrop-blur-md bg-void/60 border-subtle/50">
              {trip.status}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 left-4 z-10">
            {showConfirm ? (
              <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-lg bg-danger text-white text-xs font-bold hover:bg-danger/80 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? '...' : 'Confirm'}
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-3 py-1.5 rounded-lg bg-void/80 backdrop-blur-md text-muted text-xs font-bold border border-subtle hover:text-bright transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleDuplicate}
                  className="p-2 rounded-lg bg-void/60 backdrop-blur-md text-muted border border-subtle/50 hover:text-primary hover:border-primary/30 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Duplicate trip"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg bg-void/60 backdrop-blur-md text-muted border border-subtle/50 hover:text-danger hover:border-danger/30 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete trip"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Destination name overlaid */}
          <div className="absolute bottom-4 left-5 right-16 z-10">
            <h3 className="font-display text-2xl font-bold text-bright line-clamp-2 leading-tight dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-primary transition-colors" title={trip.destination}>
              {trip.destination}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col bg-card/80 backdrop-blur-sm">
          {/* Interest Tags */}
          {trip.interests && trip.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {trip.interests.slice(0, 3).map(interest => (
                <span key={interest} className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                  {interest}
                </span>
              ))}
              {trip.interests.length > 3 && (
                <span className="px-2.5 py-0.5 rounded-full bg-subtle text-muted text-[10px] font-bold">
                  +{trip.interests.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="space-y-2.5 mt-auto text-sm text-muted">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock size={14} className="text-primary" />
              </div>
              <span className="font-medium">{trip.days} {trip.days === 1 ? 'Day' : 'Days'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center">
                <Banknote size={14} className="text-gold" />
              </div>
              <span className="font-medium">{trip.budget} Budget</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet/10 flex items-center justify-center">
                <Calendar size={14} className="text-violet" />
              </div>
              <span className="font-medium">Created {new Date(trip.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        {GlareElement}
      </Card>
      </div>
    </Link>
  );
}
