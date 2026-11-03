import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Camera, 
  Zap, 
  Shield, 
  QrCode, 
  RefreshCw, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Volume2,
  SwitchCamera,
  Info,
  ExternalLink,
  Smartphone,
  Check,
  Video,
  VideoOff
} from 'lucide-react';
import { ClassItem, SessionData } from '../types';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';

interface ScanQrViewProps {
  classes: ClassItem[];
  session: SessionData;
  onScanSuccess: (className: string) => void;
}

export const ScanQrView: React.FC<ScanQrViewProps> = ({
  classes,
  session,
  onScanSuccess
}) => {
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [lastScannedResult, setLastScannedResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanMethod, setScanMethod] = useState<'camera' | 'simulation' | 'manual'>('camera');
  const [simulatedClass, setSimulatedClass] = useState<string>(classes.find(c => c.darjah === 5)?.nama || classes[0]?.nama || '5 KUNING');
  
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
      setCameraError('Kebenaran kamera tidak diberikan atau disekat oleh pelayar. Anda boleh menggunakan "Simulasi Pengimbas (Aktif)" atau "Pilihan Pantas 1-Sentuhan".');
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
          setCameraError('Ruang paparan kamera tidak dapat dimuatkan. Sila gunakan "Simulasi Pengimbas" atau "Pilihan Pantas 1-Sentuhan".');
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
          setCameraError('Tiada kamera dikesan pada peranti ini. Anda boleh menggunakan "Simulasi Pengimbas" atau "Pilihan Pantas".');
        } else if (errMsg.includes('NotReadableError') || errMsg.includes('Could not start video source')) {
          setCameraError('Kamera sedang digunakan oleh aplikasi lain.');
        } else {
          setCameraError('Kamera tidak aktif dalam paparan ini. Anda boleh mengaktifkan semula atau menggunakan "Simulasi Pengimbas (Aktif)".');
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

  // Start on mount / mode change
  useEffect(() => {
    if (scanMethod === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [facingMode, selectedCameraId, scanMethod]);

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId);
      }
      const result = await scannerRef.current.scanFile(file, true);
      handleDecoded(result);
    } catch (err) {
      alert('Kod QR tidak dapat dibaca dari gambar yang dimuat naik. Sila pastikan gambar terang dan berfokus.');
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

        {/* Tab Selection Modes */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 p-1.5 bg-slate-100 rounded-2xl max-w-lg mx-auto">
          <button
            onClick={() => setScanMethod('camera')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              scanMethod === 'camera'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Kamera Langsung</span>
          </button>

          <button
            onClick={() => setScanMethod('simulation')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              scanMethod === 'simulation'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-gold-400" />
            <span>Simulasi Pengimbas</span>
            <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded text-[9px] font-black">
              AKTIF
            </span>
          </button>

          <button
            onClick={() => setScanMethod('manual')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              scanMethod === 'manual'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Sentuhan Kelas</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2 px-3 rounded-xl text-xs font-black text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-purple-600" />
            <span>Foto QR</span>
          </button>
        </div>
      </div>

      {/* Main Camera Viewfinder Card */}
      {scanMethod === 'camera' && (
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
                  <button
                    onClick={() => setScanMethod('simulation')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-gold-400 rounded-xl text-xs font-black transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-gold-400" />
                    <span>Gunakan Simulasi Pengimbas</span>
                  </button>
                  <button
                    onClick={() => setScanMethod('manual')}
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    1-Sentuhan Kelas
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
      )}

      {/* Interactive Simulation Viewfinder Card */}
      {scanMethod === 'simulation' && (
        <div className="bg-slate-950 rounded-3xl p-4 sm:p-6 border-2 border-slate-800 shadow-2xl text-white text-center relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-emerald-400">PENGIMBAS SIMULASI AKTIF (MASA NYATA)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 font-mono text-[10px] font-bold">
              KOD-SIAP-SEDIA
            </span>
          </div>

          {/* Virtual Viewfinder */}
          <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background scanner grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

            {/* Simulated Crosshairs box */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-gold-400/90 rounded-2xl relative shadow-[0_0_25px_rgba(251,191,36,0.25)] flex flex-col items-center justify-center z-10 bg-slate-900/60 backdrop-blur-xs">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-gold-400 -mt-1 -ml-1 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-gold-400 -mt-1 -mr-1 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-gold-400 -mb-1 -ml-1 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-gold-400 -mb-1 -mr-1 rounded-br-lg" />

              {/* Target Class Name Display inside QR */}
              <QrCode className="w-16 h-16 text-gold-400/80 mb-1" />
              <div className="px-2.5 py-1 rounded-lg bg-gold-400 text-slate-950 font-black text-xs">
                {simulatedClass}
              </div>
              <span className="font-mono text-[10px] text-slate-300 mt-1 font-bold">
                SKK-2026-{simulatedClass.replace(/\s+/g, '')}
              </span>

              {/* Scanning Laser Line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent shadow-[0_0_14px_#fbbf24] animate-pulse absolute top-1/2 -translate-y-1/2" />
            </div>

            <p className="text-[11px] font-bold text-slate-300 mt-3 z-10 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
              Pengimbas mengesan kod pintu bilik darjah: <span className="text-gold-400 font-black">{simulatedClass}</span>
            </p>
          </div>

          {/* Class target selector */}
          <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-left">
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-2">
              Pilih Bilik Darjah Sasaran Pengimbas:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {classes.map(c => {
                const isSelected = simulatedClass === c.nama;
                const isTahun5 = c.darjah === 5;
                const isTahun4 = c.darjah === 4;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSimulatedClass(c.nama)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gold-500 text-slate-950 border-gold-400 font-black shadow-md'
                        : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-800 font-bold'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span>{c.nama}</span>
                      <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${isSelected ? 'bg-slate-950 text-gold-400' : 'bg-slate-900 text-slate-400'}`}>
                        T{c.darjah}
                      </span>
                    </div>
                    {isTahun5 && (
                      <span className={`text-[9px] mt-1 font-bold ${isSelected ? 'text-slate-900' : 'text-amber-400'}`}>
                        Mohamad Aiman
                      </span>
                    )}
                    {isTahun4 && (
                      <span className={`text-[9px] mt-1 font-bold ${isSelected ? 'text-slate-900' : 'text-emerald-400'}`}>
                        Mohamad Riman
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trigger Scan Button */}
          <button
            type="button"
            onClick={() => handleDecoded(`SKK-2026-${simulatedClass.replace(/\s+/g, '')}`)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transform active:scale-98 transition cursor-pointer"
          >
            <Zap className="w-5 h-5 text-slate-950 animate-bounce" />
            <span>IMBAS KOD QR {simulatedClass} SEKARANG</span>
          </button>
        </div>
      )}

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

      {/* Manual / Quick Classroom Selection */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center">
              <Zap className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Pilihan Pantas 1-Sentuhan Masuk Bilik Darjah
              </h4>
              <p className="text-[11px] text-slate-500">
                Pilih bilik darjah anda untuk merekod kehadiran PdP serta-merta tanpa perlu kamera:
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider self-start sm:self-auto">
            6 Kelas Aktif
          </span>
        </div>

        {/* Manual Code Input Bar */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-manual-qr-code"
              placeholder="Masukkan kod pintu cth: SKK-2026-4HIJAU atau 5 KUNING..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.currentTarget.value || '').trim();
                  if (val) {
                    handleDecoded(val);
                    e.currentTarget.value = '';
                  }
                }
              }}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-kepawa-500"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('input-manual-qr-code') as HTMLInputElement;
              if (input && input.value.trim()) {
                handleDecoded(input.value.trim());
                input.value = '';
              } else {
                alert('Sila masukkan kod kelas atau pilih daripada senarai di bawah.');
              }
            }}
            className="w-full sm:w-auto px-4 py-2 bg-kepawa-700 hover:bg-kepawa-800 text-white font-black text-xs rounded-xl shadow-sm transition cursor-pointer shrink-0"
          >
            Masuk Kelas
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {classes.map((cls) => {
            const isTahun5 = cls.darjah === 5;
            const isTahun4 = cls.darjah === 4;

            return (
              <button
                key={cls.id}
                onClick={() => {
                  playBeep();
                  onScanSuccess(cls.nama);
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between group shadow-sm active:scale-95 cursor-pointer relative overflow-hidden ${
                  isTahun5 
                    ? 'bg-amber-50/60 hover:bg-amber-100/70 border-amber-300' 
                    : isTahun4 
                      ? 'bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-300'
                      : 'bg-slate-50 hover:bg-kepawa-50 hover:border-kepawa-400 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-kepawa-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {cls.darjah}
                    </span>
                    <span className="text-sm font-black text-slate-900 group-hover:text-kepawa-800">
                      {cls.nama}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-1 truncate max-w-[150px]">
                    {cls.guru_kelas}
                  </div>
                  {isTahun5 && (
                    <div className="text-[10px] font-black text-amber-800 mt-1 flex items-center gap-1">
                      <span>⭐ Murid: Mohamad Aiman</span>
                    </div>
                  )}
                  {isTahun4 && (
                    <div className="text-[10px] font-black text-emerald-800 mt-1 flex items-center gap-1">
                      <span>⭐ Murid: Mohamad Riman</span>
                    </div>
                  )}
                </div>

                <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-kepawa-600 group-hover:text-white border border-slate-200 group-hover:border-kepawa-600 flex items-center justify-center text-slate-400 transition shadow-xs shrink-0">
                  <Check className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
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
