import React, { useState } from 'react';
import { useFarmLink } from '../lib/store';
import { FoodPost, FoodPostStatus } from '../types';
import { evaluateSurplusFoodSafety } from '../lib/safetyEngine';
import { Search, Filter, Clock, QrCode, Play, Sparkles, Building, CheckCircle2, AlertTriangle, ShieldCheck, Sun, Moon, Coffee, Utensils } from 'lucide-react';

interface SurplusPostsViewProps {
  onOpenQR: (post: FoodPost) => void;
}

export const SurplusPostsView: React.FC<SurplusPostsViewProps> = ({ onOpenQR }) => {
  const { foodPosts, triggerManualMatchRun, claimSurplusPost, guidelines, currentUser, language, t } = useFarmLink();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [matchTriggeredPostId, setMatchTriggeredPostId] = useState<string | null>(null);

  const filteredPosts = foodPosts.filter(post => {
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesSearch =
      post.hallName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.foodTypes.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleTriggerMatch = (postId: string) => {
    setMatchTriggeredPostId(postId);
    const count = triggerManualMatchRun(postId);
    setTimeout(() => {
      setMatchTriggeredPostId(null);
    }, 1500);
  };

  // Metrics
  const activeKg = foodPosts
    .filter(p => p.status === 'open' || p.status === 'matched')
    .reduce((sum, p) => sum + p.quantityKg, 0);
  const openCount = foodPosts.filter(p => p.status === 'open').length;
  const matchedCount = foodPosts.filter(p => p.status === 'matched').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Filters */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'সরাসরি ডাইনিং হল রেজিস্ট্রি' : 'Live Campus Dining Hall Registry'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              {language === 'bn' ? 'বিশ্ববিদ্যালয় হলের খাদ্য উদ্বৃত্ত রেজিস্ট্রি' : 'University Dining Hall Surplus Registry'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live batches from Abbas Uddin Ahmed Hall & Shaheed Dr. Zikrul Haque Hall tracked against 2-hour holding windows
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs">
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 block">Available Now</span>
              <strong className="text-sm font-mono text-emerald-700">{activeKg.toFixed(1)} kg</strong>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 block">Open Batches</span>
              <strong className="text-sm font-mono text-blue-700">{openCount} active</strong>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 block">Matched Ready</span>
              <strong className="text-sm font-mono text-purple-700">{matchedCount} pairs</strong>
            </div>
          </div>
        </div>

        {/* Search bar & Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-100">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded-xl text-xs">
            {[
              { id: 'all', label: 'All Batches' },
              { id: 'open', label: 'Open for Pickup' },
              { id: 'matched', label: 'Matched' },
              { id: 'collected', label: 'Collected' },
              { id: 'expired', label: 'Expired' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                  statusFilter === st.id
                    ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by food or hall..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-60"
            />
          </div>
        </div>
      </div>

      {/* Posts Cards Grid */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200 text-neutral-500 text-xs">
          No surplus food posts match the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map(post => {
            const safety = evaluateSurplusFoodSafety(
              post.foodTypes,
              post.preparationTime,
              guidelines,
              undefined,
              post.maxHoldingHours
            );

            const deadline = new Date(post.pickupDeadline);
            const now = new Date();
            const minutesLeft = Math.max(0, Math.round((deadline.getTime() - now.getTime()) / (1000 * 60)));
            const maxMins = (post.maxHoldingHours || 2.0) * 60;
            const progressPercent = Math.max(0, Math.min(100, (minutesLeft / maxMins) * 100));

            return (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                      <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold text-neutral-900 truncate">{post.hallName}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium capitalize shrink-0 ${
                      post.status === 'collected'
                        ? 'bg-emerald-50 text-emerald-700'
                        : post.status === 'matched'
                        ? 'bg-blue-50 text-blue-700'
                        : post.status === 'open'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {post.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 rounded bg-neutral-100 text-neutral-600">
                      {post.mealType === 'lunch' ? (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      ) : post.mealType === 'dinner' ? (
                        <Moon className="w-3.5 h-3.5 text-blue-500" />
                      ) : (
                        <Coffee className="w-3.5 h-3.5 text-orange-500" />
                      )}
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 leading-tight">
                      {post.foodTypes.join(', ')}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-600 mb-3">
                    <span className="font-bold text-neutral-900 text-sm">{post.quantityKg} kg</span>
                    <span>·</span>
                    <span className="capitalize">{post.mealType}</span>
                    <span>·</span>
                    <span className="capitalize">{post.storageCondition.replace('_', ' ')}</span>
                  </div>

                  {/* Holding Countdown Progress Bar */}
                  {(post.status === 'open' || post.status === 'matched') && (
                    <div className="mb-3.5 p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
                      <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
                        <span className="text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>Strict Holding Window</span>
                        </span>
                        <strong className={minutesLeft > 30 ? 'text-emerald-700' : 'text-amber-700'}>
                          {minutesLeft}m left / {post.maxHoldingHours}h
                        </strong>
                      </div>
                      <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            progressPercent > 50
                              ? 'bg-emerald-500'
                              : progressPercent > 20
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Safety & Compatible Species Strip */}
                  <div className={`p-2.5 rounded-lg border text-xs mb-3 ${
                    safety.isSafe ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="flex items-center gap-1">
                        {safety.isSafe ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                        <span>Biosecurity {safety.score}%</span>
                      </span>
                      <span className="text-[10px] text-neutral-500 capitalize font-normal">
                        For: {safety.compatibleSpecies.slice(0, 3).join(', ')}
                      </span>
                    </div>
                  </div>

                  {post.notes && (
                    <p className="text-[11px] text-neutral-500 italic mb-3">
                      "{post.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-100 flex gap-2">
                  {post.status === 'open' && currentUser?.role === 'farm_owner' && (
                    <button
                      onClick={() => claimSurplusPost(post.id)}
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Claim Surplus</span>
                    </button>
                  )}

                  {post.status === 'open' && currentUser?.role !== 'farm_owner' && (
                    <button
                      onClick={() => handleTriggerMatch(post.id)}
                      className="flex-1 py-1.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {matchTriggeredPostId === post.id ? (
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      <span>Run Auto-Match</span>
                    </button>
                  )}

                  {(post.status === 'open' || post.status === 'matched') && (
                    <button
                      onClick={() => onOpenQR(post)}
                      className="py-1.5 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR Code</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
