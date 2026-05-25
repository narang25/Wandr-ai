'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trip } from '@/lib/types';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { 
  MapPin, Calendar, DollarSign, Clock, Map, 
  ChevronLeft, Compass, FileText, Package
} from 'lucide-react';
import { MapView } from '@/components/features/trips/MapView';
import { WeatherWidget } from '@/components/features/trips/WeatherWidget';
import { CurrencyConverter } from '@/components/features/trips/CurrencyConverter';
import { PackingList } from '@/components/features/trips/PackingList';
import { downloadTripCalendar } from '@/lib/calendar';
import { downloadTripPDF } from '@/lib/pdf';

const CATEGORY_MAP: Record<string, { emoji: string; style: string }> = {
  'Food': { emoji: '🍜', style: 'bg-gold/10 text-gold border-gold/20' },
  'Dining': { emoji: '🍽️', style: 'bg-gold/10 text-gold border-gold/20' },
  'Culture': { emoji: '🏛️', style: 'bg-violet/10 text-violet border-violet/20' },
  'History': { emoji: '🏺', style: 'bg-violet/10 text-violet border-violet/20' },
  'Adventure': { emoji: '🏔️', style: 'bg-primary/10 text-primary border-primary/20' },
  'Nature': { emoji: '🌲', style: 'bg-primary/10 text-primary border-primary/20' },
  'Shopping': { emoji: '🛍️', style: 'bg-danger/10 text-danger border-danger/20' },
  'Relaxation': { emoji: '💆', style: 'bg-bright/10 text-bright border-bright/20' },
  'Entertainment': { emoji: '🎭', style: 'bg-primary/10 text-primary border-primary/20' },
  'Nightlife': { emoji: '🍹', style: 'bg-violet/10 text-violet border-violet/20' },
};

function getCategoryEmoji(category?: string) {
  const key = Object.keys(CATEGORY_MAP).find(k => category?.toLowerCase().includes(k.toLowerCase()));
  return key ? CATEGORY_MAP[key].emoji : '📍';
}

function getCategoryStyle(category?: string) {
  const key = Object.keys(CATEGORY_MAP).find(k => category?.toLowerCase().includes(k.toLowerCase()));
  return key ? CATEGORY_MAP[key].style : 'bg-subtle text-bright';
}

export default function PublicTripPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map' | 'hotels' | 'budget' | 'packing'>('itinerary');

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await api.getPublicTrip(id);
        setTrip(data.trip);
      } catch (err: any) {
        setError(err.message || 'Failed to load trip');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-danger/10 flex items-center justify-center mb-6 text-danger">
          <Compass size={40} />
        </div>
        <h1 className="text-3xl font-display font-bold text-bright mb-4">Trip Not Found</h1>
        <p className="text-muted text-lg max-w-md mx-auto mb-8">
          {error || "This trip doesn't exist or is not public."}
        </p>
        <Button size="lg" variant="primary" onClick={() => router.push('/')}>
          Create Your Own Trip
        </Button>
      </div>
    );
  }

  const { budgetBreakdown } = trip;
  
  return (
    <main className="min-h-screen bg-void relative">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet/5 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-void/80 backdrop-blur-xl border-b border-subtle">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push('/')} className="text-muted hover:text-bright -ml-2">
              <ChevronLeft size={20} className="mr-1" />
              Wandr.ai
            </Button>
            <div className="flex gap-3">
              <Button onClick={() => router.push('/register')} variant="primary" className="rounded-xl px-5 text-sm font-bold">
                Create Your Own Trip
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Badge variant="primary" className="px-3 py-1 text-sm bg-primary/10 border border-primary/20">
                    <MapPin size={14} className="mr-1" />
                    {trip.days} Days
                  </Badge>
                  <Badge className="px-3 py-1 text-sm bg-violet/10 text-violet border border-violet/20">
                    <DollarSign size={14} className="mr-1" />
                    {trip.budget}
                  </Badge>
                  <Badge className="px-3 py-1 text-sm bg-card border-subtle text-muted">
                    Shared Trip
                  </Badge>
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-bright tracking-tight leading-tight">
                  {trip.destination}
                </h1>
              </div>
              
              <div className="flex gap-3 shrink-0 flex-wrap">
                <Button onClick={() => downloadTripPDF(trip as any)} variant="ghost" className="rounded-2xl px-5 py-3 border-subtle/50 bg-card/50 shadow-lg hover:shadow-violet/20 hover:border-violet/50">
                  <FileText size={18} />
                  PDF
                </Button>
                <Button onClick={() => downloadTripCalendar(trip as any)} variant="ghost" className="rounded-2xl px-5 py-3 border-subtle/50 bg-card/50 shadow-lg hover:shadow-primary/20 hover:border-primary/50">
                  <Calendar size={18} />
                  Calendar
                </Button>
              </div>
            </div>

            {/* Quick Facts */}
            {trip.quickFacts && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-card/40 backdrop-blur-md border border-subtle">
                <div>
                  <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Language</p>
                  <p className="text-bright font-medium">{trip.quickFacts.language || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Currency</p>
                  <p className="text-bright font-medium">{trip.quickFacts.currency || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Best Time to Visit</p>
                  <p className="text-bright font-medium">{trip.quickFacts.bestTimeToVisit || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Visa Req.</p>
                  <p className="text-bright font-medium line-clamp-1">{trip.quickFacts.visaRequirements || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Content Section */}
        <section className="px-6 pb-32">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 relative">
            {/* Left Column: Main Content */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="flex gap-2 p-1.5 bg-card/40 backdrop-blur-md border border-subtle rounded-2xl w-fit mb-10 overflow-x-auto no-scrollbar max-w-full">
                {['itinerary', 'map', 'hotels', 'budget', 'packing'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-void text-bright shadow-lg shadow-black/20 border border-subtle/50'
                        : 'text-muted hover:text-bright hover:bg-card/50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'itinerary' && (
                    <div className="space-y-12">
                      {trip.itinerary?.map((day, idx) => (
                        <div key={idx} className="relative">
                          {/* Day Header */}
                          <div className="sticky top-24 z-30 bg-void/80 backdrop-blur-xl py-4 mb-6 border-b border-subtle">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl border border-primary/20 shadow-inner">
                                {day.day}
                              </div>
                              <div>
                                <h3 className="text-2xl font-display font-bold text-bright">{day.title}</h3>
                              </div>
                            </div>
                          </div>

                          {/* Activities timeline */}
                          <div className="space-y-6 relative pl-6">
                            <div className="absolute top-0 bottom-0 left-[27px] w-px bg-gradient-to-b from-subtle via-subtle to-transparent" />
                            {day.activities?.map((activity, aIdx) => (
                              <div key={aIdx} className="relative">
                                {/* Timeline Dot */}
                                <div className="absolute -left-6 w-3 h-3 rounded-full bg-void border-2 border-primary mt-1.5 z-10" />
                                
                                <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-subtle p-5 hover:bg-card/60 transition-colors group">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <Badge className={`px-2.5 py-0.5 text-xs font-semibold ${getCategoryStyle(activity.category)}`}>
                                          <span className="mr-1.5">{getCategoryEmoji(activity.category)}</span>
                                          {activity.category || 'Activity'}
                                        </Badge>
                                        {activity.time && (
                                          <span className="text-xs font-bold text-primary flex items-center bg-primary/10 px-2 py-0.5 rounded-md">
                                            <Clock size={12} className="mr-1" />
                                            {activity.time}
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="text-lg font-bold text-bright mb-2 group-hover:text-primary transition-colors">
                                        {activity.name}
                                      </h4>
                                      <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all">
                                        {activity.description}
                                      </p>
                                      
                                      <div className="flex items-center gap-4 text-xs font-medium text-dim">
                                        {activity.duration && (
                                          <span className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {activity.duration}
                                          </span>
                                        )}
                                        {activity.estimatedCost !== undefined && (
                                          <span className="flex items-center gap-1.5 text-gold">
                                            <span className="text-[10px]">{trip.quickFacts?.currencySymbol || '$'}</span>
                                            {activity.estimatedCost} est.
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'map' && <MapView itinerary={trip.itinerary} centerLat={trip.quickFacts?.location?.lat} centerLng={trip.quickFacts?.location?.lng} />}
                  
                  {activeTab === 'hotels' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {trip.hotels?.map((hotel, idx) => (
                        <div key={idx} className="bg-card/40 backdrop-blur-md border border-subtle rounded-3xl p-6 hover:bg-card/60 transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-4xl">{hotel.emoji || '🏨'}</span>
                              <div>
                                <h4 className="text-xl font-bold text-bright">{hotel.name}</h4>
                                <div className="flex items-center gap-2 text-sm mt-1">
                                  <Badge className="bg-gold/10 text-gold border-gold/20">
                                    ⭐ {hotel.rating}
                                  </Badge>
                                  <span className="text-muted">{hotel.tier}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted text-sm leading-relaxed mb-6">{hotel.description}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-subtle/50">
                            <span className="text-2xl font-bold text-bright">
                              {trip.quickFacts?.currencySymbol || '$'}{hotel.pricePerNight}<span className="text-sm font-normal text-muted">/night</span>
                            </span>
                            <span className="text-xs font-medium text-muted uppercase tracking-wider">Estimated</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeTab === 'budget' && budgetBreakdown && (
                    <div className="space-y-8">
                      <div className="bg-card/40 backdrop-blur-md border border-subtle rounded-[2rem] p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet/5 via-transparent to-primary/5" />
                        <p className="text-muted font-medium uppercase tracking-wider mb-2">Total Estimated Cost</p>
                        <h3 className="text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet">
                          {trip.quickFacts?.currencySymbol || '$'}{budgetBreakdown.total?.toLocaleString() || 0}
                        </h3>
                        <p className="text-dim text-sm mt-4">Based on {trip.days} days for {trip.budget} budget</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { label: 'Flights', value: budgetBreakdown.flights, icon: '✈️', color: 'from-blue-500/20' },
                          { label: 'Accommodation', value: budgetBreakdown.accommodation, icon: '🏨', color: 'from-violet/20' },
                          { label: 'Food', value: budgetBreakdown.food, icon: '🍜', color: 'from-gold/20' },
                          { label: 'Activities', value: budgetBreakdown.activities, icon: '🎟️', color: 'from-primary/20' },
                          { label: 'Transport', value: budgetBreakdown.transport, icon: '🚕', color: 'from-green-500/20' }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-card/30 backdrop-blur-sm border border-subtle rounded-3xl p-6 relative overflow-hidden group hover:border-subtle/80 transition-colors">
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${item.color} to-transparent opacity-20 rounded-bl-[100px] group-hover:opacity-40 transition-opacity`} />
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-3xl">{item.icon}</span>
                              <span className="text-2xl font-bold text-bright">{trip.quickFacts?.currencySymbol || '$'}{item.value?.toLocaleString() || 0}</span>
                            </div>
                            <p className="text-muted font-medium">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'packing' && <PackingList tripId={trip._id} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Widgets */}
            <div className="lg:w-80 shrink-0 space-y-6">
              {trip.quickFacts?.location && (
                <WeatherWidget 
                  lat={trip.quickFacts.location.lat} 
                  lng={trip.quickFacts.location.lng} 
                />
              )}
              <CurrencyConverter />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
