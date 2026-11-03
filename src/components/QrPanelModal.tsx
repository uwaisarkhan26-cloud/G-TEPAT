import React, { useState, useMemo } from 'react';
import { 
  QrCode, 
  Printer, 
  Download, 
  X, 
  Eye, 
  Check, 
  Search, 
  Filter, 
  Copy, 
  Camera, 
  Sparkles, 
  School, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  FileText
} from 'lucide-react';
import { ClassItem } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { QrCodeRenderer } from './QrCodeRenderer';
import QRCode from 'qrcode';

interface QrViewProps {
  classes: ClassItem[];
  onOpenClassQrModal: (className: string, qrPayload: string) => void;
  onNavigateToScanner?: () => void;
}

export const QrView: React.FC<QrViewProps> = ({ 
  classes, 
  onOpenClassQrModal,
  onNavigateToScanner 
}) => {
  const [downloadingClass, setDownloadingClass] = useState<string | null>(null);
  const [copiedClass, setCopiedClass] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDarjah, setSelectedDarjah] = useState<string>('all');
  const [qrFormat, setQrFormat] = useState<'url' | 'code'>('url');
  const [printLayoutMode, setPrintLayoutMode] = useState<'individual' | 'grid'>('individual');
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // Generate payload based on format
  const getClassPayload = (cls: ClassItem) => {
    if (qrFormat === 'url') {
      const origin = window.location.origin;
      return `${origin}/?scan=${encodeURIComponent(cls.nama)}`;
    }
    return cls.qr_code || ('SKK-2026-' + cls.nama.replace(/\s+/g, ''));
  };

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchSearch = cls.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cls.guru_kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (cls.pembantu_guru_kelas && cls.pembantu_guru_kelas.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDarjah = selectedDarjah === 'all' || cls.darjah.toString() === selectedDarjah;
      return matchSearch && matchDarjah;
    });
  }, [classes, searchQuery, selectedDarjah]);

  const handleDownloadQr = async (className: string, payload: string) => {
    try {
      setDownloadingClass(className);
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 1200,
        margin: 3,
        color: { dark: '#0f172a', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `POSTER_KOD_QR_SK_KEPAWA_${className.replace(/\s+/g, '_')}_2026.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Download QR Error:', e);
    } finally {
      setTimeout(() => setDownloadingClass(null), 1200);
    }
  };

  const handleCopyPayload = (payload: string, className: string) => {
    navigator.clipboard.writeText(payload);
    setCopiedClass(className);
    setTimeout(() => setCopiedClass(null), 2000);
  };

  const handleTriggerPrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-gold-400 text-slate-950 text-xs font-black uppercase tracking-wider">
              PANEL KOD QR KELAS RASMI
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> AKTIF (SESI 2026)
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Poster Kod QR Pintu Bilik Darjah
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Jana, cetak poster bersaiz A4, atau muat turun fail PNG resolusi tinggi untuk ditampal di pintu bilik darjah bagi imbasan kehadiran guru PdP.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToScanner && (
            <button
              onClick={onNavigateToScanner}
              className="px-3.5 py-2.5 bg-kepawa-50 hover:bg-kepawa-100 text-kepawa-800 border border-kepawa-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Buka Pengimbas Kamera QR Kehadiran"
            >
              <Camera className="w-4 h-4 text-kepawa-700" />
              <span>Buka Pengimbas Kamera</span>
            </button>
          )}

          <button
            onClick={() => {
              setPrintLayoutMode('individual');
              setIsPrintPreviewOpen(true);
            }}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center gap-2"
            title="Pratonton & Cetak Lembaran Poster Lengkap A4"
          >
            <Printer className="w-4 h-4 text-gold-400" />
            <span>Cetak Semua Poster A4</span>
          </button>
        </div>
      </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Format Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" /> Format QR:
            </span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setQrFormat('url')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                  qrFormat === 'url'
                    ? 'bg-white text-kepawa-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sesuai diimbas terus menggunakan kamera telefon bimbit biasa (Samsung / iPhone / Google Lens) atau dalam app"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>Pautan Web Pintar (Kamera Telefon)</span>
              </button>
              <button
                onClick={() => setQrFormat('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                  qrFormat === 'code'
                    ? 'bg-white text-kepawa-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Format teks kod ringkas SKK-2026-XXXX"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Kod Teks Sahaja</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Tahun:
              </span>
              <div className="flex flex-wrap gap-1">
                {['all', '1', '2', '3', '4', '5', '6'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDarjah(d)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                      selectedDarjah === d
                        ? 'bg-kepawa-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d === 'all' ? 'Semua' : `T${d}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kelas, guru..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-kepawa-500"
              />
            </div>
          </div>
        </div>

        {/* Grid of Class QR Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => {
            const qrPayload = getClassPayload(cls);
            const isDownloading = downloadingClass === cls.nama;
            const isCopied = copiedClass === cls.nama;

            return (
              <div
                key={cls.id}
                className="bg-white rounded-3xl border-2 border-slate-200 p-6 text-center shadow-md hover:shadow-xl transition relative overflow-hidden flex flex-col justify-between group"
              >
                {/* Header Badge */}
                <div className="bg-gradient-to-r from-kepawa-900 via-kepawa-800 to-slate-900 text-white p-3.5 -mx-6 -mt-6 mb-4 flex items-center justify-between px-6 border-b border-kepawa-950">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5">
                      <SchoolLogo className="w-full h-full" />
                    </div>
                    <span className="text-xs font-extrabold tracking-wider text-white">SK KEPAWA</span>
                  </div>
                  <span className="text-[10px] bg-gold-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    PdP QR 2026
                  </span>
                </div>

                {/* Class Info */}
                <div className="my-2">
                  <div className="inline-block px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold mb-1">
                    TAHUN {cls.darjah}
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{cls.nama}</h4>
                  <p className="text-xs text-slate-600 font-bold mt-1">
                    Guru Kelas: <span className="text-slate-900">{cls.guru_kelas}</span>
                  </p>
                  {cls.pembantu_guru_kelas && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pembantu: {cls.pembantu_guru_kelas}
                    </p>
                  )}
                </div>

                {/* Dynamic QR Code Canvas Image */}
                <div className="my-4 p-4 bg-slate-50 rounded-2xl border-2 border-slate-200/80 inline-block mx-auto shadow-inner group-hover:border-kepawa-400 transition max-w-full overflow-hidden">
                  <QrCodeRenderer
                    value={qrPayload}
                    size={190}
                    className="mx-auto bg-white p-1 rounded-xl shadow-xs"
                  />
                  
                  {/* Code payload badge with copy */}
                  <button
                    onClick={() => handleCopyPayload(qrPayload, cls.nama)}
                    className="mt-3 text-[10px] font-mono text-slate-700 font-bold bg-white py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center gap-1.5 mx-auto transition max-w-[200px] truncate"
                    title="Salin Kod QR Payload"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span className="text-emerald-700 font-bold">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{qrPayload}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Instructions */}
                <p className="text-[10px] text-slate-400 italic mb-4">
                  {qrFormat === 'url'
                    ? 'Boleh diimbas dengan Kamera Telefon pintar (Samsung/iPhone) atau pengimbas G-TEPAT.'
                    : 'Imbas menggunakan menu "Imbas QR Kelas" semasa memulakan PdP.'}
                </p>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2">
                  <button
                    onClick={() => onOpenClassQrModal(cls.nama, qrPayload)}
                    className="flex-1 py-2 px-3 rounded-xl bg-kepawa-700 hover:bg-kepawa-800 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm"
                    title="Papar Skrin Penuh Poster Rasmi"
                  >
                    <Eye className="w-3.5 h-3.5 text-gold-400" />
                    <span>Poster Penuh</span>
                  </button>
                  <button
                    onClick={() => handleDownloadQr(cls.nama, qrPayload)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
                    title="Muat Turun Gambar PNG Resolusi Tinggi (1200px)"
                  >
                    {isDownloading ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Disimpan</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">PNG HD</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      {filteredClasses.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
          <QrCode className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-bold text-slate-700">Tiada kod QR kelas dijumpai untuk carian ini.</p>
          <p className="text-xs text-slate-400 mt-1">Sila tukar pilihan tapisan atau kata kunci carian.</p>
        </div>
      )}

      {/* =========================================================================
          BATCH PRINT PREVIEW MODAL (ALL A4 SHEETS)
          ========================================================================= */}
      {isPrintPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gold-400 text-slate-950 flex items-center justify-center font-bold">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cetak Semua Poster Kod QR Bilik Darjah</h3>
                  <p className="text-xs text-slate-500">
                    Format sedia cetak ({classes.length} poster bilik darjah - 1 poster bagi setiap halaman A4)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsPrintPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Preview Area */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 space-y-6">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between">
                <span>
                  Tip: Gunakan pilihan <strong>"Save as PDF"</strong> atau cetak terus pada kertas A4 berwarna/hitam putih.
                </span>
                <button
                  onClick={handleTriggerPrintAll}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow flex items-center gap-1.5 hover:bg-slate-800"
                >
                  <Printer className="w-3.5 h-3.5 text-gold-400" /> Cetak Sekarang (Semua)
                </button>
              </div>

              {/* Visual Preview of the printable pages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classes.map((cls, idx) => {
                  const qrPayload = getClassPayload(cls);
                  return (
                    <div 
                      key={cls.id}
                      className="bg-white border-2 border-slate-900 rounded-3xl p-6 text-center shadow-lg relative flex flex-col justify-between"
                    >
                      <div>
                        {/* School Crest Header */}
                        <div className="flex items-center justify-center gap-3 border-b-2 border-slate-900 pb-3 mb-3">
                          <div className="w-12 h-12">
                            <SchoolLogo className="w-full h-full" />
                          </div>
                          <div className="text-left">
                            <h5 className="font-black text-sm text-slate-900 leading-tight">SK KEPAWA, BEAUFORT</h5>
                            <p className="text-[10px] text-slate-600 font-bold">KOD SEKOLAH: XBA6022 | SESI 2026/2027</p>
                            <p className="text-[9px] text-gold-700 font-black tracking-widest">SISTEM G-TEPAT (KEHADIRAN PdP)</p>
                          </div>
                        </div>

                        <div className="my-2">
                          <span className="px-3 py-1 bg-slate-900 text-white text-xs font-black rounded-lg uppercase tracking-wider">
                            BILIK DARJAH TAHUN {cls.darjah}
                          </span>
                          <h2 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
                            {cls.nama}
                          </h2>
                          <p className="text-xs font-bold text-slate-700 mt-0.5">
                            Guru Kelas: <span className="font-black">{cls.guru_kelas}</span>
                          </p>
                        </div>

                        {/* Large QR Display */}
                        <div className="my-3 p-3 bg-slate-50 border-2 border-slate-900 rounded-2xl inline-block mx-auto max-w-full">
                          <QrCodeRenderer
                            value={qrPayload}
                            size={180}
                            className="mx-auto bg-white p-1 rounded-xl"
                          />
                          <div className="mt-2 text-[10px] font-mono font-bold text-slate-900 bg-white py-1 px-3 rounded-lg border border-slate-300 truncate max-w-[240px]">
                            {qrPayload}
                          </div>
                        </div>
                      </div>

                      {/* Footer instructions */}
                      <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-semibold">
                        Sila imbas kod ini semasa masuk ke kelas menggunakan kamera telefon atau aplikasi G-TEPAT.
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end gap-3">
              <button
                onClick={() => setIsPrintPreviewOpen(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
              >
                Tutup
              </button>
              <button
                onClick={handleTriggerPrintAll}
                className="px-5 py-2.5 bg-slate-900 text-white font-black rounded-xl text-xs shadow-md hover:bg-slate-800 transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-gold-400" />
                <span>Cetak Semua ({classes.length} Poster)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRINT ONLY AREA (Renders in @media print)
          ========================================================================= */}
      <div className="hidden print:block print:w-full">
        {classes.map((cls, idx) => {
          const qrPayload = getClassPayload(cls);
          return (
            <div 
              key={cls.id} 
              className={`p-10 text-center border-4 border-black min-h-[95vh] flex flex-col justify-between bg-white ${
                idx < classes.length - 1 ? 'page-break' : ''
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-center gap-4 border-b-4 border-black pb-4 mb-6">
                  <div className="w-20 h-20">
                    <SchoolLogo className="w-full h-full" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-black text-black uppercase tracking-tight">
                      SEKOLAH KEBANGSAAN KEPAWA
                    </h2>
                    <p className="text-sm font-bold text-black uppercase">
                      PETI SURAT 143, 89807 BEAUFORT, SABAH
                    </p>
                    <p className="text-xs font-bold text-black uppercase tracking-wider">
                      KOD SEKOLAH: XBA6022 | SESI PERSEKOLAHAN 2026 / 2027
                    </p>
                  </div>
                </div>

                <div className="my-4">
                  <span className="inline-block px-5 py-1.5 bg-black text-white text-sm font-black uppercase tracking-widest rounded-lg">
                    POSTER KOD QR KEHADIRAN PdP (G-TEPAT)
                  </span>
                  <h1 className="text-6xl font-black text-black uppercase mt-4 tracking-tight">
                    {cls.nama}
                  </h1>
                  <p className="text-lg font-bold text-black mt-2">
                    TAHUN {cls.darjah} | GURU KELAS: {cls.guru_kelas.toUpperCase()}
                  </p>
                  {cls.pembantu_guru_kelas && (
                    <p className="text-sm font-semibold text-black mt-0.5">
                      PEMBANTU GURU KELAS: {cls.pembantu_guru_kelas.toUpperCase()}
                    </p>
                  )}
                </div>

                {/* Ultra High Quality Print QR */}
                <div className="my-6 p-6 border-4 border-black inline-block mx-auto rounded-3xl">
                  <QrCodeRenderer
                    value={qrPayload}
                    size={340}
                    className="mx-auto"
                  />
                  <div className="mt-4 text-sm font-mono font-black text-black tracking-widest bg-slate-100 py-1.5 px-4 rounded-lg border-2 border-black truncate max-w-[500px]">
                    {qrPayload}
                  </div>
                </div>
              </div>

              {/* Print Footer */}
              <div className="border-t-4 border-black pt-4">
                <p className="text-sm font-black text-black uppercase tracking-wide">
                  ARAHAN: GURU MATA PELAJARAN DIKEHENDAKI MENGIMBAS KOD QR INI MENGGUNAKAN KAMERA TELEFON ATAU SISTEM G-TEPAT SEMASA MEMASUKI KELAS.
                </p>
                <p className="text-xs font-semibold text-black mt-1">
                  Dicetak secara automatik oleh Sistem G-TEPAT SK KEPAWA 2026
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ClassQrModalProps {
  isOpen: boolean;
  className: string;
  qrPayload: string;
  onClose: () => void;
}

export const ClassQrModal: React.FC<ClassQrModalProps> = ({
  isOpen,
  className,
  qrPayload,
  onClose
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(qrPayload, {
        width: 1200,
        margin: 3,
        color: { dark: '#0f172a', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `POSTER_QR_${className.replace(/\s+/g, '_')}_SK_KEPAWA_2026.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(qrPayload);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center border border-slate-100">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-extrabold text-kepawa-700">SK KEPAWA - KOD QR KELAS</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-16 h-16 mx-auto mb-2">
          <SchoolLogo className="w-full h-full" />
        </div>

        <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-0.5">{className}</h3>
        <p className="text-xs text-slate-500 font-bold mb-3">SISTEM KEHADIRAN GURU PdP (G-TEPAT 2026)</p>

        {/* High Resolution Display */}
        <div className="p-6 bg-white border-2 border-slate-900 rounded-3xl inline-block shadow-xl my-1 max-w-full">
          <QrCodeRenderer
            value={qrPayload}
            size={240}
            className="mx-auto bg-white p-2 rounded-2xl"
          />
          <button
            onClick={handleCopy}
            className="mt-3 text-xs font-mono font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 mx-auto transition max-w-[280px] truncate"
            title="Salin Kod / Pautan QR"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="text-emerald-700 font-bold">Tersalin ke papan keratan!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span className="truncate">{qrPayload}</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-amber-800 font-bold mt-3 bg-amber-50 py-2.5 px-3.5 rounded-xl border border-amber-200 leading-relaxed">
          📱 <strong>Cara Imbas:</strong> Halakan kamera telefon pintar anda (kamera Samsung/iPhone/Lens) terus ke kod QR ini, atau gunakan menu <strong>"Imbas QR Kelas"</strong> dalam app.
        </p>

        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow flex items-center gap-1.5 hover:bg-slate-800 transition"
          >
            <Printer className="w-3.5 h-3.5 text-gold-400" /> Cetak Poster
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 bg-gold-400 text-slate-950 rounded-xl text-xs font-black shadow flex items-center gap-1.5 hover:bg-gold-500 transition"
          >
            <Download className="w-3.5 h-3.5" /> Muat Turun PNG HD
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

