import React, { useState } from 'react';
import { 
  Printer, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Download, 
  Calendar, 
  Filter, 
  Award, 
  TrendingUp, 
  Eye, 
  CheckCircle, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { AttendanceRecord, SystemSettings } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface LaporanViewProps {
  records: AttendanceRecord[];
  settings: SystemSettings;
  onOpenFormalPrintModal: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  records,
  settings,
  onOpenFormalPrintModal,
  onRefresh,
  isRefreshing = false
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filteredRecords = records.filter(r => {
    if (selectedPeriod === 'today') return r.tarikh === todayStr;
    if (selectedPeriod === 'week') return r.tarikh >= sevenDaysAgo;
    if (selectedPeriod === 'month') return r.tarikh >= thirtyDaysAgo;
    return true;
  });

  const total = filteredRecords.length;
  const tepatMasa = filteredRecords.filter(r => r.status === 'TEPAT MASA').length;
  const lewat = filteredRecords.filter(r => r.status === 'LEWAT').length;
  const peratus = total > 0 ? Math.round((tepatMasa / total) * 100) : 100;

  const handleExportCsv = () => {
    let csv = "data:text/csv;charset=utf-8,Bil,Tarikh,Masa,Nama Guru,Kelas,Mata Pelajaran,Status,Catatan\n";
    filteredRecords.forEach((r, idx) => {
      csv += `"${idx + 1}","${r.tarikh}","${r.masa}","${r.guru}","${r.kelas}","${r.subjek}","${r.status}","${r.catatan || '-'}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Kehadiran_PdP_SK_Kepawa_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Action Buttons */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-black uppercase">
              LAPORAN SISTEM
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> BUTANG CETAK DIAKTIFKAN
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">Laporan Prestasi Kehadiran PdP SK KEPAWA</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis data kehadiran guru ke bilik darjah bagi sesi akademik 2026.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onRefresh && (
            <button
              id="btn-laporan-segar-semula"
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black shadow-sm transition flex items-center gap-1.5 border ${
                isRefreshing
                  ? 'bg-purple-100 text-purple-950 border-purple-300 cursor-wait'
                  : 'bg-white hover:bg-purple-50 text-slate-800 hover:text-purple-800 border-slate-300 hover:border-purple-300 active:scale-95'
              }`}
              title="Segar Semula Data & Jana Laporan Terkini"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isRefreshing ? 'animate-spin text-purple-800' : ''}`} />
              <span>{isRefreshing ? 'Menjana Laporan...' : 'Segar Semula'}</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl border border-slate-300 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Eksport Data CSV</span>
          </button>

          {/* Fully Activated Formal Report Print Button */}
          <button
            id="btn-cetak-laporan-formal"
            onClick={onOpenFormalPrintModal}
            className="px-5 py-3 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white text-xs font-black rounded-2xl shadow-xl shadow-slate-900/20 transition duration-200 flex items-center gap-2 border border-slate-700 hover:scale-[1.02] active:scale-[0.98]"
            title="Klik untuk cetak atau lihat dokumen rasmi Laporan Formal SK KEPAWA"
          >
            <Printer className="w-4 h-4 text-gold-400" />
            <span className="tracking-wide">CETAK LAPORAN FORMAL</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-slate-500 px-3 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-kepawa-600" /> Tempoh:
          </span>
          <button
            onClick={() => setSelectedPeriod('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${selectedPeriod === 'today' ? 'bg-kepawa-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${selectedPeriod === 'week' ? 'bg-kepawa-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            7 Hari Lepas
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${selectedPeriod === 'month' ? 'bg-kepawa-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setSelectedPeriod('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${selectedPeriod === 'all' ? 'bg-kepawa-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Keseluruhan
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-500 pr-3">
          Jumlah: <strong className="text-slate-900">{total} Rekod</strong>
        </div>
      </div>

      {/* Executive Summary Box (Kekalkan maklumat yang lain) */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-black uppercase text-gold-600 tracking-wider">PEMANTAUAN KURIKULUM 2026</span>
            <h4 className="text-lg font-black text-slate-900 mt-0.5">Ringkasan Analisis Kehadiran Guru (2026)</h4>
            <p className="text-xs text-slate-500">Laporan dikumpulkan secara automatik oleh Sistem G-TEPAT SK Kepawa</p>
          </div>
          <div className="bg-gradient-to-r from-kepawa-50 to-blue-50 border border-kepawa-200 p-4 rounded-2xl text-right flex items-center gap-4">
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Peratus Ketepatan Masa</div>
              <span className="text-3xl font-black text-kepawa-700">{peratus}%</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-kepawa-600 text-white flex items-center justify-center text-xl shadow-md">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Jumlah Imbasan PdP</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{total} Kes</div>
            <div className="text-[11px] text-slate-400 mt-1">Imbasan QR & Pendaftaran</div>
          </div>
          
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Tepat Masa</div>
            <div className="text-3xl font-black text-emerald-700 mt-1">{tepatMasa} Kes</div>
            <div className="text-[11px] text-emerald-600 mt-1">Mengikut toleransi 5 minit</div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <div className="text-xs text-amber-800 font-bold uppercase tracking-wider">Lewat / Catatan</div>
            <div className="text-3xl font-black text-amber-700 mt-1">{lewat} Kes</div>
            <div className="text-[11px] text-amber-600 mt-1">Justifikasi tugas rasmi</div>
          </div>
        </div>

        {/* Administrator Verification Statement */}
        <div className="border-t border-slate-100 pt-5">
          <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-kepawa-600" />
            Akuan Pentadbir Sekolah
          </h5>
          <p className="text-xs text-slate-600 italic leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
            “Laporan ini mengesahkan bahawa semua rekod imbasan QR Kod Kelas oleh guru PdP SK Kepawa telah direkodkan mengikut garis panduan pengurusan masa PdP 2026. Laporan formal lengkap boleh dicetak untuk simpanan fail rasmi pemantauan sekolah.”
          </p>
        </div>

        {/* Quick Preview Callout */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-kepawa-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">Sedia untuk cetakan format rasmi KPM / SK Kepawa</h5>
              <p className="text-xs text-slate-300">Lengkap dengan kepala surat, cop rasmi, perakuan Guru Besar, dan jadual terperinci.</p>
            </div>
          </div>

          <button
            onClick={onOpenFormalPrintModal}
            className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 flex-shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Buka & Cetak Laporan Formal</span>
          </button>
        </div>
      </div>

      {/* Tabulation Table of Attendance in Report View */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800">Senarai Terperinci Log Kehadiran PdP</h4>
          <span className="text-xs font-semibold text-slate-500">Menunjukkan {filteredRecords.length} rekod</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                <th className="p-3.5 pl-5">Bil</th>
                <th className="p-3.5">Tarikh & Masa</th>
                <th className="p-3.5">Nama Guru</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">Mata Pelajaran</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    Tiada rekod kehadiran dijumpai.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, index) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 pl-5 font-bold text-slate-400">{index + 1}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{r.tarikh}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" /> {r.masa}
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{r.guru}</td>
                    <td className="p-3.5 font-extrabold text-kepawa-800">{r.kelas}</td>
                    <td className="p-3.5 font-medium text-slate-700">{r.subjek}</td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${
                        r.status === 'TEPAT MASA' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 italic text-[11px]">{r.catatan || '-'}</td>
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
