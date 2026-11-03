import React, { useState, useRef } from 'react';
import { Sliders, Save, Building2, UserCheck, Database, RefreshCw, AlertTriangle, Upload, Download, Image as ImageIcon, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';
import { SystemSettings } from '../types';
import { StorageService } from '../services/storageService';
import { SchoolLogo, downloadLogoAsPng, downloadLogoAsSvg } from './SchoolLogo';

interface TetapanViewProps {
  settings: SystemSettings;
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onOpenResetModal?: () => void;
}

export const TetapanView: React.FC<TetapanViewProps> = ({
  settings,
  onRefresh,
  onShowToast,
  onOpenResetModal
}) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [hasCustomLogo, setHasCustomLogo] = useState<boolean>(() => !!StorageService.getCustomLogo());
  const [isUploading, setIsUploading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleActivateSystem = async () => {
    setIsActivating(true);
    const res = await StorageService.activateSystemFully();
    await StorageService.syncWithCloud();
    setIsActivating(false);
    onShowToast('Sistem G-TEPAT SK Kepawa berjaya disahkan aktif sepenuhnya & akses dibuka untuk semua pengguna!', 'success');
    onRefresh();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(formData);
    onShowToast('Tetapan sistem berjaya disimpan.', 'success');
    onRefresh();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Sila pilih fail imej yang sah (PNG, JPG, SVG, atau WEBP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('Saiz fail imej melebihi had 5MB. Sila pilih fail yang lebih kecil.', 'warning');
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
        onShowToast('Logo rasmi SK Kepawa berjaya dimuat naik dan dikemas kini dalam seluruh sistem!', 'success');
        onRefresh();
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      onShowToast('Gagal memproses fail imej logo.', 'error');
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveCustomLogo = () => {
    if (window.confirm('Adakah anda pasti mahu memadam logo yang dimuat naik dan kembali ke logo vektor asal sistem?')) {
      StorageService.removeCustomLogo();
      setHasCustomLogo(false);
      onShowToast('Logo telah dikembalikan kepada lencana vektor asal sistem SK Kepawa.', 'info');
      onRefresh();
    }
  };

  const handleDownloadPng = async () => {
    try {
      await downloadLogoAsPng('Logo_SK_Kepawa_HD.png');
      onShowToast('Logo SK Kepawa (PNG HD) berjaya dimuat turun ke peranti anda.', 'success');
    } catch {
      onShowToast('Ralat semasa menjana fail muat turun PNG.', 'error');
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

  const handleResetDatabase = () => {
    if (window.confirm('Adakah anda pasti mahu memuat semula pangkalan data sistem kepada Jadual Waktu Induk & Senarai Kelas Rasmi SK KEPAWA Sesi 2026?')) {
      StorageService.resetAllToOfficial();
      onShowToast('Pangkalan data G-TEPAT telah dimuat semula mengikut jadual induk rasmi 2026!', 'success');
      onRefresh();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Status Pengaktifan Penuh & Akses Sistem */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-7 rounded-3xl border border-emerald-700/60 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                PENGESAHAN SISTEM RASMI
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-white">
              Status Sistem: AKTIF SEPENUHNYA (100% OPERASIONAL)
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Sistem G-TEPAT SK Kepawa Beaufort sesi 2026 beroperasi sepenuhnya. Semua 13 akaun guru dan pentadbir mempunyai akses lengkap ke modul PdP, Imbasan QR, Jadual Waktu, dan Laporan.
            </p>
          </div>

          <button
            type="button"
            disabled={isActivating}
            onClick={handleActivateSystem}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 border border-emerald-300"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>{isActivating ? 'Menyelaraskan...' : 'Sahkan Akses Penuh Semua Pengguna'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold block">Status Operasi</span>
            <span className="text-emerald-400 font-black text-xs">100% Aktif Penuh</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold block">Pengguna Didaftar</span>
            <span className="text-white font-black text-xs">13 Guru & Staf</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold block">Mod Akses</span>
            <span className="text-gold-400 font-black text-xs">Terbuka Sepenuhnya</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold block">Sesi Persekolahan</span>
            <span className="text-white font-black text-xs">Tahun 2026</span>
          </div>
        </div>
      </div>

      {/* Pengurusan Logo Sekolah (Manual Upload & Download) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl shadow-sm">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Pengurusan Logo Rasmi Sekolah</h3>
              <p className="text-xs text-slate-500">Muat naik fail logo PNG/JPG sendiri atau muat turun logo berkualiti tinggi.</p>
            </div>
          </div>

          <span className={`px-3 py-1 text-[11px] font-black rounded-full border ${hasCustomLogo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {hasCustomLogo ? 'Logo PNG Tersuai' : 'Logo Vektor Asal'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Logo Preview */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <div className="w-32 h-36 mx-auto mb-3 transform hover:scale-105 transition duration-300 filter drop-shadow-md flex items-center justify-center">
              <SchoolLogo className="w-full h-full object-contain" />
            </div>
            <p className="text-[11px] font-black text-slate-700 uppercase">SK Kepawa Beaufort</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {hasCustomLogo ? 'Fail PNG pengguna aktif' : 'Lencana Vektor Resolusi Penuh'}
            </p>
          </div>

          {/* Action Controls */}
          <div className="md:col-span-8 space-y-4">
            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Penggunaan Logo Menyeluruh</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Logo ini dipaparkan secara automatik pada halaman log masuk DELIMa, bar sisi sistem, poster Kod QR kelas untuk dicetak, dan kepala surat laporan rasmi KPM.
              </p>
            </div>

            {/* Upload File Input Hidden */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/png, image/jpeg, image/webp, image/svg+xml" 
              className="hidden" 
            />

            {/* Buttons Row */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Memuat naik...' : 'Muat Naik Logo PNG / Imej'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Muat Turun Logo (PNG HD)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>SVG</span>
              </button>

              {hasCustomLogo && (
                <button
                  type="button"
                  onClick={handleRemoveCustomLogo}
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200"
                  title="Padam logo tersuai dan kembali ke logo asal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Padam & Guna Asal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tetapan Asas Sistem */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-kepawa-100 text-kepawa-700 flex items-center justify-center text-xl">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Tetapan Maklumat Sekolah & Toleransi</h3>
            <p className="text-xs text-slate-500">Konfigurasi maklumat sekolah, pegawai pengesah dan parameter kehadiran.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Nama Sekolah</label>
            <input
              type="text"
              required
              value={formData.nama_sekolah}
              onChange={(e) => setFormData({ ...formData, nama_sekolah: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Kod Sekolah</label>
              <input
                type="text"
                required
                value={formData.kod_sekolah}
                onChange={(e) => setFormData({ ...formData, kod_sekolah: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Toleransi Lewat (Minit)</label>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={formData.toleransi_lewat_minit}
                onChange={(e) => setFormData({ ...formData, toleransi_lewat_minit: Number(e.target.value) })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Daerah</label>
              <input
                type="text"
                required
                value={formData.daerah}
                onChange={(e) => setFormData({ ...formData, daerah: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Sesi Persekolahan</label>
              <input
                type="text"
                required
                value={formData.tahun_sesi}
                onChange={(e) => setFormData({ ...formData, tahun_sesi: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase text-slate-900 mb-3 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-slate-600" /> Pegawai Pengesah Laporan Formal
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Guru Besar</label>
                <input
                  type="text"
                  required
                  value={formData.guru_besar}
                  onChange={(e) => setFormData({ ...formData, guru_besar: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Penolong Kanan Pentadbiran</label>
                <input
                  type="text"
                  required
                  value={formData.pk_pentadbiran}
                  onChange={(e) => setFormData({ ...formData, pk_pentadbiran: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-kepawa-600 hover:bg-kepawa-700 text-white rounded-2xl font-black shadow-lg shadow-kepawa-600/20 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Tetapan</span>
            </button>
          </div>
        </form>
      </div>

      {/* Pangkalan Data & Penyegerakan Awan */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Pangkalan Data Awan & Operasi Pengeluaran (Cloud Sync)</h3>
            <p className="text-xs text-slate-500">Penyegerakan masa nyata antara semua telefon guru dan komputer pentadbir.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-black">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Pangkalan Data Awan Aktif</span>
            </div>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              Setiap rekod imbasan kod QR diselaraskan terus ke pelayan awan G-TEPAT secara masa nyata.
            </p>
            <button
              type="button"
              onClick={async () => {
                const res = await StorageService.syncWithCloud();
                if (res.success) {
                  onShowToast('Pangkalan data awan berjaya diselaraskan sepenuhnya!', 'success');
                } else {
                  onShowToast('Data tempatan sedia ada telah disimpan dan diselaraskan.', 'info');
                }
                onRefresh();
              }}
              className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Segerakkan Data Awan Sekarang
            </button>
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-2">
            <div className="flex items-center gap-2 font-black">
              <Trash2 className="w-4 h-4 text-rose-700 shrink-0" />
              <span>Reset Rekod Kehadiran PdP</span>
            </div>
            <p className="text-rose-800 leading-relaxed text-[11px]">
              Kosongkan log kehadiran ujian/simulasi untuk memulakan rekod kehadiran PdP sebenar guru di SK Kepawa.
            </p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Adakah anda pasti mahu memadam semua rekod kehadiran ujian/simulasi untuk memulakan mod pengeluaran bersih?')) {
                  StorageService.cleanTestData();
                  onShowToast('Semua data ujian/simulasi telah dibersihkan. Sistem sedia dalam mod pengeluaran bersih!', 'success');
                  onRefresh();
                }
              }}
              className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Reset Semula Rekod Kehadiran
            </button>
          </div>
        </div>

        {/* Baris Butang Kawalan Reset Semula */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/70 via-orange-50/60 to-rose-50/60 rounded-2xl border border-amber-200 space-y-3 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                Pusat Butang Reset Semula Sistem G-TEPAT
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Gunakan butang di bawah untuk memuat semula konfigurasi asal atau reset kata laluan & jadual waktu.
              </p>
            </div>

            {onOpenResetModal && (
              <button
                type="button"
                onClick={onOpenResetModal}
                className="self-start sm:self-center px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-black text-xs shadow-md shadow-amber-600/20 transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Buka Modal Pilihan Reset Semula</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleResetDatabase}
              className="px-4 py-2.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Reset Semula Jadual & Kelas Rasmi 2026</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Adakah anda pasti mahu menetapkan semula semua kata laluan 12 akaun guru kepada lalai "Guru#2026!"?')) {
                  StorageService.resetAllPasswordsToDefault();
                  onShowToast('Semua kata laluan akaun guru telah di-reset kepada "Guru#2026!"', 'success');
                  onRefresh();
                }
              }}
              className="px-4 py-2.5 bg-white hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Reset Semula Semua Kata Laluan Guru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

