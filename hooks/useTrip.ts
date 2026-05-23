'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Trip } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function useTrip() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getTrips();
      setTrips(response.trips);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trips');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTrip = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getTrip(id);
      setCurrentTrip(response.trip);
      return response.trip;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trip');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTrip = useCallback(async (data: { 
    destination: string; 
    startDate: string;
    days: number; 
    budget: string; 
    interests: string[] 
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.createTrip(data);
      setTrips(prev => [response.trip, ...prev]);
      router.push(`/trips/${response.trip._id}/generating`);
      return response.trip;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    trips,
    currentTrip,
    isLoading,
    error,
    fetchTrips,
    fetchTrip,
    createTrip,
  };
}
