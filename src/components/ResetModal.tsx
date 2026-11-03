import React, { useState } from 'react';
import { 
  RotateCcw, 
  Trash2, 
  Key, 
  Calendar, 
  School, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  RefreshCw,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { StorageService } from '../services/storageService';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
  onShowToast
}) => {
  const [selectedOption, setSelectedOption] = useState<'attendance' | 'timetable' | 'passwords' | 'full' | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleResetAttendance = async () => {
    setIsProcessing(true);
    try {
      StorageService.cleanTestData();
      onShowToast('Semua rekod kehadiran PdP berjaya di-reset semula (dibersihkan)!', 'success');
      onRefresh();
      handleClose();
    } catch {
      onShowToast('Ralat semasa membersihkan rekod kehadiran.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetTimetableAndClasses = () => {
    setIsProcessing(true);
    try {
      StorageService.resetTimetableAndClasses();
      onShowToast('Jadual Waktu Induk dan Senarai Kelas rasmi 2026 berjaya dimuat semula!', 'success');
      onRefresh();
      handleClose();
    } catch {
      onShowToast('Ralat semasa menetapkan semula jadual waktu.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAllPasswords = () => {
    setIsProcessing(true);
    try {
      StorageService.resetAllPasswordsToDefault();
      onShowToast('Semua kata laluan akaun guru & pentadbir telah di-reset kepada "Guru#2026!"', 'success');
      onRefresh();
      handleClose();
    } catch {
      onShowToast('Ralat semasa menetapkan semula kata laluan.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFullFactoryReset = async () => {
    if (confirmText.trim().toUpperCase() !== 'RESET') {
      onShowToast('Sila taip perkataan "RESET" untuk mengesahkan tindakan ini.', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      StorageService.resetAllToOfficial();
      onShowToast('Sistem G-TEPAT telah di-reset semula sepenuhnya kepada konfigurasi asal rasmi 2026!', 'success');
      onRefresh();
      handleClose();
    } catch {
      onShowToast('Ralat semasa tetapan semula penuh sistem.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedOption(null);
    setConfirmText('');
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-rose-50/30 to-amber-50/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <RotateCcw className="w-6 h-6 animate-spin-reverse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Pusat Kawalan Reset Semula
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                  G-TEPAT 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih modul data yang ingin di-reset semula kepada konfigurasi asal.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-grow text-xs">
          {/* Option 1: Reset Attendance */}
          <div 
            onClick={() => setSelectedOption('attendance')}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
              selectedOption === 'attendance'
                ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-400/20 shadow-sm'
                : 'bg-white border-slate-200 hover:border-rose-300 hover:bg-slate-50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-xs sm:text-sm">
                  1. Reset Semula Rekod Kehadiran PdP
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 uppercase">
                  Pembersihan Data
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Padam semua log imbasan kehadiran (data percubaan/simulasi) untuk memulakan rekod kehadiran sebenar guru di SK Kepawa.
              </p>
              {selectedOption === 'attendance' && (
                <div className="mt-3 pt-3 border-t border-rose-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-rose-900 font-bold">
                    Sedia untuk membersihkan semua rekod kehadiran?
                  </span>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetAttendance();
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sahkan Reset Kehadiran</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Option 2: Reset Timetable & Classes */}
          <div 
            onClick={() => setSelectedOption('timetable')}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
              selectedOption === 'timetable'
                ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-slate-50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-xs sm:text-sm">
                  2. Reset Semula Jadual Waktu & Senarai Kelas
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 uppercase">
                  Takwim 2026
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Pulihkan jadual waktu induk rasmi SK Kepawa (slot bermula 7:00 pagi) dan senarai 7 bilik darjah kepada tetapan asal.
              </p>
              {selectedOption === 'timetable' && (
                <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-amber-900 font-bold">
                    Pulihkan jadual induk & kelas asal 2026?
                  </span>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetTimetableAndClasses();
                    }}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Sahkan Reset Jadual</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Option 3: Reset All Passwords to Default */}
          <div 
            onClick={() => setSelectedOption('passwords')}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
              selectedOption === 'passwords'
                ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20 shadow-sm'
                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-xs sm:text-sm">
                  3. Reset Semula Kata Laluan Semua Akaun
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 uppercase">
                  DELIMa KPM
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Tetapkan semula kata laluan semua 12 akaun guru dan pentadbir kepada kata laluan piawai rasmi: <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-800">Guru#2026!</code>
              </p>
              {selectedOption === 'passwords' && (
                <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-blue-900 font-bold">
                    Kembalikan semua kata laluan ke lalai?
                  </span>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetAllPasswords();
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Sahkan Reset Kata Laluan</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Option 4: Full Factory Reset */}
          <div 
            onClick={() => setSelectedOption('full')}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
              selectedOption === 'full'
                ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-400/20 shadow-sm'
                : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-xs sm:text-sm">
                  4. Reset Semula Penuh Sistem (Pulih Asal Lengkap)
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 uppercase">
                  Master Reset
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Tetapkan semula seluruh pangkalan data: pengguna, kelas, subjek, jadual waktu rasmi, kosongkan rekod kehadiran dan kembalikan tetapan piawai.
              </p>
              {selectedOption === 'full' && (
                <div className="mt-3 pt-3 border-t border-purple-200/60 space-y-2.5">
                  <p className="text-[11px] text-purple-950 font-medium">
                    Sila taip perkataan <span className="font-mono font-black text-rose-600 bg-white px-1.5 py-0.5 rounded border border-rose-200">RESET</span> di bawah untuk pengesahan:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder='Taip "RESET"'
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="p-2 border border-slate-300 rounded-xl font-black text-xs uppercase flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      disabled={isProcessing || confirmText.trim().toUpperCase() !== 'RESET'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFullFactoryReset();
                      }}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Sahkan Reset Penuh</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Sistem G-TEPAT SK Kepawa Beaufort © 2026
          </span>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
