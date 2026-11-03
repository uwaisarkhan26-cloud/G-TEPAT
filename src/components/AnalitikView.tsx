import React from 'react';
import { PieChart, TrendingUp, CheckCircle2, AlertTriangle, Printer, FileText, RefreshCw } from 'lucide-react';
import { AttendanceRecord } from '../types';

interface AnalitikViewProps {
  records: AttendanceRecord[];
  onOpenFormalPrintModal: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AnalitikView: React.FC<AnalitikViewProps> = ({ 
  records, 
  onOpenFormalPrintModal,
  onRefresh,
  isRefreshing = false
}) => {
  const total = records.length;
  const tepat = records.filter(r => r.status === 'TEPAT MASA').length;
  const lewat = records.filter(r => r.status === 'LEWAT').length;
  const percent = total > 0 ? Math.round((tepat / total) * 100) : 100;

  // Breakdown by teacher
  const teacherStats: Record<string, { total: number; tepat: number; lewat: number }> = {};
  records.forEach(r => {
    if (!teacherStats[r.guru]) {
      teacherStats[r.guru] = { total: 0, tepat: 0, lewat: 0 };
    }
    teacherStats[r.guru].total += 1;
    if (r.status === 'TEPAT MASA') teacherStats[r.guru].tepat += 1;
    else teacherStats[r.guru].lewat += 1;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase">
              ANALITIK PRESTASI
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">Analitik & Visualisasi Kehadiran</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Statistik ketepatan masa PdP guru SK Kepawa bagi tahun 2026.</p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              id="btn-analitik-segar-semula"
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black shadow-sm transition flex items-center gap-1.5 border ${
                isRefreshing
                  ? 'bg-purple-100 text-purple-950 border-purple-300 cursor-wait'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200 active:scale-95'
              }`}
              title="Segar Semula Data Analitik"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isRefreshing ? 'animate-spin text-purple-800' : ''}`} />
              <span>{isRefreshing ? 'Menjana Analitik...' : 'Segar Semula'}</span>
            </button>
          )}

          <button
            onClick={onOpenFormalPrintModal}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-gold-400" />
            <span>Cetak Laporan Formal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut Ratio Card */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6">
            Nisbah Keseluruhan Ketepatan Masa
          </h4>

          {/* Donut representation */}
          <div className="relative w-48 h-48 rounded-full border-[18px] border-emerald-500 border-t-amber-500 flex items-center justify-center shadow-inner">
            <div className="text-center">
              <span className="text-4xl font-black text-slate-900">{percent}%</span>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Tepat Masa</div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-6 text-xs font-bold">
            <span className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Tepat Masa ({tepat})
            </span>
            <span className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span> Lewat ({lewat})
            </span>
          </div>
        </div>

        {/* System Evaluation Card */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-gold-600 mb-2">
              <TrendingUp className="w-4 h-4" /> Impak & Penilaian Program
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-3">Penilaian Sistem G-TEPAT 2026</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pelaksanaan imbasan QR Kod Bilik Darjah membolehkan pentadbir SK KEPAWA memantau ketepatan masa guru masuk ke kelas secara langsung. Ini meningkatkan masa instruksional (MMI) dan pembelajaran bermakna untuk murid.
            </p>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-semibold text-slate-700">
            <div className="flex justify-between">
              <span>Sasaran Ketepatan Masa (KPI):</span>
              <strong className="text-slate-900">≥ 95.0%</strong>
            </div>
            <div className="flex justify-between">
              <span>Status Semasa:</span>
              <strong className={percent >= 90 ? 'text-emerald-600' : 'text-amber-600'}>
                {percent >= 90 ? 'Cemerlang / Mencapai Sasaran' : 'Dalam Pemantauan'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800">Prestasi Kehadiran Mengikut Guru</h4>
          <span className="text-xs font-semibold text-slate-500">{Object.keys(teacherStats).length} Guru Dikesan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                <th className="p-3.5 pl-5">Nama Guru</th>
                <th className="p-3.5 text-center">Jumlah Sesi</th>
                <th className="p-3.5 text-center">Tepat Masa</th>
                <th className="p-3.5 text-center">Lewat</th>
                <th className="p-3.5 text-right pr-5">Peratus Ketepatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(teacherStats).map(([guruName, stat]) => {
                const pct = stat.total > 0 ? Math.round((stat.tepat / stat.total) * 100) : 100;
                return (
                  <tr key={guruName} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 pl-5 font-black text-slate-900">{guruName}</td>
                    <td className="p-3.5 text-center font-bold text-slate-700">{stat.total}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-700">{stat.tepat}</td>
                    <td className="p-3.5 text-center font-bold text-amber-700">{stat.lewat}</td>
                    <td className="p-3.5 text-right pr-5 font-black text-kepawa-700 text-sm">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
