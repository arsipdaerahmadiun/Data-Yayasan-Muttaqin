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
  const [viewMode, setViewMode] = useState<"grouped" | "table">("grouped");
  const [collapsedClasses, setCollapsedClasses] = useState<Record<string, boolean>>({});
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [tuitionFilter, setTuitionFilter] = useState<string>("ALL");
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

  // Form State
  const [formData, setFormData] = useState<Omit<StudentItem, "id">>({
    nisn: "",
    nis: "",
    name: "",
    gender: "L",
    educationLevel: "SMA",
    classGrade: "KELAS 10",
    academicYear: "2025/2026",
    status: "Aktif",
    category: "Reguler",
    parentName: "",
    parentPhone: "",
    tuitionStatus: "Lunas",
    averageGrade: 90,
    achievementsCount: 0,
    address: "",
    notes: ""
  });

  const search = globalSearch || localSearch;

  const alumniCount = students.filter(s => s.status === "Lulus").length;
  const activeStudentsList = students.filter(s => s.status !== "Lulus");

  // Filter siswa aktif sesuai jenjang terpilih
  const currentLevelActiveStudents = activeStudentsList.filter(s => {
    if (levelFilter === "ALL") return true;
    return normalizeLevel(s.educationLevel) === levelFilter;
  });

  // HANYA kelas standar resmi yayasan yang diakomodir. Kelas selain itu dihilangkan.
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
      scholarships: inClass.filter(s => s.category.includes("Beasiswa")).length,
      tuitionPaid: inClass.filter(s => s.tuitionStatus === "Lunas").length,
      tuitionUnpaid: inClass.filter(s => s.tuitionStatus === "Menunggak").length
    };
    return acc;
  }, {} as Record<string, { total: number; boys: number; girls: number; scholarships: number; tuitionPaid: number; tuitionUnpaid: number }>);

  // Total rombel yang memiliki siswa terdaftar
  const activeRombelCount = availableClasses.filter(c => (classStatsMap[c]?.total || 0) > 0).length;

  const filteredStudents = students.filter((std) => {
    // Siswa yang berstatus Lulus masuk ke Menu Alumni secara default
    if (!includeGraduated && std.status === "Lulus") return false;

    const stdLevel = normalizeLevel(std.educationLevel);
    const stdNormalizedClass = normalizeStandardClass(std.classGrade, stdLevel);
    const matchesSearch =
      (std.name || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (std.nisn || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (std.nis || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (std.parentName || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (std.classGrade || "").toLowerCase().includes((search || "").toLowerCase()) ||
      stdNormalizedClass.toLowerCase().includes((search || "").toLowerCase()) ||
      LEVEL_DETAILS[stdLevel]?.label.toLowerCase().includes((search || "").toLowerCase());

    const matchesLevel = levelFilter === "ALL" || stdLevel === levelFilter;
    const matchesClass = classFilter === "ALL" || stdNormalizedClass.trim().toLowerCase() === classFilter.trim().toLowerCase();
    const matchesCategory = categoryFilter === "ALL" || std.category === categoryFilter;
    const matchesTuition = tuitionFilter === "ALL" || std.tuitionStatus === tuitionFilter;

    return matchesSearch && matchesLevel && matchesClass && matchesCategory && matchesTuition;
  });

  const totalCount = includeGraduated ? students.length : activeStudentsList.length;

  // Breakdown statistics per division (khusus siswa aktif terdaftar)
  const statsByLevel = LEVELS.reduce((acc, lvl) => {
    const list = activeStudentsList.filter(s => normalizeLevel(s.educationLevel) === lvl);
    acc[lvl] = {
      count: list.length,
      boys: list.filter(s => s.gender === "L").length,
      girls: list.filter(s => s.gender === "P").length,
      scholarships: list.filter(s => s.category.includes("Beasiswa")).length,
      active: list.filter(s => s.status === "Aktif").length
    };
    return acc;
  }, {} as Record<EducationLevel, { count: number; boys: number; girls: number; scholarships: number; active: number }>);

  const handleOpenAdd = () => {
    const nextNisn = `00${Math.floor(10000000 + Math.random() * 90000000)}`;
    const nextNis = `2526${Math.floor(10000 + Math.random() * 90000)}`;
    const selectedLevel: EducationLevel = (levelFilter !== "ALL" && (levelFilter === "RA" || levelFilter === "SDIT" || levelFilter === "SMP" || levelFilter === "SMA"))
      ? levelFilter
      : "SMA";

    setFormData({
      nisn: nextNisn,
      nis: nextNis,
      name: "",
      gender: "L",
      educationLevel: selectedLevel,
      classGrade: LEVEL_DETAILS[selectedLevel].classSuggestions[0] || "KELAS 10",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Reguler",
      parentName: "",
      parentPhone: "08",
      tuitionStatus: "Lunas",
      averageGrade: 90,
      achievementsCount: 0,
      address: "",
      notes: ""
    });
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (std: StudentItem) => {
    const lvl = normalizeLevel(std.educationLevel);
    const validClass = normalizeStandardClass(std.classGrade, lvl);
    setEditingStudent(std);
    setFormData({
      ...std,
      educationLevel: lvl,
      classGrade: validClass
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nisn.trim()) {
      alert("Mohon lengkapi NISN dan nama peserta didik!");
      return;
    }

    const lvl = normalizeLevel(formData.educationLevel);
    const validClass = normalizeStandardClass(formData.classGrade, lvl);
    const cleanStudentData = {
      ...formData,
      educationLevel: lvl,
      classGrade: validClass
    };

    if (editingStudent) {
      onUpdateStudent({
        ...cleanStudentData,
        id: editingStudent.id
      });
    } else {
      onAddStudent(cleanStudentData);
    }
    setIsAddModalOpen(false);
    setEditingStudent(null);
  };

  const handleExportCSV = () => {
    const exportRows = filteredStudents.map(s => {
      const lvl = normalizeLevel(s.educationLevel);
      return {
        "NISN": s.nisn,
        "NIS": s.nis,
        "Nama Lengkap": s.name,
        "Jenis Kelamin": s.gender === "L" ? "Laki-laki" : "Perempuan",
        "Jenjang Pendidikan": LEVEL_DETAILS[lvl].label,
        "Unit Sekolah": LEVEL_DETAILS[lvl].fullName,
        "Kelas / Tingkat": s.classGrade,
        "Tahun Ajaran": s.academicYear,
        "Kategori Peserta Didik": s.category,
        "Status": s.status,
        "Nama Orang Tua / Wali": s.parentName,
        "No. Kontak Wali": s.parentPhone,
        "Status SPP": s.tuitionStatus,
        "Alamat / Asrama": s.address || "-",
        "Catatan": s.notes || "-"
      };
    });
    exportToCSV(`Data_Peserta_Didik_Yayasan_${new Date().toISOString().split("T")[0]}.csv`, exportRows);
  };

  const handleExportClassCSV = (targetClassName: string, classStudents: StudentItem[]) => {
    const exportRows = classStudents.map((s, idx) => {
      const lvl = normalizeLevel(s.educationLevel);
      return {
        "No": idx + 1,
        "NISN": s.nisn,
        "NIS": s.nis,
        "Nama Lengkap": s.name,
        "Jenis Kelamin": s.gender === "L" ? "Laki-laki" : "Perempuan",
        "Jenjang": LEVEL_DETAILS[lvl].label,
        "Kelas / Rombel": s.classGrade,
        "Tahun Ajaran": s.academicYear,
        "Kategori": s.category,
        "Status Keaktifan": s.status,
        "Nama Orang Tua": s.parentName,
        "No. Telepon": s.parentPhone,
        "Status SPP": s.tuitionStatus,
        "Alamat / Asrama": s.address || "-",
        "Catatan": s.notes || "-"
      };
    });
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

  const handleOpenAddForClass = (targetClass: string, targetLevel: EducationLevel) => {
    const nextNisn = `00${Math.floor(10000000 + Math.random() * 90000000)}`;
    const nextNis = `2526${Math.floor(10000 + Math.random() * 90000)}`;
    setFormData({
      nisn: nextNisn,
      nis: nextNis,
      name: "",
      gender: "L",
      educationLevel: targetLevel,
      classGrade: targetClass,
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Reguler",
      parentName: "",
      parentPhone: "08",
      tuitionStatus: "Lunas",
      averageGrade: 90,
      achievementsCount: 0,
      address: "",
      notes: ""
    });
    setEditingStudent(null);
    setIsAddModalOpen(true);
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
    <div className="space-y-4">
      {/* Sleek Minimalist Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-0.5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Data Peserta Didik</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {totalCount} Siswa
                </span>
                {activeRombelCount > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1a1d21] dark:bg-[#1a1d21] text-slate-600 border border-slate-200">
                    {activeRombelCount} Rombel Aktif
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Pusat data siswa dan pembagian rombel terpadu RA, SDIT, SMP, dan SMA.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-200 hover:bg-slate-50 dark:bg-[#121417] dark:bg-[#121417] hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Ekspor seluruh data siswa ke file CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>Ekspor CSV</span>
          </button>

          {onNavigateToAlumni && (
            <button
              onClick={onNavigateToAlumni}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] hover:bg-indigo-50/60 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Buka direktori Data Alumni"
            >
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Alumni {alumniCount > 0 ? `(${alumniCount})` : ""}</span>
            </button>
          )}

          <button
            onClick={handleOpenBatchPromotion}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] hover:bg-blue-50 text-blue-700 border border-blue-300 hover:border-blue-400 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Proses Kenaikan Kelas & Kelulusan Tingkat Akhir"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Kenaikan Kelas</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Unified Minimalist Toolbar Card */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {/* Row 1: Segmented Jenjang Tabs & Search */}
        <div className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/ dark:bg-[#121417]/50 dark:bg-[#121417]">
          {/* Segmented Jenjang Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl border border-slate-200/90 overflow-x-auto">
            <button
              onClick={() => handleLevelChange("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                levelFilter === "ALL"
                  ? "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({totalCount})
            </button>
            {LEVELS.map((lvl) => {
              const count = statsByLevel[lvl]?.count || 0;
              const isSelected = levelFilter === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => handleLevelChange(lvl)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] text-purple-900 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{lvl}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? "bg-purple-100 text-purple-800 font-bold" : "bg-slate-200/90 text-slate-600"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, NISN, rombel..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 dark:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Compact Filters, Summary Metrics & View Toggle */}
        <div className="p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Compact Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Kelas */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">Kelas:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className={`text-xs py-1 px-2 rounded-lg border outline-none font-medium cursor-pointer transition-colors max-w-[150px] truncate ${
                  classFilter !== "ALL"
                    ? "bg-purple-50 text-purple-900 border-purple-300 font-semibold"
                    : "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                <option value="ALL">Semua Kelas ({currentLevelActiveStudents.length})</option>
                {availableClasses.map((c) => {
                  const stats = classStatsMap[c]?.total || 0;
                  return (
                    <option key={c} value={c}>
                      {c} ({stats})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Filter Kategori */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">Kategori:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`text-xs py-1 px-2 rounded-lg border outline-none font-medium cursor-pointer transition-colors max-w-[150px] truncate ${
                  categoryFilter !== "ALL"
                    ? "bg-purple-50 text-purple-900 border-purple-300 font-semibold"
                    : "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                <option value="ALL">Semua Kategori</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filter Status SPP */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">SPP:</span>
              <select
                value={tuitionFilter}
                onChange={(e) => setTuitionFilter(e.target.value)}
                className={`text-xs py-1 px-2 rounded-lg border outline-none font-medium cursor-pointer transition-colors max-w-[140px] truncate ${
                  tuitionFilter !== "ALL"
                    ? "bg-purple-50 text-purple-900 border-purple-300 font-semibold"
                    : "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                <option value="ALL">Semua Status SPP</option>
                {TUITION_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Reset Filter Button */}
            {(classFilter !== "ALL" || categoryFilter !== "ALL" || tuitionFilter !== "ALL" || localSearch !== "") && (
              <button
                onClick={() => {
                  setClassFilter("ALL");
                  setCategoryFilter("ALL");
                  setTuitionFilter("ALL");
                  setLocalSearch("");
                }}
                className="text-xs px-2 py-1 rounded-md text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset semua filter"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Right: Metrics & View Mode Switcher */}
          <div className="flex items-center gap-3 justify-between lg:justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
            {/* Quick Metrics */}
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <span className="font-bold text-slate-800">{filteredStudents.length} Siswa</span>
              <span className="text-slate-400 dark:text-slate-400 text-[11px]">({boysTotal} L • {girlsTotal} P)</span>
              <span className="text-slate-200">|</span>
              <span className="text-emerald-700 font-semibold">{tuitionPaidTotal} Lunas</span>
              {scholarshipTotal > 0 && (
                <>
                  <span className="text-slate-200">|</span>
                  <span className="text-amber-700 font-semibold">{scholarshipTotal} Beasiswa</span>
                </>
              )}
            </div>

            {/* Expand / Collapse All (Grouped Mode Only) */}
            {viewMode === "grouped" && allRenderedClassNames.length > 1 && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-300">
                <button
                  onClick={handleExpandAll}
                  className="hover:text-purple-600 font-medium px-1.5 py-0.5 rounded hover:bg-slate-100 dark:bg-[#1a1d21] dark:bg-[#1a1d21] transition-colors cursor-pointer"
                >
                  Buka Semua
                </button>
                <span>•</span>
                <button
                  onClick={handleCollapseAll}
                  className="hover:text-purple-600 font-medium px-1.5 py-0.5 rounded hover:bg-slate-100 dark:bg-[#1a1d21] dark:bg-[#1a1d21] transition-colors cursor-pointer"
                >
                  Tutup Semua
                </button>
              </div>
            )}

            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-[#1a1d21] dark:bg-[#1a1d21] border border-slate-200">
              <button
                onClick={() => setViewMode("grouped")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "grouped"
                    ? "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] text-purple-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Kelompokkan siswa per rombel kelas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Per Rombel</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] text-purple-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Tampilkan seluruh data dalam tabel lengkap"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel Lengkap</span>
              </button>
            </div>
          </div>
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
                  className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
                >
                  {/* Class Card Header */}
                  <div className="px-4 py-3.5 bg-slate-50/ dark:bg-[#121417]/90 dark:bg-[#1a1d21] border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleClassCollapse(clsName)}
                        className="p-1 rounded-md hover:bg-slate-200 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
                        title={isCollapsed ? "Buka rincian rombel" : "Tutup rincian rombel"}
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <School className="w-4 h-4 text-purple-600" />
                            <span>{clsName}</span>
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${levelDetail.badge}`}>
                            {levelDetail.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-300 flex-wrap">
                          <span>
                            <strong className="text-slate-800 font-semibold">{classStudents.length}</strong> Siswa Terdaftar
                            <span className="text-slate-400 dark:text-slate-400 font-normal"> ({stats.boys} L • {stats.girls} P)</span>
                          </span>
                          <span>•</span>
                          <span>
                            SPP: <strong className="text-emerald-700 font-semibold">{stats.tuitionPaid} Lunas</strong>
                            {stats.tuitionUnpaid > 0 && (
                              <span className="text-rose-600 font-semibold ml-1">({stats.tuitionUnpaid} Nunggak)</span>
                            )}
                          </span>
                          {stats.scholarships > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-700 font-semibold">
                                {stats.scholarships} Beasiswa
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Class Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end md:self-auto flex-wrap">
                      <button
                        onClick={() => handleOpenPrintClass(clsName, level, classStudents)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-200 hover:bg-slate-100 dark:bg-[#1a1d21] dark:bg-[#1a1d21] text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        title="Cetak format daftar hadir & rekap presensi kelas resmi"
                      >
                        <Printer className="w-3.5 h-3.5 text-purple-600" />
                        <span>Cetak Presensi</span>
                      </button>
                      <button
                        onClick={() => handleExportClassCSV(clsName, classStudents)}
                        disabled={classStudents.length === 0}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-200 hover:bg-slate-100 dark:bg-[#1a1d21] dark:bg-[#1a1d21] text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs disabled:opacity-40 cursor-pointer"
                        title="Unduh data siswa kelas ini dalam file Excel / CSV"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ekspor CSV</span>
                      </button>
                      <button
                        onClick={() => handleOpenAddForClass(clsName, level)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Daftarkan siswa baru langsung ke rombel ini"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Siswa</span>
                      </button>
                    </div>
                  </div>

                  {/* Class Table Body */}
                  {!isCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50/ dark:bg-[#121417]/50 dark:bg-[#121417] text-slate-500 dark:text-slate-300 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2.5 w-10 text-center">No</th>
                            <th className="px-4 py-2.5">NISN / NIS & Nama Siswa</th>
                            <th className="px-4 py-2.5">Kategori Binaan</th>
                            <th className="px-4 py-2.5">Wali & Kontak</th>
                            <th className="px-4 py-2.5">Status SPP</th>
                            <th className="px-4 py-2.5 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {classStudents.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-6 text-center text-slate-400 dark:text-slate-400 bg-slate-50/ dark:bg-[#121417]/30 dark:bg-[#121417]">
                                <div className="space-y-1.5">
                                  <p>Belum ada data peserta didik yang terdaftar di <strong>{clsName}</strong>.</p>
                                  <button
                                    onClick={() => handleOpenAddForClass(clsName, level)}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
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
                                <tr key={std.id} className="hover:bg-slate-50/ dark:bg-[#121417]/80 transition-colors">
                                  <td className="px-4 py-3 text-center font-medium text-slate-400 dark:text-slate-400">
                                    {idx + 1}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                      <span>{std.name}</span>
                                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold">({std.gender})</span>
                                    </div>
                                    <div className="text-[11px] font-mono text-purple-700 font-medium">
                                      NISN: {std.nisn} • NIS: {std.nis}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                      std.category.includes("Beasiswa")
                                        ? "bg-purple-50 text-purple-700 border-purple-200"
                                        : std.category.includes("Asrama")
                                        ? "bg-teal-50 text-teal-700 border-teal-200"
                                        : "bg-slate-100 dark:bg-[#1a1d21] dark:bg-[#1a1d21] text-slate-700 border-slate-200"
                                    }`}>
                                      {std.category}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 space-y-0.5">
                                    <div className="font-medium text-slate-800">{std.parentName || "-"}</div>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-300">
                                      <Phone className="w-2.5 h-2.5" />
                                      <span>{std.parentPhone || "-"}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                      std.tuitionStatus === "Lunas" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                      std.tuitionStatus === "Gratis (Beasiswa)" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                      "bg-rose-50 text-rose-700 border-rose-200"
                                    }`}>
                                      {std.tuitionStatus}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="font-bold text-slate-900 font-mono">Nilai: {std.averageGrade}</div>
                                    <div className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                                      <Award className="w-3 h-3" />
                                      {std.achievementsCount} Prestasi
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => handleOpenSinglePromotion(std)}
                                        title="Proses Kenaikan Kelas / Kelulusan Siswa"
                                        className="p-1.5 text-slate-500 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                      >
                                        <TrendingUp className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleOpenEdit(std)}
                                        title="Edit Peserta Didik"
                                        className="p-1.5 text-slate-500 dark:text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                        id={`btn-delete-student-${std.id}`}
                                        onClick={() => setStudentToDelete(std)}
                                        title="Hapus Peserta Didik"
                                        className="p-1.5 text-slate-400 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
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
        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 dark:bg-[#121417] dark:bg-[#121417] text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">NISN / NIS & Nama</th>
                  <th className="px-4 py-3">Kelas / Rombel</th>
                  <th className="px-4 py-3">Jenjang Peserta Didik</th>
                  <th className="px-4 py-3">Kategori Binaan</th>
                  <th className="px-4 py-3">Wali & Kontak</th>
                  <th className="px-4 py-3">Status SPP</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400 dark:text-slate-400">
                      Tidak ada data peserta didik yang sesuai dengan pembagian jenjang atau pencarian saat ini.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std) => {
                    const lvl = normalizeLevel(std.educationLevel);
                    const detail = LEVEL_DETAILS[lvl];

                    return (
                      <tr key={std.id} className="hover:bg-slate-50/ dark:bg-[#121417]/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{std.name}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold">({std.gender})</span>
                          </div>
                          <div className="text-[11px] font-mono text-purple-700 font-medium">
                            NISN: {std.nisn} • NIS: {std.nis}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          <div className="flex items-center gap-1">
                            <School className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>{std.classGrade}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-300 font-normal">
                            TA {std.academicYear}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${detail.badge}`}>
                              {detail.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            std.category.includes("Beasiswa")
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : std.category.includes("Asrama")
                              ? "bg-teal-50 text-teal-700 border-teal-200"
                              : "bg-slate-100 dark:bg-[#1a1d21] dark:bg-[#1a1d21] text-slate-700 border-slate-200"
                          }`}>
                            {std.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 space-y-0.5">
                          <div className="font-medium text-slate-800">{std.parentName || "-"}</div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-300">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{std.parentPhone || "-"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            std.tuitionStatus === "Lunas" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            std.tuitionStatus === "Gratis (Beasiswa)" ? "bg-purple-50 text-purple-700 border-purple-200" :
                            "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>
                            {std.tuitionStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenSinglePromotion(std)}
                              title="Proses Kenaikan Kelas / Kelulusan Siswa"
                              className="p-1.5 text-slate-500 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(std)}
                              title="Edit Peserta Didik"
                              className="p-1.5 text-slate-500 dark:text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-delete-student-tbl-${std.id}`}
                              onClick={() => setStudentToDelete(std)}
                              title="Hapus Peserta Didik"
                              className="p-1.5 text-slate-400 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                {editingStudent ? "Edit Data Peserta Didik" : "Registrasi Peserta Didik / Santri Baru"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 dark:text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN (Nomor Induk Siswa Nasional)</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="Contoh: 0098765432"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS Lokal Yayasan</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="Contoh: 242501001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Peserta Didik</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-purple-500"
                    placeholder="Contoh: Muhammad Rayhan Al-Ghifari"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as "L" | "P" })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-purple-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenjang Peserta Didik</label>
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => {
                      const newLvl = e.target.value as EducationLevel;
                      setFormData(prev => ({
                        ...prev,
                        educationLevel: newLvl,
                        classGrade: LEVEL_DETAILS[newLvl].classSuggestions[0] || prev.classGrade
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-purple-500 font-medium"
                  >
                    {LEVELS.map(l => (
                      <option key={l} value={l}>
                        {LEVEL_DETAILS[l].label} ({l})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kelas / Rombel Resmi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.classGrade}
                    onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-purple-500 font-bold bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-800"
                  >
                    {LEVEL_DETAILS[formData.educationLevel]?.classSuggestions.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    {LEVEL_DETAILS[formData.educationLevel]?.classSuggestions.map((sug) => (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => setFormData({ ...formData, classGrade: sug })}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                          formData.classGrade === sug
                            ? "bg-purple-100 text-purple-800 border-purple-300 font-bold shadow-2xs"
                            : "bg-slate-50 dark:bg-[#121417] dark:bg-[#121417] text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-[#1a1d21] dark:bg-[#1a1d21] font-medium"
                        }`}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-purple-500"
                    placeholder="2025/2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Keaktifan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-purple-500 font-medium text-xs"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus (Pindah ke Menu Alumni)</option>
                    <option value="Pindah / Mutasi">Pindah / Mutasi</option>
                    <option value="Cuti / Nonaktif">Cuti / Nonaktif</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Binaan</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as StudentCategory })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-purple-500 text-xs"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Pembayaran SPP</label>
                  <select
                    value={formData.tuitionStatus}
                    onChange={(e) => setFormData({ ...formData, tuitionStatus: e.target.value as TuitionStatus })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-purple-500 text-xs"
                  >
                    {TUITION_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              {formData.status === "Lulus" && (
                <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Siswa dengan status <strong>Lulus</strong> akan otomatis dialihkan ke <strong>Menu Data Alumni</strong>.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-purple-500"
                    placeholder="Contoh: Bapak Hendra Gunawan"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Kontak / WA Wali</label>
                  <input
                    type="text"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-purple-500"
                    placeholder="0812-xxxx-xxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Tempat Tinggal / Kamar Asrama</label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-purple-500"
                  placeholder="Alamat rumah atau lokasi kamar santri mukim..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Khusus / Riwayat Prestasi</label>
                <textarea
                  rows={2}
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-purple-500"
                  placeholder="Catatan hafalan Qur'an, prestasi lomba, atau beasiswa..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1a1d21] dark:bg-[#1a1d21] hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {editingStudent ? "Simpan Perubahan" : "Tambah ke Database"}
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
