import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Edit3, 
  Trash2, 
  Phone, 
  Award, 
  CheckCircle2, 
  X, 
  HeartHandshake, 
  Building, 
  BookOpen,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Printer,
  Layers,
  LayoutGrid,
  List,
  School,
  Sparkles,
  CheckSquare,
  RotateCcw
} from "lucide-react";
import { StudentItem, EducationLevel, StudentCategory, TuitionStatus, StudentSubMenu } from "../types";
import { exportToCSV, normalizeStandardClass, ALLOWED_CLASSES_BY_LEVEL, ALL_ALLOWED_CLASSES } from "../services/api";
import { ClassPromotionModal } from "./ClassPromotionModal";
import { ClassPrintModal } from "./ClassPrintModal";
import { ConfirmDeleteModal } from "./common/ConfirmDeleteModal";

interface StudentsViewProps {
  readOnly?: boolean;
  students: StudentItem[];
  activeSubMenu?: StudentSubMenu;
  onSelectSubMenu?: (menu: StudentSubMenu) => void;
  onAddStudent: (student: Omit<StudentItem, "id">) => void;
  onUpdateStudent: (student: StudentItem) => void;
  onBatchPromoteStudents?: (students: StudentItem[], summary: string) => void;
  onDeleteStudent: (id: string) => void;
  onNavigateToAlumni?: () => void;
  searchTerm: string;
}

const LEVELS: EducationLevel[] = ["RA", "SDIT", "SMP", "SMA"];

export const STANDARD_CLASS_ORDER: string[] = [
  "RA A", "RA B",
  "KELAS 1", "KELAS 2", "KELAS 3", "KELAS 4", "KELAS 5", "KELAS 6",
  "KELAS 7", "KELAS 8", "KELAS 9",
  "KELAS 10", "KELAS 11", "KELAS 12"
];

export const sortClasses = (classes: string[]): string[] => {
  return [...classes].sort((a, b) => {
    const idxA = STANDARD_CLASS_ORDER.findIndex(c => c.toLowerCase() === a.trim().toLowerCase());
    const idxB = STANDARD_CLASS_ORDER.findIndex(c => c.toLowerCase() === b.trim().toLowerCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b, "id", { numeric: true, sensitivity: "base" });
  });
};

export const LEVEL_DETAILS: Record<EducationLevel, {
  label: string;
  fullName: string;
  subTitle: string;
  badge: string;
  iconBg: string;
  activeBorder: string;
  activeTab: string;
  classSuggestions: string[];
}> = {
  RA: {
    label: "Siswa RA",
    fullName: "Raudhatul Athfal (RA)",
    subTitle: "Pendidikan Usia Dini / Prasekolah",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    iconBg: "bg-amber-100 text-amber-700",
    activeBorder: "border-amber-500 bg-amber-50/40 ring-2 ring-amber-400/30",
    activeTab: "bg-amber-600 text-white border-amber-600 shadow-xs",
    classSuggestions: ["RA A", "RA B"]
  },
  SDIT: {
    label: "Siswa SDIT",
    fullName: "SD Islam Terpadu (SDIT)",
    subTitle: "Sekolah Dasar Berkarakter Qur'ani",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    iconBg: "bg-emerald-100 text-emerald-700",
    activeBorder: "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-400/30",
    activeTab: "bg-emerald-600 text-white border-emerald-600 shadow-xs",
    classSuggestions: ["KELAS 1", "KELAS 2", "KELAS 3", "KELAS 4", "KELAS 5", "KELAS 6"]
  },
  SMP: {
    label: "Siswa SMP",
    fullName: "Sekolah Menengah Pertama (SMP)",
    subTitle: "Pendidikan Menengah & Tahfidz",
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    iconBg: "bg-blue-100 text-blue-700",
    activeBorder: "border-blue-500 bg-blue-50/40 ring-2 ring-blue-400/30",
    activeTab: "bg-blue-600 text-white border-blue-600 shadow-xs",
    classSuggestions: ["KELAS 7", "KELAS 8", "KELAS 9"]
  },
  SMA: {
    label: "Siswa SMA",
    fullName: "Sekolah Menengah Atas (SMA)",
    subTitle: "Pendidikan Menengah Atas & Studi Lanjut",
    badge: "bg-purple-50 text-purple-800 border-purple-200",
    iconBg: "bg-purple-100 text-purple-700",
    activeBorder: "border-purple-500 bg-purple-50/40 ring-2 ring-purple-400/30",
    activeTab: "bg-purple-600 text-white border-purple-600 shadow-xs",
    classSuggestions: ["KELAS 10", "KELAS 11", "KELAS 12"]
  }
};

export const normalizeLevel = (rawLevel?: string): EducationLevel => {
  const raw = String(rawLevel || "").trim();
  if (raw.includes("RA") || raw.includes("TK")) return "RA";
  if (raw.includes("SD") || raw.includes("MI") || raw.includes("SDIT")) return "SDIT";
  if (raw.includes("SMP") || raw.includes("MTs")) return "SMP";
  if (raw.includes("SMA") || raw.includes("SMK") || raw.includes("Pondok") || raw.includes("Santri") || raw.includes("Aliyah")) return "SMA";
  if (raw === "RA" || raw === "SDIT" || raw === "SMP" || raw === "SMA") return raw as EducationLevel;

  // Deteksi nomor kelas jika nama kelas langsung dioperkan
  const match = raw.match(/\b(1[0-2]|[1-9])\b/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 6) return "SDIT";
    if (num >= 7 && num <= 9) return "SMP";
    if (num >= 10 && num <= 12) return "SMA";
  }

  return "SMA";
};

const CATEGORIES: StudentCategory[] = [
  "Reguler",
  "Beasiswa Yatim/Dhuafa",
  "Beasiswa Prestasi",
  "Asrama / Santri Mukim"
];

const TUITION_STATUSES: TuitionStatus[] = [
  "Lunas",
  "Menunggak",
  "Gratis (Beasiswa)"
];

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  activeSubMenu = "ALL",
  onSelectSubMenu,
  onAddStudent,
  onUpdateStudent,
  onBatchPromoteStudents,
  onDeleteStudent,
  onNavigateToAlumni,
  searchTerm: globalSearch
}) => {
  const [localSearch, setLocalSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>(activeSubMenu || "ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [genderFilter, setGenderFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grouped" | "table">("grouped");
  const [collapsedClasses, setCollapsedClasses] = useState<Record<string, boolean>>({});
  const [includeGraduated, setIncludeGraduated] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentItem | null>(null);

  // Print Rombel Modal State
  const [printModalData, setPrintModalData] = useState<{
    isOpen: boolean;
    classNameTitle: string;
    level: EducationLevel;
    students: StudentItem[];
  } | null>(null);

  // Class Promotion Modal State
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [promotionTargetStudent, setPromotionTargetStudent] = useState<StudentItem | null>(null);

  const handleOpenBatchPromotion = () => {
    setPromotionTargetStudent(null);
    setIsPromotionModalOpen(true);
  };

  const handleOpenSinglePromotion = (student: StudentItem) => {
    setPromotionTargetStudent(student);
    setIsPromotionModalOpen(true);
  };

  // Sync with active sub-menu from sidebar
  useEffect(() => {
    if (activeSubMenu) {
      setLevelFilter(activeSubMenu);
      setClassFilter("ALL");
    }
  }, [activeSubMenu]);

  const handleLevelChange = (newLevel: string) => {
    setLevelFilter(newLevel);
    setClassFilter("ALL"); // Otomatis reset filter kelas saat berganti jenjang
    if (onSelectSubMenu) {
      onSelectSubMenu(newLevel as StudentSubMenu);
    }
  };

  // Form State: Fokus pada 4 kolom yang dibutuhkan (Nama, Kelas, Jenis Kelamin, Nama Orang Tua)
  const [formData, setFormData] = useState<{
    name: string;
    classGrade: string;
    gender: "L" | "P";
    parentName: string;
  }>({
    name: "",
    classGrade: "KELAS 1",
    gender: "L",
    parentName: ""
  });

  const search = globalSearch || localSearch;

  const alumniCount = students.filter(s => s.status === "Lulus").length;
  const activeStudentsList = students.filter(s => s.status !== "Lulus");

  // Filter siswa aktif sesuai jenjang terpilih
  const currentLevelActiveStudents = activeStudentsList.filter(s => {
    if (levelFilter === "ALL") return true;
    return normalizeLevel(s.educationLevel) === levelFilter;
  });

  // HANYA kelas standar resmi yayasan yang diakomodir.
  const availableClasses: string[] = levelFilter !== "ALL"
    ? (ALLOWED_CLASSES_BY_LEVEL[levelFilter as EducationLevel] || [])
    : STANDARD_CLASS_ORDER;

  // Pre-calculate data statistik untuk setiap kelas / rombel
  const classStatsMap = availableClasses.reduce((acc, clsName: string) => {
    const inClass = currentLevelActiveStudents.filter(
      s => normalizeStandardClass(s.classGrade, normalizeLevel(s.educationLevel)).toLowerCase() === clsName.toLowerCase()
    );
    acc[clsName] = {
      total: inClass.length,
      boys: inClass.filter(s => s.gender === "L").length,
      girls: inClass.filter(s => s.gender === "P").length,
      scholarships: 0,
      tuitionPaid: inClass.length,
      tuitionUnpaid: 0
    };
    return acc;
  }, {} as Record<string, { total: number; boys: number; girls: number; scholarships: number; tuitionPaid: number; tuitionUnpaid: number }>);

  // Total rombel yang memiliki siswa terdaftar
  const activeRombelCount = availableClasses.filter(c => (classStatsMap[c]?.total || 0) > 0).length;

  const filteredStudents = students.filter((std) => {
    if (!includeGraduated && std.status === "Lulus") return false;

    const stdLevel = normalizeLevel(std.educationLevel);
    const stdNormalizedClass = normalizeStandardClass(std.classGrade, stdLevel);
    const matchesSearch =
      !search ||
      (std.name || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (std.parentName || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (std.classGrade || "").toLowerCase().includes((search || "").toLowerCase()) ||
      stdNormalizedClass.toLowerCase().includes((search || "").toLowerCase());

    return matchesSearch;
  });

  const totalCount = includeGraduated ? students.length : activeStudentsList.length;

  // Breakdown statistics per division (khusus siswa aktif terdaftar)
  const statsByLevel = LEVELS.reduce((acc, lvl) => {
    const list = activeStudentsList.filter(s => normalizeLevel(s.educationLevel) === lvl);
    acc[lvl] = {
      count: list.length,
      boys: list.filter(s => s.gender === "L").length,
      girls: list.filter(s => s.gender === "P").length,
      scholarships: 0,
      active: list.length
    };
    return acc;
  }, {} as Record<EducationLevel, { count: number; boys: number; girls: number; scholarships: number; active: number }>);

  const handleOpenAdd = () => {
    const defaultClass = levelFilter !== "ALL" && (ALLOWED_CLASSES_BY_LEVEL[levelFilter as EducationLevel]?.[0])
      ? ALLOWED_CLASSES_BY_LEVEL[levelFilter as EducationLevel][0]
      : "KELAS 1";

    setFormData({
      name: "",
      classGrade: defaultClass,
      gender: "L",
      parentName: ""
    });
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const handleOpenAddForClass = (clsName: string, level: EducationLevel) => {
    setFormData({
      name: "",
      classGrade: clsName,
      gender: "L",
      parentName: ""
    });
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (std: StudentItem) => {
    const lvl = normalizeLevel(std.educationLevel);
    const validClass = normalizeStandardClass(std.classGrade, lvl);
    setEditingStudent(std);
    setFormData({
      name: std.name,
      classGrade: validClass || std.classGrade,
      gender: (std.gender === "P" ? "P" : "L"),
      parentName: std.parentName || ""
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Mohon masukkan nama peserta didik / siswa!");
      return;
    }
    if (!formData.classGrade.trim()) {
      alert("Mohon tentukan kelas peserta didik!");
      return;
    }

    const normClass = formData.classGrade.trim();
    let detectedLevel: EducationLevel = "SMA";
    if (normClass.startsWith("RA") || /TK/i.test(normClass)) {
      detectedLevel = "RA";
    } else if (/KELAS\s*[1-6]\b/i.test(normClass)) {
      detectedLevel = "SDIT";
    } else if (/KELAS\s*[7-9]\b/i.test(normClass)) {
      detectedLevel = "SMP";
    }

    const studentPayload: Omit<StudentItem, "id"> = {
      name: formData.name.trim(),
      classGrade: normClass,
      gender: formData.gender,
      parentName: formData.parentName.trim(),
      // Nilai default untuk kompatibilitas data & ekspor
      nisn: editingStudent?.nisn || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      nis: editingStudent?.nis || `2526${Math.floor(10000 + Math.random() * 90000)}`,
      educationLevel: detectedLevel,
      academicYear: editingStudent?.academicYear || "2025/2026",
      status: editingStudent?.status || "Aktif",
      category: editingStudent?.category || "Reguler",
      parentPhone: editingStudent?.parentPhone || "-",
      tuitionStatus: editingStudent?.tuitionStatus || "Lunas",
      averageGrade: editingStudent?.averageGrade || 85,
      achievementsCount: editingStudent?.achievementsCount || 0,
      address: editingStudent?.address || "",
      notes: editingStudent?.notes || ""
    };

    if (editingStudent) {
      onUpdateStudent({
        ...studentPayload,
        id: editingStudent.id
      });
    } else {
      onAddStudent(studentPayload);
    }
    setIsAddModalOpen(false);
    setEditingStudent(null);
  };

  const handleExportCSV = () => {
    const exportRows = filteredStudents.map((s, idx) => ({
      "No": idx + 1,
      "Nama Siswa": s.name,
      "Kelas": s.classGrade,
      "Jenis Kelamin": s.gender === "P" ? "Perempuan" : "Laki-laki",
      "Nama Orang Tua": s.parentName || "-"
    }));
    exportToCSV(`Data_Siswa_${new Date().toISOString().split("T")[0]}.csv`, exportRows);
  };

  const handleExportClassCSV = (targetClassName: string, classStudents: StudentItem[]) => {
    const exportRows = classStudents.map((s, idx) => ({
      "No": idx + 1,
      "Nama Siswa": s.name,
      "Kelas": s.classGrade,
      "Jenis Kelamin": s.gender === "P" ? "Perempuan" : "Laki-laki",
      "Nama Orang Tua": s.parentName || "-"
    }));
    const safeName = targetClassName.replace(/[^a-zA-Z0-9]/g, "_");
    exportToCSV(`Data_Siswa_${safeName}_${new Date().toISOString().split("T")[0]}.csv`, exportRows);
  };

  const handleOpenPrintClass = (classNameTitle: string, level: EducationLevel, classStudents: StudentItem[]) => {
    setPrintModalData({
      isOpen: true,
      classNameTitle,
      level,
      students: classStudents
    });
  };

  const toggleClassCollapse = (clsName: string) => {
    setCollapsedClasses(prev => ({
      ...prev,
      [clsName]: !prev[clsName]
    }));
  };

  const handleExpandAll = () => {
    setCollapsedClasses({});
  };

  const handleCollapseAll = () => {
    const allCollapsed = availableClasses.reduce((acc, cls) => {
      acc[cls] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setCollapsedClasses(allCollapsed);
  };

  // Rombel yang ditampilkan pada mode berkelompok (hanya kelas resmi yayasan)
  const classesToRender = availableClasses.filter(clsName => {
    if (classFilter !== "ALL") {
      return clsName.toLowerCase() === classFilter.toLowerCase();
    }
    // Jika ada kata kunci pencarian, tampilkan rombel yang memiliki hasil
    if (search.trim() !== "") {
      const count = filteredStudents.filter(s => s.classGrade.trim().toLowerCase() === clsName.toLowerCase()).length;
      return count > 0;
    }
    return true;
  });

  const allRenderedClassNames: string[] = classesToRender;

  const boysTotal = filteredStudents.filter(s => s.gender === "L").length;
  const girlsTotal = filteredStudents.filter(s => s.gender === "P").length;
  const tuitionPaidTotal = filteredStudents.filter(s => s.tuitionStatus === "Lunas").length;
  const scholarshipTotal = filteredStudents.filter(s => s.category.includes("Beasiswa")).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 p-8 rounded-3xl bg-gradient-to-br from-blue-700 to-blue-600 text-white">
      {/* Unified Top Header Card */}
      <div className="bg-white/10 border border-white/20 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30 shadow-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Data Peserta Didik & Santri
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20">
                  {totalCount} Siswa Terdaftar
                </span>
                {activeRombelCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                    {activeRombelCount} Rombel Aktif
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 mt-1 max-w-3xl">
                Pusat data siswa terpadu, pembagian rombongan belajar (rombel) RA, SDIT, SMP, SMA, kenaikan kelas dan kelulusan.
              </p>
            </div>
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-white/20 backdrop-blur-sm"
              title="Ekspor seluruh data siswa ke file CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
              <span>Ekspor CSV</span>
            </button>

            {onNavigateToAlumni && (
              <button
                onClick={onNavigateToAlumni}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-white/20 backdrop-blur-sm"
                title="Buka direktori Data Alumni"
              >
                <Award className="w-3.5 h-3.5 text-white" />
                <span>Alumni {alumniCount > 0 ? `(${alumniCount})` : ""}</span>
              </button>
            )}

            <button
              onClick={handleOpenBatchPromotion}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-white/20 backdrop-blur-sm"
              title="Proses Kenaikan Kelas & Kelulusan Tingkat Akhir"
            >
              <TrendingUp className="w-3.5 h-3.5 text-white" />
              <span>Kenaikan Kelas</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-white text-blue-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-lg hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sleek Unified Control Bar */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur-sm">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama peserta didik, kelas, nama wali, atau NISN..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-xs md:text-sm bg-white/10 rounded-xl border border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 outline-none transition-all"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white cursor-pointer"
              title="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-white/10 border border-white/20 shrink-0">
            <button
              onClick={() => setViewMode("grouped")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "grouped"
                  ? "bg-white text-blue-700 shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
              title="Tampilkan Berdasarkan Rombongan Belajar (Rombel)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Per Rombel</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-blue-700 shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
              title="Tampilkan Semua dalam Tabel Induk Tunggal"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabel Induk</span>
            </button>
          </div>
        </div>

      {/* Alumni Notice Banner */}
      {alumniCount > 0 && (
        <div className="bg-linear-to-r from-indigo-50/90 to-purple-50/70 border border-indigo-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-indigo-900">
                Terdapat {alumniCount} Peserta Didik Yang Telah Lulus
              </div>
              <p className="text-[11px] text-indigo-700/90 mt-0.5">
                Siswa yang berstatus lulus otomatis dipisahkan dari daftar siswa aktif dan dikelola di <strong>Menu Data Alumni</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIncludeGraduated(!includeGraduated)}
              className="px-2.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036]/80 hover:bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {includeGraduated ? "Sembunyikan Siswa Lulus" : "Tampilkan Juga di Tabel Ini"}
            </button>
            {onNavigateToAlumni && (
              <button
                type="button"
                onClick={onNavigateToAlumni}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu Alumni</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Student Data View: Grouped Per Class OR Full Unified Table */}
      {viewMode === "grouped" ? (
        <div className="space-y-4">
          {allRenderedClassNames.length === 0 ? (
            <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl border border-slate-200 p-8 text-center text-slate-400 dark:text-slate-400">
              Tidak ada data peserta didik yang sesuai dengan pembagian kelas atau pencarian saat ini.
            </div>
          ) : (
            allRenderedClassNames.map((clsName) => {
              const classStudents = filteredStudents.filter(
                s => s.classGrade.trim().toLowerCase() === clsName.toLowerCase()
              );
              const stats = classStatsMap[clsName] || {
                total: classStudents.length,
                boys: classStudents.filter(s => s.gender === "L").length,
                girls: classStudents.filter(s => s.gender === "P").length,
                scholarships: classStudents.filter(s => s.category.includes("Beasiswa")).length,
                tuitionPaid: classStudents.filter(s => s.tuitionStatus === "Lunas").length,
                tuitionUnpaid: classStudents.filter(s => s.tuitionStatus === "Menunggak").length
              };

              // Infer level
              const firstStudent = classStudents[0] || currentLevelActiveStudents.find(s => s.classGrade.trim().toLowerCase() === clsName.toLowerCase());
              const level: EducationLevel = firstStudent
                ? normalizeLevel(firstStudent.educationLevel)
                : (levelFilter !== "ALL" ? levelFilter as EducationLevel : normalizeLevel(clsName));
              const levelDetail = LEVEL_DETAILS[level] || LEVEL_DETAILS["SMA"];

              const isCollapsed = Boolean(collapsedClasses[clsName]);

              return (
                <div
                  key={clsName}
                  className="bg-white/10 border border-white/20 rounded-2xl overflow-hidden transition-all backdrop-blur-sm"
                >
                  {/* Class Card Header */}
                  <div className="px-4 py-3.5 bg-white/5 border-b border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleClassCollapse(clsName)}
                        className="p-1 rounded-md hover:bg-white/20 text-white/70 transition-colors cursor-pointer"
                        title={isCollapsed ? "Buka rincian rombel" : "Tutup rincian rombel"}
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                            <School className="w-4 h-4 text-blue-200" />
                            <span>{clsName}</span>
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-white/20 text-white border-white/20">
                            {levelDetail.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-blue-100 flex-wrap">
                          <span>
                            <strong className="text-white font-semibold">{classStudents.length}</strong> Siswa
                            <span className="text-blue-100/70 font-normal"> ({stats.boys} L • {stats.girls} P)</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Class Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end md:self-auto flex-wrap">
                      <button
                        onClick={() => handleOpenPrintClass(clsName, level, classStudents)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer"
                        title="Cetak format daftar hadir & presensi siswa"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Presensi</span>
                      </button>
                      <button
                        onClick={() => handleExportClassCSV(clsName, classStudents)}
                        disabled={classStudents.length === 0}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20 disabled:opacity-40 cursor-pointer"
                        title="Unduh data siswa kelas ini ke CSV"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Ekspor CSV</span>
                      </button>
                      <button
                        onClick={() => handleOpenAddForClass(clsName, level)}
                        className="px-3 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Tambah siswa ke kelas ini"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Siswa</span>
                      </button>
                    </div>
                  </div>

                  {/* Class Table Body */}
                  {!isCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-[#121417] text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-2.5 w-12 text-center">No</th>
                            <th className="px-4 py-2.5">Nama Siswa</th>
                            <th className="px-4 py-2.5 w-32 text-center">Jenis Kelamin</th>
                            <th className="px-4 py-2.5">Nama Orang Tua</th>
                            <th className="px-4 py-2.5 text-right w-24">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {classStudents.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/20">
                                <div className="space-y-1.5">
                                  <p>Belum ada data siswa di <strong>{clsName}</strong>.</p>
                                  <button
                                    onClick={() => handleOpenAddForClass(clsName, level)}
                                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambahkan Siswa Pertama ke {clsName}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            classStudents.map((std, idx) => {
                              return (
                                <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="px-4 py-3 text-center font-medium text-slate-400 dark:text-slate-500">
                                    {idx + 1}
                                  </td>
                                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white text-sm">
                                    {std.name}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                      std.gender === "P"
                                        ? "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 border border-pink-200 dark:border-pink-900"
                                        : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                                    }`}>
                                      {std.gender === "P" ? "Perempuan" : "Laki-laki"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                                    {std.parentName || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => handleOpenEdit(std)}
                                        title="Edit Siswa"
                                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                        id={`btn-delete-student-${std.id}`}
                                        onClick={() => setStudentToDelete(std)}
                                        title="Hapus Siswa"
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Full Unified Table View */
        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#121417] text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-4 py-3 w-32">Kelas</th>
                  <th className="px-4 py-3 w-32 text-center">Jenis Kelamin</th>
                  <th className="px-4 py-3">Nama Orang Tua</th>
                  <th className="px-4 py-3 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                      Tidak ada data siswa yang sesuai dengan filter atau pencarian saat ini.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std, idx) => {
                    return (
                      <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 text-center font-medium text-slate-400 dark:text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white text-sm">
                          {std.name}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 font-bold text-xs">
                            {std.classGrade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            std.gender === "P"
                              ? "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 border border-pink-200 dark:border-pink-900"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                          }`}>
                            {std.gender === "P" ? "Perempuan" : "Laki-laki"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                          {std.parentName || "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(std)}
                              title="Edit Siswa"
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-delete-student-tbl-${std.id}`}
                              onClick={() => setStudentToDelete(std)}
                              title="Hapus Siswa"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {editingStudent ? "Edit Data Siswa" : "Tambah Siswa Baru"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              {/* 1. Nama Siswa */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121417] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  placeholder="Contoh: Muhammad Rayhan"
                />
              </div>

              {/* 2. Kelas */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kelas / Rombel <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.classGrade}
                  onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold bg-white dark:bg-[#121417] text-slate-800 dark:text-slate-200 text-sm cursor-pointer"
                >
                  {STANDARD_CLASS_ORDER.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {availableClasses.slice(0, 8).map((sug) => (
                    <button
                      type="button"
                      key={sug}
                      onClick={() => setFormData({ ...formData, classGrade: sug })}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        formData.classGrade === sug
                          ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-bold shadow-2xs"
                          : "bg-slate-50 dark:bg-[#121417] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 font-medium"
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Jenis Kelamin */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Kelamin <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: "L" })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      formData.gender === "L"
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-400"
                        : "bg-slate-50 dark:bg-[#121417] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Laki-laki (L)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: "P" })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      formData.gender === "P"
                        ? "bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-400"
                        : "bg-slate-50 dark:bg-[#121417] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Perempuan (P)
                  </button>
                </div>
              </div>

              {/* 4. Nama Orang Tua */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Orang Tua / Wali
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121417] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  placeholder="Contoh: Hendra Gunawan"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-colors shadow-xs shadow-blue-500/20"
                >
                  {editingStudent ? "Simpan Perubahan" : "Tambah Siswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Promotion Modal */}
      <ClassPromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => {
          setIsPromotionModalOpen(false);
          setPromotionTargetStudent(null);
        }}
        students={students}
        initialStudent={promotionTargetStudent}
        onConfirmPromotion={(promoted, summary) => {
          if (onBatchPromoteStudents) {
            onBatchPromoteStudents(promoted, summary);
          } else {
            promoted.forEach(p => onUpdateStudent(p));
          }
        }}
      />

      {/* Official Class Rombel Attendance & Printable Modal */}
      {printModalData && (
        <ClassPrintModal
          isOpen={printModalData.isOpen}
          onClose={() => setPrintModalData(null)}
          classNameTitle={printModalData.classNameTitle}
          level={printModalData.level}
          students={printModalData.students}
        />
      )}

      {/* Iframe-Safe Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!studentToDelete}
        title="Hapus Data Peserta Didik"
        itemName={studentToDelete?.name}
        itemDetail={`NISN: ${studentToDelete?.nisn || "-"} | ${studentToDelete?.classGrade}`}
        confirmButtonText="Hapus Siswa Ini"
        onConfirm={() => {
          if (studentToDelete) {
            onDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onClose={() => setStudentToDelete(null)}
      />
    </div>
  );
};
