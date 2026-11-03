import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (PWA installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instructions for iOS Safari or browsers without beforeinstallprompt
      alert('Untuk memasang G-TEPAT pada telefon anda:\n\n1. Tekan butang Kongsi (Share) atau menu 3 titik di pelayar anda.\n2. Pilih "Add to Home Screen" / "Tambah ke Skrin Utama".');
      return;
    }
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-kepawa-900 to-slate-900 text-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 animate-fade-in no-print">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase">
              PWA AKTIF
            </span>
            <h4 className="font-extrabold text-xs sm:text-sm text-white">
              Pasang Aplikasi G-TEPAT pada Telefon Pintar
            </h4>
          </div>
          <p className="text-[11px] text-emerald-200/80 mt-0.5">
            Akses pantas dari skrin utama telefon bimbit anda untuk imbasan kod QR bilik darjah tanpa perlu buka pelayar semula.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto justify-end">
        <button
          onClick={handleInstallClick}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center gap-1.5 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Pasang ke Telefon (PWA)</span>
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          title="Tutup banner ini"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
