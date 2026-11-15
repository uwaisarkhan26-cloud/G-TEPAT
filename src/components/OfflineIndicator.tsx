import React from 'react';
import { WifiOff, CloudUpload } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, pendingCount } = useOnlineStatus();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="no-print fixed bottom-20 md:bottom-6 left-3 sm:left-6 z-40 max-w-xs sm:max-w-sm animate-fade-in">
      {!isOnline ? (
        <div className="flex items-center gap-2.5 rounded-2xl bg-[#2b060c]/95 backdrop-blur-md border-2 border-amber-400/70 px-3.5 py-2 text-xs font-bold text-amber-100 shadow-2xl shadow-black/50">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <div>
            <div className="text-[11px] font-black text-amber-300 uppercase">
              Mod Luar Talian (Tiada Internet)
            </div>
            <div className="text-[10px] text-amber-100/80">
              Data disimpan selamat di telefon
              {pendingCount > 0 ? ` (${pendingCount} rekod menunggu selaras)` : ''}.
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-2xl bg-[#2b060c]/95 backdrop-blur-md border border-amber-400/60 px-3.5 py-2 text-xs font-bold text-amber-100 shadow-xl">
          <CloudUpload className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
          <span className="text-[11px]">
            Menunggu penyegerakan awan ({pendingCount} rekod tempatan)
          </span>
        </div>
      )}
    </div>
  );
};
