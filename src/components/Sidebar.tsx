import React from "react";
import { 
  LayoutDashboard, 
  Landmark, 
  Users, 
  GraduationCap, 
  Settings, 
  LogOut,
  BookOpen,
  HeartHandshake,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeftOpen,
  List,
  PlusCircle,
  RefreshCw,
  FileText
} from "lucide-react";
import { ActiveTab, DatabaseStore, AssetSubMenu, StudentSubMenu, EmployeeSubMenu } from "../types";

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeAssetSubMenu?: AssetSubMenu;
  onSelectAssetSubMenu?: (sub: AssetSubMenu) => void;
  activeStudentSubMenu?: StudentSubMenu;
  onSelectStudentSubMenu?: (sub: StudentSubMenu) => void;
  activeEmployeeSubMenu?: EmployeeSubMenu;
  onSelectEmployeeSubMenu?: (sub: EmployeeSubMenu) => void;
  data: DatabaseStore;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onSelectTab, 
  onSelectAssetSubMenu,
  onSelectStudentSubMenu,
  onSelectEmployeeSubMenu,
  data, 
  onLogout,
  onToggleSidebar,
  isOpen = true
}) => {
  const activeStudentsCount = (data.students || []).filter(s => s.status !== "Lulus").length;
  const employeesCount = (data.employees || []).length;
  const assetsCount = (data.assets || []).length;
  const donationsCount = (data.donations || []).length;
  const aidReportsCount = (data.aidReports || []).length;
  const meetingsCount = (data.meetings || []).length;

  // Collapsed Sidebar View (Desktop mini-rail)
  if (!isOpen) {
    return (
      <aside className="hidden md:flex w-16 bg-white dark:bg-[#1a1d21] text-slate-700 dark:text-slate-300 shrink-0 flex-col h-full border-r border-slate-200 dark:border-[#2b3036] select-none overflow-hidden transition-all duration-200 shadow-2xs pt-3">
        {onToggleSidebar && (
          <div className="px-2 pb-2 flex justify-center border-b border-slate-100 dark:border-slate-800 mb-2">
            <button
              onClick={onToggleSidebar}
              title="Buka Menu Navigasi"
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-1 space-y-1.5 flex flex-col items-center">
          <button
            onClick={() => onSelectTab("dashboard")}
            title="Dasbor Utama"
            className={`p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              activeTab === "dashboard" 
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold shadow-2xs border border-blue-200/80 dark:border-blue-900/50" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              onSelectTab("students");
              if (onSelectStudentSubMenu) onSelectStudentSubMenu("ALL");
            }}
            title="Data Peserta Didik"
            className={`p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              activeTab === "students" 
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold shadow-2xs border border-blue-200/80 dark:border-blue-900/50" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <GraduationCap className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              onSelectTab("employees");
              if (onSelectEmployeeSubMenu) onSelectEmployeeSubMenu("ALL");
            }}
            title="Kepegawaian"
            className={`p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              activeTab === "employees" 
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold shadow-2xs border border-blue-200/80 dark:border-blue-900/50" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              onSelectTab("assets");
              if (onSelectAssetSubMenu) onSelectAssetSubMenu("view-search");
            }}
            title="Aset & Berkas Yayasan"
            className={`p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              activeTab === "assets" 
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold shadow-2xs border border-blue-200/80 dark:border-blue-900/50" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Landmark className="w-5 h-5" />
          </button>

          <button
            onClick={() => onSelectTab("donations")}
            title="Bantuan & Donasi"
            className={`p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              activeTab === "donations" 
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold shadow-2xs border border-blue-200/80 dark:border-blue-900/50" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <HeartHandshake className="w-5 h-5" />
          </button>

          <button
            onClick={() => onSelectTab("aid-reports")}
            title="Laporan Bantuan"
            className={`p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              activeTab === "aid-reports" 
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold shadow-2xs border border-blue-200/80 dark:border-blue-900/50" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
          </button>

          <button
            onClick={() => onSelectTab("meetings")}
            title="Hasil Musyawarah"
            className={`p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              activeTab === "meetings" 
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold shadow-2xs border border-blue-200/80 dark:border-blue-900/50" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-1 shrink-0">
          <button
            onClick={() => onSelectTab("settings")}
            title="Profil & Pengaturan"
            className={`p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              activeTab === "settings" 
                ? "bg-blue-600 text-white font-bold shadow-2xs" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Keluar Sesi"
              className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    );
  }

  // Expanded Professional Minimalist Sidebar View
  return (
    <aside className="w-64 md:w-60 lg:w-64 bg-white dark:bg-[#1a1d21] text-slate-800 dark:text-slate-200 shrink-0 flex flex-col h-full border-r border-slate-200 dark:border-[#2b3036] select-none overflow-hidden shadow-2xl md:shadow-none">
      {/* Brand Header */}
      <div className="p-4 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {data?.profile?.name ? (data.profile.name.toLowerCase().startsWith("yayasan ") ? data.profile.name.substring(8).charAt(0).toUpperCase() : data.profile.name.charAt(0).toUpperCase()) : "Y"}
          </div>
          <div className="truncate">
            <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight block truncate">
              {data?.profile?.name || "Yayasan Al-Muttaqin"}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
              Portal Manajemen Terpadu
            </span>
          </div>
        </div>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title="Tutup Menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Single-Tier Clean Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-2 pt-1 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Navigasi Utama
        </div>

        {/* 1. Dasbor */}
        <button
          onClick={() => onSelectTab("dashboard")}
          className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors cursor-pointer text-sm font-medium ${
            activeTab === "dashboard"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border-l-4 border-blue-600"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900"
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === "dashboard" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
          <span className="truncate">Dasbor</span>
        </button>

        {/* 2. Data Siswa */}
        <div className="space-y-1">
          <button
            onClick={() => {
              onSelectTab("students");
              if (onSelectStudentSubMenu) onSelectStudentSubMenu("ALL");
            }}
            className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-sm font-medium ${
              activeTab === "students"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border-l-4 border-blue-600"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <GraduationCap className={`w-4 h-4 shrink-0 ${activeTab === "students" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
              <span className="truncate">Data Siswa</span>
            </div>
            {activeStudentsCount > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "students"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {activeStudentsCount}
              </span>
            )}
          </button>
          {activeTab === "students" && (
            <div className="pl-9 space-y-1">
              {[
                { id: "RA", label: "RA", icon: <BookOpen className="w-3.5 h-3.5" /> },
                { id: "SD", label: "SD", icon: <BookOpen className="w-3.5 h-3.5" /> },
                { id: "SMP", label: "SMP", icon: <BookOpen className="w-3.5 h-3.5" /> },
                { id: "SMA", label: "SMA", icon: <BookOpen className="w-3.5 h-3.5" /> },
                { id: "ALUMNI", label: "Alumni", icon: <GraduationCap className="w-3.5 h-3.5" /> },
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    if (onSelectStudentSubMenu) onSelectStudentSubMenu(sub.id as StudentSubMenu);
                  }}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2.5 ${
                    "text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {sub.icon}
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Kepegawaian */}
        <button
          onClick={() => {
            onSelectTab("employees");
            if (onSelectEmployeeSubMenu) onSelectEmployeeSubMenu("ALL");
          }}
          className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-sm font-medium ${
            activeTab === "employees"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border-l-4 border-blue-600"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Users className={`w-4 h-4 shrink-0 ${activeTab === "employees" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
            <span className="truncate">Data Pegawai</span>
          </div>
          {employeesCount > 0 && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === "employees"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}>
              {employeesCount}
            </span>
          )}
        </button>

        {/* 4. Aset Yayasan */}
        <div className="space-y-1">
          <button
            onClick={() => {
              onSelectTab("assets");
              if (onSelectAssetSubMenu) onSelectAssetSubMenu("view-search");
            }}
            className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-sm font-medium ${
              activeTab === "assets"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border-l-4 border-blue-600"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Landmark className={`w-5 h-5 shrink-0 ${activeTab === "assets" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
              <span className="truncate">Aset Yayasan</span>
            </div>
            {assetsCount > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "assets"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {assetsCount}
              </span>
            )}
          </button>
          {activeTab === "assets" && (
            <div className="pl-9 space-y-1">
              {[
                { id: "view-search", label: "Buku Induk (Katalog)", icon: <List className="w-3.5 h-3.5" /> },
                { id: "input", label: "Input Aset Baru", icon: <PlusCircle className="w-3.5 h-3.5" /> },
                { id: "transfer-title", label: "Balik Nama & Mutasi", icon: <RefreshCw className="w-3.5 h-3.5" /> },
                { id: "borrow-docs", label: "Peminjaman Dokumen", icon: <FileText className="w-3.5 h-3.5" /> },
                { id: "export", label: "Pusat Cetak & Ekspor", icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    if (onSelectAssetSubMenu) onSelectAssetSubMenu(sub.id as AssetSubMenu);
                  }}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2.5 ${
                    "text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {sub.icon}
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 pb-1">
          <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Kegiatan & Pelaporan
          </div>

          {/* 5. Donasi & Bantuan */}
          <button
            onClick={() => onSelectTab("donations")}
            className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-sm font-medium ${
              activeTab === "donations"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border-l-4 border-blue-600"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <HeartHandshake className={`w-4 h-4 shrink-0 ${activeTab === "donations" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
              <span className="truncate">Bantuan & Donasi</span>
            </div>
            {donationsCount > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "donations"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {donationsCount}
              </span>
            )}
          </button>

          {/* 6. Laporan Bantuan */}
          <button
            onClick={() => onSelectTab("aid-reports")}
            className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-sm font-medium ${
              activeTab === "aid-reports"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border-l-4 border-blue-600"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileSpreadsheet className={`w-4 h-4 shrink-0 ${activeTab === "aid-reports" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
              <span className="truncate">Laporan Bantuan</span>
            </div>
            {aidReportsCount > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "aid-reports"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {aidReportsCount}
              </span>
            )}
          </button>

          {/* 7. Musyawarah & Notula */}
          <button
            onClick={() => onSelectTab("meetings")}
            className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-sm font-medium ${
              activeTab === "meetings"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border-l-4 border-blue-600"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === "meetings" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
              <span className="truncate">Hasil Musyawarah</span>
            </div>
            {meetingsCount > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "meetings"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {meetingsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Clean Bottom Footer for Settings & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5">
        <button
          onClick={() => onSelectTab("settings")}
          className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-xs font-semibold ${
            activeTab === "settings"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-white dark:bg-[#1a1d21] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#2b3036]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan & DB</span>
          </div>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
            activeTab === "settings" ? "bg-blue-500 text-white" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          }`}>
            SINKRON
          </span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full px-3 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi</span>
          </button>
        )}
      </div>
    </aside>
  );
};
