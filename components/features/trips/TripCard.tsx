import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trip } from '@/lib/types';
import { MapPin, Calendar, Clock, DollarSign } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  // Determine gradient based on status
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

  return (
    <Link href={trip.status === 'generating' || trip.status === 'pending' ? `/trips/${trip._id}/generating` : `/trips/${trip._id}`}>
      <Card hoverLift className="h-full flex flex-col overflow-hidden group">
        {/* Gradient Header */}
        <div className={`h-32 bg-gradient-to-br ${gradientClass} relative`}>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
          <div className="absolute top-4 right-4 z-10">
            <Badge variant={badgeVariant} className="capitalize shadow-md backdrop-blur-md bg-void/70 border-subtle">
              {trip.status}
            </Badge>
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
              <DollarSign size={16} className="text-dim" />
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
