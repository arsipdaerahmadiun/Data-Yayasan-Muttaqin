import React from "react";
import { 
  Landmark, 
  GraduationCap, 
  ChevronRight,
  Users,
  LayoutDashboard,
  FileSpreadsheet,
  HeartHandshake,
  BookOpen,
  Printer,
  Sparkles
} from "lucide-react";
import { DatabaseStore, ActiveTab } from "../types";
import { formatRupiah } from "../services/api";

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
  onNavigateTab,
  onOpenReportModal,
  onOpenAiAssistant
}) => {
  // 1. Data Peserta Didik
  const allStudents = data.students || [];
  const activeStudents = allStudents.filter(s => s.status !== "Lulus");
  const alumniStudents = allStudents.filter(s => s.status === "Lulus");

  // 2. Data Pegawai
  const employees = data.employees || [];
  const totalEmployees = employees.length;
  const teachersCount = employees.filter(e => 
    (e.role || "").toLowerCase().includes("guru") || 
    (e.positionTitle || "").toLowerCase().includes("guru") ||
    (e.positionTitle || "").toLowerCase().includes("pengajar")
  ).length;
  const staffCount = Math.max(0, totalEmployees - teachersCount);

  // 3. Aset Yayasan
  const assets = data.assets || [];
  const totalAssets = assets.length;
  const totalAssetUnits = assets.reduce((sum, a) => sum + (Number(a.quantity) || 1), 0);

  // 4. Bantuan & Donasi
  const donations = data.donations || [];
  const totalDonations = donations.length;
  const cashDonations = donations.filter(d => d.category === "Uang Tunai" || (Number(d.amount) || 0) > 0);
  const totalCashDonationAmount = cashDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  // 5. Laporan Bantuan
  const aidReports = data.aidReports || [];
  const totalAidReports = aidReports.length;
  const totalAidPusat = aidReports.reduce((sum, r) => sum + (Number(r.centralAidAmount) || 0), 0);

  // 6. Hasil Musyawarah
  const meetings = data.meetings || [];
  const totalMeetings = meetings.length;
  const completedMeetings = meetings.filter(m => m.status === "Selesai").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 p-8 rounded-3xl bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white">
      {/* Top Header Card */}
      <div className="bg-[#2563eb]/50 border border-[#60a5fa] rounded-2xl p-5 md:p-6 transition-all backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 border border-blue-300/50 flex items-center justify-center text-white shadow-lg">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  Dasbor Utama Yayasan
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/50 text-white border border-blue-300">
                  Rekapitulasi Data
                </span>
              </div>
              <p className="text-xs md:text-sm text-blue-100 mt-1">
                Ringkasan jumlah dan rekapitulasi seluruh modul kegiatan yayasan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenAiAssistant && (
              <button
                onClick={onOpenAiAssistant}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-sm text-white bg-[#1d4ed8]/80 border border-blue-400 hover:bg-blue-700 shadow-sm transition-all cursor-pointer backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Analisis AI</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Rekapitulasi Sederhana Semua Menu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. Data Siswa */}
        <div 
          onClick={() => onNavigateTab("students")}
          className="bg-gradient-to-br from-[#2563eb] to-[#1e40af] border border-[#60a5fa] rounded-2xl p-5 md:p-6 shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-100">Data Siswa</span>
              <div className="p-2 rounded-xl bg-blue-500/50 text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {activeStudents.length}
              </span>
              <span className="text-xs text-blue-100 font-medium">Siswa Aktif</span>
            </div>
            <p className="text-xs text-blue-100 mt-2">
              {allStudents.length} Total Terdata • {alumniStudents.length} Alumni Lulus
            </p>
          </div>
          
          <div className="mt-5 pt-3 border-t border-[#60a5fa] flex items-center justify-end text-xs text-blue-100 font-medium">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-200"></div>
        </div>

        {/* 2. Data Pegawai */}
        <div 
          onClick={() => onNavigateTab("employees")}
          className="bg-gradient-to-br from-[#2563eb] to-[#1e40af] border border-[#60a5fa] rounded-2xl p-5 md:p-6 shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-100">Data Pegawai</span>
              <div className="p-2 rounded-xl bg-blue-500/50 text-white">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {totalEmployees}
              </span>
              <span className="text-xs text-blue-100 font-medium">Total Pegawai</span>
            </div>
            <p className="text-xs text-blue-100 mt-2">
              {teachersCount} Tenaga Pendidik • {staffCount} Tenaga Kependidikan
            </p>
          </div>
          
          <div className="mt-5 pt-3 border-t border-[#60a5fa] flex items-center justify-end text-xs text-blue-100 font-medium">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-200"></div>
        </div>

        {/* 3. Aset Yayasan */}
        <div 
          onClick={() => onNavigateTab("assets")}
          className="bg-gradient-to-br from-[#2563eb] to-[#1e40af] border border-[#60a5fa] rounded-2xl p-5 md:p-6 shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-100">Aset Yayasan</span>
              <div className="p-2 rounded-xl bg-blue-500/50 text-white">
                <Landmark className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {totalAssets}
              </span>
              <span className="text-xs text-blue-100 font-medium">Item Terdaftar</span>
            </div>
            <p className="text-xs text-blue-100 mt-2">
              Total {totalAssetUnits} Unit Fisik Terdata
            </p>
          </div>
          
          <div className="mt-5 pt-3 border-t border-[#60a5fa] flex items-center justify-end text-xs text-blue-100 font-medium">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-200"></div>
        </div>

        {/* 4. Bantuan & Donasi */}
        <div 
          onClick={() => onNavigateTab("donations")}
          className="bg-gradient-to-br from-[#2563eb] to-[#1e40af] border border-[#60a5fa] rounded-2xl p-5 md:p-6 shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-100">Bantuan & Donasi</span>
              <div className="p-2 rounded-xl bg-blue-500/50 text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {totalDonations}
              </span>
              <span className="text-xs text-blue-100 font-medium">Donasi Tercatat</span>
            </div>
            <p className="text-xs text-blue-100 mt-2 truncate">
              {formatRupiah(totalCashDonationAmount)} Total Uang Tunai
            </p>
          </div>
          
          <div className="mt-5 pt-3 border-t border-[#60a5fa] flex items-center justify-end text-xs text-blue-100 font-medium">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-200"></div>
        </div>

        {/* 5. Laporan Bantuan */}
        <div 
          onClick={() => onNavigateTab("aid-reports")}
          className="bg-gradient-to-br from-[#2563eb] to-[#1e40af] border border-[#60a5fa] rounded-2xl p-5 md:p-6 shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-100">Laporan Bantuan</span>
              <div className="p-2 rounded-xl bg-blue-500/50 text-white">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {totalAidReports}
              </span>
              <span className="text-xs text-blue-100 font-medium">Laporan Wilayah</span>
            </div>
            <p className="text-xs text-blue-100 mt-2 truncate">
              {formatRupiah(totalAidPusat)} Bantuan dari Pusat
            </p>
          </div>
          
          <div className="mt-5 pt-3 border-t border-[#60a5fa] flex items-center justify-end text-xs text-blue-100 font-medium">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-200"></div>
        </div>

        {/* 6. Hasil Musyawarah */}
        <div 
          onClick={() => onNavigateTab("meetings")}
          className="bg-gradient-to-br from-[#2563eb] to-[#1e40af] border border-[#60a5fa] rounded-2xl p-5 md:p-6 shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-100">Hasil Musyawarah</span>
              <div className="p-2 rounded-xl bg-blue-500/50 text-white">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {totalMeetings}
              </span>
              <span className="text-xs text-blue-100 font-medium">Notulen Musyawarah</span>
            </div>
            <p className="text-xs text-blue-100 mt-2">
              {completedMeetings} Rapat Telah Selesai Terlaksana
            </p>
          </div>
          
          <div className="mt-5 pt-3 border-t border-[#60a5fa] flex items-center justify-end text-xs text-blue-100 font-medium">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-200"></div>
        </div>

      </div>
    </div>
  );
};
