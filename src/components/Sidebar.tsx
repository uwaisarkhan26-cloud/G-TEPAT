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
  RotateCcw
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

  const navItems = [
    { id: 'dashboard', label: isAdminOrPk ? 'Dashboard Utama' : 'Dashboard Guru', icon: LayoutDashboard },
    { id: 'monitoring-live', label: 'Panel Monitoring Live', icon: Radio, badge: 'LIVE', highlight: true },
    { id: 'scan-qr', label: 'Imbas QR Kelas', icon: Camera, highlight: true },
    { id: 'jadual', label: 'Jadual Waktu PdP 2026', icon: CalendarDays, badge: '7:00AM' },
    { id: 'kelas', label: 'Pengurusan Kelas', icon: School },
    { id: 'subjek', label: 'Pengurusan Subjek', icon: BookOpen },
    { id: 'pengguna', label: 'Pengurusan Pengguna', icon: Users },
    { id: 'qr', label: 'Kod QR Kelas', icon: QrCode },
    { id: 'rekod', label: 'Rekod Kehadiran PdP', icon: ClipboardCheck },
    { id: 'analitik', label: 'Analitik & Graf', icon: PieChart },
    { id: 'laporan', label: 'Laporan Sistem / Cetak', icon: FileText, badge: 'FORMAL', highlight: true },
    { id: 'tetapan', label: 'Tetapan Sistem', icon: Sliders },
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
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div 
            onClick={onOpenLogoManager}
            className={`flex items-center gap-3 ${onOpenLogoManager ? 'cursor-pointer hover:opacity-90 transition' : ''}`}
            title={onOpenLogoManager ? 'Klik untuk Mengurus Logo Sekolah' : undefined}
          >
            <div className="w-10 h-11 rounded-2xl bg-white/10 p-1 flex-shrink-0 flex items-center justify-center ring-1 ring-white/10 hover:ring-indigo-400 transition">
              <SchoolLogo className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-white font-black text-sm tracking-tight leading-none flex items-center gap-1.5">
                <span>SK KEPAWA</span>
              </h1>
              <span className="text-[10px] text-gold-400 font-extrabold tracking-wider uppercase">G-TEPAT 2026</span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-kepawa-600 to-kepawa-500 text-white font-black flex items-center justify-center text-xs shadow-md">
              {session.nama.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate">{session.nama}</p>
              <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                session.role === 'admin' ? 'bg-purple-900/80 text-purple-200 border border-purple-700' :
                session.role === 'pentadbir' ? 'bg-amber-900/80 text-amber-200 border border-amber-700' :
                session.role === 'penyelaras' ? 'bg-teal-900/80 text-teal-200 border border-teal-700' :
                'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
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
                    ? 'bg-gradient-to-r from-kepawa-600 to-kepawa-700 text-white shadow-md shadow-kepawa-600/30'
                    : item.highlight
                      ? 'bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 border border-gold-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-gold-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded-full flex-shrink-0 flex items-center gap-1 ${
                    item.badge === 'LIVE'
                      ? 'bg-red-500 text-white shadow-sm shadow-red-500/50 animate-pulse'
                      : item.badge === 'FORMAL' || item.badge === 'CETAK' 
                        ? 'bg-gold-400 text-slate-950 shadow' 
                        : 'bg-slate-800 text-slate-300'
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
      <div className="p-3 border-t border-slate-800/80 space-y-1">
        {onOpenResetModal && (
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenResetModal();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-bold text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition cursor-pointer active:scale-95"
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
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition cursor-pointer active:scale-95"
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
      <aside className="hidden md:flex md:w-64 bg-slate-950 text-slate-300 flex-shrink-0 border-r border-slate-800 flex-col justify-between no-print sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-xs bg-slate-950 text-slate-300 border-r border-slate-800 h-full flex flex-col z-50 shadow-2xl animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
