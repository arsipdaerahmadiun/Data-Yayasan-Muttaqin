import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  Copy, 
  Check, 
  ExternalLink,
  Code2,
  Database,
  Terminal,
  Zap,
  ChevronDown,
  ChevronUp,
  X,
  Sliders,
  Sparkles,
  Link,
  Table,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Search,
  ArrowRight,
  Info,
  QrCode,
  Smartphone,
  Laptop,
  ClipboardPaste,
  Share2
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { DatabaseStore } from "../types";
import { 
  getStoredSheetsConfig, 
  saveSheetsConfig, 
  testSheetsConnection, 
  pushAllDataToSheets, 
  pullAllDataFromSheets, 
  GOOGLE_APPS_SCRIPT_CODE,
  isSheetsConfigured,
  isSheetsAutoSyncEnabled,
  setSheetsAutoSyncEnabled,
  validateSheetsUrl,
  diagnoseSheetsConnection,
  fetchRemoteSheetsConfig,
  generateDevicePairingUrl
} from "../lib/sheets";

interface GoogleSheetsSyncCardProps {
  fullData: DatabaseStore;
  onRestoreData: (data: DatabaseStore) => void;
}

export const GoogleSheetsSyncCard: React.FC<GoogleSheetsSyncCardProps> = ({ fullData, onRestoreData }) => {
  const initialConfig = getStoredSheetsConfig();
  const [webAppUrl, setWebAppUrl] = useState(initialConfig.webAppUrl);
  const [sheetDocUrl, setSheetDocUrl] = useState(initialConfig.sheetDocUrl);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const [isAutoSync, setIsAutoSync] = useState<boolean>(() => isSheetsAutoSyncEnabled());
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  // Multi-device sharing & QR code modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedPairingUrl, setCopiedPairingUrl] = useState(false);
  const [isUrlTouched, setIsUrlTouched] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState(false);

  // Diagnostic states
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    success: boolean;
    step?: string;
    reason?: string;
    solution?: string;
    message?: string;
  } | null>(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  const [banner, setBanner] = useState<{
    type: "success" | "error" | "info";
    title?: string;
    message: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);

  const [showScriptModal, setShowScriptModal] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

  // Real-time URL feedback (softened on initial empty load)
  const urlValidation = validateSheetsUrl(webAppUrl, isUrlTouched);

  // Initial connection test on mount & fetch shared remote spreadsheet config
  useEffect(() => {
    async function initCheck() {
      // 1. If we already have local config, test it
      if (webAppUrl) {
        handleSilentCheck();
      }

      // 2. Fetch shared single spreadsheet config from server database
      try {
        const remote = await fetchRemoteSheetsConfig();
        if (remote && remote.webAppUrl) {
          setWebAppUrl(remote.webAppUrl);
          if (remote.sheetDocUrl) setSheetDocUrl(remote.sheetDocUrl);
          if (remote.autoSync !== undefined) setIsAutoSync(remote.autoSync);

          const res = await testSheetsConnection(remote.webAppUrl);
          setIsConnected(res.success);
          if (res.sheetTitle) setSheetTitle(res.sheetTitle);
          if (res.sheetDocUrl && !sheetDocUrl) setSheetDocUrl(res.sheetDocUrl);
        }
      } catch (e) {
        console.warn("Silent remote config check:", e);
      }
    }

    initCheck();
  }, []);

  const handleSilentCheck = async () => {
    try {
      const res = await testSheetsConnection();
      setIsConnected(res.success);
      if (res.sheetTitle) setSheetTitle(res.sheetTitle);
      if (res.sheetDocUrl && !sheetDocUrl) setSheetDocUrl(res.sheetDocUrl);
    } catch {
      setIsConnected(false);
    }
  };

  const handleToggleAutoSync = () => {
    const next = !isAutoSync;
    setIsAutoSync(next);
    setSheetsAutoSyncEnabled(next);
    if (next) {
      handlePushData();
    } else {
      setBanner({
        type: "info",
        message: "Auto-Sync dinonaktifkan. Data tetap disimpan di memori lokal peramban Anda."
      });
    }
  };

  const handleRunDiagnosis = async () => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    try {
      const result = await diagnoseSheetsConnection(webAppUrl);
      setDiagnosticResult(result);
      if (result.success) {
        setIsConnected(true);
        if (result.sheetTitle) setSheetTitle(result.sheetTitle);
        if (result.sheetDocUrl && !sheetDocUrl) setSheetDocUrl(result.sheetDocUrl);
      } else {
        setIsConnected(false);
      }
    } catch (err: any) {
      setDiagnosticResult({
        success: false,
        reason: err.message || "Gagal melakukan diagnosa",
        solution: "Pastikan koneksi internet stabil dan periksa URL Apps Script Anda."
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const trimmed = text.trim();
        setIsUrlTouched(true);
        if (trimmed.includes("script.google.com/macros/s/")) {
          setWebAppUrl(trimmed);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
        } else if (trimmed.includes("docs.google.com/spreadsheets")) {
          setSheetDocUrl(trimmed);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
        } else {
          setWebAppUrl(trimmed);
        }
      }
    } catch (err) {
      console.warn("Clipboard read error:", err);
    }
  };

  const handleCopyPairingUrl = () => {
    const url = generateDevicePairingUrl(webAppUrl, sheetDocUrl);
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedPairingUrl(true);
    setTimeout(() => setCopiedPairingUrl(false), 2500);
  };

  const handleSaveConfig = async () => {
    setIsUrlTouched(true);
    saveSheetsConfig(webAppUrl, sheetDocUrl, isAutoSync);

    setBanner({
      type: "info",
      message: "Menyimpan konfigurasi 1 Spreadsheet ke server dan memverifikasi koneksi..."
    });

    try {
      setIsTesting(true);
      const res = await testSheetsConnection(webAppUrl);
      setIsConnected(res.success);
      if (res.sheetTitle) setSheetTitle(res.sheetTitle);
      if (res.sheetDocUrl && !sheetDocUrl) setSheetDocUrl(res.sheetDocUrl);

      if (res.success) {
        setBanner({
          type: "success",
          title: "1 Google Spreadsheet Berhasil Dihubungkan",
          message: `Berhasil terhubung ke file: "${res.sheetTitle || 'Google Spreadsheet Yayasan'}". Konfigurasi telah disimpan ke server sehingga seluruh perangkat (HP, laptop, tablet) langsung tersinkron ke dokumen yang sama tanpa perlu input URL lagi!`
        });
      } else {
        setBanner({
          type: "error",
          title: "Koneksi Belum Berhasil",
          message: res.message,
          action: {
            label: "Diagnosa Masalah",
            onClick: () => {
              setShowTroubleshoot(true);
              handleRunDiagnosis();
            }
          }
        });
      }
    } catch (err: any) {
      setIsConnected(false);
      setBanner({
        type: "error",
        title: "Koneksi Gagal",
        message: err.message || "Gagal menghubungi Google Apps Script",
        action: {
          label: "Diagnosa & Panduan Perbaikan",
          onClick: () => {
            setShowTroubleshoot(true);
            handleRunDiagnosis();
          }
        }
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushData = async () => {
    if (!webAppUrl) {
      setBanner({
        type: "error",
        message: "Harap isi URL Google Apps Script Web App terlebih dahulu pada tombol Pengaturan."
      });
      setIsConfigOpen(true);
      return;
    }

    setIsPushing(true);
    setBanner({
      type: "info",
      message: "Sedang mengirim dan menyinkronkan seluruh data ke Google Spreadsheet..."
    });

    try {
      const res = await pushAllDataToSheets(fullData, webAppUrl);
      if (res.success) {
        setIsConnected(true);
        setLastSyncedTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        setBanner({
          type: "success",
          title: "Sinkronisasi Berhasil",
          message: res.message
        });
      } else {
        setBanner({
          type: "error",
          title: "Sinkronisasi Gagal",
          message: res.message
        });
      }
    } catch (err: any) {
      setBanner({
        type: "error",
        message: err.message || "Terjadi kesalahan saat sinkronisasi ke Google Spreadsheet."
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullData = async () => {
    if (!webAppUrl) {
      setBanner({
        type: "error",
        message: "Harap isi URL Google Apps Script Web App terlebih dahulu."
      });
      setIsConfigOpen(true);
      return;
    }

    setIsPulling(true);
    setBanner({
      type: "info",
      message: "Sedang menarik data terbaru dari Google Spreadsheet..."
    });

    try {
      const res = await pullAllDataFromSheets(webAppUrl);
      if (res.success && res.data) {
        setIsConnected(true);
        const d = res.data;
        const mergedData: DatabaseStore = {
          ...fullData,
          profile: d.profile ? { ...fullData.profile, ...d.profile } : fullData.profile,
          assets: Array.isArray(d.assets) ? d.assets : fullData.assets,
          employees: Array.isArray(d.employees) ? d.employees : fullData.employees,
          students: Array.isArray(d.students) ? d.students : fullData.students,
          donations: Array.isArray(d.donations) ? d.donations : fullData.donations,
          assetTransfers: Array.isArray(d.assetTransfers) ? d.assetTransfers : (fullData.assetTransfers || []),
          borrowedDocs: Array.isArray(d.borrowedDocs) ? d.borrowedDocs : (fullData.borrowedDocs || []),
          meetings: Array.isArray(d.meetings) ? d.meetings : (fullData.meetings || [])
        };

        onRestoreData(mergedData);
        setLastSyncedTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

        setBanner({
          type: "success",
          title: "Data Berhasil Ditarik",
          message: res.message
        });
      } else {
        setBanner({
          type: "error",
          title: "Gagal Mengambil Data",
          message: res.message
        });
      }
    } catch (err: any) {
      setBanner({
        type: "error",
        title: "Koneksi Bermasalah",
        message: err.message || "Gagal menghubungi Google Apps Script",
        action: {
          label: "Periksa Konfigurasi",
          onClick: () => setIsConfigOpen(true)
        }
      });
    } finally {
      setIsPulling(false);
    }
  };

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl p-6 border border-emerald-100/80 shadow-xs space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-[#2b3036]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Google Spreadsheet Cloud Database</h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                Primary DB
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Basis data langsung tersimpan pada file Google Spreadsheet Anda (Aset, Pegawai, Siswa, Donasi, Profil).
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {isConnected === true ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 rounded-full text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Terhubung & Aktif</span>
            </div>
          ) : isConnected === false ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 rounded-full text-xs font-semibold text-amber-700">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Belum Terhubung</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#22272e] border border-slate-200 rounded-full text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Memeriksa Status...</span>
            </div>
          )}

          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-[#252a30] rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Atur URL Web App Google Spreadsheet"
          >
            <Sliders className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Info & Direct Spreadsheet Link Banner */}
      {isConnected && (
        <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
            <Table className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Nama Dokumen: <strong className="font-semibold">{sheetTitle || "Google Spreadsheet Yayasan"}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {sheetDocUrl && (
              <a
                href={sheetDocUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#252a30] border border-emerald-300 text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka di Google Drive</span>
              </a>
            )}
            <button
              onClick={() => setShowScriptModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#252a30] border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Kode Skrip (Code.gs)</span>
            </button>
          </div>
        </div>
      )}

      {/* Troubleshooting & Diagnostic Quick Helper Banner */}
      {!isConnected && (
        <div className="p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Belum Berhasil Terhubung ke Google Spreadsheet?
                </h4>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                  95% kendala koneksi disebabkan oleh 1 dari 4 hal teknis berikut di Google Apps Script.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsConfigOpen(true);
                  handleRunDiagnosis();
                }}
                disabled={isDiagnosing}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDiagnosing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mendiagnosa...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Diagnosa Masalah Saya</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowTroubleshoot(!showTroubleshoot)}
                className="p-1.5 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg cursor-pointer transition-colors"
                title="Lihat Rincian Penyebab"
              >
                {showTroubleshoot ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Diagnostic Result Callout */}
          {diagnosticResult && (
            <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
              diagnosticResult.success 
                ? "bg-emerald-50 border-emerald-300 text-emerald-900" 
                : "bg-white dark:bg-[#1a1d21] border-rose-300 dark:border-rose-900/50 text-slate-800 dark:text-slate-200 shadow-xs"
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {diagnosticResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>
                  {diagnosticResult.success 
                    ? "Hasil Diagnosa: Koneksi Berhasil Terverifikasi!" 
                    : `Hasil Diagnosa: ${diagnosticResult.reason || "Kendala Terdeteksi"}`}
                </span>
              </div>
              {diagnosticResult.solution && (
                <div className="p-2.5 bg-slate-50 dark:bg-[#252a30] rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] leading-relaxed">
                  <strong className="text-blue-600 dark:text-blue-400 block mb-0.5">Solusi yang harus dilakukan:</strong>
                  <span>{diagnosticResult.solution}</span>
                </div>
              )}
            </div>
          )}

          {/* Expandable 4-point Checklist */}
          {showTroubleshoot && (
            <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-white dark:bg-[#1a1d21] rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span>Salah Memasukkan Tautan (URL)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">
                  <strong className="text-rose-600">Salah:</strong> Memasukkan link file spreadsheet biasa (<code>docs.google.com/spreadsheets/...</code>) atau link editor skrip.<br />
                  <strong className="text-emerald-600">Benar:</strong> Harus Web App URL yang berakhiran <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">/exec</code>.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#1a1d21] rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span>Setelan Akses Masih "Only myself"</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">
                  Saat klik <em>Deploy &gt; New deployment &gt; Web app</em>, setelan <strong>"Who has access"</strong> wajib diubah ke <strong className="text-emerald-600">"Anyone" (Siapa saja)</strong>. Jika tetap "Only myself", Google akan menolak akses aplikasi.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#1a1d21] rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">3</span>
                  <span>Terjebak di Pop-up Izin Google</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">
                  Saat muncul layar <em>"Google hasn't verified this app"</em>, klik <strong>Advanced (Lanjutan)</strong> di kiri bawah &gt; klik <strong>Go to ... (unsafe) / Buka ... (tidak aman)</strong> &gt; klik <strong>Allow (Izinkan)</strong>.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#1a1d21] rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">4</span>
                  <span>Kode Belum Disimpan (Save) Sebelum Deploy</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">
                  Pastikan setelah menempel kode Apps Script, klik tombol ikon Disket (Save / Ctrl+S). Jika Anda mengedit kode, Anda harus membuat <strong>New deployment</strong> agar versi baru aktif.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unified Notification Banner */}
      {banner && (
        <div
          className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs transition-all ${
            banner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : banner.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {banner.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : banner.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-spin" />
            )}
            <div>
              {banner.title && <div className="font-bold mb-0.5">{banner.title}</div>}
              <div>{banner.message}</div>
              {banner.action && (
                <button
                  onClick={banner.action.onClick}
                  className="mt-2 text-xs font-bold underline cursor-pointer hover:opacity-80"
                >
                  {banner.action.label} →
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setBanner(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Push / Upload */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-[#2b3036] bg-slate-50/50 dark:bg-[#1f2429] flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <span>Unggah Semua Data ke Spreadsheet</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Menyimpan seluruh data inventaris, SDM, santri, dan laporan dari aplikasi ini langsung ke baris-baris Google Spreadsheet Anda.
            </p>
          </div>
          <button
            onClick={handlePushData}
            disabled={isPushing}
            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isPushing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan ke Spreadsheet...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Unggah ke Google Spreadsheet</span>
              </>
            )}
          </button>
        </div>

        {/* Card 2: Pull / Download */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-[#2b3036] bg-slate-50/50 dark:bg-[#1f2429] flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
              <DownloadCloud className="w-4 h-4 text-blue-600" />
              <span>Tarik Data dari Spreadsheet</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Mengambil data terbaru yang telah diedit langsung oleh staf di Google Spreadsheet ke dalam aplikasi ini.
            </p>
          </div>
          <button
            onClick={handlePullData}
            disabled={isPulling}
            className="w-full py-2 px-3 bg-white dark:bg-[#252a30] hover:bg-slate-100 text-slate-800 dark:text-white border border-slate-300 dark:border-[#383e47] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isPulling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Mengambil Data...</span>
              </>
            ) : (
              <>
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Tarik dari Google Spreadsheet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auto-Sync Toggle Bar */}
      <div className="p-3 bg-slate-50 dark:bg-[#1f2429] rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Zap className={`w-4 h-4 ${isAutoSync ? "text-amber-500" : "text-slate-400"}`} />
          <div>
            <span className="font-semibold text-slate-800 dark:text-white">Sinkronisasi Otomatis Real-Time (Auto-Sync)</span>
            <p className="text-[11px] text-slate-500">
              Setiap penambahan, pengubahan, atau penghapusan data akan langsung tersimpan otomatis ke Google Spreadsheet.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isAutoSync}
            onChange={handleToggleAutoSync}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {/* Collapsible Configuration Form */}
      {isConfigOpen && (
        <div className="p-4 bg-slate-50/80 dark:bg-[#1f2429] rounded-xl border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>Konfigurasi Koneksi Google Spreadsheet</span>
            </h4>
            <button
              onClick={() => setShowScriptModal(true)}
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Salin Skrip Apps Script</span>
            </button>
          </div>

          <div className="p-3 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">1 Spreadsheet untuk Seluruh Perangkat:</span>
              <p className="mt-0.5 text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Anda hanya perlu menyimpan URL skrip ini <strong>satu kali</strong>. Tautan otomatis tersimpan di server secara global. Saat Anda membuka web ini dari smartphone, tablet, atau laptop lain, semua perangkat langsung sinkron ke Google Spreadsheet yang sama tanpa perlu memasukkan link lagi!
              </p>
            </div>
          </div>

          {/* Quick Multi-Device Connect Banner */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/90 dark:border-blue-800/80 rounded-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h5 className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Sinkronisasi Antar Perangkat (HP / Laptop Lain)</span>
                </h5>
                <p className="text-[11px] text-blue-800 dark:text-blue-300 mt-0.5 leading-relaxed">
                  {webAppUrl
                    ? "Hubungkan smartphone Anda dalam hitungan detik via scan QR Code tanpa perlu mengetik ulang link panjang."
                    : "Membuka di perangkat baru? Anda bisa scan QR Code dari perangkat utama atau tempel URL dari clipboard."}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                {webAppUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Pindai QR di HP</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPairingUrl}
                      className="flex-1 sm:flex-none px-3 py-1.5 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      {copiedPairingUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copiedPairingUrl ? "Tersalin!" : "Salin Link HP"}</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>{pasteSuccess ? "Berhasil Ditempel!" : "Tempel URL dari Clipboard"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 dark:text-slate-300 font-medium">
                  Google Apps Script Web App URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>{pasteSuccess ? "Tersalin!" : "Tempel URL"}</span>
                  </button>
                  {webAppUrl && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      urlValidation.valid 
                        ? "bg-emerald-100 text-emerald-800" 
                        : urlValidation.error 
                          ? "bg-rose-100 text-rose-800" 
                          : "bg-amber-100 text-amber-800"
                    }`}>
                      {urlValidation.valid 
                        ? "✓ Format URL Valid" 
                        : urlValidation.error 
                          ? "✕ Format Salah" 
                          : "⚠️ Peringatan"}
                    </span>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={webAppUrl}
                onChange={(e) => {
                  setWebAppUrl(e.target.value);
                  setIsUrlTouched(true);
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                className={`w-full px-3 py-2 bg-white dark:bg-[#252a30] border rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-emerald-500 ${
                  urlValidation.error 
                    ? "border-rose-400 bg-rose-50/20" 
                    : urlValidation.warning 
                      ? "border-amber-400 bg-amber-50/20" 
                      : "border-slate-300"
                }`}
              />

              {/* Dynamic URL Hint / Warning / Error */}
              {urlValidation.error && (
                <div className="mt-1.5 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{urlValidation.error}</span>
                </div>
              )}

              {urlValidation.warning && !urlValidation.error && (
                <div className="mt-1.5 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{urlValidation.warning}</span>
                </div>
              )}

              <p className="text-[10px] text-slate-500 mt-1">
                Contoh: <code className="bg-slate-100 dark:bg-[#20252b] px-1 py-0.5 rounded font-mono text-slate-700 dark:text-slate-300">https://script.google.com/macros/s/AKfycb.../exec</code> (Diperoleh dari menu <em>Deploy &gt; New deployment &gt; Web app</em> dengan akses <strong>Anyone</strong>).
              </p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Tautan Lembar Kerja Spreadsheet (docs.google.com) <span className="text-slate-400 text-[10px] font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                value={sheetDocUrl}
                onChange={(e) => setSheetDocUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                className="w-full px-3 py-2 bg-white dark:bg-[#252a30] border border-slate-300 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Tautan lembar kerja Google Drive Anda untuk membuka spreadsheet langsung dengan satu klik.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
              <button
                type="button"
                onClick={handleRunDiagnosis}
                disabled={isDiagnosing || !webAppUrl}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDiagnosing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Mendiagnosa...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3 h-3" />
                    <span>Diagnosa URL Ini</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252a30] cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={isTesting}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Menguji Koneksi...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Simpan & Uji Koneksi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Script & Setup Guide Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Panduan Menghubungkan Google Spreadsheet ke Aplikasi
                </h3>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Hanya butuh 2 menit untuk mengaktifkan database Google Sheets Anda:</span>
                </div>
                <ol className="list-decimal pl-5 space-y-2.5 text-emerald-900 dark:text-emerald-300">
                  <li>
                    Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-700 dark:text-emerald-400">sheets.new</a> (atau buka file Google Spreadsheet yang ingin Anda gunakan).
                  </li>
                  <li>
                    Di menu atas Spreadsheet, klik <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                  </li>
                  <li>
                    Hapus semua kode bawaan di editor Apps Script, lalu klik tombol <strong>"Salin Semua Skrip (Code.gs)"</strong> di bawah ini dan tempelkan (Paste). Klik ikon Disket atau tekan <kbd className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[10px]">Ctrl + S</kbd> untuk Simpan.
                  </li>
                  <li className="p-2 bg-emerald-100/70 dark:bg-emerald-950/60 rounded-lg border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                    <strong>Uji Langsung:</strong> Anda dapat mengklik tombol <strong>"Run" (Jalankan)</strong> di toolbar atas editor Apps Script (fungsi <code>testKoneksi</code>). Skrip akan otomatis menginisialisasi 8 lembar kerja database secara rapi.
                  </li>
                  <li>
                    Klik tombol biru <strong>Deploy (Terapkan)</strong> di pojok kanan atas &gt; pilih <strong>New deployment (Penerapan baru)</strong>.
                    <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <em>Catatan: Setiap kali kode diperbarui, Google mewajibkan membuat Penerapan Baru (New deployment) agar versi terbaru aktif.</em>
                    </div>
                  </li>
                  <li>
                    Pilih tipe <strong>Web app</strong> (klik ikon gerigi di sebelah kiri jika belum terpilih).
                  </li>
                  <li className="p-2 bg-amber-100/70 dark:bg-amber-950/60 rounded-lg border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                    <strong>PENTING:</strong> Atur opsi berikut:
                    <div className="mt-1 pl-2 space-y-0.5 font-medium">
                      <div>• <em>Execute as (Jalankan sebagai):</em> <strong>Me (email Anda)</strong></div>
                      <div>• <em>Who has access (Siapa yang memiliki akses):</em> <span className="underline font-bold text-rose-700 dark:text-rose-400">"Anyone" (Siapa saja)</span> ⚠️ <em>(Jangan biarkan 'Only myself'!)</em></div>
                    </div>
                  </li>
                  <li>
                    Klik <strong>Deploy</strong>. Jika muncul pop-up izin Google:
                    <div className="mt-1 pl-2 text-[11px] text-slate-700 dark:text-slate-300">
                      Klik <strong>Authorize access</strong> &gt; Pilih Akun Google Anda &gt; Klik <strong>Advanced (Lanjutan)</strong> di kiri bawah &gt; Klik <strong>Go to Database Yayasan (unsafe)</strong> &gt; Klik <strong>Allow (Izinkan)</strong>.
                    </div>
                  </li>
                  <li>
                    Salin <strong>Web App URL</strong> yang berakhiran <code className="bg-emerald-200/60 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded font-mono font-bold">/exec</code>, lalu tempelkan ke kolom URL aplikasi ini dan klik <strong>Simpan & Uji Koneksi</strong>.
                  </li>
                </ol>
              </div>

              {/* Code Preview & Copy */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-slate-600" />
                    <span>Kode Google Apps Script (Code.gs)</span>
                  </span>
                  <button
                    onClick={copyScriptToClipboard}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {scriptCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin ke Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Semua Skrip</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-64 select-all border border-slate-800">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setShowScriptModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Device QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/30">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Hubungkan Smartphone / Perangkat Lain
                </h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200">
                <QRCodeCanvas
                  value={generateDevicePairingUrl(webAppUrl, sheetDocUrl)}
                  size={210}
                  level="M"
                  includeMargin={true}
                />
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 max-w-sm">
                <div className="font-semibold text-slate-800 dark:text-white text-sm">
                  Cara Membuka di Smartphone:
                </div>
                <ol className="text-left text-xs list-decimal pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
                  <li>Buka aplikasi <strong>Kamera</strong> di HP Android atau iPhone Anda.</li>
                  <li>Arahkan kamera ke <strong>QR Code</strong> di atas.</li>
                  <li>Ketuk tautan yang muncul untuk membuka aplikasi.</li>
                  <li>Aplikasi di HP Anda akan <strong>langsung terhubung & memuat data terbaru</strong> dari Google Spreadsheet secara otomatis!</li>
                </ol>
              </div>

              <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleCopyPairingUrl}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  {copiedPairingUrl ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPairingUrl ? "Tautan Berhasil Disalin!" : "Salin Tautan Sambung Otomatis (Untuk Kirim ke WA)"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="w-full py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
