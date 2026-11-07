import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Shield, 
  User as UserIcon, 
  Copy, 
  Check, 
  RefreshCw, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { User } from '../types';

interface ResetPasswordModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirmReset: (userId: string, newPassword: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  users?: User[];
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  user,
  onClose,
  onConfirmReset,
  onShowToast,
  users = []
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(user?.id || '');
  const [resetType, setResetType] = useState<'default' | 'custom' | 'generate'>('custom');
  const [customPassword, setCustomPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const DEFAULT_PASSWORD = 'XBA6019';

  const generateRandomPassword = () => {
    const prefixes = ['Kepawa', 'Guru', 'Tepat', 'Hebat', 'PdP'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    const symbols = ['#', '@', '!', '$'];
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    return `${randomPrefix}${randomSymbol}${randomNum}!`;
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId(user?.id || (users[0]?.id || ''));
      setResetType('custom');
      setCustomPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setIsCopied(false);
      setGeneratedPassword(generateRandomPassword());
    }
  }, [isOpen, user, users]);

  const activeUser = (users.length > 0 ? users.find(u => u.id === selectedUserId) : null) || user;

  if (!isOpen || !activeUser) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    onShowToast('Kata laluan berjaya disalin ke papan keratan (clipboard)!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const getEffectivePassword = () => {
    if (resetType === 'default') return DEFAULT_PASSWORD;
    if (resetType === 'generate') return generatedPassword;
    return customPassword;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPassword = getEffectivePassword();

    if (resetType === 'custom') {
      if (!customPassword.trim()) {
        onShowToast('Sila masukkan kata laluan baru.', 'warning');
        return;
      }
      if (customPassword.length < 6) {
        onShowToast('Kata laluan mestilah sekurang-kurangnya 6 aksara.', 'warning');
        return;
      }
      if (customPassword !== confirmPassword) {
        onShowToast('Pengesahan kata laluan tidak sepadan.', 'error');
        return;
      }
    }

    onConfirmReset(activeUser.id, finalPassword);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-kepawa-950 to-slate-900 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-400/20 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-gold-300 text-[10px] font-black uppercase tracking-wider">
                KESELAMATAN AKAUN DELIMA
              </span>
              <h2 className="text-lg font-black text-white mt-0.5">Tukar / Reset Kata Laluan</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Selector Dropdown */}
        {users.length > 0 && (
          <div className="px-5 pt-4 pb-2 bg-slate-100/80 border-b border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pilih Akaun Guru / Pentadbir:
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nama} ({u.email}) - {u.role.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* User Info Card */}
        <div className="p-5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-kepawa-700 text-white flex items-center justify-center font-black text-sm shadow-sm">
                {activeUser.nama.charAt(0)}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{activeUser.nama}</h4>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                  <span>{activeUser.email}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400">{activeUser.no_staf}</span>
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shrink-0 ${
              activeUser.role === 'admin' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
              activeUser.role === 'pentadbir' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
              activeUser.role === 'penyelaras' ? 'bg-teal-100 text-teal-900 border border-teal-200' :
              'bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}>
              {activeUser.role === 'admin' ? 'ADMIN' : activeUser.role === 'pentadbir' ? 'PK / PENTADBIR' : activeUser.role === 'penyelaras' ? 'PENYELARAS' : 'GURU'}
            </span>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Method Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pilih Kaedah Reset Kata Laluan:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setResetType('default')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition flex flex-col items-center gap-1 text-center ${
                  resetType === 'default'
                    ? 'bg-kepawa-50 border-kepawa-600 text-kepawa-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Key className="w-4 h-4 text-kepawa-700" />
                <span>Lalai DELIMa</span>
              </button>

              <button
                type="button"
                onClick={() => setResetType('generate')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition flex flex-col items-center gap-1 text-center ${
                  resetType === 'generate'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Jana Rawak</span>
              </button>

              <button
                type="button"
                onClick={() => setResetType('custom')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition flex flex-col items-center gap-1 text-center ${
                  resetType === 'custom'
                    ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Lock className="w-4 h-4 text-purple-600" />
                <span>Kata Tersuai</span>
              </button>
            </div>
          </div>

          {/* Option 1: Default DELIMa Password */}
          {resetType === 'default' && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950">Kata Laluan Lalai Sistem (Default):</span>
                <span className="text-[10px] font-bold bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded-full">
                  Standard KPM
                </span>
              </div>
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-200 font-mono text-sm font-bold text-slate-900">
                <span>{DEFAULT_PASSWORD}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(DEFAULT_PASSWORD)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-sans font-bold flex items-center gap-1.5 transition"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{isCopied ? 'Disalin!' : 'Salin'}</span>
                </button>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Kata laluan pengguna ini akan disetkan semula ke kata laluan rasmi standard. Guru boleh log masuk segera menggunakan kata laluan ini.
              </p>
            </div>
          )}

          {/* Option 2: Generated Secure Password */}
          {resetType === 'generate' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">Kata Laluan Rawak Dihasilkan:</span>
                <button
                  type="button"
                  onClick={() => setGeneratedPassword(generateRandomPassword())}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                >
                  <RefreshCw className="w-3 h-3" /> Jana Baru
                </button>
              </div>
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200 font-mono text-sm font-bold text-slate-900">
                <span>{generatedPassword}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedPassword)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-sans font-bold flex items-center gap-1.5 transition"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{isCopied ? 'Disalin!' : 'Salin'}</span>
                </button>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Kata laluan ini dijana secara automatik dengan kombinasi selamat. Sila salin dan kongsikan kepada guru berkenaan.
              </p>
            </div>
          )}

          {/* Option 3: Custom Password */}
          {resetType === 'custom' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Laluan Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata laluan baru (min. 6 aksara)"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sahkan Kata Laluan Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Ulang semula kata laluan baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
                />
              </div>

              {customPassword && confirmPassword && customPassword !== confirmPassword && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" /> Kata laluan tidak sepadan.
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-kepawa-700 to-slate-900 hover:from-kepawa-800 hover:to-black text-white font-black text-xs shadow-lg shadow-kepawa-700/20 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-gold-400" />
              <span>Sahkan & Reset Kata Laluan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
