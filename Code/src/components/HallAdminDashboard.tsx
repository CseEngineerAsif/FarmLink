import React, { useState } from 'react';
import { useFarmLink } from '../lib/store';
import { FoodPost, Match } from '../types';
import { evaluateSurplusFoodSafety } from '../lib/safetyEngine';
import { HALL_IMAGE_URL } from '../lib/constants';
import { Plus, QrCode, Clock, CheckCircle2, AlertTriangle, ShieldAlert, Building, Truck, Sparkles, X, Trash2 } from 'lucide-react';

interface HallAdminDashboardProps {
  onOpenQR: (post: FoodPost) => void;
}

export const HallAdminDashboard: React.FC<HallAdminDashboardProps> = ({ onOpenQR }) => {
  const {
    currentUser,
    halls,
    foodPosts,
    matches,
    createFoodPost,
    cancelFoodPost,
    guidelines,
    language,
    t
  } = useFarmLink();

  const userHall = halls.find(h => h.id === currentUser?.hallId) || halls[0];

  // Food Post Creation Modal State
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<string[]>(['Cooked rice', 'Vegetables']);
  const [customFoodInput, setCustomFoodInput] = useState('');
  const [quantityKg, setQuantityKg] = useState<number>(15);
  const [mealType, setMealType] = useState<'lunch' | 'dinner' | 'breakfast'>('lunch');
  const [storageCondition, setStorageCondition] = useState<'cool_dry' | 'room_temp' | 'refrigerated'>('cool_dry');
  const [postNotes, setPostNotes] = useState('');
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Live safety pre-check for selected foods
  const safetyEvaluation = evaluateSurplusFoodSafety(
    selectedFoods,
    new Date(),
    guidelines,
    undefined,
    userHall.surplusHoldingWindowHours || 2.0
  );

  const hallPosts = foodPosts.filter(p => p.hallId === userHall.id);
  const activePosts = hallPosts.filter(p => p.status === 'open' || p.status === 'matched');
  const pastPosts = hallPosts.filter(p => p.status === 'collected' || p.status === 'expired' || p.status === 'cancelled');

  // Summary Metrics
  const totalDivertedKg = hallPosts
    .filter(p => p.status === 'collected')
    .reduce((acc, curr) => acc + curr.quantityKg, 0);

  const handleAddFoodType = (food: string) => {
    if (!selectedFoods.includes(food)) {
      setSelectedFoods([...selectedFoods, food]);
    }
  };

  const handleRemoveFoodType = (food: string) => {
    setSelectedFoods(selectedFoods.filter(f => f !== food));
  };

  const handleCustomFoodAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFoodInput.trim() && !selectedFoods.includes(customFoodInput.trim())) {
      setSelectedFoods([...selectedFoods, customFoodInput.trim()]);
      setCustomFoodInput('');
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFoods.length === 0) return;

    const result = createFoodPost({
      hallId: userHall.id,
      foodTypes: selectedFoods,
      quantityKg: Number(quantityKg) || 10,
      mealType,
      storageCondition,
      notes: postNotes
    });

    setSubmissionFeedback(
      result.matchCount > 0
        ? `Surplus posted! Automatically matched with nearby livestock farm within ${userHall.surplusHoldingWindowHours}h window.`
        : 'Surplus posted! Notification broadcasted to eligible nearby farms.'
    );

    setTimeout(() => {
      setIsPostingModalOpen(false);
      setSubmissionFeedback(null);
      setPostNotes('');
    }, 1400);
  };

  return (
    <div className="space-y-6">
      {/* Hall Hero / Context Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span>{userHall.institution} · {userHall.location}</span>
                <span className="text-neutral-300">|</span>
                <span className="text-emerald-700 font-medium">Verified Active Hall</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight text-balance">
                {userHall.hallName}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed max-w-2xl">
                {language === 'bn'
                  ? 'দৈনিক খাদ্য উদ্বৃত্ত সরাসরি সৈয়দপুরের নিবন্ধিত দুগ্ধ ও গবাদিপশু খামারে প্রেরণ করুন। কঠোর ২ ঘণ্টার স্বাস্থ্য সুরক্ষার সময়সীমার মধ্যে নিরাপদ খাদ্য স্থানান্তর নিশ্চিত হয়।'
                  : `Managing daily dining hall surplus for ${userHall.totalStudents} resident students. Posts are automatically verified against livestock dietary rules and dispatched within the conservative ${userHall.surplusHoldingWindowHours}-hour holding limit.`}
              </p>
            </div>

            {/* Hall Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-neutral-100 text-xs">
              <div>
                <span className="text-neutral-500 block text-[11px]">Total Students</span>
                <span className="text-base font-bold text-neutral-900 font-mono tabular-nums">
                  {userHall.totalStudents}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Daily Prepared Meals</span>
                <span className="text-base font-bold text-neutral-900 font-mono tabular-nums">
                  {userHall.mealsPreparedPerDay}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Surplus Diverted</span>
                <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">
                  {totalDivertedKg.toFixed(1)} kg
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Strict Holding Cap</span>
                <span className="text-base font-bold text-amber-700 font-mono tabular-nums">
                  {userHall.surplusHoldingWindowHours} hours
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 relative min-h-48 lg:min-h-full bg-neutral-100">
            <img
              src={HALL_IMAGE_URL}
              alt="Dining hall kitchen food preparation"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <span className="text-[11px] text-white/90 font-medium">
                BAUST Food Service Unit · Kitchen Cauldrons
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions & Live Posts Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            {language === 'bn' ? 'সক্রিয় খাদ্য উদ্বৃত্ত পোস্ট' : 'Active Surplus Batches'}
          </h2>
          <p className="text-xs text-neutral-500">
            {language === 'bn'
              ? 'নির্ধারিত সময়ের মধ্যে খামারী সংগ্রহ করবেন, অন্যথায় স্বয়ংক্রিয়ভাবে বর্জ্যে পরিণত হবে'
              : 'Real-time countdown to pickup deadline. QR code must be scanned at physical handover.'}
          </p>
        </div>

        <button
          onClick={() => setIsPostingModalOpen(true)}
          className="flex items-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'উদ্বৃত্ত খাবার পোস্ট করুন' : 'Post Meal Surplus (kg)'}</span>
        </button>
      </div>

      {/* Active Food Posts List */}
      {activePosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
          <Clock className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-800">No active surplus batches right now</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-4">
            After lunch or dinner service, log the weighed surplus food here. The matching engine will instantly locate the closest eligible livestock farm.
          </p>
          <button
            onClick={() => setIsPostingModalOpen(true)}
            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Log First Meal Surplus
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activePosts.map(post => {
            const match = matches.find(m => m.id === post.currentMatchId);
            const deadlineTime = new Date(post.pickupDeadline);
            const now = new Date();
            const minutesRemaining = Math.max(0, Math.round((deadlineTime.getTime() - now.getTime()) / (1000 * 60)));

            return (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                          {post.quantityKg} kg
                        </span>
                        <span className="text-xs text-neutral-400">·</span>
                        <span className="text-xs font-semibold capitalize text-neutral-700">
                          {post.mealType} Service
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900">
                        {post.foodTypes.join(', ')}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{minutesRemaining}m left</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        Hold cap: {post.maxHoldingHours}h
                      </span>
                    </div>
                  </div>

                  {/* Match Status Strip */}
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100 text-xs mb-4">
                    {match ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Matched: {match.farmName}</span>
                          </div>
                          <span className="text-[11px] text-neutral-500">
                            Distance: {match.distanceKm} km · Safety: {match.safetyScore}%
                          </span>
                        </div>
                        <span className="font-medium capitalize text-emerald-700 text-[11px]">
                          {match.status}
                        </span>
                      </div>
                    ) : (
                      <div className="text-neutral-500 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                        <span>Evaluating registered farms within 5 km...</span>
                      </div>
                    )}
                  </div>

                  {post.notes && (
                    <p className="text-xs text-neutral-500 italic mb-4">
                      "{post.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                  <button
                    onClick={() => onOpenQR(post)}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'হস্তান্তর কিউআর কোড' : 'Show Handover QR'}</span>
                  </button>

                  <button
                    onClick={() => cancelFoodPost(post.id)}
                    className="py-2 px-3 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 border border-neutral-200 rounded-lg text-xs transition-colors"
                    title="Cancel surplus post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historical Completed Handover Batches */}
      {pastPosts.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-neutral-100 bg-neutral-50/50">
            <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              {language === 'bn' ? 'বিগত খাদ্য হস্তান্তর রেকর্ড' : 'Recent Surplus Handover History'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-neutral-600">
              <thead className="bg-neutral-50/80 text-neutral-500 uppercase text-[10px] border-b border-neutral-100">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Post ID</th>
                  <th className="py-2.5 px-4 font-semibold">Meal & Content</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Quantity</th>
                  <th className="py-2.5 px-4 font-semibold">Posted Time</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {pastPosts.slice(0, 5).map(p => (
                  <tr key={p.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-4 font-mono text-neutral-800">{p.id.substring(0, 12)}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-neutral-900">{p.foodTypes.join(', ')}</span>
                      <span className="text-neutral-400 block text-[11px] capitalize">{p.mealType}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                      {p.quantityKg} kg
                    </td>
                    <td className="py-3 px-4 text-neutral-500 font-mono text-[11px]">
                      {new Date(p.postedTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                        p.status === 'collected'
                          ? 'bg-emerald-50 text-emerald-700'
                          : p.status === 'expired'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Food Post Creation Modal */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-100 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsPostingModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {language === 'bn' ? 'উদ্বৃত্ত খাবার রেকর্ড করুন' : 'Log Daily Surplus Food'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {userHall.hallName} · BAUST Saidpur
                </p>
              </div>
            </div>

            {submissionFeedback ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{submissionFeedback}</span>
              </div>
            ) : (
              <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
                {/* Food Types Selector */}
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1.5">
                    Select Surplus Food Components
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      'Cooked rice',
                      'Vegetables',
                      'Cooked dal',
                      'Khichuri',
                      'Vegetable trimmings',
                      'Mashed potatoes/food',
                      'Spicy curry' // Included to demonstrate safety validator rejection!
                    ].map(food => {
                      const isSelected = selectedFoods.includes(food);
                      return (
                        <button
                          key={food}
                          type="button"
                          onClick={() => isSelected ? handleRemoveFoodType(food) : handleAddFoodType(food)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          {food}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom food addition */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customFoodInput}
                      onChange={e => setCustomFoodInput(e.target.value)}
                      placeholder="Add custom item (e.g. Rice bran mash, Fruit skins)"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleCustomFoodAdd}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Live Food Safety Engine Feedback Box */}
                <div className={`p-3.5 rounded-xl border ${
                  safetyEvaluation.isSafe
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                    {safetyEvaluation.isSafe ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      {safetyEvaluation.isSafe
                        ? 'Veterinary Biosecurity Check: APPROVED'
                        : 'Biosecurity Hazard: FEEDING REJECTED'}
                    </span>
                    <span className="font-mono ml-auto text-[11px]">
                      Safety Score: {safetyEvaluation.score}%
                    </span>
                  </div>

                  {safetyEvaluation.hardBlockReasons.length > 0 && (
                    <ul className="list-disc list-inside text-[11px] text-rose-700 space-y-0.5 mt-1.5">
                      {safetyEvaluation.hardBlockReasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}

                  {safetyEvaluation.warnings.length > 0 && (
                    <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5 mt-1.5">
                      {safetyEvaluation.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}

                  <div className="text-[11px] text-neutral-600 mt-2 pt-2 border-t border-neutral-200/60">
                    Target Species: {safetyEvaluation.compatibleSpecies.join(', ') || 'None'}
                  </div>
                </div>

                {/* Quantity and Meal Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Estimated Surplus (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="100"
                      value={quantityKg}
                      onChange={e => setQuantityKg(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Meal Service
                    </label>
                    <select
                      value={mealType}
                      onChange={e => setMealType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="lunch">Lunch Service (2:30 PM)</option>
                      <option value="dinner">Dinner Service (9:30 PM)</option>
                      <option value="breakfast">Breakfast Service (9:00 AM)</option>
                    </select>
                  </div>
                </div>

                {/* Storage Condition & Holding Window Note */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Storage Condition
                    </label>
                    <select
                      value={storageCondition}
                      onChange={e => setStorageCondition(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs bg-white"
                    >
                      <option value="cool_dry">Cool & Dry Shaded Container</option>
                      <option value="room_temp">Room Temperature Covered Bin</option>
                      <option value="refrigerated">Refrigerated Chiller</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Max Holding Window
                    </label>
                    <div className="px-3 py-2 rounded-lg bg-neutral-100 font-mono text-xs text-neutral-800 border border-neutral-200">
                      {userHall.surplusHoldingWindowHours} hours (strictest threshold)
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Special Handover Notes (optional)
                  </label>
                  <textarea
                    value={postNotes}
                    onChange={e => setPostNotes(e.target.value)}
                    placeholder="e.g. Segregated into 25kg stainless tubs behind dining hall dock."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPostingModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!safetyEvaluation.isSafe || selectedFoods.length === 0}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
                  >
                    Publish Surplus Offer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
