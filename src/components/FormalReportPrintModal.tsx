import React, { useState } from 'react';
import { AttendanceRecord, SystemSettings } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { Printer, Download, Filter, X, CheckCircle2, AlertTriangle, FileText, Calendar, Building2, UserCheck } from 'lucide-react';

interface FormalReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: AttendanceRecord[];
  settings: SystemSettings;
}

export const FormalReportPrintModal: React.FC<FormalReportPrintModalProps> = ({
  isOpen,
  onClose,
  records,
  settings
}) => {
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'TEPAT MASA' | 'LEWAT'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filteredRecords = records.filter(r => {
    // Date filter
    if (dateFilter === 'today' && r.tarikh !== todayStr) return false;
    if (dateFilter === 'week' && r.tarikh < sevenDaysAgo) return false;
    if (dateFilter === 'month' && r.tarikh < thirtyDaysAgo) return false;

    // Status filter
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;

    // Class filter
    if (selectedClass !== 'all' && r.kelas !== selectedClass) return false;

    return true;
  });

  const total = filteredRecords.length;
  const tepat = filteredRecords.filter(r => r.status === 'TEPAT MASA').length;
  const lewat = filteredRecords.filter(r => r.status === 'LEWAT').length;
  const peratus = total > 0 ? Math.round((tepat / total) * 100) : 100;

  // Grouping by subject for summary table
  const subjectSummary: Record<string, { total: number; tepat: number; lewat: number }> = {};
  filteredRecords.forEach(r => {
    const sbj = r.subjek || 'PdP Umum';
    if (!subjectSummary[sbj]) {
      subjectSummary[sbj] = { total: 0, tepat: 0, lewat: 0 };
    }
    subjectSummary[sbj].total += 1;
    if (r.status === 'TEPAT MASA') subjectSummary[sbj].tepat += 1;
    else subjectSummary[sbj].lewat += 1;
  });

  const uniqueClasses = Array.from(new Set(records.map(r => r.kelas))).filter(Boolean);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    let csv = "data:text/csv;charset=utf-8,Bil,Tarikh,Masa,Nama Guru,Kelas,Mata Pelajaran,Status,Catatan\n";
    filteredRecords.forEach((r, idx) => {
      csv += `"${idx + 1}","${r.tarikh}","${r.masa}","${r.guru}","${r.kelas}","${r.subjek}","${r.status}","${r.catatan || '-'}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Formal_G-TEPAT_SK_KEPAWA_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedDate = new Date().toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full flex flex-col border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none print:my-0">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white p-4 px-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Paparan Cetak Laporan Formal
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-400 text-slate-950 uppercase">
                  Rasmi KPM / SKK
                </span>
              </h3>
              <p className="text-xs text-slate-400">Format rasmi laporan pemantauan kehadiran PdP SK KEPAWA</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Eksport CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 text-xs font-black shadow-lg transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>CETAK LAPORAN SEKARANG</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls (Hidden in Print) */}
        <div className="no-print bg-slate-50 border-b border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-600 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-kepawa-600" /> Tapis Data:
            </span>

            {/* Date filter */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1 rounded-md font-bold transition ${dateFilter === 'today' ? 'bg-kepawa-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`px-3 py-1 rounded-md font-bold transition ${dateFilter === 'week' ? 'bg-kepawa-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-3 py-1 rounded-md font-bold transition ${dateFilter === 'month' ? 'bg-kepawa-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Bulan Ini
              </button>
              <button
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1 rounded-md font-bold transition ${dateFilter === 'all' ? 'bg-kepawa-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Semua
              </button>
            </div>

            {/* Class filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-kepawa-500"
            >
              <option value="all">Semua Kelas</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-kepawa-500"
            >
              <option value="all">Semua Status</option>
              <option value="TEPAT MASA">Hanya Tepat Masa</option>
              <option value="LEWAT">Hanya Lewat / Catatan</option>
            </select>
          </div>

          <div className="text-slate-500 font-medium">
            Menunjukkan <strong className="text-slate-900 font-bold">{filteredRecords.length}</strong> daripada {records.length} rekod
          </div>
        </div>

        {/* ======================================================== */}
        {/* OFFICIAL PRINTABLE FORMAL REPORT SHEET                   */}
        {/* ======================================================== */}
        <div className="print-area p-6 sm:p-10 md:p-12 overflow-y-auto max-h-[75vh] print:max-h-none print:overflow-visible text-slate-900 font-serif leading-normal bg-white">
          
          {/* Official Letterhead (Kepala Surat Rasmi) */}
          <div className="border-b-4 border-double border-slate-900 pb-5 mb-6">
            <div className="flex items-center justify-between gap-6">
              {/* School Logo */}
              <div className="w-24 h-28 flex-shrink-0">
                <SchoolLogo className="w-full h-full" />
              </div>

              {/* Letterhead Text Header */}
              <div className="flex-grow text-center font-sans">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">KEMENTERIAN PENDIDIKAN MALAYSIA</h4>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">JABATAN PENDIDIKAN NEGERI SABAH | PPD BEAUFORT</h4>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase mt-0.5">
                  SEKOLAH KEBANGSAAN KEPAWA
                </h1>
                <p className="text-[11px] text-slate-600 font-normal mt-0.5">
                  Peti Surat 123, 89807 Beaufort, Sabah | Kod Sekolah: <span className="font-bold font-mono">XBA0012</span> | Emel: xba0012@moe.edu.my
                </p>
                <div className="mt-1 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>“USAHA JAYA”</span> • <span>SISTEM G-TEPAT (GURU TEPAT, PDP HEBAT)</span>
                </div>
              </div>

              {/* QR Badge / Code */}
              <div className="w-20 text-center flex-shrink-0 font-sans hidden sm:block">
                <div className="border border-slate-300 rounded p-1 inline-block">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=SKK-GTEPAT-FORMAL-REPORT"
                    alt="Kod Rasmi"
                    className="w-16 h-16 mx-auto"
                  />
                  <span className="text-[9px] font-mono block text-slate-500 font-bold mt-0.5">DOKUMEN RASMI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Numbers and Date Metadata */}
          <div className="flex justify-between items-start text-xs font-sans text-slate-700 mb-6 pb-2 border-b border-slate-200">
            <div>
              <div className="flex gap-2">
                <span className="font-bold w-24">No. Rujukan:</span>
                <span className="font-mono">SKK/600-4/1/1/(2026/GTEPAT)</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-24">Kategori:</span>
                <span>Laporan Pengurusan & Pemantauan Kehadiran PdP Guru</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex gap-2 justify-end">
                <span className="font-bold">Tarikh Cetakan:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex gap-2 justify-end">
                <span className="font-bold">Sesi Persekolahan:</span>
                <span className="font-bold">Tahun 2026</span>
              </div>
            </div>
          </div>

          {/* Document Title Header */}
          <div className="text-center my-6 font-sans">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900 underline decoration-2 underline-offset-4">
              LAPORAN FORMAL PEMANTAUAN KEHADIRAN GURU KE KELAS (PdP)
            </h2>
            <p className="text-xs font-bold text-slate-600 mt-1 uppercase">
              SISTEM KEHADIRAN DIGITAL G-TEPAT SK KEPAWA
            </p>
          </div>

          {/* Executive Summary Box */}
          <div className="my-6 p-4 rounded-xl border-2 border-slate-800 bg-slate-50/70 font-sans">
            <h4 className="text-xs font-black uppercase text-slate-900 mb-3 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-kepawa-700" />
              1.0 RINGKASAN EKSEKUTIF & PETUNJUK PRESTASI UTAMA (KPI)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-lg border border-slate-300">
                <div className="text-[10px] uppercase font-bold text-slate-500">Jumlah Sesi PdP</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">{total} Sesi</div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-300">
                <div className="text-[10px] uppercase font-bold text-emerald-800">Tepat Masa (≤ 5 Min)</div>
                <div className="text-xl font-black text-emerald-700 mt-0.5">{tepat} Sesi</div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-amber-300">
                <div className="text-[10px] uppercase font-bold text-amber-800">Lewat / Bertugas</div>
                <div className="text-xl font-black text-amber-700 mt-0.5">{lewat} Sesi</div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-kepawa-300">
                <div className="text-[10px] uppercase font-bold text-kepawa-800">Kadar Ketepatan</div>
                <div className="text-xl font-black text-kepawa-700 mt-0.5">{peratus}%</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 mt-3 italic leading-relaxed">
              * Nota: Sasaran ketepatan masa kehadiran PdP SK Kepawa adalah sekurang-kurangnya <strong>95.0%</strong> bagi memastikan masa instruksional guru di dalam bilik darjah dioptimumkan sepenuhnya.
            </p>
          </div>

          {/* Section 2: Detailed Records Tabulation Table */}
          <div className="my-6 font-sans">
            <h4 className="text-xs font-black uppercase text-slate-900 mb-2">
              2.0 JADUAL LOG PERINCIAN KEHADIRAN GURU MENGIKUT IMBASAN QR KELAS
            </h4>

            <div className="border border-slate-900 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                    <th className="p-2 border-r border-slate-700 text-center w-10">BIL</th>
                    <th className="p-2 border-r border-slate-700 w-24">TARIKH</th>
                    <th className="p-2 border-r border-slate-700 w-20 text-center">MASA</th>
                    <th className="p-2 border-r border-slate-700">NAMA GURU</th>
                    <th className="p-2 border-r border-slate-700 w-24 text-center">KELAS</th>
                    <th className="p-2 border-r border-slate-700 w-32">MATA PELAJARAN</th>
                    <th className="p-2 border-r border-slate-700 w-24 text-center">STATUS</th>
                    <th className="p-2">CATATAN / JUSTIFIKASI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                        Tiada rekod kehadiran ditemui bagi tapisan yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, index) => (
                      <tr key={r.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                        <td className="p-2 border-r border-slate-300 text-center font-bold">{index + 1}</td>
                        <td className="p-2 border-r border-slate-300 font-mono text-[10px]">{r.tarikh}</td>
                        <td className="p-2 border-r border-slate-300 font-mono text-center text-[10px] font-bold">{r.masa}</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{r.guru}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-extrabold text-slate-800">{r.kelas}</td>
                        <td className="p-2 border-r border-slate-300 font-medium text-slate-700">{r.subjek}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            r.status === 'TEPAT MASA' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600 italic text-[10px]">{r.catatan || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Summary by Subject */}
          <div className="my-6 font-sans">
            <h4 className="text-xs font-black uppercase text-slate-900 mb-2">
              3.0 ANALISIS MENGIKUT MATA PELAJARAN / PANITIA
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(subjectSummary).map(([subjekName, stats]) => {
                const subjekPercent = stats.total > 0 ? Math.round((stats.tepat / stats.total) * 100) : 100;
                return (
                  <div key={subjekName} className="p-2.5 rounded-lg border border-slate-300 bg-white flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{subjekName}</div>
                      <div className="text-[10px] text-slate-500">{stats.total} Sesi PdP ({stats.tepat} Tepat, {stats.lewat} Lewat)</div>
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">{subjekPercent}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Administrator Acknowledgment & Verification */}
          <div className="my-6 p-4 rounded-xl border border-slate-300 bg-slate-50/50 font-sans text-xs">
            <h4 className="text-xs font-black uppercase text-slate-900 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-slate-700" />
              4.0 PERAKUAN & ULASAN PENTADBIR
            </h4>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              Laporan ini dijana secara automatik berasaskan log imbasan masa nyata Kod QR Bilik Darjah dalam aplikasi <strong>G-TEPAT SK KEPAWA</strong>. Rekod ini sah dan diperakukan bagi tujuan pemantauan keberadaan guru serta pelaporan pengurusan kurikulum sekolah 2026.
            </p>
          </div>

          {/* Dual Official Signature & Stamp Area */}
          <div className="mt-10 pt-6 border-t-2 border-slate-400 font-sans text-xs">
            <div className="grid grid-cols-2 gap-8 text-slate-900">
              {/* Prepared By (Penyelaras G-TEPAT) */}
              <div>
                <p className="font-bold uppercase text-[11px] text-slate-600 mb-14">Disediakan Oleh:</p>
                <div className="border-t border-slate-900 pt-1.5 max-w-xs">
                  <p className="font-bold uppercase text-xs">{settings.pk_pentadbiran || 'NURTITAH BINTI MEMBUAI'}</p>
                  <p className="text-[10px] text-slate-600">Penolong Kanan Pentadbiran / Kurikulum</p>
                  <p className="text-[10px] text-slate-600 font-semibold">SK KEPAWA, BEAUFORT</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">Tarikh: {formattedDate}</p>
                </div>
              </div>

              {/* Verified & Approved By (Guru Besar) */}
              <div className="relative">
                <p className="font-bold uppercase text-[11px] text-slate-600 mb-14">Disahkan & Diperakukan Oleh:</p>
                
                {/* Simulated Official Seal Stamp */}
                <div className="absolute top-4 right-10 w-24 h-24 rounded-full border-2 border-dashed border-red-600/40 text-red-600/40 flex flex-col items-center justify-center text-center p-1 pointer-events-none transform -rotate-12 select-none">
                  <span className="text-[7px] font-black uppercase tracking-wider">SK KEPAWA</span>
                  <span className="text-[8px] font-black uppercase">COP RASMI</span>
                  <span className="text-[7px] font-bold">BEAUFORT SABAH</span>
                </div>

                <div className="border-t border-slate-900 pt-1.5 max-w-xs">
                  <p className="font-black uppercase text-xs">{settings.guru_besar || 'MOHD ZAHARI BIN TIBIN'}</p>
                  <p className="text-[10px] text-slate-600">Guru Besar</p>
                  <p className="text-[10px] text-slate-600 font-semibold">SK KEPAWA, BEAUFORT</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">Tarikh: {formattedDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer watermark & page count */}
          <div className="mt-8 pt-3 border-t border-slate-200 text-center font-sans text-[10px] text-slate-400 flex items-center justify-between">
            <span>Sistem Pengurusan Kehadiran Guru PdP G-TEPAT © 2026 SK KEPAWA</span>
            <span className="font-mono">Mukasurat 1 / 1</span>
            <span>Dicetak Pada: {new Date().toLocaleTimeString('ms-MY')}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
