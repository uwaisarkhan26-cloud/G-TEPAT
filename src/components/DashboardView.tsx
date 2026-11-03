import React from 'react';
import { 
  Camera, 
  QrCode, 
  ListChecks, 
  School, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Radio, 
  FileText,
  Printer,
  RefreshCw
} from 'lucide-react';
import { SessionData, AttendanceRecord, ClassItem, SubjectItem } from '../types';

interface DashboardViewProps {
  session: SessionData;
  records: AttendanceRecord[];
  classes: ClassItem[];
  subjects: SubjectItem[];
  onNavigate: (tab: string) => void;
  onOpenFormalPrintModal: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  session,
  records,
  classes,
  subjects,
  onNavigate,
  onOpenFormalPrintModal,
  onRefresh,
  isRefreshing = false
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.tarikh === today);
  const tepatCount = todayRecords.filter(r => r.status === 'TEPAT MASA').length;
  const accuracyRate = todayRecords.length > 0 ? Math.round((tepatCount / todayRecords.length) * 100) : 100;
  const lateCount = todayRecords.filter(r => r.status !== 'TEPAT MASA').length;

  const isAdminOrPk = session.role === 'admin' || session.role === 'pentadbir' || session.role === 'penyelaras';

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-kepawa-800 via-kepawa-900 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-gold-500/20 text-gold-400 border border-gold-500/30">
              DASHBOARD & LIVE MONITORING 2026
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>SISTEM AKTIF SEPENUHNYA (100% OPERASIONAL)</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Selamat Datang, {session.nama}!</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Sistem Pemantauan Kehadiran Guru ke Kelas & Jadual Waktu Induk SK KEPAWA. Akses penuh dibuka untuk semua guru dan staf.
          </p>
        </div>

        <div className="z-10 flex flex-wrap items-center gap-3">
          <button
            id="btn-hero-monitoring-live"
            onClick={() => onNavigate('monitoring-live')}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 transform active:scale-95 border-2 border-emerald-300 cursor-pointer"
            title="Buka Panel Pemantauan Masa Nyata (Live Radar PdP)"
          >
            <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>PANEL MONITORING LIVE</span>
          </button>
          <button
            onClick={() => onNavigate('scan-qr')}
            className="px-5 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 transform active:scale-95 cursor-pointer"
            title="Imbas Kod QR Pintu Bilik Darjah"
          >
            <Camera className="w-4 h-4" />
            <span>IMBAS QR MASUK KELAS</span>
          </button>
          <button
            onClick={() => onNavigate('kelas')}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur transition flex items-center gap-2 border border-white/20 cursor-pointer"
            title="Pengurusan Kelas & Senarai Murid"
          >
            <School className="w-4 h-4 text-emerald-400" />
            <span>KELAS & MURID</span>
          </button>
          <button
            onClick={() => onNavigate('qr')}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur transition flex items-center gap-2 border border-white/20 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>PANEL QR KELAS</span>
          </button>
          <button
            onClick={onOpenFormalPrintModal}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-2 border border-slate-700 shadow cursor-pointer"
            title="Cetak Laporan Formal Kehadiran"
          >
            <Printer className="w-4 h-4 text-gold-400" />
            <span>CETAK LAPORAN</span>
          </button>
        </div>
      </div>

      {/* Live Monitoring Widget (Aktif Sepenuhnya Untuk Semua Pengguna) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 uppercase">Live Pemantauan Kehadiran Guru ke Kelas</h3>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase animate-pulse">
                  RADAR LIVE
                </span>
              </div>
              <p className="text-xs text-slate-500">Status masa nyata imbasan QR kelas oleh semua guru PdP hari ini</p>
            </div>
          </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-dashboard-go-live-monitoring"
                onClick={() => onNavigate('monitoring-live')}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow"
                title="Buka Panel Pemantauan Masa Nyata Penuh"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-red-200" />
                <span>Panel Live Penuh</span>
              </button>
              {onRefresh && (
                <button
                  id="btn-dashboard-segar-semula"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm ${
                    isRefreshing
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 cursor-wait'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 active:scale-95'
                  }`}
                  title="Segar Semula Data Kehadiran Masa Nyata"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin text-emerald-800' : ''}`} />
                  <span>{isRefreshing ? 'Menyegerakkan...' : 'Segar Semula'}</span>
                </button>
              )}
              <button
                onClick={onOpenFormalPrintModal}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <FileText className="w-3.5 h-3.5 text-gold-400" /> Cetak Laporan Formal
              </button>
              <button
                onClick={() => onNavigate('rekod')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <ListChecks className="w-3.5 h-3.5" /> Semua Rekod
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-800 uppercase">Imbasan Hari Ini</div>
              <div className="text-2xl font-black text-emerald-900 mt-1">{todayRecords.length} Kehadiran</div>
              <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Dikemaskini secara automatik
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="text-xs font-bold text-blue-800 uppercase">Kadar Ketepatan Masa</div>
              <div className="text-2xl font-black text-blue-900 mt-1">{accuracyRate}%</div>
              <div className="text-[11px] text-blue-700 mt-1">Mengikut toleransi masa sekolah</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="text-xs font-bold text-amber-800 uppercase">Kelulusan Lewat / Catatan</div>
              <div className="text-2xl font-black text-amber-900 mt-1">{lateCount} Kes</div>
              <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Memerlukan semakan pentadbir
              </div>
            </div>
          </div>

          {/* Live Ticker Feed */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
            <div className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" /> LOG KEHADIRAN TERKINI
              </span>
              <span className="text-[10px] text-slate-400">Tarikh: {today}</span>
            </div>

            <div className="divide-y divide-slate-200 max-h-48 overflow-y-auto">
              {todayRecords.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  Belum ada aktiviti imbasan QR hari ini.
                </div>
              ) : (
                todayRecords.map(rec => (
                  <div key={rec.id} className="p-3 bg-white hover:bg-slate-50 transition flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-kepawa-100 text-kepawa-700 font-bold flex items-center justify-center text-xs">
                        {rec.guru.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{rec.guru}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Kelas: <strong>{rec.kelas}</strong> | Subjek: {rec.subjek}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        rec.status === 'TEPAT MASA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" /> {rec.masa}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Jumlah Rekod</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{records.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-kepawa-100 text-kepawa-700 flex items-center justify-center text-xl">
            <ListChecks className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Jumlah Kelas</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{classes.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl">
            <School className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Subjek Didaftar</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{subjects.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Waktu Mula PdP</span>
            <div className="text-xl font-black text-slate-900 mt-1">7.00 PAGI</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
