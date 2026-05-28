'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTrip } from '@/hooks/useTrip';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/features/trips/StepIndicator';
import { MapPin, Calendar, Wallet, Heart, Sparkles, ChevronLeft } from 'lucide-react';
import { getCurrencySymbolForDestination } from '@/lib/currency';

const INTEREST_OPTIONS = [
  'Food & Dining', 'Culture & History', 'Adventure', 'Shopping',
  'Nature & Outdoors', 'Nightlife', 'Art & Museums', 'Wellness & Spa',
];

const BUDGET_OPTIONS = [
  { id: 'Budget', label: 'Budget', desc: 'Hostels, street food, public transit', price: '$0 - $100 / day', icon: '🎒' },
  { id: 'Mid-Range', label: 'Mid-Range', desc: '3-star hotels, nice restaurants, taxis', price: '$100 - $300 / day', icon: '🚕' },
  { id: 'Luxury', label: 'Luxury', desc: '5-star resorts, fine dining, private drivers', price: '$300+ / day', icon: '🥂' },
];

const PLACEHOLDERS = ['Paris, France', 'Tokyo, Japan', 'Bali, Indonesia', 'New York, USA', 'Rome, Italy'];

export default function NewTripPage() {
  const router = useRouter();
  const { createTrip } = useTrip();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState('Mid-Range');
  const [interests, setInterests] = useState<string[]>([]);

  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  useEffect(() => {
    if (step !== 1) return;
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [step]);

  const handleNext = () => {
    if (step === 1) {
      if (!destination.trim()) return setError('Please enter a destination to continue.');
      if (!startDate) return setError('Please select a start date.');
    }
    if (step === 4 && interests.length === 0) return setError('Please select at least one interest.');
    
    setError('');
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await createTrip({ destination, startDate, days, budget, interests });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
      setIsSubmitting(false);
    }
  };

  const slideVariants: Variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0, scale: 0.95, transition: { duration: 0.3 } })
  };

  return (
    <main className="min-h-screen bg-void pt-28 pb-20 px-6 relative overflow-hidden flex flex-col">
      {/* Background glow that follows the current step color */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] blur-[150px] rounded-full pointer-events-none opacity-30 transition-colors duration-1000" 
        style={{
          background: step === 1 ? '#00E5FF' : step === 2 ? '#8B5CF6' : step === 3 ? '#FBBF24' : step === 4 ? '#EF4444' : 'linear-gradient(to right, #00E5FF, #8B5CF6)'
        }}
      />

      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col relative z-10">
        <button 
          onClick={() => step === 1 ? router.push('/dashboard') : handleBack()}
          className="group flex items-center gap-2 text-muted hover:text-bright transition-colors mb-12 self-start bg-card/50 px-4 py-2 rounded-full border border-subtle backdrop-blur-md cursor-pointer"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">{step === 1 ? 'Dashboard' : 'Back'}</span>
        </button>

        <div className="mb-16">
          <StepIndicator currentStep={step} totalSteps={5} />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 rounded-2xl bg-danger/10 border border-danger/30 text-danger text-center backdrop-blur-md">
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait" custom={1}>
            {step === 1 && (
              <motion.div key="step1" initial="enter" animate="center" exit="exit" variants={slideVariants} className="space-y-10 text-center">
                <div>
                  <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mx-auto mb-8 text-primary shadow-[0_0_30px_rgba(0,229,255,0.2)] border border-primary/20">
                    <MapPin size={40} />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-bright mb-4">Where to?</h2>
                  <p className="text-muted text-lg">Enter the city, region, or country of your dreams.</p>
                </div>
                
                <div className="relative max-w-xl mx-auto w-full space-y-6">
                  <input 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={PLACEHOLDERS[placeholderIdx]}
                    className="w-full bg-card/60 backdrop-blur-xl border-2 border-subtle text-bright text-center text-3xl sm:text-4xl py-8 px-6 rounded-[2.5rem] focus:outline-none focus:border-primary focus:shadow-[0_0_40px_rgba(0,229,255,0.15)] transition-all placeholder:text-muted/50 font-display"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && startDate && handleNext()}
                  />
                  <div className="flex flex-col items-center">
                    <label className="text-muted font-medium mb-3">When are you going?</label>
                    <input 
                      type="date"
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full sm:w-2/3 bg-card/60 backdrop-blur-xl border-2 border-subtle text-bright text-center text-xl py-4 px-6 rounded-[2rem] focus:outline-none focus:border-primary focus:shadow-[0_0_40px_rgba(0,229,255,0.15)] transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial="enter" animate="center" exit="exit" variants={slideVariants} className="space-y-10 text-center">
                <div>
                  <div className="w-20 h-20 rounded-[2rem] bg-violet/10 flex items-center justify-center mx-auto mb-8 text-violet shadow-[0_0_30px_rgba(139,92,246,0.2)] border border-violet/20">
                    <Calendar size={40} />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-bright mb-4">How long?</h2>
                  <p className="text-muted text-lg">Select the number of days for your trip (up to 21).</p>
                </div>

                <div className="max-w-xl mx-auto w-full bg-card/40 backdrop-blur-lg border border-subtle rounded-[3rem] p-12">
                  <motion.div 
                    key={days}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet to-primary mb-12"
                  >
                    {days}
                  </motion.div>
                  
                  <input
                    type="range" min="1" max="21" value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="w-full h-3 bg-subtle rounded-full appearance-none cursor-pointer accent-violet hover:accent-primary transition-all"
                  />
                  <div className="flex justify-between text-sm text-dim mt-6 font-bold uppercase tracking-wider">
                    <span>1 day</span>
                    <span>21 days</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial="enter" animate="center" exit="exit" variants={slideVariants} className="space-y-10 text-center">
                <div>
                  <div className="w-20 h-20 rounded-[2rem] bg-gold/10 flex items-center justify-center mx-auto mb-8 text-gold shadow-[0_0_30px_rgba(251,191,36,0.2)] border border-gold/20">
                    <Wallet size={40} />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-bright mb-4">What's the budget?</h2>
                  <p className="text-muted text-lg">We'll tailor hotel and activity recommendations to match.</p>
                </div>

                <div className="space-y-4 max-w-2xl mx-auto w-full">
                  {BUDGET_OPTIONS.map((opt) => {
                    const currencySymbol = getCurrencySymbolForDestination(destination);
                    const dynamicPrice = opt.price.replace(/\$/g, currencySymbol);
                    
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setBudget(opt.id)}
                        className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 flex items-center gap-6 group ${
                          budget === opt.id
                            ? 'border-gold bg-gold/5 scale-[1.02] shadow-[0_0_30px_rgba(251,191,36,0.15)]'
                            : 'border-subtle bg-card/60 backdrop-blur-md hover:border-gold/40 hover:bg-white/5'
                        }`}
                      >
                        <div className={`text-4xl transition-transform duration-300 ${budget === opt.id ? 'scale-110' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                          {opt.icon}
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-bright text-xl mb-1">{opt.label}</h3>
                          <p className="text-muted text-sm">{opt.desc}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-sm font-bold tracking-wide px-4 py-2 rounded-xl ${budget === opt.id ? 'bg-gold/20 text-gold' : 'bg-subtle text-dim'}`}>
                            {dynamicPrice}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial="enter" animate="center" exit="exit" variants={slideVariants} className="space-y-10 text-center">
                <div>
                  <div className="w-20 h-20 rounded-[2rem] bg-danger/10 flex items-center justify-center mx-auto mb-8 text-danger shadow-[0_0_30px_rgba(239,68,68,0.2)] border border-danger/20">
                    <Heart size={40} />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-bright mb-4">What do you love?</h2>
                  <p className="text-muted text-lg">Select as many interests as you like to personalize your itinerary.</p>
                </div>

                <div className="flex flex-wrap gap-4 justify-center max-w-3xl mx-auto">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-8 py-4 rounded-full border-2 transition-all duration-300 font-bold text-lg cursor-pointer ${
                          isSelected
                            ? 'bg-danger/20 border-danger text-bright shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-105'
                            : 'bg-card/60 backdrop-blur-md border-subtle text-muted hover:border-danger/40 hover:text-bright'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial="enter" animate="center" exit="exit" variants={slideVariants} className="space-y-10 text-center">
                <div>
                  <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary to-violet flex items-center justify-center mx-auto mb-8 text-void shadow-[0_0_40px_rgba(0,229,255,0.4)] animate-pulse-glow border border-white/20">
                    <Sparkles size={48} className="animate-pulse" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-bright mb-4">Review & Generate</h2>
                  <p className="text-muted text-lg">Our AI is ready to craft your perfect journey.</p>
                </div>

                <div className="bg-card/40 backdrop-blur-2xl border border-subtle rounded-[2.5rem] p-8 max-w-xl mx-auto w-full">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-subtle pb-6">
                      <span className="text-muted font-medium">Destination</span>
                      <span className="text-2xl font-display font-bold text-bright">{destination}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-subtle pb-6">
                      <span className="text-muted font-medium">Start Date</span>
                      <span className="text-xl font-bold text-bright">{new Date(startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-subtle pb-6">
                      <span className="text-muted font-medium">Duration</span>
                      <span className="text-xl font-bold text-bright">{days} {days === 1 ? 'Day' : 'Days'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-subtle pb-6">
                      <span className="text-muted font-medium">Budget Style</span>
                      <span className="text-xl font-bold text-bright">{budget}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-muted font-medium block mb-4 text-left">Your Interests</span>
                      <div className="flex flex-wrap gap-2">
                        {interests.map(i => (
                          <span key={i} className="text-sm font-bold px-3 py-1.5 rounded-lg bg-subtle/50 border border-subtle text-bright">{i}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-16 flex justify-center pb-8">
            {step < 5 ? (
              <Button size="lg" onClick={handleNext} className="w-full max-w-sm rounded-[2rem] text-lg py-5 shadow-xl hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                Continue
              </Button>
            ) : (
              <Button size="lg" onClick={handleSubmit} isLoading={isSubmitting} className="w-full max-w-sm rounded-[2rem] text-lg py-5 group bg-gradient-to-r from-primary via-violet to-primary bg-[length:200%_auto] hover:bg-[position:100%_0] transition-all duration-500 shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)]">
                {!isSubmitting && <Sparkles size={20} className="mr-2 group-hover:rotate-12 transition-transform" />}
                Generate My Itinerary
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
