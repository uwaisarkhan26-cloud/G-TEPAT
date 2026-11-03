export type UserRole = 'admin' | 'pentadbir' | 'penyelaras' | 'guru';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash?: string;
  salt?: string;
  nama: string;
  no_staf: string;
  role: UserRole;
  status: 'aktif' | 'tidak_aktif';
  last_login?: string | null;
  created_at?: string;
}

export interface Student {
  id: string;
  nama: string;
  kelas: string;
  darjah: number;
  no_sb?: string;
  jantina?: 'LELAKI' | 'PEREMPUAN';
  status: 'aktif' | 'pindah';
  catatan?: string;
  created_at?: string;
}

export interface ClassItem {
  id: string;
  nama: string;
  darjah: number;
  guru_kelas: string;
  pembantu_guru_kelas?: string;
  bil_murid: number;
  qr_code: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubjectItem {
  id: string;
  kod: string;
  nama: string;
  jam_seminggu: number;
  created_at?: string;
  updated_at?: string;
}

export interface TimeSlot {
  id: string;
  code: string;
  display: string;
  isRecess: boolean;
}

export interface TimetableSlot {
  id: string;
  hari: 'Isnin' | 'Selasa' | 'Rabu' | 'Khamis' | 'Jumaat';
  slotId: string;
  masa?: string;
  kelas: string;
  subjek: string;
  guru: string;
  bilik?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  id: string;
  tarikh: string; // YYYY-MM-DD
  masa: string;   // HH:MM:SS
  slotId: string;
  guru: string;
  kelas: string;
  subjek: string;
  status: 'TEPAT MASA' | 'LEWAT';
  catatan?: string;
}

export interface SystemSettings {
  nama_sekolah: string;
  kod_sekolah: string;
  daerah: string;
  negeri: string;
  tahun_sesi: string;
  toleransi_lewat_minit: number;
  guru_besar: string;
  pk_pentadbiran: string;
}

export interface SessionData {
  session_id: string;
  user_id: string;
  username: string;
  nama: string;
  role: UserRole;
  email: string;
  created_at: string;
  expires_at: string;
}
