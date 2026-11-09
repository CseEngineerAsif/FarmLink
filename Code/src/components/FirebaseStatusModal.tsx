import React, { useState } from 'react';
import { firebaseStatus } from '../lib/firebaseConfig';
import { useFarmLink } from '../lib/store';
import { Database, ShieldCheck, Check, Copy, ExternalLink, X, Terminal, Server, Key, AlertCircle } from 'lucide-react';

interface FirebaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseStatusModal: React.FC<FirebaseStatusModalProps> = ({ isOpen, onClose }) => {
  const { language } = useFarmLink();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const envSnippet = `# FarmLink Production Firebase Configuration
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="farmlink-baust.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="farmlink-baust"
VITE_FIREBASE_STORAGE_BUCKET="farmlink-baust.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="45167572403"
VITE_FIREBASE_APP_ID="1:45167572403:web:7ab92c..."
VITE_DEFAULT_HOLDING_HOURS=2.0`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              {language === 'bn' ? 'ফায়ারবেস ক্লাউড ও ডেটাবেস স্থিতি' : 'Firebase Cloud & Storage Architecture'}
            </h3>
            <p className="text-xs text-neutral-500">
              {language === 'bn' ? 'ক্লাউড ফায়ারস্টোর ও ভূমিকা-ভিত্তিক নিরাপত্তা নিরীক্ষা' : 'Cloud Firestore, Auth, and RBAC Security Rules'}
            </p>
          </div>
        </div>

        {/* Current Connection Status Box */}
        <div className={`p-4 rounded-xl border mb-5 ${
          firebaseStatus.isConfigured
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/70 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-start gap-3">
            {firebaseStatus.isConfigured ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-xs mb-1">
                {firebaseStatus.isConfigured
                  ? 'Cloud Firestore Live Synchronized'
                  : 'Operating in High-Fidelity Local Persistence Mode'}
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {firebaseStatus.isConfigured
                  ? `Connected to Firebase project: ${firebaseStatus.projectId}. All collections and real-time listeners are active.`
                  : 'FarmLink is currently operating with persistent client-side storage (localStorage / IndexedDB cache). All food surplus posts, real-time matching, QR scans, livestock records, and audit trails persist across browser refreshes.'}
              </p>
            </div>
          </div>
        </div>

        {/* Firestore Collections Schema */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-neutral-500" />
            <span>Implemented Cloud Firestore Collections</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { name: 'users', desc: 'RBAC profiles & approval status' },
              { name: 'halls', desc: 'BAUST residential halls & timings' },
              { name: 'farms', desc: 'Registered dairy & livestock farms' },
              { name: 'animals', desc: 'Livestock inventory & health status' },
              { name: 'food_posts', desc: 'Surplus food records & deadlines' },
              { name: 'matches', desc: 'Proximity & safety matched pairs' },
              { name: 'pickups', desc: 'QR timestamped collection logs' },
              { name: 'transactions', desc: 'Cash & dairy/egg/meat returns' },
              { name: 'nutrition_guidelines', desc: 'Expert safety limits & rules' },
              { name: 'audit_logs', desc: 'Immutable security audit trail' }
            ].map(col => (
              <div key={col.name} className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                <code className="font-mono text-neutral-900 font-bold block text-[11px] text-emerald-700">/{col.name}</code>
                <span className="text-[11px] text-neutral-500">{col.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Environment configuration instructions */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-neutral-500" />
              <span>Connecting to Production Firebase</span>
            </h4>
            <button
              onClick={copyEnv}
              className="flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy .env snippet'}</span>
            </button>
          </div>
          <div className="bg-neutral-900 text-neutral-100 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto border border-neutral-800">
            <pre>{envSnippet}</pre>
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            Add these keys to your environment secrets or <code className="text-neutral-700 bg-neutral-100 px-1 rounded">.env</code> file. The applet automatically detects them without rebuilding.
          </p>
        </div>

        {/* Security Rules Preview */}
        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-neutral-900 mb-1">
            <Terminal className="w-3.5 h-3.5 text-neutral-600" />
            <span>Pre-Configured Security Rules</span>
          </div>
          <p className="text-neutral-500 leading-relaxed mb-2">
            The rules in <code className="text-neutral-800 font-mono bg-white px-1.5 py-0.5 rounded border border-neutral-200">firestore.rules</code> enforce role-based access control (Hall Admin can only post for their registered hall; Farm Owner can only verify matches assigned to their farm; Super Admin has audit and approval authority).
          </p>
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
