import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Landmark, 
  Users, 
  GraduationCap, 
  FileCheck2, 
  Sparkles, 
  Settings, 
  Activity, 
  Database,
  ArrowUpRight,
  LogOut,
  PlusCircle,
  RefreshCw,
  Folder,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Award,
  HeartHandshake,
  PanelLeftClose,
  PanelLeftOpen,
  Building,
  FileText,
  ShieldCheck
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
  activeAssetSubMenu = "view-search",
  onSelectAssetSubMenu,
  activeStudentSubMenu = "ALL",
  onSelectStudentSubMenu,
  activeEmployeeSubMenu = "ALL",
  onSelectEmployeeSubMenu,
  data, 
  onLogout,
  onToggleSidebar,
  isOpen = true
}) => {
  const [isDataWargaExpanded, setIsDataWargaExpanded] = useState<boolean>(true);
  const [isAssetsExpanded, setIsAssetsExpanded] = useState<boolean>(activeTab === "assets");
  const [isStudentsExpanded, setIsStudentsExpanded] = useState<boolean>(activeTab === "students");
  const [isEmployeesExpanded, setIsEmployeesExpanded] = useState<boolean>(activeTab === "employees");

  const activeStudents = (data.students || []).filter(s => s.status !== "Lulus");
  const teacherCount = data.employees.filter(e => e.role.includes("Guru") || e.role.includes("Pendidik")).length || 1;
  const staffCount = data.employees.filter(e => e.role.includes("Pengurus") || e.role.includes("Kepala")).length || 1;

  if (!isOpen) {
    return (
      <aside className="hidden md:flex w-16 bg-white text-slate-700 shrink-0 flex-col h-full border-r border-slate-200 select-none overflow-hidden transition-all duration-200 shadow-xs pt-4">
        {/* Toggle Button at top of collapsed sidebar */}
        {onToggleSidebar && (
          <div className="px-2 pb-2 flex justify-center border-b border-slate-100 mb-1">
            <button
              onClick={onToggleSidebar}
              title="Buka Menu"
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Icons List */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-2 space-y-1.5 flex flex-col items-center">
          <button
            onClick={() => onSelectTab("dashboard")}
            title="Dasbor"
            className={`p-3 rounded-xl transition-all flex items-start justify-center relative group cursor-pointer ${
              activeTab === "dashboard" ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectTab("students")}
            title="Pendaftaran / Siswa"
            className={`p-3 rounded-xl transition-all flex items-start justify-center relative group cursor-pointer ${
              activeTab === "students" ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              onSelectTab("assets");
              if (onSelectAssetSubMenu) onSelectAssetSubMenu("view-search");
            }}
            title="Pendataan & Aset Yayasan"
            className={`p-3 rounded-xl transition-all flex items-start justify-center relative group cursor-pointer ${
              activeTab === "assets" ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Landmark className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectTab("employees")}
            title="Data Guru & Pegawai"
            className={`p-3 rounded-xl transition-all flex items-start justify-center relative group cursor-pointer ${
              activeTab === "employees" ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectTab("alumni")}
            title="Data Alumni"
            className={`p-3 rounded-xl transition-all flex items-start justify-center relative group cursor-pointer ${
              activeTab === "alumni" ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
          </button>
          <button
            onClick={() => onSelectTab("donations")}
            title="Bantuan & Donasi"
            className={`p-3 rounded-xl transition-all flex items-start justify-center relative group cursor-pointer ${
              activeTab === "donations" ? "bg-rose-50 text-rose-600 font-bold" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-rose-500" />
          </button>
          <button
            onClick={() => onSelectTab("meetings")}
            title="Hasil Musyawarah"
            className={`p-3 rounded-xl transition-all flex items-start justify-center relative group cursor-pointer ${
              activeTab === "meetings" ? "bg-indigo-50 text-indigo-600 font-bold" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </button>
          <button
            onClick={() => onSelectTab("admin-performance")}
            title="Kinerja Admin"
            className={`p-3 rounded-xl transition-all flex items-start justify-center relative group cursor-pointer ${
              activeTab === "admin-performance" ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Activity className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectTab("ai-assistant")}
            title="Asisten Cerdas AI"
            className={`p-3 rounded-xl transition-all flex items-start justify-center relative group cursor-pointer ${
              activeTab === "ai-assistant" ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
          </button>
          <button
            onClick={() => onSelectTab("settings")}
            title="Profil & Pengaturan"
            className={`p-3 rounded-xl transition-all flex items-start justify-center relative group cursor-pointer ${
              activeTab === "settings" ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Logout */}
        <div className="p-3 border-t border-slate-100 flex justify-center shrink-0">
          {onLogout && (
            <button
              onClick={onLogout}
              title="Keluar"
              className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 sm:w-80 md:w-64 lg:w-72 bg-white text-slate-800 shrink-0 flex flex-col h-full border-r border-slate-200 select-none overflow-hidden shadow-2xl md:shadow-2xs">
      {/* Brand Header with title and collapse/close button */}
      <div className="p-4 pb-3 flex items-center justify-between border-b border-slate-100 shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs font-bold text-sm">
            {data?.profile?.name ? (data.profile.name.toLowerCase().startsWith("yayasan ") ? data.profile.name.substring(8).charAt(0).toUpperCase() : data.profile.name.charAt(0).toUpperCase()) : "Y"}
          </div>
          <div>
            <span className="font-bold text-base text-slate-900 tracking-tight block leading-tight">{data.profile.name}</span>
            <span className="text-[10px] text-slate-500 font-medium">Sistem Informasi Terpadu</span>
          </div>
        </div>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title="Tutup Menu"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer flex items-center justify-center"
          >
            <span className="md:hidden font-bold text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1 rounded-lg">✕ Tutup</span>
            <span className="hidden md:inline text-lg font-bold px-1">‹</span>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-sidebar-scroll">
        {/* Dasbor */}
        <button
          onClick={() => onSelectTab("dashboard")}
          className={`w-full px-4 py-3 rounded-xl flex items-center gap-4 transition-colors cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-slate-50/80 text-blue-600 font-medium"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <span className="text-[15px]">Dasbor</span>
        </button>

        {/* Pendaftaran Siswa (Collapsible) */}
        <div className="space-y-0.5">
          <button
            onClick={() => {
              setIsStudentsExpanded(!isStudentsExpanded);
              onSelectTab("students");
              if (onSelectStudentSubMenu) onSelectStudentSubMenu("ALL");
            }}
            className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === "students"
                ? "bg-slate-50/80 text-blue-600 font-medium"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-4">
              <GraduationCap className="w-5 h-5 shrink-0" />
              <span className="text-[15px]">Pendaftaran / Siswa</span>
            </div>
            {isStudentsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isStudentsExpanded && (
            <div className="pl-6 pr-2 py-1 space-y-1">
              <button
                onClick={() => {
                  onSelectTab("students");
                  if (onSelectStudentSubMenu) onSelectStudentSubMenu("ALL");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "students" && activeStudentSubMenu === "ALL"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Semua Unit</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("students");
                  if (onSelectStudentSubMenu) onSelectStudentSubMenu("RA");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "students" && activeStudentSubMenu === "RA"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>RA</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("students");
                  if (onSelectStudentSubMenu) onSelectStudentSubMenu("SDIT");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "students" && activeStudentSubMenu === "SDIT"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>SD</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("students");
                  if (onSelectStudentSubMenu) onSelectStudentSubMenu("SMP");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "students" && activeStudentSubMenu === "SMP"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>SMP</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("students");
                  if (onSelectStudentSubMenu) onSelectStudentSubMenu("SMA");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "students" && activeStudentSubMenu === "SMA"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>SMA</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("alumni");
                  // Optional: clear submenu if needed, but selecting alumni tab will render AlumniView
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "alumni"
                    ? "bg-blue-50 text-amber-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>Data Alumni</span>
              </button>
            </div>
          )}
        </div>

        {/* Kepegawaian Yayasan (Collapsible) */}
        <div className="space-y-0.5">
          <button
            onClick={() => {
              setIsEmployeesExpanded(!isEmployeesExpanded);
              onSelectTab("employees");
              if (onSelectEmployeeSubMenu) onSelectEmployeeSubMenu("ALL");
            }}
            className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === "employees"
                ? "bg-slate-50/80 text-blue-600 font-medium"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 shrink-0" />
              <span className="text-[15px]">Kepegawaian Yayasan</span>
            </div>
            {isEmployeesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isEmployeesExpanded && (
            <div className="pl-6 pr-2 py-1 space-y-1">
              <button
                onClick={() => {
                  onSelectTab("employees");
                  if (onSelectEmployeeSubMenu) onSelectEmployeeSubMenu("ALL");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "employees" && activeEmployeeSubMenu === "ALL"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Semua Pegawai</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("employees");
                  if (onSelectEmployeeSubMenu) onSelectEmployeeSubMenu("Kantor Yayasan");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "employees" && activeEmployeeSubMenu === "Kantor Yayasan"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Kantor Yayasan</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("employees");
                  if (onSelectEmployeeSubMenu) onSelectEmployeeSubMenu("Unit RA / TK");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "employees" && activeEmployeeSubMenu === "Unit RA / TK"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Unit RA</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("employees");
                  if (onSelectEmployeeSubMenu) onSelectEmployeeSubMenu("Unit SD / MI");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "employees" && activeEmployeeSubMenu === "Unit SD / MI"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Unit SD</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("employees");
                  if (onSelectEmployeeSubMenu) onSelectEmployeeSubMenu("Unit SMP / MTs");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "employees" && activeEmployeeSubMenu === "Unit SMP / MTs"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Unit SMP</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("employees");
                  if (onSelectEmployeeSubMenu) onSelectEmployeeSubMenu("Unit SMA / SMK");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "employees" && activeEmployeeSubMenu === "Unit SMA / SMK"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Unit SMA</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("employees");
                  if (onSelectEmployeeSubMenu) onSelectEmployeeSubMenu("Unit Pondok Pesantren");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "employees" && activeEmployeeSubMenu === "Unit Pondok Pesantren"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Unit Pondok</span>
              </button>
            </div>
          )}
        </div>

        {/* Pendataan Aset & Inventaris (Collapsible) */}
        <div className="space-y-0.5">
          <button
            onClick={() => {
              setIsAssetsExpanded(!isAssetsExpanded);
              onSelectTab("assets");
              if (onSelectAssetSubMenu) onSelectAssetSubMenu("view-search");
            }}
            className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === "assets"
                ? "bg-slate-50/80 text-blue-600 font-medium"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-4">
              <Landmark className="w-5 h-5 shrink-0" />
              <span className="text-[15px]">Pendataan Aset & Berkas</span>
            </div>
            {isAssetsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isAssetsExpanded && (
            <div className="pl-6 pr-2 py-1 space-y-1">
              <button
                onClick={() => {
                  onSelectTab("assets");
                  if (onSelectAssetSubMenu) onSelectAssetSubMenu("view-search");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "assets" && activeAssetSubMenu === "view-search"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Buku Induk Aset</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("assets");
                  if (onSelectAssetSubMenu) onSelectAssetSubMenu("input");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "assets" && activeAssetSubMenu === "input"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Input Aset Baru</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("assets");
                  if (onSelectAssetSubMenu) onSelectAssetSubMenu("transfer-title");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "assets" && activeAssetSubMenu === "transfer-title"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>Mutasi & Balik Nama</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("assets");
                  if (onSelectAssetSubMenu) onSelectAssetSubMenu("borrow-docs");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "assets" && activeAssetSubMenu === "borrow-docs"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Folder className="w-4 h-4 text-indigo-600" />
                <span>Peminjaman Berkas Brankas</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("assets");
                  if (onSelectAssetSubMenu) onSelectAssetSubMenu("export");
                }}
                className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-sm ${
                  activeTab === "assets" && activeAssetSubMenu === "export"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Pusat Laporan & Ekspor</span>
              </button>
            </div>
          )}
        </div>

        
        {/* Donasi & Bantuan */}
        <button
          onClick={() => onSelectTab("donations")}
          className={`w-full px-4 py-3 rounded-xl flex items-center gap-4 transition-colors cursor-pointer ${
            activeTab === "donations"
              ? "bg-rose-50/80 text-rose-600 font-medium"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <HeartHandshake className="w-5 h-5 shrink-0 text-rose-500" />
          <span className="text-[15px]">Bantuan & Donasi</span>
        </button>

        
        {/* Hasil Pengarahan & Musyawarah */}
        <button
          onClick={() => onSelectTab("meetings")}
          className={`w-full px-4 py-3 rounded-xl flex items-center gap-4 transition-colors cursor-pointer ${
            activeTab === "meetings"
              ? "bg-indigo-50/80 text-indigo-600 font-medium"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-5 h-5 shrink-0 text-indigo-500" />
          <span className="text-[15px]">Hasil Musyawarah</span>
        </button>

        {/* Admin Performance, AI Assistant */}
        <div className="pt-4 space-y-1">
          <button
            onClick={() => onSelectTab("admin-performance")}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-4 transition-colors cursor-pointer ${
              activeTab === "admin-performance"
                ? "bg-slate-50/80 text-blue-600 font-medium"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Activity className="w-5 h-5 shrink-0 text-blue-500" />
            <span className="text-[15px]">Kinerja Admin</span>
          </button>

          <button
            onClick={() => onSelectTab("ai-assistant")}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-4 transition-colors cursor-pointer ${
              activeTab === "ai-assistant"
                ? "bg-slate-50/80 text-blue-600 font-medium"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-5 h-5 shrink-0 text-purple-600" />
            <span className="text-[15px]">Asisten Cerdas AI</span>
          </button>
        </div>
      </div>

      {/* Footer Settings & Logout - Pinned at bottom so Pengaturan is always visible */}
      <div className="p-3 border-t border-slate-200/80 shrink-0 bg-slate-50/90 space-y-2">
        <button
          onClick={() => onSelectTab("settings")}
          className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-colors cursor-pointer text-xs font-semibold ${
            activeTab === "settings"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/90 shadow-2xs"
          }`}
        >
          <Settings className={`w-4 h-4 shrink-0 ${activeTab === "settings" ? "text-white" : "text-slate-600"}`} />
          <div className="flex-1 text-left flex items-center justify-between">
            <span>Profil & Pengaturan</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${activeTab === "settings" ? "bg-blue-500 text-white" : "bg-emerald-100 text-emerald-800"}`}>
              DATABASE
            </span>
          </div>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        )}
      </div>
    </aside>
  );
};
