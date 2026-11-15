import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserX,
  Calendar,
  Printer,
  Download,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';
import { User, TimetableSlot, ClassItem } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface ReliefViewProps {
  timetable: TimetableSlot[];
  users: User[];
  classes: ClassItem[];
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

const isGuruBesar = (user: User): boolean => {
  const upperName = (user.nama || '').toUpperCase();
  return user.role === 'admin' || upperName.includes('MOHD ZAHARI') || upperName.includes('ZAHARI BIN TIBIN');
};

export const ReliefView: React.FC<ReliefViewProps> = ({
  timetable,
  users,
  onShowToast
}) => {
  const [selectedDay, setSelectedDay] = useState<'Isnin' | 'Selasa' | 'Rabu' | 'Khamis' | 'Jumaat'>('Isnin');
  const [absentTeachers, setAbsentTeachers] = useState<Record<string, boolean>>({});
  const [reliefAssignments, setReliefAssignments] = useState<Record<string, string>>({});
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const daySlots = useMemo(() => {
    return timetable.filter(t => t.hari === selectedDay);
  }, [timetable, selectedDay]);

  const rawSlotsNeedingRelief = useMemo(() => {
    return daySlots.filter(slot => {
      const isTeacherAbsent = Boolean(slot.guru && absentTeachers[slot.guru]);
      const isTeacherEmpty = !slot.guru || slot.guru.trim() === '' || slot.subjek.toLowerCase().includes('perhimpunan');
      return isTeacherAbsent || isTeacherEmpty;
    });
  }, [daySlots, absentTeachers]);

  // Deduplicate slots to prevent overlapping / double rows
  const slotsNeedingRelief = useMemo(() => {
    const map = new Map<string, TimetableSlot>();
    rawSlotsNeedingRelief.forEach(slot => {
      const key = `${slot.kelas}_${slot.masa || slot.slotId}`;
      if (!map.has(key)) {
        map.set(key, slot);
      }
    });
    return Array.from(map.values());
  }, [rawSlotsNeedingRelief]);

  const toggleTeacherAbsent = (teacherName: string) => {
    setAbsentTeachers(prev => ({
      ...prev,
      [teacherName]: !prev[teacherName]
    }));
  };

  function availableTeachersKey(usrList: User[], absentMap: Record<string, boolean>) {
    return usrList
      .filter(u => !isGuruBesar(u))
      .map(u => `${u.nama}:${Boolean(absentMap[u.nama])}`)
      .join(',');
  }

  const reliefTeachersFingerprint = availableTeachersKey(users, absentTeachers);

  // 100% AUTOMATIC BALANCED RELIEF ASSIGNMENT (STRICTLY EXCLUDING GURU BESAR: MOHD ZAHARI BIN TIBIN)
  useEffect(() => {
    if (slotsNeedingRelief.length === 0) {
      setReliefAssignments({});
      return;
    }

    const newAssignments: Record<string, string> = {};
    const availableTeachers = users
      .filter(u => !isGuruBesar(u) && !absentTeachers[u.nama])
      .map(u => u.nama);

    if (availableTeachers.length === 0) {
      setReliefAssignments({});
      return;
    }

    const reliefWorkloadCount: Record<string, number> = {};
    availableTeachers.forEach(t => {
      reliefWorkloadCount[t] = 0;
    });

    slotsNeedingRelief.forEach(slot => {
      const uniqueKey = `${slot.kelas}_${slot.masa || slot.slotId}`;

      const busyTeachersThisSlot = new Set(
        daySlots
          .filter(s => (s.masa === slot.masa || s.slotId === slot.slotId) && s.kelas !== slot.kelas)
          .map(s => s.guru)
      );

      Object.entries(newAssignments).forEach(([k, rName]) => {
        if (k.includes(slot.masa || slot.slotId)) {
          busyTeachersThisSlot.add(rName);
        }
      });

      const freeTeachers = availableTeachers.filter(tName => !busyTeachersThisSlot.has(tName));

      if (freeTeachers.length > 0) {
        freeTeachers.sort((a, b) => (reliefWorkloadCount[a] || 0) - (reliefWorkloadCount[b] || 0));
        const bestCandidate = freeTeachers[0];
        newAssignments[uniqueKey] = bestCandidate;
        reliefWorkloadCount[bestCandidate] = (reliefWorkloadCount[bestCandidate] || 0) + 1;
      } else {
        const sortedAll = [...availableTeachers].sort(
          (a, b) => (reliefWorkloadCount[a] || 0) - (reliefWorkloadCount[b] || 0)
        );
        const fallback = sortedAll[0];
        newAssignments[uniqueKey] = fallback;
        reliefWorkloadCount[fallback] = (reliefWorkloadCount[fallback] || 0) + 1;
      }
    });

    setReliefAssignments(newAssignments);
  }, [slotsNeedingRelief, reliefTeachersFingerprint, daySlots, users, absentTeachers]);

  const handlePrintRelief = () => {
    setIsPrintModalOpen(true);
    onShowToast('Paparan Cetak / Simpan PDF Jadual Kelas Ganti dibuka.', 'info');
    setTimeout(() => {
      try {
        window.print();
      } catch {
        // Modal tetap terbuka dengan butang Cetak & Muat Turun HTML jika iframe menyekat dialog cetak automatik
      }
    }, 280);
  };

  const handleDownloadPrintableHtml = () => {
    const todayFormatted = new Date().toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const rowsHtml =
      slotsNeedingRelief.length === 0
        ? `<tr><td colspan="7" style="text-align:center;padding:24px;color:#475569;font-style:italic;">Tiada kelas ganti diperlukan pada hari ${selectedDay}.</td></tr>`
        : slotsNeedingRelief
            .map((slot, idx) => {
              const uniqueKey = `${slot.kelas}_${slot.masa || slot.slotId}`;
              const reliefTeacher = reliefAssignments[uniqueKey] || '(Automatik)';
              const isPerhimpunan =
                !slot.guru || slot.guru.trim() === '' || slot.subjek.toLowerCase().includes('perhimpunan');
              return `
                <tr>
                  <td style="text-align:center;">${idx + 1}</td>
                  <td style="font-family:monospace;font-weight:700;">${slot.masa || slot.slotId}</td>
                  <td style="font-weight:800;">${slot.kelas}</td>
                  <td>${slot.subjek}</td>
                  <td>${slot.guru || '(Slot Perhimpunan)'}</td>
                  <td>${isPerhimpunan ? 'Slot Perhimpunan' : 'Guru Tidak Hadir'}</td>
                  <td style="font-weight:800;color:#6e0c1f;">${reliefTeacher}</td>
                </tr>
              `;
            })
            .join('');

    const htmlDoc = `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8" />
  <title>Jadual Kelas Ganti (Relief) - ${selectedDay} - SK Kepawa 2026</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; margin: 28px; color: #0f172a; }
    .toolbar { margin-bottom: 18px; display: flex; gap: 10px; }
    .btn { padding: 10px 18px; background: #6e0c1f; color: #fbbf24; border: 1px solid #fbbf24; border-radius: 8px; font-weight: 800; cursor: pointer; }
    .header { text-align: center; border-bottom: 3px solid #6e0c1f; padding-bottom: 12px; margin-bottom: 16px; }
    .header h1 { margin: 0; font-size: 18px; color: #4f0917; text-transform: uppercase; }
    .header p { margin: 4px 0 0; font-size: 12px; color: #334155; }
    .meta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 14px; background: #fffbeb; padding: 10px 14px; border: 1px solid #f59e0b; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    th { background: #4f0917; color: #fef08a; text-transform: uppercase; font-size: 11px; }
    .note { margin-top: 12px; font-size: 11px; color: #475569; }
    .signatures { display: flex; justify-content: space-between; margin-top: 44px; font-size: 12px; }
    .sig-box { width: 42%; border-top: 1px solid #334155; padding-top: 8px; }
    @media print { .toolbar { display: none !important; } body { margin: 12mm; } }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn" onclick="window.print()">Cetak / Simpan PDF</button>
  </div>
  <div class="header">
    <h1>SEKOLAH KEBANGSAAN KEPAWA, BEAUFORT</h1>
    <p>KOD SEKOLAH: XBA6019 &bull; PETI SURAT 367, 89808 BEAUFORT, SABAH</p>
    <p style="font-weight:800;color:#6e0c1f;margin-top:6px;">JADUAL RASMI KELAS GANTI (RELIEF) AUTOMATIK &mdash; G-TEPAT 2026</p>
  </div>
  <div class="meta">
    <div><strong>Hari Persekolahan:</strong> ${selectedDay}</div>
    <div><strong>Tarikh Cetakan:</strong> ${todayFormatted}</div>
    <div><strong>Jumlah Slot Ganti:</strong> ${slotsNeedingRelief.length}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="text-align:center;">Bil</th>
        <th>Masa / Slot</th>
        <th>Kelas</th>
        <th>Subjek</th>
        <th>Guru Asal</th>
        <th>Sebab Kosong</th>
        <th>Guru Ganti (Auto-Relief)</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <p class="note"><strong>Catatan Pentadbiran:</strong> Nama Guru Besar (<strong>MOHD ZAHARI BIN TIBIN</strong>) dikecualikan secara automatik daripada senarai tugasan guru ganti (relief).</p>
  <div class="signatures">
    <div class="sig-box">
      Disediakan oleh:<br/><br/><br/>
      <strong>Penyelaras G-TEPAT / Jadual Waktu</strong><br/>
      SK Kepawa Beaufort
    </div>
    <div class="sig-box">
      Disahkan oleh:<br/><br/><br/>
      <strong>MOHD ZAHARI BIN TIBIN</strong><br/>
      Guru Besar, SK Kepawa Beaufort
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CETAK_JADUAL_KELAS_GANTI_${selectedDay.toUpperCase()}_SK_KEPAWA_2026.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Fail cetakan rasmi (.HTML) berjaya dimuat turun! Buka fail untuk cetak atau simpan PDF.', 'success');
  };

  const handleDownloadTxt = () => {
    let content = `========================================\n`;
    content += `JADUAL KELAS GANTI (RELIEF) AUTOMATIK - SK KEPAWA 2026\n`;
    content += `Hari: ${selectedDay}\n`;
    content += `Tarikh Cetakan: ${new Date().toLocaleDateString('ms-MY')}\n`;
    content += `Pengecualian: MOHD ZAHARI BIN TIBIN (Guru Besar)\n`;
    content += `========================================\n\n`;

    if (slotsNeedingRelief.length === 0) {
      content += `Tiada kelas ganti diperlukan pada hari ini.\n`;
    } else {
      slotsNeedingRelief.forEach((slot, idx) => {
        const uniqueKey = `${slot.kelas}_${slot.masa || slot.slotId}`;
        const reliefTeacher = reliefAssignments[uniqueKey] || '(Automatik)';
        const isPerhimpunan = !slot.guru || slot.guru.trim() === '' || slot.subjek.toLowerCase().includes('perhimpunan');
        content += `${idx + 1}. Masa: ${slot.masa || slot.slotId}\n`;
        content += `   Kelas: ${slot.kelas}\n`;
        content += `   Subjek: ${slot.subjek}\n`;
        content += `   Guru Asal: ${slot.guru || 'Slot Perhimpunan'}\n`;
        content += `   Sebab: ${isPerhimpunan ? 'Perhimpunan Rasmi' : 'Guru Tidak Hadir'}\n`;
        content += `   GURU GANTI (AUTO-RELIEF): ${reliefTeacher}\n`;
        content += `----------------------------------------\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JADUAL_KELAS_GANTI_OTOMATIK_${selectedDay.toUpperCase()}_SK_KEPAWA_2026.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Jadual kelas ganti automatik berjaya dimuat turun!', 'success');
  };

  const formattedDate = new Date().toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="no-print bg-gradient-to-br from-[#430b15] via-[#34070f] to-[#200409] p-6 rounded-3xl text-white shadow-[0_0_24px_rgba(245,158,11,0.14)] border border-amber-400/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#1a0307] border border-amber-500/45 text-[11px] font-black tracking-wide uppercase text-amber-300">
              MODUL PENTADBIRAN RASMI
            </span>
            <span className="text-xs text-amber-100/80 font-semibold">SK Kepawa Beaufort 2026 &bull; Kod XBA6019</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-2 text-white">
            Panel Kelas Ganti (Relief) Automatik &amp; Seimbang
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="px-4 py-2.5 bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-300 border border-amber-500/50 font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
            title="Muat turun fail teks jadual kelas ganti untuk rekod dan tangkap layar"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Muat Turun (TXT)</span>
          </button>

          <button
            type="button"
            onClick={handlePrintRelief}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-[#240509] border border-amber-200 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer active:scale-95"
            title="Buka paparan cetak formal & simpan PDF jadual kelas ganti"
          >
            <Printer className="w-4 h-4 text-[#240509]" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="no-print bg-[#240509] p-4 rounded-3xl border border-amber-500/35 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-black uppercase text-amber-200 tracking-wider">Pilih Hari Persekolahan:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat'] as const).map(day => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                selectedDay === day
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#240509] shadow-md shadow-amber-500/25 border border-amber-200'
                  : 'bg-[#360810] text-amber-100/80 hover:bg-[#4c0c17] hover:text-amber-300 border border-amber-500/25'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Teacher Absence Status Grid */}
      <div className="no-print bg-[#240509] p-5 rounded-3xl border border-amber-500/35 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                Status Kehadiran Guru ({selectedDay})
              </h3>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/15 text-amber-300 font-bold text-xs rounded-full border border-amber-400/40">
              {Object.values(absentTeachers).filter(Boolean).length} Guru Tidak Hadir
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
          {users.map(u => {
            const isAbsent = Boolean(absentTeachers[u.nama]);
            const isGB = isGuruBesar(u);

            return (
              <div
                key={u.id}
                onClick={() => toggleTeacherAbsent(u.nama)}
                title={
                  isGB
                    ? 'Guru Besar dikecualikan daripada menjadi Guru Ganti. Klik hanya jika kelas beliau memerlukan guru ganti.'
                    : 'Klik untuk menukar status kehadiran guru'
                }
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                  isAbsent
                    ? 'bg-rose-950/90 border-rose-400/70 text-rose-100 shadow-sm'
                    : isGB
                    ? 'bg-[#360810] hover:bg-[#490c17] border-amber-400/60 text-amber-100'
                    : 'bg-[#1a0307] hover:bg-[#2d060d] border-amber-500/25 text-white'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isAbsent ? 'bg-rose-400 animate-pulse' : isGB ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold">{u.nama}</div>
                    {isGB && (
                      <div className="text-[9px] font-black text-amber-300 uppercase tracking-wide">
                        Guru Besar &bull; Kecuali Relief
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                    isAbsent
                      ? 'bg-rose-600 text-white'
                      : isGB
                      ? 'bg-amber-400 text-[#240509]'
                      : 'bg-[#3a0a12] text-amber-200 border border-amber-500/30'
                  }`}
                >
                  {isAbsent ? 'TIDAK HADIR' : isGB ? 'GB (KECUALI)' : 'HADIR'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slots Needing Relief Table (Deduplicated cleanly) */}
      <div
        className={`bg-[#240509] rounded-3xl border border-amber-400/50 shadow-[0_0_24px_rgba(245,158,11,0.1)] overflow-hidden ${
          isPrintModalOpen ? 'no-print' : 'print-area'
        }`}
      >
        <div className="p-5 border-b border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#32070f]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-[#240509] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-300 uppercase tracking-tight">
                Jadual Kelas Ganti Automatik ({selectedDay})
              </h3>
              <p className="text-[11px] text-amber-100/80">
                {slotsNeedingRelief.length} kelas / slot perhimpunan telah ditetapkan guru ganti secara automatik &amp; seimbang
              </p>
            </div>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-emerald-700/80 text-white border border-emerald-400/50 text-xs font-black rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Auto-Relief Aktif (100%)</span>
            </span>
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3 py-1.5 bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-300 border border-amber-500/45 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Muat Turun</span>
            </button>
            <button
              type="button"
              onClick={handlePrintRelief}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#240509] font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {slotsNeedingRelief.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-[#380811] border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-black text-white uppercase">Tiada Kelas Memerlukan Guru Ganti</h4>
            <p className="text-xs text-amber-100/75 max-w-md mx-auto">
              Semua guru hadir mengajar. Tandakan mana-mana guru sebagai &ldquo;TIDAK HADIR&rdquo; di atas jika perlu menjana jadual kelas ganti automatik.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1a0307] text-amber-300 font-black uppercase text-[10px] tracking-wider border-b border-amber-500/30">
                  <th className="p-3.5 pl-5">Masa / Slot</th>
                  <th className="p-3.5">Kelas</th>
                  <th className="p-3.5">Subjek</th>
                  <th className="p-3.5">Guru Asal</th>
                  <th className="p-3.5">Sebab Kosong</th>
                  <th className="p-3.5 pr-5">Guru Ganti (Auto-Relief Seimbang)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/20 font-medium">
                {slotsNeedingRelief.map(slot => {
                  const uniqueKey = `${slot.kelas}_${slot.masa || slot.slotId}`;
                  const isPerhimpunan =
                    !slot.guru || slot.guru.trim() === '' || slot.subjek.toLowerCase().includes('perhimpunan');
                  const assignedRelief = reliefAssignments[uniqueKey] || 'Tiada Guru Ganti Tersedia';

                  return (
                    <tr key={uniqueKey} className="hover:bg-[#32070f] transition text-white">
                      <td className="p-3.5 pl-5 font-mono font-bold text-amber-300">
                        {slot.masa || slot.slotId}
                      </td>
                      <td className="p-3.5 font-black text-white">{slot.kelas}</td>
                      <td className="p-3.5 font-semibold text-amber-200">{slot.subjek}</td>
                      <td className="p-3.5 text-amber-100/80">{slot.guru || '(Slot Perhimpunan)'}</td>
                      <td className="p-3.5">
                        {isPerhimpunan ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase">
                            Slot Perhimpunan
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md bg-rose-900/80 text-rose-200 border border-rose-400/40 text-[10px] font-black uppercase">
                            Guru Tidak Hadir
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 pr-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-400/20 to-amber-500/15 text-amber-300 font-black rounded-xl border border-amber-400/50 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span>{assignedRelief}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Pratonton Cetak & Simpan PDF Rasmi Kelas Ganti */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-fade-in print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col border border-amber-400/60 overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none print:my-0">
            {/* Modal Control Bar */}
            <div className="no-print bg-[#2b060c] text-white p-4 px-5 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#240509] flex items-center justify-center font-black">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-amber-300">
                    Pratonton Cetak &amp; Simpan PDF Kelas Ganti
                  </h3>
                  <p className="text-[11px] text-amber-100/80">
                    Klik &ldquo;Cetak / Simpan PDF&rdquo; dan pilih destinasi &ldquo;Save as PDF&rdquo;, atau muat turun fail cetak HTML.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPrintableHtml}
                  className="px-3.5 py-2 rounded-xl bg-[#3a0a12] hover:bg-[#4e0e18] text-amber-300 border border-amber-500/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Muat Turun Cetak (.HTML)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#240509] text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  aria-label="Tutup Pratonton Cetak"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable A4 Sheet */}
            <div id="relief-formal-print-sheet" className="print-area p-6 sm:p-8 bg-white text-slate-900 space-y-5">
              {/* School Letterhead */}
              <div className="flex items-center justify-between border-b-4 border-[#6e0c1f] pb-4 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-16 shrink-0">
                    <SchoolLogo className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black uppercase text-[#4f0917] tracking-tight">
                      SEKOLAH KEBANGSAAN KEPAWA, BEAUFORT
                    </h2>
                    <p className="text-xs text-slate-600 font-semibold">
                      Kod Sekolah: XBA6019 &bull; Peti Surat 367, 89808 Beaufort, Sabah
                    </p>
                    <p className="text-xs font-black text-[#8f1028] uppercase mt-1">
                      JADUAL RASMI KELAS GANTI (RELIEF) AUTOMATIK &mdash; G-TEPAT 2026
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs shrink-0">
                  <div className="font-black text-[#4f0917] uppercase">HARI: {selectedDay}</div>
                  <div className="text-slate-600 font-semibold">Tarikh: {formattedDate}</div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-400 text-xs">
                  <thead>
                    <tr className="bg-[#4f0917] text-amber-200 uppercase text-[10px] font-black">
                      <th className="border border-slate-400 p-2.5 text-center">Bil</th>
                      <th className="border border-slate-400 p-2.5">Masa / Slot</th>
                      <th className="border border-slate-400 p-2.5">Kelas</th>
                      <th className="border border-slate-400 p-2.5">Subjek</th>
                      <th className="border border-slate-400 p-2.5">Guru Asal</th>
                      <th className="border border-slate-400 p-2.5">Sebab Kosong</th>
                      <th className="border border-slate-400 p-2.5">Guru Ganti (Relief)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slotsNeedingRelief.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="border border-slate-400 p-6 text-center text-slate-500 italic">
                          Tiada kelas ganti diperlukan pada hari {selectedDay}.
                        </td>
                      </tr>
                    ) : (
                      slotsNeedingRelief.map((slot, idx) => {
                        const uniqueKey = `${slot.kelas}_${slot.masa || slot.slotId}`;
                        const isPerhimpunan =
                          !slot.guru || slot.guru.trim() === '' || slot.subjek.toLowerCase().includes('perhimpunan');
                        const assignedRelief = reliefAssignments[uniqueKey] || '(Automatik)';

                        return (
                          <tr key={uniqueKey} className="even:bg-slate-50">
                            <td className="border border-slate-400 p-2.5 text-center font-bold">{idx + 1}</td>
                            <td className="border border-slate-400 p-2.5 font-mono font-bold">
                              {slot.masa || slot.slotId}
                            </td>
                            <td className="border border-slate-400 p-2.5 font-black">{slot.kelas}</td>
                            <td className="border border-slate-400 p-2.5 font-semibold">{slot.subjek}</td>
                            <td className="border border-slate-400 p-2.5">{slot.guru || '(Slot Perhimpunan)'}</td>
                            <td className="border border-slate-400 p-2.5">
                              {isPerhimpunan ? 'Slot Perhimpunan' : 'Guru Tidak Hadir'}
                            </td>
                            <td className="border border-slate-400 p-2.5 font-black text-[#4f0917]">
                              {assignedRelief}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] bg-amber-50 border border-amber-300 rounded-xl p-3 text-slate-700">
                <strong>Catatan Rasmi:</strong> Guru Besar (<strong>MOHD ZAHARI BIN TIBIN</strong>) dikecualikan secara automatik daripada senarai penetapan guru ganti (relief).
              </div>

              {/* Signature Footer */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-slate-800">
                <div className="space-y-10">
                  <div>Disediakan oleh:</div>
                  <div className="border-t border-slate-500 pt-2">
                    <div className="font-black uppercase">Penyelaras G-TEPAT / Jadual Waktu</div>
                    <div className="text-slate-600">SK Kepawa Beaufort</div>
                  </div>
                </div>
                <div className="space-y-10">
                  <div>Disahkan oleh:</div>
                  <div className="border-t border-slate-500 pt-2">
                    <div className="font-black uppercase">MOHD ZAHARI BIN TIBIN</div>
                    <div className="text-slate-600">Guru Besar, SK Kepawa Beaufort</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
