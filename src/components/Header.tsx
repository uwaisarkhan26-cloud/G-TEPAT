import React, { useState } from 'react';
import { Calendar, Users, Printer, Shield, UserCheck, GraduationCap, ChevronDown, Check, Menu, Image as ImageIcon, RefreshCw, RotateCcw, Camera } from 'lucide-react';
import { SessionData, User } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { SchoolLogo } from './SchoolLogo';

interface HeaderProps {
  title: string;
  session: SessionData;
  onOpenTestAccounts: () => void;
  onOpenLogoManager?: () => void;
  onOpenPrintReport?: () => void;
  onOpenLiveMonitoring?: () => void;
  onOpenScanner?: () => void;
  onOpenResetModal?: () => void;
  onSwitchUser?: (email: string) => void;
  onToggleMobileMenu?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  session,
  onOpenTestAccounts,
  onOpenLogoManager,
  onOpenPrintReport,
  onOpenLiveMonitoring,
  onOpenScanner,
  onOpenResetModal,
  onSwitchUser,
  onToggleMobileMenu,
  onRefresh,
  isRefreshing = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const formattedDate = new Date().toLocaleDateString('ms-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          bg: 'bg-purple-100 text-purple-900 border-purple-200',
          icon: Shield,
          label: 'ADMIN / GB'
        };
      case 'pentadbir':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-200',
          icon: UserCheck,
          label: 'PK PENTADBIRAN'
        };
      case 'penyelaras':
        return {
          bg: 'bg-teal-100 text-teal-900 border-teal-200',
          icon: Shield,
          label: 'PENYELARAS G-TEPAT'
        };
      default:
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          icon: GraduationCap,
          label: 'GURU PdP'
        };
    }
  };

  const badge = getRoleBadge(session.role);
  const BadgeIcon = badge.icon;

  return (
    <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm no-print gap-2">
      <div className="flex items-center gap-2.5">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition active:scale-95 border border-slate-200 flex items-center justify-center"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        )}
        <div className="w-8 h-9 rounded-xl bg-slate-900/80 p-0.5 flex-shrink-0 md:hidden flex items-center justify-center">
          <SchoolLogo className="w-full h-full object-contain" />
        </div>
        <div>
          <h2 className="text-sm sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight line-clamp-1">{title}</h2>
          <span className={`inline-flex sm:hidden items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-black uppercase border ${badge.bg}`}>
            <BadgeIcon className="w-2.5 h-2.5" />
            <span>{badge.label}</span>
          </span>
        </div>
        <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${badge.bg}`}>
          <BadgeIcon className="w-3 h-3" />
          <span>{badge.label}</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* User Identity Display */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-2 sm:px-3 py-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center gap-2 border border-slate-200 shadow-sm"
            title="Profil Pengguna & Tetapan Akaun"
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black text-white shadow-sm ${
              session.role === 'admin' ? 'bg-purple-600' :
              session.role === 'pentadbir' ? 'bg-amber-600' :
              session.role === 'penyelaras' ? 'bg-teal-600' :
              'bg-emerald-600'
            }`}>
              {session.nama.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-slate-900 font-extrabold text-[11px] truncate max-w-[130px] md:max-w-[180px]">
                {session.nama}
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                {session.email}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 z-50 animate-fade-in text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                  <div className="font-extrabold text-slate-900 text-xs">{session.nama}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{session.email}</div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${badge.bg}`}>
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenTestAccounts();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-2 transition"
                  >
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Senarai Akaun DELIMa KPM</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Imbas QR Masuk Kelas Direct Button */}
        {onOpenScanner && (
          <button
            id="btn-header-scan-qr"
            onClick={onOpenScanner}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-gold-400 hover:bg-gold-500 text-slate-950 border border-gold-500 text-xs font-black transition flex items-center gap-1.5 active:scale-95 shadow-md shadow-gold-500/20 cursor-pointer"
            title="Buka Pengimbas Kod QR Pintu Kelas untuk Masuk Kelas"
          >
            <Camera className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">Imbas QR Kelas</span>
            <span className="sm:hidden text-[11px]">Imbas QR</span>
          </button>
        )}

        {/* Live Monitoring Shortcut - Activated for all users */}
        {onOpenLiveMonitoring && (
          <button
            id="btn-header-live-monitoring"
            onClick={onOpenLiveMonitoring}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-black transition flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
            title="Buka Panel Pemantauan Masa Nyata (Live Radar PdP)"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Monitoring Live</span>
            <span className="sm:hidden text-[11px]">Live</span>
          </button>
        )}

        {/* Segar Semula Data Button */}
        {onRefresh && (
          <button
            id="btn-header-segar-semula"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 shadow-sm border ${
              isRefreshing
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border-slate-200 hover:border-emerald-300 active:scale-95'
            }`}
            title="Segar Semula Data & Selaraskan dengan Pelayan Awan"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Menyegerakkan...' : 'Segar Semula'}</span>
          </button>
        )}

        {/* Butang Reset Semula */}
        {onOpenResetModal && (
          <button
            id="btn-header-reset-semula"
            onClick={onOpenResetModal}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black transition flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
            title="Pusat Kawalan Reset Semula Sistem G-TEPAT (Jadual, Rekod Kehadiran, Kata Laluan)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Reset Semula</span>
            <span className="sm:hidden text-[11px]">Reset</span>
          </button>
        )}

        {onOpenLogoManager && (
          <button
            onClick={onOpenLogoManager}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition flex items-center gap-1.5"
            title="Pengurusan & Muat Naik Logo Sekolah"
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xl:inline">Logo Sekolah</span>
          </button>
        )}

        {onOpenPrintReport && (
          <button
            onClick={onOpenPrintReport}
            className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-gold-400" />
            <span className="hidden sm:inline">Cetak Laporan</span>
            <span className="sm:hidden">Cetak</span>
          </button>
        )}

        <span className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-kepawa-600" />
          {formattedDate}
        </span>
      </div>
    </header>
  );
};
