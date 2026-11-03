import React, { useState } from 'react';
import { Users, Key, Shield, UserCheck, Search, Sparkles, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { User, SessionData } from '../types';

interface PenggunaViewProps {
  users: User[];
  session: SessionData;
  onOpenResetPassword: (user: User) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const PenggunaView: React.FC<PenggunaViewProps> = ({ 
  users, 
  session, 
  onOpenResetPassword,
  onShowToast 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.no_staf.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-black uppercase">
            PENGURUSAN PENGGUNA & KESELAMATAN
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">Senarai Pengguna & Kata Laluan DELIMa</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Semua akaun guru dan pentadbir SK Kepawa Beaufort sesi 2026. Anda boleh mereset kata laluan bila-bila masa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-2xl border border-slate-200 flex items-center gap-1.5 shadow-sm">
            <Users className="w-4 h-4 text-purple-600" /> {users.length} Akaun Didaftar
          </span>
        </div>
      </div>

      {/* Info Card on Password Reset */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Key className="w-5 h-5 text-gold-300" />
          </div>
          <div>
            <h4 className="text-xs font-black text-blue-950 uppercase tracking-wide">
              Fungsi Reset Kata Laluan Aktif
            </h4>
            <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
              Klik butang <strong>"Reset Pass"</strong> pada mana-mana guru untuk mengeset semula kata laluan ke format rasmi KPM (<code className="bg-blue-100/80 px-1.5 py-0.5 rounded font-mono text-blue-950 font-bold">Guru#2026!</code>), menjana kata laluan rawak selamat, atau menetapkan kata laluan tersuai.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, emel DELIMa atau no staf..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Tapis Peranan:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          >
            <option value="all">Semua Peranan ({users.length})</option>
            <option value="admin">Admin / Guru Besar</option>
            <option value="pentadbir">Pentadbir / PK</option>
            <option value="penyelaras">Penyelaras G-TEPAT</option>
            <option value="guru">Guru Akademik</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-black">
                <th className="p-4 pl-5">Nama Guru / Staf</th>
                <th className="p-4">Emel DELIMa</th>
                <th className="p-4">Peranan (Role)</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right pr-5">Tindakan Reset Password</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium text-xs">
                    Tiada pengguna dijumpai untuk carian ini.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 pl-5">
                      <div className="font-extrabold text-slate-900">{u.nama}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.no_staf}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-600 font-medium">{u.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                        u.role === 'pentadbir' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                        u.role === 'penyelaras' ? 'bg-teal-100 text-teal-900 border border-teal-200' :
                        'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}>
                        {u.role === 'admin' ? 'ADMIN / GURU BESAR' : u.role === 'pentadbir' ? 'PENTADBIR / PK' : u.role === 'penyelaras' ? 'PENYELARAS G-TEPAT' : 'GURU'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aktif
                      </span>
                    </td>
                    <td className="p-4 text-right pr-5">
                      <button
                        type="button"
                        onClick={() => onOpenResetPassword(u)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-kepawa-900 hover:from-black hover:to-kepawa-950 text-white font-black text-[11px] shadow-sm hover:shadow-md transition inline-flex items-center gap-1.5 group"
                      >
                        <Key className="w-3.5 h-3.5 text-gold-400 group-hover:rotate-12 transition-transform" />
                        <span>Reset Pass</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
