import React, { useState, useMemo } from "react";
import {
  Award,
  Search,
  Plus,
  FileSpreadsheet,
  Edit2,
  Trash2,
  RotateCcw,
  BookOpen,
  GraduationCap,
  Users,
  Building,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  School
} from "lucide-react";
import { StudentItem, EducationLevel, StudentCategory } from "../types";
import { normalizeLevel } from "./StudentsView";
import { exportToCSV, ALLOWED_CLASSES_BY_LEVEL, normalizeStandardClass } from "../services/api";
import { ConfirmDeleteModal } from "./common/ConfirmDeleteModal";

interface AlumniViewProps {
  readOnly?: boolean;
  students: StudentItem[];
  onAddAlumni: (alumni: Omit<StudentItem, "id">) => void;
  onUpdateAlumni: (alumni: StudentItem) => void;
  onDeleteAlumni: (id: string) => void;
  onReactivateAlumni: (id: string, targetClass: string) => void;
  searchTerm?: string;
  onNavigateToStudents?: () => void;
}

const LEVEL_LABELS: Record<EducationLevel, { label: string; badge: string; color: string; nextStage: string }> = {
  RA: {
    label: "Alumni RA",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    color: "amber",
    nextStage: "Melanjutkan ke SDIT / SD Negeri"
  },
  SDIT: {
    label: "Alumni SDIT",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    color: "emerald",
    nextStage: "Melanjutkan ke SMP / MTs"
  },
  SMP: {
    label: "Alumni SMP",
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    color: "blue",
    nextStage: "Melanjutkan ke SMA / SMK / MA"
  },
  SMA: {
    label: "Alumni SMA",
    badge: "bg-purple-50 text-purple-800 border-purple-200",
    color: "purple",
    nextStage: "Perguruan Tinggi / Vokasi / Karier"
  }
};

export const AlumniView: React.FC<AlumniViewProps> = ({
  students,
  onAddAlumni,
  onUpdateAlumni,
  onDeleteAlumni,
  onReactivateAlumni,
  searchTerm: globalSearch = "",
  onNavigateToStudents
}) => {
  // Only students with status "Lulus"
  const alumniList = useMemo(() => {
    return students.filter(s => s.status === "Lulus");
  }, [students]);

  // Filters
  const [localSearch, setLocalSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [yearFilter, setYearFilter] = useState<string>("ALL");
  const [genderFilter, setGenderFilter] = useState<string>("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<StudentItem | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<StudentItem | null>(null);
  const [reactivateClass, setReactivateClass] = useState<string>("");
  const [alumniToDelete, setAlumniToDelete] = useState<StudentItem | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    nisn: string;
    nis: string;
    name: string;
    gender: "L" | "P";
    educationLevel: EducationLevel;
    classGrade: string;
    academicYear: string;
    graduationYear: string;
    currentActivity: string;
    alumniPhone: string;
    alumniEmail: string;
    parentName: string;
    parentPhone: string;
    category: StudentCategory;
    averageGrade: number;
    achievementsCount: number;
    address: string;
    notes: string;
  }>({
    nisn: "",
    nis: "",
    name: "",
    gender: "L",
    educationLevel: "SMA",
    classGrade: "Alumni SMA",
    academicYear: "2024/2025",
    graduationYear: "2024/2025",
    currentActivity: "",
    alumniPhone: "",
    alumniEmail: "",
    parentName: "",
    parentPhone: "",
    category: "Reguler",
    averageGrade: 90,
    achievementsCount: 0,
    address: "",
    notes: ""
  });

  const search = globalSearch || localSearch;

  // Available Graduation Years from data
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    alumniList.forEach(a => {
      const y = a.graduationYear || a.academicYear;
      if (y) set.add(y);
    });
    return Array.from(set).sort().reverse();
  }, [alumniList]);

  // Filtered Alumni
  const filteredAlumni = useMemo(() => {
    return alumniList.filter(a => {
      const lvl = normalizeLevel(a.educationLevel);
      const q = (search || "").toLowerCase().trim();

      const matchesSearch =
        !q ||
        (a.name || "").toLowerCase().includes(q) ||
        (a.nisn || "").toLowerCase().includes(q) ||
        (a.nis || "").toLowerCase().includes(q) ||
        (a.currentActivity && a.currentActivity.toLowerCase().includes(q)) ||
        (a.classGrade && (a.classGrade || "").toLowerCase().includes(q)) ||
        (a.parentName && (a.parentName || "").toLowerCase().includes(q));

      const matchesLevel = levelFilter === "ALL" || lvl === levelFilter;
      const gradYear = a.graduationYear || a.academicYear;
      const matchesYear = yearFilter === "ALL" || gradYear === yearFilter;
      const matchesGender = genderFilter === "ALL" || a.gender === genderFilter;

      return matchesSearch && matchesLevel && matchesYear && matchesGender;
    });
  }, [alumniList, search, levelFilter, yearFilter, genderFilter]);

  // Statistics
  const stats = useMemo(() => {
    const raCount = alumniList.filter(a => normalizeLevel(a.educationLevel) === "RA").length;
    const sditCount = alumniList.filter(a => normalizeLevel(a.educationLevel) === "SDIT").length;
    const smpCount = alumniList.filter(a => normalizeLevel(a.educationLevel) === "SMP").length;
    const smaCount = alumniList.filter(a => normalizeLevel(a.educationLevel) === "SMA").length;
    const higherEduCount = alumniList.filter(a => a.currentActivity && /universitas|institut|politeknik|kuliah|ptn|pts|kampus|stie|stmik/i.test(a.currentActivity)).length;

    return {
      total: alumniList.length,
      ra: raCount,
      sdit: sditCount,
      smp: smpCount,
      sma: smaCount,
      higherEdu: higherEduCount
    };
  }, [alumniList]);

  // Handlers
  const handleOpenAdd = () => {
    const nextNisn = `00${Math.floor(10000000 + Math.random() * 90000000)}`;
    const nextNis = `2324${Math.floor(10000 + Math.random() * 90000)}`;
    setFormData({
      nisn: nextNisn,
      nis: nextNis,
      name: "",
      gender: "L",
      educationLevel: "SMA",
      classGrade: "Alumni SMA (Angkatan 2025)",
      academicYear: "2024/2025",
      graduationYear: "2024/2025",
      currentActivity: "Mahasiswa Perguruan Tinggi Negeri",
      alumniPhone: "08",
      alumniEmail: "",
      parentName: "",
      parentPhone: "08",
      category: "Reguler",
      averageGrade: 92,
      achievementsCount: 0,
      address: "",
      notes: ""
    });
    setEditingAlumni(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (alumni: StudentItem) => {
    setEditingAlumni(alumni);
    setFormData({
      nisn: alumni.nisn,
      nis: alumni.nis,
      name: alumni.name,
      gender: alumni.gender,
      educationLevel: normalizeLevel(alumni.educationLevel),
      classGrade: alumni.classGrade || "Lulus (Alumni)",
      academicYear: alumni.academicYear || "2024/2025",
      graduationYear: alumni.graduationYear || alumni.academicYear || "2024/2025",
      currentActivity: alumni.currentActivity || "",
      alumniPhone: alumni.alumniPhone || "",
      alumniEmail: alumni.alumniEmail || "",
      parentName: alumni.parentName || "",
      parentPhone: alumni.parentPhone || "",
      category: alumni.category || "Reguler",
      averageGrade: alumni.averageGrade || 90,
      achievementsCount: alumni.achievementsCount || 0,
      address: alumni.address || "",
      notes: alumni.notes || ""
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nisn.trim()) {
      alert("Mohon lengkapi NISN dan nama alumni!");
      return;
    }

    const payload: Omit<StudentItem, "id"> = {
      ...formData,
      status: "Lulus",
      tuitionStatus: "Lunas"
    };

    if (editingAlumni) {
      onUpdateAlumni({
        ...payload,
        id: editingAlumni.id
      });
    } else {
      onAddAlumni(payload);
    }

    setIsAddModalOpen(false);
    setEditingAlumni(null);
  };

  const handleOpenReactivate = (alumni: StudentItem) => {
    setReactivateTarget(alumni);
    const lvl = normalizeLevel(alumni.educationLevel);
    let defaultClass = "KELAS 12";
    if (lvl === "RA") defaultClass = "RA B";
    if (lvl === "SDIT") defaultClass = "KELAS 6";
    if (lvl === "SMP") defaultClass = "KELAS 9";
    setReactivateClass(defaultClass);
  };

  const handleConfirmReactivate = () => {
    if (!reactivateTarget) return;
    const lvl = normalizeLevel(reactivateTarget.educationLevel);
    const validClass = normalizeStandardClass(reactivateClass, lvl);
    onReactivateAlumni(reactivateTarget.id, validClass);
    setReactivateTarget(null);
  };

  const handleExportCSV = () => {
    const exportRows = filteredAlumni.map((a) => {
      const lvl = normalizeLevel(a.educationLevel);
      return {
        "NISN": a.nisn,
        "NIS": a.nis,
        "Nama Lengkap": a.name,
        "Jenis Kelamin": a.gender === "L" ? "Laki-laki" : "Perempuan",
        "Jenjang Kelulusan": LEVEL_LABELS[lvl].label,
        "Tahun Lulus": a.graduationYear || a.academicYear,
        "Kelas Terakhir": a.classGrade,
        "Studi Lanjut / Aktivitas": a.currentActivity || "-",
        "No. HP Alumni": a.alumniPhone || "-",
        "Email Alumni": a.alumniEmail || "-",
        "Nama Orang Tua": a.parentName,
        "No. HP Orang Tua": a.parentPhone,
        "Nilai Rata-rata": a.averageGrade,
        "Jumlah Prestasi": a.achievementsCount,
        "Catatan": a.notes || "-"
      };
    });

    exportToCSV(`Data_Alumni_Yayasan_${new Date().toISOString().slice(0, 10)}.csv`, exportRows);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-linear-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036]/10 rounded-xl border border-white/20 text-indigo-300 shadow-inner">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Data Alumni Yayasan</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-400/20 text-indigo-200 border border-indigo-300/30">
                  {stats.total} Lulusan Terdata
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200/80 mt-1 max-w-2xl">
                Direktori terpadu lulusan seluruh jenjang (RA, SDIT, SMP, SMA). Siswa yang telah dinyatakan lulus otomatis masuk ke menu ini dengan riwayat studi lengkap.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {onNavigateToStudents && (
              <button
                onClick={onNavigateToStudents}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1a1d21] dark:border-[#2b3036]/10 hover:bg-white dark:bg-[#1a1d21] dark:border-[#2b3036]/20 text-white text-xs font-semibold border border-white/20 backdrop-blur-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Data Siswa Aktif &rarr;</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1a1d21] dark:border-[#2b3036]/10 hover:bg-white dark:bg-[#1a1d21] dark:border-[#2b3036]/20 text-white text-xs font-semibold border border-white/20 backdrop-blur-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Alumni</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards per Jenjang */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div 
          onClick={() => setLevelFilter("ALL")}
          className={`bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-3.5 border transition-all cursor-pointer ${
            levelFilter === "ALL" ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20" : "border-slate-200 hover:border-slate-300 hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Semua Lulusan</span>
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-700">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.total}</span>
            <span className="text-[11px] text-slate-500 font-medium">Alumni</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            Seluruh 4 Jenjang Pendidikan
          </div>
        </div>

        <div 
          onClick={() => setLevelFilter(levelFilter === "SMA" ? "ALL" : "SMA")}
          className={`bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-3.5 border transition-all cursor-pointer ${
            levelFilter === "SMA" ? "border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/20" : "border-slate-200 hover:border-slate-300 hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700">Alumni SMA</span>
            <div className="p-1.5 bg-purple-100 rounded-lg text-purple-700">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.sma}</span>
            <span className="text-[11px] text-slate-500 font-medium">Lulusan</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-purple-700 font-medium">
            PTN / PTS / Karier
          </div>
        </div>

        <div 
          onClick={() => setLevelFilter(levelFilter === "SMP" ? "ALL" : "SMP")}
          className={`bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-3.5 border transition-all cursor-pointer ${
            levelFilter === "SMP" ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20" : "border-slate-200 hover:border-slate-300 hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700">Alumni SMP</span>
            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.smp}</span>
            <span className="text-[11px] text-slate-500 font-medium">Lulusan</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-blue-700 font-medium">
            Lanjut SMA / SMK / MA
          </div>
        </div>

        <div 
          onClick={() => setLevelFilter(levelFilter === "SDIT" ? "ALL" : "SDIT")}
          className={`bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-3.5 border transition-all cursor-pointer ${
            levelFilter === "SDIT" ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20" : "border-slate-200 hover:border-slate-300 hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">Alumni SDIT</span>
            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.sdit}</span>
            <span className="text-[11px] text-slate-500 font-medium">Lulusan</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-emerald-700 font-medium">
            Lanjut SMP / MTs
          </div>
        </div>

        <div 
          onClick={() => setLevelFilter(levelFilter === "RA" ? "ALL" : "RA")}
          className={`bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-3.5 border transition-all cursor-pointer ${
            levelFilter === "RA" ? "border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/20" : "border-slate-200 hover:border-slate-300 hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">Alumni RA</span>
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.ra}</span>
            <span className="text-[11px] text-slate-500 font-medium">Lulusan</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-amber-700 font-medium">
            Lanjut SD / MI
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari berdasarkan nama alumni, NISN, kampus/sekolah lanjutan, atau wali..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {localSearch && (
              <button 
                onClick={() => setLocalSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Level Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setLevelFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                levelFilter === "ALL"
                  ? "bg-indigo-900 text-white border-indigo-900 shadow-2xs"
                  : "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => setLevelFilter("SMA")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                levelFilter === "SMA"
                  ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                  : "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              SMA ({stats.sma})
            </button>
            <button
              onClick={() => setLevelFilter("SMP")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                levelFilter === "SMP"
                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                  : "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              SMP ({stats.smp})
            </button>
            <button
              onClick={() => setLevelFilter("SDIT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                levelFilter === "SDIT"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                  : "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              SDIT ({stats.sdit})
            </button>
            <button
              onClick={() => setLevelFilter("RA")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                levelFilter === "RA"
                  ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                  : "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              RA ({stats.ra})
            </button>
          </div>
        </div>

        {/* Secondary filters: Graduation Year & Gender */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Tahun Kelulusan:</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-2.5 py-1 rounded-md border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Tahun Kelulusan</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Gender:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-2.5 py-1 rounded-md border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Semua</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          {(localSearch || levelFilter !== "ALL" || yearFilter !== "ALL" || genderFilter !== "ALL") && (
            <button
              onClick={() => {
                setLocalSearch("");
                setLevelFilter("ALL");
                setYearFilter("ALL");
                setGenderFilter("ALL");
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Alumni Table */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredAlumni.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Award className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-700">Belum Ada Data Alumni</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Ketika siswa dinyatakan lulus pada fitur <strong className="font-semibold text-slate-700">Kenaikan Kelas</strong> atau statusnya diubah menjadi Lulus, mereka akan otomatis tercatat dan tersimpan di menu ini.
            </p>
            <div className="flex items-start justify-center gap-2 pt-2">
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-2xs"
              >
                + Tambah Data Alumni
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-[#1a1d21] text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Nama Alumni & Identitas</th>
                  <th className="px-4 py-3">Jenjang & Angkatan</th>
                  <th className="px-4 py-3">Studi Lanjut / Aktivitas</th>
                  <th className="px-4 py-3">Kontak</th>
                  <th className="px-4 py-3">Prestasi & Nilai</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036]">
                {filteredAlumni.map((alumni) => {
                  const lvl = normalizeLevel(alumni.educationLevel);
                  const lvlInfo = LEVEL_LABELS[lvl];

                  return (
                    <tr key={alumni.id} className="hover:bg-indigo-50/30 transition-colors">
                      {/* Name & NISN */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-start justify-center shrink-0 text-xs font-bold ${
                            alumni.gender === "L" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                          }`}>
                            {alumni.gender === "L" ? "L" : "P"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{alumni.name}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                              <span>NISN: {alumni.nisn}</span>
                              {alumni.nis && <span>&bull; NIS: {alumni.nis}</span>}
                            </div>
                            {alumni.category.includes("Beasiswa") && (
                              <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-100 text-purple-700">
                                {alumni.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Jenjang & Tahun Lulus */}
                      <td className="px-4 py-3.5">
                        <div>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${lvlInfo.badge}`}>
                            {lvlInfo.label}
                          </span>
                          <div className="text-xs font-semibold text-slate-800 mt-1">
                            Lulus TP {alumni.graduationYear || alumni.academicYear}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {alumni.classGrade || "Tingkat Akhir"}
                          </div>
                        </div>
                      </td>

                      {/* Studi Lanjut / Aktivitas */}
                      <td className="px-4 py-3.5 max-w-xs">
                        {alumni.currentActivity ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-indigo-950 flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>{alumni.currentActivity}</span>
                            </div>
                            {alumni.notes && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                                "{alumni.notes}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-400 italic text-[11px]">
                            Belum diisi &bull;{" "}
                            <button
                              onClick={() => handleOpenEdit(alumni)}
                              className="text-indigo-600 hover:underline font-normal"
                            >
                              + Tambah
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Kontak */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1 text-[11px]">
                          {(alumni.alumniPhone || alumni.parentPhone) && (
                            <div className="flex items-center gap-1 text-slate-700">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="font-mono">{alumni.alumniPhone || alumni.parentPhone}</span>
                            </div>
                          )}
                          {alumni.alumniEmail && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[140px]">{alumni.alumniEmail}</span>
                            </div>
                          )}
                          {alumni.parentName && (
                            <div className="text-slate-500 text-[10px]">
                              Wali: {alumni.parentName}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Nilai & Prestasi */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">Rata-rata:</span>
                            <span className="font-mono font-bold text-slate-900">{alumni.averageGrade}</span>
                          </div>
                          {alumni.achievementsCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              {alumni.achievementsCount} Prestasi
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenReactivate(alumni)}
                            title="Kembalikan ke status Siswa Aktif"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(alumni)}
                            title="Edit Data Alumni"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setAlumniToDelete(alumni)}
                            title="Hapus Alumni"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Alumni */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div 
            className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 bg-linear-to-r from-indigo-900 to-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white dark:bg-[#1a1d21] dark:border-[#2b3036]/10 text-indigo-300">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {editingAlumni ? "Edit Data Alumni Yayasan" : "Registrasi Data Alumni Baru"}
                  </h3>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Lengkapi profil kelulusan, kontak, dan informasi kelanjutan studi/karier.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white dark:bg-[#1a1d21] dark:border-[#2b3036]/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Alumni *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Muhammad Rayhan, S.Kom"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as "L" | "P" })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="10 Digit NISN"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIS (Nomor Induk Siswa)</label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    placeholder="NIS Sekolah"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenjang Kelulusan *</label>
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as EducationLevel })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="RA">RA (Raudhatul Athfal)</option>
                    <option value="SDIT">SDIT (SD Islam Terpadu)</option>
                    <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                    <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Kelulusan / Angkatan *</label>
                  <input
                    type="text"
                    required
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value, academicYear: e.target.value })}
                    placeholder="Contoh: 2024/2025"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Studi Lanjut / Kampus / Sekolah / Karier Saat Ini
                  </label>
                  <input
                    type="text"
                    value={formData.currentActivity}
                    onChange={(e) => setFormData({ ...formData, currentActivity: e.target.value })}
                    placeholder="Contoh: Mahasiswa Teknik Elektro ITB / Lanjut ke SMP Negeri 1"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Kontak Alumni</label>
                  <input
                    type="text"
                    value={formData.alumniPhone}
                    onChange={(e) => setFormData({ ...formData, alumniPhone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Alumni</label>
                  <input
                    type="email"
                    value={formData.alumniEmail}
                    onChange={(e) => setFormData({ ...formData, alumniEmail: e.target.value })}
                    placeholder="alumni@domain.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Nama Orang Tua"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Kontak Orang Tua</label>
                  <input
                    type="text"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="08xxxxxxxx"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nilai Rata-rata Kelulusan</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.averageGrade}
                    onChange={(e) => setFormData({ ...formData, averageGrade: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah Prestasi / Sertifikasi</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.achievementsCount}
                    onChange={(e) => setFormData({ ...formData, achievementsCount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Catatan Kelulusan / Prestasi Utama</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Contoh: Lulusan terbaik angkatan 2024, Hafal 15 Juz Al-Qur'an..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] hover:bg-slate-50 dark:bg-[#121417] text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingAlumni ? "Simpan Perubahan" : "Daftarkan Alumni"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reactivate Confirmation */}
      {reactivateTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs">
          <div 
            className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 text-slate-800 space-y-4 animate-in fade-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-emerald-700">
              <div className="p-2.5 bg-emerald-100 rounded-xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Kembalikan ke Siswa Aktif</h3>
                <p className="text-xs text-slate-500">Aktivasi ulang status peserta didik</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#121417] p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{reactivateTarget.name}</div>
              <div className="text-slate-500 font-mono">NISN: {reactivateTarget.nisn} &bull; Jenjang: {reactivateTarget.educationLevel}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tentukan Kelas Aktif Baru (Resmi Yayasan):
              </label>
              <select
                value={reactivateClass}
                onChange={(e) => setReactivateClass(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {(ALLOWED_CLASSES_BY_LEVEL[normalizeLevel(reactivateTarget.educationLevel)] || ALLOWED_CLASSES_BY_LEVEL.SMA).map(cls => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Siswa ini akan berpindah dari menu Alumni kembali ke menu <strong className="font-semibold text-slate-700">Data Peserta Didik</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReactivateTarget(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReactivate}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi Aktifkan Kembali</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Iframe-Safe Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!alumniToDelete}
        title="Hapus Data Alumni"
        itemName={alumniToDelete?.name}
        itemDetail={`NISN: ${alumniToDelete?.nisn || "-"} | Tingkat: ${alumniToDelete?.educationLevel || "-"}`}
        confirmButtonText="Hapus Alumni Ini"
        onConfirm={() => {
          if (alumniToDelete) {
            onDeleteAlumni(alumniToDelete.id);
            setAlumniToDelete(null);
          }
        }}
        onClose={() => setAlumniToDelete(null)}
      />
    </div>
  );
};
