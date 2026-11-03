import { User, ClassItem, SubjectItem, TimeSlot, TimetableSlot, AttendanceRecord, SystemSettings, Student } from '../types';

export const ADMIN_SECURITY_PASSCODE = 'SKK2026';
export const ACCEPTED_SECURITY_PASSCODES = ['SKK2026', '2026', 'GTEPAT2026', 'ADMIN2026', 'KEPAWA2026'];

// SENARAI MURID SK KEPAWA SESI 2026
export const INITIAL_STUDENTS: Student[] = [
  // TAHUN 5 - MOHAMAD AIMAN BIN ERWAN
  {
    id: 'std_th5_01',
    nama: 'MOHAMAD AIMAN BIN ERWAN',
    kelas: '5 KUNING',
    darjah: 5,
    no_sb: '150412-12-6123',
    jantina: 'LELAKI',
    status: 'aktif',
    catatan: 'Murid Rasmi Tahun 5 Sesi 2026'
  },
  {
    id: 'std_th5_02',
    nama: 'NUR AMIRAH BINTI ZAINAL',
    kelas: '5 KUNING',
    darjah: 5,
    no_sb: '150608-12-5884',
    jantina: 'PEREMPUAN',
    status: 'aktif'
  },
  {
    id: 'std_th5_03',
    nama: 'MUHAMMAD DANISH BIN RAHMAN',
    kelas: '5 KUNING',
    darjah: 5,
    no_sb: '150914-12-5101',
    jantina: 'LELAKI',
    status: 'aktif'
  },

  // TAHUN 4 - MOHAMAD RIMAN BIN ERWAN
  {
    id: 'std_th4_01',
    nama: 'MOHAMAD RIMAN BIN ERWAN',
    kelas: '4 HIJAU',
    darjah: 4,
    no_sb: '160825-12-7019',
    jantina: 'LELAKI',
    status: 'aktif',
    catatan: 'Murid Rasmi Tahun 4 Sesi 2026'
  },
  {
    id: 'std_th4_02',
    nama: 'DAYANG NURSYAFIQAH BINTI AZMAN',
    kelas: '4 HIJAU',
    darjah: 4,
    no_sb: '160312-12-6320',
    jantina: 'PEREMPUAN',
    status: 'aktif'
  },
  {
    id: 'std_th4_03',
    nama: 'AQIL HAKIMI BIN JALAL',
    kelas: '4 HIJAU',
    darjah: 4,
    no_sb: '161102-12-5531',
    jantina: 'LELAKI',
    status: 'aktif'
  },

  // TAHUN 1
  {
    id: 'std_th1_01',
    nama: 'MUHAMMAD ARYAN BIN ROSLAN',
    kelas: '1 JINGGA',
    darjah: 1,
    no_sb: '190214-12-6111',
    jantina: 'LELAKI',
    status: 'aktif'
  },
  {
    id: 'std_th1_02',
    nama: 'NUR DAMIA BATRISYIA BINTI KHAIRUL',
    kelas: '1 JINGGA',
    darjah: 1,
    no_sb: '190520-12-5222',
    jantina: 'PEREMPUAN',
    status: 'aktif'
  },

  // TAHUN 2
  {
    id: 'std_th2_01',
    nama: 'ALIF RAYYAN BIN SHAMSUL',
    kelas: '2 BIRU',
    darjah: 2,
    no_sb: '180315-12-5333',
    jantina: 'LELAKI',
    status: 'aktif'
  },
  {
    id: 'std_th2_02',
    nama: 'SITI AISYAH BINTI HAMID',
    kelas: '2 BIRU',
    darjah: 2,
    no_sb: '180722-12-6444',
    jantina: 'PEREMPUAN',
    status: 'aktif'
  },

  // TAHUN 3
  {
    id: 'std_th3_01',
    nama: 'FARISH ZAFRI BIN MOHD YUSOF',
    kelas: '3 UNGU',
    darjah: 3,
    no_sb: '170119-12-5777',
    jantina: 'LELAKI',
    status: 'aktif'
  },
  {
    id: 'std_th3_02',
    nama: 'NOR FATIHAH BINTI ISMAIL',
    kelas: '3 UNGU',
    darjah: 3,
    no_sb: '170930-12-6888',
    jantina: 'PEREMPUAN',
    status: 'aktif'
  },

  // TAHUN 6
  {
    id: 'std_th6_01',
    nama: 'ADAM HARITH BIN FAIZAL',
    kelas: '6 MERAH',
    darjah: 6,
    no_sb: '140105-12-5999',
    jantina: 'LELAKI',
    status: 'aktif'
  },
  {
    id: 'std_th6_02',
    nama: 'QISTINA BALQIS BINTI SHAHRUL',
    kelas: '6 MERAH',
    darjah: 6,
    no_sb: '140818-12-6000',
    jantina: 'PEREMPUAN',
    status: 'aktif'
  }
];

export const INITIAL_SLOTS: TimeSlot[] = [
  { id: 'S1', code: '07:00-07:30', display: '07.00 - 07.30 AM', isRecess: false },
  { id: 'S2', code: '07:30-08:00', display: '07.30 - 08.00 AM', isRecess: false },
  { id: 'S3', code: '08:00-08:30', display: '08.00 - 08.30 AM', isRecess: false },
  { id: 'S4', code: '08:30-09:00', display: '08.30 - 09.00 AM', isRecess: false },
  { id: 'S5', code: '09:00-09:30', display: '09.00 - 09.30 AM', isRecess: false },
  { id: 'RECESS', code: '09:30-09:50', display: '09.30 - 09.50 AM (REHAT)', isRecess: true },
  { id: 'S6', code: '09:50-10:20', display: '09.50 - 10.20 AM', isRecess: false },
  { id: 'S7', code: '10:20-10:50', display: '10.20 - 10.50 AM', isRecess: false },
  { id: 'S8', code: '10:50-11:20', display: '10.50 - 11.20 AM', isRecess: false },
  { id: 'S9', code: '11:20-11:50', display: '11.20 - 11.50 AM', isRecess: false },
  { id: 'S10', code: '11:50-12:20', display: '11.50 - 12.20 PM', isRecess: false },
  { id: 'S11', code: '12:20-12:50', display: '12.20 - 12.50 PM', isRecess: false }
];

export const INITIAL_DAYS: Array<'Isnin' | 'Selasa' | 'Rabu' | 'Khamis' | 'Jumaat'> = [
  'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat'
];

// SENARAI GURU & AKP SK KEPAWA BEAUFORT SESI 2026 (BERDASARKAN DOKUMEN RASMI)
export const INITIAL_USERS: User[] = [
  { id: 'usr_dl_001', username: 'g-77263791', email: 'g-77263791@moe-dl.edu.my', nama: 'MOHD ZAHARI BIN TIBIN', no_staf: 'DELIMA-G77263791', role: 'admin', status: 'aktif' },
  { id: 'usr_dl_002', username: 'g-66232911', email: 'g-66232911@moe-dl.edu.my', nama: 'NURTITAH BINTI MEMBUAI', no_staf: 'DELIMA-G66232911', role: 'pentadbir', status: 'aktif' },
  { id: 'usr_dl_003', username: 'g-06232904', email: 'g-06232904@moe-dl.edu.my', nama: 'SITI FAIRUZ BINTI ABD RAHMAN', no_staf: 'DELIMA-G06232904', role: 'guru', status: 'aktif' },
  { id: 'usr_dl_004', username: 'g-81232906', email: 'g-81232906@moe-dl.edu.my', nama: 'KHAYSAR BIN MOHD NOOR', no_staf: 'DELIMA-G81232906', role: 'guru', status: 'aktif' },
  { id: 'usr_dl_006', username: 'g-78232902', email: 'g-78232902@moe-dl.edu.my', nama: 'ASNAH BINTI MD DANIL', no_staf: 'DELIMA-G78232902', role: 'guru', status: 'aktif' },
  { id: 'usr_dl_007', username: 'g-30232903', email: 'g-30232903@moe-dl.edu.my', nama: 'DAYANG SABARIAH @ MILAH BINTI JOAS', no_staf: 'DELIMA-G30232903', role: 'guru', status: 'aktif' },
  { id: 'usr_dl_008', username: 'g-86233208', email: 'g-86233208@moe-dl.edu.my', nama: 'SITI HABIBAH BINTI TAIP', no_staf: 'DELIMA-G86233208', role: 'guru', status: 'aktif' },
  { id: 'usr_dl_009', username: 'g-20510582', email: 'g-20510582@moe-dl.edu.my', nama: 'MIMI NUR SHAHERA BINTI HAMINUS', no_staf: 'DELIMA-G20510582', role: 'guru', status: 'aktif' },
  { id: 'usr_dl_010', username: 'g-40232910', email: 'g-40232910@moe-dl.edu.my', nama: 'NORMAWATI BINTI ISMAIL', no_staf: 'DELIMA-G40232910', role: 'guru', status: 'aktif' },
  { id: 'usr_dl_011', username: 'g-94575251', email: 'g-94575251@moe-dl.edu.my', nama: 'NORLIANA E BINTI MUSNIN', no_staf: 'DELIMA-G94575251', role: 'guru', status: 'aktif' },
  { id: 'usr_dl_012', username: 'g-38232909', email: 'g-38232909@moe-dl.edu.my', nama: 'NORADILAH BINTI RIBUT', no_staf: 'DELIMA-G38232909', role: 'penyelaras', status: 'aktif' },
  { id: 'usr_dl_013', username: 'g-66232912', email: 'g-66232912@moe-dl.edu.my', nama: 'ROHIDAH @ NORIDAH BINTI MASLIN', no_staf: 'DELIMA-G66232912', role: 'guru', status: 'aktif' },
  { id: 'usr_dl_014', username: 'g-46233078', email: 'g-46233078@moe-dl.edu.my', nama: 'SARIPAH BINTI OMAR', no_staf: 'DELIMA-G46233078', role: 'guru', status: 'aktif' }
];

// SENARAI KELAS SK KEPAWA SESI 2026 (BERDASARKAN DOKUMEN JADUAL KELAS)
export const INITIAL_CLASSES: ClassItem[] = [
  { 
    id: 'cls_01', 
    nama: '1 JINGGA', 
    darjah: 1, 
    guru_kelas: 'NORADILAH BINTI RIBUT', 
    pembantu_guru_kelas: 'KHAYSAR BIN MOHD NOOR',
    bil_murid: 28, 
    qr_code: 'SKK-2026-1JINGGA' 
  },
  { 
    id: 'cls_02', 
    nama: '2 BIRU', 
    darjah: 2, 
    guru_kelas: 'ASNAH BINTI MD DANIL', 
    pembantu_guru_kelas: 'NURTITAH BINTI MEMBUAI',
    bil_murid: 26, 
    qr_code: 'SKK-2026-2BIRU' 
  },
  { 
    id: 'cls_03', 
    nama: '3 UNGU', 
    darjah: 3, 
    guru_kelas: 'NORMAWATI BINTI ISMAIL', 
    pembantu_guru_kelas: 'SITI HABIBAH BINTI TAIP',
    bil_murid: 27, 
    qr_code: 'SKK-2026-3UNGU' 
  },
  { 
    id: 'cls_04', 
    nama: '4 HIJAU', 
    darjah: 4, 
    guru_kelas: 'ROHIDAH @ NORIDAH BINTI MASLIN', 
    pembantu_guru_kelas: 'MIMI NUR SHAHERA BINTI HAMINUS',
    bil_murid: 29, 
    qr_code: 'SKK-2026-4HIJAU' 
  },
  { 
    id: 'cls_05', 
    nama: '5 KUNING', 
    darjah: 5, 
    guru_kelas: 'DAYANG SABARIAH @ MILAH BINTI JOAS', 
    pembantu_guru_kelas: 'SARIPAH BINTI OMAR',
    bil_murid: 25, 
    qr_code: 'SKK-2026-5KUNING' 
  },
  { 
    id: 'cls_06', 
    nama: '6 MERAH', 
    darjah: 6, 
    guru_kelas: 'NORLIANA E BINTI MUSNIN', 
    pembantu_guru_kelas: 'SITI FAIRUZ BINTI ABD RAHMAN',
    bil_murid: 30, 
    qr_code: 'SKK-2026-6MERAH' 
  }
];

// SENARAI MATA PELAJARAN (ANALISIS PERUNTUKAN WAKTU SK KEPAWA 2026)
export const INITIAL_SUBJECTS: SubjectItem[] = [
  { id: 'sbj_bm', kod: 'BM', nama: 'Bahasa Melayu', jam_seminggu: 6 },
  { id: 'sbj_bi', kod: 'BI', nama: 'Bahasa Inggeris', jam_seminggu: 5 },
  { id: 'sbj_mt', kod: 'MT', nama: 'Matematik', jam_seminggu: 5 },
  { id: 'sbj_sn', kod: 'SN', nama: 'Sains', jam_seminggu: 4 },
  { id: 'sbj_pi', kod: 'PI', nama: 'Pendidikan Islam / PAI', jam_seminggu: 4 },
  { id: 'sbj_ba', kod: 'BA', nama: 'Bahasa Arab', jam_seminggu: 3 },
  { id: 'sbj_pj', kod: 'PJ', nama: 'Pendidikan Jasmani', jam_seminggu: 2 },
  { id: 'sbj_pk', kod: 'PK', nama: 'Pendidikan Kesihatan', jam_seminggu: 1 },
  { id: 'sbj_pjpk', kod: 'PJ/PK', nama: 'Pendidikan Jasmani & Kesihatan', jam_seminggu: 2 },
  { id: 'sbj_tas', kod: 'TAS', nama: 'Tasmik', jam_seminggu: 2 },
  { id: 'sbj_psv', kod: 'PSV', nama: 'Pendidikan Seni Visual', jam_seminggu: 2 },
  { id: 'sbj_sejl', kod: 'SEJ', nama: 'Sejarah', jam_seminggu: 2 },
  { id: 'sbj_rbt', kod: 'RBT', nama: 'Reka Bentuk & Teknologi', jam_seminggu: 2 },
  { id: 'sbj_mk', kod: 'MK', nama: 'Pendidikan Muzik', jam_seminggu: 1 },
  { id: 'sbj_p', kod: 'P', nama: 'Perhimpunan / Sivik', jam_seminggu: 1 }
];

export interface MasterScheduleItem {
  id: string;
  hari: 'Isnin' | 'Selasa' | 'Rabu' | 'Khamis' | 'Jumaat';
  masa: string;
  kelas: string;
  subjek: string;
  subjekKod: string;
  guru: string;
  slotIds: string[];
  isCoreItem?: boolean;
}

// JADUAL WAKTU INDUK RASMI SK KEPAWA BEAUFORT – SESI TAHUN 2026
// Dikonfigurasi 100% tepat mengikut dokumen jadual induk & jadual waktu kelas 2026
export const OFFICIAL_MASTER_SCHEDULE: MasterScheduleItem[] = [
  // ===================== ISNIN =====================
  // 1 JINGGA
  { id: 'ms_isn_1j_1', hari: 'Isnin', masa: '07:00 - 07:30', kelas: '1 JINGGA', subjek: 'Perhimpunan', subjekKod: 'P', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S1'] },
  { id: 'ms_isn_1j_2', hari: 'Isnin', masa: '07:30 - 08:30', kelas: '1 JINGGA', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S2', 'S3'], isCoreItem: true },
  { id: 'ms_isn_1j_3', hari: 'Isnin', masa: '08:30 - 09:30', kelas: '1 JINGGA', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S4', 'S5'], isCoreItem: true },
  { id: 'ms_isn_1j_4', hari: 'Isnin', masa: '09:50 - 10:20', kelas: '1 JINGGA', subjek: 'Sains', subjekKod: 'SN', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S6'] },
  { id: 'ms_isn_1j_5', hari: 'Isnin', masa: '10:20 - 11:20', kelas: '1 JINGGA', subjek: 'Bahasa Arab', subjekKod: 'BA', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S7', 'S8'] },
  { id: 'ms_isn_1j_6', hari: 'Isnin', masa: '11:20 - 11:50', kelas: '1 JINGGA', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S9'] },

  // 2 BIRU
  { id: 'ms_isn_2b_1', hari: 'Isnin', masa: '07:00 - 07:30', kelas: '2 BIRU', subjek: 'Perhimpunan', subjekKod: 'P', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S1'] },
  { id: 'ms_isn_2b_2', hari: 'Isnin', masa: '07:30 - 08:30', kelas: '2 BIRU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'NURTITAH BINTI MEMBUAI', slotIds: ['S2', 'S3'] },
  { id: 'ms_isn_2b_3', hari: 'Isnin', masa: '08:30 - 09:30', kelas: '2 BIRU', subjek: 'Sains', subjekKod: 'SN', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S4', 'S5'], isCoreItem: true },
  { id: 'ms_isn_2b_4', hari: 'Isnin', masa: '09:50 - 10:50', kelas: '2 BIRU', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S6', 'S7'] },
  { id: 'ms_isn_2b_5', hari: 'Isnin', masa: '10:50 - 11:20', kelas: '2 BIRU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S8'] },
  { id: 'ms_isn_2b_6', hari: 'Isnin', masa: '11:20 - 11:50', kelas: '2 BIRU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'NURTITAH BINTI MEMBUAI', slotIds: ['S9'] },

  // 3 UNGU
  { id: 'ms_isn_3u_1', hari: 'Isnin', masa: '07:00 - 07:30', kelas: '3 UNGU', subjek: 'Perhimpunan', subjekKod: 'P', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S1'] },
  { id: 'ms_isn_3u_2', hari: 'Isnin', masa: '07:30 - 08:30', kelas: '3 UNGU', subjek: 'Matematik', subjekKod: 'MT', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S2', 'S3'] },
  { id: 'ms_isn_3u_3', hari: 'Isnin', masa: '08:30 - 09:30', kelas: '3 UNGU', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S4', 'S5'], isCoreItem: true },
  { id: 'ms_isn_3u_4', hari: 'Isnin', masa: '09:50 - 10:50', kelas: '3 UNGU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'SITI HABIBAH BINTI TAIP', slotIds: ['S6', 'S7'] },
  { id: 'ms_isn_3u_5', hari: 'Isnin', masa: '10:50 - 11:50', kelas: '3 UNGU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S8', 'S9'] },

  // 4 HIJAU
  { id: 'ms_isn_4h_1', hari: 'Isnin', masa: '07:00 - 07:30', kelas: '4 HIJAU', subjek: 'Perhimpunan', subjekKod: 'P', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S1'] },
  { id: 'ms_isn_4h_2', hari: 'Isnin', masa: '07:30 - 08:30', kelas: '4 HIJAU', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S2', 'S3'] },
  { id: 'ms_isn_4h_3', hari: 'Isnin', masa: '08:30 - 09:30', kelas: '4 HIJAU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'KHAYSAR BIN MOHD NOOR', slotIds: ['S4', 'S5'] },
  { id: 'ms_isn_4h_4', hari: 'Isnin', masa: '09:50 - 10:50', kelas: '4 HIJAU', subjek: 'Matematik', subjekKod: 'MT', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S6', 'S7'] },
  { id: 'ms_isn_4h_5', hari: 'Isnin', masa: '10:50 - 11:50', kelas: '4 HIJAU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S8', 'S9'] },
  { id: 'ms_isn_4h_6', hari: 'Isnin', masa: '11:50 - 12:50', kelas: '4 HIJAU', subjek: 'Pendidikan Seni Visual', subjekKod: 'PSV', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S10', 'S11'] },

  // 5 KUNING
  { id: 'ms_isn_5k_1', hari: 'Isnin', masa: '07:00 - 07:30', kelas: '5 KUNING', subjek: 'Perhimpunan', subjekKod: 'P', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S1'] },
  { id: 'ms_isn_5k_2', hari: 'Isnin', masa: '07:30 - 08:30', kelas: '5 KUNING', subjek: 'Matematik', subjekKod: 'MT', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S2', 'S3'] },
  { id: 'ms_isn_5k_3', hari: 'Isnin', masa: '08:30 - 09:30', kelas: '5 KUNING', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'SITI HABIBAH BINTI TAIP', slotIds: ['S4', 'S5'] },
  { id: 'ms_isn_5k_4', hari: 'Isnin', masa: '09:50 - 10:50', kelas: '5 KUNING', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S6', 'S7'] },
  { id: 'ms_isn_5k_5', hari: 'Isnin', masa: '10:50 - 11:50', kelas: '5 KUNING', subjek: 'Tasmik', subjekKod: 'TAS', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S8', 'S9'] },
  { id: 'ms_isn_5k_6', hari: 'Isnin', masa: '11:50 - 12:50', kelas: '5 KUNING', subjek: 'Sains', subjekKod: 'SN', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S10', 'S11'] },

  // 6 MERAH
  { id: 'ms_isn_6m_1', hari: 'Isnin', masa: '07:00 - 07:30', kelas: '6 MERAH', subjek: 'Perhimpunan', subjekKod: 'P', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S1'] },
  { id: 'ms_isn_6m_2', hari: 'Isnin', masa: '07:30 - 08:30', kelas: '6 MERAH', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S2', 'S3'] },
  { id: 'ms_isn_6m_3', hari: 'Isnin', masa: '08:30 - 09:30', kelas: '6 MERAH', subjek: 'Bahasa Arab', subjekKod: 'BA', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S4', 'S5'] },
  { id: 'ms_isn_6m_4', hari: 'Isnin', masa: '09:50 - 10:50', kelas: '6 MERAH', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'KHAYSAR BIN MOHD NOOR', slotIds: ['S6', 'S7'] },
  { id: 'ms_isn_6m_5', hari: 'Isnin', masa: '10:50 - 11:50', kelas: '6 MERAH', subjek: 'Sejarah', subjekKod: 'SEJ', guru: 'SITI HABIBAH BINTI TAIP', slotIds: ['S8', 'S9'] },
  { id: 'ms_isn_6m_6', hari: 'Isnin', masa: '11:50 - 12:50', kelas: '6 MERAH', subjek: 'RBT', subjekKod: 'RBT', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S10', 'S11'] },

  // ===================== SELASA =====================
  // 1 JINGGA
  { id: 'ms_sel_1j_1', hari: 'Selasa', masa: '07:00 - 07:30', kelas: '1 JINGGA', subjek: 'Bahasa Arab', subjekKod: 'BA', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S1'] },
  { id: 'ms_sel_1j_2', hari: 'Selasa', masa: '07:30 - 08:30', kelas: '1 JINGGA', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S2', 'S3'] },
  { id: 'ms_sel_1j_3', hari: 'Selasa', masa: '08:30 - 09:30', kelas: '1 JINGGA', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S4', 'S5'] },
  { id: 'ms_sel_1j_4', hari: 'Selasa', masa: '09:50 - 10:50', kelas: '1 JINGGA', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S6', 'S7'] },
  { id: 'ms_sel_1j_5', hari: 'Selasa', masa: '10:50 - 11:50', kelas: '1 JINGGA', subjek: 'Matematik', subjekKod: 'MT', guru: 'NURTITAH BINTI MEMBUAI', slotIds: ['S8', 'S9'] },
  { id: 'ms_sel_1j_6', hari: 'Selasa', masa: '11:50 - 12:20', kelas: '1 JINGGA', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S10'] },

  // 2 BIRU
  { id: 'ms_sel_2b_1', hari: 'Selasa', masa: '07:00 - 08:00', kelas: '2 BIRU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'NURTITAH BINTI MEMBUAI', slotIds: ['S1', 'S2'] },
  { id: 'ms_sel_2b_2', hari: 'Selasa', masa: '08:00 - 09:00', kelas: '2 BIRU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S3', 'S4'] },
  { id: 'ms_sel_2b_3', hari: 'Selasa', masa: '09:00 - 09:30', kelas: '2 BIRU', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S5'] },
  { id: 'ms_sel_2b_4', hari: 'Selasa', masa: '09:50 - 10:20', kelas: '2 BIRU', subjek: 'Bahasa Arab', subjekKod: 'BA', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S6'] },
  { id: 'ms_sel_2b_5', hari: 'Selasa', masa: '10:20 - 11:20', kelas: '2 BIRU', subjek: 'Matematik', subjekKod: 'MT', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S7', 'S8'] },
  { id: 'ms_sel_2b_6', hari: 'Selasa', masa: '11:20 - 12:20', kelas: '2 BIRU', subjek: 'Pendidikan Seni Visual', subjekKod: 'PSV', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S9', 'S10'] },

  // 3 UNGU
  { id: 'ms_sel_3u_1', hari: 'Selasa', masa: '07:00 - 08:00', kelas: '3 UNGU', subjek: 'Pendidikan Jasmani', subjekKod: 'PJ', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S1', 'S2'] },
  { id: 'ms_sel_3u_2', hari: 'Selasa', masa: '08:00 - 09:00', kelas: '3 UNGU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'SITI HABIBAH BINTI TAIP', slotIds: ['S3', 'S4'] },
  { id: 'ms_sel_3u_3', hari: 'Selasa', masa: '09:00 - 09:30', kelas: '3 UNGU', subjek: 'Bahasa Arab', subjekKod: 'BA', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S5'] },
  { id: 'ms_sel_3u_4', hari: 'Selasa', masa: '09:50 - 10:20', kelas: '3 UNGU', subjek: 'Sains', subjekKod: 'SN', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S6'] },
  { id: 'ms_sel_3u_5', hari: 'Selasa', masa: '10:20 - 11:20', kelas: '3 UNGU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S7', 'S8'] },
  { id: 'ms_sel_3u_6', hari: 'Selasa', masa: '11:20 - 12:20', kelas: '3 UNGU', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S9', 'S10'] },

  // 4 HIJAU
  { id: 'ms_sel_4h_1', hari: 'Selasa', masa: '07:00 - 07:30', kelas: '4 HIJAU', subjek: 'Pendidikan Jasmani', subjekKod: 'PJ', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S1'] },
  { id: 'ms_sel_4h_2', hari: 'Selasa', masa: '07:30 - 08:30', kelas: '4 HIJAU', subjek: 'Sains', subjekKod: 'SN', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S2', 'S3'] },
  { id: 'ms_sel_4h_3', hari: 'Selasa', masa: '08:30 - 09:30', kelas: '4 HIJAU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'KHAYSAR BIN MOHD NOOR', slotIds: ['S4', 'S5'] },
  { id: 'ms_sel_4h_4', hari: 'Selasa', masa: '09:50 - 10:50', kelas: '4 HIJAU', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S6', 'S7'] },
  { id: 'ms_sel_4h_5', hari: 'Selasa', masa: '10:50 - 11:20', kelas: '4 HIJAU', subjek: 'Pendidikan Kesihatan', subjekKod: 'PK', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S8'] },
  { id: 'ms_sel_4h_6', hari: 'Selasa', masa: '11:20 - 12:20', kelas: '4 HIJAU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S9', 'S10'] },

  // 5 KUNING
  { id: 'ms_sel_5k_1', hari: 'Selasa', masa: '07:00 - 08:00', kelas: '5 KUNING', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S1', 'S2'] },
  { id: 'ms_sel_5k_2', hari: 'Selasa', masa: '08:00 - 08:30', kelas: '5 KUNING', subjek: 'Bahasa Arab', subjekKod: 'BA', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S3'] },
  { id: 'ms_sel_5k_3', hari: 'Selasa', masa: '08:30 - 09:30', kelas: '5 KUNING', subjek: 'RBT', subjekKod: 'RBT', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S4', 'S5'] },
  { id: 'ms_sel_5k_4', hari: 'Selasa', masa: '09:50 - 10:50', kelas: '5 KUNING', subjek: 'Matematik', subjekKod: 'MT', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S6', 'S7'] },
  { id: 'ms_sel_5k_5', hari: 'Selasa', masa: '10:50 - 11:20', kelas: '5 KUNING', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S8'] },
  { id: 'ms_sel_5k_6', hari: 'Selasa', masa: '11:20 - 12:20', kelas: '5 KUNING', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'SITI HABIBAH BINTI TAIP', slotIds: ['S9', 'S10'] },

  // 6 MERAH
  { id: 'ms_sel_6m_1', hari: 'Selasa', masa: '07:00 - 08:00', kelas: '6 MERAH', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S1', 'S2'] },
  { id: 'ms_sel_6m_2', hari: 'Selasa', masa: '08:00 - 09:00', kelas: '6 MERAH', subjek: 'Matematik', subjekKod: 'MT', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S3', 'S4'] },
  { id: 'ms_sel_6m_3', hari: 'Selasa', masa: '09:00 - 09:30', kelas: '6 MERAH', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S5'] },
  { id: 'ms_sel_6m_4', hari: 'Selasa', masa: '09:50 - 10:20', kelas: '6 MERAH', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S6'] },
  { id: 'ms_sel_6m_5', hari: 'Selasa', masa: '10:20 - 11:20', kelas: '6 MERAH', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'KHAYSAR BIN MOHD NOOR', slotIds: ['S7', 'S8'] },
  { id: 'ms_sel_6m_6', hari: 'Selasa', masa: '11:20 - 12:20', kelas: '6 MERAH', subjek: 'Sains', subjekKod: 'SN', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S9', 'S10'] },

  // ===================== RABU =====================
  // 1 JINGGA
  { id: 'ms_rab_1j_1', hari: 'Rabu', masa: '07:00 - 08:00', kelas: '1 JINGGA', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S1', 'S2'] },
  { id: 'ms_rab_1j_2', hari: 'Rabu', masa: '08:00 - 08:30', kelas: '1 JINGGA', subjek: 'Pendidikan Jasmani', subjekKod: 'PJ', guru: 'KHAYSAR BIN MOHD NOOR', slotIds: ['S3'] },
  { id: 'ms_rab_1j_3', hari: 'Rabu', masa: '08:30 - 09:30', kelas: '1 JINGGA', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S4', 'S5'] },
  { id: 'ms_rab_1j_4', hari: 'Rabu', masa: '09:50 - 10:50', kelas: '1 JINGGA', subjek: 'Sains', subjekKod: 'SN', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S6', 'S7'] },
  { id: 'ms_rab_1j_5', hari: 'Rabu', masa: '10:50 - 11:50', kelas: '1 JINGGA', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S8', 'S9'] },
  { id: 'ms_rab_1j_6', hari: 'Rabu', masa: '11:50 - 12:20', kelas: '1 JINGGA', subjek: 'Pendidikan Muzik', subjekKod: 'MK', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S10'] },

  // 2 BIRU
  { id: 'ms_rab_2b_1', hari: 'Rabu', masa: '07:00 - 08:00', kelas: '2 BIRU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'NURTITAH BINTI MEMBUAI', slotIds: ['S1', 'S2'] },
  { id: 'ms_rab_2b_2', hari: 'Rabu', masa: '08:00 - 08:30', kelas: '2 BIRU', subjek: 'Pendidikan Jasmani', subjekKod: 'PJ', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S3'] },
  { id: 'ms_rab_2b_3', hari: 'Rabu', masa: '08:30 - 09:30', kelas: '2 BIRU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S4', 'S5'] },
  { id: 'ms_rab_2b_4', hari: 'Rabu', masa: '09:50 - 10:20', kelas: '2 BIRU', subjek: 'Matematik', subjekKod: 'MT', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S6'] },
  { id: 'ms_rab_2b_5', hari: 'Rabu', masa: '10:20 - 11:20', kelas: '2 BIRU', subjek: 'Bahasa Arab', subjekKod: 'BA', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S7', 'S8'] },
  { id: 'ms_rab_2b_6', hari: 'Rabu', masa: '11:20 - 12:20', kelas: '2 BIRU', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S9', 'S10'] },

  // 3 UNGU
  { id: 'ms_rab_3u_1', hari: 'Rabu', masa: '07:00 - 07:30', kelas: '3 UNGU', subjek: 'Pendidikan Kesihatan', subjekKod: 'PK', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S1'] },
  { id: 'ms_rab_3u_2', hari: 'Rabu', masa: '07:30 - 08:30', kelas: '3 UNGU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S2', 'S3'] },
  { id: 'ms_rab_3u_3', hari: 'Rabu', masa: '08:30 - 09:30', kelas: '3 UNGU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'SITI HABIBAH BINTI TAIP', slotIds: ['S4', 'S5'] },
  { id: 'ms_rab_3u_4', hari: 'Rabu', masa: '09:50 - 10:20', kelas: '3 UNGU', subjek: 'Pendidikan Muzik', subjekKod: 'MK', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S6'] },
  { id: 'ms_rab_3u_5', hari: 'Rabu', masa: '10:20 - 11:20', kelas: '3 UNGU', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S7', 'S8'] },
  { id: 'ms_rab_3u_6', hari: 'Rabu', masa: '11:20 - 12:20', kelas: '3 UNGU', subjek: 'Matematik', subjekKod: 'MT', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S9', 'S10'] },

  // 4 HIJAU
  { id: 'ms_rab_4h_1', hari: 'Rabu', masa: '07:00 - 08:00', kelas: '4 HIJAU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'KHAYSAR BIN MOHD NOOR', slotIds: ['S1', 'S2'] },
  { id: 'ms_rab_4h_2', hari: 'Rabu', masa: '08:00 - 09:00', kelas: '4 HIJAU', subjek: 'Sains', subjekKod: 'SN', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S3', 'S4'] },
  { id: 'ms_rab_4h_3', hari: 'Rabu', masa: '09:00 - 09:30', kelas: '4 HIJAU', subjek: 'Matematik', subjekKod: 'MT', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S5'] },
  { id: 'ms_rab_4h_4', hari: 'Rabu', masa: '09:50 - 10:50', kelas: '4 HIJAU', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S6', 'S7'] },
  { id: 'ms_rab_4h_5', hari: 'Rabu', masa: '10:50 - 11:50', kelas: '4 HIJAU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S8', 'S9'] },
  { id: 'ms_rab_4h_6', hari: 'Rabu', masa: '11:50 - 12:20', kelas: '4 HIJAU', subjek: 'Bahasa Arab', subjekKod: 'BA', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S10'] },

  // 5 KUNING
  { id: 'ms_rab_5k_1', hari: 'Rabu', masa: '07:00 - 08:00', kelas: '5 KUNING', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'SITI HABIBAH BINTI TAIP', slotIds: ['S1', 'S2'] },
  { id: 'ms_rab_5k_2', hari: 'Rabu', masa: '08:00 - 08:30', kelas: '5 KUNING', subjek: 'Pendidikan Muzik', subjekKod: 'MK', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S3'] },
  { id: 'ms_rab_5k_3', hari: 'Rabu', masa: '08:30 - 09:30', kelas: '5 KUNING', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S4', 'S5'] },
  { id: 'ms_rab_5k_4', hari: 'Rabu', masa: '09:50 - 10:20', kelas: '5 KUNING', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S6'] },
  { id: 'ms_rab_5k_5', hari: 'Rabu', masa: '10:20 - 11:20', kelas: '5 KUNING', subjek: 'Pendidikan Seni Visual', subjekKod: 'PSV', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S7', 'S8'] },
  { id: 'ms_rab_5k_6', hari: 'Rabu', masa: '11:20 - 12:20', kelas: '5 KUNING', subjek: 'Sejarah', subjekKod: 'SEJ', guru: 'SITI HABIBAH BINTI TAIP', slotIds: ['S9', 'S10'] },

  // 6 MERAH
  { id: 'ms_rab_6m_1', hari: 'Rabu', masa: '07:00 - 07:30', kelas: '6 MERAH', subjek: 'Pendidikan Jasmani', subjekKod: 'PJ', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S1'] },
  { id: 'ms_rab_6m_2', hari: 'Rabu', masa: '07:30 - 08:30', kelas: '6 MERAH', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S2', 'S3'] },
  { id: 'ms_rab_6m_3', hari: 'Rabu', masa: '08:30 - 09:00', kelas: '6 MERAH', subjek: 'Pendidikan Kesihatan', subjekKod: 'PK', guru: 'NURTITAH BINTI MEMBUAI', slotIds: ['S4'] },
  { id: 'ms_rab_6m_4', hari: 'Rabu', masa: '09:00 - 09:30', kelas: '6 MERAH', subjek: 'Pendidikan Muzik', subjekKod: 'MK', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S5'] },
  { id: 'ms_rab_6m_5', hari: 'Rabu', masa: '09:50 - 10:50', kelas: '6 MERAH', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'KHAYSAR BIN MOHD NOOR', slotIds: ['S6', 'S7'] },
  { id: 'ms_rab_6m_6', hari: 'Rabu', masa: '10:50 - 11:20', kelas: '6 MERAH', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S8'] },
  { id: 'ms_rab_6m_7', hari: 'Rabu', masa: '11:20 - 12:20', kelas: '6 MERAH', subjek: 'Pendidikan Seni Visual', subjekKod: 'PSV', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S9', 'S10'] },

  // ===================== KHAMIS =====================
  // 1 JINGGA
  { id: 'ms_kha_1j_1', hari: 'Khamis', masa: '07:00 - 07:30', kelas: '1 JINGGA', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S1'] },
  { id: 'ms_kha_1j_2', hari: 'Khamis', masa: '07:30 - 08:30', kelas: '1 JINGGA', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S2', 'S3'] },
  { id: 'ms_kha_1j_3', hari: 'Khamis', masa: '08:30 - 09:30', kelas: '1 JINGGA', subjek: 'Tasmik', subjekKod: 'TAS', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S4', 'S5'] },
  { id: 'ms_kha_1j_4', hari: 'Khamis', masa: '09:50 - 10:50', kelas: '1 JINGGA', subjek: 'Pendidikan Seni Visual', subjekKod: 'PSV', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S6', 'S7'] },
  { id: 'ms_kha_1j_5', hari: 'Khamis', masa: '10:50 - 11:20', kelas: '1 JINGGA', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S8'] },
  { id: 'ms_kha_1j_6', hari: 'Khamis', masa: '11:20 - 12:20', kelas: '1 JINGGA', subjek: 'Matematik', subjekKod: 'MT', guru: 'NURTITAH BINTI MEMBUAI', slotIds: ['S9', 'S10'] },

  // 2 BIRU
  { id: 'ms_kha_2b_1', hari: 'Khamis', masa: '07:00 - 08:00', kelas: '2 BIRU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'NURTITAH BINTI MEMBUAI', slotIds: ['S1', 'S2'] },
  { id: 'ms_kha_2b_2', hari: 'Khamis', masa: '08:00 - 09:00', kelas: '2 BIRU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S3', 'S4'] },
  { id: 'ms_kha_2b_3', hari: 'Khamis', masa: '09:00 - 09:30', kelas: '2 BIRU', subjek: 'Pendidikan Muzik', subjekKod: 'MK', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S5'] },
  { id: 'ms_kha_2b_4', hari: 'Khamis', masa: '09:50 - 10:50', kelas: '2 BIRU', subjek: 'Tasmik', subjekKod: 'TAS', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S6', 'S7'] },
  { id: 'ms_kha_2b_5', hari: 'Khamis', masa: '10:50 - 11:50', kelas: '2 BIRU', subjek: 'Matematik', subjekKod: 'MT', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S8', 'S9'] },
  { id: 'ms_kha_2b_6', hari: 'Khamis', masa: '11:50 - 12:20', kelas: '2 BIRU', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S10'] },

  // 3 UNGU
  { id: 'ms_kha_3u_1', hari: 'Khamis', masa: '07:00 - 08:00', kelas: '3 UNGU', subjek: 'Sains', subjekKod: 'SN', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S1', 'S2'] },
  { id: 'ms_kha_3u_2', hari: 'Khamis', masa: '08:00 - 09:00', kelas: '3 UNGU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'SITI HABIBAH BINTI TAIP', slotIds: ['S3', 'S4'] },
  { id: 'ms_kha_3u_3', hari: 'Khamis', masa: '09:00 - 09:30', kelas: '3 UNGU', subjek: 'Matematik', subjekKod: 'MT', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S5'] },
  { id: 'ms_kha_3u_4', hari: 'Khamis', masa: '09:50 - 10:20', kelas: '3 UNGU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S6'] },
  { id: 'ms_kha_3u_5', hari: 'Khamis', masa: '10:20 - 11:20', kelas: '3 UNGU', subjek: 'Pendidikan Seni Visual', subjekKod: 'PSV', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S7', 'S8'] },
  { id: 'ms_kha_3u_6', hari: 'Khamis', masa: '11:20 - 12:20', kelas: '3 UNGU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S9', 'S10'] },

  // 4 HIJAU
  { id: 'ms_kha_4h_1', hari: 'Khamis', masa: '07:00 - 07:30', kelas: '4 HIJAU', subjek: 'Pendidikan Jasmani', subjekKod: 'PJ', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S1'] },
  { id: 'ms_kha_4h_2', hari: 'Khamis', masa: '07:30 - 08:30', kelas: '4 HIJAU', subjek: 'Bahasa Arab', subjekKod: 'BA', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S2', 'S3'] },
  { id: 'ms_kha_4h_3', hari: 'Khamis', masa: '08:30 - 09:30', kelas: '4 HIJAU', subjek: 'Tasmik', subjekKod: 'TAS', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S4', 'S5'] },
  { id: 'ms_kha_4h_4', hari: 'Khamis', masa: '09:50 - 10:50', kelas: '4 HIJAU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S6', 'S7'] },
  { id: 'ms_kha_4h_5', hari: 'Khamis', masa: '10:50 - 11:50', kelas: '4 HIJAU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'KHAYSAR BIN MOHD NOOR', slotIds: ['S8', 'S9'] },
  { id: 'ms_kha_4h_6', hari: 'Khamis', masa: '11:50 - 12:20', kelas: '4 HIJAU', subjek: 'Matematik', subjekKod: 'MT', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S10'] },

  // 5 KUNING
  { id: 'ms_kha_5k_1', hari: 'Khamis', masa: '07:00 - 07:30', kelas: '5 KUNING', subjek: 'Matematik', subjekKod: 'MT', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S1'] },
  { id: 'ms_kha_5k_2', hari: 'Khamis', masa: '07:30 - 08:00', kelas: '5 KUNING', subjek: 'Pendidikan Jasmani', subjekKod: 'PJ', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S2'] },
  { id: 'ms_kha_5k_3', hari: 'Khamis', masa: '08:00 - 09:00', kelas: '5 KUNING', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S3', 'S4'] },
  { id: 'ms_kha_5k_4', hari: 'Khamis', masa: '09:00 - 09:30', kelas: '5 KUNING', subjek: 'Pendidikan Kesihatan', subjekKod: 'PK', guru: 'NURTITAH BINTI MEMBUAI', slotIds: ['S5'] },
  { id: 'ms_kha_5k_5', hari: 'Khamis', masa: '09:50 - 10:20', kelas: '5 KUNING', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S6'] },
  { id: 'ms_kha_5k_6', hari: 'Khamis', masa: '10:20 - 11:20', kelas: '5 KUNING', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'SITI HABIBAH BINTI TAIP', slotIds: ['S7', 'S8'] },
  { id: 'ms_kha_5k_7', hari: 'Khamis', masa: '11:20 - 12:20', kelas: '5 KUNING', subjek: 'Sains', subjekKod: 'SN', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S9', 'S10'] },

  // 6 MERAH
  { id: 'ms_kha_6m_1', hari: 'Khamis', masa: '07:00 - 08:00', kelas: '6 MERAH', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S1', 'S2'] },
  { id: 'ms_kha_6m_2', hari: 'Khamis', masa: '08:00 - 08:30', kelas: '6 MERAH', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S3'] },
  { id: 'ms_kha_6m_3', hari: 'Khamis', masa: '08:30 - 09:30', kelas: '6 MERAH', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'KHAYSAR BIN MOHD NOOR', slotIds: ['S4', 'S5'] },
  { id: 'ms_kha_6m_4', hari: 'Khamis', masa: '09:50 - 10:50', kelas: '6 MERAH', subjek: 'Sains', subjekKod: 'SN', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S6', 'S7'] },
  { id: 'ms_kha_6m_5', hari: 'Khamis', masa: '10:50 - 11:20', kelas: '6 MERAH', subjek: 'Matematik', subjekKod: 'MT', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S8'] },
  { id: 'ms_kha_6m_6', hari: 'Khamis', masa: '11:20 - 12:20', kelas: '6 MERAH', subjek: 'Tasmik', subjekKod: 'TAS', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S9', 'S10'] },

  // ===================== JUMAAT =====================
  // 1 JINGGA
  { id: 'ms_jum_1j_1', hari: 'Jumaat', masa: '07:00 - 07:30', kelas: '1 JINGGA', subjek: 'Pendidikan Jasmani', subjekKod: 'PJ', guru: 'KHAYSAR BIN MOHD NOOR', slotIds: ['S1'] },
  { id: 'ms_jum_1j_2', hari: 'Jumaat', masa: '07:30 - 08:00', kelas: '1 JINGGA', subjek: 'Pendidikan Kesihatan', subjekKod: 'PK', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S2'] },
  { id: 'ms_jum_1j_3', hari: 'Jumaat', masa: '08:00 - 08:30', kelas: '1 JINGGA', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S3'] },
  { id: 'ms_jum_1j_4', hari: 'Jumaat', masa: '08:30 - 09:30', kelas: '1 JINGGA', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S4', 'S5'] },
  { id: 'ms_jum_1j_5', hari: 'Jumaat', masa: '09:50 - 10:20', kelas: '1 JINGGA', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S6'] },
  { id: 'ms_jum_1j_6', hari: 'Jumaat', masa: '10:20 - 11:20', kelas: '1 JINGGA', subjek: 'Matematik', subjekKod: 'MT', guru: 'NURTITAH BINTI MEMBUAI', slotIds: ['S7', 'S8'] },

  // 2 BIRU
  { id: 'ms_jum_2b_1', hari: 'Jumaat', masa: '07:00 - 07:30', kelas: '2 BIRU', subjek: 'Pendidikan Jasmani', subjekKod: 'PJ', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S1'] },
  { id: 'ms_jum_2b_2', hari: 'Jumaat', masa: '07:30 - 08:00', kelas: '2 BIRU', subjek: 'Pendidikan Kesihatan', subjekKod: 'PK', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S2'] },
  { id: 'ms_jum_2b_3', hari: 'Jumaat', masa: '08:00 - 09:00', kelas: '2 BIRU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'NURTITAH BINTI MEMBUAI', slotIds: ['S3', 'S4'] },
  { id: 'ms_jum_2b_4', hari: 'Jumaat', masa: '09:00 - 09:30', kelas: '2 BIRU', subjek: 'Matematik', subjekKod: 'MT', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S5'] },
  { id: 'ms_jum_2b_5', hari: 'Jumaat', masa: '09:50 - 10:50', kelas: '2 BIRU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'ASNAH BINTI MD DANIL', slotIds: ['S6', 'S7'] },
  { id: 'ms_jum_2b_6', hari: 'Jumaat', masa: '10:50 - 11:20', kelas: '2 BIRU', subjek: 'Sains', subjekKod: 'SN', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S8'] },

  // 3 UNGU
  { id: 'ms_jum_3u_1', hari: 'Jumaat', masa: '07:00 - 08:00', kelas: '3 UNGU', subjek: 'Tasmik', subjekKod: 'TAS', guru: 'NORADILAH BINTI RIBUT', slotIds: ['S1', 'S2'] },
  { id: 'ms_jum_3u_2', hari: 'Jumaat', masa: '08:00 - 08:30', kelas: '3 UNGU', subjek: 'Matematik', subjekKod: 'MT', guru: 'NORLIANA E BINTI MUSNIN', slotIds: ['S3'] },
  { id: 'ms_jum_3u_3', hari: 'Jumaat', masa: '08:30 - 09:30', kelas: '3 UNGU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S4', 'S5'] },
  { id: 'ms_jum_3u_4', hari: 'Jumaat', masa: '09:50 - 10:20', kelas: '3 UNGU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'SITI HABIBAH BINTI TAIP', slotIds: ['S6'] },
  { id: 'ms_jum_3u_5', hari: 'Jumaat', masa: '10:20 - 11:20', kelas: '3 UNGU', subjek: 'Bahasa Arab', subjekKod: 'BA', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S7', 'S8'] },

  // 4 HIJAU
  { id: 'ms_jum_4h_1', hari: 'Jumaat', masa: '07:00 - 07:30', kelas: '4 HIJAU', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S1'] },
  { id: 'ms_jum_4h_2', hari: 'Jumaat', masa: '07:30 - 08:00', kelas: '4 HIJAU', subjek: 'Matematik', subjekKod: 'MT', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S2'] },
  { id: 'ms_jum_4h_3', hari: 'Jumaat', masa: '08:00 - 08:30', kelas: '4 HIJAU', subjek: 'Pendidikan Muzik', subjekKod: 'MK', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S3'] },
  { id: 'ms_jum_4h_4', hari: 'Jumaat', masa: '08:30 - 09:30', kelas: '4 HIJAU', subjek: 'Sejarah', subjekKod: 'SEJ', guru: 'SITI HABIBAH BINTI TAIP', slotIds: ['S4', 'S5'] },
  { id: 'ms_jum_4h_5', hari: 'Jumaat', masa: '09:50 - 10:50', kelas: '4 HIJAU', subjek: 'RBT', subjekKod: 'RBT', guru: 'ROHIDAH @ NORIDAH BINTI MASLIN', slotIds: ['S6', 'S7'] },
  { id: 'ms_jum_4h_6', hari: 'Jumaat', masa: '10:50 - 11:20', kelas: '4 HIJAU', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'KHAYSAR BIN MOHD NOOR', slotIds: ['S8'] },

  // 5 KUNING
  { id: 'ms_jum_5k_1', hari: 'Jumaat', masa: '07:00 - 08:00', kelas: '5 KUNING', subjek: 'Bahasa Arab', subjekKod: 'BA', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S1', 'S2'] },
  { id: 'ms_jum_5k_2', hari: 'Jumaat', masa: '08:00 - 08:30', kelas: '5 KUNING', subjek: 'Pendidikan Jasmani', subjekKod: 'PJ', guru: 'MOHD ZAHARI BIN TIBIN', slotIds: ['S3'] },
  { id: 'ms_jum_5k_3', hari: 'Jumaat', masa: '08:30 - 09:30', kelas: '5 KUNING', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S4', 'S5'] },
  { id: 'ms_jum_5k_4', hari: 'Jumaat', masa: '09:50 - 10:50', kelas: '5 KUNING', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S6', 'S7'] },
  { id: 'ms_jum_5k_5', hari: 'Jumaat', masa: '10:50 - 11:20', kelas: '5 KUNING', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'SITI HABIBAH BINTI TAIP', slotIds: ['S8'] },

  // 6 MERAH
  { id: 'ms_jum_6m_1', hari: 'Jumaat', masa: '07:00 - 07:30', kelas: '6 MERAH', subjek: 'Pendidikan Jasmani', subjekKod: 'PJ', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S1'] },
  { id: 'ms_jum_6m_2', hari: 'Jumaat', masa: '07:30 - 08:30', kelas: '6 MERAH', subjek: 'Pendidikan Islam', subjekKod: 'PI', guru: 'SITI FAIRUZ BINTI ABD RAHMAN', slotIds: ['S2', 'S3'] },
  { id: 'ms_jum_6m_3', hari: 'Jumaat', masa: '08:30 - 09:00', kelas: '6 MERAH', subjek: 'Bahasa Inggeris', subjekKod: 'BI', guru: 'KHAYSAR BIN MOHD NOOR', slotIds: ['S4'] },
  { id: 'ms_jum_6m_4', hari: 'Jumaat', masa: '09:00 - 09:30', kelas: '6 MERAH', subjek: 'Bahasa Arab', subjekKod: 'BA', guru: 'NORMAWATI BINTI ISMAIL', slotIds: ['S5'] },
  { id: 'ms_jum_6m_5', hari: 'Jumaat', masa: '09:50 - 10:20', kelas: '6 MERAH', subjek: 'Bahasa Melayu', subjekKod: 'BM', guru: 'DAYANG SABARIAH @ MILAH BINTI JOAS', slotIds: ['S6'] },
  { id: 'ms_jum_6m_6', hari: 'Jumaat', masa: '10:20 - 11:20', kelas: '6 MERAH', subjek: 'Matematik', subjekKod: 'MT', guru: 'MIMI NUR SHAHERA BINTI HAMINUS', slotIds: ['S7', 'S8'] }
];

// JANA REKOD SLOT JADUAL WAKTU INTERAKTIF LENGKAP
export const generateFullInitialTimetable = (): TimetableSlot[] => {
  const slotsList: TimetableSlot[] = [];

  OFFICIAL_MASTER_SCHEDULE.forEach((item) => {
    item.slotIds.forEach((slotId, index) => {
      const room = item.subjekKod === 'SN' ? 'Makmal Sains' :
                   item.subjekKod === 'PI' || item.subjekKod === 'TAS' ? 'Surau' :
                   item.subjekKod === 'RBT' ? 'Bengkel RBT' :
                   item.subjekKod === 'MK' ? 'Bilik Muzik' :
                   item.subjekKod === 'PJ' || item.subjekKod === 'PK' || item.subjekKod === 'PJ/PK' ? 'Padang Sekolah' :
                   `Bilik Darjah ${item.kelas}`;
      
      slotsList.push({
        id: `tt_${item.id}_${slotId}_${index}`,
        hari: item.hari,
        slotId: slotId,
        masa: item.masa,
        kelas: item.kelas,
        subjek: item.subjekKod,
        guru: item.guru,
        bilik: room
      });
    });
  });

  return slotsList;
};

export const INITIAL_TIMETABLE: TimetableSlot[] = generateFullInitialTimetable();

export const getInitialAttendance = (): AttendanceRecord[] => {
  return [];
};

export const INITIAL_SETTINGS: SystemSettings = {
  nama_sekolah: 'SEKOLAH KEBANGSAAN KEPAWA',
  kod_sekolah: 'XBA0012',
  daerah: 'BEAUFORT',
  negeri: 'SABAH',
  tahun_sesi: '2026',
  toleransi_lewat_minit: 5,
  guru_besar: 'MOHD ZAHARI BIN TIBIN',
  pk_pentadbiran: 'NURTITAH BINTI MEMBUAI'
};
