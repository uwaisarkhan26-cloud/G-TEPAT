import React, { useState } from 'react';
import { Calendar, Users, Printer, Shield, UserCheck, GraduationCap, ChevronDown, Check, Menu, Image as ImageIcon, RefreshCw, RotateCcw, Camera, Share2 } from 'lucide-react';
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
  onOpenShareApp?: () => void;
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
  onOpenShareApp,
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

  const isAdminOrPk = session.role === 'admin' || session.role === 'pentadbir' || session.role === 'penyelaras';

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          bg: 'bg-amber-400/20 text-amber-300 border-amber-400/50',
          icon: Shield,
          label: 'ADMIN / GB'
        };
      case 'pentadbir':
        return {
          bg: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
          icon: UserCheck,
          label: 'PK PENTADBIRAN'
        };
      case 'penyelaras':
        return {
          bg: 'bg-[#4b0e18] text-amber-200 border-amber-500/40',
          icon: Shield,
          label: 'PENYELARAS G-TEPAT'
        };
      default:
        return {
          bg: 'bg-emerald-900/70 text-emerald-200 border-emerald-400/40',
          icon: GraduationCap,
          label: 'GURU PdP'
        };
    }
  };

  const badge = getRoleBadge(session.role);
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-30 shadow-lg no-print">
      {/* Slim Top Utility Strip matching Reference Screenshot */}
      <div className="hidden sm:flex items-center justify-between px-4 sm:px-6 py-1.5 bg-[#120204] border-b border-amber-500/25 text-[10px] text-amber-100/80">
        <div className="flex items-center gap-2">
          <span className="font-black text-amber-400 tracking-wider uppercase">SEKOLAH KEBANGSAAN KEPAWA</span>
          <span className="text-amber-500/50">&bull;</span>
          <span className="font-semibold text-amber-100">Sesi Persekolahan 2026</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span>
            Kod Sekolah: <strong className="text-amber-400 font-black">XBA6019</strong>
          </span>
          <span className="text-amber-500/50">&bull;</span>
          <span>
            Guru Besar: <strong className="text-white">Mohd. Zahari bin Tibin</strong>
          </span>
          <span className="hidden lg:inline text-amber-500/50">&bull;</span>
          <span className="hidden lg:inline">
            PKP: <strong className="text-white">Nurtitah binti Membuai</strong>
          </span>
        </div>
      </div>

      {/* Main Maroon & Gold Header */}
      <div className="bg-[#2b060c] border-b border-amber-500/35 px-3 sm:px-6 py-3 flex items-center justify-between gap-2 text-white">
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-300 transition active:scale-95 border border-amber-500/40 flex items-center justify-center"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="w-8 h-9 rounded-xl bg-[#1a0307] border border-amber-500/40 p-0.5 flex-shrink-0 md:hidden flex items-center justify-center">
            <SchoolLogo className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg lg:text-xl font-black text-white tracking-tight line-clamp-1">{title}</h2>
            <span className={`inline-flex sm:hidden items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-black uppercase border ${badge.bg}`}>
              <BadgeIcon className="w-2.5 h-2.5" />
              <span>{badge.label}</span>
            </span>
          </div>
          <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border shrink-0 ${badge.bg}`}>
            <BadgeIcon className="w-3 h-3" />
            <span>{badge.label}</span>
          </span>
          <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-400/40 shadow-xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SISTEM AKTIF</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* User Identity Display */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-2 sm:px-3 py-1.5 rounded-2xl bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-100 text-xs font-bold transition flex items-center gap-2 border border-amber-500/40 shadow-sm cursor-pointer"
              title="Profil Pengguna & Tetapan Akaun"
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black bg-gradient-to-tr from-amber-400 to-amber-500 text-[#240509] shadow-sm">
                {session.nama.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-white font-extrabold text-[11px] truncate max-w-[120px] md:max-w-[160px]">
                  {session.nama}
                </div>
                <div className="text-[9px] text-amber-300/80 font-mono">
                  {session.email}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-amber-300 ml-0.5" />
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-[#240509] rounded-3xl shadow-2xl border border-amber-400/50 p-3 z-50 animate-fade-in text-xs text-white">
                  <div className="p-3 bg-[#360810] rounded-2xl border border-amber-500/30 mb-2">
                    <div className="font-extrabold text-white text-xs">{session.nama}</div>
                    <div className="text-[11px] text-amber-200/80 font-mono mt-0.5">{session.email}</div>
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
                      className="w-full text-left px-3 py-2 rounded-xl text-amber-200 hover:bg-[#3a0a12] font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-amber-400" />
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
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#240509] border border-amber-200 text-xs font-black transition flex items-center gap-1.5 active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
              title="Buka Pengimbas Kod QR Pintu Kelas untuk Masuk Kelas"
            >
              <Camera className="w-3.5 h-3.5 text-[#240509]" />
              <span className="hidden sm:inline">Imbas QR Kelas</span>
              <span className="sm:hidden text-[11px]">Imbas QR</span>
            </button>
          )}

          {/* Live Monitoring Shortcut - Admin Only */}
          {isAdminOrPk && onOpenLiveMonitoring && (
            <button
              id="btn-header-live-monitoring"
              onClick={onOpenLiveMonitoring}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-300 border border-amber-500/45 text-xs font-black transition flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
              title="Buka Panel Pemantauan Masa Nyata (Live Radar PdP)"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="hidden sm:inline">Monitoring Live</span>
              <span className="sm:hidden text-[11px]">Live</span>
            </button>
          )}

          {/* Pautan Awam Telefon Guru */}
          {onOpenShareApp && (
            <button
              id="btn-header-share-app"
              onClick={onOpenShareApp}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-400/50 text-xs font-black transition flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
              title="Dapatkan Pautan Awam untuk Telefon Guru (Elak Ralat 403 AI Studio)"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">Pautan Guru</span>
              <span className="sm:hidden text-[11px]">Pautan</span>
            </button>
          )}

          {/* Segar Semula Data Button */}
          {onRefresh && (
            <button
              id="btn-header-segar-semula"
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 shadow-sm border cursor-pointer ${
                isRefreshing
                  ? 'bg-amber-400/20 text-amber-200 border-amber-400/50'
                  : 'bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-200 border-amber-500/40 active:scale-95'
              }`}
              title="Segar Semula Data & Selaraskan dengan Pelayan Awan"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline">{isRefreshing ? 'Menyegerakkan...' : 'Segar Semula'}</span>
            </button>
          )}

          {/* Butang Reset Semula - Admin Only */}
          {isAdminOrPk && onOpenResetModal && (
            <button
              id="btn-header-reset-semula"
              onClick={onOpenResetModal}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-300 border border-amber-500/40 text-xs font-black transition flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
              title="Pusat Kawalan Reset Semula Sistem G-TEPAT (Jadual, Rekod Kehadiran, Kata Laluan)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Reset Semula</span>
            </button>
          )}

          {/* Butang Logo Sekolah - Admin Only */}
          {isAdminOrPk && onOpenLogoManager && (
            <button
              onClick={onOpenLogoManager}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-200 border border-amber-500/35 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Pengurusan & Muat Naik Logo Sekolah"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden 2xl:inline">Logo</span>
            </button>
          )}

          {/* Butang Cetak Laporan - Admin Only */}
          {isAdminOrPk && onOpenPrintReport && (
            <button
              onClick={onOpenPrintReport}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#240509] border border-amber-200 text-xs font-black shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#240509]" />
              <span className="hidden sm:inline">Cetak Laporan</span>
              <span className="sm:hidden">Cetak</span>
            </button>
          )}

          <span className="hidden 2xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1a0307] border border-amber-500/35 text-xs font-bold text-amber-200">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            {formattedDate}
          </span>
        </div>
      </div>
    </header>
  );
};
