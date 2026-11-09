import React, { useState, useMemo } from 'react';
import { useFarmLink } from '../lib/store';
import { MapView } from './MapView';
import { Match, FoodPost } from '../types';
import {
  Navigation,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  QrCode,
  Milestone,
  RotateCw
} from 'lucide-react';

interface LogisticsViewProps {
  onOpenScanner: () => void;
  onOpenQR: (post: FoodPost) => void;
}

export const LogisticsView: React.FC<LogisticsViewProps> = ({ onOpenScanner, onOpenQR }) => {
  const { matches, foodPosts, acceptMatch, declineMatch, currentUser, language, t } = useFarmLink();
  const [selectedHallId, setSelectedHallId] = useState<string | undefined>(undefined);
  const [selectedFarmId, setSelectedFarmId] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'collected'>('all');

  const filteredMatches = useMemo(() => {
    if (statusFilter === 'all') return matches;
    return matches.filter(m => m.status === statusFilter);
  }, [matches, statusFilter]);

  const activeMatchesCount = matches.filter(m => m.status === 'accepted' || m.status === 'pending').length;
  const completedMatchesCount = matches.filter(m => m.status === 'collected').length;
  const avgDistance = matches.length > 0
    ? (matches.reduce((acc, m) => acc + m.distanceKm, 0) / matches.length).toFixed(1)
    : '2.4';

  const pipelineSteps = [
    { num: '01', title: 'Dining Log', desc: 'Weighed surplus logged', icon: '🍲' },
    { num: '02', title: 'Biosecurity Check', desc: 'Ruminant/poultry match', icon: '🛡️' },
    { num: '03', title: 'Proximity Dispatch', desc: 'Hyperlocal < 5 km route', icon: '🗺️' },
    { num: '04', title: 'QR Custody Handover', desc: 'Verified batch transfer', icon: '📲' },
    { num: '05', title: 'Resource Return', desc: 'Fresh milk & eggs back', icon: '🥛' },
  ];

  return (
    <div className="space-y-6">
      {/* 5-Step Closed-Loop Flow Visualizer */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5" />
              Circular Surplus Redistribution Architecture
            </span>
            <h2 className="text-base font-extrabold text-neutral-900 mt-0.5">
              Saidpur Closed-Loop Biosecurity & Dispatch Workflow
            </h2>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            Radius Cap: 5.0 km · Holding Cap: 2h Max
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {pipelineSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-100 flex flex-col justify-between relative group hover:bg-emerald-50/40 hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{step.icon}</span>
                <span className="font-mono text-[10px] font-bold text-neutral-400 group-hover:text-emerald-700">
                  {step.num}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 group-hover:text-emerald-900">
                  {step.title}
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geospatial Map Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>{language === 'bn' ? 'স্মার্ট ম্যাচিং ও ভৌগোলিক রুট লজিস্টিকস' : 'Smart Matching & Geospatial Logistics'}</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Interactive satellite & street map connecting residential halls with registered dairy & livestock farms
            </p>
          </div>

          {(selectedHallId || selectedFarmId) && (
            <button
              onClick={() => {
                setSelectedHallId(undefined);
                setSelectedFarmId(undefined);
              }}
              className="text-xs text-neutral-600 hover:text-neutral-900 font-medium self-start sm:self-auto underline"
            >
              Reset Map Selection
            </button>
          )}
        </div>

        <MapView
          selectedHallId={selectedHallId}
          selectedFarmId={selectedFarmId}
          onSelectHall={id => setSelectedHallId(id)}
          onSelectFarm={id => setSelectedFarmId(id)}
        />
      </div>

      {/* Logistics Dispatch Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-neutral-500 block mb-1">Active Dispatches</span>
          <span className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {activeMatchesCount}
          </span>
          <span className="text-[10px] text-neutral-400 mt-1 block">Pending & in-transit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-neutral-500 block mb-1">Average Proximity</span>
          <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {avgDistance} km
          </span>
          <span className="text-[10px] text-neutral-400 mt-1 block">Rural transport route</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-neutral-500 block mb-1">Biosecurity Pass</span>
          <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            100%
          </span>
          <span className="text-[10px] text-neutral-400 mt-1 block">Zero toxic contamination</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-neutral-500 block mb-1">Completed Handovers</span>
          <span className="text-xl font-bold font-mono text-blue-700 tabular-nums">
            {completedMatchesCount}
          </span>
          <span className="text-[10px] text-neutral-400 mt-1 block">Cryptographic QR verified</span>
        </div>
      </div>

      {/* Matches Registry Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              {language === 'bn' ? 'সক্রিয় ও ঐতিহাসিক ম্যাচিং লগ' : 'Active & Historical Matching Pairs'}
            </h3>
            <p className="text-xs text-neutral-500">
              Click any pair to highlight its route coordinates and biosecurity profile on the map
            </p>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'pending', 'accepted', 'collected'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors capitalize ${
                  statusFilter === status
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {status === 'collected' ? 'Completed' : status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] border-b border-neutral-100">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Match ID</th>
                <th className="py-2.5 px-4 font-semibold">Origin & Destination</th>
                <th className="py-2.5 px-4 font-semibold text-right">Distance (km)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Safety Index</th>
                <th className="py-2.5 px-4 font-semibold">Agreed Exchange</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    No matching logistics records found for this filter.
                  </td>
                </tr>
              ) : (
                filteredMatches.map(m => {
                  const post = foodPosts.find(p => p.id === m.postId);
                  const isFarmOwner = currentUser?.role === 'farm_owner' && currentUser.farmId === m.farmId;
                  const isSelected = selectedHallId === m.hallId && selectedFarmId === m.farmId;

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-neutral-50/70 cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/60' : ''
                      }`}
                      onClick={() => {
                        setSelectedHallId(m.hallId);
                        setSelectedFarmId(m.farmId);
                      }}
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-800">
                        {m.id.substring(0, 14)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-900 block">{m.hallName}</span>
                        <span className="text-neutral-500 text-[11px] flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-neutral-400" />
                          <span>{m.farmName}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                        {m.distanceKm} km
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                        {m.safetyScore}%
                      </td>
                      <td className="py-3 px-4 capitalize font-medium text-neutral-700">
                        {m.agreedExchangeType}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                          m.status === 'collected'
                            ? 'bg-emerald-50 text-emerald-700'
                            : m.status === 'accepted'
                            ? 'bg-blue-50 text-blue-700'
                            : m.status === 'pending'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {m.status === 'collected' ? 'Completed' : m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {m.status === 'pending' && isFarmOwner ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                acceptMatch(m.id);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                declineMatch(m.id, 'Declined by farm operator');
                              }}
                              className="px-2.5 py-1 bg-neutral-100 hover:bg-rose-50 hover:text-rose-700 text-neutral-700 rounded text-[11px] transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        ) : m.status === 'accepted' && post ? (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onOpenQR(post);
                            }}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-medium transition-colors"
                          >
                            View QR
                          </button>
                        ) : (
                          <span className="text-[11px] text-neutral-400 font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

