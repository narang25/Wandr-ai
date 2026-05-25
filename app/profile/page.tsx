'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTrip } from '@/hooks/useTrip';
import { User, Mail, Calendar, LogOut, MapPin, Plane, ChevronLeft } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { trips, fetchTrips } = useTrip();
  const router = useRouter();

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const uniqueDestinations = new Set(trips.map((t) => t.destination)).size;
    const totalDays = trips.reduce((sum, t) => sum + t.days, 0);
    return { totalTrips, uniqueDestinations, totalDays };
  }, [trips]);

  const initials = useMemo(() => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return '';
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [user?.createdAt]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-void pt-24 pb-20 px-6 sm:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-72 bg-violet/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-64 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto space-y-8 relative z-10"
      >
        {/* Back Button */}
        <motion.div variants={itemVariants}>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted hover:text-bright transition-colors duration-200 group"
          >
            <span className="w-10 h-10 rounded-full bg-card border border-subtle flex items-center justify-center group-hover:border-primary/40 transition-colors duration-200">
              <ChevronLeft size={18} />
            </span>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          variants={itemVariants}
          className="bg-card/60 backdrop-blur-xl border border-subtle rounded-[2rem] p-8 sm:p-10 relative overflow-hidden"
        >
          {/* Card accent glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-gradient-to-b from-primary/15 to-transparent blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-violet flex items-center justify-center text-void text-3xl font-display font-bold shadow-lg shadow-primary/20 mb-6">
              {initials}
            </div>

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-bright mb-2">
              {user?.name || 'Explorer'}
            </h1>

            {/* Email */}
            <div className="flex items-center gap-2 text-muted mb-1">
              <Mail size={15} className="text-primary/60" />
              <span className="text-sm">{user?.email || '—'}</span>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-2 text-muted">
              <Calendar size={15} className="text-violet/60" />
              <span className="text-sm">Member since {memberSince || '—'}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              icon: Plane,
              label: 'Total Trips',
              value: stats.totalTrips,
              color: 'text-primary',
              bg: 'bg-primary/10',
              border: 'border-primary/20',
            },
            {
              icon: MapPin,
              label: 'Destinations',
              value: stats.uniqueDestinations,
              color: 'text-violet',
              bg: 'bg-violet/10',
              border: 'border-violet/20',
            },
            {
              icon: Calendar,
              label: 'Days Planned',
              value: stats.totalDays,
              color: 'text-gold',
              bg: 'bg-gold/10',
              border: 'border-gold/20',
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-card/50 backdrop-blur-md border border-subtle rounded-2xl p-6 flex flex-col items-center text-center hover:${stat.border} transition-colors duration-300`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}
              >
                <stat.icon size={22} />
              </div>
              <p className="text-2xl font-display font-bold text-bright">
                {stat.value}
              </p>
              <p className="text-muted text-xs font-medium tracking-wide uppercase mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Account Details Card */}
        <motion.div
          variants={itemVariants}
          className="bg-card/40 backdrop-blur-xl border border-subtle rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-display font-semibold text-bright flex items-center gap-2">
            <User size={18} className="text-primary" />
            Account Details
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-subtle/60">
              <span className="text-sm text-muted">Full Name</span>
              <span className="text-sm text-bright font-medium">
                {user?.name || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-subtle/60">
              <span className="text-sm text-muted">Email Address</span>
              <span className="text-sm text-bright font-medium">
                {user?.email || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted">Member Since</span>
              <span className="text-sm text-bright font-medium">
                {memberSince || '—'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          variants={itemVariants}
          className="bg-danger/5 backdrop-blur-xl border border-danger/15 rounded-2xl p-6"
        >
          <h2 className="text-lg font-display font-semibold text-danger mb-1">
            Danger Zone
          </h2>
          <p className="text-sm text-muted mb-5">
            Sign out of your account on this device.
          </p>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 font-semibold text-sm transition-all duration-200 cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </motion.div>
      </motion.div>
    </main>
  );
}
