'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trip } from '@/lib/types';
import { api } from '@/lib/api';
import { MapPin, Calendar, Clock, Banknote, Trash2, Copy } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function TripCard({ trip, onDelete, onDuplicate }: TripCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const gradientClass =
    trip.status === 'ready'
      ? 'from-primary/20 to-violet/20'
      : trip.status === 'generating'
      ? 'from-gold/20 to-primary/20 animate-pulse'
      : 'from-subtle to-card';

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

  return (
    <Link href={trip.status === 'generating' || trip.status === 'pending' ? `/trips/${trip._id}/generating` : `/trips/${trip._id}`}>
      <Card hoverLift className="h-full flex flex-col overflow-hidden group relative">
        {/* Gradient Header */}
        <div className={`h-32 bg-gradient-to-br ${gradientClass} relative`}>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
          <div className="absolute top-4 right-4 z-10">
            <Badge variant={badgeVariant} className="capitalize shadow-md backdrop-blur-md bg-void/70 border-subtle">
              {trip.status}
            </Badge>
          </div>

          {/* Delete Button */}
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
                  className="px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-md text-muted text-xs font-bold border border-subtle hover:text-bright transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleDuplicate}
                  className="p-2 rounded-lg bg-void/60 backdrop-blur-md text-muted border border-subtle hover:text-primary hover:border-primary/30 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Duplicate trip"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg bg-void/60 backdrop-blur-md text-muted border border-subtle hover:text-danger hover:border-danger/30 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete trip"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col bg-card/50 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-6">
            <h3 className="font-display text-2xl font-bold text-bright line-clamp-2 leading-tight group-hover:text-primary transition-colors" title={trip.destination}>
              {trip.destination}
            </h3>
          </div>

          <div className="space-y-3 mt-auto text-sm text-muted">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-dim" />
              <span>{trip.days} {trip.days === 1 ? 'Day' : 'Days'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Banknote size={16} className="text-dim" />
              <span>{trip.budget} Budget</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-dim" />
              <span>Created {new Date(trip.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
