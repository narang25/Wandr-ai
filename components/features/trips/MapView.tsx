'use client';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-[2rem] border border-subtle/50 shadow-2xl flex items-center justify-center bg-card/40 shimmer">
      <span className="text-muted font-medium">Loading map...</span>
    </div>
  )
});

export { MapComponent as MapView };
