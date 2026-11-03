import React from 'react';
import { User, Mail, Shield, School, Award, Calendar, Key } from 'lucide-react';
import { SessionData, SystemSettings } from '../types';

interface ProfilViewProps {
  session: SessionData;
  settings: SystemSettings;
  onOpenResetPassword: () => void;
}

export const ProfilView: React.FC<ProfilViewProps> = ({ session, settings, onOpenResetPassword }) => {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-kepawa-600 to-blue-500 text-white rounded-3xl flex items-center justify-center font-black text-4xl mx-auto shadow-xl shadow-kepawa-500/20 mb-4">
          {session.nama.charAt(0)}
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{session.nama}</h3>
        <p className="text-xs text-slate-500 font-mono mt-1 flex items-center justify-center gap-1">
          <Mail className="w-3.5 h-3.5" /> {session.email}
        </p>

        <div className={`mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase ${
          session.role === 'admin' ? 'bg-purple-100 text-purple-900' :
          session.role === 'pentadbir' ? 'bg-amber-100 text-amber-900' :
          session.role === 'penyelaras' ? 'bg-teal-100 text-teal-900' :
          'bg-emerald-100 text-emerald-900'
        }`}>
          <Shield className="w-3.5 h-3.5" />
          Peranan: {session.role === 'admin' ? 'ADMIN / GURU BESAR' : session.role === 'pentadbir' ? 'PENTADBIR / PK' : session.role === 'penyelaras' ? 'PENYELARAS G-TEPAT' : 'GURU AKADEMIK'}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onOpenResetPassword}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-kepawa-900 hover:from-black hover:to-kepawa-950 text-white font-black text-xs shadow-md transition inline-flex items-center gap-2"
          >
            <Key className="w-4 h-4 text-gold-400" />
            <span>Tukar / Reset Kata Laluan Saya</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-left text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sekolah</span>
            <div className="font-bold text-slate-800 mt-0.5">{settings.nama_sekolah}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sesi</span>
            <div className="font-bold text-slate-800 mt-0.5">Tahun {settings.tahun_sesi}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
