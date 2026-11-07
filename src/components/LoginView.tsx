import React, { useState, useMemo } from 'react';
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
  ShieldCheck,
  GraduationCap,
  Users,
  CheckCircle2,
  QrCode,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Shield
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { INITIAL_USERS } from '../data/initialData';
import { User } from '../types';

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
  onOpenResetPassword?: (user?: User) => void;
  onOpenResetModal?: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  pendingScanClass?: string | null;
  onSetPendingScanClass?: (className: string) => void;
  users?: User[];
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onOpenTestAccounts,
  onOpenLogoManager,
  onOpenResetPassword,
  onOpenResetModal,
  onShowToast,
  pendingScanClass,
  onSetPendingScanClass,
  users = INITIAL_USERS
}) => {
  // Active Panel: 'admin' (Panel Pentadbir) or 'guru' (Panel Pengguna Lain / Guru)
  const [activePanel, setActivePanel] = useState<'admin' | 'guru'>('guru');

  // Admin Panel states
  const [adminIdentifier, setAdminIdentifier] = useState('g-66232912@moe-dl.edu.my');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Other Users / Guru Panel states
  const [guruIdentifier, setGuruIdentifier] = useState('');
  const [guruPassword, setGuruPassword] = useState('');
  const [showGuruPassword, setShowGuruPassword] = useState(false);
  // General states
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoginScannerOpen, setIsLoginScannerOpen] = useState(false);

  // Master users list
  const activeUsers = users && users.length > 0 ? users : INITIAL_USERS;

  // Admin users (Guru Besar, PK Pentadbiran, Penyelaras)
  const adminUsers = useMemo(() => {
    return activeUsers.filter(u => 
      u.role === 'admin' || 
      u.role === 'pentadbir' || 
      u.role === 'penyelaras' ||
      u.email.includes('66232912') ||
      u.email.includes('84232913') ||
      u.email.includes('54232922')
    );
  }, [activeUsers]);

  // Other users / Guru (10 teachers)
  const otherUsers = useMemo(() => {
    return activeUsers.filter(u => 
      u.role !== 'admin' && 
      u.role !== 'pentadbir' && 
      u.role !== 'penyelaras' &&
      !u.email.includes('66232912') &&
      !u.email.includes('84232913') &&
      !u.email.includes('54232922')
    );
  }, [activeUsers]);

  // Handlers for Admin Login
  const handleAdminSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    const targetEmail = (adminIdentifier || '').trim() || 'g-66232912@moe-dl.edu.my';
    const targetPass = (adminPassword || '').trim() || 'XBA6019';

    const res = await onLogin(targetEmail, targetPass, rememberMe, targetPass, 'admin');
    setIsLoading(false);
    if (res.success) {
      onShowToast(res.message, 'success');
    } else {
      onShowToast(res.message, 'error');
    }
  };

  // Handlers for Other Users / Guru Login
  const handleGuruSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    const targetEmail = (guruIdentifier || '').trim();
    if (!targetEmail) {
      setIsLoading(false);
      onShowToast('Sila pilih nama anda dari senarai atau masukkan ID DELIMa.', 'warning');
      return;
    }

    const targetPass = (guruPassword || '').trim() || 'XBA6019';

    const res = await onLogin(targetEmail, targetPass, rememberMe, undefined, 'guru');
    setIsLoading(false);
    if (res.success) {
      onShowToast(res.message, 'success');
    } else {
      onShowToast(res.message, 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 py-6 sm:py-10 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 relative overflow-y-auto">
      {/* Background aesthetics */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top action bar */}
      <div className="w-full max-w-xl flex items-center justify-between gap-1.5 mb-3 z-20 px-1">
        <div className="flex items-center gap-1.5">
          {onOpenLogoManager && (
            <button
              onClick={onOpenLogoManager}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md text-[11px] font-bold border border-white/20 transition flex items-center gap-1.5 shadow-md group cursor-pointer"
              title="Tukar Logo Sekolah"
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
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsLoginScannerOpen(true)}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-slate-950 backdrop-blur-md text-[11px] font-black border border-gold-500 transition flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
            title="Imbas Kod QR Pintu Bilik Darjah Sebelum Log Masuk"
          >
            <Camera className="w-3.5 h-3.5 text-slate-950" />
            <span>Imbas Pintu</span>
          </button>

          <button
            onClick={onOpenTestAccounts}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md text-[11px] font-bold border border-white/20 transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>ID DELIMa</span>
          </button>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 animate-fade-in mb-6">
        
        {/* System Active Confirmation Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-2.5 border-b border-emerald-500/50 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <div className="text-left">
              <span className="text-[11px] sm:text-xs font-black tracking-tight flex items-center gap-1.5">
                <span>STATUS: SISTEM AKTIF SEPENUHNYA (100% OPERASIONAL)</span>
              </span>
              <span className="text-[10px] text-emerald-100 font-medium block">
                Akses dibuka untuk semua 13 Guru & Pentadbir SK Kepawa Sesi 2026
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black border border-white/30 shrink-0">
            TERBUKA
          </span>
        </div>

        {/* Header Branding */}
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

        {/* Pending QR Scan Detected Notification */}
        {pendingScanClass && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-start gap-2.5 shadow-md">
            <div className="p-1.5 bg-amber-500 text-white rounded-xl flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase text-amber-900 tracking-wider">
                IMBASAN KOD QR DIKESAN: KELAS {pendingScanClass}
              </h4>
              <p className="text-[10px] text-amber-800 mt-0.5 font-medium">
                Sila pilih akaun anda di bawah untuk mengesahkan dan merekod kehadiran PdP kelas ini secara automatik.
              </p>
            </div>
          </div>
        )}

        {/* 2 DEDICATED PANELS: 1 ADMIN PANEL & 1 OTHER USERS PANEL */}
        <div className="p-3 sm:p-5">
          {/* Panel Selector Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl mb-4 border border-slate-200">
            {/* Tab 1: Panel Pentadbir (Admin) */}
            <button
              type="button"
              onClick={() => setActivePanel('admin')}
              className={`py-3 px-3 rounded-xl font-black text-xs transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activePanel === 'admin'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span className="tracking-tight">PANEL 1: PENTADBIR</span>
              </div>
              <span className="text-[10px] opacity-80 font-medium">
                Guru Besar & PK
              </span>
            </button>

            {/* Tab 2: Panel Pengguna Lain (Guru) */}
            <button
              type="button"
              onClick={() => setActivePanel('guru')}
              className={`py-3 px-3 rounded-xl font-black text-xs transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activePanel === 'guru'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-200" />
                <span className="tracking-tight">PANEL 2: PENGGUNA LAIN</span>
              </div>
              <span className="text-[10px] opacity-80 font-medium">
                Guru & Staf
              </span>
            </button>
          </div>

          {/* ============================================================== */}
          {/* PANEL 1: LOG MASUK PENTADBIR (ADMIN)                           */}
          {/* ============================================================== */}
          {activePanel === 'admin' && (
            <div className="space-y-4 animate-fade-in">
              {/* Admin Form */}
              <form onSubmit={handleAdminSubmit} className="space-y-3.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                {/* ID DELIMa Field */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-600" />
                      <span>ID DELIMa Pentadbir</span>
                    </span>
                    <span className="text-[10px] text-purple-700 font-bold lowercase">
                      @moe-dl.edu.my
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      placeholder="g-66232912@moe-dl.edu.my atau nama..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-600" />
                      <span>Kata Laluan Pentadbir</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Masukkan kata laluan..."
                      className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>LOG MASUK PENTADBIR</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Password Management & Reset Options for Admin */}
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-700 shrink-0" />
                  <span className="text-[11px] text-purple-900 font-bold">
                    Pengurusan Kata Laluan Pentadbir:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenResetPassword) {
                      const targetAdmin = adminUsers.find(a => 
                        a.email.toLowerCase() === adminIdentifier.toLowerCase() ||
                        a.username.toLowerCase() === adminIdentifier.toLowerCase()
                      ) || adminUsers[0];
                      onOpenResetPassword(targetAdmin);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-black transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Tukar Kata Laluan</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* PANEL 2: LOG MASUK PENGGUNA LAIN (GURU & STAF)                  */}
          {/* ============================================================== */}
          {activePanel === 'guru' && (
            <div className="space-y-4 animate-fade-in">
              {/* Clean Standard Guru Login Form */}
              <form onSubmit={handleGuruSubmit} className="space-y-3.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                {/* Teacher Dropdown / ID DELIMa Field */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pilih Guru Atau Taip ID DELIMa</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold lowercase">
                      @moe-dl.edu.my
                    </span>
                  </label>
                  
                  {/* Quick Select Dropdown */}
                  <select
                    value={guruIdentifier}
                    onChange={(e) => setGuruIdentifier(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition mb-2"
                  >
                    <option value="">-- Pilih Nama Guru Dari Senarai --</option>
                    {otherUsers.map((teacher, idx) => (
                      <option key={teacher.id} value={teacher.email}>
                        {idx + 1}. {teacher.nama} ({teacher.username})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Atau taip ID DELIMa (g-xxxxxxxx@moe-dl.edu.my)..."
                    value={guruIdentifier}
                    onChange={(e) => setGuruIdentifier(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kata Laluan Guru</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showGuruPassword ? 'text' : 'password'}
                      placeholder="Masukkan kata laluan..."
                      value={guruPassword}
                      onChange={(e) => setGuruPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGuruPassword(!showGuruPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showGuruPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>LOG MASUK GURU (TERUS KE IMBAS QR)</span>
                    <Camera className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-center text-slate-500 mt-2 font-medium">
                    Akses terhad: Pengguna guru hanya boleh mengakses pengimbas Kod QR PdP bilik darjah.
                  </p>
                </div>
              </form>

              {/* Password management ribbon */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px] font-bold">Lupa atau ingin tukar kata laluan?</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenResetPassword && onOpenResetPassword()}
                  className="text-emerald-700 hover:text-emerald-900 font-black text-[11px] underline cursor-pointer"
                >
                  Tukar Kata Laluan Guru
                </button>
              </div>
            </div>
          )}

          {/* Quick Footer Links */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Sistem Aktif 100% (Semua 13 Pengguna)
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenTestAccounts}
                className="text-slate-600 hover:text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Key className="w-3 h-3 text-gold-500" />
                <span>Senarai ID DELIMa</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenResetPassword && onOpenResetPassword()}
                className="text-amber-700 hover:text-amber-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-amber-600" />
                <span>Tukar / Reset Kata Laluan</span>
              </button>
            </div>
          </div>
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

            {/* Quick 6 Classrooms */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { name: '1 JINGGA', year: 1, teacher: 'Noradilah binti Ribut' },
                { name: '2 BIRU', year: 2, teacher: 'Asnah binti Md Danil' },
                { name: '3 UNGU', year: 3, teacher: 'Normawati binti Ismail' },
                { name: '4 HIJAU', year: 4, teacher: 'Rohidah @ Noridah', highlight: '⭐ Mohamad Riman' },
                { name: '5 KUNING', year: 5, teacher: 'Dayang Sabariah', highlight: '⭐ Mohamad Aiman' },
                { name: '6 MERAH', year: 6, teacher: 'Siti Fairuz / GB' }
              ].map(cls => (
                <button
                  key={cls.name}
                  type="button"
                  onClick={() => {
                    if (onSetPendingScanClass) {
                      onSetPendingScanClass(cls.name);
                    }
                    setIsLoginScannerOpen(false);
                    onShowToast(`Kod QR Pintu Kelas ${cls.name} dikesan! Sila pilih akaun anda di bawah untuk mengesahkan kehadiran.`, 'success');
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
          </div>
        </div>
      )}
    </div>
  );
};
