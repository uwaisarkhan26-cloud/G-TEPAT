import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { SchoolLogo, downloadLogoAsPng, downloadLogoAsSvg } from './SchoolLogo';

interface LogoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onRefresh?: () => void;
}

export const LogoManagerModal: React.FC<LogoManagerModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onRefresh
}) => {
  const [hasCustomLogo, setHasCustomLogo] = useState<boolean>(() => !!StorageService.getCustomLogo());
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Sila pilih fail imej yang sah (PNG, JPG, SVG, atau WEBP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('Saiz fail imej melebihi had 5MB. Sila gunakan fail yang lebih kecil.', 'warning');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        StorageService.saveCustomLogo(dataUrl);
        setHasCustomLogo(true);
        setIsUploading(false);
        onShowToast('Logo rasmi SK Kepawa berjaya dimuat naik dan dikemas kini ke seluruh sistem!', 'success');
        if (onRefresh) onRefresh();
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      onShowToast('Gagal memproses fail imej.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveLogo = () => {
    if (window.confirm('Kembalikan logo kepada rekaan vektor asal sistem SK Kepawa?')) {
      StorageService.removeCustomLogo();
      setHasCustomLogo(false);
      onShowToast('Logo telah dikembalikan kepada lencana vektor asal SK Kepawa.', 'info');
      if (onRefresh) onRefresh();
    }
  };

  const handleDownloadPng = async () => {
    try {
      await downloadLogoAsPng('Logo_SK_Kepawa_HD.png');
      onShowToast('Logo SK Kepawa (PNG HD) berjaya dimuat turun ke peranti anda.', 'success');
    } catch {
      onShowToast('Ralat semasa memuat turun fail PNG.', 'error');
    }
  };

  const handleDownloadSvg = () => {
    try {
      downloadLogoAsSvg('Logo_SK_Kepawa.svg');
      onShowToast('Logo SK Kepawa (Vektor SVG) berjaya dimuat turun ke peranti anda.', 'success');
    } catch {
      onShowToast('Ralat semasa memuat turun fail SVG.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">Pengurusan Logo Rasmi Sekolah</h3>
                <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${
                  hasCustomLogo ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                }`}>
                  {hasCustomLogo ? 'PNG Tersuai' : 'Vektor Sistem'}
                </span>
              </div>
              <p className="text-xs text-slate-300">Sekolah Kebangsaan Kepawa, Beaufort (XBA6022)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Logo Visual Live Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 bg-gradient-to-b from-slate-50 to-slate-100/80 p-6 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center">
              <div className="w-36 h-40 mx-auto mb-3 transform hover:scale-105 transition duration-300 filter drop-shadow-md flex items-center justify-center">
                <SchoolLogo className="w-full h-full object-contain" />
              </div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">SK KEPAWA BEAUFORT</p>
              <p className="text-[11px] text-slate-500 font-medium">
                {hasCustomLogo ? 'Logo fail PNG anda yang sedang aktif' : 'Lencana Vektor Rasmi Resolusi Penuh'}
              </p>
            </div>

            {/* Drag and Drop Zone */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                className="hidden"
              />

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-indigo-600 bg-indigo-50/80 scale-[0.99]'
                    : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50/80'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {isUploading ? 'Sedang Memproses Gambar...' : 'Klik di sini untuk pilih fail gambar logo'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    atau seret & lepas fail PNG, JPG, atau SVG ke dalam kotak ini (Maksimum 5MB)
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Pilih Fail dari Komputer / Telefon</span>
                </button>
              </div>

              {/* Status info */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>
                  Logo yang anda muat naik akan dikemas kini secara automatik di <strong>halaman log masuk</strong>, <strong>poster Kod QR kelas</strong>, dan <strong>laporan rasmi cetakan PDF/A4</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Muat Turun PNG HD</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Muat Turun SVG</span>
              </button>
            </div>

            {hasCustomLogo && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Padam & Guna Asal</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
