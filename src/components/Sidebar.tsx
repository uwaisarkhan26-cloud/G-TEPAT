import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  School, 
  BookOpen, 
  CalendarDays, 
  Camera, 
  QrCode, 
  ClipboardCheck, 
  PieChart, 
  FileText, 
  Sliders, 
  User, 
  LogOut,
  X,
  Radio,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { SessionData } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  session: SessionData;
  onOpenLogout: () => void;
  onOpenLogoManager?: () => void;
  onOpenResetModal?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  session,
  onOpenLogout,
  onOpenLogoManager,
  onOpenResetModal,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const isAdminOrPk = session.role === 'admin' || session.role === 'pentadbir' || session.role === 'penyelaras';

  const navItems = isAdminOrPk
    ? [
        { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
        { id: 'monitoring-live', label: 'Panel Monitoring Live', icon: Radio, badge: 'LIVE', highlight: true },
        { id: 'scan-qr', label: 'Imbas QR Kelas', icon: Camera, highlight: true },
        { id: 'jadual', label: 'Jadual Waktu PdP 2026', icon: CalendarDays, badge: '7:00AM' },
        { id: 'relief', label: 'Kelas Ganti (Relief)', icon: UserCheck, badge: 'GANTI', highlight: true },
        { id: 'kelas', label: 'Pengurusan Kelas', icon: School },
        { id: 'subjek', label: 'Pengurusan Subjek', icon: BookOpen },
        { id: 'pengguna', label: 'Pengurusan Pengguna', icon: Users },
        { id: 'qr', label: 'Kod QR Kelas', icon: QrCode },
        { id: 'rekod', label: 'Rekod Kehadiran PdP', icon: ClipboardCheck },
        { id: 'analitik', label: 'Analitik & Graf', icon: PieChart },
        { id: 'laporan', label: 'Laporan Sistem / Cetak', icon: FileText, badge: 'FORMAL', highlight: true },
        { id: 'tetapan', label: 'Tetapan Sistem', icon: Sliders },
        { id: 'profil', label: 'Profil Saya', icon: User }
      ]
    : [
        { id: 'scan-qr', label: 'Imbas QR Kelas (PdP Sahaja)', icon: Camera, highlight: true, badge: 'AKTIF' },
        { id: 'profil', label: 'Profil Saya', icon: User }
      ];

  const handleItemClick = (tabId: string) => {
    onNavigate(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/25 flex items-center justify-between bg-[#1b0307]">
          <div 
            onClick={onOpenLogoManager}
            className={`flex items-center gap-3 ${onOpenLogoManager ? 'cursor-pointer hover:opacity-90 transition' : ''}`}
            title={onOpenLogoManager ? 'Klik untuk Mengurus Logo Sekolah' : undefined}
          >
            <div className="w-10 h-11 rounded-2xl bg-amber-500/10 p-1 flex-shrink-0 flex items-center justify-center ring-1 ring-amber-400/50 hover:ring-amber-300 transition shadow-sm shadow-amber-500/10">
              <SchoolLogo className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-amber-400 font-black text-sm tracking-tight leading-none flex items-center gap-1.5">
                <span>SK KEPAWA</span>
              </h1>
              <span className="text-[10px] text-amber-100 font-extrabold tracking-wider uppercase">G-TEPAT 2026</span>
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                AKTIF SEPENUHNYA
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-xl text-amber-200 hover:text-white hover:bg-[#3a0a12] transition"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-amber-500/25 bg-[#2e070e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-[#240509] font-black flex items-center justify-center text-xs shadow-md shadow-amber-500/20 border border-amber-200">
              {session.nama.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate">{session.nama}</p>
              <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider mt-0.5 ${
                session.role === 'admin' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50' :
                session.role === 'pentadbir' ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40' :
                session.role === 'penyelaras' ? 'bg-[#4b0e18] text-amber-200 border border-amber-500/40' :
                'bg-emerald-900/70 text-emerald-200 border border-emerald-500/40'
              }`}>
                {session.role === 'admin' ? 'GURU BESAR' : session.role === 'pentadbir' ? 'PENTADBIR / PK' : session.role === 'penyelaras' ? 'PENYELARAS' : 'GURU'}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-[#240509] font-black shadow-md shadow-amber-500/25 border border-amber-200'
                    : item.highlight
                      ? 'bg-[#360810] text-amber-300 hover:bg-[#4a0c17] border border-amber-500/35'
                      : 'text-amber-100/80 hover:bg-[#32070e] hover:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#240509]' : item.highlight ? 'text-amber-400' : 'text-amber-300/70'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded-full flex-shrink-0 flex items-center gap-1 ${
                    item.badge === 'LIVE'
                      ? 'bg-red-600 text-white shadow-sm shadow-red-600/50 animate-pulse'
                      : isActive
                        ? 'bg-[#240509] text-amber-300'
                        : item.badge === 'FORMAL' || item.badge === 'CETAK' || item.badge === 'GANTI'
                          ? 'bg-amber-400 text-[#240509] shadow' 
                          : 'bg-[#1a0307] text-amber-200 border border-amber-500/30'
                  }`}>
                    {item.badge === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>}
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Actions footer */}
      <div className="p-3 border-t border-amber-500/25 space-y-1 bg-[#1b0307]">
        {isAdminOrPk && onOpenResetModal && (
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenResetModal();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-bold text-amber-300 hover:bg-amber-500/15 hover:text-amber-200 transition cursor-pointer active:scale-95"
            title="Pusat Kawalan Reset Semula Sistem G-TEPAT"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset Semula Data</span>
          </button>
        )}

        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            onOpenLogout();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-bold text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition cursor-pointer active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-[#220409] text-amber-100 flex-shrink-0 border-r border-amber-500/30 flex-col justify-between no-print sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-xs bg-[#220409] text-amber-100 border-r border-amber-500/30 h-full flex flex-col z-50 shadow-2xl animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
