'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Sparkles, Package, CheckSquare, Square } from 'lucide-react';

interface PackingListProps {
  tripId: string;
}

interface Category {
  name: string;
  emoji: string;
  items: string[];
}

export function PackingList({ tripId }: PackingListProps) {
  const [loading, setLoading] = useState(false);
  const [packingList, setPackingList] = useState<{ categories: Category[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const generatePackingList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getPackingList(tripId);
      setPackingList(response.packingList);
    } catch (err: any) {
      setError(err.message || 'Failed to generate packing list');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (categoryName: string, item: string) => {
    const key = `${categoryName}-${item}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6 bg-card/30 rounded-3xl border border-subtle">
        <Spinner size="lg" />
        <p className="text-muted text-lg animate-pulse">AI is generating your packing list...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-danger/5 rounded-3xl border border-danger/20 text-center px-6">
        <p className="text-danger text-lg">{error}</p>
        <Button variant="ghost" onClick={generatePackingList}>Try Again</Button>
      </div>
    );
  }

  if (!packingList) {
    return (
      <div className="text-center py-24 px-6 bg-card/40 backdrop-blur-lg border border-subtle rounded-[2rem] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary border border-primary/20 backdrop-blur-md">
          <Package size={40} />
        </div>
        <h3 className="text-2xl font-display font-bold text-bright mb-3">Smart Packing List</h3>
        <p className="text-muted text-lg max-w-md mx-auto mb-10">
          Let AI generate a customized packing list based on your destination's weather, your planned activities, and travel duration.
        </p>
        <Button size="lg" variant="primary" onClick={generatePackingList}>
          <Sparkles size={18} />
          Generate List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-card/30 p-6 rounded-3xl border border-subtle backdrop-blur-sm">
        <p className="text-lg text-muted">
          AI-recommended packing list tailored to your trip.
        </p>
        <Button variant="ghost" onClick={generatePackingList} className="text-xs">
          Regenerate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence>
          {packingList.categories.map((category, idx) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-card/40 backdrop-blur-md border border-subtle rounded-2xl p-6"
            >
              <h4 className="font-display font-bold text-2xl text-bright mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-subtle flex items-center justify-center text-xl">
                  {category.emoji}
                </span>
                {category.name}
              </h4>
              <div className="space-y-3">
                {category.items.map(item => {
                  const key = `${category.name}-${item}`;
                  const isChecked = checkedItems[key];
                  return (
                    <div 
                      key={item}
                      className="flex items-center gap-3 group cursor-pointer"
                      onClick={() => toggleCheck(category.name, item)}
                    >
                      <button className="text-muted group-hover:text-primary transition-colors cursor-pointer shrink-0">
                        {isChecked ? (
                          <CheckSquare size={20} className="text-primary" />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                      <span className={`text-base transition-colors ${isChecked ? 'text-dim line-through' : 'text-bright group-hover:text-primary/90'}`}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
