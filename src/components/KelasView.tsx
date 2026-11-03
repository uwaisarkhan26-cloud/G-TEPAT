import React, { useState, useMemo, useRef } from 'react';
import { 
  School, 
  RotateCw, 
  Upload, 
  Download, 
  Plus, 
  QrCode, 
  Edit, 
  Trash2, 
  Users, 
  CalendarCheck,
  X,
  FileSpreadsheet,
  Calendar,
  Clock,
  BookOpen,
  Printer,
  Sparkles,
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
  FileText,
  Copy,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  HelpCircle,
  GraduationCap
} from 'lucide-react';
import { ClassItem, User, SessionData, Student } from '../types';
import { StorageService } from '../services/storageService';
import { INITIAL_DAYS, OFFICIAL_MASTER_SCHEDULE } from '../data/initialData';
import { QrCodeRenderer } from './QrCodeRenderer';

interface KelasViewProps {
  classes: ClassItem[];
  users: User[];
  session: SessionData;
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onOpenQrModal: (className: string, qrPayload: string) => void;
}

export const KelasView: React.FC<KelasViewProps> = ({
  classes,
  users,
  session,
  onRefresh,
  onShowToast,
  onOpenQrModal
}) => {
  // Main Tab: 'kelas' vs 'murid'
  const [activeMainTab, setActiveMainTab] = useState<'kelas' | 'murid'>('kelas');

  // Students state
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDarjahFilter, setStudentDarjahFilter] = useState('all');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudentNama, setNewStudentNama] = useState('');
  const [newStudentKelas, setNewStudentKelas] = useState('5 KUNING');
  const [newStudentDarjah, setNewStudentDarjah] = useState(5);
  const [newStudentNoSb, setNewStudentNoSb] = useState('');
  const [newStudentJantina, setNewStudentJantina] = useState<'LELAKI' | 'PEREMPUAN'>('LELAKI');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedClassForSchedule, setSelectedClassForSchedule] = useState<ClassItem | null>(null);
  const [isBatchQrModalOpen, setIsBatchQrModalOpen] = useState(false);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);

  // Search, filter, and sorting
  const [classSearch, setClassSearch] = useState('');
  const [darjahFilter, setDarjahFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'darjah' | 'nama' | 'bil_murid'>('darjah');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Multi-select batch state
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  // Form states for Add / Edit
  const [formNama, setFormNama] = useState('');
  const [formDarjah, setFormDarjah] = useState(1);
  const [formGuruKelas, setFormGuruKelas] = useState('');
  const [formPembantuGuru, setFormPembantuGuru] = useState('');
  const [formBilMurid, setFormBilMurid] = useState(25);

  // Upload modal states
  const [uploadTab, setUploadTab] = useState<'file' | 'paste'>('file');
  const [pasteText, setPasteText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'overwrite'>('append');
  const [parsedPreview, setParsedPreview] = useState<Array<{ nama: string; darjah: number; guru_kelas: string; pembantu_guru_kelas: string; bil_murid: number }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const teachers = useMemo(() => {
    const list = users.filter(u => u.role === 'guru' || u.role === 'pentadbir' || u.role === 'penyelaras' || u.role === 'admin');
    return list.length > 0 ? list : users;
  }, [users]);

  const totalMurid = useMemo(() => {
    return classes.reduce((acc, curr) => acc + (Number(curr.bil_murid) || 0), 0);
  }, [classes]);

  // Filtered and sorted classes
  const processedClasses = useMemo(() => {
    let list = [...classes];

    // Filter by search query
    if (classSearch.trim()) {
      const q = classSearch.toLowerCase().trim();
      list = list.filter(c => 
        c.nama.toLowerCase().includes(q) || 
        c.guru_kelas.toLowerCase().includes(q) ||
        (c.pembantu_guru_kelas && c.pembantu_guru_kelas.toLowerCase().includes(q)) ||
        `tahun ${c.darjah}`.includes(q) ||
        (c.qr_code && c.qr_code.toLowerCase().includes(q))
      );
    }

    // Filter by darjah / level
    if (darjahFilter !== 'all') {
      const dNum = Number(darjahFilter);
      list = list.filter(c => c.darjah === dNum);
    }

    // Sort
    list.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'darjah') {
        comp = a.darjah - b.darjah;
        if (comp === 0) comp = a.nama.localeCompare(b.nama);
      } else if (sortBy === 'nama') {
        comp = a.nama.localeCompare(b.nama);
      } else if (sortBy === 'bil_murid') {
        comp = a.bil_murid - b.bil_murid;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return list;
  }, [classes, classSearch, darjahFilter, sortBy, sortOrder]);

  // Filtered and processed students
  const processedStudents = useMemo(() => {
    let list = [...students];
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      list = list.filter(s => 
        s.nama.toLowerCase().includes(q) ||
        s.kelas.toLowerCase().includes(q) ||
        (s.no_sb && s.no_sb.toLowerCase().includes(q)) ||
        `tahun ${s.darjah}`.includes(q)
      );
    }
    if (studentDarjahFilter !== 'all') {
      const dNum = Number(studentDarjahFilter);
      list = list.filter(s => s.darjah === dNum);
    }
    return list;
  }, [students, studentSearch, studentDarjahFilter]);

  // Selection helpers
  const handleToggleSelect = (id: string) => {
    setSelectedClassIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedClassIds.length === processedClasses.length && processedClasses.length > 0) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(processedClasses.map(c => c.id));
    }
  };

  // Add / Edit Modal triggers
  const openAdd = () => {
    setFormNama('');
    setFormDarjah(1);
    setFormGuruKelas(teachers[0]?.nama || '');
    setFormPembantuGuru('');
    setFormBilMurid(25);
    setIsAddModalOpen(true);
  };

  const openEdit = (cls: ClassItem) => {
    setEditingClass(cls);
    setFormNama(cls.nama);
    setFormDarjah(cls.darjah);
    setFormGuruKelas(cls.guru_kelas);
    setFormPembantuGuru(cls.pembantu_guru_kelas || '');
    setFormBilMurid(cls.bil_murid);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      onShowToast('Sila masukkan nama kelas.', 'error');
      return;
    }
    const cleanNama = formNama.trim().toUpperCase();
    
    // Check duplicate
    if (classes.some(c => c.nama.toUpperCase() === cleanNama)) {
      if (!window.confirm(`Kelas "${cleanNama}" sudah wujud dalam senarai. Adakah anda mahu meneruskan penambahan?`)) {
        return;
      }
    }

    StorageService.addClass({
      nama: cleanNama,
      darjah: formDarjah,
      guru_kelas: formGuruKelas || 'TIADA GURU',
      pembantu_guru_kelas: formPembantuGuru,
      bil_murid: Number(formBilMurid) || 0
    });

    onShowToast(`Kelas ${cleanNama} berjaya ditambah!`, 'success');
    setIsAddModalOpen(false);
    onRefresh();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    const cleanNama = formNama.trim().toUpperCase();
    if (!cleanNama) {
      onShowToast('Sila masukkan nama kelas.', 'error');
      return;
    }

    StorageService.updateClass(editingClass.id, {
      nama: cleanNama,
      darjah: formDarjah,
      guru_kelas: formGuruKelas,
      pembantu_guru_kelas: formPembantuGuru,
      bil_murid: Number(formBilMurid) || 0
    });

    onShowToast(`Maklumat kelas ${cleanNama} berjaya dikemaskini.`, 'success');
    setEditingClass(null);
    onRefresh();
  };

  const handleConfirmDelete = () => {
    if (!deletingClass) return;
    const name = deletingClass.nama;
    StorageService.deleteClass(deletingClass.id);
    setSelectedClassIds(prev => prev.filter(id => id !== deletingClass.id));
    setDeletingClass(null);
    onShowToast(`Kelas ${name} telah berjaya dipadam.`, 'info');
    onRefresh();
  };

  const handleBatchDelete = () => {
    if (selectedClassIds.length === 0) return;
    StorageService.deleteClassesBatch(selectedClassIds);
    onShowToast(`Berjaya memadam ${selectedClassIds.length} kelas terpilih.`, 'info');
    setSelectedClassIds([]);
    setIsBatchDeleteModalOpen(false);
    onRefresh();
  };

  const handleResetToOfficial = () => {
    if (window.confirm('Adakah anda pasti mahu memuat semula senarai 6 kelas rasmi SK KEPAWA Sesi 2026 (1 Jingga hingga 6 Merah)?')) {
      StorageService.resetClassesToOfficial();
      setSelectedClassIds([]);
      setStudents(StorageService.getStudents());
      onShowToast('Senarai kelas dan murid telah disegerakkan ke format rasmi SK Kepawa 2026!', 'success');
      onRefresh();
    }
  };

  // Student handlers
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentNama.trim()) {
      onShowToast('Sila masukkan nama penuh murid.', 'error');
      return;
    }
    const cleanNama = newStudentNama.trim().toUpperCase();
    StorageService.addStudent({
      nama: cleanNama,
      kelas: newStudentKelas,
      darjah: Number(newStudentDarjah) || 1,
      no_sb: newStudentNoSb.trim(),
      jantina: newStudentJantina,
      status: 'aktif'
    });
    setStudents(StorageService.getStudents());
    onShowToast(`Murid ${cleanNama} berjaya didaftarkan ke Kelas ${newStudentKelas}!`, 'success');
    setIsAddStudentModalOpen(false);
    setNewStudentNama('');
    setNewStudentNoSb('');
    onRefresh();
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Adakah anda pasti mahu memadam rekod murid "${name}"?`)) {
      StorageService.deleteStudent(id);
      setStudents(StorageService.getStudents());
      onShowToast(`Rekod murid ${name} telah dipadam.`, 'info');
      onRefresh();
    }
  };

  const handleDownloadStudentsCsv = () => {
    let csv = "\uFEFF";
    csv += "ID,Nama Murid,Kelas,Tahun/Darjah,No Surat Beranak/MyKid,Jantina,Status\n";
    students.forEach(s => {
      csv += `"${s.id}","${s.nama}","${s.kelas}","${s.darjah}","${s.no_sb || ''}","${s.jantina || 'LELAKI'}","${s.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Senarai_Murid_SK_Kepawa_2026_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`Senarai ${students.length} murid berjaya dimuat turun ke CSV.`, 'success');
  };

  // Export CSV
  const handleDownloadCsv = (targetClasses: ClassItem[] = classes) => {
    let csv = "\uFEFF"; // UTF-8 BOM for Excel compatibility
    csv += "ID,Nama Kelas,Tahun/Darjah,Guru Kelas,Pembantu Guru Kelas,Bilangan Murid,Kod QR\n";
    targetClasses.forEach(c => {
      const qCode = c.qr_code || `SKK-2026-${c.nama.replace(/\s+/g, '')}`;
      csv += `"${c.id}","${c.nama}","${c.darjah}","${c.guru_kelas}","${c.pembantu_guru_kelas || ''}","${c.bil_murid}","${qCode}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Senarai_Kelas_SK_Kepawa_2026_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`Fail CSV (${targetClasses.length} kelas) berjaya dimuat turun.`, 'success');
  };

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    let csv = "\uFEFF";
    csv += "Nama Kelas,Darjah,Guru Kelas,Pembantu Guru Kelas,Bilangan Murid\n";
    csv += "1 JINGGA,1,Nurfatin Nabilah binti Zainul Abidin,Zulaiha binti Ali,25\n";
    csv += "2 KUNING,2,Sh. Hasnah binti Ag. Tengah,Bong Siew Fah,26\n";
    csv += "3 HIJAU,3,Dg Ku Roziah binti Ag Ku Matasan,Dg Rusnani binti Ag Damit,28\n";
    csv += "4 BIRU,4,Zulaiha binti Ali,Nurfatin Nabilah binti Zainul Abidin,27\n";
    csv += "5 NILA,5,Bong Siew Fah,Sh. Hasnah binti Ag. Tengah,24\n";
    csv += "6 MERAH,6,Dg Rusnani binti Ag Damit,Dg Ku Roziah binti Ag Ku Matasan,30\n";

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `templat_import_kelas_sk_kepawa.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Templat CSV contoh berjaya dimuat turun.', 'info');
  };

  // Parse Raw Text / CSV for Import
  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const items: Array<{ nama: string; darjah: number; guru_kelas: string; pembantu_guru_kelas: string; bil_murid: number }> = [];
    
    // Check if first line is header
    const firstLineLower = lines[0].toLowerCase();
    const startIndex = (firstLineLower.includes('nama') || firstLineLower.includes('kelas') || firstLineLower.includes('darjah')) ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // support comma, tab, or semicolon
      const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
      const parts = line.split(delimiter).map(p => p.replace(/^["']|["']$/g, '').trim());

      if (parts.length > 0 && parts[0]) {
        const nama = parts[0].toUpperCase();
        const darjah = Number(parts[1]) || 1;
        const guru_kelas = parts[2] || 'TIADA GURU';
        const pembantu_guru_kelas = parts[3] || '';
        const bil_murid = Number(parts[4]) || 25;

        items.push({
          nama,
          darjah,
          guru_kelas,
          pembantu_guru_kelas,
          bil_murid
        });
      }
    }
    return items;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const parsed = parseCsvText(text);
      setParsedPreview(parsed);
      if (parsed.length === 0) {
        onShowToast('Tiada rekod data dijumpai dalam fail CSV tersebut.', 'warning');
      } else {
        onShowToast(`${parsed.length} data kelas berjaya dibaca untuk pengesahan.`, 'info');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (val: string) => {
    setPasteText(val);
    const parsed = parseCsvText(val);
    setParsedPreview(parsed);
  };

  const handleExecuteImport = () => {
    if (parsedPreview.length === 0) {
      onShowToast('Sila pilih fail atau masukkan data kelas terlebih dahulu.', 'error');
      return;
    }

    StorageService.importClassesBulk(parsedPreview, importMode === 'overwrite');
    onShowToast(`Berjaya mengimport ${parsedPreview.length} data kelas (${importMode === 'overwrite' ? 'Ganti Semua' : 'Tambah'})!`, 'success');
    setIsUploadModalOpen(false);
    setParsedPreview([]);
    setPasteText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onRefresh();
  };

  // Helper to count periods for a class
  const getClassPeriodsCount = (className: string) => {
    return OFFICIAL_MASTER_SCHEDULE.filter(item => item.kelas === className).reduce((acc, curr) => acc + curr.slotIds.length, 0);
  };

  // Helper to get subjects count for a class
  const getClassSubjectList = (className: string) => {
    const subs = new Set<string>();
    OFFICIAL_MASTER_SCHEDULE.filter(item => item.kelas === className).forEach(i => subs.add(i.subjekKod));
    return Array.from(subs);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-kepawa-100 text-kepawa-800 text-xs font-black uppercase">
              PENGURUSAN KELAS & JADUAL INDUK 2026
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> AKTIF & SEGERAK
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Senarai Pengurusan Kelas SK KEPAWA
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar, kemaskini, padam kelas, jana kod QR automatik, serta semak jadual waktu PdP bagi sesi persekolahan 2026.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={() => {
              onRefresh();
              onShowToast('Data kelas berjaya dikemaskini dari sistem.', 'success');
            }}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 shadow-sm"
            title="Segerak & Kemaskini Pangkalan Data"
          >
            <RotateCw className="w-4 h-4" />
            <span>Kemaskini</span>
          </button>

          {/* Import / Upload CSV */}
          <button
            onClick={() => {
              setParsedPreview([]);
              setPasteText('');
              setIsUploadModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-700 border border-purple-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title="Muat Naik Fail CSV atau Salin dari Excel"
          >
            <Upload className="w-4 h-4" />
            <span>Muat Naik Data</span>
          </button>

          {/* Download CSV */}
          <button
            onClick={() => handleDownloadCsv(classes)}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title="Muat Turun Semua Data Kelas ke CSV"
          >
            <Download className="w-4 h-4" />
            <span>Muat Turun CSV</span>
          </button>

          {/* Batch Print All QR Codes */}
          <button
            onClick={() => setIsBatchQrModalOpen(true)}
            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-800 border border-amber-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title="Papar & Cetak Semua Kad Kod QR Pintu Kelas"
          >
            <QrCode className="w-4 h-4" />
            <span>Cetak Semua Kod QR</span>
          </button>

          {/* Add Class Button */}
          <button
            onClick={openAdd}
            className="px-4 py-2.5 bg-kepawa-600 hover:bg-kepawa-700 active:scale-95 text-white rounded-2xl text-xs font-black shadow-md shadow-kepawa-600/20 transition flex items-center gap-2"
            title="Tambah Kelas Baru"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Jumlah Kelas Berdaftar</p>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">{classes.length} Kelas</h4>
            <span className="text-[10px] font-bold text-kepawa-700">Tahun 1 - Tahun 6</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-kepawa-100 text-kepawa-700 flex items-center justify-center text-xl font-bold">
            <School className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Jumlah Keseluruhan Murid</p>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">{totalMurid} Orang</h4>
            <span className="text-[10px] font-bold text-purple-700">Purata {Math.round(totalMurid / (classes.length || 1))} murid / kelas</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Sesi Persekolahan</p>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">2026 / 2027</h4>
            <span className="text-[10px] font-bold text-amber-700">SK KEPAWA BEAUFORT</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Jumlah Sesi PdP Induk</p>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">{OFFICIAL_MASTER_SCHEDULE.length} Sesi</h4>
            <span className="text-[10px] font-bold text-emerald-700">Isnin - Jumaat (Lengkap)</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tab Switcher: Pengurusan Kelas vs Senarai Murid */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMainTab('kelas')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 shadow-sm ${
              activeMainTab === 'kelas'
                ? 'bg-kepawa-800 text-white shadow-md shadow-kepawa-900/20'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Pengurusan Kelas ({classes.length} Kelas)</span>
          </button>
          <button
            onClick={() => setActiveMainTab('murid')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 shadow-sm ${
              activeMainTab === 'murid'
                ? 'bg-purple-800 text-white shadow-md shadow-purple-900/20'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Senarai Murid ({students.length} Orang)</span>
            <span className="px-1.5 py-0.5 bg-amber-400 text-amber-950 rounded-md text-[10px] font-black">
              2 Baharu
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeMainTab === 'murid' ? (
            <>
              <button
                onClick={handleDownloadStudentsCsv}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Eksport CSV Murid</span>
              </button>
              <button
                onClick={() => {
                  setNewStudentNama('');
                  setNewStudentNoSb('');
                  setIsAddStudentModalOpen(true);
                }}
                className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-purple-700/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Murid Baru</span>
              </button>
            </>
          ) : (
            <span className="text-xs font-bold text-slate-500 pr-2">
              Sesi Persekolahan 2026/2027
            </span>
          )}
        </div>
      </div>

      {activeMainTab === 'kelas' ? (
        <>
          {/* Batch Actions Bar (when items are selected) */}
      {selectedClassIds.length > 0 && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fade-in border border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-kepawa-500 text-white font-black rounded-lg">
              {selectedClassIds.length}
            </span>
            <span className="font-bold">Kelas dipilih daripada senarai</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const selectedList = classes.filter(c => selectedClassIds.includes(c.id));
                handleDownloadCsv(selectedList);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Muat Turun CSV ({selectedClassIds.length})</span>
            </button>

            <button
              onClick={() => setIsBatchDeleteModalOpen(true)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-600/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Padam ({selectedClassIds.length}) Kelas</span>
            </button>

            <button
              onClick={() => setSelectedClassIds([])}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Batal Pilihan
            </button>
          </div>
        </div>
      )}

      {/* Classes Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        {/* Table Filter and Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Level / Darjah Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-600">Darjah:</span>
              <select
                value={darjahFilter}
                onChange={(e) => setDarjahFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-kepawa-500"
              >
                <option value="all">Semua Tahun (1 - 6)</option>
                <option value="1">Tahun 1</option>
                <option value="2">Tahun 2</option>
                <option value="3">Tahun 3</option>
                <option value="4">Tahun 4</option>
                <option value="5">Tahun 5</option>
                <option value="6">Tahun 6</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-600">Susun:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-kepawa-500"
              >
                <option value="darjah">Mengikut Tahun</option>
                <option value="nama">Mengikut Nama Kelas</option>
                <option value="bil_murid">Mengikut Bil Murid</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100"
                title={`Susunan ${sortOrder === 'asc' ? 'Menaik (A-Z)' : 'Menurun (Z-A)'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kelas, guru, kod..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-kepawa-500 shadow-sm"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold shrink-0">
              {processedClasses.length} daripada {classes.length} kelas
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                <th className="p-3.5 pl-4 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-500 hover:text-slate-900 transition"
                    title={selectedClassIds.length === processedClasses.length ? 'Nyahpilih Semua' : 'Pilih Semua'}
                  >
                    {selectedClassIds.length === processedClasses.length && processedClasses.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-kepawa-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="p-3.5">Nama Kelas & Kod</th>
                <th className="p-3.5">Tahun / Darjah</th>
                <th className="p-3.5">Guru Kelas & Pembantu</th>
                <th className="p-3.5 text-center">Bilangan Murid</th>
                <th className="p-3.5 text-center">Subjek Utama</th>
                <th className="p-3.5 text-center">Waktu PdP / Mggu</th>
                <th className="p-3.5 text-right pr-5">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {processedClasses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <School className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-slate-600">Tiada kelas dijumpai.</p>
                    <p className="text-xs text-slate-400 mt-1">Sila tambah kelas baru atau sesuaikan carian anda.</p>
                    <button
                      onClick={openAdd}
                      className="mt-4 px-4 py-2 bg-kepawa-600 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Kelas Sekarang
                    </button>
                  </td>
                </tr>
              ) : (
                processedClasses.map((cls) => {
                  const subjekList = getClassSubjectList(cls.nama);
                  const periodCount = getClassPeriodsCount(cls.nama);
                  const isSelected = selectedClassIds.includes(cls.id);
                  const qrVal = cls.qr_code || `SKK-2026-${cls.nama.replace(/\s+/g, '')}`;

                  return (
                    <tr 
                      key={cls.id} 
                      className={`transition ${isSelected ? 'bg-amber-50/70' : 'hover:bg-slate-50'}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 pl-4 text-center">
                        <button
                          onClick={() => handleToggleSelect(cls.id)}
                          className="text-slate-500 hover:text-slate-900 transition"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-kepawa-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Name & QR */}
                      <td className="p-3.5 font-black text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-kepawa-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                            {cls.darjah}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{cls.nama}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 border border-slate-200">
                                {qrVal}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Darjah */}
                      <td className="p-3.5 font-bold text-slate-700">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold">
                          Tahun {cls.darjah}
                        </span>
                      </td>

                      {/* Teacher and Assistant */}
                      <td className="p-3.5 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-black shrink-0 border border-amber-200">
                            {cls.guru_kelas.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 truncate max-w-xs">{cls.guru_kelas}</div>
                            {cls.pembantu_guru_kelas && (
                              <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                                <span className="text-[9px] font-bold px-1 py-0.2 bg-slate-100 text-slate-600 rounded">Pembantu:</span>
                                <span className="truncate max-w-[180px]">{cls.pembantu_guru_kelas}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Students Count */}
                      <td className="p-3.5 text-center font-black text-slate-800">
                        <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs">
                          {cls.bil_murid} Murid
                        </span>
                      </td>

                      {/* Subjects */}
                      <td className="p-3.5 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1 max-w-[200px] mx-auto">
                          {subjekList.slice(0, 4).map(s => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-black border border-slate-200">
                              {s}
                            </span>
                          ))}
                          {subjekList.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold">
                              +{subjekList.length - 4}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Periods */}
                      <td className="p-3.5 text-center font-bold text-slate-800">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-black">
                          {periodCount || 48} Slot / Mggu
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-right pr-5">
                        <div className="inline-flex items-center gap-1">
                          {/* Schedule Button */}
                          <button
                            onClick={() => setSelectedClassForSchedule(cls)}
                            className="px-2.5 py-1.5 rounded-xl bg-kepawa-50 text-kepawa-800 hover:bg-kepawa-100 font-bold text-[11px] transition inline-flex items-center gap-1 border border-kepawa-200 shadow-sm"
                            title="Lihat Jadual Waktu Kelas"
                          >
                            <Calendar className="w-3.5 h-3.5 text-kepawa-700" /> Jadual
                          </button>

                          {/* Murid Button */}
                          <button
                            onClick={() => {
                              setStudentDarjahFilter(String(cls.darjah));
                              setStudentSearch(cls.nama);
                              setActiveMainTab('murid');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-[11px] transition inline-flex items-center gap-1 border border-purple-200 shadow-sm"
                            title={`Lihat Senarai Murid ${cls.nama}`}
                          >
                            <Users className="w-3.5 h-3.5 text-purple-600" /> Murid
                          </button>

                          {/* QR Code Button */}
                          <button
                            onClick={() => onOpenQrModal(cls.nama, qrVal)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-[11px] transition inline-flex items-center gap-1 border border-amber-200 shadow-sm"
                            title="Papar & Cetak Kod QR Kelas"
                          >
                            <QrCode className="w-3.5 h-3.5 text-amber-700" /> QR
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEdit(cls)}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition inline-flex items-center gap-1 border border-blue-200 shadow-sm"
                            title="Kemaskini Maklumat Kelas"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-600" /> Edit
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeletingClass(cls)}
                            className="p-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-bold text-[11px] transition inline-flex items-center border border-red-200 shadow-sm"
                            title="Padam Kelas"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info and template reset */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="font-bold text-kepawa-700 hover:underline inline-flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Muat Turun Templat Contoh CSV
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={handleResetToOfficial}
              className="font-bold text-amber-700 hover:underline inline-flex items-center gap-1"
            >
              <RotateCw className="w-3.5 h-3.5" /> Pulihkan 6 Kelas Rasmi 2026
            </button>
          </div>
          <span className="font-semibold text-slate-400">
            Sistem G-TEPAT SK KEPAWA (Sesi 2026)
          </span>
        </div>
      </div>
    </>
  ) : (
    /* =========================================================================
       SENARAI MURID (STUDENTS VIEW)
       ========================================================================= */
    <div className="space-y-4">
      {/* Target Students Highlight Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mohamad Aiman Bin Erwan (Tahun 5) */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-50 to-white border-2 border-amber-300 rounded-2xl shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
            5
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-black text-[10px] uppercase">
                Murid Berdaftar 2026
              </span>
              <span className="text-[11px] font-bold text-slate-500">Tahun 5</span>
            </div>
            <h4 className="font-black text-slate-900 text-sm mt-0.5 truncate">
              MOHAMAD AIMAN BIN ERWAN
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-semibold">
              <span className="px-2 py-0.5 bg-white rounded border border-slate-200 font-bold text-amber-800">
                Kelas: 5 KUNING
              </span>
              <span>•</span>
              <span className="font-mono text-slate-500">SB: SB-2015-0501</span>
            </div>
          </div>
          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black border border-emerald-200 shrink-0">
            AKTIF
          </span>
        </div>

        {/* Mohamad Riman Bin Erwan (Tahun 4) */}
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-white border-2 border-emerald-300 rounded-2xl shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
            4
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-black text-[10px] uppercase">
                Murid Berdaftar 2026
              </span>
              <span className="text-[11px] font-bold text-slate-500">Tahun 4</span>
            </div>
            <h4 className="font-black text-slate-900 text-sm mt-0.5 truncate">
              MOHAMAD RIMAN BIN ERWAN
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-semibold">
              <span className="px-2 py-0.5 bg-white rounded border border-slate-200 font-bold text-emerald-800">
                Kelas: 4 HIJAU
              </span>
              <span>•</span>
              <span className="font-mono text-slate-500">SB: SB-2016-0402</span>
            </div>
          </div>
          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black border border-emerald-200 shrink-0">
            AKTIF
          </span>
        </div>
      </div>

      {/* Students Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        {/* Table Filter and Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Level / Darjah Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-600">Tahun:</span>
              <select
                value={studentDarjahFilter}
                onChange={(e) => setStudentDarjahFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Semua Tahun (1 - 6)</option>
                <option value="1">Tahun 1</option>
                <option value="2">Tahun 2</option>
                <option value="3">Tahun 3</option>
                <option value="4">Tahun 4 (Mohamad Riman)</option>
                <option value="5">Tahun 5 (Mohamad Aiman)</option>
                <option value="6">Tahun 6</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama murid, no SB, kelas..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              >
              </input>
            </div>
            <span className="text-xs text-slate-500 font-bold shrink-0">
              {processedStudents.length} daripada {students.length} murid
            </span>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                <th className="p-3.5 pl-4 w-12 text-center">Bil</th>
                <th className="p-3.5">Nama Penuh Murid</th>
                <th className="p-3.5">Tahun & Kelas</th>
                <th className="p-3.5">No Surat Beranak / KP</th>
                <th className="p-3.5 text-center">Jantina</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right pr-5">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {processedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-30 text-purple-600" />
                    <p className="font-bold text-slate-600">Tiada murid dijumpai.</p>
                    <p className="text-xs text-slate-400 mt-1">Sila sesuaikan carian atau daftar murid baru.</p>
                    <button
                      onClick={() => setIsAddStudentModalOpen(true)}
                      className="mt-4 px-4 py-2 bg-purple-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Murid
                    </button>
                  </td>
                </tr>
              ) : (
                processedStudents.map((st, idx) => {
                  const isTargetStudent = 
                    st.nama.toUpperCase().includes('AIMAN') || 
                    st.nama.toUpperCase().includes('RIMAN');

                  return (
                    <tr 
                      key={st.id} 
                      className={`transition ${isTargetStudent ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50'}`}
                    >
                      {/* Bil */}
                      <td className="p-3.5 pl-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Nama Murid */}
                      <td className="p-3.5 font-black text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${
                            isTargetStudent 
                              ? 'bg-amber-500 text-white' 
                              : st.jantina === 'PEREMPUAN'
                              ? 'bg-pink-100 text-pink-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {st.nama.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span>{st.nama}</span>
                              {isTargetStudent && (
                                <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 font-black rounded text-[9px] uppercase border border-amber-300">
                                  Baharu
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {st.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tahun & Kelas */}
                      <td className="p-3.5 font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
                            Tahun {st.darjah}
                          </span>
                          <span className="font-bold text-slate-700">
                            {st.kelas}
                          </span>
                        </div>
                      </td>

                      {/* No SB */}
                      <td className="p-3.5 font-mono text-xs text-slate-600 font-bold">
                        {st.no_sb || '-'}
                      </td>

                      {/* Jantina */}
                      <td className="p-3.5 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          st.jantina === 'PEREMPUAN'
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {st.jantina || 'LELAKI'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                          {st.status?.toUpperCase() || 'AKTIF'}
                        </span>
                      </td>

                      {/* Tindakan */}
                      <td className="p-3.5 text-right pr-5">
                        <button
                          onClick={() => handleDeleteStudent(st.id, st.nama)}
                          className="p-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-bold text-[11px] transition inline-flex items-center border border-red-200 shadow-sm"
                          title="Padam Rekod Murid"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Student Table Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-3">
            <span className="font-bold text-purple-700 inline-flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Jumlah: {students.length} Orang Murid SK Kepawa 2026
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-800 font-bold">
              Mohamad Aiman (Tahun 5) & Mohamad Riman (Tahun 4) Disahkan Berdaftar
            </span>
          </div>
          <button
            onClick={handleDownloadStudentsCsv}
            className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Muat Turun Senarai Murid (CSV)
          </button>
        </div>
      </div>
    </div>
  )}

      {/* =========================================================================
          ADD CLASS MODAL
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-kepawa-100 text-kepawa-700 flex items-center justify-center text-lg font-bold">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tambah Kelas Baru</h3>
                  <p className="text-xs text-slate-500">Daftar maklumat kelas bagi sesi persekolahan 2026</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1 JINGGA atau 4 GEMILANG"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-kepawa-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tahun / Darjah</label>
                  <select
                    value={formDarjah}
                    onChange={(e) => setFormDarjah(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-kepawa-500"
                  >
                    <option value={1}>Tahun 1</option>
                    <option value={2}>Tahun 2</option>
                    <option value={3}>Tahun 3</option>
                    <option value={4}>Tahun 4</option>
                    <option value={5}>Tahun 5</option>
                    <option value={6}>Tahun 6</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Bilangan Murid</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={formBilMurid}
                    onChange={(e) => setFormBilMurid(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-kepawa-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Guru Kelas</label>
                  <select
                    value={formGuruKelas}
                    onChange={(e) => setFormGuruKelas(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-kepawa-500"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.nama}>{t.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Pembantu Guru Kelas</label>
                  <select
                    value={formPembantuGuru}
                    onChange={(e) => setFormPembantuGuru(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-kepawa-500"
                  >
                    <option value="">-- Tiada Pembantu --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.nama}>{t.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* QR Preview badge */}
              {formNama.trim() && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Kod QR Dijana:</span>
                    <span className="font-mono font-black text-slate-800 text-xs">
                      SKK-2026-{formNama.trim().toUpperCase().replace(/\s+/g, '')}
                    </span>
                  </div>
                  <QrCode className="w-5 h-5 text-kepawa-600" />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-kepawa-600 hover:bg-kepawa-700 text-white font-bold rounded-xl shadow-md shadow-kepawa-600/20"
                >
                  Simpan & Tambah Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT CLASS MODAL
          ========================================================================= */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Kemaskini Maklumat Kelas</h3>
                  <p className="text-xs text-slate-500">Edit rekod kelas {editingClass.nama}</p>
                </div>
              </div>
              <button onClick={() => setEditingClass(null)} className="text-slate-400 hover:text-slate-600 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Kelas</label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-kepawa-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tahun / Darjah</label>
                  <select
                    value={formDarjah}
                    onChange={(e) => setFormDarjah(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-kepawa-500"
                  >
                    <option value={1}>Tahun 1</option>
                    <option value={2}>Tahun 2</option>
                    <option value={3}>Tahun 3</option>
                    <option value={4}>Tahun 4</option>
                    <option value={5}>Tahun 5</option>
                    <option value={6}>Tahun 6</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Bilangan Murid</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={formBilMurid}
                    onChange={(e) => setFormBilMurid(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-kepawa-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Guru Kelas</label>
                  <select
                    value={formGuruKelas}
                    onChange={(e) => setFormGuruKelas(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-kepawa-500"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.nama}>{t.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Pembantu Guru Kelas</label>
                  <select
                    value={formPembantuGuru}
                    onChange={(e) => setFormPembantuGuru(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-kepawa-500"
                  >
                    <option value="">-- Tiada Pembantu --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.nama}>{t.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between text-blue-900">
                <div>
                  <span className="text-[10px] text-blue-700 font-bold uppercase block">Kod QR Baharu:</span>
                  <span className="font-mono font-black text-xs">
                    SKK-2026-{formNama.trim().toUpperCase().replace(/\s+/g, '')}
                  </span>
                </div>
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20"
                >
                  Kemaskini Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
          ========================================================================= */}
      {deletingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Adakah anda pasti?</h3>
            <p className="text-xs text-slate-600 mt-1">
              Anda akan memadam kelas <strong className="text-red-600">{deletingClass.nama}</strong> ({deletingClass.guru_kelas}). Tindakan ini tidak boleh dibatalkan.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingClass(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-600/20"
              >
                Ya, Padam Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          BATCH DELETE MODAL
          ========================================================================= */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Padam {selectedClassIds.length} Kelas?</h3>
            <p className="text-xs text-slate-600 mt-1">
              Semua {selectedClassIds.length} rekod kelas yang dipilih akan dipadam dari pangkalan data sistem.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-600/20"
              >
                Padam {selectedClassIds.length} Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CSV / DATA IMPORT MODAL (UPLOAD & PASTE)
          ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Muat Naik & Import Data Kelas</h3>
                  <p className="text-xs text-slate-500">Import senarai kelas melalui fail CSV atau salin tampal terus dari Excel</p>
                </div>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 flex-1 text-xs">
              {/* Import Mode Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setUploadTab('file')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    uploadTab === 'file' ? 'bg-purple-100 text-purple-800' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" /> Pilih Fail CSV
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTab('paste')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    uploadTab === 'paste' ? 'bg-purple-100 text-purple-800' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Copy className="w-4 h-4" /> Salin / Tampal Teks Excel
                </button>
              </div>

              {/* Format Guide Box */}
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1">
                    <FileSpreadsheet className="w-4 h-4 text-purple-700" /> Susunan Lajur:
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Muat Turun Templat Contoh
                  </button>
                </div>
                <code className="block bg-white p-2 rounded-xl border border-purple-200 font-mono text-[11px] text-purple-800">
                  Nama Kelas, Darjah, Guru Kelas, Pembantu Guru Kelas, Bilangan Murid
                </code>
              </div>

              {/* Tab 1: File Input */}
              {uploadTab === 'file' && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1.5">Pilih Fail CSV (.csv / .txt)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer border border-slate-200 p-2 rounded-xl"
                  />
                </div>
              )}

              {/* Tab 2: Text Paste Area */}
              {uploadTab === 'paste' && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1.5">
                    Tampal Baris Teks (Dari Excel / Google Sheets)
                  </label>
                  <textarea
                    rows={5}
                    value={pasteText}
                    onChange={(e) => handlePasteChange(e.target.value)}
                    placeholder="Contoh:&#10;1 JINGGA, 1, Nurfatin Nabilah binti Zainul Abidin, Zulaiha binti Ali, 25&#10;2 KUNING, 2, Sh. Hasnah binti Ag. Tengah, Bong Siew Fah, 26"
                    className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Import Action Strategy */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-2.5 transition ${
                  importMode === 'append' ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="font-bold text-xs">Tambah ke Sedia Ada</div>
                    <div className="text-[10px] text-slate-500">Kekalkan kelas semasa & tambah data baharu</div>
                  </div>
                </label>

                <label className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-2.5 transition ${
                  importMode === 'overwrite' ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'overwrite'}
                    onChange={() => setImportMode('overwrite')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="font-bold text-xs">Ganti Semua Data</div>
                    <div className="text-[10px] text-slate-500">Padam kelas semasa & ganti dengan data baharu</div>
                  </div>
                </label>
              </div>

              {/* Parsed Preview Table */}
              {parsedPreview.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">
                      Pratonton Data Dikenal Pasti ({parsedPreview.length} Kelas):
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      Format Sah
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 sticky top-0 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2">Nama Kelas</th>
                          <th className="p-2">Darjah</th>
                          <th className="p-2">Guru Kelas</th>
                          <th className="p-2">Pembantu</th>
                          <th className="p-2 text-center">Murid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedPreview.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-black text-slate-900">{item.nama}</td>
                            <td className="p-2 font-bold text-slate-700">Tahun {item.darjah}</td>
                            <td className="p-2 font-bold text-slate-800 truncate max-w-[120px]">{item.guru_kelas}</td>
                            <td className="p-2 text-slate-600 truncate max-w-[100px]">{item.pembantu_guru_kelas || '-'}</td>
                            <td className="p-2 text-center font-bold text-slate-800">{item.bil_murid}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={parsedPreview.length === 0}
                className={`px-5 py-2.5 font-bold rounded-xl transition flex items-center gap-2 ${
                  parsedPreview.length > 0 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Import {parsedPreview.length} Kelas Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          BATCH QR PRINTING MODAL (SEMUA KOD QR KELAS DALAM SATU LEMBARAN)
          ========================================================================= */}
      {isBatchQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-6 border border-slate-100 max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-lg font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Lembaran Kad Kod QR Semua Kelas</h3>
                  <p className="text-xs text-slate-500">Sedia untuk dicetak dan ditampal di hadapan pintu bilik darjah sesi 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Lembaran</span>
                </button>
                <button 
                  onClick={() => setIsBatchQrModalOpen(false)} 
                  className="text-slate-400 hover:text-slate-600 p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Cards Grid */}
            <div className="overflow-y-auto py-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {classes.map((cls) => {
                  const qrPayload = cls.qr_code || `SKK-2026-${cls.nama.replace(/\s+/g, '')}`;
                  return (
                    <div 
                      key={cls.id}
                      className="border-2 border-slate-900 rounded-3xl p-5 bg-white text-center flex flex-col items-center justify-between shadow-sm relative overflow-hidden"
                    >
                      <div className="w-full bg-slate-900 text-white py-1.5 px-3 rounded-xl mb-3">
                        <p className="text-[10px] font-black tracking-wider uppercase">SK KEPAWA, BEAUFORT</p>
                        <p className="text-[9px] text-amber-300 font-bold">SESI PERSEKOLAHAN 2026</p>
                      </div>

                      <div className="my-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">KOD IMBASAN KEHADIRAN</span>
                        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{cls.nama}</h4>
                        <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full font-black text-[10px] mt-0.5">
                          Tahun {cls.darjah}
                        </span>
                      </div>

                      <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl my-3 shadow-inner">
                        <QrCodeRenderer value={qrPayload} size={150} />
                      </div>

                      <div className="w-full pt-2 border-t border-slate-200 text-xs">
                        <p className="font-mono text-[10px] text-slate-600 font-bold">{qrPayload}</p>
                        <p className="font-bold text-slate-800 text-[11px] mt-1 truncate">Guru: {cls.guru_kelas}</p>
                        {cls.pembantu_guru_kelas && (
                          <p className="text-[10px] text-slate-500 truncate">Pembantu: {cls.pembantu_guru_kelas}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{classes.length} Kad Kod QR Kelas bersedia untuk cetakan</span>
              <button
                onClick={() => setIsBatchQrModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CLASS TIMETABLE MODAL (JADUAL WAKTU KELAS MENGIKUT JADUAL INDUK 2026)
          ========================================================================= */}
      {selectedClassForSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-6 border border-slate-100 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-kepawa-700 text-white flex items-center justify-center text-xl font-black shadow-md">
                  {selectedClassForSchedule.darjah}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                      JADUAL INDUK RASMI 2026
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Tahun {selectedClassForSchedule.darjah}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    Jadual Waktu Kelas {selectedClassForSchedule.nama}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Guru Kelas: <strong className="text-slate-900">{selectedClassForSchedule.guru_kelas}</strong>
                    {selectedClassForSchedule.pembantu_guru_kelas && (
                      <> | Pembantu: <strong className="text-slate-900">{selectedClassForSchedule.pembantu_guru_kelas}</strong></>
                    )}
                    {" "}| Murid: <strong className="text-slate-900">{selectedClassForSchedule.bil_murid} orang</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-300"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={() => setSelectedClassForSchedule(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Timetable Content */}
            <div className="overflow-y-auto py-4 space-y-4 flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                      <th className="p-3 rounded-l-xl w-24">HARI</th>
                      <th className="p-3">SESI & MASA</th>
                      <th className="p-3">MATA PELAJARAN</th>
                      <th className="p-3">KOD</th>
                      <th className="p-3">GURU PENGAJAR</th>
                      <th className="p-3 rounded-r-xl">LOKASI / BILIK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs font-medium">
                    {INITIAL_DAYS.map((day) => {
                      const dayItems = OFFICIAL_MASTER_SCHEDULE.filter(
                        item => item.hari === day && item.kelas === selectedClassForSchedule.nama
                      );

                      if (dayItems.length === 0) return null;

                      const dayBadgeColor = 
                        day === 'Isnin' ? 'bg-blue-100 text-blue-900 border-blue-200' :
                        day === 'Selasa' ? 'bg-purple-100 text-purple-900 border-purple-200' :
                        day === 'Rabu' ? 'bg-emerald-100 text-emerald-900 border-emerald-200' :
                        day === 'Khamis' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                        'bg-rose-100 text-rose-900 border-rose-200';

                      return dayItems.map((item, itemIdx) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          {itemIdx === 0 && (
                            <td 
                              rowSpan={dayItems.length}
                              className="p-3 font-black align-top border-r border-slate-200 bg-slate-50/50"
                            >
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-black border block text-center ${dayBadgeColor}`}>
                                {day}
                              </span>
                              <div className="text-[10px] text-slate-400 font-bold text-center mt-1">
                                {dayItems.length} Sesi
                              </div>
                            </td>
                          )}
                          <td className="p-3 font-mono font-bold text-slate-800">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.masa}</span>
                            </div>
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            {item.subjek}
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-700">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                              {item.subjekKod}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-800">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-kepawa-100 text-kepawa-800 flex items-center justify-center text-[10px] font-black shrink-0">
                                {item.guru.charAt(0)}
                              </div>
                              <span className="truncate max-w-xs">{item.guru}</span>
                            </div>
                          </td>
                          <td className="p-3 text-slate-600 font-semibold">
                            {item.subjekKod === 'SN' ? 'Makmal Sains' :
                             item.subjekKod === 'PI' || item.subjekKod === 'TAS' ? 'Surau' :
                             item.subjekKod === 'RBT' ? 'Bengkel RBT' :
                             item.subjekKod === 'MK' ? 'Bilik Muzik' :
                             item.subjekKod === 'PJ' || item.subjekKod === 'PJ/PK' ? 'Padang Sekolah' :
                             selectedClassForSchedule.nama}
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-bold text-kepawa-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Data diselaraskan secara automatik mengikut Jadual Induk Rasmi SK Kepawa 2026.
              </span>
              <button
                onClick={() => setSelectedClassForSchedule(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD STUDENT MODAL
          ========================================================================= */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Daftar Murid Baharu</h3>
                  <p className="text-xs text-slate-500">Pendaftaran enrolmen murid ke dalam kelas SK Kepawa 2026</p>
                </div>
              </div>
              <button onClick={() => setIsAddStudentModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Penuh Murid</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: MOHAMAD AIMAN BIN ERWAN"
                  value={newStudentNama}
                  onChange={(e) => setNewStudentNama(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tahun / Darjah</label>
                  <select
                    value={newStudentDarjah}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setNewStudentDarjah(d);
                      const matchingClass = classes.find(c => c.darjah === d);
                      if (matchingClass) setNewStudentKelas(matchingClass.nama);
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(d => (
                      <option key={d} value={d}>Tahun {d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kelas</label>
                  <select
                    value={newStudentKelas}
                    onChange={(e) => setNewStudentKelas(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.nama}>
                        {c.nama} (Tahun {c.darjah})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">No SB / MyKid</label>
                  <input
                    type="text"
                    placeholder="Contoh: SB-2015-0501"
                    value={newStudentNoSb}
                    onChange={(e) => setNewStudentNoSb(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Jantina</label>
                  <select
                    value={newStudentJantina}
                    onChange={(e) => setNewStudentJantina(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="LELAKI">Lelaki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition shadow-md shadow-purple-700/20"
                >
                  Simpan Murid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
