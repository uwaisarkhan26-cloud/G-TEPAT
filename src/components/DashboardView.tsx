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
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#430b15] via-[#34070f] to-[#200409] text-white shadow-[0_0_26px_rgba(245,158,11,0.14)] border border-amber-400/60 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#1a0307] text-amber-300 border border-amber-500/45">
              DASHBOARD &amp; LIVE MONITORING 2026
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-900/70 text-emerald-300 border border-emerald-400/50 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>SISTEM AKTIF SEPENUHNYA (100% OPERASIONAL)</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-white">
            Selamat Datang, {session.nama}!
          </h2>
          <p className="text-xs text-amber-100/80 mt-1.5 max-w-xl leading-relaxed">
            Sistem Pemantauan Kehadiran Guru ke Kelas &amp; Jadual Waktu Induk SK KEPAWA (Kod XBA6019). Akses penuh dibuka untuk semua guru dan staf.
          </p>
        </div>

        <div className="z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('scan-qr')}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-[#240509] font-black text-xs shadow-lg shadow-amber-500/25 border border-amber-200 transition flex items-center gap-2 transform active:scale-95 cursor-pointer"
            title="Imbas Kod QR Pintu Bilik Darjah"
          >
            <Camera className="w-4 h-4 text-[#240509]" />
            <span>IMBAS QR MASUK KELAS</span>
          </button>
          <button
            id="btn-hero-monitoring-live"
            onClick={() => onNavigate('monitoring-live')}
            className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs shadow-lg transition flex items-center gap-2 transform active:scale-95 border border-emerald-400/50 cursor-pointer"
            title="Buka Panel Pemantauan Masa Nyata (Live Radar PdP)"
          >
            <Radio className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>PANEL MONITORING LIVE</span>
          </button>
          <button
            onClick={() => onNavigate('kelas')}
            className="px-4 py-3 rounded-2xl bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-200 font-bold text-xs transition flex items-center gap-2 border border-amber-500/45 cursor-pointer"
            title="Pengurusan Kelas & Senarai Murid"
          >
            <School className="w-4 h-4 text-amber-400" />
            <span>KELAS &amp; MURID</span>
          </button>
          <button
            onClick={() => onNavigate('qr')}
            className="px-4 py-3 rounded-2xl bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-200 font-bold text-xs transition flex items-center gap-2 border border-amber-500/45 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>PANEL QR KELAS</span>
          </button>
          <button
            onClick={onOpenFormalPrintModal}
            className="px-4 py-3 rounded-2xl bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-300 font-black text-xs transition flex items-center gap-2 border border-amber-400/55 shadow cursor-pointer"
            title="Cetak Laporan Formal Kehadiran"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>CETAK LAPORAN</span>
          </button>
        </div>
      </div>

      {/* Live Monitoring Widget */}
      <div className="bg-[#240509] p-6 rounded-3xl border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.08)] space-y-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/25 pb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-amber-300 uppercase">Live Pemantauan Kehadiran Guru ke Kelas</h3>
                <span className="px-2 py-0.5 rounded-full bg-red-600/80 text-white border border-red-400/50 text-[10px] font-black uppercase animate-pulse">
                  RADAR LIVE
                </span>
              </div>
              <p className="text-xs text-amber-100/75">Status masa nyata imbasan QR kelas oleh semua guru PdP hari ini</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-dashboard-go-live-monitoring"
              onClick={() => onNavigate('monitoring-live')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#240509] text-xs font-black transition flex items-center gap-1.5 shadow cursor-pointer"
              title="Buka Panel Pemantauan Masa Nyata Penuh"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#240509]" />
              <span>Panel Live Penuh</span>
            </button>
            {onRefresh && (
              <button
                id="btn-dashboard-segar-semula"
                onClick={onRefresh}
                disabled={isRefreshing}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                  isRefreshing
                    ? 'bg-amber-400/20 text-amber-200 border-amber-400/50 cursor-wait'
                    : 'bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-200 border-amber-500/40 active:scale-95'
                }`}
                title="Segar Semula Data Kehadiran Masa Nyata"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Menyegerakkan...' : 'Segar Semula'}</span>
              </button>
            )}
            <button
              onClick={onOpenFormalPrintModal}
              className="px-3.5 py-2 rounded-xl bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-300 border border-amber-500/45 text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" /> Cetak Laporan Formal
            </button>
            <button
              onClick={() => onNavigate('rekod')}
              className="px-3.5 py-2 rounded-xl bg-[#1a0307] hover:bg-[#32070f] text-amber-100 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ListChecks className="w-3.5 h-3.5 text-amber-400" /> Semua Rekod
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#180306] border border-amber-500/40">
            <div className="text-xs font-bold text-amber-200 uppercase">Imbasan Hari Ini</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{todayRecords.length} Kehadiran</div>
            <div className="text-[11px] text-amber-100/70 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Dikemaskini secara automatik
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#180306] border border-amber-500/40">
            <div className="text-xs font-bold text-amber-200 uppercase">Kadar Ketepatan Masa</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{accuracyRate}%</div>
            <div className="text-[11px] text-amber-100/70 mt-1">Mengikut toleransi masa sekolah</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#180306] border border-amber-500/40">
            <div className="text-xs font-bold text-amber-200 uppercase">Kelulusan Lewat / Catatan</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{lateCount} Kes</div>
            <div className="text-[11px] text-amber-100/70 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" /> Memerlukan semakan pentadbir
            </div>
          </div>
        </div>

        {/* Live Ticker Feed */}
        <div className="border border-amber-500/35 rounded-2xl overflow-hidden bg-[#180306]">
          <div className="px-4 py-2.5 bg-[#32070f] text-amber-300 border-b border-amber-500/30 text-xs font-black flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" /> LOG KEHADIRAN TERKINI
            </span>
            <span className="text-[10px] text-amber-100/75">Tarikh: {today}</span>
          </div>

          <div className="divide-y divide-amber-500/20 max-h-48 overflow-y-auto">
            {todayRecords.length === 0 ? (
              <div className="p-4 text-center text-xs text-amber-100/60 italic">
                Belum ada aktiviti imbasan QR hari ini.
              </div>
            ) : (
              todayRecords.map(rec => (
                <div key={rec.id} className="p-3 bg-[#240509] hover:bg-[#32070f] transition flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-[#240509] font-black flex items-center justify-center text-xs">
                      {rec.guru.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white">{rec.guru}</p>
                      <p className="text-[11px] text-amber-100/75 font-mono">
                        Kelas: <strong className="text-amber-300">{rec.kelas}</strong> | Subjek: {rec.subjek}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      rec.status === 'TEPAT MASA' ? 'bg-emerald-700 text-white' : 'bg-amber-400 text-[#240509]'
                    }`}>
                      {rec.status}
                    </span>
                    <div className="text-[10px] text-amber-200/70 mt-0.5 flex items-center gap-1 justify-end">
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
        <div className="p-5 rounded-3xl bg-[#240509] border border-amber-500/40 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-200/80 uppercase">Jumlah Rekod</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{records.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#3a0a12] border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl">
            <ListChecks className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#240509] border border-amber-500/40 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-200/80 uppercase">Jumlah Kelas</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{classes.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#3a0a12] border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl">
            <School className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#240509] border border-amber-500/40 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-200/80 uppercase">Subjek Didaftar</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{subjects.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#3a0a12] border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#240509] border border-amber-500/40 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-200/80 uppercase">Waktu Mula PdP</span>
            <div className="text-xl font-black text-amber-400 mt-1">7.00 PAGI</div>
            <div className="text-[10px] text-amber-100/75 mt-0.5 font-semibold">Zon Tepat Masa: 06:55 – 07:05 PG (±5 min)</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#3a0a12] border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
