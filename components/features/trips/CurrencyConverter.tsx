'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Banknote, ArrowUpDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'KRW', name: 'Korean Won', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
];

interface CurrencyConverterProps {
  baseCurrency?: string;
  targetCurrency?: string;
}

const API_URLS = [
  (base: string) => `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.min.json`,
  (base: string) => `https://latest.currency-api.pages.dev/v1/currencies/${base}.min.json`,
];

export function CurrencyConverter({ baseCurrency = 'USD', targetCurrency = 'EUR' }: CurrencyConverterProps) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('100');
  const [base, setBase] = useState(baseCurrency);
  const [target, setTarget] = useState(targetCurrency);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    for (const buildUrl of API_URLS) {
      try {
        const url = buildUrl(base.toLowerCase());
        const res = await fetch(url);

        if (!res.ok) {
          continue; // Try next URL
        }

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('json') && !contentType.includes('text')) {
          continue;
        }

        const text = await res.text();
        // Verify it's valid JSON before parsing
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          continue; // Not valid JSON, try next URL
        }

        const ratesData = data[base.toLowerCase()];
        if (ratesData && typeof ratesData === 'object') {
          setRates(ratesData);
          setLastUpdated(data.date || new Date().toISOString().split('T')[0]);
          setLoading(false);
          return; // Success
        }
      } catch {
        continue; // Network error, try next URL
      }
    }

    // All URLs failed
    setError('Unable to fetch rates');
    setLoading(false);
  }, [base]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleSwap = () => {
    setBase(target);
    setTarget(base);
  };

  const numericAmount = parseFloat(amount) || 0;
  const rate = rates[target.toLowerCase()];
  const convertedAmount = rate ? numericAmount * rate : null;

  const getFlag = (code: string) => {
    const currency = POPULAR_CURRENCIES.find(c => c.code === code);
    return currency?.flag || '💱';
  };

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-subtle/50 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-subtle/30 flex items-center justify-between bg-gradient-to-r from-primary/5 via-transparent to-violet/5">
        <h3 className="font-display font-bold text-lg flex items-center gap-2.5 text-bright">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Banknote size={16} className="text-primary" />
          </div>
          Currency
        </h3>
        <button 
          onClick={fetchRates} 
          className="p-2 rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
          title="Refresh rates"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin text-primary' : ''} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {error && (
          <div className="text-xs text-center py-2 px-3 rounded-xl bg-danger/10 text-danger border border-danger/20">
            {error} — try refreshing
          </div>
        )}

        {/* From Section */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted uppercase tracking-[0.15em] block">From</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">{getFlag(base)}</span>
              <select
                value={base}
                onChange={(e) => setBase(e.target.value)}
                className="w-full appearance-none bg-void/60 border border-subtle/80 rounded-xl pl-10 pr-4 py-3 text-bright font-bold text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
              >
                {POPULAR_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                // Allow empty string, digits, and one decimal point
                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                  setAmount(val);
                }
              }}
              placeholder="0"
              className="w-24 bg-void/60 border border-subtle/80 rounded-xl px-3 py-3 text-bright font-bold text-right text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            onClick={handleSwap}
            className="bg-card border border-subtle/80 rounded-full p-2.5 text-muted hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all shadow-lg hover:shadow-primary/10 cursor-pointer group"
            title="Swap currencies"
          >
            <ArrowUpDown size={14} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* To Section */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted uppercase tracking-[0.15em] block">To</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">{getFlag(target)}</span>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full appearance-none bg-void/60 border border-subtle/80 rounded-xl pl-10 pr-4 py-3 text-bright font-bold text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
              >
                {POPULAR_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24 bg-void/60 border border-subtle/80 rounded-xl px-3 py-3 text-right text-sm font-bold overflow-hidden">
              {loading ? (
                <span className="text-muted animate-pulse">...</span>
              ) : convertedAmount !== null ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet">
                  {convertedAmount < 0.01 && convertedAmount > 0
                    ? convertedAmount.toFixed(6)
                    : convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Exchange Rate Badge */}
        {!loading && rate && (
          <div className="pt-2 space-y-1.5">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                1 {base} = {rate < 0.01 ? rate.toFixed(6) : rate.toFixed(4)} {target}
              </span>
            </div>
            {lastUpdated && (
              <p className="text-[10px] text-muted/60 text-center">
                Rates as of {lastUpdated}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
