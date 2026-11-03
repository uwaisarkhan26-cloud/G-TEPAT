import React, { useState } from 'react';
import { 
  Plus, 
  Printer, 
  Trash2, 
  Clock, 
  Filter, 
  Download,
  X,
  FileText,
  UserCheck,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { AttendanceRecord, ClassItem, SubjectItem, User, SessionData } from '../types';
import { StorageService } from '../services/storageService';

interface RekodViewProps {
  records: AttendanceRecord[];
  classes: ClassItem[];
  subjects: SubjectItem[];
  users: User[];
  session: SessionData;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onOpenFormalPrintModal: () => void;
}

export const RekodView: React.FC<RekodViewProps> = ({
  records,
  classes,
  subjects,
  users,
  session,
  onRefresh,
  isRefreshing = false,
  onShowToast,
  onOpenFormalPrintModal
}) => {
  const [localRefreshing, setLocalRefreshing] = useState(false);
  const [isAddManualOpen, setIsAddManualOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [viewScope, setViewScope] = useState<'all' | 'mine'>('all');

  // Selected Record for Edit, Slip or Delete
  const [activeRecord, setActiveRecord] = useState<AttendanceRecord | null>(null);

  // Manual Add Form State
  const [formGuru, setFormGuru] = useState<string>(session.nama || users[0]?.nama || '');
  const [formKelas, setFormKelas] = useState<string>(classes[0]?.nama || '1 JINGGA');
  const [formSubjek, setFormSubjek] = useState<string>(subjects[0]?.nama || 'Bahasa Melayu');
  const [formStatus, setFormStatus] = useState<'TEPAT MASA' | 'LEWAT'>('TEPAT MASA');
  const [formCatatan, setFormCatatan] = useState<string>('Pendaftaran Manual Kehadiran PdP');

  // Edit Form State
  const [editTarikh, setEditTarikh] = useState('');
  const [editMasa, setEditMasa] = useState('');
  const [editGuru, setEditGuru] = useState('');
  const [editKelas, setEditKelas] = useState('');
  const [editSubjek, setEditSubjek] = useState('');
  const [editStatus, setEditStatus] = useState<'TEPAT MASA' | 'LEWAT'>('TEPAT MASA');
  const [editCatatan, setEditCatatan] = useState('');

  const filteredRecords = records.filter(r => {
    if (viewScope === 'mine' && r.guru !== session.nama) return false;
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (selectedClass !== 'all' && r.kelas !== selectedClass) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchGuru = r.guru.toLowerCase().includes(q);
      const matchKelas = r.kelas.toLowerCase().includes(q);
      const matchSubjek = r.subjek.toLowerCase().includes(q);
      const matchCatatan = (r.catatan || '').toLowerCase().includes(q);
      const matchTarikh = r.tarikh.includes(q);
      if (!matchGuru && !matchKelas && !matchSubjek && !matchCatatan && !matchTarikh) {
        return false;
      }
    }
    return true;
  });

  const handleTriggerRefresh = () => {
    setLocalRefreshing(true);
    onRefresh();
    setTimeout(() => {
      setLocalRefreshing(false);
    }, 500);
  };

  const isSpinning = isRefreshing || localRefreshing;

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveAttendanceRecord({
      guru: formGuru,
      kelas: formKelas,
      subjek: formSubjek,
      slotId: 'S1',
      status: formStatus,
      catatan: formCatatan
    });
    onShowToast('Rekod kehadiran manual berjaya disimpan.', 'success');
    setIsAddManualOpen(false);
    onRefresh();
  };

  const handleOpenEdit = (rec: AttendanceRecord) => {
    setActiveRecord(rec);
    setEditTarikh(rec.tarikh);
    setEditMasa(rec.masa);
    setEditGuru(rec.guru);
    setEditKelas(rec.kelas);
    setEditSubjek(rec.subjek);
    setEditStatus(rec.status);
    setEditCatatan(rec.catatan || '');
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecord) return;

    const updated: AttendanceRecord = {
      ...activeRecord,
      tarikh: editTarikh,
      masa: editMasa,
      guru: editGuru,
      kelas: editKelas,
      subjek: editSubjek,
      status: editStatus,
      catatan: editCatatan
    };

    StorageService.updateAttendanceRecord(updated);
    onShowToast('Rekod kehadiran berjaya dikemaskini.', 'success');
    setIsEditOpen(false);
    setActiveRecord(null);
    onRefresh();
  };

  const handleToggleStatus = (rec: AttendanceRecord) => {
    const newStatus: 'TEPAT MASA' | 'LEWAT' = rec.status === 'TEPAT MASA' ? 'LEWAT' : 'TEPAT MASA';
    const newCatatan = newStatus === 'LEWAT' ? (rec.catatan || 'Lewat ke bilik darjah') : (rec.catatan === 'Lewat ke bilik darjah' ? 'Tepat pada masanya' : rec.catatan);
    
    const updated: AttendanceRecord = {
      ...rec,
      status: newStatus,
      catatan: newCatatan
    };

    StorageService.updateAttendanceRecord(updated);
    onShowToast(`Status berjaya ditukar kepada ${newStatus}.`, 'info');
    onRefresh();
  };

  const handleOpenSlip = (rec: AttendanceRecord) => {
    setActiveRecord(rec);
    setIsSlipOpen(true);
  };

  const handleOpenDelete = (rec: AttendanceRecord) => {
    setActiveRecord(rec);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (activeRecord) {
      StorageService.deleteAttendanceRecord(activeRecord.id);
      onShowToast('Rekod kehadiran telah dipadamkan.', 'info');
      setIsDeleteModalOpen(false);
      setActiveRecord(null);
      onRefresh();
    }
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      onShowToast('Tiada rekod untuk dieksport.', 'warning');
      return;
    }

    const headers = ['ID', 'Tarikh', 'Masa', 'Nama Guru', 'Kelas', 'Subjek', 'Status', 'Catatan'];
    const rows = filteredRecords.map(r => [
      r.id,
      r.tarikh,
      r.masa,
      `"${r.guru.replace(/"/g, '""')}"`,
      r.kelas,
      `"${r.subjek.replace(/"/g, '""')}"`,
      r.status,
      `"${(r.catatan || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekod_Kehadiran_PdP_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast('Fail CSV berjaya dimuat turun.', 'success');
  };

  const handlePrintSingleSlip = () => {
    window.print();
  };

  const customLogo = StorageService.getCustomLogo();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-kepawa-100 text-kepawa-800 text-xs font-black uppercase">
              REKOD KEHADIRAN PDP
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              Senarai Rekod Kehadiran Guru ke Kelas
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Semua log imbasan QR dan pendaftaran kehadiran guru ke bilik darjah. Semua butang tindakan aktif untuk semakan, cetakan slip, suntingan, dan status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segar Semula Action Button */}
          <button
            id="btn-segar-semula-rekod-top"
            onClick={handleTriggerRefresh}
            disabled={isSpinning}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer border ${
              isSpinning
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 cursor-wait'
                : 'bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border-slate-300 hover:border-emerald-300 active:scale-95'
            }`}
            title="Segar Semula Data & Jana Rekod Terkini"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isSpinning ? 'animate-spin text-emerald-800' : ''}`} />
            <span>{isSpinning ? 'Menjana Data...' : 'Segar Semula Data'}</span>
          </button>

          {/* Manual Add Button */}
          <button
            id="btn-tambah-kehadiran-manual"
            onClick={() => {
              setFormGuru(session.nama || users[0]?.nama || '');
              setIsAddManualOpen(true);
            }}
            className="px-4 py-2.5 bg-kepawa-600 hover:bg-kepawa-700 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Tambah Rekod Kehadiran Manual"
          >
            <Plus className="w-4 h-4" /> Kehadiran Manual
          </button>

          {/* Export CSV Button */}
          <button
            id="btn-eksport-csv"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Muat Turun Fail CSV / Excel"
          >
            <FileSpreadsheet className="w-4 h-4" /> Eksport CSV
          </button>

          {/* Formal Report Button */}
          <button
            id="btn-cetak-laporan-formal"
            onClick={onOpenFormalPrintModal}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Cetak Laporan Rasmi Bergred & Bertandatangan"
          >
            <FileText className="w-4 h-4 text-gold-400" /> Cetak Laporan Formal
          </button>
        </div>
      </div>

      {/* Filter Row & Controls */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Scope Selector */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setViewScope('all')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                viewScope === 'all' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Guru ({records.length})
            </button>
            <button
              onClick={() => setViewScope('mine')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                viewScope === 'mine' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekod Saya
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 md:flex-none">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari guru, kelas, subjek, tarikh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm text-xs focus:ring-2 focus:ring-kepawa-500"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-kepawa-600" /> Tapis:
            </span>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-700 shadow-sm"
            >
              <option value="all">Semua Status</option>
              <option value="TEPAT MASA">Tepat Masa</option>
              <option value="LEWAT">Lewat</option>
            </select>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-700 shadow-sm"
            >
              <option value="all">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.nama}>{c.nama}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 text-slate-500 font-semibold">
          <span>Jumlah Paparan: <strong className="text-slate-900">{filteredRecords.length}</strong> rekod</span>
          <button 
            id="btn-segar-semula-rekod-table"
            onClick={handleTriggerRefresh}
            disabled={isSpinning}
            title="Muat semula senarai kehadiran terkini"
            className={`px-3 py-1.5 rounded-xl transition border shadow-xs cursor-pointer flex items-center gap-1.5 font-extrabold text-xs active:scale-95 ${
              isSpinning 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-300 hover:border-emerald-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSpinning ? 'animate-spin text-emerald-700' : ''}`} />
            <span>{isSpinning ? 'Menyegerakkan...' : 'Segar Semula'}</span>
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-black">
                <th className="p-3.5 pl-5">Tarikh & Masa</th>
                <th className="p-3.5">Nama Guru</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">Subjek</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Catatan</th>
                <th className="p-3.5 text-center pr-5 w-48">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400 italic">
                    Tiada rekod kehadiran didapati berdasarkan carian/penapis semasa.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition group">
                    <td className="p-3.5 pl-5">
                      <div className="font-bold text-slate-900">{r.tarikh}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" /> {r.masa}
                      </div>
                    </td>
                    <td className="p-3.5 font-black text-slate-900">{r.guru}</td>
                    <td className="p-3.5 font-black text-kepawa-800">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-black">
                        {r.kelas}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{r.subjek}</td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase border ${
                        r.status === 'TEPAT MASA' 
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-200' 
                          : 'bg-amber-100 text-amber-900 border-amber-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 text-[11px] max-w-[200px] truncate" title={r.catatan}>
                      {r.catatan || '-'}
                    </td>
                    
                    {/* Active Action Buttons Column */}
                    <td className="p-3.5 text-center pr-5">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. Slip View & Print Button */}
                        <button
                          id={`btn-slip-${r.id}`}
                          onClick={() => handleOpenSlip(r)}
                          className="px-2 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition shadow-xs flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                          title="Lihat & Cetak Slip Pengesahan Kehadiran"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                          <span>Slip</span>
                        </button>

                        {/* 2. Fast Toggle Status Button */}
                        <button
                          id={`btn-toggle-${r.id}`}
                          onClick={() => handleToggleStatus(r)}
                          className={`p-1.5 rounded-xl transition shadow-xs flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
                            r.status === 'TEPAT MASA'
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                          }`}
                          title={r.status === 'TEPAT MASA' ? 'Tukar status kepada LEWAT' : 'Tukar status kepada TEPAT MASA'}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* 3. Edit Record Button */}
                        <button
                          id={`btn-edit-${r.id}`}
                          onClick={() => handleOpenEdit(r)}
                          className="p-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-xs border border-blue-200 cursor-pointer"
                          title="Kemaskini Rekod Kehadiran"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* 4. Delete Record Button */}
                        <button
                          id={`btn-delete-${r.id}`}
                          onClick={() => handleOpenDelete(r)}
                          className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition shadow-xs border border-red-200 cursor-pointer"
                          title="Padam Rekod Kehadiran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Edit Attendance Record */}
      {isEditOpen && activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Kemaskini Rekod Kehadiran</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {activeRecord.id}</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsEditOpen(false); setActiveRecord(null); }} 
                className="text-slate-400 hover:text-slate-600 p-2 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tarikh</label>
                  <input
                    type="date"
                    value={editTarikh}
                    onChange={(e) => setEditTarikh(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Masa</label>
                  <input
                    type="text"
                    value={editMasa}
                    onChange={(e) => setEditMasa(e.target.value)}
                    placeholder="HH:MM:SS"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Guru</label>
                <select
                  value={editGuru}
                  onChange={(e) => setEditGuru(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.nama}>{u.nama}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kelas</label>
                  <select
                    value={editKelas}
                    onChange={(e) => setEditKelas(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.nama}>{c.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Subjek</label>
                  <select
                    value={editSubjek}
                    onChange={(e) => setEditSubjek(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.nama}>{s.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Status Kehadiran</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TEPAT MASA">TEPAT MASA</option>
                    <option value="LEWAT">LEWAT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Catatan / Alasan</label>
                  <input
                    type="text"
                    value={editCatatan}
                    onChange={(e) => setEditCatatan(e.target.value)}
                    placeholder="Contoh: Imbasan QR / Bertugas"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setActiveRecord(null); }}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Delete Confirmation Modal */}
      {isDeleteModalOpen && activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-xl mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Padam Rekod Kehadiran?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Rekod kehadiran <strong>{activeRecord.guru}</strong> untuk kelas <strong>{activeRecord.kelas}</strong> ({activeRecord.tarikh}) akan dipadamkan dari sistem.
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setActiveRecord(null); }}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Ya, Padam Rekod
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Slip Pengesahan Kehadiran Individu */}
      {isSlipOpen && activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase">
                <Printer className="w-4 h-4 text-kepawa-700" /> Slip Pengesahan Kehadiran PdP
              </div>
              <button 
                onClick={() => { setIsSlipOpen(false); setActiveRecord(null); }} 
                className="text-slate-400 hover:text-slate-600 p-2 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Printable Content */}
            <div className="my-6 p-6 border-2 border-slate-800 rounded-2xl bg-white text-slate-900 relative">
              {/* Slip Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-kepawa-900 text-white flex items-center justify-center font-black text-xs shrink-0 overflow-hidden">
                    {customLogo ? (
                      <img src={customLogo} alt="Logo Sekolah" className="w-full h-full object-contain p-1" />
                    ) : (
                      'SKK'
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-sm tracking-tight">SK KEPAWA BEAUFORT</h4>
                    <p className="text-[10px] text-slate-600 font-bold uppercase">Sistem Pengurusan Keberadaan Guru (G-TEPAT)</p>
                    <p className="text-[9px] text-slate-500 font-mono">Peti Surat 181, 89808 Beaufort, Sabah | XBA6019</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-slate-900 text-white text-[9px] font-mono font-bold uppercase">
                    SLIP RASMI
                  </span>
                  <div className="text-[9px] text-slate-500 font-mono mt-1">Ref: {activeRecord.id}</div>
                </div>
              </div>

              {/* Slip Body Details */}
              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Nama Guru:</span>
                    <span className="font-black text-slate-900 text-xs">{activeRecord.guru}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Status Keberadaan:</span>
                    <span className={`inline-block px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                      activeRecord.status === 'TEPAT MASA' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {activeRecord.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Kelas:</span>
                    <span className="font-bold text-slate-900">{activeRecord.kelas}</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Subjek:</span>
                    <span className="font-bold text-slate-900">{activeRecord.subjek}</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Tarikh & Masa:</span>
                    <span className="font-bold text-slate-900 font-mono text-[11px]">{activeRecord.tarikh} ({activeRecord.masa})</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Catatan / Keterangan:</span>
                  <span className="font-semibold text-slate-700 italic">{activeRecord.catatan || 'Tiada catatan tambahan.'}</span>
                </div>
              </div>

              {/* Slip Signatures Footer */}
              <div className="grid grid-cols-2 gap-6 pt-6 mt-6 border-t border-slate-300 text-center text-[10px]">
                <div>
                  <div className="h-10"></div>
                  <div className="border-t border-slate-400 pt-1 font-bold">Tandatangan Guru</div>
                  <div className="text-[9px] text-slate-500 uppercase">{activeRecord.guru}</div>
                </div>
                <div>
                  <div className="h-10 flex items-center justify-center">
                    <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      VERIFIKASI SISTEM DELIMa
                    </span>
                  </div>
                  <div className="border-t border-slate-400 pt-1 font-bold">Disahkan Oleh Pentadbiran</div>
                  <div className="text-[9px] text-slate-500 uppercase">G-TEPAT SK KEPAWA</div>
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setIsSlipOpen(false); setActiveRecord(null); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrintSingleSlip}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-gold-400" /> Cetak Slip Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Manual Attendance Add Modal */}
      {isAddManualOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-kepawa-100 text-kepawa-700 flex items-center justify-center text-lg font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Daftar Kehadiran Manual</h3>
                  <p className="text-xs text-slate-500">Tambah log kehadiran guru ke kelas</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddManualOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-2 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Pilih Guru</label>
                <select
                  value={formGuru}
                  onChange={(e) => setFormGuru(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.nama}>{u.nama}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kelas</label>
                  <select
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.nama}>{c.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Subjek</label>
                  <select
                    value={formSubjek}
                    onChange={(e) => setFormSubjek(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.nama}>{s.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                  >
                    <option value="TEPAT MASA">TEPAT MASA</option>
                    <option value="LEWAT">LEWAT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Catatan</label>
                  <input
                    type="text"
                    value={formCatatan}
                    onChange={(e) => setFormCatatan(e.target.value)}
                    placeholder="Contoh: Pendaftaran manual"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-kepawa-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddManualOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-kepawa-600 hover:bg-kepawa-700 text-white font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Simpan Rekod
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
