/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FarmLinkProvider, useFarmLink } from './lib/store';
import { Navbar } from './components/Navbar';
import { HallAdminDashboard } from './components/HallAdminDashboard';
import { FarmOwnerDashboard } from './components/FarmOwnerDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { SurplusPostsView } from './components/SurplusPostsView';
import { LogisticsView } from './components/LogisticsView';
import { ExchangeLedgerView } from './components/ExchangeLedgerView';
import { QRScannerModal } from './components/QRScannerModal';
import { AuthModal } from './components/AuthModal';
import { FirebaseStatusModal } from './components/FirebaseStatusModal';
import { NutritionGuidelinesModal } from './components/NutritionGuidelinesModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { NotificationToastBanner } from './components/NotificationToastBanner';
import { FoodPost, Match } from './types';
import { ShieldCheck, Sprout, Heart, Building, Tractor } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, language, t } = useFarmLink();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'logistics' | 'transactions'>('dashboard');

  // Google Maps Quota state
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  React.useEffect(() => {
    const handleQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFirebaseOpen, setIsFirebaseOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState(false);

  // QR Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalMode, setQrModalMode] = useState<'display' | 'scan'>('display');
  const [selectedPostForQR, setSelectedPostForQR] = useState<FoodPost | null>(null);

  const handleOpenDisplayQR = (post: FoodPost) => {
    setSelectedPostForQR(post);
    setQrModalMode('display');
    setQrModalOpen(true);
  };

  const handleOpenScanner = () => {
    setSelectedPostForQR(null);
    setQrModalMode('scan');
    setQrModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
      {/* Real-time Floating Notification Banner for instant alerts */}
      <NotificationToastBanner
        onOpenNotificationCenter={() => setIsNotifCenterOpen(true)}
        onNavigateToPosts={() => setActiveTab('posts')}
      />

      {/* Quota Exceeded Banner */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenFirebase={() => setIsFirebaseOpen(true)}
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        onOpenNotifications={() => setIsNotifCenterOpen(true)}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div>
            {currentUser?.role === 'hall_admin' && (
              <HallAdminDashboard onOpenQR={handleOpenDisplayQR} />
            )}
            {currentUser?.role === 'farm_owner' && (
              <FarmOwnerDashboard
                onOpenScanner={handleOpenScanner}
                onOpenSettlement={() => setActiveTab('transactions')}
                onOpenNotificationCenter={() => setIsNotifCenterOpen(true)}
              />
            )}
            {currentUser?.role === 'super_admin' && (
              <SuperAdminDashboard />
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <SurplusPostsView onOpenQR={handleOpenDisplayQR} />
        )}

        {activeTab === 'logistics' && (
          <LogisticsView
            onOpenScanner={handleOpenScanner}
            onOpenQR={handleOpenDisplayQR}
          />
        )}

        {activeTab === 'transactions' && (
          <ExchangeLedgerView />
        )}
      </main>

      {/* Modals */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        mode={qrModalMode}
        post={selectedPostForQR}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <FirebaseStatusModal
        isOpen={isFirebaseOpen}
        onClose={() => setIsFirebaseOpen(false)}
      />

      <NutritionGuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />

      <NotificationCenterModal
        isOpen={isNotifCenterOpen}
        onClose={() => setIsNotifCenterOpen(false)}
        onNavigateToPosts={() => setActiveTab('posts')}
        onNavigateToLogistics={() => setActiveTab('logistics')}
        onNavigateToLedger={() => setActiveTab('transactions')}
      />

      {/* Clean Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
              FL
            </div>
            <span className="font-semibold text-neutral-800">FarmLink Saidpur</span>
            <span className="text-neutral-300">·</span>
            <span>BAUST CSE 3102 Sessional Project</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-500">
            <span>Saidpur, Nilphamari, Bangladesh</span>
            <span className="text-neutral-300">·</span>
            <button
              onClick={() => setIsGuidelinesOpen(true)}
              className="hover:text-neutral-900 transition-colors"
            >
              BLRI Veterinary Standards
            </button>
            <span className="text-neutral-300">·</span>
            <button
              onClick={() => setIsFirebaseOpen(true)}
              className="hover:text-neutral-900 transition-colors"
            >
              Firestore Security
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <FarmLinkProvider>
      <MainAppContent />
    </FarmLinkProvider>
  );
}
