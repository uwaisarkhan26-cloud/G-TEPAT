import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, Smartphone, AlertTriangle, X, ShieldCheck } from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real public URLs accessible by ANY teacher or phone without 403 error:
  const netlifyUrl = 'https://g-tepat.netlify.app';
  const sharedCloudUrl = 'https://ais-pre-cwnn3xytasqbyklkkggu42-316492458529.asia-southeast1.run.app';

  const handleCopy = (url: string, type: string) => {
    navigator.clipboard.writeText(url);
    setCopiedType(type);
    onShowToast(`Pautan ${type} berjaya disalin! Sedia dihantar ke WhatsApp guru.`, 'success');
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-slate-200 text-slate-800 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Pautan Rasmi Akses Guru & Telefon
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Pautan awam untuk kegunaan semua 13 Guru SK Kepawa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner about 403 AI Studio */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-black text-amber-900 uppercase">
              Peringatan: Elakkan Guna Pautan "aistudio.google.com"
            </div>
            <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
              Pautan <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono font-bold">aistudio.google.com</code> hanya untuk pembangun sistem. Telefon guru yang membuka pautan tersebut akan memaparkan ralat <strong>403 (You do not have access)</strong>.
            </p>
            <p className="text-[11px] font-bold text-amber-900 mt-1">
              Gunakan salah satu pautan rasmi di bawah yang dibuka untuk semua telefon:
            </p>
          </div>
        </div>

        {/* Primary Link 1: Netlify */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pautan Utama (Netlify)</span>
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
              Disyorkan
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={netlifyUrl}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleCopy(netlifyUrl, 'Netlify')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copiedType === 'Netlify' ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span>{copiedType === 'Netlify' ? 'Disalin' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Primary Link 2: Cloud Run Shared Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Pautan Sandaran (Awan Cloud Run)</span>
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
              Pilihan Kedua
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={sharedCloudUrl}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none truncate"
            />
            <button
              type="button"
              onClick={() => handleCopy(sharedCloudUrl, 'Awan')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copiedType === 'Awan' ? <Check className="w-4 h-4 text-blue-200" /> : <Copy className="w-4 h-4" />}
              <span>{copiedType === 'Awan' ? 'Disalin' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Action Button: WhatsApp Format */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              const msg = `*SISTEM KEHADIRAN G-TEPAT SK KEPAWA 2026*\n\nSila buka pautan rasmi di bawah pada pelayar telefon anda untuk imbasan kehadiran PdP bilik darjah:\n👉 ${netlifyUrl}\n\n*Log Masuk Guru:*\n- Gunakan ID DELIMa masing-masing (@moe-dl.edu.my)\n- Kata laluan sementara: XBA6019`;
              navigator.clipboard.writeText(msg);
              onShowToast('Mesej makluman WhatsApp berjaya disalin!', 'success');
            }}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Salin Mesej Lengkap Untuk WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
