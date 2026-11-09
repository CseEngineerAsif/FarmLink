import React, { useState } from 'react';
import { useFarmLink } from '../lib/store';
import { calculateDistanceKm } from '../lib/matchingEngine';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Compass,
  Building,
  Tractor,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface MapViewProps {
  selectedHallId?: string;
  selectedFarmId?: string;
  onSelectHall?: (id: string) => void;
  onSelectFarm?: (id: string) => void;
}

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDUUDmy7sTQDSYcN7z6YM4Rs8LSBaooH5Y';

export const MapView: React.FC<MapViewProps> = ({
  selectedHallId,
  selectedFarmId,
  onSelectHall,
  onSelectFarm
}) => {
  const { halls, farms, language, t } = useFarmLink();
  const [activePin, setActivePin] = useState<{ type: 'hall' | 'farm'; id: string } | null>(null);
  const [viewMode, setViewMode] = useState<'google' | 'radar'>('google');

  // Automatic graceful fallback to Logistics Radar if Google Maps quota is reached
  React.useEffect(() => {
    const handleQuota = () => setViewMode('radar');
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Center coordinate for Saidpur & BAUST area
  const centerSaidpur = { lat: 25.7788, lng: 88.9056 };

  // Coordinate bounding for SVG fallback radar view
  const minLat = 25.760;
  const maxLat = 25.805;
  const minLng = 88.885;
  const maxLng = 88.930;

  const projectToPercent = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 80 + 10;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 75 + 12;
    return {
      left: `${Math.max(5, Math.min(92, x))}%`,
      top: `${Math.max(5, Math.min(90, y))}%`
    };
  };

  const selectedHall = halls.find(
    h => h.id === (selectedHallId || (activePin?.type === 'hall' ? activePin.id : halls[0]?.id))
  );
  const selectedFarm = farms.find(
    f => f.id === (selectedFarmId || (activePin?.type === 'farm' ? activePin.id : farms[0]?.id))
  );

  const routeDistance =
    selectedHall && selectedFarm
      ? calculateDistanceKm(selectedHall.coordinates, selectedFarm.coordinates)
      : null;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
      {/* Map Controls Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-medium">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <span>
                {language === 'bn' ? 'সৈয়দপুর অঞ্চল রুট ও ভৌগোলিক মানচিত্র' : 'Saidpur Regional Logistics Map'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Google Maps Platform
              </span>
            </h3>
            <p className="text-xs text-neutral-500">
              {language === 'bn'
                ? 'বিএইউএসটি (BAUST) আবাসিক হল এবং পার্শ্ববর্তী গবাদিপশু খামার'
                : 'BAUST Campus Halls & Nearby Livestock Farms (Saidpur & Pirgang)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center p-0.5 bg-neutral-200/70 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('google')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'google'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Google Map
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'radar'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Logistics Radar
            </button>
          </div>

          {routeDistance !== null && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {language === 'bn' ? 'দূরত্ব:' : 'Distance:'}{' '}
                <strong className="font-mono tabular-nums text-emerald-950 font-bold">{routeDistance} km</strong>
                <span className="text-neutral-400 mx-1">·</span>
                <span className="text-neutral-600">~{Math.round(routeDistance * 4.5)} mins</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-80 sm:h-96 bg-neutral-100 overflow-hidden select-none border-b border-neutral-100">
        {viewMode === 'google' ? (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={centerSaidpur}
              defaultZoom={13}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              gestureHandling={'greedy'}
              disableDefaultUI={false}
              className="w-full h-full"
            >
              {/* Hall Markers */}
              {halls.map(hall => {
                const isSelected = selectedHall?.id === hall.id;
                return (
                  <AdvancedMarker
                    key={hall.id}
                    position={hall.coordinates}
                    onClick={() => {
                      setActivePin({ type: 'hall', id: hall.id });
                      if (onSelectHall) onSelectHall(hall.id);
                    }}
                    title={hall.hallName}
                  >
                    <Pin
                      background={isSelected ? '#2563eb' : '#3b82f6'}
                      glyphColor="#ffffff"
                      borderColor="#1e40af"
                    />
                  </AdvancedMarker>
                );
              })}

              {/* Farm Markers */}
              {farms.map(farm => {
                const isSelected = selectedFarm?.id === farm.id;
                return (
                  <AdvancedMarker
                    key={farm.id}
                    position={farm.coordinates}
                    onClick={() => {
                      setActivePin({ type: 'farm', id: farm.id });
                      if (onSelectFarm) onSelectFarm(farm.id);
                    }}
                    title={farm.farmName}
                  >
                    <Pin
                      background={isSelected ? '#10b981' : '#059669'}
                      glyphColor="#ffffff"
                      borderColor="#065f46"
                    />
                  </AdvancedMarker>
                );
              })}
            </Map>
          </APIProvider>
        ) : (
          /* Logistics Radar Vector View */
          <div className="relative w-full h-full bg-neutral-100 overflow-hidden">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}
            />

            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              <path
                d="M 15 280 Q 220 220 400 160 T 750 40"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 15 280 Q 220 220 400 160 T 750 40"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeDasharray="6 6"
              />

              {selectedHall && selectedFarm && (
                (() => {
                  const p1 = projectToPercent(selectedHall.coordinates.lat, selectedHall.coordinates.lng);
                  const p2 = projectToPercent(selectedFarm.coordinates.lat, selectedFarm.coordinates.lng);
                  return (
                    <line
                      x1={p1.left}
                      y1={p1.top}
                      x2={p2.left}
                      y2={p2.top}
                      stroke="url(#routeGradient)"
                      strokeWidth="3.5"
                      strokeDasharray="5 4"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                  );
                })()
              )}
            </svg>

            {halls.map(hall => {
              const pos = projectToPercent(hall.coordinates.lat, hall.coordinates.lng);
              const isSelected = selectedHall?.id === hall.id;

              return (
                <button
                  key={hall.id}
                  onClick={() => {
                    setActivePin({ type: 'hall', id: hall.id });
                    if (onSelectHall) onSelectHall(hall.id);
                  }}
                  style={{ left: pos.left, top: pos.top }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all transform hover:scale-110 z-20"
                >
                  <div
                    className={`p-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-105'
                        : 'bg-white text-blue-700 border border-blue-200'
                    }`}
                  >
                    <Building className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold whitespace-nowrap hidden sm:inline-block pr-1">
                      {hall.hallName.replace('Shaheed Dr. ', '').replace(' Ahmed Hall', ' Hall')}
                    </span>
                  </div>
                </button>
              );
            })}

            {farms.map(farm => {
              const pos = projectToPercent(farm.coordinates.lat, farm.coordinates.lng);
              const isSelected = selectedFarm?.id === farm.id;

              return (
                <button
                  key={farm.id}
                  onClick={() => {
                    setActivePin({ type: 'farm', id: farm.id });
                    if (onSelectFarm) onSelectFarm(farm.id);
                  }}
                  style={{ left: pos.left, top: pos.top }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all transform hover:scale-110 z-20"
                >
                  <div
                    className={`p-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-105'
                        : 'bg-white text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <Tractor className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold whitespace-nowrap hidden sm:inline-block pr-1">
                      {farm.farmName.replace(' Dairy Farm', '').replace(' Farm', '')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Entity Details Strip */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white">
        {selectedHall && (
          <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50/70">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-900 mb-1">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              <span>{selectedHall.hallName}</span>
              <span className="text-[11px] text-blue-600 font-normal">({selectedHall.institution})</span>
            </div>
            <p className="text-neutral-500 mb-2">{selectedHall.location} · Provost: {selectedHall.provostName}</p>
            <div className="flex items-center gap-3 text-neutral-600 font-mono">
              <span>{selectedHall.totalStudents} Students</span>
              <span>·</span>
              <span>Avg Surplus: 12–18 kg</span>
              <span>·</span>
              <span>Hold: {selectedHall.surplusHoldingWindowHours}h max</span>
            </div>
          </div>
        )}

        {selectedFarm && (
          <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50/70">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-900 mb-1">
              <Tractor className="w-3.5 h-3.5 text-emerald-600" />
              <span>{selectedFarm.farmName}</span>
              <span className="text-[11px] text-emerald-600 font-normal">(Owner: {selectedFarm.ownerName})</span>
            </div>
            <p className="text-neutral-500 mb-2">{selectedFarm.location} · Willing Radius: {selectedFarm.willingDistanceKm} km</p>
            <div className="flex items-center gap-3 text-neutral-600">
              <span>Accepts: {selectedFarm.acceptableFoodTypes.slice(0, 2).join(', ')}</span>
              <span>·</span>
              <span className="capitalize">Return: {selectedFarm.preferredReturn}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
