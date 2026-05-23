'use client';

import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, CloudLightning } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface WeatherProps {
  lat: number;
  lng: number;
}

const getWeatherIcon = (code: number) => {
  if (code <= 3) return <Sun className="text-gold" />;
  if (code <= 49) return <Cloud className="text-muted" />;
  if (code <= 69) return <CloudRain className="text-primary" />;
  if (code <= 79) return <Snowflake className="text-white" />;
  return <CloudLightning className="text-violet" />;
};

export function WeatherWidget({ lat, lng }: WeatherProps) {
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lng) {
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=5`);
        const data = await res.json();
        
        const days = data.daily.time.map((time: string, idx: number) => ({
          date: time,
          max: data.daily.temperature_2m_max[idx],
          min: data.daily.temperature_2m_min[idx],
          code: data.daily.weathercode[idx]
        }));
        setForecast(days);
      } catch (err) {
        console.error("Failed to fetch weather", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [lat, lng]);

  if (loading) return <div className="h-24 rounded-2xl shimmer" />;
  if (!forecast.length) return null;

  return (
    <Card className="p-6 bg-card/40 backdrop-blur-md border-subtle/50">
      <h3 className="text-lg font-bold text-bright mb-4 flex items-center gap-2">
        <Sun size={20} className="text-gold" />
        5-Day Forecast
      </h3>
      <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar">
        {forecast.map((day) => (
          <div key={day.date} className="flex flex-col items-center min-w-[60px]">
            <span className="text-xs text-muted mb-2">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            <div className="mb-2">
              {getWeatherIcon(day.code)}
            </div>
            <span className="text-sm font-bold text-bright">{Math.round(day.max)}°</span>
            <span className="text-xs text-dim">{Math.round(day.min)}°</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
