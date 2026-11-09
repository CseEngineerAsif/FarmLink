import React, { useEffect } from 'react';
import { useFarmLink } from '../lib/store';
import { Bell, Utensils, Sparkles, X, ArrowRight, Clock } from 'lucide-react';

interface NotificationToastBannerProps {
  onOpenNotificationCenter: () => void;
  onNavigateToPosts?: () => void;
}

export const NotificationToastBanner: React.FC<NotificationToastBannerProps> = ({
  onOpenNotificationCenter,
  onNavigateToPosts
}) => {
  const { activeToastNotification, dismissToastNotification, claimSurplusPost, currentUser } = useFarmLink();

  useEffect(() => {
    if (!activeToastNotification) return;

    // Auto-dismiss after 9 seconds
    const timer = setTimeout(() => {
      dismissToastNotification();
    }, 9000);

    return () => clearTimeout(timer);
  }, [activeToastNotification, dismissToastNotification]);

  if (!activeToastNotification) return null;

  const isSurplusPost = activeToastNotification.type === 'surplus_post_created';
  const isMatch = activeToastNotification.type === 'match_available';

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-2xl border-2 border-emerald-500/80 shadow-2xl p-4 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          {isSurplusPost ? <Utensils className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {isSurplusPost ? 'New Surplus Post' : 'Priority Match'}
            </span>
            <button
              onClick={dismissToastNotification}
              className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-neutral-900 leading-tight">
            {activeToastNotification.title}
          </h4>

          <p className="text-[11px] text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
            {activeToastNotification.message}
          </p>

          {activeToastNotification.postDetails && (
            <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
              <span className="font-mono font-bold text-neutral-900">
                {activeToastNotification.postDetails.quantityKg} kg
              </span>
              <span className="text-neutral-400">·</span>
              <span className="capitalize text-neutral-600 font-medium">
                {activeToastNotification.postDetails.mealType}
              </span>
              {activeToastNotification.postDetails.distanceKm !== undefined && (
                <>
                  <span className="text-neutral-400">·</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    {activeToastNotification.postDetails.distanceKm} km away
                  </span>
                </>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            {isSurplusPost && activeToastNotification.relatedEntityId && currentUser?.role === 'farm_owner' && (
              <button
                onClick={() => {
                  claimSurplusPost(activeToastNotification.relatedEntityId!);
                  dismissToastNotification();
                }}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg shadow-2xs transition-colors"
              >
                Claim Offer
              </button>
            )}

            <button
              onClick={() => {
                onOpenNotificationCenter();
                dismissToastNotification();
              }}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1"
            >
              <span>View Center</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
