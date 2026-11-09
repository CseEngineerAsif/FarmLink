import React, { useState, useMemo } from 'react';
import { useFarmLink } from '../lib/store';
import { NotificationItem } from '../types';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Truck,
  QrCode,
  AlertTriangle,
  Utensils,
  Search,
  Filter
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPosts?: () => void;
  onNavigateToLogistics?: () => void;
  onNavigateToLedger?: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPosts,
  onNavigateToLogistics,
  onNavigateToLedger
}) => {
  const {
    currentUser,
    userNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearReadNotifications,
    claimSurplusPost,
    acceptMatch,
    declineMatch,
    simulateSurplusFoodAlert,
    soundEnabled,
    setSoundEnabled,
    language
  } = useFarmLink();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'surplus' | 'matches' | 'pickups'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return userNotifications.filter(n => {
      // Type category filter
      if (activeFilter === 'unread' && n.read) return false;
      if (activeFilter === 'surplus' && n.type !== 'surplus_post_created') return false;
      if (activeFilter === 'matches' && n.type !== 'match_available' && n.type !== 'match_accepted' && n.type !== 'match_declined') return false;
      if (activeFilter === 'pickups' && n.type !== 'pickup_ready' && n.type !== 'pickup_completed') return false;

      // Text search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesMessage = n.message.toLowerCase().includes(query);
        const matchesHall = n.postDetails?.hallName.toLowerCase().includes(query);
        const matchesFood = n.postDetails?.foodTypes.some(f => f.toLowerCase().includes(query));
        return matchesTitle || matchesMessage || matchesHall || matchesFood;
      }

      return true;
    });
  }, [userNotifications, activeFilter, searchQuery]);

  const unreadCount = userNotifications.filter(n => !n.read).length;
  const surplusAlertsCount = userNotifications.filter(n => n.type === 'surplus_post_created' && !n.read).length;
  const matchesAlertsCount = userNotifications.filter(n => (n.type === 'match_available' || n.type === 'match_accepted') && !n.read).length;

  const handleClaim = (postId: string) => {
    const res = claimSurplusPost(postId);
    setClaimFeedback(res.message);
    setTimeout(() => {
      setClaimFeedback(null);
    }, 3000);
  };

  const getRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return language === 'bn' ? 'এইমাত্র' : 'Just now';
    if (diffMins < 60) return language === 'bn' ? `${diffMins} মি. আগে` : `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return language === 'bn' ? `${diffHours} ঘণ্টা আগে` : `${diffHours}h ago`;
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between gap-4 bg-neutral-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                  {language === 'bn' ? 'বিজ্ঞপ্তি ও সতর্কতা কেন্দ্র' : 'Notification & Surplus Alert Center'}
                </h3>
                {surplusAlertsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {surplusAlertsCount} {language === 'bn' ? 'নতুন উদ্বৃত্ত পোস্ট' : 'New Surplus Posts'}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500">
                {currentUser?.role === 'farm_owner'
                  ? (language === 'bn'
                      ? 'হল প্রশাসন কর্তৃক নতুন খাবার উদ্বৃত্ত পোস্ট হলে তাৎক্ষণিক অ্যালার্ট পান'
                      : 'Live alerts sent to farm owners when university dining halls post surplus meals')
                  : 'Platform dispatch, QR verification, and biosecurity update log'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-200'
              }`}
              title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls & Simulator Banner */}
        <div className="px-4 sm:px-5 py-3 border-b border-neutral-100 bg-white flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 rounded-lg transition-colors font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সব পঠিত হিসেবে চিহ্নিত করুন' : 'Mark all as read'}</span>
            </button>

            <button
              onClick={clearReadNotifications}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-neutral-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'পঠিত মুছুন' : 'Clear read'}</span>
            </button>
          </div>

          {/* Test Simulator button for interactive presentation */}
          <button
            onClick={simulateSurplusFoodAlert}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-2xs transition-all text-[11px]"
            title="Simulate a new surplus meal logged by university dining hall"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'হলের খাবার পোস্ট সিমুলেট করুন' : 'Simulate Hall Meal Post'}</span>
          </button>
        </div>

        {/* Feedback message if claimed */}
        {claimFeedback && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
            <span className="font-semibold">{claimFeedback}</span>
            <button
              onClick={() => setClaimFeedback(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Chips & Search Bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {[
              { id: 'all', label: language === 'bn' ? 'সব' : 'All', count: userNotifications.length },
              { id: 'unread', label: language === 'bn' ? 'অপঠিত' : 'Unread', count: unreadCount },
              { id: 'surplus', label: language === 'bn' ? 'উদ্বৃত্ত পোস্ট' : 'Surplus Alerts', count: surplusAlertsCount },
              { id: 'matches', label: language === 'bn' ? 'ম্যাচিং' : 'Matches', count: matchesAlertsCount },
              { id: 'pickups', label: language === 'bn' ? 'পিকআপ ও লেজার' : 'Pickups', count: userNotifications.filter(n => n.type === 'pickup_completed').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                    : 'bg-white text-neutral-600 hover:bg-neutral-200/80 border border-neutral-200/70'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-full sm:w-48"
            />
          </div>
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 p-2 sm:p-3 space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-800">
                {language === 'bn' ? 'কোনো বিজ্ঞপ্তি পাওয়া যায়নি' : 'No notifications in this view'}
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
                {language === 'bn'
                  ? 'হল প্রশাসন কর্তৃক উদ্বৃত্ত খাবার রেকর্ড করা হলে এখানে স্বয়ংক্রিয় সতর্কতা প্রদর্শিত হবে।'
                  : 'When dining halls log fresh surplus meals, priority alerts and collection countdowns appear here.'}
              </p>
              <button
                onClick={simulateSurplusFoodAlert}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Meal Post Alert</span>
              </button>
            </div>
          ) : (
            filteredNotifications.map(n => {
              const isSurplusPost = n.type === 'surplus_post_created';
              const isMatch = n.type === 'match_available';
              const isAccepted = n.type === 'match_accepted';
              const isPickup = n.type === 'pickup_completed';
              const isExpired = n.type === 'post_expired';

              // Calculate remaining minutes if postDetails pickupDeadline is provided
              let minutesLeft: number | null = null;
              if (n.postDetails?.pickupDeadline) {
                const diff = new Date(n.postDetails.pickupDeadline).getTime() - Date.now();
                minutesLeft = Math.max(0, Math.round(diff / 60000));
              }

              return (
                <div
                  key={n.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                    !n.read
                      ? isSurplusPost
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : isMatch
                        ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                        : 'bg-blue-50/50 border-blue-200'
                      : 'bg-white border-neutral-200/80 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon by Type */}
                    <div className="shrink-0 mt-0.5">
                      {isSurplusPost ? (
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Utensils className="w-4 h-4" />
                        </div>
                      ) : isMatch ? (
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      ) : isAccepted ? (
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <Truck className="w-4 h-4" />
                        </div>
                      ) : isPickup ? (
                        <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                          <QrCode className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-neutral-600 text-white flex items-center justify-center">
                          <Bell className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug">
                            {n.title}
                          </h4>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" title="Unread" />
                          )}
                          {isSurplusPost && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              Surplus Offer
                            </span>
                          )}
                          {isMatch && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                              Priority Match
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-mono text-neutral-400 whitespace-nowrap shrink-0">
                          {getRelativeTime(n.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed mb-2.5">
                        {n.message}
                      </p>

                      {/* Rich Post Details Card if available */}
                      {n.postDetails && (
                        <div className="p-2.5 rounded-lg bg-white/90 border border-neutral-200/90 text-xs space-y-2 mb-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                              <span>{n.postDetails.hallName}</span>
                            </span>

                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                                {n.postDetails.quantityKg} kg
                              </span>
                              {n.postDetails.distanceKm !== undefined && (
                                <span className="text-[11px] font-mono text-neutral-500">
                                  {n.postDetails.distanceKm} km
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Food Types Chips */}
                          <div className="flex flex-wrap gap-1">
                            {n.postDetails.foodTypes.map((food, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-700 font-medium"
                              >
                                {food}
                              </span>
                            ))}
                          </div>

                          {/* Holding Countdown Warning */}
                          {minutesLeft !== null && (
                            <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[11px]">
                              <span className="text-neutral-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Strict holding window:</span>
                              </span>
                              <span className={`font-mono font-bold ${
                                minutesLeft <= 30 ? 'text-rose-700' : minutesLeft <= 60 ? 'text-amber-700' : 'text-emerald-700'
                              }`}>
                                {minutesLeft > 0 ? `${minutesLeft} minutes left` : 'Holding window passed'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive Action CTA Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-200/40">
                        <div className="flex items-center gap-2">
                          {/* Claim button for surplus posts */}
                          {isSurplusPost && n.relatedEntityId && currentUser?.role === 'farm_owner' && (
                            <button
                              onClick={() => handleClaim(n.relatedEntityId!)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <span>Claim & Collect</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {/* Accept/Decline for priority match */}
                          {isMatch && n.relatedEntityId && currentUser?.role === 'farm_owner' && (
                            <>
                              <button
                                onClick={() => {
                                  acceptMatch(n.relatedEntityId!);
                                  markNotificationAsRead(n.id);
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                              >
                                Accept Match
                              </button>
                              <button
                                onClick={() => {
                                  declineMatch(n.relatedEntityId!, 'Declined from notification');
                                  markNotificationAsRead(n.id);
                                }}
                                className="px-2.5 py-1.5 bg-neutral-100 hover:bg-rose-50 hover:text-rose-700 text-neutral-600 rounded-lg text-xs font-medium transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {/* View in Logistics or Ledger */}
                          {onNavigateToLogistics && (isSurplusPost || isMatch || isAccepted) && (
                            <button
                              onClick={() => {
                                markNotificationAsRead(n.id);
                                onNavigateToLogistics();
                                onClose();
                              }}
                              className="px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900 font-medium underline"
                            >
                              View Logistics Map
                            </button>
                          )}

                          {onNavigateToLedger && isPickup && (
                            <button
                              onClick={() => {
                                markNotificationAsRead(n.id);
                                onNavigateToLedger();
                                onClose();
                              }}
                              className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium"
                            >
                              View Settlement Record
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px]">
                          {!n.read && (
                            <button
                              onClick={() => markNotificationAsRead(n.id)}
                              className="text-neutral-500 hover:text-neutral-800 px-2 py-1"
                              title="Mark read"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(n.id)}
                            className="text-neutral-400 hover:text-rose-600 px-1.5 py-1"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-3.5 sm:p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500 shrink-0">
          <span>
            {unreadCount > 0 ? `${unreadCount} unread notification(s)` : 'All caught up'}
          </span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
