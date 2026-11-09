import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useFarmLink } from '../lib/store';
import { FoodPost, Match } from '../types';
import { QrCode, CheckCircle2, AlertTriangle, X, Camera, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'display' | 'scan';
  post?: FoodPost | null;
  match?: Match | null;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  mode,
  post,
  match
}) => {
  const { verifyPickup, foodPosts, language, t } = useFarmLink();
  const [manualCode, setManualCode] = useState('');
  const [actualQuantity, setActualQuantity] = useState<number>(post?.quantityKg || 15);
  const [notes, setNotes] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  // Code payload to encode in the QR
  const qrPayload = post?.qrSecret || post?.id || 'FARMLINK_SAMPLE_SECRET';

  const handleVerify = (codeToVerify: string) => {
    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      const res = verifyPickup(codeToVerify.trim(), Number(actualQuantity) || 12, notes);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 400);
  };

  // Demo auto-fill active pending post codes
  const pendingPostsWithCodes = foodPosts.filter(p => p.status === 'open' || p.status === 'matched');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'display' ? (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {language === 'bn' ? 'সংগ্রহের নিরাপদ কিউআর কোড' : 'Surplus Collection Handover QR'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {post?.hallName} · {post?.quantityKg} kg
                </p>
              </div>
            </div>

            <div className="bg-neutral-50 p-6 rounded-2xl flex flex-col items-center justify-center border border-neutral-200/80 mb-5">
              <div className="p-3 bg-white rounded-xl shadow-xs border border-neutral-100">
                <QRCodeSVG
                  value={qrPayload}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="mt-4 text-center">
                <span className="text-[11px] font-mono font-medium text-neutral-500 uppercase tracking-wider block mb-1">
                  Verification Secret Code
                </span>
                <code className="text-xs font-mono font-bold text-neutral-900 bg-neutral-200/60 px-2.5 py-1 rounded">
                  {qrPayload}
                </code>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-800 space-y-1 mb-4">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>
                  {language === 'bn' ? 'যাচাইকরণ নির্দেশিকা' : 'Handover Verification Protocol'}
                </span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                {language === 'bn'
                  ? 'খামার মালিক বা সংগ্রাহক তার স্মার্টফোনে এই কোডটি স্ক্যান করলে ডিজিটাল সংগ্রহ নিশ্চিত হবে এবং স্বয়ংক্রিয়ভাবে বিনিময় লেনদেন লিপিবদ্ধ হবে।'
                  : 'Present this QR code to the arriving farm representative. Scanning registers an immutable timestamped pickup and initiates the agreed return ledger.'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-xl transition-colors"
            >
              {language === 'bn' ? 'সম্পন্ন' : 'Done'}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {language === 'bn' ? 'পিকআপ কিউআর স্ক্যান করুন' : 'Scan & Verify Pickup'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {language === 'bn' ? 'হলে উপস্থিত হয়ে কোড যাচাই করুন' : 'On-site digital transfer verification'}
                </p>
              </div>
            </div>

            {verificationResult ? (
              <div
                className={`p-5 rounded-2xl border mb-5 ${
                  verificationResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
                  {verificationResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  )}
                  <span>
                    {verificationResult.success
                      ? language === 'bn' ? 'পিকআপ সফলভাবে যাচাইকৃত!' : 'Pickup Verified Successfully!'
                      : language === 'bn' ? 'যাচাইকরণ ব্যর্থ হয়েছে' : 'Verification Rejected'}
                  </span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed mb-4">{verificationResult.message}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setVerificationResult(null);
                      setManualCode('');
                    }}
                    className="flex-1 py-2 px-3 bg-white text-xs font-medium rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-800 transition-colors"
                  >
                    {language === 'bn' ? 'আরেকটি স্ক্যান করুন' : 'Scan Another'}
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 px-3 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Simulated Camera Viewfinder */}
                <div className="relative w-full h-44 bg-neutral-900 rounded-xl overflow-hidden flex flex-col items-center justify-center text-white border border-neutral-800">
                  <div className="w-32 h-32 border-2 border-dashed border-emerald-400/80 rounded-lg flex items-center justify-center relative">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 animate-bounce" />
                    <QrCode className="w-10 h-10 text-neutral-500/80" />
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-2">
                    {language === 'bn' ? 'ক্যামেরা ফ্রেমের মধ্যে কিউআর রাখুন' : 'Align QR code within frame'}
                  </span>
                </div>

                {/* Quick 1-Click Test Scans from current posts */}
                {pendingPostsWithCodes.length > 0 && (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    <span className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider block mb-2">
                      {language === 'bn' ? 'দ্রুত টেস্ট কিউআর কোড' : 'Active Handover Batches Available'}
                    </span>
                    <div className="space-y-1.5">
                      {pendingPostsWithCodes.slice(0, 2).map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setManualCode(p.qrSecret || p.id);
                            setActualQuantity(p.quantityKg);
                          }}
                          className="w-full text-left p-2 rounded-lg bg-white border border-neutral-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-medium text-neutral-900">{p.hallName}</span>
                            <span className="text-neutral-500 text-[11px] ml-2">({p.quantityKg} kg)</span>
                          </div>
                          <code className="text-[10px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded">
                            {p.qrSecret?.substring(0, 15)}...
                          </code>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Code Input & Actual Quantity Confirmation */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {language === 'bn' ? 'যাচাইকরণ কিউআর সিক্রেট কোড' : 'Verification Code / QR Payload'}
                    </label>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={e => setManualCode(e.target.value)}
                      placeholder="e.g. FARMLINK_PK_POST01_A8723B"
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        {language === 'bn' ? 'প্রকৃত ওজন (কেজি)' : 'Weighed Quantity (kg)'}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        value={actualQuantity}
                        onChange={e => setActualQuantity(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        {language === 'bn' ? 'গুণমান পর্যবেক্ষণ' : 'Bio-Check'}
                      </label>
                      <div className="px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Passes Odor/Mold</span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={!manualCode.trim() || isVerifying}
                    onClick={() => handleVerify(manualCode)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validating with Ledger...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          {language === 'bn' ? 'পিকআপ নিশ্চিত করুন' : 'Confirm & Log Collection'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
