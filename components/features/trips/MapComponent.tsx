'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { DayPlan, Activity } from '@/lib/types';
import L from 'leaflet';

interface MapProps {
  itinerary: DayPlan[];
  centerLat?: number;
  centerLng?: number;
}

// Custom dark mode compatible icon
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapComponent({ itinerary, centerLat = 48.8566, centerLng = 2.3522 }: MapProps) {
  // Flatten all activities with locations
  const activities = itinerary.flatMap(day => 
    day.activities.filter(a => a.location?.lat && a.location?.lng)
  );

  // Calculate center if not provided and we have activities
  const defaultLat = activities.length > 0 ? activities[0].location.lat : centerLat;
  const defaultLng = activities.length > 0 ? activities[0].location.lng : centerLng;

  return (
    <div className="w-full h-[500px] rounded-[2rem] overflow-hidden border border-subtle/50 shadow-2xl z-0 relative">
      <MapContainer 
        center={[defaultLat, defaultLng]} 
        zoom={12} 
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        {/* CartoDB Dark Matter for beautiful dark mode map */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {activities.map((act) => (
          <Marker 
            key={act.id} 
            position={[act.location.lat, act.location.lng]}
            icon={customIcon}
          >
            <Popup className="custom-popup">
              <div className="font-display font-bold text-lg mb-1">{act.name}</div>
              <div className="text-sm text-dim">{act.time} • {act.category}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Global styles to fix Leaflet popup in dark mode */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: #0A101C;
          color: #F8FAFC;
          border: 1px solid #162032;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #94A3B8;
        }
      `}} />
    </div>
  );
}
