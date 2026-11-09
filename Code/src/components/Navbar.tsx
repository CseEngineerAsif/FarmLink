import React, { useState } from 'react';
import { useFarmLink } from '../lib/store';
import { UserRole } from '../types';
import { Sprout, Bell, Globe, Database, UserCheck, Shield, Building, Tractor, ChevronDown } from 'lucide-react';
import { AVATAR_HALL_ADMIN_URL, AVATAR_FARM_OWNER_URL } from '../lib/constants';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenFirebase: () => void;
  onOpenGuidelines: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenFirebase,
  onOpenGuidelines,
  onOpenNotifications
}) => {
  const { currentUser, language, setLanguage, userNotifications, markNotificationAsRead, t } = useFarmLink();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#dashboard"
              onClick={e => { e.preventDefault(); setActiveTab('dashboard'); }}
              className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-neutral-900">Farm<span className="text-emerald-600">Link</span></span>
            </a>
          </div>

          {/* Zone 2: 4-5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'dashboard'
                  ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                  : 'hover:text-neutral-900'
              }`}
            >
              {currentUser?.role === 'hall_admin'
                ? (language === 'bn' ? 'হল প্রশাসন' : 'Hall Portal')
                : currentUser?.role === 'farm_owner'
                ? (language === 'bn' ? 'খামার ড্যাশবোর্ড' : 'Farm Portal')
                : (language === 'bn' ? 'ওভারভিউ' : 'Overview')}
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'posts'
                  ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                  : 'hover:text-neutral-900'
              }`}
            >
              {language === 'bn' ? 'উদ্বৃত্ত খাদ্য' : 'Surplus Posts'}
            </button>

            <button
              onClick={() => setActiveTab('logistics')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'logistics'
                  ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                  : 'hover:text-neutral-900'
              }`}
            >
              {language === 'bn' ? 'ম্যাচ ও পরিবহন' : 'Matching & Logistics'}
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'transactions'
                  ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                  : 'hover:text-neutral-900'
              }`}
            >
              {language === 'bn' ? 'বিনিময় লেজার' : 'Exchange Ledger'}
            </button>

            <button
              onClick={onOpenGuidelines}
              className="whitespace-nowrap shrink-0 transition-colors py-1 text-neutral-600 hover:text-neutral-900"
            >
              {language === 'bn' ? 'পুষ্টি ও নিরাপত্তা' : 'Safety Rules'}
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action & Profile Area */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => onOpenNotifications()}
                className="relative p-1.5 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
                title="Open Notification Center"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Toggle Language / ভাষা পরিবর্তন"
            >
              <Globe className="w-3.5 h-3.5 text-neutral-500" />
              <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Cloud Config Status */}
            <button
              onClick={onOpenFirebase}
              className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
              title="Firebase & Cloud Persistence Settings"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* User Account / Role switcher button with photo avatar */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 text-xs font-medium text-neutral-800 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-2xs"
            >
              {currentUser?.role === 'hall_admin' ? (
                <img
                  src={AVATAR_HALL_ADMIN_URL}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-lg object-cover border border-blue-200"
                  referrerPolicy="no-referrer"
                />
              ) : currentUser?.role === 'farm_owner' ? (
                <img
                  src={AVATAR_FARM_OWNER_URL}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-lg object-cover border border-emerald-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                  SA
                </div>
              )}
              <div className="text-left leading-tight hidden sm:block">
                <span className="font-semibold block text-[11px] text-neutral-900">{currentUser?.name.split(' ')[0] || 'Sign In'}</span>
                <span className="text-[10px] text-neutral-500 font-normal">
                  {currentUser?.role === 'hall_admin' ? 'Hall Admin' : currentUser?.role === 'farm_owner' ? 'Farm Owner' : 'Super Admin'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
