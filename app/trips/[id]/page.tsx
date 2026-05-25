'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '@/hooks/useTrip';
import { Trip, DayPlan, Hotel, Activity } from '@/lib/types';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  MapPin, Calendar, DollarSign, Clock, Map, 
  ChevronLeft, Info, Compass, Share2,
  Trash2, Plus, RefreshCw, X, FileText
} from 'lucide-react';
import { ChatWidget } from '@/components/features/chat/ChatWidget';
import { MapView } from '@/components/features/trips/MapView';
import { WeatherWidget } from '@/components/features/trips/WeatherWidget';
import { downloadTripCalendar } from '@/lib/calendar';
import { downloadTripPDF } from '@/lib/pdf';

const CATEGORY_MAP: Record<string, { emoji: string; style: string }> = {
  'Food': { emoji: '🍜', style: 'bg-gold/10 text-gold border-gold/20' },
  'Dining': { emoji: '🍽️', style: 'bg-gold/10 text-gold border-gold/20' },
  'Culture': { emoji: '🏛️', style: 'bg-violet/10 text-violet border-violet/20' },
  'History': { emoji: '📜', style: 'bg-violet/10 text-violet border-violet/20' },
  'Adventure': { emoji: '🏔️', style: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' },
  'Shopping': { emoji: '🛍️', style: 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/20' },
  'Nature': { emoji: '🌿', style: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' },
  'Nightlife': { emoji: '🌙', style: 'bg-violet/10 text-violet border-violet/20' },
  'Wellness': { emoji: '🧘', style: 'bg-primary/10 text-primary border-primary/20' },
  'Logistics': { emoji: '🚕', style: 'bg-muted/10 text-muted border-muted/20' },
  'Transport': { emoji: '✈️', style: 'bg-primary/10 text-primary border-primary/20' },
  'Custom': { emoji: '⭐', style: 'bg-gold/10 text-gold border-gold/20' },
};

function getCategoryEmoji(category: string): string {
  const key = Object.keys(CATEGORY_MAP).find(k => category?.toLowerCase().includes(k.toLowerCase()));
  return key ? CATEGORY_MAP[key].emoji : '📍';
}

function getCategoryStyle(category: string): string {
  const key = Object.keys(CATEGORY_MAP).find(k => category?.toLowerCase().includes(k.toLowerCase()));
  return key ? CATEGORY_MAP[key].style : 'bg-subtle text-bright';
}

export default function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { currentTrip, fetchTrip, isLoading, error } = useTrip();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map' | 'hotels' | 'budget'>('itinerary');

  useEffect(() => {
    fetchTrip(id);
  }, [id, fetchTrip]);

  const refreshTrip = useCallback(() => {
    fetchTrip(id);
  }, [id, fetchTrip]);

  if (isLoading || !currentTrip) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center p-8 border border-danger/30 rounded-3xl bg-danger/5 backdrop-blur-md">
          <div className="text-danger text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-display font-bold text-bright mb-2">Failed to load trip</h2>
          <p className="text-muted mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const trip = currentTrip;

  return (
    <main className="min-h-screen bg-void pb-24 relative overflow-hidden">
      {/* Dynamic Blurred Background */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-primary/10 via-violet/5 to-void pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-primary/20 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-40 left-0 w-1/2 h-96 bg-violet/20 blur-[150px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 px-6 sm:px-8 z-10">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => router.push('/dashboard')}
            className="group flex items-center gap-2 text-muted hover:text-bright transition-colors mb-10 bg-card/40 backdrop-blur-md border border-subtle px-4 py-2 rounded-full w-fit cursor-pointer"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 bg-card/30 backdrop-blur-xl border border-subtle/50 p-8 sm:p-12 rounded-[3rem] shadow-2xl">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide border border-primary/20">
                  {trip.days} DAYS
                </span>
                <span className="px-4 py-1.5 rounded-full bg-violet/10 text-violet text-sm font-bold tracking-wide border border-violet/20">
                  {trip.budget.toUpperCase()}
                </span>
                {trip.interests.slice(0, 3).map(interest => (
                  <span key={interest} className="px-4 py-1.5 rounded-full bg-card border border-subtle text-muted text-sm font-bold tracking-wide">
                    {interest.toUpperCase()}
                  </span>
                ))}
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
              <Button variant="primary" className="rounded-2xl px-5 py-3 shadow-lg shadow-primary/20">
                <Share2 size={18} />
                Share
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Facts Bar */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 mb-12 relative z-10">
        <div className="bg-card/40 backdrop-blur-lg border border-subtle/50 rounded-3xl p-6 flex flex-wrap items-center justify-around gap-6 text-sm sm:text-base">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Info size={20} /></div>
            <div>
              <p className="text-muted text-xs font-bold uppercase tracking-wider mb-0.5">Best Time</p>
              <p className="text-bright font-medium">{trip.quickFacts?.bestTimeToVisit || 'Year-round'}</p>
            </div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-subtle" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold"><DollarSign size={20} /></div>
            <div>
              <p className="text-muted text-xs font-bold uppercase tracking-wider mb-0.5">Currency</p>
              <p className="text-bright font-medium">{trip.quickFacts?.currency || 'Local'}</p>
            </div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-subtle" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet/10 flex items-center justify-center text-violet"><MapPin size={20} /></div>
            <div>
              <p className="text-muted text-xs font-bold uppercase tracking-wider mb-0.5">Language</p>
              <p className="text-bright font-medium">{trip.quickFacts?.language || 'Local'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10">
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex gap-2 p-1.5 bg-card/40 backdrop-blur-md border border-subtle rounded-2xl w-fit mb-10 overflow-x-auto no-scrollbar max-w-full">
            {['itinerary', 'map', 'hotels', 'budget'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`relative px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold capitalize transition-colors z-10 ${
                  activeTab === tab ? 'text-void' : 'text-muted hover:text-bright'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-violet rounded-xl -z-10 shadow-lg shadow-primary/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTab === 'itinerary' && <ItineraryTab itinerary={trip.itinerary} tripId={trip._id} onUpdate={refreshTrip} />}
              {activeTab === 'map' && <MapView itinerary={trip.itinerary} centerLat={trip.quickFacts?.location?.lat} centerLng={trip.quickFacts?.location?.lng} />}
              {activeTab === 'hotels' && <HotelsTab hotels={trip.hotels} />}
              {activeTab === 'budget' && <BudgetTab breakdown={trip.budgetBreakdown} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar Summary */}
        <div className="w-full lg:w-80 shrink-0 hidden lg:block">
          <div className="sticky top-24">
            <Card className="p-8 bg-card/60 backdrop-blur-xl border-subtle/50 shadow-2xl">
              <h3 className="font-display text-2xl font-bold text-bright mb-6 flex items-center gap-2">
                <Compass className="text-primary" size={24} />
                Overview
              </h3>
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-subtle/50 pb-4">
                  <span className="text-muted font-medium">Duration</span>
                  <span className="font-bold text-bright">{trip.days} Days</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle/50 pb-4">
                  <span className="text-muted font-medium">Total Est. Cost</span>
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet text-lg">
                    ${trip.budgetBreakdown?.total?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-muted font-medium">Activities</span>
                  <span className="font-bold text-bright px-3 py-1 bg-subtle rounded-lg">
                    {trip.itinerary?.reduce((acc: number, day: any) => acc + (day.activities?.length || 0), 0) || 0}
                  </span>
                </div>
              </div>
            </Card>

            <div className="mt-8">
              <WeatherWidget lat={trip.quickFacts?.location?.lat} lng={trip.quickFacts?.location?.lng} />
            </div>
          </div>
        </div>

      </div>
      
      {/* Floating Chat Widget */}
      <ChatWidget tripId={trip._id} />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────────────────────

function ItineraryTab({ itinerary, tripId, onUpdate }: { itinerary: DayPlan[]; tripId: string; onUpdate: () => void }) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [addingToDay, setAddingToDay] = useState<number | null>(null);
  const [regenerateDay, setRegenerateDay] = useState<number | null>(null);
  const [regenerateInstructions, setRegenerateInstructions] = useState('');

  // New activity form state
  const [newActivity, setNewActivity] = useState({ time: '12:00', name: '', description: '', category: 'Custom', estimatedCost: 0 });

  if (!itinerary || itinerary.length === 0) {
    return <div className="text-muted text-lg bg-card/30 p-8 rounded-3xl border border-subtle">No itinerary data available.</div>;
  }

  const handleRemoveActivity = async (dayIndex: number, activityId: string) => {
    setLoadingAction(`remove-${activityId}`);
    try {
      await api.removeActivity(tripId, dayIndex, activityId);
      onUpdate();
    } catch (err) {
      console.error('Failed to remove activity:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAddActivity = async (dayIndex: number) => {
    if (!newActivity.name.trim()) return;
    setLoadingAction(`add-${dayIndex}`);
    try {
      await api.addActivity(tripId, dayIndex, newActivity);
      setNewActivity({ time: '12:00', name: '', description: '', category: 'Custom', estimatedCost: 0 });
      setAddingToDay(null);
      onUpdate();
    } catch (err) {
      console.error('Failed to add activity:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRegenerateDay = async (dayNumber: number) => {
    setLoadingAction(`regen-${dayNumber}`);
    try {
      await api.regenerateDay(tripId, dayNumber, regenerateInstructions || undefined);
      setRegenerateDay(null);
      setRegenerateInstructions('');
      onUpdate();
    } catch (err) {
      console.error('Failed to regenerate day:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-16">
      {itinerary.map((day, dayIdx) => (
        <motion.div 
          key={day.day} 
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dayIdx * 0.1, duration: 0.5 }}
        >
          {/* Day Header */}
          <div className="sticky top-0 bg-void/80 backdrop-blur-xl py-6 z-20 mb-8 border-b border-subtle/30">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-3xl font-display font-bold text-bright flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet flex items-center justify-center text-void shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                  D{day.day}
                </div>
                {day.title}
              </h2>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setAddingToDay(addingToDay === dayIdx ? null : dayIdx)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                  Add
                </button>
                <button
                  onClick={() => setRegenerateDay(regenerateDay === day.day ? null : day.day)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-violet/10 text-violet border border-violet/20 hover:bg-violet/20 transition-colors cursor-pointer"
                >
                  <RefreshCw size={16} className={loadingAction === `regen-${day.day}` ? 'animate-spin' : ''} />
                  Regenerate
                </button>
              </div>
            </div>

            {/* Regenerate Day Panel */}
            <AnimatePresence>
              {regenerateDay === day.day && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 p-6 rounded-2xl bg-violet/5 border border-violet/20 backdrop-blur-md">
                    <p className="text-sm text-muted mb-3">Optional: Give instructions for the regenerated day</p>
                    <input
                      value={regenerateInstructions}
                      onChange={(e) => setRegenerateInstructions(e.target.value)}
                      placeholder="e.g. More outdoor activities, focus on food, etc."
                      className="w-full bg-card/60 border border-subtle text-bright px-4 py-3 rounded-xl mb-4 focus:outline-none focus:border-violet placeholder:text-muted/50"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRegenerateDay(day.day)}
                        disabled={loadingAction === `regen-${day.day}`}
                        className="px-6 py-2.5 rounded-xl bg-violet text-void font-bold text-sm hover:bg-violet/90 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {loadingAction === `regen-${day.day}` ? 'Regenerating...' : `Regenerate Day ${day.day}`}
                      </button>
                      <button
                        onClick={() => { setRegenerateDay(null); setRegenerateInstructions(''); }}
                        className="px-4 py-2.5 rounded-xl bg-card border border-subtle text-muted font-bold text-sm hover:text-bright transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add Activity Form */}
            <AnimatePresence>
              {addingToDay === dayIdx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 p-6 rounded-2xl bg-primary/5 border border-primary/20 backdrop-blur-md">
                    <h4 className="text-bright font-bold mb-4 flex items-center gap-2">
                      <Plus size={18} className="text-primary" />
                      Add Activity to Day {day.day}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <input
                        value={newActivity.name}
                        onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                        placeholder="Activity name *"
                        className="bg-card/60 border border-subtle text-bright px-4 py-3 rounded-xl focus:outline-none focus:border-primary placeholder:text-muted/50"
                      />
                      <input
                        type="time"
                        value={newActivity.time}
                        onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                        className="bg-card/60 border border-subtle text-bright px-4 py-3 rounded-xl focus:outline-none focus:border-primary [color-scheme:dark]"
                      />
                      <input
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                        placeholder="Description (optional)"
                        className="bg-card/60 border border-subtle text-bright px-4 py-3 rounded-xl focus:outline-none focus:border-primary placeholder:text-muted/50"
                      />
                      <select
                        value={newActivity.category}
                        onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                        className="bg-card/60 border border-subtle text-bright px-4 py-3 rounded-xl focus:outline-none focus:border-primary"
                      >
                        <option value="Custom">Custom</option>
                        <option value="Food">Food</option>
                        <option value="Culture">Culture</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Nature">Nature</option>
                        <option value="Logistics">Logistics</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAddActivity(dayIdx)}
                        disabled={!newActivity.name.trim() || loadingAction === `add-${dayIdx}`}
                        className="px-6 py-2.5 rounded-xl bg-primary text-void font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {loadingAction === `add-${dayIdx}` ? 'Adding...' : 'Add Activity'}
                      </button>
                      <button
                        onClick={() => setAddingToDay(null)}
                        className="px-4 py-2.5 rounded-xl bg-card border border-subtle text-muted font-bold text-sm hover:text-bright transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="space-y-8 pl-6 border-l-4 border-subtle/30 ml-7">
            {day.activities?.map((activity, idx) => (
              <div key={activity.id || idx} className="relative group">
                {/* Timeline Node */}
                <div className="absolute -left-[35px] top-6 w-5 h-5 rounded-full bg-void border-4 border-subtle group-hover:border-primary transition-colors duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] z-10" />
                
                <Card className="p-6 sm:p-8 bg-card/40 backdrop-blur-md hover:bg-card/80 border-subtle/50 hover:border-primary/40 transition-all duration-300 ml-6 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 w-full">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="text-primary font-bold tracking-wide flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                          <Clock size={16} />
                          {activity.time}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs uppercase font-bold tracking-wider border border-subtle/50 ${getCategoryStyle(activity.category)}`}>
                          {getCategoryEmoji(activity.category)} {activity.category}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-bright mb-3 break-words">{activity.name}</h3>
                      <p className="text-muted text-base leading-relaxed break-words">{activity.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      {activity.estimatedCost > 0 && (
                        <div className="flex items-center gap-1.5 text-gold bg-gold/10 border border-gold/20 px-4 py-2 rounded-xl font-bold text-lg">
                          <DollarSign size={18} />
                          {activity.estimatedCost}
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveActivity(dayIdx, activity.id)}
                        disabled={loadingAction === `remove-${activity.id}`}
                        className="p-2.5 rounded-xl bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer disabled:opacity-50"
                        title="Remove activity"
                      >
                        {loadingAction === `remove-${activity.id}` ? <Spinner size="sm" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function HotelsTab({ hotels }: { hotels: Hotel[] }) {
  if (!hotels || hotels.length === 0) {
    return <div className="text-muted text-lg bg-card/30 p-8 rounded-3xl border border-subtle">No hotel data available.</div>;
  }

  return (
    <div className="space-y-8">
      <p className="text-lg text-muted mb-8 bg-card/30 p-6 rounded-3xl border border-subtle backdrop-blur-sm">
        AI-recommended accommodations tailored to your budget and interests.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {hotels.map((hotel, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
          >
            <Card hoverLift className="flex flex-col overflow-hidden group h-full bg-card/40 backdrop-blur-xl border-subtle/50">
              <div className="h-40 bg-gradient-to-br from-subtle/50 to-card relative flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500">
                {hotel.emoji || '🏨'}
                <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent opacity-60" />
                <div className="absolute bottom-4 right-4 z-10">
                  <span className="px-3 py-1.5 bg-void/80 backdrop-blur-md border border-subtle rounded-xl text-sm font-bold text-gold flex items-center gap-1.5 shadow-lg">
                    ⭐ {hotel.rating}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col relative z-10 bg-card">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-display font-bold text-2xl text-bright group-hover:text-primary transition-colors">{hotel.name}</h3>
                  <div className="text-right shrink-0 ml-4">
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet">${hotel.pricePerNight}</span>
                    <span className="text-xs text-muted block uppercase tracking-wide">per night</span>
                  </div>
                </div>
                <p className="text-muted mb-6 flex-1 text-sm leading-relaxed">{hotel.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-subtle/50">
                  {hotel.amenities?.slice(0, 4).map(amenity => (
                    <span key={amenity} className="text-xs font-medium px-3 py-1 rounded-lg bg-subtle text-bright border border-subtle/50">
                      {amenity}
                    </span>
                  ))}
                  {(hotel.amenities?.length || 0) > 4 && (
                    <span className="text-xs font-medium px-3 py-1 rounded-lg bg-transparent text-muted border border-subtle/50">
                      +{(hotel.amenities?.length || 0) - 4} more
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BudgetTab({ breakdown }: { breakdown: any }) {
  if (!breakdown) {
    return <div className="text-muted text-lg bg-card/30 p-8 rounded-3xl border border-subtle">No budget data available.</div>;
  }

  const items = [
    { label: 'Flights / Transport', value: breakdown.flights, color: 'bg-primary' },
    { label: 'Accommodation', value: breakdown.accommodation, color: 'bg-violet' },
    { label: 'Food & Dining', value: breakdown.food, color: 'bg-gold' },
    { label: 'Activities & Tours', value: breakdown.activities, color: 'bg-[#10B981]' },
    { label: 'Local Transport', value: breakdown.transport, color: 'bg-[#F43F5E]' },
  ];

  const total = breakdown.total || items.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="space-y-10 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="p-10 sm:p-14 bg-card/40 backdrop-blur-2xl text-center relative overflow-hidden border-subtle/50 shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary via-violet to-gold" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
          
          <p className="text-muted mb-4 uppercase tracking-[0.2em] text-sm font-bold relative z-10">Estimated Total Cost</p>
          <h2 className="text-6xl sm:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet relative z-10 tracking-tight">
            ${total.toLocaleString()}
          </h2>
        </Card>
      </motion.div>

      <div className="space-y-6 bg-card/30 p-8 sm:p-10 rounded-[3rem] border border-subtle backdrop-blur-md">
        <h3 className="font-display font-bold text-3xl text-bright mb-8">Cost Breakdown</h3>
        {items.map((item, idx) => {
          const percentage = total > 0 ? ((item.value || 0) / total) * 100 : 0;
          return (
            <motion.div 
              key={item.label} 
              className="space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              <div className="flex justify-between items-end text-lg">
                <span className="text-bright font-medium">{item.label}</span>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-muted to-bright">
                  ${(item.value || 0).toLocaleString()}
                </span>
              </div>
              <div className="h-4 w-full bg-subtle rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 + (idx * 0.1) }}
                  className={`h-full ${item.color} shadow-[0_0_10px_currentColor]`} 
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
