import React, { useState } from 'react';
import { Download, Smartphone, X, Share, MoreVertical, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PwaInstallBannerProps {
  compact?: boolean;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled || isDismissed) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#240509] text-[11px] font-black border border-amber-200 transition flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
          title="Pasang Aplikasi ke Skrin Utama Telefon Bimbit (PWA)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Pasang ke Skrin Utama</span>
        </button>
      ) : (
        <div className="no-print bg-gradient-to-r from-[#430b15] via-[#34070f] to-[#200409] text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.12)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[#240509] flex items-center justify-center shrink-0 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-[#240509] font-black text-[10px] uppercase">
                  AKSES PANTAS SKRIN UTAMA
                </span>
                <h4 className="font-black text-xs sm:text-sm text-white">
                  Pasang G-TEPAT sebagai Aplikasi Telefon
                </h4>
              </div>
              <p className="text-[11px] text-amber-100/80 mt-0.5">
                Buka terus dari ikon skrin utama telefon &amp; kekal berfungsi walaupun sambungan internet lemah/tiada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#240509] font-black rounded-xl text-xs shadow-lg border border-amber-200 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isInstallable ? 'Pasang Sekarang' : 'Tambah ke Skrin Utama'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-2 text-amber-200/70 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              title="Tutup banner ini"
              aria-label="Tutup banner pemasangan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Visual Guide Modal for iOS Safari / Android browsers (replaces window.alert) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#240509] border-2 border-amber-400/60 rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[#240509] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-300 uppercase">
                    Tambah Ikon ke Skrin Utama Telefon
                  </h3>
                  <p className="text-[11px] text-amber-100/75">
                    Akses pantas 1-sentuhan seperti aplikasi mudah alih
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl bg-[#3a0a12] text-amber-200 hover:text-white transition cursor-pointer"
                aria-label="Tutup panduan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 bg-[#1a0307] p-4 rounded-2xl border border-amber-500/30 text-xs">
                <div className="font-black text-amber-300 uppercase">Panduan iPhone / iPad (Safari):</div>
                <ol className="space-y-2 text-amber-100/90 list-decimal list-inside leading-relaxed">
                  <li>
                    Tekan ikon <strong className="text-white inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline text-amber-400" /> Kongsi (Share)</strong> di bahagian bawah pelayar Safari.
                  </li>
                  <li>
                    Skrol ke bawah dan pilih <strong className="text-amber-300">&ldquo;Add to Home Screen&rdquo;</strong> (Tambah ke Skrin Utama).
                  </li>
                  <li>
                    Tekan <strong className="text-white">&ldquo;Add&rdquo;</strong> di penjuru kanan atas. Ikon <strong className="text-amber-300">G-TEPAT</strong> akan muncul di skrin telefon anda!
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 bg-[#1a0307] p-4 rounded-2xl border border-amber-500/30 text-xs">
                <div className="font-black text-amber-300 uppercase">Panduan Telefon Android (Chrome / Edge):</div>
                <ol className="space-y-2 text-amber-100/90 list-decimal list-inside leading-relaxed">
                  <li>
                    Buka pautan rasmi <strong className="text-amber-300">https://g-tepat.netlify.app</strong> di pelayar Chrome telefon anda.
                  </li>
                  <li>
                    Tekan menu <strong className="text-white inline-flex items-center gap-1"><MoreVertical className="w-3.5 h-3.5 inline text-amber-400" /> 3 Titik</strong> di penjuru kanan atas pelayar.
                  </li>
                  <li>
                    Pilih <strong className="text-amber-300">&ldquo;Install app&rdquo;</strong> atau <strong className="text-amber-300">&ldquo;Add to Home screen&rdquo;</strong> (Tambah ke skrin utama).
                  </li>
                </ol>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Setelah dipasang, aplikasi boleh dibuka terus tanpa bar alamat pelayar dan menyokong mod luar talian.</span>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-[#240509] font-black text-xs cursor-pointer"
            >
              Faham &amp; Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
