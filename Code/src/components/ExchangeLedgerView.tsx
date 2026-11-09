import React, { useState } from 'react';
import { useFarmLink } from '../lib/store';
import { ExchangeTransaction, ExchangeType } from '../types';
import { DAIRY_EXCHANGE_IMAGE_URL } from '../lib/constants';
import { CircleDollarSign, Milk, Egg, UtensilsCrossed, CheckCircle2, Clock, Plus, Check, Search, Filter, ArrowRight, Sparkles } from 'lucide-react';

export const ExchangeLedgerView: React.FC = () => {
  const { transactions, recordTransactionSettlement, currentUser, language, t } = useFarmLink();

  const [settlingTxn, setSettlingTxn] = useState<ExchangeTransaction | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settleType, setSettleType] = useState<ExchangeType>('cash');
  const [settleNotes, setSettleNotes] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const openSettleModal = (txn: ExchangeTransaction) => {
    setSettlingTxn(txn);
    setSettleAmount(txn.amountQuantity);
    setSettleType(txn.exchangeType);
    setSettleNotes(txn.notes || '');
  };

  const handleConfirmSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingTxn) return;
    recordTransactionSettlement(settlingTxn.id, settleAmount, settleType, settleNotes);
    setSettlingTxn(null);
  };

  // Cumulative Summaries
  const totalKg = transactions.reduce((sum, t) => sum + (t.foodQuantityRedistributedKg || 0), 0);
  const totalBdt = transactions.reduce((sum, t) => sum + (t.estimatedValueBdt || 0), 0);

  const totalMilkLiters = transactions
    .filter(t => t.exchangeType === 'milk')
    .reduce((sum, t) => sum + t.amountQuantity, 0);

  const totalEggsPcs = transactions
    .filter(t => t.exchangeType === 'eggs')
    .reduce((sum, t) => sum + t.amountQuantity, 0);

  const filteredTransactions = transactions.filter(txn => {
    const matchesType = typeFilter === 'all' || txn.exchangeType === typeFilter;
    const matchesSearch =
      txn.hallName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Visual Circular Economy Hero Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-2">
                <CircleDollarSign className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'সার্কুলার ইকোনমি বিনিময় মডেল' : 'Closed-Loop Circular Economy Ledger'}</span>
                <span className="text-neutral-300">·</span>
                <span className="text-neutral-500 font-normal">Saidpur Cantonment & Nilphamari</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight text-balance">
                {language === 'bn' ? 'উদ্বৃত্ত খাদ্যের বিনিময়ে তাজা খামারের খাদ্যপণ্য' : 'Surplus Food Transformed into Fresh Campus Produce'}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-600 mt-2.5 leading-relaxed max-w-xl">
                {language === 'bn'
                  ? 'হলের উদ্বৃত্ত পুষ্টিকর খাদ্য গ্রহণকারী দুগ্ধ ও পোল্ট্রি খামারগুলো শিক্ষার্থীদের জন্য সাশ্রয়ী মূল্যে খাঁটি গরুর দুধ ও ডিম সরবরাহ করে।'
                  : 'Surplus cooked grains and vegetable trimmings reduce daily animal feed costs for local dairy farmers. In return, verified farms deliver fresh milk and poultry eggs directly to residential hall dining menus at subsidized rates.'}
              </p>
            </div>

            {/* Metric Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-neutral-100 text-xs">
              <div>
                <span className="text-neutral-500 block text-[11px]">Fresh Milk Settled</span>
                <span className="text-lg font-bold text-blue-700 font-mono tabular-nums">
                  {totalMilkLiters} Liters
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Poultry Eggs</span>
                <span className="text-lg font-bold text-amber-700 font-mono tabular-nums">
                  {totalEggsPcs} Pieces
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Total Settled Value</span>
                <span className="text-lg font-bold text-emerald-700 font-mono tabular-nums">
                  Tk {totalBdt.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-56 lg:min-h-full bg-neutral-100">
            <img
              src={DAIRY_EXCHANGE_IMAGE_URL}
              alt="Fresh dairy milk churns and farm eggs"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
              <span className="text-[11px] text-white/95 font-medium">
                Sabuj Bangla & Hosan Farms · Daily Fresh Milk & Egg Harvest
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Exchanges' },
            { id: 'milk', label: 'Fresh Milk', icon: Milk },
            { id: 'eggs', label: 'Farm Eggs', icon: Egg },
            { id: 'meat', label: 'Meat', icon: UtensilsCrossed },
            { id: 'cash', label: 'Cash Settlement', icon: CircleDollarSign }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = typeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  isSelected
                    ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hall or farm..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-56"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] border-b border-neutral-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Transaction ID</th>
                <th className="py-3 px-4 font-semibold">Hall & Farm Pair</th>
                <th className="py-3 px-4 font-semibold text-right">Surplus Collected</th>
                <th className="py-3 px-4 font-semibold">Agreed Return Product</th>
                <th className="py-3 px-4 font-semibold text-right">Estimated Value</th>
                <th className="py-3 px-4 font-semibold">Settlement</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-neutral-400">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(txn => {
                  const isSettled = txn.settlementStatus === 'settled';

                  return (
                    <tr key={txn.id} className="hover:bg-neutral-50/50">
                      <td className="py-3.5 px-4 font-mono text-neutral-800">
                      {txn.id}
                      <span className="block text-[10px] text-neutral-400">
                        {new Date(txn.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-900 block">{txn.hallName}</span>
                      <span className="text-neutral-500 text-[11px]">→ {txn.farmName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                      {txn.foodQuantityRedistributedKg} kg
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                        {txn.exchangeType === 'milk' ? (
                          <Milk className="w-4 h-4 text-blue-600" />
                        ) : txn.exchangeType === 'eggs' ? (
                          <Egg className="w-4 h-4 text-amber-600" />
                        ) : txn.exchangeType === 'meat' ? (
                          <UtensilsCrossed className="w-4 h-4 text-rose-600" />
                        ) : (
                          <CircleDollarSign className="w-4 h-4 text-emerald-600" />
                        )}
                        <span>
                          {txn.amountQuantity} {txn.unit}
                        </span>
                      </div>
                      {txn.notes && (
                        <span className="text-[10px] text-neutral-400 block truncate max-w-xs">{txn.notes}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                      Tk {txn.estimatedValueBdt.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                        isSettled ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {isSettled ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{txn.settlementStatus}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!isSettled ? (
                        <button
                          onClick={() => openSettleModal(txn)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors"
                        >
                          Settle Return
                        </button>
                      ) : (
                        <span className="text-[11px] text-neutral-400 font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settle Return Modal */}
      {settlingTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 relative text-xs">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              Record Exchange Settlement
            </h3>
            <p className="text-neutral-500 mb-4">
              {settlingTxn.hallName} ← {settlingTxn.farmName} ({settlingTxn.foodQuantityRedistributedKg} kg surplus)
            </p>

            <form onSubmit={handleConfirmSettlement} className="space-y-4">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Return Settlement Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['milk', 'eggs', 'meat', 'cash'] as ExchangeType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSettleType(type)}
                      className={`p-2 rounded-lg border font-medium capitalize transition-colors ${
                        settleType === type
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                          : 'bg-white border-neutral-200 text-neutral-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Settled Quantity / Amount
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={settleAmount}
                    onChange={e => setSettleAmount(parseFloat(e.target.value) || 0)}
                    required
                    className="flex-1 px-3 py-2 border rounded-lg font-mono"
                  />
                  <div className="px-3 py-2 bg-neutral-100 border rounded-lg font-mono uppercase text-neutral-700">
                    {settleType === 'milk' ? 'Liters' : settleType === 'eggs' ? 'Pieces' : settleType === 'meat' ? 'Kg' : 'BDT'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Settlement Memo / Notes</label>
                <textarea
                  value={settleNotes}
                  onChange={e => setSettleNotes(e.target.value)}
                  placeholder="e.g. Delivered 8 liters morning milk to hall supervisor."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettlingTxn(null)}
                  className="flex-1 py-2 bg-neutral-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
