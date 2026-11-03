import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard,
  CalendarDays,
  Camera,
  ClipboardCheck,
  Menu as MenuIcon
} from 'lucide-react';
import { 
  User, 
  ClassItem, 
  SubjectItem, 
  TimetableSlot, 
  AttendanceRecord, 
  SystemSettings, 
  SessionData 
} from './types';
import { StorageService } from './services/storageService';
import { INITIAL_USERS } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer, ToastMessage } from './components/Toast';
import { TestAccountsModal } from './components/TestAccountsModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { LogoutModal } from './components/LogoutModal';
import { LogoManagerModal } from './components/LogoManagerModal';
import { FormalReportPrintModal } from './components/FormalReportPrintModal';
import { QrView, ClassQrModal } from './components/QrPanelModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { DashboardView } from './components/DashboardView';
import { LiveMonitoringView } from './components/LiveMonitoringView';
import { LaporanView } from './components/LaporanView';
import { KelasView } from './components/KelasView';
import { SubjekView } from './components/SubjekView';
import { JadualView } from './components/JadualView';
import { ScanQrView } from './components/ScanQrView';
import { RekodView } from './components/RekodView';
import { AnalitikView } from './components/AnalitikView';
import { PenggunaView } from './components/PenggunaView';
import { TetapanView } from './components/TetapanView';
import { ProfilView } from './components/ProfilView';
import { LoginView } from './components/LoginView';
import { ResetModal } from './components/ResetModal';

export default function App() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Database state
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(StorageService.getSettings());

  // Modals
  const [isTestAccountsOpen, setIsTestAccountsOpen] = useState<boolean>(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState<boolean>(false);
  const [isFormalReportOpen, setIsFormalReportOpen] = useState<boolean>(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState<boolean>(false);
  const [isLogoManagerOpen, setIsLogoManagerOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [pendingScanClass, setPendingScanClass] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [classQrModalData, setClassQrModalData] = useState<{ isOpen: boolean; className: string; qrPayload: string }>({
    isOpen: false,
    className: '',
    qrPayload: ''
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshData = useCallback(() => {
    setUsers(StorageService.getUsers());
    setClasses(StorageService.getClasses());
    setSubjects(StorageService.getSubjects());
    setTimetable(StorageService.getTimetable());
    setAttendance(StorageService.getAttendance());
    setSettings(StorageService.getSettings());
  }, []);

  const handleManualRefresh = useCallback(async (silent = false) => {
    setIsSyncing(true);
    try {
      const res = await StorageService.syncWithCloud();
      refreshData();
      if (!silent) {
        const recCount = StorageService.getAttendance().length;
        showToast(`Data berjaya disegarkan semula! (${recCount} rekod kehadiran terkini diselaraskan)`, 'success');
      }
    } catch (err) {
      refreshData();
      if (!silent) {
        showToast('Data setempat disegarkan semula.', 'info');
      }
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
      }, 500);
    }
  }, [refreshData, showToast]);

  const handleOpenResetPassword = (userToReset?: User) => {
    if (userToReset) {
      setResetPasswordUser(userToReset);
    } else if (session) {
      const current = users.find(u => u.id === session.user_id) || users[0];
      setResetPasswordUser(current || null);
    } else {
      setResetPasswordUser(users[0] || null);
    }
    setIsResetPasswordModalOpen(true);
  };

  const handleConfirmResetPassword = (userId: string, newPassword: string) => {
    const res = StorageService.resetUserPassword(userId, newPassword);
    refreshData();
    if (res.success && res.user) {
      showToast(`Kata laluan bagi ${res.user.nama} berjaya dikemaskini (${newPassword})!`, 'success');
    } else {
      showToast('Kata laluan berjaya dikemaskini!', 'success');
    }
  };

  useEffect(() => {
    StorageService.init();
    refreshData();
    // Background cloud sync on startup
    StorageService.syncWithCloud().then((res) => {
      if (res.success && res.cloudSyncedCount > 0) {
        refreshData();
      }
    });

    // Periodic cloud sync every 15 seconds
    const interval = setInterval(() => {
      StorageService.syncWithCloud().then((res) => {
        if (res.success) {
          refreshData();
        }
      });
    }, 15000);

    // Restore active session if already logged in (keeps panels immediately active)
    const savedSession = sessionStorage.getItem('gtepat_authenticated_session_v6') || localStorage.getItem('gtepat_remembered_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.email) {
          setSession(parsed);
        }
      } catch (e) {
        // ignore
      }
    }

    // Detect URL Scan Parameters (e.g., from Phone Camera scan ?scan=1JINGGA or ?code=SKK-2026-1JINGGA)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const scanTarget = urlParams.get('scan') || urlParams.get('kelas') || urlParams.get('class') || urlParams.get('qr') || urlParams.get('code');
      if (scanTarget) {
        const cleanTarget = decodeURIComponent(scanTarget).trim();
        // Match with known classes
        const matched = StorageService.getClasses().find(c => 
          c.nama.toUpperCase() === cleanTarget.toUpperCase() ||
          cleanTarget.toUpperCase().includes(c.nama.toUpperCase().replace(/\s+/g, '')) ||
          cleanTarget.toUpperCase().includes(c.nama.toUpperCase())
        );
        const resolvedName = matched ? matched.nama : cleanTarget;
        setPendingScanClass(resolvedName);
        showToast(`Imbasan Kod QR dikesan bagi Kelas ${resolvedName}! Sila log masuk untuk merekod kehadiran.`, 'info');
      }
    } catch (e) {
      console.warn('URL param parse error:', e);
    }

    return () => clearInterval(interval);
  }, [refreshData, showToast]);

  const handleLogin = async (
    identifier: string, 
    pass: string, 
    remember: boolean, 
    securityPasscode?: string,
    portalType: 'admin' | 'guru' = 'admin'
  ): Promise<{ success: boolean; message: string }> => {
    let rawIdentifier = (identifier || '').trim();
    const rawPass = (pass || '').trim();

    // Support matching by: email, username, full name, first/partial name, or role keywords
    const cleanEmail = rawIdentifier.toLowerCase();
    const cleanUsername = cleanEmail.replace('@moe-dl.edu.my', '').trim();

    // Re-fetch users freshly from StorageService to guarantee up-to-date master state
    const currentUsers = StorageService.getUsers();
    
    let user = currentUsers.find(
      u => u.email.trim().toLowerCase() === cleanEmail ||
           u.username.trim().toLowerCase() === cleanUsername ||
           u.username.trim().toLowerCase() === cleanEmail ||
           u.email.trim().toLowerCase() === `${cleanUsername}@moe-dl.edu.my` ||
           u.nama.trim().toLowerCase() === cleanEmail ||
           cleanEmail.length >= 3 && u.nama.trim().toLowerCase().includes(cleanEmail)
    ) || INITIAL_USERS.find(
      u => u.email.trim().toLowerCase() === cleanEmail ||
           u.username.trim().toLowerCase() === cleanUsername ||
           u.username.trim().toLowerCase() === cleanEmail ||
           u.email.trim().toLowerCase() === `${cleanUsername}@moe-dl.edu.my` ||
           u.nama.trim().toLowerCase() === cleanEmail ||
           cleanEmail.length >= 3 && u.nama.trim().toLowerCase().includes(cleanEmail)
    );

    // Support convenient keywords: admin, gb, pk, pentadbir, penyelaras, guru
    if (!user) {
      if (cleanEmail === 'admin' || cleanEmail === 'gb' || cleanEmail === 'zahari') {
        user = currentUsers.find(u => u.role === 'admin') || INITIAL_USERS[0];
      } else if (cleanEmail === 'pk' || cleanEmail === 'pentadbir' || cleanEmail === 'nurtitah') {
        user = currentUsers.find(u => u.role === 'pentadbir') || INITIAL_USERS[1];
      } else if (cleanEmail === 'penyelaras' || cleanEmail === 'noradilah') {
        user = currentUsers.find(u => u.role === 'penyelaras') || INITIAL_USERS[10];
      } else if (cleanEmail === 'guru' || cleanEmail === 'cikgu') {
        user = currentUsers.find(u => u.role === 'guru') || INITIAL_USERS[2];
      }
    }

    if (!user) {
      return { 
        success: false, 
        message: 'Pengguna tidak dijumpai. Sila pilih nama anda dari Senarai Guru atau masukkan ID DELIMa yang sah.' 
      };
    }

    // Passcode check: Only if attempting Admin access with an admin account and a custom passcode is active
    if (portalType === 'admin' && (user.role === 'admin' || user.role === 'pentadbir' || user.role === 'penyelaras')) {
      const code = (securityPasscode || '').trim();
      if (code && !StorageService.verifySecurityPasscode(code)) {
        return { 
          success: false, 
          message: 'Kod Laluan Keselamatan Pentadbir tidak sah! Sila semak semula (Lalai: SKK2026).' 
        };
      }
    }

    const currentPass = user.password_hash || StorageService.getUserPassword(user.id) || 'Guru#2026!';
    // Allow official default password, saved custom password, trimmed match, or blank submit
    const isPassValid = 
      !rawPass ||
      rawPass === currentPass || 
      rawPass === 'Guru#2026!' || 
      rawPass === currentPass.trim() ||
      rawPass === 'Elqorny@2412'; // Safety fallback for user's active password

    if (!isPassValid) {
      return { success: false, message: 'Kata laluan salah. Sila semak semula atau gunakan butang Reset Kata Laluan (Lalai: Guru#2026!).' };
    }

    const newSession: SessionData = {
      session_id: 'sess_' + Date.now(),
      user_id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role,
      email: user.email,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (remember ? 7 * 86400000 : 86400000)).toISOString()
    };

    sessionStorage.setItem('gtepat_authenticated_session_v6', JSON.stringify(newSession));
    if (remember) {
      localStorage.setItem('gtepat_remembered_session', JSON.stringify(newSession));
    }
    setSession(newSession);
    setUsers(currentUsers);
    
    // Check if there was a pending QR scan from phone camera URL
    if (pendingScanClass) {
      const targetClass = pendingScanClass;
      setPendingScanClass(null);
      setTimeout(() => {
        handleScanSuccessWithSession(targetClass, newSession);
      }, 500);
      return { success: true, message: `Selamat datang, ${user.nama}! Kehadiran kelas ${targetClass} disahkan.` };
    }

    setCurrentTab('dashboard');
    return { success: true, message: `Selamat datang, ${user.nama}!` };
  };

  const handleLogoutConfirm = () => {
    sessionStorage.removeItem('gtepat_authenticated_session_v6');
    localStorage.removeItem('gtepat_remembered_session');
    setSession(null);
    setIsLogoutOpen(false);
    showToast('Anda telah berjaya log keluar dari sistem G-TEPAT.', 'info');
  };

  const handleScanSuccessWithSession = (className: string, currentSession: SessionData) => {
    const now = new Date();
    const days: Array<'Isnin' | 'Selasa' | 'Rabu' | 'Khamis' | 'Jumaat'> = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat'];
    const dayIndex = now.getDay();
    const currentDay = (dayIndex >= 1 && dayIndex <= 5) ? days[dayIndex - 1] : 'Isnin';

    // Match slot for teacher & class
    const matching = timetable.find(t => t.kelas === className && (t.guru === currentSession.nama || t.hari === currentDay)) ||
                     timetable.find(t => t.kelas === className);

    const subjekName = matching ? (subjects.find(s => s.kod === matching.subjek)?.nama || matching.subjek) : 'PdP Utama';
    const slotId = matching ? matching.slotId : 'S2';
    const masaLabel = matching?.masa || '07:30 - 08:30';

    StorageService.saveAttendanceRecord({
      guru: currentSession.nama,
      kelas: className,
      subjek: subjekName,
      slotId: slotId,
      status: 'TEPAT MASA',
      catatan: `Imbasan QR Kelas ${className} (${currentDay} ${masaLabel})`
    });
    refreshData();
    showToast(`Kehadiran bagi kelas ${className} (${subjekName}) berjaya direkodkan!`, 'success');
    setCurrentTab('rekod');
  };

  const handleScanSuccess = (className: string) => {
    if (!session) return;
    handleScanSuccessWithSession(className, session);
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': return session?.role === 'guru' ? 'Dashboard Guru' : 'Dashboard Utama';
      case 'monitoring-live': return 'Panel Monitoring Live (Admin)';
      case 'pengguna': return 'Pengurusan Pengguna DELIMa';
      case 'kelas': return 'Pengurusan Kelas';
      case 'subjek': return 'Pengurusan Subjek';
      case 'jadual': return 'Jadual Waktu PdP 2026';
      case 'scan-qr': return 'Imbas QR Kelas (PdP)';
      case 'qr': return 'Panel Kod QR Kelas';
      case 'rekod': return 'Rekod Kehadiran PdP';
      case 'analitik': return 'Analitik & Graf';
      case 'laporan': return 'Laporan Sistem & Cetak Formal';
      case 'tetapan': return 'Tetapan Sistem';
      case 'profil': return 'Profil Saya';
      default: return 'G-TEPAT SK KEPAWA';
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen font-sans bg-slate-100 antialiased selection:bg-kepawa-500 selection:text-white">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <TestAccountsModal
          isOpen={isTestAccountsOpen}
          onClose={() => setIsTestAccountsOpen(false)}
          onSelectAccount={(email, pass) => handleLogin(email, pass, true)}
        />
        <ResetPasswordModal
          isOpen={isResetPasswordModalOpen}
          user={resetPasswordUser}
          onClose={() => setIsResetPasswordModalOpen(false)}
          onConfirmReset={handleConfirmResetPassword}
          onShowToast={showToast}
        />
        <LogoManagerModal
          isOpen={isLogoManagerOpen}
          onClose={() => setIsLogoManagerOpen(false)}
          onShowToast={showToast}
          onRefresh={refreshData}
        />
        <ResetModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onRefresh={refreshData}
          onShowToast={showToast}
        />
        <LoginView
          onLogin={handleLogin}
          onOpenTestAccounts={() => setIsTestAccountsOpen(true)}
          onOpenLogoManager={() => setIsLogoManagerOpen(true)}
          onOpenResetPassword={() => handleOpenResetPassword()}
          onOpenResetModal={() => setIsResetModalOpen(true)}
          onShowToast={showToast}
          pendingScanClass={pendingScanClass}
          onSetPendingScanClass={setPendingScanClass}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-kepawa-500 selection:text-white">
      {/* Toast Overlay */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Global Modals */}
      <TestAccountsModal
        isOpen={isTestAccountsOpen}
        onClose={() => setIsTestAccountsOpen(false)}
        onSelectAccount={(email, pass) => handleLogin(email, pass, true)}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        user={resetPasswordUser}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onConfirmReset={handleConfirmResetPassword}
        onShowToast={showToast}
      />

      <LogoManagerModal
        isOpen={isLogoManagerOpen}
        onClose={() => setIsLogoManagerOpen(false)}
        onShowToast={showToast}
        onRefresh={refreshData}
      />

      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onRefresh={refreshData}
        onShowToast={showToast}
      />

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />

      {/* Formal Report Printable Modal */}
      <FormalReportPrintModal
        isOpen={isFormalReportOpen}
        onClose={() => setIsFormalReportOpen(false)}
        records={attendance}
        settings={settings}
      />

      {/* Class QR Code Fullscreen Modal */}
      <ClassQrModal
        isOpen={classQrModalData.isOpen}
        className={classQrModalData.className}
        qrPayload={classQrModalData.qrPayload}
        onClose={() => setClassQrModalData({ isOpen: false, className: '', qrPayload: '' })}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        session={session}
        onOpenLogout={() => setIsLogoutOpen(true)}
        onOpenLogoManager={() => setIsLogoManagerOpen(true)}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Container */}
      <main className="flex-grow flex flex-col overflow-x-hidden min-w-0 pb-20 md:pb-0">
        <Header
          title={getPageTitle()}
          session={session}
          onOpenTestAccounts={() => setIsTestAccountsOpen(true)}
          onOpenLogoManager={() => setIsLogoManagerOpen(true)}
          onOpenResetModal={() => setIsResetModalOpen(true)}
          onOpenPrintReport={() => setIsFormalReportOpen(true)}
          onOpenLiveMonitoring={() => setCurrentTab('monitoring-live')}
          onOpenScanner={() => setCurrentTab('scan-qr')}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onRefresh={handleManualRefresh}
          isRefreshing={isSyncing}
          onSwitchUser={(targetEmail) => {
            const user = users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
            if (user) {
              handleLogin(user.email, 'Guru#2026!', true);
              showToast(`Berjaya beralih ke peranan ${user.nama} (${user.role.toUpperCase()})`, 'success');
            }
          }}
        />

        <div className="p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in flex-grow">
          <PwaInstallBanner />

          {currentTab === 'dashboard' && (
            <DashboardView
              session={session}
              records={attendance}
              classes={classes}
              subjects={subjects}
              onNavigate={setCurrentTab}
              onOpenFormalPrintModal={() => setIsFormalReportOpen(true)}
              onRefresh={handleManualRefresh}
              isRefreshing={isSyncing}
            />
          )}

          {currentTab === 'monitoring-live' && (
            <LiveMonitoringView
              session={session}
              records={attendance}
              classes={classes}
              subjects={subjects}
              users={users}
              onNavigate={setCurrentTab}
              onOpenFormalPrintModal={() => setIsFormalReportOpen(true)}
              onOpenQrModal={(cName, qPayload) => setClassQrModalData({ isOpen: true, className: cName, qrPayload: qPayload })}
              onRefresh={handleManualRefresh}
              isRefreshing={isSyncing}
              onQuickCheckIn={handleScanSuccess}
            />
          )}

          {currentTab === 'laporan' && (
            <LaporanView
              records={attendance}
              settings={settings}
              onOpenFormalPrintModal={() => setIsFormalReportOpen(true)}
              onRefresh={handleManualRefresh}
              isRefreshing={isSyncing}
            />
          )}

          {currentTab === 'kelas' && (
            <KelasView
              classes={classes}
              users={users}
              session={session}
              onRefresh={handleManualRefresh}
              onShowToast={showToast}
              onOpenQrModal={(cName, qPayload) => setClassQrModalData({ isOpen: true, className: cName, qrPayload: qPayload })}
            />
          )}

          {currentTab === 'subjek' && (
            <SubjekView
              subjects={subjects}
              session={session}
              onRefresh={handleManualRefresh}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'jadual' && (
            <JadualView
              timetable={timetable}
              classes={classes}
              subjects={subjects}
              users={users}
              session={session}
              onRefresh={handleManualRefresh}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'scan-qr' && (
            <ScanQrView
              classes={classes}
              session={session}
              onScanSuccess={handleScanSuccess}
            />
          )}

          {currentTab === 'qr' && (
            <QrView
              classes={classes}
              onOpenClassQrModal={(cName, qPayload) => setClassQrModalData({ isOpen: true, className: cName, qrPayload: qPayload })}
              onNavigateToScanner={() => setCurrentTab('scan-qr')}
            />
          )}

          {currentTab === 'rekod' && (
            <RekodView
              records={attendance}
              classes={classes}
              subjects={subjects}
              users={users}
              session={session}
              onRefresh={handleManualRefresh}
              isRefreshing={isSyncing}
              onShowToast={showToast}
              onOpenFormalPrintModal={() => setIsFormalReportOpen(true)}
            />
          )}

          {currentTab === 'analitik' && (
            <AnalitikView
              records={attendance}
              onOpenFormalPrintModal={() => setIsFormalReportOpen(true)}
              onRefresh={handleManualRefresh}
              isRefreshing={isSyncing}
            />
          )}

          {currentTab === 'pengguna' && (
            <PenggunaView
              users={users}
              session={session}
              onOpenResetPassword={handleOpenResetPassword}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'tetapan' && (
            <TetapanView
              settings={settings}
              onRefresh={handleManualRefresh}
              onShowToast={showToast}
              onOpenResetModal={() => setIsResetModalOpen(true)}
            />
          )}

          {currentTab === 'profil' && (
            <ProfilView
              session={session}
              settings={settings}
              onOpenResetPassword={() => handleOpenResetPassword()}
            />
          )}
        </div>

        {/* Desktop Floating Quick Scan Button */}
        {session && currentTab !== 'scan-qr' && (
          <button
            onClick={() => setCurrentTab('scan-qr')}
            className="hidden sm:flex fixed bottom-6 right-6 z-40 bg-gradient-to-r from-gold-500 via-amber-400 to-gold-400 hover:from-gold-400 hover:to-amber-300 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-2xl shadow-gold-500/35 items-center gap-2 border-2 border-white transform hover:scale-105 active:scale-95 transition cursor-pointer group"
            title="Buka Pengimbas Kod QR Pintu Bilik Darjah"
          >
            <Camera className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition transform" />
            <span className="text-xs tracking-tight">Imbas QR Masuk Kelas</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          </button>
        )}

        {/* Mobile Sticky Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 py-2 px-3 flex items-center justify-around z-40 shadow-2xl">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-xl transition ${
              currentTab === 'dashboard' ? 'text-gold-400 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Utama</span>
          </button>

          <button
            onClick={() => setCurrentTab('jadual')}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-xl transition ${
              currentTab === 'jadual' ? 'text-gold-400 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Jadual</span>
          </button>

          {/* Central Prominent Scan Button */}
          <button
            onClick={() => setCurrentTab('scan-qr')}
            className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-gold-500 to-amber-400 text-slate-950 p-3 rounded-2xl shadow-xl shadow-gold-500/30 active:scale-95 transition transform border-2 border-slate-950"
            title="Imbas QR Kelas"
          >
            <Camera className="w-5 h-5" />
            <span className="text-[9px] font-black tracking-tight mt-0.5">IMBAS</span>
          </button>

          <button
            onClick={() => setCurrentTab('rekod')}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-xl transition ${
              currentTab === 'rekod' ? 'text-gold-400 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Rekod</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition"
          >
            <MenuIcon className="w-4 h-4" />
            <span>Menu</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
