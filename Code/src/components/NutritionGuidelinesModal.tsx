import React, { useState } from 'react';
import { useFarmLink } from '../lib/store';
import { NutritionGuideline, AnimalSpecies } from '../types';
import { FEED_INSPECTION_IMAGE_URL } from '../lib/constants';
import { ShieldCheck, AlertOctagon, Clock, BookOpen, X, Edit2, Save, Filter, Info, CheckCircle2 } from 'lucide-react';

interface NutritionGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NutritionGuidelinesModal: React.FC<NutritionGuidelinesModalProps> = ({ isOpen, onClose }) => {
  const { guidelines, updateNutritionGuideline, currentUser, language, t } = useFarmLink();
  const [editingGuideline, setEditingGuideline] = useState<NutritionGuideline | null>(null);
  const [safeFoodsInput, setSafeFoodsInput] = useState('');
  const [disallowedFoodsInput, setDisallowedFoodsInput] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');

  if (!isOpen) return null;

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const startEditing = (guide: NutritionGuideline) => {
    setEditingGuideline(guide);
    setSafeFoodsInput(guide.safeFoodTypes.join(', '));
    setDisallowedFoodsInput(guide.disallowedFoodTypes.join(', '));
  };

  const handleSave = () => {
    if (editingGuideline) {
      updateNutritionGuideline({
        ...editingGuideline,
        safeFoodTypes: safeFoodsInput.split(',').map(s => s.trim()).filter(Boolean),
        disallowedFoodTypes: disallowedFoodsInput.split(',').map(s => s.trim()).filter(Boolean),
        lastUpdated: new Date().toISOString()
      });
      setEditingGuideline(null);
    }
  };

  const filteredGuidelines = guidelines.filter(
    g => selectedSpecies === 'all' || g.species === selectedSpecies
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-neutral-100 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visual Inspection Showcase Banner */}
        <div className="rounded-xl overflow-hidden border border-neutral-200 mb-5 relative bg-neutral-900 text-white">
          <div className="h-44 sm:h-52 w-full relative">
            <img
              src={FEED_INSPECTION_IMAGE_URL}
              alt="Veterinary food inspection"
              className="w-full h-full object-cover opacity-85"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>BLRI Verified Biosecurity Framework</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {language === 'bn' ? 'প্রাণিসম্পদ পুষ্টি ও নিরাপত্তা প্রটোকল' : 'Veterinary Biosecurity & Feed Standards'}
              </h2>
              <p className="text-xs text-neutral-300 mt-1 max-w-xl">
                {language === 'bn'
                  ? 'সৈয়দপুরের ডেইরি ও প্রাণিসম্পদ রক্ষায় কঠোর ২ ঘণ্টার হোল্ডিং নীতি এবং বিষাক্ত উপাদান বর্জন প্রটোকল।'
                  : 'Independent veterinary research enforces strict holding thresholds and absolute exclusion of toxic spices to protect ruminant microbiome.'}
              </p>
            </div>
          </div>
        </div>

        {/* Strictest 2-Hour Holding Threshold Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 mb-5 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">
              {language === 'bn' ? 'কঠোর ২ ঘণ্টার সময়সীমা নীতি সক্রিয়' : 'Strict Biosecurity Threshold Active (2-Hour Max Holding)'}
            </span>
            <p className="text-neutral-600 leading-relaxed">
              {language === 'bn'
                ? 'বিশেষজ্ঞদের মতবিরোধের ক্ষেত্রে প্রাণিসম্পদের স্বাস্থ্য সুরক্ষায় সর্বাধিক রক্ষণশীল সময়সীমা (২ ঘণ্টা) প্রয়োগ করা হয়। মেয়াদ উত্তীর্ণ হলে খাদ্য স্বয়ংক্রিয়ভাবে সাধারণ বর্জ্যে ফেরত যাবে।'
                : 'When expert opinions diverge (2-6 hours vs under 2 hours), the strictest documented 2-hour threshold is applied by default to protect livestock gut microbiota from harmful acidosis and fermentation.'}
            </p>
          </div>
        </div>

        {/* Species Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded-xl mb-4 text-xs">
          {[
            { id: 'all', label: 'All Species' },
            { id: 'cattle', label: 'Cattle / Dairy' },
            { id: 'goat', label: 'Goats' },
            { id: 'sheep', label: 'Sheep' },
            { id: 'poultry', label: 'Poultry / Hens' },
            { id: 'fish', label: 'Aquaculture' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedSpecies(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedSpecies === tab.id
                  ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Guidelines List */}
        <div className="space-y-4">
          {filteredGuidelines.map(guide => {
            const isEditing = editingGuideline?.id === guide.id;

            return (
              <div key={guide.id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900 capitalize">
                      {guide.species === 'cattle' ? 'Cattle / Dairy Cows' : guide.species}
                    </span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span className="text-xs font-mono text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                      Hold: {guide.maxHoldingTimeHours}h max
                    </span>
                  </div>

                  {isSuperAdmin && !isEditing && (
                    <button
                      onClick={() => startEditing(guide)}
                      className="flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 bg-white px-2 py-1 rounded border border-neutral-200 shadow-xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Rules</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 bg-white p-3 rounded-lg border border-neutral-200 text-xs">
                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">Max Holding Hours (Veterinary Limit)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="8"
                        value={editingGuideline.maxHoldingTimeHours}
                        onChange={e => setEditingGuideline({ ...editingGuideline, maxHoldingTimeHours: parseFloat(e.target.value) || 2 })}
                        className="px-2.5 py-1.5 border rounded w-32 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">Safe Food Items (comma separated)</label>
                      <input
                        type="text"
                        value={safeFoodsInput}
                        onChange={e => setSafeFoodsInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">Disallowed / Toxic Foods (comma separated)</label>
                      <input
                        type="text"
                        value={disallowedFoodsInput}
                        onChange={e => setDisallowedFoodsInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setEditingGuideline(null)}
                        className="px-3 py-1.5 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded font-medium flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save Policy</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-emerald-800 flex items-center gap-1 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Permitted / Safe Surplus Foods</span>
                      </span>
                      <p className="text-neutral-700 leading-relaxed bg-white p-2 rounded border border-neutral-100">
                        {guide.safeFoodTypes.join(', ')}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-rose-800 flex items-center gap-1 mb-1">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                        <span>Disallowed / Biological Hazards</span>
                      </span>
                      <p className="text-neutral-700 leading-relaxed bg-white p-2 rounded border border-neutral-100">
                        {guide.disallowedFoodTypes.join(', ')}
                      </p>
                    </div>

                    <div className="md:col-span-2 pt-1 border-t border-neutral-100 flex flex-wrap items-center justify-between text-[11px] text-neutral-500 gap-2">
                      <span>Source: <strong className="text-neutral-700">{guide.sourceExpert}</strong></span>
                      <span>Spoilage flags: {guide.spoilageIndicators.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg transition-colors"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
