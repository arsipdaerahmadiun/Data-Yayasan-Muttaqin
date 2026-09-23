import React from "react";
import { 
  Building2, 
  RefreshCw, 
  Printer, 
  Sparkles, 
  Search, 
  LogOut,
  CheckCircle2,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Sun,
  Moon
} from "lucide-react";
import { FoundationProfile, DatabaseStore, ActiveTab } from "../types";
import { isSheetsConfigured } from "../lib/sheets";

interface NavbarProps {
  profile: FoundationProfile;
  authUsername: string;
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncTime: string;
  pendingCount: number;
  onForceSync: () => void;
  onOpenReportModal: () => void;
  onOpenAiAssistant: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onLogout?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  data?: DatabaseStore;
  onNavigateTab?: (tab: ActiveTab) => void;
  isSheetsSyncing?: boolean;
  lastSheetsSyncTime?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  authUsername,
  isSyncing,
  isOnline,
  lastSyncTime,
  onForceSync,
  onOpenReportModal,
  onOpenAiAssistant,
  searchTerm,
  onSearchChange,
  onLogout,
  isSidebarOpen = true,
  onToggleSidebar,
  isDarkMode = false,
  onToggleDarkMode,
  data,
  onNavigateTab,
  isSheetsSyncing = false,
  lastSheetsSyncTime
}) => {
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = React.useState(false);

  // Generate initials from authUsername
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(authUsername);

  // Global Search Logic
  const query = (searchTerm || "").toLowerCase();
  
  const searchResults = React.useMemo(() => {
    if (!query || !data) return [];
    
    const results: Array<{type: string, title: string, subtitle: string, tab: ActiveTab}> = [];
    
    // Search Students
    data.students?.forEach(s => {
      if (s.name?.toLowerCase().includes(query) || s.nisn?.toLowerCase().includes(query)) {
        results.push({ type: 'Siswa', title: s.name, subtitle: `${s.nisn || '-'} • ${s.educationLevel}`, tab: 'students' });
      }
    });

    // Search Employees
    data.employees?.forEach(e => {
      if (e.name?.toLowerCase().includes(query) || e.nip?.toLowerCase().includes(query)) {
        results.push({ type: 'Pegawai', title: e.name, subtitle: `${e.nip} • ${e.role}`, tab: 'employees' });
      }
    });

    // Search Assets
    data.assets?.forEach(a => {
      const code = a.code || (a as any).assetCode || "";
      if (a.name?.toLowerCase().includes(query) || code.toLowerCase().includes(query)) {
        results.push({ type: 'Aset', title: a.name, subtitle: `${code || '-'} • ${a.category}`, tab: 'assets' });
      }
    });

    return results.slice(0, 8); // Limit to top 8 results
  }, [query, data]);

  const handleResultClick = (tab: ActiveTab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
    setIsSearchFocused(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 py-2.5 sm:py-3 transition-all shrink-0">
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Left: Sidebar Toggle & Brand Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={isSidebarOpen ? "Sembunyikan Menu (Ctrl+B)" : "Tampilkan Menu (Ctrl+B)"}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center justify-center border border-slate-200 shadow-2xs shrink-0"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
          )}
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-xs sm:text-sm md:text-base text-slate-900 tracking-tight truncate">
              {profile?.name || "Yayasan Al-Muttaqin"}
            </span>
            {/* Database Realtime Auto-Sync Status Badge */}
            <button
              onClick={() => onNavigateTab && onNavigateTab("settings")}
              title={
                isSheetsSyncing
                  ? "Sedang menyimpan otomatis ke Google Spreadsheet..."
                  : isSheetsConfigured()
                  ? "Google Spreadsheet Terhubung (Auto-Sync Aktif). Klik untuk membuka Pengaturan."
                  : "Database Lokal Aktif. Klik untuk mengatur integrasi Google Spreadsheet."
              }
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSheetsSyncing ? "bg-blue-500 animate-spin" : isSheetsConfigured() ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
              <span className="hidden sm:inline">
                {isSheetsSyncing 
                  ? "Menyimpan ke Sheets..." 
                  : isSheetsConfigured()
                  ? "Google Sheets (Auto)"
                  : "Database Lokal"}
              </span>
              <span className="sm:hidden">
                {isSheetsSyncing ? "Sheets..." : isSheetsConfigured() ? "Sheets" : "DB"}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Search bar "Cari", Notification bell, User avatar FS */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search input with responsive width */}
          <div className="relative w-32 xs:w-44 sm:w-60 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full h-8.5 sm:h-9 pl-8 sm:pl-9 pr-3 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all placeholder:text-slate-400 text-slate-800"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs z-10"
              >
                ✕
              </button>
            )}

            {/* Global Search Results Dropdown */}
            {isSearchFocused && searchTerm && (
              <div className="absolute top-full mt-2 w-full sm:w-[400px] right-0 sm:right-auto bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto py-2">
                    <div className="px-3 pb-2 mb-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Hasil Pencarian
                    </div>
                    {searchResults.map((res, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleResultClick(res.tab)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{res.title}</div>
                          <div className="text-xs text-slate-500">{res.subtitle}</div>
                        </div>
                        <div className="text-[10px] font-medium px-2 py-1 rounded bg-slate-100 text-slate-500">
                          {res.type}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">
                    Tidak ditemukan hasil untuk "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
            title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationPopup((prev) => !prev)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer relative"
              title="Pemberitahuan"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>
            </button>

            {showNotificationPopup && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Pemberitahuan Sistem</span>
                  <button
                    onClick={() => setShowNotificationPopup(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs">
                    <p className="font-semibold text-emerald-800">Sistem Berjalan Normal</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Database tersinkronisasi dan siap digunakan.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar Circle */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-start justify-center shadow-xs">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
