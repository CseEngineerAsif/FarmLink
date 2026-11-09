import React, { useState } from 'react';
import { useFarmLink } from '../lib/store';
import { UserRole } from '../types';
import { INITIAL_USERS, AVATAR_HALL_ADMIN_URL, AVATAR_FARM_OWNER_URL } from '../lib/constants';
import { LogIn, UserPlus, KeyRound, Check, X, Shield, Building, Tractor, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginAsUser, registerUser, currentUser, users, halls, farms, language, t } = useFarmLink();
  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('hall_admin');
  const [selectedHallId, setSelectedHallId] = useState(halls[0]?.id || 'hall_01');
  const [farmName, setFarmName] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !phone) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    const created = registerUser({
      name,
      email,
      phone,
      role,
      hallId: role === 'hall_admin' ? selectedHallId : undefined,
      institution: role === 'hall_admin' ? 'BAUST' : farmName || 'Registered Farm'
    });

    setSuccessMsg(`Account created for ${created.name}! Role: ${role}. Pending Super Admin approval.`);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your account email address');
      return;
    }
    setResetSent(true);
    setSuccessMsg(`Password reset instructions and verification code sent to ${email}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-neutral-900">
            {tab === 'login' ? 'FarmLink Authentication' : tab === 'register' ? 'Create a FarmLink Account' : 'Reset Password'}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Connecting university residential halls with local livestock agriculture
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-neutral-100 rounded-xl mb-5">
          <button
            onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'login' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'register' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => { setTab('reset'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'reset' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Password Reset
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {tab === 'login' && (
          <div className="space-y-4">
            {/* Quick Demo Stakeholder Switcher (Essential for testing all surveyed roles easily) */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider block mb-2">
                1-Click Stakeholder Switcher (Field Survey Profiles)
              </span>
              <div className="space-y-1.5">
                {INITIAL_USERS.map(u => {
                  const isActive = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        loginAsUser(u.id);
                        onClose();
                      }}
                      className={`w-full text-left p-2 rounded-lg border transition-all text-xs flex items-center justify-between ${
                        isActive
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                          : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {u.id === 'user_admin_01' ? (
                          <img
                            src={AVATAR_HALL_ADMIN_URL}
                            alt={u.name}
                            className="w-8 h-8 rounded-lg object-cover border border-blue-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : u.id === 'user_farm_01' ? (
                          <img
                            src={AVATAR_FARM_OWNER_URL}
                            alt={u.name}
                            className="w-8 h-8 rounded-lg object-cover border border-emerald-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : u.role === 'hall_admin' ? (
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <Building className="w-4 h-4" />
                          </div>
                        ) : u.role === 'farm_owner' ? (
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Tractor className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold text-xs">
                            SA
                          </div>
                        )}
                        <div>
                          <div className="leading-tight font-semibold text-neutral-900">{u.name}</div>
                          <div className="text-[10px] text-neutral-500 font-normal">
                            {u.role === 'hall_admin' ? 'Hall Admin' : u.role === 'farm_owner' ? 'Farm Owner' : 'Super Admin'} · {u.institution}
                          </div>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Standard Email Login */}
            <form
              onSubmit={e => {
                e.preventDefault();
                const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
                if (found) {
                  loginAsUser(found.id);
                  onClose();
                } else {
                  setErrorMsg('User email not registered. Please choose from the profiles above or register a new account.');
                }
              }}
              className="space-y-3 pt-1"
            >
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. jahangir.alam@baust.edu.bd"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-xl transition-colors"
              >
                Sign In with Credentials
              </button>
            </form>
          </div>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('hall_admin')}
                  className={`p-2.5 text-xs font-medium rounded-lg border flex items-center gap-2 justify-center transition-all ${
                    role === 'hall_admin'
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                      : 'bg-white border-neutral-200 text-neutral-600'
                  }`}
                >
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Hall Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('farm_owner')}
                  className={`p-2.5 text-xs font-medium rounded-lg border flex items-center gap-2 justify-center transition-all ${
                    role === 'farm_owner'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                      : 'bg-white border-neutral-200 text-neutral-600'
                  }`}
                >
                  <Tractor className="w-4 h-4 text-emerald-600" />
                  <span>Farm Owner</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Md. Tariqul Islam"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. tariqul@baust.edu.bd"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number (SMS Notifications)</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+880 1700-000000"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {role === 'hall_admin' ? (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Select University Hall</label>
                <select
                  value={selectedHallId}
                  onChange={e => setSelectedHallId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {halls.map(h => (
                    <option key={h.id} value={h.id}>{h.hallName} ({h.location})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Farm Name & Location</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={e => setFarmName(e.target.value)}
                  placeholder="e.g. Green Valley Dairy Farm, Saidpur"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl transition-colors mt-2"
            >
              Submit Application
            </button>
            <p className="text-[11px] text-neutral-500 text-center">
              New accounts require authorization by Super Admin before surplus distribution access.
            </p>
          </form>
        )}

        {tab === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Registered Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. ziaul.dairy@gmail.com"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {resetSent && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                <span className="font-semibold text-neutral-900 block mb-1">Verification OTP code:</span>
                <code className="text-base font-mono font-bold text-emerald-700 bg-white px-2 py-1 rounded border border-neutral-200 inline-block">
                  849201
                </code>
                <p className="text-[11px] text-neutral-500 mt-2">
                  Enter this code on your mobile phone to complete password renewal.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-xl transition-colors"
            >
              Send Password Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
