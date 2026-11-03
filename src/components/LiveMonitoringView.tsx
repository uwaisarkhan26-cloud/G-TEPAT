import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radio, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  School, 
  Users, 
  BookOpen, 
  ListFilter, 
  Search, 
  Printer, 
  QrCode, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  Volume2,
  VolumeX,
  Eye,
  GraduationCap,
  Check,
  Zap,
  Camera,
  X
} from 'lucide-react';
import { AttendanceRecord, ClassItem, SubjectItem, User, SessionData, Student } from '../types';
import { OFFICIAL_MASTER_SCHEDULE, MasterScheduleItem, INITIAL_SLOTS } from '../data/initialData';
import { StorageService } from '../services/storageService';

interface LiveMonitoringViewProps {
  session: SessionData;
  records: AttendanceRecord[];
  classes: ClassItem[];
  subjects: SubjectItem[];
  users: User[];
  onNavigate: (tab: string) => void;
  onOpenFormalPrintModal: () => void;
  onOpenQrModal?: (className: string, qrPayload: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onQuickCheckIn?: (className: string) => void;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  session,
  records,
  classes,
  subjects,
  users,
  onNavigate,
  onOpenFormalPrintModal,
  onOpenQrModal,
  onRefresh,
  isRefreshing = false,
  onQuickCheckIn
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(15);
  const [viewMode, setViewMode] = useState<'matrix' | 'feed' | 'schedule' | 'murid'>('matrix');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassItem | null>(null);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<ClassItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());

  // Digital clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh timer countdown (15 seconds)
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (onRefresh && !isRefreshing) {
            onRefresh();
          }
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, onRefresh, isRefreshing]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  // Audio alert chime
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.09); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.18); // G5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  // Sync students on data update
  useEffect(() => {
    setStudents(StorageService.getStudents());
  }, [records]);

  // Determine current day & current slot based on time
  const dayNames: Array<'Ahad' | 'Isnin' | 'Selasa' | 'Rabu' | 'Khamis' | 'Jumaat' | 'Sabtu'> = [
    'Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'
  ];
  const currentDayIndex = currentTime.getDay();
  const currentDayName = dayNames[currentDayIndex];
  const validScheduleDay = (currentDayName === 'Isnin' || currentDayName === 'Selasa' || currentDayName === 'Rabu' || currentDayName === 'Khamis' || currentDayName === 'Jumaat')
    ? currentDayName
    : 'Isnin'; // fallback for weekend preview to show full schedule

  const timeString = currentTime.toLocaleTimeString('en-GB', { hour12: false });
  const dateFormatted = currentTime.toLocaleDateString('ms-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const todayDateStr = currentTime.toISOString().split('T')[0];

  // Filter records for today (or fallback to latest if demo data spans past days)
  const todayRecords = useMemo(() => {
    const directToday = records.filter(r => r.tarikh === todayDateStr);
    if (directToday.length > 0) return directToday;
    // If today is a weekend or no scans today yet in demo, pick records from the latest recorded date
    if (records.length > 0) {
      const dates = Array.from(new Set(records.map(r => r.tarikh))).sort().reverse();
      const latestDate = dates[0];
      return records.filter(r => r.tarikh === latestDate);
    }
    return [];
  }, [records, todayDateStr]);

  // Key metrics
  const totalTodayScans = todayRecords.length;
  const tepatCount = todayRecords.filter(r => r.status === 'TEPAT MASA').length;
  const lateCount = todayRecords.filter(r => r.status === 'LEWAT').length;
  const tepatRate = totalTodayScans > 0 ? Math.round((tepatCount / totalTodayScans) * 100) : 100;

  // Active classes with scans today
  const activeClassNames = useMemo(() => {
    return Array.from(new Set(todayRecords.map(r => r.kelas)));
  }, [todayRecords]);

  // Master schedule for today
  const daySchedule = useMemo(() => {
    return OFFICIAL_MASTER_SCHEDULE.filter(s => s.hari === validScheduleDay);
  }, [validScheduleDay]);

  // Current slot estimate based on current time (SK KEPAWA sessions: 07:00 - 12:50)
  const currentSlotEstimate = useMemo(() => {
    const [h, m] = timeString.split(':').map(Number);
    const minutes = h * 60 + m;

    if (minutes < 7 * 60) return { name: 'Pra-PdP (Sebelum 7:00 AM)', isRecess: false, slot: null };
    if (minutes >= 7 * 60 && minutes < 7 * 60 + 30) return { name: 'Slot 1 (07:00 - 07:30 AM)', isRecess: false, slot: 'S1' };
    if (minutes >= 7 * 60 + 30 && minutes < 8 * 60) return { name: 'Slot 2 (07:30 - 08:00 AM)', isRecess: false, slot: 'S2' };
    if (minutes >= 8 * 60 && minutes < 8 * 60 + 30) return { name: 'Slot 3 (08:00 - 08:30 AM)', isRecess: false, slot: 'S3' };
    if (minutes >= 8 * 60 + 30 && minutes < 9 * 60) return { name: 'Slot 4 (08:30 - 09:00 AM)', isRecess: false, slot: 'S4' };
    if (minutes >= 9 * 60 && minutes < 9 * 60 + 30) return { name: 'Slot 5 (09:00 - 09:30 AM)', isRecess: false, slot: 'S5' };
    if (minutes >= 9 * 60 + 30 && minutes < 9 * 60 + 50) return { name: 'WAKTU REHAT (09:30 - 09:50 AM)', isRecess: true, slot: 'RECESS' };
    if (minutes >= 9 * 60 + 50 && minutes < 10 * 60 + 20) return { name: 'Slot 6 (09:50 - 10:20 AM)', isRecess: false, slot: 'S6' };
    if (minutes >= 10 * 60 + 20 && minutes < 10 * 60 + 50) return { name: 'Slot 7 (10:20 - 10:50 AM)', isRecess: false, slot: 'S7' };
    if (minutes >= 10 * 60 + 50 && minutes < 11 * 60 + 20) return { name: 'Slot 8 (10:50 - 11:20 AM)', isRecess: false, slot: 'S8' };
    if (minutes >= 11 * 60 + 20 && minutes < 11 * 60 + 50) return { name: 'Slot 9 (11:20 - 11:50 AM)', isRecess: false, slot: 'S9' };
    if (minutes >= 11 * 60 + 50 && minutes < 12 * 60 + 20) return { name: 'Slot 10 (11:50 - 12:20 PM)', isRecess: false, slot: 'S10' };
    if (minutes >= 12 * 60 + 20 && minutes < 12 * 60 + 50) return { name: 'Slot 11 (12:20 - 12:50 PM)', isRecess: false, slot: 'S11' };
    return { name: 'Tamat Sesi Persekolahan (Selepas 12:50 PM)', isRecess: false, slot: null };
  }, [timeString]);

  // Per-Class Real-Time Status Computation
  const classStatusList = useMemo(() => {
    return classes.map(cls => {
      // Find latest attendance record for this class today
      const classRecords = todayRecords.filter(r => r.kelas.trim().toLowerCase() === cls.nama.trim().toLowerCase());
      const latestRecord = classRecords.length > 0 ? classRecords[classRecords.length - 1] : null;

      // Scheduled item right now for this class
      const scheduledNow = daySchedule.find(s => s.kelas.toLowerCase() === cls.nama.toLowerCase());

      const isCurrentActive = !!latestRecord;
      const isLate = latestRecord ? latestRecord.status === 'LEWAT' : false;

      return {
        classInfo: cls,
        recordsToday: classRecords,
        latestRecord,
        scheduledNow,
        status: isCurrentActive 
          ? (isLate ? 'LEWAT' : 'AKTIF')
          : 'MENUNGGU',
        lastScanTime: latestRecord ? latestRecord.masa : null,
        activeTeacher: latestRecord ? latestRecord.guru : (scheduledNow ? scheduledNow.guru : cls.guru_kelas),
        activeSubject: latestRecord ? latestRecord.subjek : (scheduledNow ? scheduledNow.subjek : 'PdP Berjadual'),
      };
    });
  }, [classes, todayRecords, daySchedule]);

  // Filtered live feed records
  const filteredFeed = useMemo(() => {
    return todayRecords
      .filter(r => {
        if (filterClass !== 'all' && r.kelas !== filterClass) return false;
        if (filterStatus !== 'all' && r.status !== filterStatus) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            r.guru.toLowerCase().includes(q) ||
            r.kelas.toLowerCase().includes(q) ||
            r.subjek.toLowerCase().includes(q) ||
            (r.catatan && r.catatan.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .slice()
      .reverse();
  }, [todayRecords, filterClass, filterStatus, searchQuery]);

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 text-slate-100 p-6 overflow-y-auto' : ''}`}>
      {/* Top Real-time Control Command Bar */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-kepawa-950 text-white shadow-2xl border border-slate-800/80 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-kepawa-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Title & Live Status Beacon */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-inner">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                LIVE RADAR MONITORING AKTIF
              </span>
              <span className="text-xs text-gold-400 font-extrabold uppercase tracking-wider bg-gold-400/10 px-2.5 py-0.5 rounded-full border border-gold-400/20">
                PENTADBIR & GURU BESAR SK KEPAWA
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight flex items-center gap-3 text-white">
              <span>Panel Pemantauan PdP Masa Nyata</span>
              <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Memantau status kehadiran semua guru ke 6 bilik darjah secara automatik berasaskan imbasan QR kod sesi 2026.
            </p>
          </div>

          {/* Live Clock & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Real-time Clock Card */}
            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg text-right">
              <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-end gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold-400" />
                <span>{dateFormatted}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 tracking-wider">
                {timeString}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {currentSlotEstimate.name}
              </div>
            </div>

            {/* Quick Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Audio Sound Alert Toggle */}
              <button
                id="btn-live-sound-toggle"
                onClick={() => {
                  const nextState = !soundEnabled;
                  setSoundEnabled(nextState);
                  if (nextState) playAlertChime();
                }}
                className={`px-3 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                  soundEnabled
                    ? 'bg-amber-950/80 text-amber-300 border-amber-600/50 hover:bg-amber-900/80'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title={soundEnabled ? 'Bunyi Notifikasi: AKTIF (Klik untuk Nyahaktif)' : 'Bunyi Notifikasi: NYAHAKTIF (Klik untuk Aktifkan)'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                <span>{soundEnabled ? 'Bunyi Aktif' : 'Bunyi Senyap'}</span>
              </button>

              <button
                id="btn-live-toggle-autorefresh"
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 border shadow-sm ${
                  autoRefreshEnabled
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50 hover:bg-emerald-900/80'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title={autoRefreshEnabled ? 'Nyahaktif Auto-Segar' : 'Aktifkan Auto-Segar'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${autoRefreshEnabled ? 'animate-spin text-emerald-400' : ''}`} />
                <span>{autoRefreshEnabled ? `Auto (${countdown}s)` : 'Auto: Mati'}</span>
              </button>

              {onRefresh && (
                <button
                  id="btn-live-manual-refresh"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black transition flex items-center gap-1.5 border border-white/10 active:scale-95"
                  title="Segar Semula Sekarang"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>Segar Semula</span>
                </button>
              )}

              <button
                id="btn-live-fullscreen"
                onClick={toggleFullscreen}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black transition flex items-center gap-1.5 border border-slate-700 shadow"
                title="Papar Skrin Penuh (Untuk TV Pejabat / Bilik Gerakan)"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4 text-gold-400" /> : <Maximize2 className="w-4 h-4 text-gold-400" />}
                <span className="hidden sm:inline">{isFullscreen ? 'Keluar Skrin Penuh' : 'Skrin Penuh (TV)'}</span>
              </button>

              <button
                onClick={onOpenFormalPrintModal}
                className="px-4 py-2.5 rounded-2xl bg-gold-500 hover:bg-gold-400 text-slate-950 text-xs font-black shadow-lg transition flex items-center gap-1.5 active:scale-95"
                title="Cetak Laporan Pemantauan Harian"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Laporan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Kelas Aktif */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Status Bilik Darjah</span>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
              <span>{activeClassNames.length} / {classes.length}</span>
              <span className="text-xs font-bold text-emerald-600">Kelas Aktif</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {activeClassNames.length === classes.length ? 'Semua kelas mempunyai log hari ini' : `${classes.length - activeClassNames.length} kelas menanti imbasan`}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold shadow-sm">
            <School className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Jumlah Imbasan PdP */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Jumlah Imbasan PdP Hari Ini</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalTodayScans} Rekod</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tepatCount} Tepat Masa</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold shadow-sm">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Ketepatan Masa */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Kadar Ketepatan Masa</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{tepatRate}%</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Toleransi rasmi KPM: 5 minit</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Kelewatan / Peringatan */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Kes Lewat / Semakan</span>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
              <span className={lateCount > 0 ? 'text-amber-600' : 'text-slate-900'}>{lateCount} Kes</span>
              {lateCount === 0 && <span className="text-xs text-emerald-600 font-bold">Cemerlang</span>}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {lateCount > 0 ? 'Memerlukan catatan pentadbir' : 'Tiada kelewatan dilaporkan'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm ${
            lateCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main View Mode Selector Tabs */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            id="tab-view-matrix"
            onClick={() => setViewMode('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Matriks Bilik Darjah (6 Kelas)</span>
          </button>

          <button
            id="tab-view-feed"
            onClick={() => setViewMode('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'feed'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Suapan Radar Imbasan Terkini</span>
          </button>

          <button
            id="tab-view-schedule"
            onClick={() => setViewMode('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'schedule'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Padanan Jadual ({validScheduleDay})</span>
          </button>

          <button
            id="tab-view-murid"
            onClick={() => setViewMode('murid')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'murid'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>Senarai Murid (Tahun 1 - 6)</span>
          </button>
        </div>

        {/* Quick Search & Filter if in feed view */}
        {viewMode === 'feed' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari guru, kelas, subjek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-kepawa-500 focus:outline-none w-44 sm:w-60"
              />
            </div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="all">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.nama}>{c.nama}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="TEPAT MASA">Tepat Masa</option>
              <option value="LEWAT">Lewat</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: MATRIKS BILIK DARJAH (CLASS STATUS GRID) */}
      {viewMode === 'matrix' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <School className="w-4 h-4 text-kepawa-700" />
              <span>Status Masa Nyata Mengikut Kelas SK Kepawa</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Kadar Liputan: <strong className="text-emerald-700">{Math.round((activeClassNames.length / classes.length) * 100)}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classStatusList.map((item) => {
              const { classInfo, latestRecord, scheduledNow, status } = item;
              const isClassActive = status === 'AKTIF';
              const isClassLate = status === 'LEWAT';

              return (
                <div 
                  key={classInfo.id}
                  className={`p-5 rounded-3xl border transition-all duration-200 bg-white shadow-sm hover:shadow-md flex flex-col justify-between relative overflow-hidden ${
                    isClassActive
                      ? 'border-emerald-300 ring-2 ring-emerald-400/20'
                      : isClassLate
                        ? 'border-amber-300 ring-2 ring-amber-400/20'
                        : 'border-slate-200 opacity-95'
                  }`}
                >
                  {/* Top Bar inside card */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-slate-900">{classInfo.nama}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
                            {classInfo.bil_murid} Murid
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Guru Kelas: <strong className="text-slate-700">{classInfo.guru_kelas}</strong>
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs ${
                        isClassActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isClassLate
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}>
                        {isClassActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>}
                        {isClassActive ? 'PdP AKTIF' : isClassLate ? 'LEWAT' : 'MENUNGGU IMBASAN'}
                      </span>
                    </div>

                    {/* Active PdP Details Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold">Guru Bertugas:</span>
                        <span className="font-black text-slate-900 text-right truncate max-w-[180px]">
                          {item.activeTeacher}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold">Mata Pelajaran:</span>
                        <span className="font-bold text-kepawa-700 text-right truncate max-w-[180px]">
                          {item.activeSubject}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> Masa Imbasan:
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {item.lastScanTime ? item.lastScanTime : 'Belum Diimbas Hari Ini'}
                        </span>
                      </div>

                      {/* Prominent Student Indicators for Tahun 4 and 5 */}
                      {classInfo.darjah === 5 && (
                        <div className="p-2 bg-amber-100/70 rounded-xl border border-amber-300 text-[10px] font-bold text-amber-900 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            ⭐ <strong>Mohamad Aiman bin Erwan</strong>
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 font-black">TAHUN 5</span>
                        </div>
                      )}
                      {classInfo.darjah === 4 && (
                        <div className="p-2 bg-emerald-100/70 rounded-xl border border-emerald-300 text-[10px] font-bold text-emerald-900 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            ⭐ <strong>Mohamad Riman bin Erwan</strong>
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-950 font-black">TAHUN 4</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                    {/* Imbas Masuk Kelas Button */}
                    <button
                      onClick={() => {
                        if (onQuickCheckIn) {
                          onQuickCheckIn(classInfo.nama);
                        } else {
                          onNavigate('scan-qr');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-slate-950 text-xs font-black transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                      title={`Rekod Masuk Kelas ${classInfo.nama} Sekarang`}
                    >
                      <Camera className="w-3.5 h-3.5 text-slate-950" />
                      <span>Masuk Kelas</span>
                    </button>

                    {/* Senarai Murid Kelas Button */}
                    <button
                      onClick={() => setSelectedClassForStudents(classInfo)}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Lihat Senarai Murid Kelas"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-700" />
                      <span>Murid</span>
                    </button>

                    <button
                      onClick={() => onOpenQrModal && onOpenQrModal(classInfo.nama, classInfo.qr_code)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Papar Kod QR Kelas"
                    >
                      <QrCode className="w-3.5 h-3.5" /> QR
                    </button>

                    <button
                      onClick={() => {
                        setFilterClass(classInfo.nama);
                        setViewMode('feed');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Lihat Log Kehadiran Kelas"
                    >
                      <Eye className="w-3.5 h-3.5" /> Log ({item.recordsToday.length})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: SUAPAN RADAR IMBASAN TERKINI (LIVE ACTIVITY FEED) */}
      {viewMode === 'feed' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide">Suapan Langsung Radar Imbasan QR (Live Feed)</h3>
                <p className="text-[11px] text-slate-400">Setiap rekod imbasan disahkan melalui peranti guru & pangkalan data DELIMa</p>
              </div>
            </div>
            <span className="text-xs bg-slate-800 text-gold-400 px-3 py-1 rounded-full font-black">
              Jumlah: {filteredFeed.length} Imbasan
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredFeed.length === 0 ? (
              <div className="p-12 text-center">
                <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">Tiada log imbasan sepadan dijumpai</p>
                <p className="text-xs text-slate-400 mt-1">Sila laraskan carian atau tunggu imbasan baharu daripada guru kelas.</p>
              </div>
            ) : (
              filteredFeed.map((record) => (
                <div 
                  key={record.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-kepawa-600 to-kepawa-700 text-white font-black flex items-center justify-center text-sm shadow-md flex-shrink-0">
                      {record.guru.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{record.guru}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                          {record.kelas}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {record.subjek}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 font-medium">
                        <span>{record.catatan || 'Imbasan Kod QR Kelas'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Disahkan Sah
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        record.status === 'TEPAT MASA'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {record.status}
                      </span>
                      <div className="text-xs text-slate-500 font-mono font-bold mt-1 flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{record.masa}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: PADANAN JADUAL HARI INI (SCHEDULE VS ACTUAL) */}
      {viewMode === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Padanan Jadual Waktu Induk vs Kehadiran Sebenar ({validScheduleDay})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Membandingkan guru yang berjadual mengikut analisis jadual waktu induk SK Kepawa dengan log imbasan QR sebenar.
              </p>
            </div>
            <button
              onClick={() => onNavigate('jadual')}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Lihat Jadual Induk Penuh</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Waktu PdP</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Subjek</th>
                  <th className="p-3">Guru Berjadual</th>
                  <th className="p-3">Status Kehadiran Sebenar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {daySchedule.map((item) => {
                  // Find if there is an attendance record for this class and teacher today
                  const matchingRecord = todayRecords.find(
                    r => r.kelas.toLowerCase() === item.kelas.toLowerCase() &&
                         r.guru.toLowerCase() === item.guru.toLowerCase()
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {item.masa}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-800 border border-purple-200">
                          {item.kelas}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {item.subjek} <span className="text-[10px] text-slate-400 font-mono">({item.subjekKod})</span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {item.guru}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {matchingRecord ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            matchingRecord.status === 'TEPAT MASA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            <CheckCircle2 className="w-3 h-3" />
                            {matchingRecord.status} ({matchingRecord.masa})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            <Clock className="w-3 h-3" /> Menanti Sesi
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: SENARAI MURID (TAHUN 1 - 6) */}
      {viewMode === 'murid' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Senarai Murid SK KEPAWA Sesi 2026 (Tahun 1 - 6)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                  {students.length} Murid
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Pangkalan data rasmi murid termasuk <strong>Mohamad Aiman bin Erwan (Tahun 5)</strong> dan <strong>Mohamad Riman bin Erwan (Tahun 4)</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('kelas')}
                className="px-4 py-2 rounded-xl bg-kepawa-600 hover:bg-kepawa-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow"
              >
                <Users className="w-4 h-4" />
                <span>Urus Murid di Panel Kelas</span>
              </button>
            </div>
          </div>

          {/* Quick Highlight Cards for Mohamad Aiman and Mohamad Riman */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/70 border-2 border-amber-300 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow">
                  5
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    MURID TAHUN 5 (5 KUNING)
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5">
                    MOHAMAD AIMAN BIN ERWAN
                  </h4>
                  <p className="text-[11px] text-amber-950 font-medium">
                    Guru Kelas: Dayang Sabariah @ Milah binti Joas
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white text-xs font-black shadow-xs">
                AKTIF
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/70 border-2 border-emerald-300 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow">
                  4
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                    MURID TAHUN 4 (4 HIJAU)
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5">
                    MOHAMAD RIMAN BIN ERWAN
                  </h4>
                  <p className="text-[11px] text-emerald-950 font-medium">
                    Guru Kelas: Rohidah @ Noridah binti Maslin
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-xs">
                AKTIF
              </span>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Bil</th>
                  <th className="p-3">Nama Penuh Murid</th>
                  <th className="p-3">Tahun / Kelas</th>
                  <th className="p-3">No. Surat Beranak / MyKid</th>
                  <th className="p-3">Jantina</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.map((std, idx) => {
                  const isAiman = std.nama.includes('AIMAN') && std.nama.includes('ERWAN');
                  const isRiman = std.nama.includes('RIMAN') && std.nama.includes('ERWAN');

                  return (
                    <tr 
                      key={std.id}
                      className={`transition ${isAiman ? 'bg-amber-50/80 font-bold' : isRiman ? 'bg-emerald-50/80 font-bold' : 'hover:bg-slate-50'}`}
                    >
                      <td className="p-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-xs">{std.nama}</span>
                          {(isAiman || isRiman) && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-gold-400 text-slate-950 uppercase shadow-xs">
                              ⭐ BARU DITAMBAH
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                          {std.kelas}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{std.no_sb || 'Tiada Rekod'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          std.jantina === 'LELAKI' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {std.jantina || 'LELAKI'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          {std.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLASS STUDENTS MODAL */}
      {selectedClassForStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-kepawa-100 text-kepawa-700 flex items-center justify-center text-lg font-black">
                  {selectedClassForStudents.darjah}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Senarai Murid: {selectedClassForStudents.nama}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Guru Kelas: {selectedClassForStudents.guru_kelas} ({selectedClassForStudents.bil_murid} Murid)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedClassForStudents(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-grow my-4 space-y-2">
              {students
                .filter(s => s.kelas.toUpperCase() === selectedClassForStudents.nama.toUpperCase() || s.darjah === selectedClassForStudents.darjah)
                .map((student, sIdx) => {
                  const isAiman = student.nama.includes('AIMAN') && student.nama.includes('ERWAN');
                  const isRiman = student.nama.includes('RIMAN') && student.nama.includes('ERWAN');

                  return (
                    <div 
                      key={student.id}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between text-xs ${
                        isAiman 
                          ? 'bg-amber-50 border-amber-300' 
                          : isRiman 
                            ? 'bg-emerald-50 border-emerald-300' 
                            : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {sIdx + 1}
                        </span>
                        <div>
                          <div className="font-black text-slate-900 flex items-center gap-2">
                            <span>{student.nama}</span>
                            {(isAiman || isRiman) && (
                              <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-gold-400 text-slate-950 uppercase">
                                ⭐ MURID TERSENARAI
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            SB/MyKid: {student.no_sb || 'Didaftar'} • {student.jantina}
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {student.status.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">
                Tahun Persekolahan 2026 • SK KEPAWA
              </span>
              <button
                onClick={() => setSelectedClassForStudents(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
