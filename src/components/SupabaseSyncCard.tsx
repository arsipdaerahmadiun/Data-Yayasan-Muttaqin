import React, { useState, useEffect } from "react";
import { 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Code2,
  Database,
  Terminal,
  Zap,
  ChevronDown,
  ChevronUp,
  X,
  Sliders,
  Sparkles
} from "lucide-react";
import { DatabaseStore } from "../types";
import { 
  getStoredSupabaseConfig, 
  resetSupabaseClient, 
  testSupabaseConnection, 
  pushAllDataToSupabase, 
  pullAllDataFromSupabase, 
  SUPABASE_SCHEMA_SQL, 
  normalizeSupabaseUrl,
  isSupabaseAutoSyncEnabled,
  setSupabaseAutoSyncEnabled,
  disconnectSupabase,
  isSupabaseConfigured
} from "../lib/supabase";

interface SupabaseSyncCardProps {
  fullData: DatabaseStore;
  onRestoreData: (data: DatabaseStore) => void;
}

export const SupabaseSyncCard: React.FC<SupabaseSyncCardProps> = ({ fullData, onRestoreData }) => {
  const initialConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialConfig.anonKey);
  const [showKey, setShowKey] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const [isAutoSync, setIsAutoSync] = useState<boolean>(() => isSupabaseAutoSyncEnabled());
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(() => isSupabaseConfigured() ? null : false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  // Single unified notification banner (eliminates contradictory stacked alerts)
  const [banner, setBanner] = useState<{
    type: "success" | "error" | "info";
    title?: string;
    message: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);

  const [showSqlModal, setShowSqlModal] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Initial connection check on mount
  useEffect(() => {
    if (supabaseUrl && supabaseAnonKey && isSupabaseConfigured()) {
      handleSilentCheck();
    } else {
      setIsConnected(false);
    }
  }, []);

  const handleSilentCheck = async () => {
    try {
      const res = await testSupabaseConnection();
      setIsConnected(res.success);
    } catch {
      setIsConnected(false);
    }
  };

  const handleDisconnect = () => {
    disconnectSupabase();
    setSupabaseUrl("");
    setSupabaseAnonKey("");
    setIsConnected(false);
    setIsAutoSync(false);
    setIsConfigOpen(false);
    setBanner({
      type: "info",
      title: "Sambungan Supabase Diputuskan",
      message: "Sambungan ke Supabase telah berhasil diputuskan. Aplikasi kini sepenuhnya menggunakan Google Spreadsheet sebagai database cloud aktif."
    });
  };

  const handleToggleAutoSync = () => {
    const next = !isAutoSync;
    setIsAutoSync(next);
    setSupabaseAutoSyncEnabled(next);
    if (next) {
      handlePushData();
    } else {
      setBanner({
        type: "info",
        message: "Auto-Sync dinonaktifkan. Data lokal tetap tersimpan di browser Anda."
      });
    }
  };

  const handleSaveConfig = async () => {
    const cleanUrl = normalizeSupabaseUrl(supabaseUrl);
    setSupabaseUrl(cleanUrl);
    resetSupabaseClient(cleanUrl, supabaseAnonKey);
    setIsTesting(true);
    setBanner({
      type: "info",
      message: "Menyimpan konfigurasi dan memverifikasi koneksi Supabase..."
    });

    try {
      const res = await testSupabaseConnection();
      setIsConnected(res.success);
      if (res.success) {
        setBanner({
          type: "success",
          title: "Koneksi Berhasil",
          message: "Kredensial valid dan terhubung dengan server Supabase Cloud."
        });
        setIsConfigOpen(false); // Close config after success
      } else {
        setBanner({
          type: "error",
          title: "Verifikasi Gagal",
          message: res.message,
          action: { label: "Uji Ulang", onClick: handleSaveConfig }
        });
      }
    } catch (err: any) {
      setIsConnected(false);
      setBanner({
        type: "error",
        title: "Koneksi Terputus",
        message: err.message || "Gagal menghubungi Supabase",
        action: { label: "Coba Lagi", onClick: handleSaveConfig }
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushData = async () => {
    setIsPushing(true);
    setBanner({
      type: "info",
      message: "Sedang menyinkronkan data aset, pegawai, santri, dan donasi ke Supabase Cloud..."
    });

    try {
      const res = await pushAllDataToSupabase(fullData);
      if (res.success) {
        setIsConnected(true);
        const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setLastSyncedTime(timeStr);
        setBanner({
          type: "success",
          title: "Sinkronisasi Berhasil",
          message: res.message
        });
      } else {
        setBanner({
          type: "error",
          title: "Sinkronisasi Mengalami Kendala",
          message: res.message,
          action: { label: "Coba Sinkronkan Lagi", onClick: handlePushData }
        });
      }
    } catch (err: any) {
      setBanner({
        type: "error",
        title: "Gagal Mengunggah",
        message: err.message || "Terjadi kesalahan saat mengunggah data",
        action: { label: "Coba Lagi", onClick: handlePushData }
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullData = async () => {
    setIsPulling(true);
    setBanner({
      type: "info",
      message: "Sedang menarik data terbaru dari Supabase Cloud..."
    });

    try {
      const res = await pullAllDataFromSupabase();
      if (res.success && res.data) {
        const merged: DatabaseStore = {
          ...fullData,
          profile: res.data.profile ? { ...fullData.profile, ...res.data.profile } : fullData.profile,
          assets: res.data.assets || fullData.assets,
          employees: res.data.employees || fullData.employees,
          students: res.data.students || fullData.students,
          donations: res.data.donations || fullData.donations,
          assetTransfers: res.data.assetTransfers || fullData.assetTransfers
        };
        onRestoreData(merged);
        setIsConnected(true);
        const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setLastSyncedTime(timeStr);
        setBanner({
          type: "success",
          title: "Data Cloud Berhasil Diambil",
          message: res.message
        });
      } else {
        setBanner({
          type: "error",
          title: "Gagal Mengunduh Data",
          message: res.message,
          action: { label: "Coba Lagi", onClick: handlePullData }
        });
      }
    } catch (err: any) {
      setBanner({
        type: "error",
        title: "Kesalahan Jaringan",
        message: err.message || "Gagal menghubungi Supabase",
        action: { label: "Coba Lagi", onClick: handlePullData }
      });
    } finally {
      setIsPulling(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  const projectRef = supabaseUrl.replace("https://", "").split(".")[0];
  const supabaseSqlEditorUrl = projectRef && projectRef !== "mherinyhfchdsaeigplf" 
    ? `https://supabase.com/dashboard/project/${projectRef}/sql/new` 
    : "https://supabase.com/dashboard/project/mherinyhfchdsaeigplf/sql/new";

  const totalAssets = fullData.assets?.length || 0;
  const totalEmployees = fullData.employees?.length || 0;
  const totalStudents = fullData.students?.length || 0;
  const totalDonations = fullData.donations?.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Modern Top Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Supabase Cloud Database</h3>
              {isConnected === true ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Terhubung
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Terputus (Nonaktif)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sambungan dinonaktifkan. Seluruh data yayasan kini disinkronkan melalui Google Spreadsheet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowSqlModal(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Lihat skrip SQL skema tabel"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Skrip SQL</span>
          </button>
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isConfigOpen 
                ? "bg-slate-100 text-slate-900 border-slate-300" 
                : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            title="Atur URL dan API Key Supabase"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Kredensial</span>
            {isConfigOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Modern Compact Control Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Auto Sync Switch */}
          <div className="flex items-center justify-between md:justify-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Auto-Sync Real-Time</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                  isAutoSync ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                }`}>
                  {isAutoSync ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
                Setiap data yang Anda tambah atau ubah otomatis tersimpan langsung ke Cloud.
              </p>
            </div>

            {/* iOS-Style Toggle Switch */}
            <button
              onClick={handleToggleAutoSync}
              role="switch"
              aria-checked={isAutoSync}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                isAutoSync ? "bg-emerald-600" : "bg-slate-300"
              }`}
              title={isAutoSync ? "Klik untuk menonaktifkan Auto-Sync" : "Klik untuk mengaktifkan Auto-Sync"}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform duration-200 ease-in-out ${
                  isAutoSync ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePushData}
              disabled={isPushing || isPulling}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                isPushing 
                  ? "bg-emerald-700 text-white cursor-wait opacity-90" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98"
              }`}
            >
              <UploadCloud className={`w-4 h-4 ${isPushing ? "animate-spin" : ""}`} />
              <span>{isPushing ? "Menyinkronkan..." : "Sinkronkan Sekarang"}</span>
            </button>

            <button
              onClick={handlePullData}
              disabled={isPushing || isPulling}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200/90 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
              title="Tarik data terbaru dari Supabase"
            >
              <DownloadCloud className={`w-4 h-4 text-slate-500 ${isPulling ? "animate-spin" : ""}`} />
              <span>{isPulling ? "Menarik..." : "Tarik Data"}</span>
            </button>
          </div>
        </div>

        {/* Real-time Data Summary Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Total Aset</span>
            <span className="text-base font-bold text-slate-800">{totalAssets}</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">Tersinkron Cloud</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Guru & Pegawai</span>
            <span className="text-base font-bold text-slate-800">{totalEmployees}</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">Tersinkron Cloud</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Peserta Didik</span>
            <span className="text-base font-bold text-slate-800">{totalStudents}</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">Tersinkron Cloud</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Donasi & Mutasi</span>
            <span className="text-base font-bold text-slate-800">{totalDonations}</span>
            <span className="text-[10px] text-slate-500 block">
              {lastSyncedTime ? `Sync: ${lastSyncedTime}` : "Siap sinkron"}
            </span>
          </div>
        </div>

        {/* Single Smart Notification Alert (Clutter-Free, Actionable) */}
        {banner && (
          <div className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 transition-all ${
            banner.type === "success" 
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-900" 
              : banner.type === "error" 
              ? "bg-rose-50 border-rose-200 text-rose-900" 
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}>
            <div className="flex items-start gap-2.5">
              {banner.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {banner.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              {banner.type === "info" && <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-spin" />}
              <div>
                {banner.title && <h5 className="font-bold text-xs mb-0.5">{banner.title}</h5>}
                <p className="text-[11px] leading-relaxed">{banner.message}</p>
                {banner.action && (
                  <button
                    onClick={banner.action.onClick}
                    className="mt-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-[11px] transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {banner.action.label}
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => setBanner(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer shrink-0"
              title="Tutup pemberitahuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Collapsible Supabase Credentials Form (Neatly hidden unless requested) */}
        {isConfigOpen && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                Pengaturan Kredensial URL & API Key
              </span>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs outline-none focus:border-emerald-500 bg-white"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Format: <code className="text-emerald-700">https://mherinyhfchdsaeigplf.supabase.co</code>
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supabase Publishable API Key (anon)
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="sb_publishable_..."
                    className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-300 font-mono text-xs outline-none focus:border-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showKey ? "Sembunyikan" : "Tampilkan"}
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Kunci aman browser (Publishable / Anon Key)
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSaveConfig}
                  disabled={isTesting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                  {isTesting ? "Menyimpan & Menguji..." : "Simpan & Uji Koneksi"}
                </button>
                <button
                  onClick={handleDisconnect}
                  type="button"
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <X className="w-3.5 h-3.5 text-rose-600" />
                  Putuskan Sambungan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SQL Setup Modal (Clean & Modern) */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm">Skrip SQL Skema Supabase</span>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded text-xs cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Simple Instructions */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-2">
              <span>Jalankan skrip ini di SQL Editor dashboard Supabase jika Anda ingin mereset atau membuat ulang tabel.</span>
              <a
                href={supabaseSqlEditorUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1 shrink-0"
              >
                <span>Buka SQL Editor</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Code Block */}
            <div className="p-4 overflow-y-auto flex-1 bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed">
              <pre className="whitespace-pre-wrap">{SUPABASE_SCHEMA_SQL}</pre>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={handleCopySql}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                {sqlCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {sqlCopied ? "Skrip Tersalin!" : "Salin Skrip SQL"}
              </button>
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50 cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
