import React from "react";
import { 
  Landmark, 
  GraduationCap, 
  ChevronRight,
  Users
} from "lucide-react";
import { DatabaseStore, ActiveTab } from "../types";

interface DashboardViewProps {
  readOnly?: boolean;
  data: DatabaseStore;
  authUsername?: string;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenReportModal?: () => void;
  onOpenAiAssistant?: () => void;
  onQuickAdd?: (type: 'asset' | 'employee' | 'student' | 'log') => void;
  onForceSync?: () => void;
  isSyncing?: boolean;
  onLogout?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onNavigateTab
}) => {
  const totalAssets = data.assets?.length || 0;
  const activeStudents = (data.students || []).filter(s => s.status !== "Lulus");
  
  const raStudents = activeStudents.filter(s => s.educationLevel === "RA").length;
  const sdStudents = activeStudents.filter(s => s.educationLevel === "SDIT").length;
  const smpStudents = activeStudents.filter(s => s.educationLevel === "SMP").length;
  const smaStudents = activeStudents.filter(s => s.educationLevel === "SMA").length;

  const totalEmployees = data.employees?.length || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dasbor</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Total Aset */}
        <div 
          onClick={() => onNavigateTab("assets")}
          className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Aset Terdaftar</span>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{totalAssets}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-slate-400" />
              <span>Lihat Buku Induk Aset</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>

        {/* Total Pegawai */}
        <div 
          onClick={() => onNavigateTab("employees")}
          className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Pegawai</span>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{totalEmployees}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Lihat Data Pegawai</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
        </div>

        {/* Total Siswa RA */}
        <div 
          onClick={() => onNavigateTab("students")}
          className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Siswa RA</span>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{raStudents}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span>Siswa Aktif RA</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </div>

        {/* Total Siswa SDIT */}
        <div 
          onClick={() => onNavigateTab("students")}
          className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Siswa SD</span>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{sdStudents}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <span>Siswa Aktif SD</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500"></div>
        </div>

        {/* Total Siswa SMP */}
        <div 
          onClick={() => onNavigateTab("students")}
          className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Siswa SMP</span>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{smpStudents}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Siswa Aktif SMP</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
        </div>

        {/* Total Siswa SMA */}
        <div 
          onClick={() => onNavigateTab("students")}
          className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Siswa SMA</span>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{smaStudents}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span>Siswa Aktif SMA</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500"></div>
        </div>

      </div>
    </div>
  );
};

