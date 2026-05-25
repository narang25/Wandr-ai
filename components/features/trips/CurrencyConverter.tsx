'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Banknote, ArrowRightLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface CurrencyConverterProps {
  baseCurrency?: string;
  targetCurrency?: string;
}

export function CurrencyConverter({ baseCurrency = 'USD', targetCurrency = 'EUR' }: CurrencyConverterProps) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<number>(100);
  const [base, setBase] = useState(baseCurrency);
  const [target, setTarget] = useState(targetCurrency);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`);
      const data = await res.json();
      setRates(data[base.toLowerCase()]);
    } catch (err) {
      console.error('Failed to fetch currency rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [base]);

  const handleSwap = () => {
    setBase(target);
    setTarget(base);
  };

  const convertedAmount = rates[target.toLowerCase()] ? amount * rates[target.toLowerCase()] : 0;

  return (
    <Card className="bg-card/40 backdrop-blur-md border border-subtle overflow-hidden">
      <div className="p-4 border-b border-subtle/50 flex items-center justify-between bg-black/10">
        <h3 className="font-bold flex items-center gap-2 text-bright">
          <Banknote size={18} className="text-primary" />
          Currency Converter
        </h3>
        <button onClick={fetchRates} className="text-muted hover:text-bright transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin text-primary' : ''} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1 block">Amount</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-void/50 border border-subtle rounded-xl px-3 py-2 text-bright font-medium focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="w-20">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1 block">From</label>
            <input 
              type="text" 
              value={base}
              onChange={(e) => setBase(e.target.value.toUpperCase())}
              maxLength={3}
              className="w-full bg-void/50 border border-subtle rounded-xl px-3 py-2 text-bright font-medium focus:outline-none focus:border-primary transition-colors uppercase text-center"
            />
          </div>
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <button 
            onClick={handleSwap}
            className="bg-card border border-subtle rounded-full p-2 text-muted hover:text-primary hover:border-primary/50 transition-all shadow-md"
          >
            <ArrowRightLeft size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1 block">Converted</label>
            <div className="w-full bg-void/50 border border-subtle rounded-xl px-3 py-2 text-bright font-bold">
              {loading ? '...' : convertedAmount.toFixed(2)}
            </div>
          </div>
          <div className="w-20">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1 block">To</label>
            <input 
              type="text" 
              value={target}
              onChange={(e) => setTarget(e.target.value.toUpperCase())}
              maxLength={3}
              className="w-full bg-void/50 border border-subtle rounded-xl px-3 py-2 text-bright font-medium focus:outline-none focus:border-primary transition-colors uppercase text-center"
            />
          </div>
        </div>

        {!loading && rates[target.toLowerCase()] && (
          <div className="pt-2 text-center">
            <Badge variant="primary" className="text-[10px] py-0.5">
              1 {base} = {rates[target.toLowerCase()].toFixed(4)} {target}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
