import React, { useState, useMemo } from 'react';
import { useFarmLink } from '../lib/store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  ShieldCheck,
  TrendingUp,
  Download,
  Users,
  Building,
  Tractor,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Leaf
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const {
    users,
    halls,
    farms,
    foodPosts,
    transactions,
    auditLogs,
    updateUserStatus,
    language,
    t
  } = useFarmLink();

  const [auditSearch, setAuditSearch] = useState('');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('all');

  // Quantitative Aggregations
  const totalFoodRedistributedKg = foodPosts
    .filter(p => p.status === 'collected')
    .reduce((acc, p) => acc + p.quantityKg, 0);

  // Each kg of food waste diverted from landfill saves approximately 2.5 kg CO2-equivalent
  const estimatedCo2PreventedKg = Math.round(totalFoodRedistributedKg * 2.5);
  // Conservation: ~180L of virtual water saved per kg grain/vegetable surplus diverted vs virgin fodder crop
  const estimatedWaterSavedLiters = Math.round(totalFoodRedistributedKg * 180);
  // Feed metabolizable energy: ~3.1 Mcal per kg suitable ruminant mash
  const estimatedEnergyGeneratedMcal = Math.round(totalFoodRedistributedKg * 3.1);

  const totalExchangeValueBdt = transactions.reduce((acc, t) => acc + (t.estimatedValueBdt || 0), 0);

  // Chart Data: Hall-wise surplus distribution
  const hallComparisonData = useMemo(() => {
    return halls.map(hall => {
      const hallCollected = foodPosts
        .filter(p => p.hallId === hall.id && p.status === 'collected')
        .reduce((sum, p) => sum + p.quantityKg, 0);

      const hallOpenOrMatched = foodPosts
        .filter(p => p.hallId === hall.id && (p.status === 'open' || p.status === 'matched'))
        .reduce((sum, p) => sum + p.quantityKg, 0);

      return {
        name: hall.hallName.replace('Shaheed Dr. ', '').replace(' Ahmed Hall', ''),
        Redistributed: hallCollected,
        Active: hallOpenOrMatched
      };
    });
  }, [halls, foodPosts]);

  // Chart Data: Exchange Settlement Breakdown
  const exchangeBreakdownData = useMemo(() => {
    const counts: Record<string, number> = { cash: 0, milk: 0, eggs: 0, meat: 0 };
    transactions.forEach(t => {
      counts[t.exchangeType] = (counts[t.exchangeType] || 0) + (t.estimatedValueBdt || 0);
    });

    return [
      { name: 'Fresh Milk', value: counts.milk || 0, color: '#2563eb' },
      { name: 'Direct Cash', value: counts.cash || 0, color: '#10b981' },
      { name: 'Farm Eggs', value: counts.eggs || 0, color: '#f59e0b' },
      { name: 'Livestock Meat', value: counts.meat || 0, color: '#ef4444' }
    ].filter(d => d.value > 0);
  }, [transactions]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchText =
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.userName.toLowerCase().includes(auditSearch.toLowerCase());

      const matchEntity = selectedEntityFilter === 'all' || log.entityType === selectedEntityFilter;

      return matchText && matchEntity;
    });
  }, [auditLogs, auditSearch, selectedEntityFilter]);

  // Export CSV Report
  const exportCsv = () => {
    const headers = ['TransactionID', 'Hall', 'Farm', 'SurplusKg', 'ExchangeType', 'Amount', 'ValueBDT', 'Date'];
    const rows = transactions.map(t => [
      t.id,
      `"${t.hallName}"`,
      `"${t.farmName}"`,
      t.foodQuantityRedistributedKg,
      t.exchangeType,
      `${t.amountQuantity} ${t.unit}`,
      t.estimatedValueBdt,
      t.date
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `farmlink_institutional_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Top Control Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>FarmLink Institutional Governance & Safety Console</span>
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
            {language === 'bn' ? 'সুপার অ্যাডমিন ড্যাশবোর্ড' : 'System Administration & Impact Analytics'}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Saidpur university dining hall surplus diversion, livestock farm approvals, and biosecurity audits
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="flex items-center gap-2 py-2 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>{language === 'bn' ? 'রিপোর্ট ডাউনলোড (CSV)' : 'Export Institutional Audit (CSV)'}</span>
        </button>
      </div>

      {/* High-Level Impact Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span>Surplus Diverted</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {totalFoodRedistributedKg.toFixed(1)} <span className="text-sm font-normal text-neutral-500">kg</span>
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            Diverted from municipal disposal
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span>CO2eq Prevented</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {estimatedCo2PreventedKg} <span className="text-sm font-normal text-neutral-500">kg</span>
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Landfill methane aversion factor
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span>Water Conserved</span>
            <span className="text-xs font-bold text-blue-600">H2O</span>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums">
            {estimatedWaterSavedLiters.toLocaleString()} <span className="text-sm font-normal text-neutral-500">L</span>
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Virtual irrigation saved
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span>Settled Value</span>
            <span className="text-xs font-bold text-neutral-400">BDT</span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            Tk {totalExchangeValueBdt.toLocaleString()}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Milk, eggs & cash settled
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hall Surplus Output Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-neutral-900">
              {language === 'bn' ? 'হল-ভিত্তিক খাদ্য পুনর্বণ্টন তুলনা' : 'Hall-Wise Food Surplus Redistribution (kg)'}
            </h3>
            <p className="text-xs text-neutral-500">
              Volume comparison between BAUST dining halls
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hallComparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="Redistributed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Active" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exchange Settlement Types Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-neutral-900">
              {language === 'bn' ? 'বিনিময় নিষ্পত্তি বিতরণ' : 'Exchange Settlement Distribution'}
            </h3>
            <p className="text-xs text-neutral-500">
              Ratio of Milk, Eggs, Meat, and Cash (BDT value)
            </p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={exchangeBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {exchangeBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`Tk ${val}`, 'Settled Value']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stakeholder Account Approvals Management */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              {language === 'bn' ? 'ব্যবহারকারী ও খামার অনুমোদন ব্যবস্থাপনা' : 'User & Farm Account Approvals'}
            </h3>
            <p className="text-xs text-neutral-500">
              Enforce biosecurity by verifying all participating farm operators and dining managers
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] border-b border-neutral-100">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Name & Contact</th>
                <th className="py-2.5 px-4 font-semibold">Assigned Role</th>
                <th className="py-2.5 px-4 font-semibold">Institution / Farm</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-neutral-50/50">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-neutral-900 block">{u.name}</span>
                    <span className="text-neutral-400 font-mono text-[11px]">{u.email}</span>
                  </td>
                  <td className="py-3 px-4 capitalize font-medium text-neutral-800">
                    {u.role.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 text-neutral-700">
                    {u.institution || 'BAUST'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                      u.approvalStatus === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : u.approvalStatus === 'pending'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {u.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.role !== 'super_admin' && (
                      <div className="flex items-center justify-end gap-1.5">
                        {u.approvalStatus !== 'approved' && (
                          <button
                            onClick={() => updateUserStatus(u.id, 'approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {u.approvalStatus !== 'suspended' && (
                          <button
                            onClick={() => updateUserStatus(u.id, 'suspended')}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-rose-50 hover:text-rose-700 text-neutral-600 rounded text-[11px] font-medium transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Security Audit Logs */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              {language === 'bn' ? 'সিস্টেম নিরাপত্তা ও অডিট ট্রেইল' : 'System Security & Biosecurity Audit Trail'}
            </h3>
            <p className="text-xs text-neutral-500">
              Immutable ledger of all postings, veterinary validations, QR verifications, and user state transitions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            <select
              value={selectedEntityFilter}
              onChange={e => setSelectedEntityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 focus:outline-hidden"
            >
              <option value="all">All Entities</option>
              <option value="food_post">Food Posts</option>
              <option value="match">Matches</option>
              <option value="pickup">QR Pickups</option>
              <option value="transaction">Transactions</option>
              <option value="guideline">Nutrition Policy</option>
              <option value="user">User Auth</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs text-left text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] sticky top-0 border-b border-neutral-100">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                <th className="py-2.5 px-4 font-semibold">Actor & Role</th>
                <th className="py-2.5 px-4 font-semibold">Action</th>
                <th className="py-2.5 px-4 font-semibold">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredAuditLogs.map(log => (
                <tr key={log.id} className="hover:bg-neutral-50/50">
                  <td className="py-3 px-4 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-neutral-900 block">{log.userName}</span>
                    <span className="text-[10px] text-neutral-400 uppercase font-mono">{log.userRole}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono text-[11px] font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-700 leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
