import { AttendanceRecord } from '../types';
import { INITIAL_SLOTS } from '../data/initialData';

export const EARLY_SCAN_WINDOW_MINUTES = 5;
export const DEFAULT_LATE_TOLERANCE_MINUTES = 5;

export interface ParsedSlotWindow {
  id: string;
  code: string;
  display: string;
  startMinutes: number;
  endMinutes: number;
  earlyStartMinutes: number;
  lateCutoffMinutes: number;
  windowDisplay: string;
  startTimeDisplay: string;
}

export type TimingZone = 'EARLY_ON_TIME' | 'ON_TIME' | 'LATE' | 'PRE_SESSION' | 'AFTER_HOURS';

export interface ScanTimingEvaluation {
  isSchoolDay: boolean;
  isOutsideSchoolHours: boolean;
  isRecessTime: boolean;
  currentMinutes: number;
  activeSlot: ParsedSlotWindow;
  status: 'TEPAT MASA' | 'LEWAT';
  zone: TimingZone;
  minutesDiffFromStart: number;
  windowDisplay: string;
  reasonNote: string;
}

const formatMinutesToHHMM = (totalMinutes: number): string => {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const parseTimeToMinutes = (hhmm: string): number => {
  const [hStr, mStr] = hhmm.trim().split(':');
  return Number(hStr) * 60 + Number(mStr);
};

export const getSlotWindows = (
  lateToleranceMinutes: number = DEFAULT_LATE_TOLERANCE_MINUTES,
  earlyWindowMinutes: number = EARLY_SCAN_WINDOW_MINUTES
): ParsedSlotWindow[] => {
  const safeLate = Math.max(1, Math.min(30, Number(lateToleranceMinutes) || DEFAULT_LATE_TOLERANCE_MINUTES));
  const safeEarly = Math.max(1, Math.min(15, Number(earlyWindowMinutes) || EARLY_SCAN_WINDOW_MINUTES));

  return INITIAL_SLOTS.filter((s) => !s.isRecess).map((slot) => {
    const [startStr, endStr] = slot.code.split('-');
    const startMinutes = parseTimeToMinutes(startStr);
    const endMinutes = parseTimeToMinutes(endStr);
    const earlyStartMinutes = startMinutes - safeEarly;
    const lateCutoffMinutes = startMinutes + safeLate;

    return {
      id: slot.id,
      code: slot.code,
      display: slot.display,
      startMinutes,
      endMinutes,
      earlyStartMinutes,
      lateCutoffMinutes,
      windowDisplay: `${formatMinutesToHHMM(earlyStartMinutes)} – ${formatMinutesToHHMM(lateCutoffMinutes)}`,
      startTimeDisplay: formatMinutesToHHMM(startMinutes)
    };
  });
};

export const evaluateScanTiming = (
  now: Date = new Date(),
  lateToleranceMinutes: number = DEFAULT_LATE_TOLERANCE_MINUTES,
  earlyWindowMinutes: number = EARLY_SCAN_WINDOW_MINUTES
): ScanTimingEvaluation => {
  const windows = getSlotWindows(lateToleranceMinutes, earlyWindowMinutes);
  const slotOne = windows[0];
  const dayOfWeek = now.getDay(); // 0 Sun, 1 Mon ... 5 Fri, 6 Sat
  const isSchoolDay = dayOfWeek >= 1 && dayOfWeek <= 5;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Outside school days or after last slot ends (12:50 PM)
  const lastSlot = windows[windows.length - 1];
  if (!isSchoolDay || currentMinutes > lastSlot.endMinutes) {
    return {
      isSchoolDay,
      isOutsideSchoolHours: true,
      isRecessTime: false,
      currentMinutes,
      activeSlot: slotOne,
      status: 'TEPAT MASA',
      zone: 'AFTER_HOURS',
      minutesDiffFromStart: 0,
      windowDisplay: slotOne.windowDisplay,
      reasonNote: `Tepat Masa (Imbasan di luar waktu sesi PdP • Zon rasmi ${slotOne.id}: ${slotOne.windowDisplay})`
    };
  }

  // Weekday before 06:55 AM (early arrival before Slot 1 early window)
  if (currentMinutes < slotOne.earlyStartMinutes) {
    return {
      isSchoolDay: true,
      isOutsideSchoolHours: false,
      isRecessTime: false,
      currentMinutes,
      activeSlot: slotOne,
      status: 'TEPAT MASA',
      zone: 'PRE_SESSION',
      minutesDiffFromStart: currentMinutes - slotOne.startMinutes,
      windowDisplay: slotOne.windowDisplay,
      reasonNote: `Hadir Awal Sebelum ${formatMinutesToHHMM(slotOne.earlyStartMinutes)} (Sesi ${slotOne.startTimeDisplay})`
    };
  }

  // Recess gap between S5 end (09:30) and S6 early window (09:45)
  const s5 = windows.find((w) => w.id === 'S5');
  const s6 = windows.find((w) => w.id === 'S6');
  if (s5 && s6 && currentMinutes >= s5.endMinutes && currentMinutes < s6.earlyStartMinutes) {
    return {
      isSchoolDay: true,
      isOutsideSchoolHours: false,
      isRecessTime: true,
      currentMinutes,
      activeSlot: s6,
      status: 'TEPAT MASA',
      zone: 'EARLY_ON_TIME',
      minutesDiffFromStart: currentMinutes - s6.startMinutes,
      windowDisplay: s6.windowDisplay,
      reasonNote: `Waktu Rehat / Persediaan Slot ${s6.id} (${s6.startTimeDisplay})`
    };
  }

  // Find matching active slot within [earlyStartMinutes, nextSlot.earlyStartMinutes)
  let matchedSlot = lastSlot;
  for (let i = 0; i < windows.length; i++) {
    const curr = windows[i];
    const next = windows[i + 1];
    const upperBound = curr.id === 'S5' ? curr.endMinutes : next ? next.earlyStartMinutes : curr.endMinutes + 1;
    if (currentMinutes >= curr.earlyStartMinutes && currentMinutes < upperBound) {
      matchedSlot = curr;
      break;
    }
  }

  const diff = currentMinutes - matchedSlot.startMinutes;

  if (currentMinutes <= matchedSlot.lateCutoffMinutes) {
    const isEarly = diff < 0;
    return {
      isSchoolDay: true,
      isOutsideSchoolHours: false,
      isRecessTime: false,
      currentMinutes,
      activeSlot: matchedSlot,
      status: 'TEPAT MASA',
      zone: isEarly ? 'EARLY_ON_TIME' : 'ON_TIME',
      minutesDiffFromStart: diff,
      windowDisplay: matchedSlot.windowDisplay,
      reasonNote: isEarly
        ? `Tepat Masa (${Math.abs(diff)} minit sebelum ${matchedSlot.startTimeDisplay} • Zon ${matchedSlot.windowDisplay})`
        : `Tepat Masa (Zon ±${earlyWindowMinutes}/${lateToleranceMinutes} minit: ${matchedSlot.windowDisplay})`
    };
  }

  return {
    isSchoolDay: true,
    isOutsideSchoolHours: false,
    isRecessTime: false,
    currentMinutes,
    activeSlot: matchedSlot,
    status: 'LEWAT',
    zone: 'LATE',
    minutesDiffFromStart: diff,
    windowDisplay: matchedSlot.windowDisplay,
    reasonNote: `Lewat ${diff} minit dari ${matchedSlot.startTimeDisplay} (Had tepat masa: ${formatMinutesToHHMM(matchedSlot.lateCutoffMinutes)})`
  };
};

export const formatSlotBadgeLabel = (slotId: string): string => {
  const slot = INITIAL_SLOTS.find((s) => s.id === slotId);
  if (!slot) return slotId || 'S1';
  return `${slot.id} (${slot.code})`;
};

export const sortAttendanceChronologically = (
  records: AttendanceRecord[],
  direction: 'asc' | 'desc' = 'asc'
): AttendanceRecord[] => {
  return [...records].sort((a, b) => {
    const dateCompare = a.tarikh.localeCompare(b.tarikh);
    if (dateCompare !== 0) {
      return direction === 'asc' ? dateCompare : -dateCompare;
    }
    const timeCompare = (a.masa || '').localeCompare(b.masa || '');
    if (timeCompare !== 0) {
      return direction === 'asc' ? timeCompare : -timeCompare;
    }
    return (a.kelas || '').localeCompare(b.kelas || '');
  });
};
