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
  Shield,
  ShieldCheck,
  GraduationCap,
  Users,
  CheckCircle2,
  HelpCircle,
  QrCode,
  X,
  Zap,
  Check,
  Search,
  UserCheck,
  School,
  Activity,
  Layers
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
  // Modes: 'pilih-guru' (Default 1-Click for all teachers), 'manual' (Manual ID DELIMa / Email), 'pentadbir' (Admin / Penyelaras)
  const [activeTab, setActiveTab] = useState<'pilih-guru' | 'manual' | 'pentadbir'>('pilih-guru');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [isLoginScannerOpen, setIsLoginScannerOpen] = useState(false);
  
  // Credentials for manual input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityPasscode, setSecurityPasscode] = useState('SKK2026');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Filtered teachers list for quick 1-click access
  const allTeachers = useMemo(() => {
    return INITIAL_USERS.map(u => {
      let roleDesc = 'Guru Akademik';
      let tag = 'GURU';
      let tagColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';

      if (u.role === 'admin') {
        roleDesc = 'Guru Besar (Pentadbir Utama)';
        tag = '👑 GURU BESAR';
        tagColor = 'bg-purple-100 text-purple-900 border-purple-300';
      } else if (u.role === 'pentadbir') {
        roleDesc = 'Penolong Kanan Pentadbiran';
        tag = '🏫 PK PENTADBIRAN';
        tagColor = 'bg-amber-100 text-amber-900 border-amber-300';
      } else if (u.role === 'penyelaras') {
        roleDesc = 'Penyelaras G-TEPAT / Guru Kelas 1 Jingga';
        tag = '⭐ PENYELARAS';
        tagColor = 'bg-teal-100 text-teal-900 border-teal-300';
      } else if (u.nama.includes('ROHIDAH')) {
        roleDesc = 'Guru Kelas 4 Hijau / BM & Sains';
      } else if (u.nama.includes('DAYANG SABARIAH')) {
        roleDesc = 'Guru Kelas 5 Kuning / BM & Sejarah';
      } else if (u.nama.includes('FAIRUZ')) {
        roleDesc = 'Guru Pendidikan Islam (Tahun 6 & 4)';
      } else if (u.nama.includes('ASNAH')) {
        roleDesc = 'Guru Kelas 2 Biru / Bahasa Inggeris';
      } else if (u.nama.includes('NORMAWATI')) {
        roleDesc = 'Guru Kelas 3 Ungu / Bahasa Arab';
      } else if (u.nama.includes('KHAYSAR')) {
        roleDesc = 'Guru Bahasa Inggeris & PJ (Tahun 1 & 5)';
      } else if (u.nama.includes('HABIBAH')) {
        roleDesc = 'Guru Bahasa Inggeris (Tahun 3 & 4)';
      } else if (u.nama.includes('SHAHERA')) {
        roleDesc = 'Guru Matematik & RBT';
      } else if (u.nama.includes('NORLIANA')) {
        roleDesc = 'Guru Sains & Pendidikan Muzik';
      } else if (u.nama.includes('SARIPAH')) {
        roleDesc = 'Guru Pendidikan Islam & Tasmik';
      }

      return {
        ...u,
        roleDesc,
        tag,
        tagColor
      };
    });
  }, []);

  const filteredTeachers = useMemo(() => {
    if (!teacherSearch.trim()) return allTeachers;
    const q = teacherSearch.toLowerCase();
    return allTeachers.filter(t => 
      t.nama.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.username.toLowerCase().includes(q) ||
      t.roleDesc.toLowerCase().includes(q)
    );
  }, [allTeachers, teacherSearch]);

  const handleQuickTeacherLogin = async (targetUser: User) => {
    setIsLoading(true);
    setEmail(targetUser.email);
    setPassword('Guru#2026!');
    const portal = targetUser.role === 'admin' || targetUser.role === 'pentadbir' || targetUser.role === 'penyelaras' ? 'admin' : 'guru';
    const passcode = portal === 'admin' ? 'SKK2026' : undefined;

    const res = await onLogin(targetUser.email, 'Guru#2026!', rememberMe, passcode, portal);
    setIsLoading(false);
    if (res.success) {
      onShowToast(`Selamat Datang, ${targetUser.nama}! Akses penuh sistem diaktifkan.`, 'success');
    } else {
      onShowToast(res.message, 'error');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    const targetEmail = (email || '').trim() || (activeTab === 'pentadbir' ? 'g-77263791@moe-dl.edu.my' : 'g-66232912@moe-dl.edu.my');
    const targetPass = (password || '').trim() || 'Guru#2026!';
    const targetPasscode = (securityPasscode || '').trim() || 'SKK2026';
    const portal = activeTab === 'pentadbir' ? 'admin' : 'guru';

    const res = await onLogin(targetEmail, targetPass, rememberMe, targetPasscode, portal);
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
                Akses dibuka untuk semua 13 Guru & Staf SK Kepawa (Sesi Persekolahan 2026)
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
                Sila klik nama anda di bawah untuk mengesahkan dan merekod kehadiran PdP kelas ini secara automatik.
              </p>
            </div>
          </div>
        )}

        {/* Access Modes Tabs */}
        <div className="p-2 sm:p-2.5 bg-slate-900 border-b border-slate-800">
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            {/* TAB 1: PILIH NAMA GURU (1-KLIK) */}
            <button
              type="button"
              onClick={() => setActiveTab('pilih-guru')}
              className={`py-2 px-1.5 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                activeTab === 'pilih-guru'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg ring-2 ring-emerald-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-1">
                <Users className={`w-3.5 h-3.5 ${activeTab === 'pilih-guru' ? 'text-gold-300' : 'text-slate-400'}`} />
                <span className="text-[11px] sm:text-xs">Pilih Guru</span>
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                activeTab === 'pilih-guru' ? 'bg-emerald-900/90 text-emerald-200' : 'text-slate-500'
              }`}>
                1-KLIK AKSES
              </span>
            </button>

            {/* TAB 2: LOG MASUK MANUAL */}
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`py-2 px-1.5 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg ring-2 ring-blue-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-1">
                <Mail className={`w-3.5 h-3.5 ${activeTab === 'manual' ? 'text-blue-300' : 'text-slate-400'}`} />
                <span className="text-[11px] sm:text-xs">ID DELIMa</span>
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                activeTab === 'manual' ? 'bg-blue-900/90 text-blue-200' : 'text-slate-500'
              }`}>
                MANUAL INPUT
              </span>
            </button>

            {/* TAB 3: PENTADBIR & PENYELARAS */}
            <button
              type="button"
              onClick={() => setActiveTab('pentadbir')}
              className={`py-2 px-1.5 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                activeTab === 'pentadbir'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-lg ring-2 ring-purple-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-1">
                <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'pentadbir' ? 'text-gold-400' : 'text-slate-400'}`} />
                <span className="text-[11px] sm:text-xs">Pentadbir</span>
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                activeTab === 'pentadbir' ? 'bg-purple-900/90 text-purple-200' : 'text-slate-500'
              }`}>
                KOD SKK2026
              </span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT 1: PILIH NAMA GURU (INSTANT DIRECT 1-CLICK ACCESS) */}
        {activeTab === 'pilih-guru' && (
          <div className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Senarai Guru SK Kepawa (Pilih Nama Anda Untuk Masuk)</span>
                </h3>
                <p className="text-[10px] text-slate-500">
                  Semua 13 akaun guru berstatus AKTIF SEPENUHNYA. Klik mana-mana nama untuk log masuk serta-merta.
                </p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                13 Guru Berdaftar
              </span>
            </div>

            {/* Quick search input */}
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Cari nama guru, subjek, atau peranan..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              {teacherSearch && (
                <button
                  onClick={() => setTeacherSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Teacher Cards Grid */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredTeachers.map((teacher, idx) => (
                <div
                  key={teacher.id}
                  onClick={() => handleQuickTeacherLogin(teacher)}
                  className="p-2.5 sm:p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/40 transition flex items-center justify-between gap-2.5 group cursor-pointer shadow-xs active:scale-98"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition">
                      {teacher.nama.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-800 truncate">
                          {idx + 1}. {teacher.nama}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${teacher.tagColor}`}>
                          {teacher.tag}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-2">
                        <span>{teacher.roleDesc}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-[9px] text-slate-400">{teacher.username}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white text-[11px] font-black shadow-xs transition flex items-center gap-1 shrink-0"
                  >
                    <span>Masuk</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Semua guru boleh log masuk tanpa sekatan
              </span>
              <button
                type="button"
                onClick={onOpenTestAccounts}
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <Key className="w-3 h-3 text-gold-500" />
                <span>Senarai Penuh & Kata Laluan</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: MANUAL LOGIN (ID DELIMa / EMEL / NAMA GURU) */}
        {activeTab === 'manual' && (
          <div className="p-5 sm:p-6">
            <div className="mb-3.5 text-center">
              <h2 className="text-xs sm:text-sm font-black uppercase text-slate-800 tracking-wider flex items-center justify-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>LOG MASUK ID DELIMa / EMEL GURU</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Masukkan ID DELIMa rasmi (cth: g-xxxxxxxx@moe-dl.edu.my) atau nama guru anda.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                  ID DELIMa / Emel / Nama Guru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="g-xxxxxxxx@moe-dl.edu.my atau nama guru..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Kata Laluan DELIMa
                  </label>
                  <span className="text-[10px] text-slate-500">Lalai: Guru#2026!</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan Kata Laluan (Lalai: Guru#2026!)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
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

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium">Ingat saya pada peranti ini</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenResetPassword) {
                      onOpenResetPassword();
                    } else {
                      onShowToast('Kata laluan rasmi lalai bagi semua akaun adalah: Guru#2026!', 'info');
                    }
                  }}
                  className="text-blue-700 font-bold hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>Reset Kata Laluan</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 text-white font-black rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-75 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 border border-blue-500 shadow-blue-600/30"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Mengesahkan Akses...
                  </span>
                ) : (
                  <>
                    <span className="text-sm">LOG MASUK KE SISTEM G-TEPAT</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB CONTENT 3: PENTADBIR & PENYELARAS */}
        {activeTab === 'pentadbir' && (
          <div className="p-5 sm:p-6">
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 mb-4 text-center">
              <span className="text-[10px] font-black text-purple-900 uppercase tracking-wide block">
                👑 PANEL KHAS PENTADBIRAN & PENYELARAS G-TEPAT
              </span>
              <p className="text-[11px] text-purple-700 mt-0.5">
                Dikhaskan untuk Guru Besar (Admin), PK Pentadbiran, dan Penyelaras G-TEPAT SK Kepawa.
              </p>
            </div>

            {/* 3 Quick Role Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickTeacherLogin(INITIAL_USERS[0])}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-purple-700 hover:text-white border border-purple-200 transition text-left group cursor-pointer shadow-xs"
              >
                <span className="text-[9px] font-black text-purple-700 group-hover:text-purple-200 uppercase block">
                  👑 GURU BESAR
                </span>
                <span className="text-xs font-black text-slate-900 group-hover:text-white block mt-0.5 truncate">
                  MOHD ZAHARI
                </span>
                <span className="text-[9px] text-slate-500 group-hover:text-purple-200 block">
                  Admin Utama
                </span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickTeacherLogin(INITIAL_USERS[1])}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-600 hover:text-white border border-amber-200 transition text-left group cursor-pointer shadow-xs"
              >
                <span className="text-[9px] font-black text-amber-700 group-hover:text-amber-200 uppercase block">
                  🏫 PK PENTADBIRAN
                </span>
                <span className="text-xs font-black text-slate-900 group-hover:text-white block mt-0.5 truncate">
                  NURTITAH
                </span>
                <span className="text-[9px] text-slate-500 group-hover:text-amber-200 block">
                  Pengurusan PdP
                </span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickTeacherLogin(INITIAL_USERS[10])}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-700 hover:text-white border border-teal-200 transition text-left group cursor-pointer shadow-xs"
              >
                <span className="text-[9px] font-black text-teal-700 group-hover:text-teal-200 uppercase block">
                  ⭐ PENYELARAS
                </span>
                <span className="text-xs font-black text-slate-900 group-hover:text-white block mt-0.5 truncate">
                  NORADILAH
                </span>
                <span className="text-[9px] text-slate-500 group-hover:text-teal-200 block">
                  Penyelaras Sistem
                </span>
              </button>
            </div>

            {/* Custom Admin Passcode Field */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                  Kod Laluan Keselamatan Pentadbir
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-600">
                    <Shield className="w-4 h-4" />
                  </div>
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    placeholder="Kod Keselamatan Rasmi (Lalai: SKK2026)"
                    value={securityPasscode}
                    onChange={(e) => setSecurityPasscode(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-purple-300 rounded-xl text-xs font-black tracking-wider text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-purple-500 hover:text-purple-700 cursor-pointer"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-purple-700 font-medium mt-1">
                  Kod laluan keselamatan lalai rasmi: <span className="font-mono font-bold">SKK2026</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 border border-purple-500 shadow-purple-900/30 cursor-pointer"
              >
                <span>MASUK SEBAGAI PENTADBIR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

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
                    setActiveTab('pilih-guru');
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
