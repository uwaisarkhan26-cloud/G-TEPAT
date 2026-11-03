import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Key, 
  Sparkles, 
  Image as ImageIcon, 
  Camera, 
  RotateCcw,
  Shield,
  ShieldCheck,
  GraduationCap,
  Users,
  CheckCircle2,
  HelpCircle,
  QrCode,
  X,
  Zap,
  Check
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface LoginViewProps {
  onLogin: (
    email: string, 
    pass: string, 
    remember: boolean, 
    securityPasscode?: string, 
    portalType?: 'admin' | 'guru'
  ) => Promise<{ success: boolean; message: string }>;
  onOpenTestAccounts: () => void;
  onOpenLogoManager?: () => void;
  onOpenResetPassword?: () => void;
  onOpenResetModal?: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  pendingScanClass?: string | null;
  onSetPendingScanClass?: (className: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onOpenTestAccounts,
  onOpenLogoManager,
  onOpenResetPassword,
  onOpenResetModal,
  onShowToast,
  pendingScanClass,
  onSetPendingScanClass
}) => {
  // 2 Login Choices: 'admin' (Pentadbir & Penyelaras) vs 'guru' (Guru & Pengguna Lain)
  const [activePortal, setActivePortal] = useState<'admin' | 'guru'>('admin');
  const [isLoginScannerOpen, setIsLoginScannerOpen] = useState(false);
  
  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityPasscode, setSecurityPasscode] = useState('SKK2026');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    // Fallback defaults if empty
    const targetEmail = (email || '').trim() || (activePortal === 'admin' ? 'g-77263791@moe-dl.edu.my' : 'g-66232912@moe-dl.edu.my');
    const targetPass = (password || '').trim() || 'Guru#2026!';
    const targetPasscode = (securityPasscode || '').trim() || 'SKK2026';

    const res = await onLogin(targetEmail, targetPass, rememberMe, targetPasscode, activePortal);
    setIsLoading(false);
    if (res.success) {
      onShowToast(res.message, 'success');
    } else {
      onShowToast(res.message, 'error');
    }
  };

  const handleQuickLogin = async (
    targetEmail: string, 
    roleName: string, 
    portal: 'admin' | 'guru', 
    passcode = 'SKK2026'
  ) => {
    setIsLoading(true);
    setEmail(targetEmail);
    setPassword('Guru#2026!');
    setSecurityPasscode(passcode);
    setActivePortal(portal);

    const res = await onLogin(targetEmail, 'Guru#2026!', true, passcode, portal);
    setIsLoading(false);
    if (res.success) {
      onShowToast(`Berjaya log masuk sebagai ${roleName}!`, 'success');
    } else {
      onShowToast(res.message, 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 py-6 sm:py-10 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 relative overflow-y-auto">
      {/* Background aesthetics */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top action buttons */}
      <div className="w-full max-w-lg flex items-center justify-between gap-1.5 mb-3 z-20 px-1">
        <div className="flex items-center gap-1.5">
          {onOpenLogoManager && (
            <button
              onClick={onOpenLogoManager}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md text-[11px] font-bold border border-white/20 transition flex items-center gap-1.5 shadow-md group cursor-pointer"
              title="Klik untuk menukar atau memuat naik logo sekolah"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition transform" />
              <span>Logo</span>
            </button>
          )}

          {onOpenResetModal && (
            <button
              onClick={onOpenResetModal}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-white backdrop-blur-md text-[11px] font-black border border-amber-400/40 transition flex items-center gap-1.5 shadow-md cursor-pointer"
              title="Pusat Kawalan Reset Semula Sistem G-TEPAT"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Semula</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsLoginScannerOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 hover:text-white backdrop-blur-md text-[11px] font-black border border-gold-400/40 transition flex items-center gap-1.5 shadow-md cursor-pointer"
            title="Imbas Kod QR Pintu Bilik Darjah Sebelum Log Masuk"
          >
            <Camera className="w-3.5 h-3.5 text-gold-400" />
            <span>Imbas QR Pintu</span>
          </button>

          <button
            onClick={onOpenTestAccounts}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md text-[11px] font-bold border border-white/20 transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Senarai ID DELIMa</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 animate-fade-in mb-6">
        {/* Header Banner */}
        <div className="p-5 pb-3 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 relative">
          <div className="relative inline-block group">
            <div 
              onClick={onOpenLogoManager}
              className={`w-20 h-24 sm:w-24 sm:h-28 mx-auto mb-1 transform hover:scale-105 transition duration-300 filter drop-shadow-md flex items-center justify-center ${onOpenLogoManager ? 'cursor-pointer' : ''}`}
              title="Klik untuk menukar atau memuat naik logo sekolah"
            >
              <SchoolLogo className="w-full h-full object-contain" />
            </div>

            {onOpenLogoManager && (
              <button
                type="button"
                onClick={onOpenLogoManager}
                className="absolute bottom-1 right-0 p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg border-2 border-white transform transition hover:scale-110 group-hover:opacity-100 opacity-80 cursor-pointer"
                title="Tukar Logo Rasmi Sekolah"
              >
                <Camera className="w-3 h-3" />
              </button>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">SK KEPAWA BEAUFORT</h1>
          <div className="mt-0.5 flex items-center justify-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              G-TEPAT 2026
            </span>
            <span className="text-[11px] font-semibold text-slate-500">Guru Tepat, PdP Hebat</span>
          </div>
          <p className="mt-1 text-[11px] font-bold text-amber-700 italic">
            “Tepat Masa, Tepat Kelas, Tepat PdP.”
          </p>
        </div>

        {/* Quick Door Scanner Action Banner */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/15 via-gold-500/20 to-emerald-500/15 border-b border-amber-300/80 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold-500"></span>
            </span>
            <div className="text-left">
              <span className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-slate-900" />
                <span>Pengimbas Kod QR Pintu Kelas:</span>
              </span>
              <span className="text-[10px] text-amber-900 font-bold hidden sm:inline">
                Halakan ke poster kod QR di pintu untuk rekod PdP pantas
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLoginScannerOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-slate-950 font-black text-xs shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5 border border-gold-500 shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-slate-950" />
            <span>Imbas Pintu</span>
          </button>
        </div>

        {/* 2 PILIHAN LOG MASUK TAB SELECTOR (ADMIN/PENYELARAS VS GURU/PENGGUNA LAIN) */}
        <div className="p-2 sm:p-2.5 bg-slate-900 border-b border-slate-800">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            {/* PILIHAN 1: PANEL ADMIN DAN PENYELARAS */}
            <button
              type="button"
              onClick={() => {
                setActivePortal('admin');
                setEmail('');
                setSecurityPasscode('SKK2026');
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activePortal === 'admin'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-lg ring-2 ring-purple-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className={`w-4 h-4 ${activePortal === 'admin' ? 'text-gold-400' : 'text-slate-400'}`} />
                <span className="text-[11px] sm:text-xs">Pentadbir & Penyelaras</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                activePortal === 'admin' ? 'bg-purple-900/90 text-purple-200' : 'text-slate-500'
              }`}>
                KOD LALUAN KESELAMATAN
              </span>
            </button>

            {/* PILIHAN 2: PANEL PENGGUNA LAIN / GURU */}
            <button
              type="button"
              onClick={() => {
                setActivePortal('guru');
                setEmail('');
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activePortal === 'guru'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg ring-2 ring-emerald-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <GraduationCap className={`w-4 h-4 ${activePortal === 'guru' ? 'text-emerald-300' : 'text-slate-400'}`} />
                <span className="text-[11px] sm:text-xs">Guru & Pengguna Lain</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                activePortal === 'guru' ? 'bg-emerald-900/90 text-emerald-200' : 'text-slate-500'
              }`}>
                LOG MASUK TERUS
              </span>
            </button>
          </div>
        </div>

        {/* Pending QR Scan Banner */}
        {pendingScanClass && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-start gap-2.5 shadow-md">
            <div className="p-1.5 bg-amber-500 text-white rounded-xl flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase text-amber-900 tracking-wider">
                IMBASAN KOD QR DIKESAN: KELAS {pendingScanClass}
              </h4>
              <p className="text-[10px] text-amber-800 mt-0.5 font-medium">
                Sila log masuk menggunakan akaun rasmi anda untuk mengesahkan dan merekod kehadiran PdP ke dalam sistem.
              </p>
            </div>
          </div>
        )}

        {/* 1-CLICK QUICK ROLE LOGIN SPECIFIC TO ACTIVE PORTAL */}
        {activePortal === 'admin' ? (
          <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border-b border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-700" />
                PILIHAN 1-KLIK PENTADBIR & PENYELARAS (DILINDUNGI KOD)
              </span>
              <span className="text-[9px] font-black text-purple-800 bg-purple-200/80 px-2 py-0.5 rounded-full">
                Kod: SKK2026
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('g-77263791@moe-dl.edu.my', 'GURU BESAR (ADMIN)', 'admin', 'SKK2026')}
                className="p-2.5 rounded-xl bg-white hover:bg-purple-700 hover:text-white text-slate-800 border border-purple-200 shadow-sm transition flex flex-col text-left group cursor-pointer"
              >
                <span className="text-[9px] font-black text-purple-700 group-hover:text-purple-100 uppercase">
                  👑 GURU BESAR
                </span>
                <span className="text-[10px] font-bold leading-tight mt-0.5 truncate">
                  MOHD ZAHARI
                </span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('g-66232911@moe-dl.edu.my', 'PK PENTADBIRAN', 'admin', 'SKK2026')}
                className="p-2.5 rounded-xl bg-white hover:bg-amber-600 hover:text-white text-slate-800 border border-amber-200 shadow-sm transition flex flex-col text-left group cursor-pointer"
              >
                <span className="text-[9px] font-black text-amber-700 group-hover:text-amber-100 uppercase">
                  🏫 PK PENTADBIRAN
                </span>
                <span className="text-[10px] font-bold leading-tight mt-0.5 truncate">
                  NURTITAH
                </span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('g-38232909@moe-dl.edu.my', 'PENYELARAS G-TEPAT', 'admin', 'SKK2026')}
                className="p-2.5 rounded-xl bg-white hover:bg-teal-700 hover:text-white text-slate-800 border border-teal-200 shadow-sm transition flex flex-col text-left group cursor-pointer"
              >
                <span className="text-[9px] font-black text-teal-700 group-hover:text-teal-100 uppercase">
                  ⭐ PENYELARAS
                </span>
                <span className="text-[10px] font-bold leading-tight mt-0.5 truncate">
                  NORADILAH
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-b border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                PILIHAN 1-KLIK GURU & PENGGUNA LAIN (TERUS MASUK)
              </span>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                Tanpa Kod Laluan
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('g-06232904@moe-dl.edu.my', 'SITI FAIRUZ (GURU PI)', 'guru')}
                className="p-2 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-800 border border-emerald-200 shadow-sm transition flex flex-col text-left group cursor-pointer"
              >
                <span className="text-[9px] font-black text-emerald-700 group-hover:text-emerald-100 uppercase">
                  USTAZAH FAIRUZ
                </span>
                <span className="text-[10px] font-bold truncate">Tahun 6 & 4</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('g-66232912@moe-dl.edu.my', 'ROHIDAH (GURU KELAS 4 HIJAU)', 'guru')}
                className="p-2 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-800 border border-emerald-200 shadow-sm transition flex flex-col text-left group cursor-pointer"
              >
                <span className="text-[9px] font-black text-emerald-700 group-hover:text-emerald-100 uppercase">
                  CIKGU ROHIDAH
                </span>
                <span className="text-[10px] font-bold truncate">Guru 4 Hijau</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('g-30232903@moe-dl.edu.my', 'DAYANG SABARIAH (GURU KELAS 5 KUNING)', 'guru')}
                className="p-2 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-800 border border-emerald-200 shadow-sm transition flex flex-col text-left group cursor-pointer"
              >
                <span className="text-[9px] font-black text-emerald-700 group-hover:text-emerald-100 uppercase">
                  CIKGU DAYANG
                </span>
                <span className="text-[10px] font-bold truncate">Guru 5 Kuning</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('g-81232906@moe-dl.edu.my', 'KHAYSAR (GURU BI)', 'guru')}
                className="p-2 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-800 border border-emerald-200 shadow-sm transition flex flex-col text-left group cursor-pointer"
              >
                <span className="text-[9px] font-black text-emerald-700 group-hover:text-emerald-100 uppercase">
                  CIKGU KHAYSAR
                </span>
                <span className="text-[10px] font-bold truncate">Guru BI & PJ</span>
              </button>
            </div>
          </div>
        )}

        {/* LOGIN FORM SECTION */}
        <div className="p-5 sm:p-6 pt-4">
          <div className="mb-3.5 text-center">
            <h2 className="text-xs sm:text-sm font-black uppercase text-slate-800 tracking-wider flex items-center justify-center gap-1.5">
              {activePortal === 'admin' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>PANEL PENTADBIR & PENYELARAS</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>PANEL GURU & PENGGUNA LAIN</span>
                </>
              )}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              {activePortal === 'admin' 
                ? 'Sila masukkan ID DELIMa, Kata Laluan, dan Kod Laluan Keselamatan Pentadbiran.'
                : 'Sila masukkan ID DELIMa dan Kata Laluan untuk membuka akses PdP & imbasan QR.'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* ID DELIMa Field */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                {activePortal === 'admin' ? 'ID DELIMa Pentadbir / Penyelaras' : 'ID DELIMa / Emel Guru'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder={activePortal === 'admin' ? 'g-77263791@moe-dl.edu.my (Admin)' : 'g-xxxxxxxx@moe-dl.edu.my (Guru)'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                Kata Laluan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Kata laluan (Lalai: Guru#2026!)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* KOD LALUAN KESELAMATAN (SECURITY PASSCODE) - SPECIFIC TO ADMIN & PENYELARAS */}
            {activePortal === 'admin' && (
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 animate-fade-in space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-purple-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-700" />
                    <span>Kod Laluan Keselamatan Pentadbiran</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setSecurityPasscode('SKK2026')}
                    className="text-[10px] font-black text-purple-700 bg-purple-200/80 hover:bg-purple-300 px-2 py-0.5 rounded-lg cursor-pointer transition"
                    title="Isi Kod Lalai SKK2026"
                  >
                    Lalai: SKK2026
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-600">
                    <Shield className="w-4 h-4" />
                  </div>
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    required
                    placeholder="Masukkan Kod Laluan Keselamatan (SKK2026)"
                    value={securityPasscode}
                    onChange={(e) => setSecurityPasscode(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-black tracking-wider text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-purple-500 hover:text-purple-700 cursor-pointer"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-purple-700 font-medium">
                  Kod laluan keselamatan khas melindungi panel pengurusan sistem, tetapan, dan laporan formal.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-medium">Ingat saya pada peranti ini</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  if (onOpenResetPassword) {
                    onOpenResetPassword();
                  } else {
                    onShowToast('Kata laluan lalai rasmi adalah: Guru#2026!', 'info');
                  }
                }}
                className="text-emerald-700 font-bold hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bantuan Kata Laluan</span>
              </button>
            </div>

            {/* Prominent Login Button */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-4 text-white font-black rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-75 cursor-pointer border ${
                  activePortal === 'admin'
                    ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-800 hover:to-indigo-900 border-purple-500 shadow-purple-900/30'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 border-emerald-500 shadow-emerald-600/30'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Mengesahkan Akses...
                  </span>
                ) : (
                  <>
                    <span className="text-sm">
                      {activePortal === 'admin' ? 'LOG MASUK PORTAL PENTADBIR & PENYELARAS' : 'LOG MASUK PORTAL GURU & PENGGUNA'}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('');
                    setPassword('');
                    if (activePortal === 'admin') setSecurityPasscode('SKK2026');
                    onShowToast('Medan input log masuk telah dikosongkan.', 'info');
                  }}
                  className="w-1/2 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Input</span>
                </button>

                {onOpenResetModal && (
                  <button
                    type="button"
                    onClick={onOpenResetModal}
                    className="w-1/2 py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-[11px] transition flex items-center justify-center gap-1.5 border border-amber-300 cursor-pointer"
                    title="Buka Pusat Kawalan Reset Semula Sistem"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reset Data Sistem</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Quick Classroom Door Scanner Modal */}
      {isLoginScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gold-400 text-slate-950 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    Imbas Kod QR Pintu Bilik Darjah
                  </h3>
                  <p className="text-[11px] text-slate-400">Pilih bilik darjah yang telah anda masuki</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginScannerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Live Scanner Area */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="w-20 h-20 border-2 border-gold-400/80 rounded-2xl mx-auto flex items-center justify-center relative shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                <QrCode className="w-10 h-10 text-gold-400" />
                <div className="w-full h-0.5 bg-gold-400 shadow-[0_0_8px_#fbbf24] animate-pulse absolute top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] font-bold text-slate-300">
                Pilih bilik darjah di bawah untuk mendaftar masuk serta-merta:
              </p>
            </div>

            {/* Quick 6 Classrooms */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { name: '1 JINGGA', year: 1, teacher: 'Nurfatin Nabilah' },
                { name: '2 KUNING', year: 2, teacher: 'Sh. Hasnah' },
                { name: '3 HIJAU', year: 3, teacher: 'Dg Ku Roziah' },
                { name: '4 HIJAU', year: 4, teacher: 'Zulaiha / Rim', highlight: '⭐ Mohamad Riman' },
                { name: '5 KUNING', year: 5, teacher: 'Bong / Aiman', highlight: '⭐ Mohamad Aiman' },
                { name: '6 MERAH', year: 6, teacher: 'Dg Rusnani' }
              ].map(cls => (
                <button
                  key={cls.name}
                  type="button"
                  onClick={() => {
                    if (onSetPendingScanClass) {
                      onSetPendingScanClass(cls.name);
                    }
                    setActivePortal('guru');
                    setIsLoginScannerOpen(false);
                    onShowToast(`Kod QR Pintu Kelas ${cls.name} dikesan! Sila pilih akaun guru anda untuk merekod kehadiran.`, 'success');
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    cls.highlight
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-400/50 text-amber-200'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-xs">{cls.name}</span>
                    <span className="px-1.5 py-0.2 bg-slate-900 rounded text-[9px] font-mono text-gold-400 font-bold">
                      T{cls.year}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate mt-0.5">{cls.teacher}</span>
                  {cls.highlight && (
                    <span className="text-[9px] font-black text-amber-300 mt-1">
                      {cls.highlight}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Manual input */}
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                id="login-quick-door-code"
                placeholder="Atau taip kod cth: SKK-2026-5KUNING..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('login-quick-door-code') as HTMLInputElement;
                  const val = input?.value.trim().toUpperCase() || '5 KUNING';
                  if (onSetPendingScanClass) onSetPendingScanClass(val);
                  setActivePortal('guru');
                  setIsLoginScannerOpen(false);
                  onShowToast(`Kod QR Kelas ${val} dikesan! Sila pilih guru.`, 'success');
                }}
                className="px-3 py-2 bg-gold-400 hover:bg-gold-500 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Sahkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
