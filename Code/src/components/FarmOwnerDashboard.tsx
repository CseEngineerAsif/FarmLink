import React, { useState } from 'react';
import { useFarmLink } from '../lib/store';
import { AnimalProfile, ExchangeType, Match } from '../types';
import { LIVESTOCK_IMAGE_URL } from '../lib/constants';
import {
  Tractor,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Plus,
  Sliders,
  Check,
  ArrowRight,
  Bell,
  Sparkles,
  Utensils,
  MapPin
} from 'lucide-react';

interface FarmOwnerDashboardProps {
  onOpenScanner: () => void;
  onOpenSettlement: (matchId: string) => void;
  onOpenNotificationCenter?: () => void;
}

export const FarmOwnerDashboard: React.FC<FarmOwnerDashboardProps> = ({
  onOpenScanner,
  onOpenSettlement,
  onOpenNotificationCenter
}) => {
  const {
    currentUser,
    farms,
    animals,
    matches,
    foodPosts,
    acceptMatch,
    declineMatch,
    createAnimalProfile,
    updateFarmPreferences,
    userNotifications,
    claimSurplusPost,
    simulateSurplusFoodAlert,
    unreadSurplusAlertsCount,
    language,
    t
  } = useFarmLink();

  const userFarm = farms.find(f => f.id === currentUser?.farmId) || farms[0];
  const farmAnimals = animals.filter(a => a.farmId === userFarm.id);
  const farmMatches = matches.filter(m => m.farmId === userFarm.id);

  const pendingMatches = farmMatches.filter(m => m.status === 'pending');
  const acceptedMatches = farmMatches.filter(m => m.status === 'accepted');
  const completedMatches = farmMatches.filter(m => m.status === 'collected');

  // Animal addition modal
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [newSpecies, setNewSpecies] = useState<any>('cattle');
  const [newCount, setNewCount] = useState<number>(10);
  const [newDetails, setNewDetails] = useState('');
  const [newFeed, setNewFeed] = useState('');

  // Preference edit mode
  const [isPrefOpen, setIsPrefOpen] = useState(false);
  const [prefRadius, setPrefRadius] = useState(userFarm.willingDistanceKm || 5.0);
  const [prefReturn, setPrefReturn] = useState<ExchangeType>(userFarm.preferredReturn || 'cash');
  const [acceptableFoods, setAcceptableFoods] = useState<string[]>(userFarm.acceptableFoodTypes || []);
  const [unacceptableFoods, setUnacceptableFoods] = useState<string[]>(userFarm.unacceptableFoodTypes || []);

  const handleAddAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    createAnimalProfile(userFarm.id, newSpecies, Number(newCount) || 1, newDetails, newFeed);
    setIsAddAnimalOpen(false);
    setNewDetails('');
    setNewFeed('');
  };

  const handleSavePreferences = () => {
    updateFarmPreferences(
      userFarm.id,
      acceptableFoods,
      unacceptableFoods,
      prefRadius,
      prefReturn
    );
    setIsPrefOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Farm Profile Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-2">
                <Tractor className="w-4 h-4 text-emerald-600" />
                <span>{userFarm.location}</span>
                <span className="text-neutral-300">|</span>
                <span className="text-neutral-700 font-medium">Owner: {userFarm.ownerName}</span>
                <span className="text-neutral-300">|</span>
                <span className="text-emerald-700 font-medium">Verified Active Farm</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight text-balance">
                {userFarm.farmName}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed max-w-2xl">
                {language === 'bn'
                  ? 'বিএইউএসটি হলের অতিরিক্ত পুষ্টিকর খাদ্য গ্রহণ করে আপনার খামারের খাদ্য খরচ সাশ্রয় করুন। বিনিময়ে দুধ, ডিম বা মাংস সরবরাহ করুন।'
                  : `Registered livestock holding in Saidpur. Connected to BAUST residential dining halls for high-nutrient cooked rice, dal, and vegetable trimmings, reducing daily feed expenditure.`}
              </p>
            </div>

            {/* Farm Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-neutral-100 text-xs">
              <div>
                <span className="text-neutral-500 block text-[11px]">Total Livestock</span>
                <span className="text-base font-bold text-neutral-900 font-mono tabular-nums">
                  {farmAnimals.reduce((acc, a) => acc + a.count, 0)} heads
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Daily Feed Cost</span>
                <span className="text-base font-bold text-neutral-900 font-mono tabular-nums">
                  Tk {userFarm.dailyFeedCostBdt?.toLocaleString() || '6,500'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Pickup Radius</span>
                <span className="text-base font-bold text-neutral-900 font-mono tabular-nums">
                  {userFarm.willingDistanceKm} km
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Preferred Return</span>
                <span className="text-base font-bold text-emerald-700 font-mono capitalize">
                  {userFarm.preferredReturn}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 relative min-h-48 lg:min-h-full bg-neutral-100">
            <img
              src={LIVESTOCK_IMAGE_URL}
              alt="Dairy cattle and goats feeding on grain"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <span className="text-[11px] text-white/90 font-medium">
                {userFarm.farmName} · Ruminant Livestock Enclosure
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>{language === 'bn' ? 'পিকআপ কিউআর স্ক্যান করুন' : 'Scan Handover QR at Hall'}</span>
          </button>

          <button
            onClick={() => onOpenNotificationCenter && onOpenNotificationCenter()}
            className="flex items-center gap-2 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span>{language === 'bn' ? 'বিজ্ঞপ্তি কেন্দ্র' : 'Notification Center'}</span>
            {unreadSurplusAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                {unreadSurplusAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsPrefOpen(true)}
            className="flex items-center gap-1.5 py-2.5 px-3.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Sliders className="w-4 h-4 text-neutral-500" />
            <span>Preferences & Radius</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={simulateSurplusFoodAlert}
            className="flex items-center gap-1.5 py-2 px-3 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold rounded-lg transition-colors"
            title="Simulate a new surplus meal logged by BAUST dining hall"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Meal Alert</span>
          </button>

          <button
            onClick={() => setIsAddAnimalOpen(true)}
            className="flex items-center gap-1.5 py-2 px-3 text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Livestock Group</span>
          </button>
        </div>
      </div>

      {/* Live Surplus Food Post Alerts Card for Farm Owners */}
      {userNotifications.filter(n => n.type === 'surplus_post_created' && !n.read).length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <span>{language === 'bn' ? 'সরাসরি খাবার উদ্বৃত্ত সতর্কতা' : 'Live Surplus Food Post Alerts'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    {userNotifications.filter(n => n.type === 'surplus_post_created' && !n.read).length} New
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-600">
                  {language === 'bn'
                    ? 'সৈয়দপুরের ডাইনিং হলগুলো সদ্য উদ্বৃত্ত খাবার রেকর্ড করেছে। ২ ঘণ্টার মধ্যে সংগ্রহ করুন।'
                    : 'University dining halls have just recorded fresh surplus food. Claim before holding window expires.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenNotificationCenter && onOpenNotificationCenter()}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 self-start sm:self-auto underline"
            >
              <span>View All in Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {userNotifications
              .filter(n => n.type === 'surplus_post_created' && !n.read)
              .slice(0, 2)
              .map(alert => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-white border border-emerald-200/90 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-neutral-900 text-xs flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{alert.postDetails?.hallName || 'University Hall'}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded">
                        {alert.postDetails?.quantityKg || 12} kg
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-600 line-clamp-2 mb-2">
                      {alert.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {alert.relatedEntityId && (
                        <button
                          onClick={() => claimSurplusPost(alert.relatedEntityId!)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors"
                        >
                          Claim Post
                        </button>
                      )}
                      <button
                        onClick={() => onOpenNotificationCenter && onOpenNotificationCenter()}
                        className="px-2 py-1 text-neutral-600 hover:text-neutral-900 text-[11px] font-medium"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Pending Match Offers Section (High Priority) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <span>{language === 'bn' ? 'আসন্ন উদ্বৃত্ত খাদ্য অফার' : 'Incoming Surplus Food Match Offers'}</span>
            {pendingMatches.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono">
                {pendingMatches.length} New
              </span>
            )}
          </h2>
        </div>

        {pendingMatches.length === 0 ? (
          <div className="p-6 bg-white rounded-xl border border-neutral-200 text-center text-xs text-neutral-500">
            No incoming pending offers at this moment. You will receive an instant notification when BAUST halls post meals matching your livestock needs.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingMatches.map(match => {
              const post = foodPosts.find(p => p.id === match.postId);
              const deadline = post ? new Date(post.pickupDeadline) : new Date(match.expiresAt);
              const now = new Date();
              const mins = Math.max(0, Math.round((deadline.getTime() - now.getTime()) / (1000 * 60)));

              return (
                <div
                  key={match.id}
                  className="p-5 bg-white rounded-xl border border-emerald-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                          Matched from {match.hallName}
                        </span>
                        <h4 className="text-base font-bold text-neutral-900">
                          {post?.foodTypes.join(', ') || 'Steamed Rice & Veggies'}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold font-mono tabular-nums text-neutral-900 block">
                          {post?.quantityKg || 15} kg
                        </span>
                        <span className="text-xs text-neutral-500 font-mono">
                          {match.distanceKm} km away
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-lg text-xs space-y-1 mb-4">
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Veterinary Compatibility:</span>
                        <strong className="text-emerald-700">{match.safetyScore}% Match</strong>
                      </div>
                      <div className="flex items-center justify-between text-amber-800 font-mono">
                        <span>Pickup Remaining Window:</span>
                        <strong>{mins} minutes remaining</strong>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Proposed Return:</span>
                        <strong className="capitalize">{match.agreedExchangeType}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-neutral-100">
                    <button
                      onClick={() => declineMatch(match.id, 'Declined by owner')}
                      className="flex-1 py-2 px-3 text-neutral-600 hover:text-rose-700 hover:bg-rose-50 border border-neutral-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-neutral-400" />
                      <span>{language === 'bn' ? 'প্রত্যাখ্যান' : 'Decline Offer'}</span>
                    </button>

                    <button
                      onClick={() => acceptMatch(match.id)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === 'bn' ? 'অফার গ্রহণ করুন' : 'Accept Offer'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Accepted Batches Pending Physical Pickup */}
      {acceptedMatches.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-neutral-900">
            {language === 'bn' ? 'গৃহীত ম্যাচসমূহ — সংগ্রহের জন্য প্রস্তুত' : 'Accepted Offers — Ready for Collection'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedMatches.map(match => {
              const post = foodPosts.find(p => p.id === match.postId);

              return (
                <div key={match.id} className="p-5 bg-blue-50/40 rounded-xl border border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block mb-1">
                        Ready at {match.hallName}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-900">
                        {post?.foodTypes.join(', ')} ({post?.quantityKg} kg)
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded">
                      En Route
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mb-4">
                    Arrive at {match.hallName} kitchen dock and scan the Hall Administrator's QR code to record collection.
                  </p>
                  <button
                    onClick={onOpenScanner}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Scan QR at Hall</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Collections Pending/Settled */}
      {completedMatches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">
              {language === 'bn' ? 'সংগৃহীত উদ্বৃত্ত ও বিনিময় নিষ্পত্তি' : 'Completed Collections & Exchange Settlement'}
            </h2>
            <button
              onClick={() => onOpenSettlement('')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedMatches.map(match => {
              const post = foodPosts.find(p => p.id === match.postId);

              return (
                <div key={match.id} className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold block w-fit mb-1">
                      Collected at {match.hallName}
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900">
                      {post?.foodTypes.join(', ') || 'Steamed Rice & Veggies'} ({post?.quantityKg || 15} kg)
                    </h4>
                    <span className="text-xs text-neutral-500 capitalize">
                      Agreed return: {match.agreedExchangeType}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenSettlement(match.id)}
                    className="py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium shrink-0 transition-colors"
                  >
                    Manage Return
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Livestock Animals Inventory Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              {language === 'bn' ? 'খামারের প্রাণিসম্পদ ও খাদ্য গ্রহণ তালিকা' : 'Livestock Inventory & Dietary Feeds'}
            </h3>
            <p className="text-xs text-neutral-500">
              Surplus food validation checks compatibility against these active livestock groups
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] border-b border-neutral-100">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Species</th>
                <th className="py-2.5 px-4 font-semibold">Breed Details</th>
                <th className="py-2.5 px-4 font-semibold text-right">Head Count</th>
                <th className="py-2.5 px-4 font-semibold">Routine Feed</th>
                <th className="py-2.5 px-4 font-semibold">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {farmAnimals.map(anim => (
                <tr key={anim.id} className="hover:bg-neutral-50/50">
                  <td className="py-3 px-4 font-bold text-neutral-900 capitalize">
                    {anim.species}
                  </td>
                  <td className="py-3 px-4 text-neutral-700">{anim.details || 'Local breed'}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                    {anim.count}
                  </td>
                  <td className="py-3 px-4 text-neutral-600">{anim.normalFeedUsed}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3" />
                      <span className="capitalize">{anim.healthStatus}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Animal Modal */}
      {isAddAnimalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 relative">
            <button
              onClick={() => setIsAddAnimalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-neutral-900 mb-4">Add Livestock to Farm</h3>
            <form onSubmit={handleAddAnimal} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Species</label>
                <select
                  value={newSpecies}
                  onChange={e => setNewSpecies(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="cattle">Cattle / Cows</option>
                  <option value="goat">Goat</option>
                  <option value="sheep">Sheep</option>
                  <option value="poultry">Poultry</option>
                  <option value="fish">Aquaculture / Fish</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Head Count</label>
                <input
                  type="number"
                  min="1"
                  value={newCount}
                  onChange={e => setNewCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Breed & Details</label>
                <input
                  type="text"
                  value={newDetails}
                  onChange={e => setNewDetails(e.target.value)}
                  placeholder="e.g. 15 Friesian cross cows"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Current Routine Feed</label>
                <input
                  type="text"
                  value={newFeed}
                  onChange={e => setNewFeed(e.target.value)}
                  placeholder="e.g. Napier grass, rice bran, maize"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAnimalOpen(false)}
                  className="flex-1 py-2 px-3 bg-neutral-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-emerald-600 text-white rounded-lg font-medium"
                >
                  Save Animal Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preferences & Radius Modal */}
      {isPrefOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 relative text-xs">
            <h3 className="text-base font-bold text-neutral-900 mb-4">Collection Radius & Return Preferences</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-medium text-neutral-700 mb-1">
                  <span>Willing Collection Distance</span>
                  <span className="font-mono font-bold text-emerald-700">{prefRadius} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={prefRadius}
                  onChange={e => setPrefRadius(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <span className="text-[11px] text-neutral-400">Saidpur field survey showed 2–5 km as optimal range.</span>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Preferred Return Settlement</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['cash', 'milk', 'eggs', 'meat'] as ExchangeType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPrefReturn(type)}
                      className={`p-2 rounded-lg border font-medium capitalize transition-colors ${
                        prefReturn === type
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                          : 'bg-white border-neutral-200 text-neutral-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1.5">Acceptable Surplus Food Types</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Cooked rice',
                    'Vegetable scraps',
                    'Fruit peels',
                    'Unseasoned grains',
                    'Cooked dal',
                    'Khichuri'
                  ].map(food => {
                    const isSelected = acceptableFoods.includes(food);
                    return (
                      <button
                        key={food}
                        type="button"
                        onClick={() =>
                          setAcceptableFoods(prev =>
                            isSelected ? prev.filter(f => f !== food) : [...prev, food]
                          )
                        }
                        className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                            : 'bg-white border-neutral-200 text-neutral-600'
                        }`}
                      >
                        {food}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1.5">Unacceptable / Refused Items</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Cooked curry',
                    'Spicy foods',
                    'Moldy foods',
                    'Bones',
                    'Oily food'
                  ].map(food => {
                    const isSelected = unacceptableFoods.includes(food);
                    return (
                      <button
                        key={food}
                        type="button"
                        onClick={() =>
                          setUnacceptableFoods(prev =>
                            isSelected ? prev.filter(f => f !== food) : [...prev, food]
                          )
                        }
                        className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                          isSelected
                            ? 'bg-rose-50 border-rose-400 text-rose-900 font-semibold'
                            : 'bg-white border-neutral-200 text-neutral-600'
                        }`}
                      >
                        {food}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsPrefOpen(false)}
                  className="flex-1 py-2 bg-neutral-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-medium"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
