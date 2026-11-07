import React from 'react';
import { Users, Shield, UserCheck, Key, X, Check, Sparkles } from 'lucide-react';
import { INITIAL_USERS } from '../data/initialData';

interface TestAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, pass: string) => void;
}

export const TestAccountsModal: React.FC<TestAccountsModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Senarai Pengguna DELIMa SK Kepawa (2026)</h3>
              <p className="text-xs text-slate-500">Klik mana-mana akaun guru untuk log masuk atau auto-fill borang.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5 overflow-y-auto pr-1 flex-grow max-h-[55vh]">
          {INITIAL_USERS.map((user, idx) => {
            const isGb = user.role === 'admin';
            const isPk = user.role === 'pentadbir';
            const isPenyelaras = user.role === 'penyelaras';

            const bgClass = isGb 
              ? 'bg-purple-50/70 border-purple-200 hover:border-purple-400' 
              : isPk 
                ? 'bg-amber-50/70 border-amber-200 hover:border-amber-400' 
                : isPenyelaras
                  ? 'bg-teal-50/70 border-teal-200 hover:border-teal-400'
                  : 'bg-slate-50 border-slate-200 hover:border-blue-400';

            return (
              <div
                key={user.id}
                onClick={() => {
                  onSelectAccount(user.email, 'XBA6019');
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 group ${bgClass}`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isGb ? 'bg-purple-200 text-purple-900' :
                      isPk ? 'bg-amber-200 text-amber-900' :
                      isPenyelaras ? 'bg-teal-200 text-teal-900' :
                      'bg-emerald-100 text-emerald-900'
                    }`}>
                      {isGb && <Shield className="w-3 h-3" />}
                      {isPk && <UserCheck className="w-3 h-3" />}
                      {isPenyelaras && <Sparkles className="w-3 h-3" />}
                      ROLE: {user.role === 'admin' ? 'ADMIN / GURU BESAR' : user.role === 'pentadbir' ? 'PENTADBIR / PK' : user.role === 'penyelaras' ? 'PENYELARAS G-TEPAT' : 'GURU'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Aktif
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                    {idx + 1}. {user.nama}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {user.email} | Pass Sementara: <code className="bg-white px-1.5 py-0.5 rounded border font-bold text-slate-800">XBA6019</code>
                  </div>
                </div>

                <button
                  type="button"
                  className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-white group-hover:bg-blue-600 group-hover:text-white text-slate-700 text-xs font-bold border border-slate-200 group-hover:border-transparent transition shadow-sm flex items-center gap-1.5"
                >
                  <Key className="w-3 h-3 text-gold-500 group-hover:text-white" />
                  <span>Pilih Akaun</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
