import React, { useState } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Trash2, 
  Pencil, 
  X, 
  Clock, 
  Filter, 
  Printer, 
  Search, 
  Copy, 
  CheckCircle2, 
  User, 
  School, 
  BookOpen, 
  Layers, 
  RefreshCw,
  Sparkles,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { TimetableSlot, ClassItem, SubjectItem, User as UserType, SessionData } from '../types';
import { INITIAL_SLOTS, INITIAL_DAYS, OFFICIAL_MASTER_SCHEDULE, MasterScheduleItem } from '../data/initialData';
import { StorageService } from '../services/storageService';

interface JadualViewProps {
  timetable: TimetableSlot[];
  classes: ClassItem[];
  subjects: SubjectItem[];
  users: UserType[];
  session: SessionData;
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

type ViewMode = 'official' | 'class' | 'teacher' | 'master' | 'list';

export const JadualView: React.FC<JadualViewProps> = ({
  timetable,
  classes,
  subjects,
  users,
  session,
  onRefresh,
  onShowToast
}) => {
  const isAdminOrPk = session.role === 'admin' || session.role === 'pentadbir' || session.role === 'penyelaras';
  const isGuru = session.role === 'guru';

  // Navigation & View mode
  const [viewMode, setViewMode] = useState<ViewMode>('official');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(classes[0]?.nama || '1 JINGGA');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>(session.nama);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Official Schedule filters
  const [officialScope, setOfficialScope] = useState<'all' | 'core'>('all');
  const [officialClassFilter, setOfficialClassFilter] = useState<string>('all');
  const [officialDayFilter, setOfficialDayFilter] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Form states for Add / Edit
  const [formHari, setFormHari] = useState<'Isnin' | 'Selasa' | 'Rabu' | 'Khamis' | 'Jumaat'>('Isnin');
  const [formSlotId, setFormSlotId] = useState<string>('S1');
  const [formKelas, setFormKelas] = useState<string>(classes[0]?.nama || '1 JINGGA');
  const [formSubjek, setFormSubjek] = useState<string>(subjects[0]?.kod || 'BM');
  const [formGuru, setFormGuru] = useState<string>(users[0]?.nama || session.nama);
  const [formBilik, setFormBilik] = useState<string>('Bilik Darjah');

  // Stats calculation
  const totalSlots = timetable.length;
  const uniqueTeachersCount = new Set(timetable.map(t => t.guru)).size;
  const uniqueClassesCount = new Set(timetable.map(t => t.kelas)).size;

  // Open Add Modal
  const handleOpenAddModal = (presetHari?: 'Isnin' | 'Selasa' | 'Rabu' | 'Khamis' | 'Jumaat', presetSlotId?: string, presetKelas?: string) => {
    setFormHari(presetHari || 'Isnin');
    setFormSlotId(presetSlotId || 'S1');
    setFormKelas(presetKelas || (viewMode === 'class' ? selectedClassFilter : classes[0]?.nama || '1 JINGGA'));
    setFormSubjek(subjects[0]?.kod || 'BM');
    setFormGuru(viewMode === 'teacher' ? selectedTeacherFilter : users[0]?.nama || session.nama);
    setFormBilik('Bilik Darjah');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormHari(slot.hari);
    setFormSlotId(slot.slotId);
    setFormKelas(slot.kelas);
    setFormSubjek(slot.subjek);
    setFormGuru(slot.guru);
    setFormBilik(slot.bilik || 'Bilik Darjah');
    setIsEditModalOpen(true);
  };

  // Save new slot (TAMBAH)
  const handleSaveAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveTimetableSlot({
      hari: formHari,
      slotId: formSlotId,
      kelas: formKelas,
      subjek: formSubjek,
      guru: formGuru,
      bilik: formBilik
    });
    onShowToast(`Slot jadual waktu bagi ${formKelas} (${formSubjek}) berjaya ditambah!`, 'success');
    setIsAddModalOpen(false);
    onRefresh();
  };

  // Update existing slot (KEMASKINI / EDIT)
  const handleSaveEditSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    StorageService.saveTimetableSlot({
      id: editingSlot.id,
      hari: formHari,
      slotId: formSlotId,
      kelas: formKelas,
      subjek: formSubjek,
      guru: formGuru,
      bilik: formBilik
    });
    onShowToast(`Slot jadual waktu ${editingSlot.id} berjaya dikemaskini!`, 'success');
    setIsEditModalOpen(false);
    setEditingSlot(null);
    onRefresh();
  };

  // Delete slot (PADAM)
  const handleDeleteSlot = (slot: TimetableSlot) => {
    const confirmMsg = `Adakah anda pasti mahu memadamkan slot jadual ini?\n\nHari: ${slot.hari}\nSlot: ${slot.slotId}\nKelas: ${slot.kelas}\nSubjek: ${slot.subjek}\nGuru: ${slot.guru}`;
    if (window.confirm(confirmMsg)) {
      StorageService.deleteTimetableSlot(slot.id);
      onShowToast(`Slot ${slot.subjek} (${slot.kelas} - ${slot.hari}) telah dipadam.`, 'info');
      onRefresh();
    }
  };

  // Duplicate slot (SALIN / GANDAKAN)
  const handleDuplicateSlot = (slot: TimetableSlot) => {
    StorageService.saveTimetableSlot({
      hari: slot.hari,
      slotId: slot.slotId,
      masa: slot.masa,
      kelas: slot.kelas,
      subjek: slot.subjek,
      guru: slot.guru,
      bilik: slot.bilik
    });
    onShowToast(`Slot ${slot.subjek} berjaya digandakan! Anda boleh menyunting slot baharu ini.`, 'success');
    onRefresh();
  };

  // Reset/Sync timetable to official Jadual Induk
  const handleResetOfficialSchedule = () => {
    if (window.confirm('Adakah anda pasti mahu menyusun semula data Jadual Waktu mengikut Jadual Induk Rasmi SK KEPAWA 2026?')) {
      StorageService.resetTimetableToOfficial();
      onRefresh();
      onShowToast('Data Jadual Waktu telah berjaya disusun semula mengikut Jadual Induk Rasmi SK KEPAWA!', 'success');
    }
  };

  // Filtered timetable for active view
  const filteredTimetable = timetable.filter(slot => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = (
        slot.guru.toLowerCase().includes(q) ||
        slot.kelas.toLowerCase().includes(q) ||
        slot.subjek.toLowerCase().includes(q) ||
        slot.hari.toLowerCase().includes(q) ||
        (slot.masa && slot.masa.toLowerCase().includes(q)) ||
        (slot.bilik && slot.bilik.toLowerCase().includes(q))
      );
      if (!match) return false;
    }

    // Day filter
    if (selectedDayFilter !== 'all' && slot.hari !== selectedDayFilter) return false;

    // View mode filters
    if (viewMode === 'teacher') {
      if (isAdminOrPk) {
        if (slot.guru !== selectedTeacherFilter) return false;
      } else {
        if (slot.guru !== session.nama) return false;
      }
    } else if (viewMode === 'class') {
      if (slot.kelas !== selectedClassFilter) return false;
    }

    return true;
  });

  // Get subject name helper
  const getSubjectName = (kod: string) => {
    const found = subjects.find(s => s.kod.toUpperCase() === kod.toUpperCase());
    return found ? found.nama : kod;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              PANEL JADUAL WAKTU INDUK 2026
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
              SK KEPAWA (SESI 2026)
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Jadual Waktu Induk Rasmi & Penyelarasan PdP
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem pengurusan jadual waktu rasmi SK Kepawa berlandaskan Jadual Induk 2026 dengan keupayaan Tambah, Edit / Kemaskini, Padam, Gandakan dan Cetak.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isAdminOrPk && (
            <button
              onClick={handleResetOfficialSchedule}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-sm"
              title="Susun semula data mengikut Jadual Induk Rasmi"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Susun Semula Jadual Induk</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-2 border border-slate-200 shadow-sm"
            title="Cetak jadual waktu"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Jadual</span>
          </button>

          <button
            onClick={() => {
              onRefresh();
              onShowToast('Data jadual waktu telah diselaraskan.', 'info');
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition border border-slate-200 shadow-sm"
            title="Segarkan data"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>

          {isAdminOrPk && (
            <button
              onClick={() => handleOpenAddModal()}
              className="px-5 py-2.5 bg-kepawa-600 hover:bg-kepawa-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-kepawa-600/25 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Slot Baharu</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalSlots}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Jumlah Slot PdP</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 leading-tight">{uniqueTeachersCount}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Guru Mengajar</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 leading-tight">{uniqueClassesCount}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Kelas Terlibat</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 leading-tight">{OFFICIAL_MASTER_SCHEDULE.length} Sesi</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Jadual Induk (Thn 1 - 6)</div>
          </div>
        </div>
      </div>

      {/* Control Panel: View Modes, Selectors & Search Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
        {/* Row 1: View Modes Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('official')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                viewMode === 'official' ? 'bg-white shadow text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              <span>Jadual Induk Rasmi (10 Sesi)</span>
            </button>

            <button
              onClick={() => setViewMode('class')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                viewMode === 'class' ? 'bg-white shadow text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <School className="w-3.5 h-3.5 text-kepawa-600" />
              <span>Matriks Kelas</span>
            </button>

            <button
              onClick={() => setViewMode('teacher')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                viewMode === 'teacher' ? 'bg-white shadow text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-purple-600" />
              <span>Jadual Guru</span>
            </button>

            {isAdminOrPk && (
              <button
                onClick={() => setViewMode('master')}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  viewMode === 'master' ? 'bg-white shadow text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Jadual Induk Semua Kelas</span>
              </button>
            )}

            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-white shadow text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Senarai & Pengurusan ({timetable.length})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[220px] flex-grow sm:flex-grow-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari guru, kelas, subjek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-kepawa-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Secondary Selectors & Day Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-kepawa-600" /> Penapis:
            </span>

            {/* Class selector for 'class' view */}
            {viewMode === 'class' && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-500">Kelas:</span>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-black text-slate-800 shadow-sm focus:ring-2 focus:ring-kepawa-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.nama}>{c.nama} ({c.guru_kelas})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Teacher selector for 'teacher' view */}
            {viewMode === 'teacher' && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-500">Pilih Guru:</span>
                <select
                  value={selectedTeacherFilter}
                  onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-black text-slate-800 shadow-sm focus:ring-2 focus:ring-kepawa-500 max-w-xs truncate"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.nama}>{u.nama} ({u.role.toUpperCase()})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Day filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">Hari:</span>
              <select
                value={selectedDayFilter}
                onChange={(e) => setSelectedDayFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-kepawa-500"
              >
                <option value="all">Semua Hari (Isnin - Jumaat)</option>
                {INITIAL_DAYS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-slate-500 font-semibold flex items-center gap-2">
            <span>Memaparkan: <strong className="text-slate-900">{filteredTimetable.length}</strong> slot</span>
            {isAdminOrPk && (
              <button
                onClick={() => handleOpenAddModal()}
                className="px-2.5 py-1 bg-kepawa-50 text-kepawa-700 hover:bg-kepawa-100 font-bold rounded-lg transition inline-flex items-center gap-1 text-[11px]"
              >
                <Plus className="w-3 h-3" /> Tambah Slot
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          VIEW 0: OFFICIAL MASTER SCHEDULE (JADUAL INDUK RASMI TAHUN 1 - 6)
          ========================================================= */}
      {viewMode === 'official' && (() => {
        const displayedOfficialSchedule = OFFICIAL_MASTER_SCHEDULE.filter(item => {
          if (officialScope === 'core' && !item.isCoreItem) return false;
          if (officialClassFilter !== 'all' && item.kelas !== officialClassFilter) return false;
          if (officialDayFilter !== 'all' && item.hari !== officialDayFilter) return false;
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
              item.guru.toLowerCase().includes(q) ||
              item.kelas.toLowerCase().includes(q) ||
              item.subjek.toLowerCase().includes(q) ||
              item.subjekKod.toLowerCase().includes(q) ||
              item.hari.toLowerCase().includes(q)
            );
          }
          return true;
        });

        return (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-5 p-5 sm:p-6">
            {/* Header & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase">
                    JADUAL INDUK RASMI SK KEPAWA
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Tahun 1 hingga Tahun 6 (Sesi 2026)
                  </span>
                </div>
                <h4 className="text-xl font-black text-slate-900 mt-1">
                  Jadual Waktu Induk PdP Lengkap
                </h4>
                <p className="text-xs text-slate-500">
                  Semua kelas Tahun 1 hingga Tahun 6 telah diisi secara automatik dan tepat berdasarkan ketetapan Jadual Induk Rasmi SK Kepawa.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isAdminOrPk && (
                  <button
                    onClick={handleResetOfficialSchedule}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition flex items-center gap-1.5 border border-amber-200 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                    <span>Segerak Jadual Induk</span>
                  </button>
                )}
                {isAdminOrPk && (
                  <button
                    onClick={() => handleOpenAddModal()}
                    className="px-4 py-2 bg-kepawa-600 hover:bg-kepawa-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Slot Baharu</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scope & Class Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              {/* Scope toggle: All Sessions vs 10 Core */}
              <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl font-bold">
                <button
                  onClick={() => setOfficialScope('all')}
                  className={`px-3 py-1 rounded-lg transition ${
                    officialScope === 'all' ? 'bg-white shadow text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua Sesi Tahun 1 - 6 ({OFFICIAL_MASTER_SCHEDULE.length})
                </button>
                <button
                  onClick={() => setOfficialScope('core')}
                  className={`px-3 py-1 rounded-lg transition ${
                    officialScope === 'core' ? 'bg-white shadow text-amber-900 font-black' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⭐ 10 Sesi Induk Teras
                </button>
              </div>

              {/* Class Chips Filter */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
                <span className="font-bold text-slate-500 mr-1">Kelas:</span>
                <button
                  onClick={() => setOfficialClassFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                    officialClassFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Semua
                </button>
                {classes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setOfficialClassFilter(c.nama)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                      officialClassFilter === c.nama
                        ? 'bg-kepawa-700 text-white border-kepawa-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c.nama}
                  </button>
                ))}
              </div>

              {/* Day Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-slate-500">Hari:</span>
                <select
                  value={officialDayFilter}
                  onChange={(e) => setOfficialDayFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-800 text-xs shadow-sm focus:ring-2 focus:ring-kepawa-500"
                >
                  <option value="all">Semua Hari</option>
                  {INITIAL_DAYS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                    <th className="p-3.5 rounded-l-xl text-center w-12">BIL</th>
                    <th className="p-3.5">HARI</th>
                    <th className="p-3.5">MASA</th>
                    <th className="p-3.5">KELAS</th>
                    <th className="p-3.5">MATA PELAJARAN (SUBJEK)</th>
                    <th className="p-3.5">GURU PENGAJAR</th>
                    <th className="p-3.5 text-center rounded-r-xl w-32">TINDAKAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs font-medium">
                  {displayedOfficialSchedule.map((item, idx) => {
                    const dayBadgeColor = 
                      item.hari === 'Isnin' ? 'bg-blue-100 text-blue-900 border-blue-200' :
                      item.hari === 'Selasa' ? 'bg-purple-100 text-purple-900 border-purple-200' :
                      item.hari === 'Rabu' ? 'bg-emerald-100 text-emerald-900 border-emerald-200' :
                      item.hari === 'Khamis' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                      'bg-rose-100 text-rose-900 border-rose-200';

                    // Find corresponding slot in timetable if exists
                    const matchingSlot = timetable.find(
                      t => t.hari === item.hari && t.kelas === item.kelas && (t.subjek === item.subjekKod || t.subjek === item.subjek)
                    );

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 text-center font-black text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${dayBadgeColor}`}>
                              {item.hari}
                            </span>
                            {item.isCoreItem && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black border border-amber-300" title="Sesi Induk Teras Asal">
                                TERAS
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold font-mono text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.masa}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-black text-slate-900">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                            {item.kelas}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{item.subjek}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Kod: {item.subjekKod}</div>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-kepawa-100 text-kepawa-800 flex items-center justify-center text-[10px] font-black shrink-0">
                              {item.guru.charAt(0)}
                            </div>
                            <span className="truncate max-w-xs">{item.guru}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {matchingSlot ? (
                              <>
                                <button
                                  onClick={() => handleOpenEditModal(matchingSlot)}
                                  className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
                                  title="Edit Slot Ini"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDuplicateSlot(matchingSlot)}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition"
                                  title="Gandakan Slot"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                {isAdminOrPk && (
                                  <button
                                    onClick={() => handleDeleteSlot(matchingSlot)}
                                    className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition"
                                    title="Padam Slot"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => handleOpenAddModal(item.hari, item.slotIds[0], item.kelas)}
                                className="px-2.5 py-1 rounded-lg bg-kepawa-50 text-kepawa-700 hover:bg-kepawa-100 border border-kepawa-200 font-bold text-xs transition"
                              >
                                + Tambah
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {displayedOfficialSchedule.length === 0 && (
              <div className="text-center py-10 text-slate-400 font-semibold text-xs">
                Tiada sesi jadual induk yang menepati penapis carian.
              </div>
            )}
          </div>
        );
      })()}

      {/* =========================================================
          VIEW 1 & 2: CLASS / TEACHER MATRIX SCHEDULE GRID
          ========================================================= */}
      {(viewMode === 'class' || viewMode === 'teacher') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-kepawa-600" />
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                {viewMode === 'class' ? `Jadual Waktu Kelas: ${selectedClassFilter}` : `Jadual Mengajar: ${selectedTeacherFilter || session.nama}`}
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              * Klik butang pensel pada kad untuk EDIT atau butang (+) untuk TAMBAH slot
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase">
                  <th className="p-3 border-r border-slate-800 text-center w-28">HARI / MASA</th>
                  {INITIAL_SLOTS.map(slot => (
                    <th
                      key={slot.id}
                      className={`p-2 border-r border-slate-800 text-center ${slot.isRecess ? 'bg-amber-800 text-amber-100 w-24' : ''}`}
                    >
                      <div className="text-xs font-black">{slot.id}</div>
                      <div className="text-[9px] font-normal opacity-80">{slot.code}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {INITIAL_DAYS.filter(d => selectedDayFilter === 'all' || d === selectedDayFilter).map((day) => (
                  <tr key={day} className="hover:bg-slate-50/50 transition">
                    <td className="p-3 border-r border-slate-200 font-black text-slate-900 bg-slate-100 text-center">
                      <div className="text-sm font-black">{day}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Sesi Pagi</div>
                    </td>

                    {INITIAL_SLOTS.map((slot) => {
                      if (slot.isRecess) {
                        return (
                          <td key={slot.id} className="p-2 bg-amber-50/80 border-r border-slate-200 text-center font-black text-[10px] text-amber-800">
                            REHAT
                          </td>
                        );
                      }

                      const matchingSlots = filteredTimetable.filter(
                        t => t.hari === day && t.slotId === slot.id
                      );

                      return (
                        <td key={slot.id} className="p-1.5 border-r border-slate-200 align-top min-w-[90px] h-24 relative group">
                          {matchingSlots.length === 0 ? (
                            <div className="w-full h-full min-h-[70px] rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-slate-400 hover:bg-slate-50/80 transition p-1 text-center">
                              {isAdminOrPk && (
                                <button
                                  onClick={() => handleOpenAddModal(day, slot.id, viewMode === 'class' ? selectedClassFilter : undefined)}
                                  className="w-full h-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition text-kepawa-600 font-bold text-[10px]"
                                  title={`Tambah slot ${slot.id} (${day})`}
                                >
                                  <Plus className="w-4 h-4 mb-0.5" />
                                  <span>+ Slot</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {matchingSlots.map(m => (
                                <div
                                  key={m.id}
                                  className="bg-white hover:bg-blue-50/90 border border-blue-200 rounded-xl p-2 text-[10px] shadow-sm relative group/card transition"
                                >
                                  {/* Subject Code & Actions */}
                                  <div className="flex items-center justify-between gap-1 pb-1 border-b border-blue-100">
                                    <span className="font-black text-blue-950 bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">
                                      {m.subjek}
                                    </span>

                                    {/* Action Buttons for this Slot */}
                                    {isAdminOrPk && (
                                      <div className="flex items-center gap-0.5 opacity-80 group-hover/card:opacity-100 transition">
                                        <button
                                          onClick={() => handleOpenEditModal(m)}
                                          className="p-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
                                          title="Edit / Kemaskini slot"
                                        >
                                          <Pencil className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDuplicateSlot(m)}
                                          className="p-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                                          title="Gandakan slot"
                                        >
                                          <Copy className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSlot(m)}
                                          className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition"
                                          title="Padam slot"
                                        >
                                          <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Details */}
                                  <div className="mt-1 font-bold text-slate-800 truncate" title={getSubjectName(m.subjek)}>
                                    {getSubjectName(m.subjek)}
                                  </div>
                                  <div className="font-extrabold text-kepawa-800 truncate">
                                    {m.kelas}
                                  </div>
                                  <div className="text-slate-500 text-[9px] truncate font-medium" title={m.guru}>
                                    {m.guru}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 3: MASTER TIMETABLE FOR ALL CLASSES (JADUAL INDUK SEMUA KELAS)
          ========================================================= */}
      {viewMode === 'master' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-lg font-black text-slate-900">Jadual Waktu Induk Sekolah (Semua Kelas)</h4>
              <p className="text-xs text-slate-500">Matriks lengkap susunan PdP mengikut setiap kelas dan slot waktu.</p>
            </div>
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-kepawa-600 hover:bg-kepawa-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Slot Jadual
            </button>
          </div>

          {INITIAL_DAYS.filter(d => selectedDayFilter === 'all' || d === selectedDayFilter).map((day) => (
            <div key={day} className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-gold-400" />
                  HARI: {day.toUpperCase()}
                </span>
                <span className="text-[11px] font-bold text-slate-300 font-mono">
                  {timetable.filter(t => t.hari === day).length} Slot PdP Ditetapkan
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase border-b border-slate-200">
                      <th className="p-2.5 border-r border-slate-200 w-24">KELAS</th>
                      {INITIAL_SLOTS.map(slot => (
                        <th
                          key={slot.id}
                          className={`p-2 border-r border-slate-200 text-center ${slot.isRecess ? 'bg-amber-100 text-amber-900 w-20' : ''}`}
                        >
                          <div>{slot.id}</div>
                          <div className="text-[8px] font-normal opacity-75">{slot.code}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {classes.map(cls => (
                      <tr key={cls.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-2.5 border-r border-slate-200 font-black text-slate-900 bg-slate-50">
                          {cls.nama}
                        </td>

                        {INITIAL_SLOTS.map(slot => {
                          if (slot.isRecess) {
                            return (
                              <td key={slot.id} className="p-1 bg-amber-50/70 border-r border-slate-200 text-center text-[9px] font-black text-amber-800">
                                REHAT
                              </td>
                            );
                          }

                          const matching = timetable.find(
                            t => t.hari === day && t.slotId === slot.id && t.kelas === cls.nama
                          );

                          return (
                            <td key={slot.id} className="p-1 border-r border-slate-200 align-top min-w-[85px] h-16 relative group">
                              {matching ? (
                                <div className="bg-blue-50/90 hover:bg-blue-100 border border-blue-200 rounded-lg p-1.5 text-[9px] shadow-sm relative group/inner">
                                  <div className="font-black text-blue-950 flex items-center justify-between">
                                    <span>{matching.subjek}</span>
                                    {isAdminOrPk && (
                                      <div className="flex items-center gap-0.5 opacity-0 group-hover/inner:opacity-100 transition">
                                        <button
                                          onClick={() => handleOpenEditModal(matching)}
                                          className="text-slate-500 hover:text-amber-700"
                                          title="Edit"
                                        >
                                          <Pencil className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSlot(matching)}
                                          className="text-slate-500 hover:text-red-700"
                                          title="Padam"
                                        >
                                          <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-slate-600 truncate font-semibold mt-0.5" title={matching.guru}>
                                    {matching.guru}
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full min-h-[45px] flex items-center justify-center text-slate-300">
                                  {isAdminOrPk && (
                                    <button
                                      onClick={() => handleOpenAddModal(day, slot.id, cls.nama)}
                                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-kepawa-600 p-1"
                                      title={`Tambah slot ${cls.nama} (${slot.id})`}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================
          VIEW 4: COMPLETE LIST & MANAGEMENT DATA TABLE (SENARAI LENGKAP)
          ========================================================= */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-slate-900">Senarai Penuh Slot Jadual Waktu Induk</h4>
              <p className="text-xs text-slate-500">Papar, sunting (edit), kemaskini, atau padam rekod jadual PdP.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                Jumlah: <strong className="text-slate-900">{filteredTimetable.length}</strong> slot
              </span>
              {isAdminOrPk && (
                <button
                  onClick={() => handleOpenAddModal()}
                  className="px-3.5 py-1.5 bg-kepawa-600 hover:bg-kepawa-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1 shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Slot
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-black">
                  <th className="p-3.5 pl-5">Hari & Slot</th>
                  <th className="p-3.5">Waktu Sesi</th>
                  <th className="p-3.5">Kelas</th>
                  <th className="p-3.5">Mata Pelajaran</th>
                  <th className="p-3.5">Guru Bertugas</th>
                  <th className="p-3.5">Bilik / Lokasi</th>
                  <th className="p-3.5 text-right pr-5">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTimetable.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                      Tiada slot jadual waktu ditemui dengan kriteria penapis semasa.
                    </td>
                  </tr>
                ) : (
                  filteredTimetable.map((slot) => {
                    const timeSlotInfo = INITIAL_SLOTS.find(s => s.id === slot.slotId);
                    return (
                      <tr key={slot.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 pl-5 font-black text-slate-900">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-black mr-2">
                            {slot.hari}
                          </span>
                          <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-900 rounded-md text-[10px] font-black">
                            {slot.slotId}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600 font-semibold text-[11px]">
                          {timeSlotInfo ? timeSlotInfo.display : slot.slotId}
                        </td>
                        <td className="p-3.5 font-black text-kepawa-800">{slot.kelas}</td>
                        <td className="p-3.5">
                          <span className="font-black text-slate-900">{slot.subjek}</span>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {getSubjectName(slot.subjek)}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">{slot.guru}</td>
                        <td className="p-3.5 text-slate-500 font-semibold">{slot.bilik || 'Bilik Darjah'}</td>
                        <td className="p-3.5 text-right pr-5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(slot)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold transition inline-flex items-center gap-1 text-[11px]"
                              title="Kemaskini / Edit slot ini"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDuplicateSlot(slot)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition inline-flex items-center"
                              title="Gandakan slot"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {isAdminOrPk && (
                              <button
                                onClick={() => handleDeleteSlot(slot)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition inline-flex items-center"
                                title="Padam slot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: TAMBAH SLOT BAHARU (ADD SLOT)
          ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Tambah Slot Jadual Waktu</h3>
                  <p className="text-xs text-slate-500">Tetapkan hari, slot masa, guru, kelas dan subjek</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddSlot} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Hari Persekolahan</label>
                  <select
                    value={formHari}
                    onChange={(e) => setFormHari(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                  >
                    {INITIAL_DAYS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Slot Waktu PdP</label>
                  <select
                    value={formSlotId}
                    onChange={(e) => setFormSlotId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                  >
                    {INITIAL_SLOTS.filter(s => !s.isRecess).map(s => (
                      <option key={s.id} value={s.id}>{s.id} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kelas</label>
                  <select
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.nama}>{c.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Mata Pelajaran</label>
                  <select
                    value={formSubjek}
                    onChange={(e) => setFormSubjek(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.kod}>{s.kod} - {s.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Guru Bertugas (DELIMa)</label>
                <select
                  value={formGuru}
                  onChange={(e) => setFormGuru(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.nama}>{u.nama} ({u.role.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Bilik / Lokasi PdP</label>
                <input
                  type="text"
                  value={formBilik}
                  onChange={(e) => setFormBilik(e.target.value)}
                  placeholder="Contoh: Bilik Darjah / Makmal Komputer / Padang"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-kepawa-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-kepawa-600 hover:bg-kepawa-700 text-white font-black rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan Slot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: EDIT / KEMASKINI SLOT JADUAL WAKTU (UPDATE SLOT)
          ========================================================= */}
      {isEditModalOpen && editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg font-bold">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Kemaskini Slot Jadual Waktu</h3>
                  <p className="text-xs text-slate-500">ID Slot: <strong className="font-mono text-slate-700">{editingSlot.id}</strong></p>
                </div>
              </div>
              <button 
                onClick={() => { setIsEditModalOpen(false); setEditingSlot(null); }} 
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSlot} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Hari Persekolahan</label>
                  <select
                    value={formHari}
                    onChange={(e) => setFormHari(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                  >
                    {INITIAL_DAYS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Slot Waktu PdP</label>
                  <select
                    value={formSlotId}
                    onChange={(e) => setFormSlotId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                  >
                    {INITIAL_SLOTS.filter(s => !s.isRecess).map(s => (
                      <option key={s.id} value={s.id}>{s.id} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kelas</label>
                  <select
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.nama}>{c.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Mata Pelajaran</label>
                  <select
                    value={formSubjek}
                    onChange={(e) => setFormSubjek(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.kod}>{s.kod} - {s.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Guru Bertugas</label>
                <select
                  value={formGuru}
                  onChange={(e) => setFormGuru(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-kepawa-500"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.nama}>{u.nama} ({u.role.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Bilik / Lokasi PdP</label>
                <input
                  type="text"
                  value={formBilik}
                  onChange={(e) => setFormBilik(e.target.value)}
                  placeholder="Contoh: Bilik Darjah / Makmal Sains"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-kepawa-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteSlot(editingSlot)}
                  className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Padam Slot Ini</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsEditModalOpen(false); setEditingSlot(null); }}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kemaskini Slot</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
