'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTrip } from '@/hooks/useTrip';
import { Button } from '@/components/ui/Button';
import { TripCard } from '@/components/features/trips/TripCard';
import { Plane, MapPin, Calendar, Plus, Sparkles, Compass, User, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { trips, isLoading, error, fetchTrips } = useTrip();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const tripsPlanned = trips.length;
  const uniqueCountries = new Set(trips.map((t) => t.destination)).size;
  const daysTraveled = trips.reduce((sum, t) => sum + t.days, 0);

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-void pt-28 pb-20 px-6 sm:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto space-y-12 relative z-10"
      >
        {/* Header Section */}
        <motion.header variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-bright mb-3 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet">{user?.name?.split(' ')[0] || 'Explorer'}</span>
            </h1>
            <p className="text-muted text-lg">Where is your next adventure taking you?</p>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/60 backdrop-blur-md border border-subtle text-muted hover:text-bright hover:border-primary/40 transition-all duration-200 text-sm font-medium shrink-0"
          >
            <User size={18} />
            Profile
          </Link>
        </motion.header>

        {/* Plan New Trip Banner - Massive Hero */}
        <motion.div variants={itemVariants}>
          <Link href="/trips/new" className="block group">
            <div className="relative overflow-hidden rounded-[2rem] p-8 sm:p-12 border border-subtle bg-card/60 backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:border-primary/50 hover:shadow-[0_20px_60px_-15px_rgba(0,229,255,0.3)]">
              {/* Animated mesh gradient background */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-void to-violet/10 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide mb-4 border border-primary/20">
                    <Sparkles size={14} /> AI-POWERED ITINERARIES
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-bright mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-violet transition-all duration-300">
                    Craft your perfect journey
                  </h2>
                  <p className="text-muted text-lg max-w-xl leading-relaxed">
                    Let our intelligent assistant build a bespoke itinerary, calculate your budget, and find the perfect hotels in seconds.
                  </p>
                </div>
                <div className="w-full md:w-auto flex justify-start md:justify-end shrink-0">
                  <div className="flex items-center gap-3 bg-white text-void px-8 py-4 rounded-2xl font-bold text-lg group-hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]">
                    <Plus size={24} />
                    Plan New Trip
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Plane, label: 'Trips Planned', value: tripsPlanned, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: MapPin, label: 'Destinations', value: uniqueCountries, color: 'text-violet', bg: 'bg-violet/10' },
            { icon: Calendar, label: 'Days Planned', value: daysTraveled, color: 'text-gold', bg: 'bg-gold/10' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-card/50 backdrop-blur-md border border-subtle rounded-3xl p-6 flex items-center gap-5 hover:bg-card/80 transition-colors duration-300">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} shadow-inner`}>
                <stat.icon size={26} />
              </div>
              <div>
                <p className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-bright mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.section>

        {/* Search & Filter Row */}
        <motion.section variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations..."
              className="w-full bg-card/50 backdrop-blur-md border border-subtle text-bright pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-primary placeholder:text-muted/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'ready', 'generating', 'pending', 'error'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-primary text-void'
                    : 'bg-card/50 text-muted border border-subtle hover:text-bright'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Trips List */}
        <motion.section variants={itemVariants} className="pt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-bold text-bright flex items-center gap-3">
              <Compass className="text-primary" size={28} />
              Your Adventures
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-3xl shimmer border border-subtle/50" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-danger bg-danger/5 border border-danger/20 rounded-3xl backdrop-blur-sm">
              <p className="text-lg">{error}</p>
              <Button variant="ghost" onClick={() => fetchTrips()} className="mt-6">
                Try Again
              </Button>
            </div>
          ) : filteredTrips.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredTrips.map((trip) => (
                <motion.div key={trip._id} variants={itemVariants}>
                  <TripCard trip={trip} onDelete={fetchTrips} onDuplicate={fetchTrips} />
                </motion.div>
              ))}
            </motion.div>
          ) : trips.length > 0 ? (
            <div className="text-center py-24 px-6 bg-card/40 backdrop-blur-lg border border-subtle rounded-[2rem] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
              <div className="w-24 h-24 rounded-full bg-subtle/30 flex items-center justify-center mx-auto mb-6 text-muted border border-subtle backdrop-blur-md">
                <Search size={40} className="opacity-50" />
              </div>
              <h3 className="text-2xl font-display font-bold text-bright mb-3">No trips match your search</h3>
              <p className="text-muted text-lg max-w-md mx-auto mb-10">
                Try adjusting your search query or status filter.
              </p>
              <Button size="lg" variant="ghost" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="text-center py-24 px-6 bg-card/40 backdrop-blur-lg border border-subtle rounded-[2rem] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
              <div className="w-24 h-24 rounded-full bg-subtle/30 flex items-center justify-center mx-auto mb-6 text-muted border border-subtle backdrop-blur-md">
                <Plane size={40} className="opacity-50" />
              </div>
              <h3 className="text-2xl font-display font-bold text-bright mb-3">No trips planned yet</h3>
              <p className="text-muted text-lg max-w-md mx-auto mb-10">
                You haven't planned any trips with Wandr.ai yet. Create your first itinerary to see the magic happen.
              </p>
              <Button size="lg" variant="primary" onClick={() => router.push('/trips/new')}>
                Plan Your First Trip
              </Button>
            </div>
          )}
        </motion.section>
      </motion.div>
    </main>
  );
}
