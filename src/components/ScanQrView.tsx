import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { 
  Camera, 
  Shield, 
  QrCode, 
  RefreshCw, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  SwitchCamera,
  Smartphone,
  History,
  Clock,
  Calendar
} from 'lucide-react';
import { ClassItem, SessionData, AttendanceRecord } from '../types';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { evaluateScanTiming, formatSlotBadgeLabel } from '../utils/attendanceTiming';

interface ScanQrViewProps {
  classes: ClassItem[];
  session: SessionData;
  onScanSuccess: (className: string) => void;
  records?: AttendanceRecord[];
  toleransiMinit?: number;
}

export const ScanQrView: React.FC<ScanQrViewProps> = ({
  classes,
  session,
  onScanSuccess,
  records = [],
  toleransiMinit = 5
}) => {
  const [nowTime, setNowTime] = useState<Date>(() => new Date());
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [lastScannedResult, setLastScannedResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // User's recent attendance records (instant proof & verification that teacher's scan was saved)
  const myRecords = useMemo(() => {
    const teacherName = (session?.nama || '').trim().toLowerCase();
    return (records || [])
      .filter(r => {
        const recordGuru = (r.guru || '').trim().toLowerCase();
        return recordGuru.includes(teacherName) || teacherName.includes(recordGuru) || recordGuru === teacherName;
      })
      .slice(0, 5);
  }, [records, session?.nama]);

  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timingEval = useMemo(
    () => evaluateScanTiming(nowTime, toleransiMinit, 5),
    [nowTime, toleransiMinit]
  );
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const retryTimeoutRef = useRef<any>(null);
  const containerId = 'gtepat-qr-camera-stream';

  // Play crisp audio beep
  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);

      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  // Decode and match class
  const handleDecoded = useCallback((decodedText: string) => {
    if (isProcessing) return;
    setScanError(null);
    setIsProcessing(true);
    playBeep();
    setLastScannedResult(decodedText);

    // Stop scanner if active
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(() => {});
      setScannerActive(false);
    }

    let cleanText = decodedText.trim().toUpperCase();

    // Check if the QR payload is a URL (e.g., https://.../?scan=1JINGGA or ?code=SKK-2026-1JINGGA)
    try {
      if (decodedText.includes('?') || decodedText.startsWith('http')) {
        const parsedUrl = new URL(decodedText, window.location.href);
        const scanParam = parsedUrl.searchParams.get('scan') || 
                          parsedUrl.searchParams.get('kelas') || 
                          parsedUrl.searchParams.get('class') || 
                          parsedUrl.searchParams.get('code') ||
                          parsedUrl.searchParams.get('qr');
        if (scanParam) {
          cleanText = scanParam.trim().toUpperCase();
        }
      }
    } catch {
      // fallback to original text
    }

    // Match class accurately
    const matched = classes.find(c => {
      const cUpper = c.nama.toUpperCase();
      const cCode = (c.qr_code || `SKK-2026-${cUpper.replace(/\s+/g, '')}`).toUpperCase();
      const cleanNoSpace = cleanText.replace(/[\s\-_]/g, '');
      const cNoSpace = cUpper.replace(/[\s\-_]/g, '');

      return cleanText === cCode ||
             cleanText === cUpper ||
             cleanNoSpace === cNoSpace ||
             cleanText.includes(cCode) ||
             cleanText.includes(cUpper) ||
             cleanNoSpace.includes(cNoSpace) ||
             (c.darjah && cleanText.includes(`TAHUN${c.darjah}`) && cleanText.includes(cUpper.split(' ')[1] || ''));
    });

    const resolvedClassName = matched ? matched.nama : (classes[0]?.nama || '1 JINGGA');
    
    setTimeout(() => {
      onScanSuccess(resolvedClassName);
    }, 700);
  }, [classes, isProcessing, onScanSuccess]);

  // Stop camera
  const stopScanner = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      setScannerActive(false);
    } catch (e) {
      console.warn('Error stopping scanner:', e);
    }
  };

  // Request camera permission explicitly via user gesture
  const handleRequestCameraPermission = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: facingMode } 
        });
        stream.getTracks().forEach(t => t.stop());
      }
      await startScanner();
    } catch (err: any) {
      console.warn('Camera request error:', err);
      setCameraError('Kebenaran kamera tidak diberikan atau disekat oleh pelayar. Sila benarkan akses kamera pada pelayar telefon anda dan tekan "Aktifkan Kamera Sekarang".');
    }
  };

  // Start camera with auto-mounting retry loop
  const startScanner = async () => {
    setCameraError(null);
    setIsProcessing(false);

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    let attempts = 0;
    const attemptStart = async () => {
      const containerEl = document.getElementById(containerId);
      if (!containerEl) {
        if (attempts < 15) {
          attempts++;
          retryTimeoutRef.current = setTimeout(attemptStart, 100);
        } else {
          setCameraError('Ruang paparan kamera tidak dapat dimuatkan. Sila tekan butang "Aktifkan Kamera Sekarang" di bawah.');
        }
        return;
      }

      try {
        await stopScanner();

        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(containerId, {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false
          });
        }

        // Fetch cameras list
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setAvailableCameras(devices);
            if (!selectedCameraId) {
              const backCam = devices.find(d => 
                d.label.toLowerCase().includes('back') || 
                d.label.toLowerCase().includes('rear') || 
                d.label.toLowerCase().includes('environment')
              );
              setSelectedCameraId(backCam ? backCam.id : devices[0].id);
            }
          }
        } catch (err) {
          console.warn('Could not enumerate cameras:', err);
        }

        const cameraConfig = selectedCameraId 
          ? { deviceId: { exact: selectedCameraId } }
          : { facingMode: facingMode };

        await scannerRef.current.start(
          cameraConfig,
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const qrboxSize = Math.floor(minEdge * 0.75);
              return {
                width: qrboxSize,
                height: qrboxSize
              };
            },
            aspectRatio: 1.0
          },
          (decodedText) => {
            handleDecoded(decodedText);
          },
          () => {
            // frame scanning
          }
        );

        setScannerActive(true);
      } catch (err: any) {
        console.warn('Scanner start error:', err);
        setScannerActive(false);
        const errMsg = err?.message || String(err);
        if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
          setCameraError('Kebenaran kamera diperlukan. Sila tekan butang "Aktifkan Kamera Sekarang" di bawah dan benarkan akses kamera.');
        } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
          setCameraError('Tiada kamera dikesan pada peranti ini. Sila pastikan peranti mempunyai kamera yang berfungsi.');
        } else if (errMsg.includes('NotReadableError') || errMsg.includes('Could not start video source')) {
          setCameraError('Kamera sedang digunakan oleh aplikasi lain.');
        } else {
          setCameraError('Kamera tidak aktif dalam paparan ini. Sila tekan "Aktifkan Kamera Sekarang" atau muat naik gambar Kod QR.');
        }
      }
    };

    attemptStart();
  };

  // Toggle Camera Facing
  const toggleCameraFacing = async () => {
    await stopScanner();
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
    setSelectedCameraId('');
  };

  // Switch Selected Camera
  const handleCameraChange = async (newCameraId: string) => {
    setSelectedCameraId(newCameraId);
    await stopScanner();
  };

  // Start on mount
  useEffect(() => {
    startScanner();
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [facingMode, selectedCameraId]);

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId);
      }
      const result = await scannerRef.current.scanFile(file, true);
      handleDecoded(result);
    } catch {
      setScanError('Kod QR tidak dapat dibaca dari gambar yang dimuat naik. Sila pastikan gambar terang, jelas dan berfokus.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">
      {/* Top Banner Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
        <div className="w-14 h-14 bg-gradient-to-tr from-gold-500 to-amber-400 text-slate-950 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2.5 shadow-md shadow-gold-500/20">
          <Camera className="w-7 h-7 text-slate-950" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kepawa-50 text-kepawa-800 text-xs font-black uppercase mb-1">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          <span>PENGIMBAS KEHADIRAN PdP G-TEPAT 2026</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Imbas Kod QR Pintu Bilik Darjah
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
          Halakan kamera ke <strong>Poster Kod QR di pintu kelas</strong> semasa masuk untuk merekod kehadiran tepat pada masanya.
        </p>

        {/* Live Scan Window Indicator (±5 Minutes Around 07:00 & Slot Start) */}
        <div className={`mt-3.5 p-3 rounded-2xl border text-left max-w-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
          timingEval.status === 'TEPAT MASA'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-start gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              timingEval.status === 'TEPAT MASA' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-[11px] leading-snug">
              <div className="font-black flex flex-wrap items-center gap-1.5">
                <span>
                  {timingEval.isOutsideSchoolHours
                    ? `Sesi Utama 7.00 Pagi (${timingEval.activeSlot.id})`
                    : `${timingEval.activeSlot.id} (${timingEval.activeSlot.code})`}
                </span>
                <span className="font-mono px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 text-[10px] text-slate-800">
                  {nowTime.toLocaleTimeString('en-GB', { hour12: false })}
                </span>
              </div>
              <div className="text-[11px] mt-0.5 font-medium text-slate-700">
                Zon Tepat Masa (±5 min): <strong>{timingEval.windowDisplay}</strong> &bull; Sesi 7:00 PG dibuka <strong>06:55 – 07:05</strong>
              </div>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide shrink-0 ${
            timingEval.status === 'TEPAT MASA'
              ? 'bg-emerald-600 text-white'
              : 'bg-amber-600 text-white'
          }`}>
            {timingEval.status === 'TEPAT MASA' ? 'Zon Tepat Masa' : 'Melebihi +5 Min'}
          </span>
        </div>

        {/* Tab Selection Modes */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 p-1.5 bg-slate-100 rounded-2xl max-w-lg mx-auto">
          <button
            type="button"
            onClick={startScanner}
            className="py-2 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 bg-white text-slate-900 shadow-sm border border-slate-200 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Kamera Langsung</span>
          </button>
        </div>
      </div>

      {/* Main Camera Viewfinder Card */}
      <div className="bg-slate-950 rounded-3xl p-4 sm:p-5 border-2 border-slate-800 shadow-2xl text-white text-center relative overflow-hidden">
          {/* Top Camera Controls Bar */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${scannerActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="font-bold text-slate-200">
                {scannerActive ? 'Kamera Pengimbas Aktif' : 'Kamera Bersedia'}
              </span>
            </div>

            {/* Camera Controls */}
            <div className="flex items-center gap-2">
              {availableCameras.length > 1 && (
                <select
                  value={selectedCameraId}
                  onChange={(e) => handleCameraChange(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-[11px] font-bold rounded-xl px-2 py-1 border border-slate-700 focus:outline-none"
                >
                  {availableCameras.map(cam => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Kamera ${cam.id.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={toggleCameraFacing}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition"
                title="Tukar Kamera Belakang / Hadapan"
              >
                <SwitchCamera className="w-3.5 h-3.5" />
                <span>{facingMode === 'environment' ? 'Belakang' : 'Depan'}</span>
              </button>

              <button
                onClick={startScanner}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="Mulakan Semula Kamera"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Viewfinder Container */}
          <div className="relative w-full min-h-[280px] max-h-[380px] rounded-2xl bg-slate-900 overflow-hidden flex flex-col items-center justify-center border border-slate-800">
            <div id={containerId} className="w-full h-full overflow-hidden" />

            {/* Laser scanning crosshairs */}
            {scannerActive && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-52 h-52 sm:w-60 sm:h-60 border-2 border-gold-400/90 rounded-2xl relative shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-gold-400 -mt-1 -ml-1 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-gold-400 -mt-1 -mr-1 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-gold-400 -mb-1 -ml-1 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-gold-400 -mb-1 -mr-1 rounded-br-lg" />
                  
                  {/* Scanning Laser Line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent shadow-[0_0_12px_#fbbf24] animate-pulse mt-24" />
                </div>
                <p className="text-[11px] font-bold text-slate-300 mt-4 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
                  Selaraskan Kod QR Kelas ke dalam kotak di atas
                </p>
              </div>
            )}

            {/* Fallback / Error view */}
            {!scannerActive && (
              <div className="p-6 text-center z-10 space-y-3">
                <QrCode className="w-14 h-14 text-gold-400 mb-2 animate-pulse mx-auto" />
                <p className="text-sm font-black text-slate-200">
                  {cameraError ? 'Kebenaran Kamera Diperlukan' : 'Menghidupkan Pengimbas Kamera...'}
                </p>
                {cameraError && (
                  <p className="text-xs text-amber-300 max-w-sm mx-auto bg-amber-950/70 p-3 rounded-2xl border border-amber-800 leading-relaxed font-semibold">
                    {cameraError}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={handleRequestCameraPermission}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 rounded-xl text-xs font-black shadow-lg transition inline-flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Camera className="w-4 h-4 text-slate-950" />
                    <span>Aktifkan Kamera Sekarang</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guru: <strong className="text-white">{session.nama}</strong></span>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-gold-400 hover:text-gold-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Muat Naik Fail QR</span>
            </button>
          </div>
        </div>

      {/* Hidden File Input for Image Scanning */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Scanned Result Card */}
      {lastScannedResult && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-3xl flex items-center gap-3 text-emerald-950 animate-fade-in shadow-md">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-xs">
            <div className="font-black text-sm text-emerald-900">Kod QR Berjaya Dikesan & Disahkan!</div>
            <div className="font-mono text-xs text-emerald-700 mt-0.5">Payload: {lastScannedResult}</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">Merekod kehadiran PdP anda sekarang...</div>
          </div>
        </div>
      )}

      {/* Inline Error Banner (replaces browser alert) */}
      {scanError && (
        <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start justify-between gap-3 text-red-900 text-xs shadow-sm">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="font-bold leading-relaxed">{scanError}</span>
          </div>
          <button
            type="button"
            onClick={() => setScanError(null)}
            className="text-red-500 hover:text-red-800 font-black px-1.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Teacher's Live Attendance Feed / Proof of Scan */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <History className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Rekod Imbasan Kehadiran Anda
              </h4>
              <p className="text-[11px] text-slate-500">
                Pengesahan masa nyata bagi <strong className="text-slate-800">{session.nama}</strong>:
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider self-start sm:self-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Tersimpan & Disahkan
          </span>
        </div>

        {myRecords.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2 opacity-60" />
            <p className="font-bold text-slate-700">Belum ada imbasan PdP hari ini.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Sila imbas kod QR kelas di atas untuk mula merekod kehadiran kelas anda.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myRecords.map((rec) => (
              <div key={rec.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                    rec.status === 'TEPAT MASA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 flex items-center gap-2">
                      <span>{rec.kelas}</span>
                      <span className="text-[11px] font-bold text-slate-500">({rec.subjek})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {rec.tarikh}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono font-bold text-slate-600"><Clock className="w-3 h-3" /> {rec.masa}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                        {formatSlotBadgeLabel(rec.slotId)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    rec.status === 'TEPAT MASA'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {rec.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guide Card: How it works */}
      <div className="p-5 bg-gradient-to-br from-slate-900 to-kepawa-950 text-white rounded-3xl border border-slate-800 shadow-lg text-xs space-y-3">
        <div className="flex items-center gap-2 text-gold-400 font-black uppercase tracking-wider text-xs">
          <Smartphone className="w-4 h-4" />
          <span>Panduan Penggunaan Kod QR G-TEPAT 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <h5 className="font-black text-white text-xs mb-1 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-gold-400 text-slate-950 text-[10px] font-black flex items-center justify-center">1</span>
              Gunakan Menu "Imbas QR Kelas"
            </h5>
            <p className="text-[11px] leading-relaxed">
              Buka aplikasi G-TEPAT pada pelayar telefon pintar anda (Chrome/Safari), tekan menu <strong>Imbas QR Kelas</strong>, dan halakan kamera ke poster pintu bilik darjah.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <h5 className="font-black text-white text-xs mb-1 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black flex items-center justify-center">2</span>
              Imbas Pautan Web Pintar
            </h5>
            <p className="text-[11px] leading-relaxed">
              Jika menggunakan kamera biasa telefon anda (cth: Samsung Camera / Google Lens), imbas Kod QR berformat <em>Pautan Web</em> yang akan membuka aplikasi terus di telefon anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
