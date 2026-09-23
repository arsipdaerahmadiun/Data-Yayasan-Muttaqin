import React, { useState, useMemo, useEffect } from "react";
import { 
  TrendingUp, 
  X, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  GraduationCap, 
  BookOpen, 
  ArrowRight, 
  Users, 
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";
import { StudentItem, EducationLevel } from "../types";
import { normalizeLevel, sortClasses } from "./StudentsView";
import { ALLOWED_CLASSES_BY_LEVEL, ALL_ALLOWED_CLASSES } from "../services/api";

interface ClassPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentItem[];
  initialStudent?: StudentItem | null;
  onConfirmPromotion: (updatedStudents: StudentItem[], summaryMessage: string) => void;
}

export interface PromotionStudentRow {
  student: StudentItem;
  selected: boolean;
  action: "NAIK" | "TETAP" | "LULUS" | "PINDAH_JENJANG";
  targetLevel: EducationLevel;
  targetClass: string;
  targetAcademicYear: string;
  isFinalGrade: boolean;
  customNote?: string;
}

// Helper to determine next academic year
export function getNextAcademicYear(currentYear: string): string {
  const match = currentYear.match(/(\d{4})\/(\d{4})/);
  if (match) {
    const y1 = parseInt(match[1], 10) + 1;
    const y2 = parseInt(match[2], 10) + 1;
    return `${y1}/${y2}`;
  }
  return "2026/2027";
}

// Helper to calculate smart next class based on current class & level
export function calculateNextClass(level: EducationLevel, currentClass: string): {
  nextLevel: EducationLevel;
  nextClass: string;
  isFinalGrade: boolean;
  defaultAction: "NAIK" | "LULUS";
} {
  const normClass = currentClass.trim();

  if (level === "RA") {
    if (/RA\s*A|Kelompok\s*A|TK-?A/i.test(normClass)) {
      return { nextLevel: "RA", nextClass: "RA B", isFinalGrade: false, defaultAction: "NAIK" };
    }
    if (/RA\s*B|Kelompok\s*B|TK-?B/i.test(normClass)) {
      return { nextLevel: "SDIT", nextClass: "KELAS 1", isFinalGrade: true, defaultAction: "LULUS" };
    }
    return { nextLevel: "RA", nextClass: "RA B", isFinalGrade: false, defaultAction: "NAIK" };
  }

  if (level === "SDIT") {
    const match = normClass.match(/(\d+)/);
    if (match) {
      const grade = parseInt(match[1], 10);
      if (grade >= 6) {
        return { nextLevel: "SMP", nextClass: "KELAS 7", isFinalGrade: true, defaultAction: "LULUS" };
      }
      const nextGrade = grade + 1;
      return { 
        nextLevel: "SDIT", 
        nextClass: `KELAS ${nextGrade}`, 
        isFinalGrade: false, 
        defaultAction: "NAIK" 
      };
    }
    return { nextLevel: "SDIT", nextClass: "KELAS 2", isFinalGrade: false, defaultAction: "NAIK" };
  }

  if (level === "SMP") {
    const match = normClass.match(/(\d+)/);
    if (match) {
      const grade = parseInt(match[1], 10);
      if (grade >= 9) {
        return { nextLevel: "SMA", nextClass: "KELAS 10", isFinalGrade: true, defaultAction: "LULUS" };
      }
      const nextGrade = grade + 1;
      return { nextLevel: "SMP", nextClass: `KELAS ${nextGrade}`, isFinalGrade: false, defaultAction: "NAIK" };
    }
    return { nextLevel: "SMP", nextClass: "KELAS 8", isFinalGrade: false, defaultAction: "NAIK" };
  }

  if (level === "SMA") {
    const match = normClass.match(/(\d+)/);
    if (match) {
      const grade = parseInt(match[1], 10);
      if (grade >= 12) {
        return { nextLevel: "SMA", nextClass: "Alumni SMA", isFinalGrade: true, defaultAction: "LULUS" };
      }
      const nextGrade = grade + 1;
      return { nextLevel: "SMA", nextClass: `KELAS ${nextGrade}`, isFinalGrade: false, defaultAction: "NAIK" };
    }
    return { nextLevel: "SMA", nextClass: "KELAS 11", isFinalGrade: false, defaultAction: "NAIK" };
  }

  return { nextLevel: level, nextClass: currentClass, isFinalGrade: false, defaultAction: "NAIK" };
}

export const ClassPromotionModal: React.FC<ClassPromotionModalProps> = ({
  isOpen,
  onClose,
  students,
  initialStudent,
  onConfirmPromotion
}) => {
  // Mode: "MASS" (kolektif/massal) or "SINGLE" (perorangan)
  const [mode, setMode] = useState<"MASS" | "SINGLE">("MASS");

  // Filtering states in MASS mode
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [filterClass, setFilterClass] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Global settings for batch application
  const [globalAcademicYear, setGlobalAcademicYear] = useState<string>("2026/2027");
  const [addAuditNote, setAddAuditNote] = useState<boolean>(true);

  // Rows state for promotion
  const [rows, setRows] = useState<PromotionStudentRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize or re-sync rows whenever modal opens or student filters change
  useEffect(() => {
    if (!isOpen) return;

    if (initialStudent) {
      setMode("SINGLE");
      const normLvl = normalizeLevel(initialStudent.educationLevel);
      const { nextLevel, nextClass, isFinalGrade, defaultAction } = calculateNextClass(normLvl, initialStudent.classGrade);
      const nextYear = getNextAcademicYear(initialStudent.academicYear || "2025/2026");

      setGlobalAcademicYear(nextYear);
      setRows([
        {
          student: initialStudent,
          selected: true,
          action: defaultAction,
          targetLevel: defaultAction === "LULUS" ? normLvl : nextLevel,
          targetClass: defaultAction === "LULUS" ? (isFinalGrade ? "Lulus (Alumni)" : nextClass) : nextClass,
          targetAcademicYear: nextYear,
          isFinalGrade,
          customNote: `Kenaikan Kelas ${nextYear}`
        }
      ]);
    } else {
      setMode("MASS");
      // Find most common academic year
      const years = students.map(s => s.academicYear).filter(Boolean);
      const baseYear = years[0] || "2025/2026";
      const nextYear = getNextAcademicYear(baseYear);
      setGlobalAcademicYear(nextYear);

      // Map all active students
      const mapped: PromotionStudentRow[] = students
        .filter(s => s.status === "Aktif")
        .map(s => {
          const normLvl = normalizeLevel(s.educationLevel);
          const { nextLevel, nextClass, isFinalGrade, defaultAction } = calculateNextClass(normLvl, s.classGrade);
          const studentNextYear = getNextAcademicYear(s.academicYear || baseYear);

          return {
            student: s,
            selected: true,
            action: defaultAction,
            targetLevel: defaultAction === "LULUS" ? normLvl : nextLevel,
            targetClass: defaultAction === "LULUS" ? (isFinalGrade ? "Lulus (Alumni)" : nextClass) : nextClass,
            targetAcademicYear: studentNextYear,
            isFinalGrade,
            customNote: ""
          };
        });

      setRows(mapped);
    }
  }, [isOpen, initialStudent, students]);

  // Unique classes for filtering in MASS mode (hanya kelas standar resmi yayasan)
  const availableClasses = useMemo(() => {
    if (filterLevel !== "ALL") {
      return ALLOWED_CLASSES_BY_LEVEL[filterLevel as EducationLevel] || [];
    }
    return ALL_ALLOWED_CLASSES;
  }, [filterLevel]);

  // Filtered rows for display in MASS mode
  const displayedRows = useMemo(() => {
    return rows.filter(r => {
      const s = r.student;
      const lvl = normalizeLevel(s.educationLevel);
      if (filterLevel !== "ALL" && lvl !== filterLevel) return false;
      if (filterClass !== "ALL" && s.classGrade !== filterClass) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (s.name || "").toLowerCase().includes(q);
        const matchNisn = (s.nisn || "").toLowerCase().includes(q);
        const matchClass = (s.classGrade || "").toLowerCase().includes(q);
        if (!matchName && !matchNisn && !matchClass) return false;
      }
      return true;
    });
  }, [rows, filterLevel, filterClass, searchQuery]);

  // Statistics
  const selectedRows = useMemo(() => rows.filter(r => r.selected), [rows]);
  const countSelected = selectedRows.length;
  const countNaik = selectedRows.filter(r => r.action === "NAIK").length;
  const countLulus = selectedRows.filter(r => r.action === "LULUS").length;
  const countTetap = selectedRows.filter(r => r.action === "TETAP").length;

  // Toggle single selection
  const handleToggleSelect = (studentId: string) => {
    setRows(prev =>
      prev.map(r => (r.student.id === studentId ? { ...r, selected: !r.selected } : r))
    );
  };

  // Toggle select all in displayed view
  const allDisplayedSelected = displayedRows.length > 0 && displayedRows.every(r => r.selected);
  const handleToggleSelectAll = () => {
    const targetState = !allDisplayedSelected;
    const displayedIds = new Set(displayedRows.map(r => r.student.id));
    setRows(prev =>
      prev.map(r => (displayedIds.has(r.student.id) ? { ...r, selected: targetState } : r))
    );
  };

  // Update a row field
  const handleUpdateRow = (
    studentId: string, 
    field: keyof PromotionStudentRow, 
    value: any
  ) => {
    setRows(prev =>
      prev.map(r => {
        if (r.student.id !== studentId) return r;
        const updated = { ...r, [field]: value };
        
        // If action changed to LULUS, adjust class
        if (field === "action") {
          if (value === "LULUS") {
            updated.targetClass = "Lulus (Alumni)";
          } else if (value === "TETAP") {
            updated.targetClass = r.student.classGrade;
          } else if (value === "NAIK") {
            const normLvl = normalizeLevel(r.student.educationLevel);
            const calc = calculateNextClass(normLvl, r.student.classGrade);
            updated.targetClass = calc.nextClass;
          }
        }
        return updated;
      })
    );
  };

  // Apply batch action to all selected displayed rows
  const handleBatchApplyAction = (actionType: "NAIK" | "TETAP" | "LULUS") => {
    const displayedIds = new Set(displayedRows.filter(r => r.selected).map(r => r.student.id));
    setRows(prev =>
      prev.map(r => {
        if (!displayedIds.has(r.student.id)) return r;
        const normLvl = normalizeLevel(r.student.educationLevel);
        const calc = calculateNextClass(normLvl, r.student.classGrade);

        let targetClass = r.targetClass;
        if (actionType === "LULUS") targetClass = "Lulus (Alumni)";
        else if (actionType === "TETAP") targetClass = r.student.classGrade;
        else if (actionType === "NAIK") targetClass = calc.nextClass;

        return {
          ...r,
          action: actionType,
          targetClass,
          targetAcademicYear: globalAcademicYear
        };
      })
    );
  };

  // Synchronize target academic year to all selected
  const handleApplyGlobalAcademicYear = () => {
    setRows(prev =>
      prev.map(r => (r.selected ? { ...r, targetAcademicYear: globalAcademicYear } : r))
    );
  };

  // Handle final submission
  const handleExecutePromotion = () => {
    if (countSelected === 0) {
      alert("Pilih minimal satu siswa untuk diproses kenaikan kelasnya.");
      return;
    }

    setIsSubmitting(true);
    try {
      const nowStr = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      const updatedStudents: StudentItem[] = [];

      selectedRows.forEach(row => {
        const s = row.student;
        const oldClass = s.classGrade;
        const oldYear = s.academicYear;

        let newStatus = s.status;
        let finalClass = row.targetClass;
        let finalLevel = row.targetLevel;

        if (row.action === "LULUS") {
          newStatus = "Lulus";
          finalClass = row.targetClass || "Lulus (Alumni)";
        } else if (row.action === "TETAP") {
          newStatus = "Aktif";
          finalClass = s.classGrade;
        } else {
          newStatus = "Aktif";
        }

        // Build audit / history note
        let noteAppend = "";
        if (addAuditNote) {
          if (row.action === "NAIK") {
            noteAppend = `[${nowStr}: Naik ke ${finalClass} (TP ${row.targetAcademicYear}) dari ${oldClass}]`;
          } else if (row.action === "LULUS") {
            noteAppend = `[${nowStr}: Dinyatakan Lulus dari ${oldClass} (TP ${oldYear})]`;
          } else if (row.action === "TETAP") {
            noteAppend = `[${nowStr}: Tinggal/Tetap di ${finalClass} (TP ${row.targetAcademicYear})]`;
          }
        }

        const combinedNotes = [s.notes, noteAppend].filter(Boolean).join(" | ");

        const updatedStudent: StudentItem = {
          ...s,
          educationLevel: finalLevel,
          classGrade: finalClass,
          academicYear: row.targetAcademicYear || globalAcademicYear,
          graduationYear: row.action === "LULUS" ? (row.targetAcademicYear || oldYear) : s.graduationYear,
          status: newStatus,
          notes: combinedNotes
        };

        updatedStudents.push(updatedStudent);
      });

      const summary = countLulus > 0
        ? `Berhasil memproses kenaikan kelas untuk ${updatedStudents.length} siswa (${countNaik} naik kelas, ${countLulus} dinyatakan lulus & otomatis dipindahkan ke Menu Alumni, ${countTetap} tetap di kelas).`
        : `Berhasil memproses kenaikan kelas untuk ${updatedStudents.length} siswa (${countNaik} naik kelas, ${countTetap} tetap di kelas).`;
      onConfirmPromotion(updatedStudents, summary);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-purple-300">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  {mode === "SINGLE" ? "Kenaikan Kelas Peserta Didik (Perorangan)" : "Proses Kenaikan Kelas Kolektif"}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-400/20 text-purple-200 border border-purple-300/30">
                  Tahun Ajaran Baru
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">
                {mode === "SINGLE" 
                  ? "Atur kenaikan tingkat, pemindahan jenjang, atau status kelulusan untuk siswa ini." 
                  : "Promosi otomatis kenaikan kelas, pemilihan kelas paralel, dan penentuan kelulusan tingkat akhir."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Bar & Global Parameters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Academic Year Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tahun Ajaran Baru
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={globalAcademicYear}
                  onChange={(e) => setGlobalAcademicYear(e.target.value)}
                  placeholder="2026/2027"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyGlobalAcademicYear}
                  title="Terapkan tahun ajaran ini ke seluruh siswa yang dicentang"
                  className="px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </div>

            {/* Level Filter (in MASS mode) */}
            {mode === "MASS" && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Filter Jenjang Asal
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => {
                    setFilterLevel(e.target.value);
                    setFilterClass("ALL");
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                >
                  <option value="ALL">Semua Jenjang (RA, SDIT, SMP, SMA)</option>
                  <option value="RA">RA (Raudhatul Athfal)</option>
                  <option value="SDIT">SDIT (SD Islam Terpadu)</option>
                  <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                  <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                </select>
              </div>
            )}

            {/* Class Filter (in MASS mode) */}
            {mode === "MASS" && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Filter Kelas Asal
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                >
                  <option value="ALL">Semua Kelas / Rombel</option>
                  {availableClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Batch Actions */}
            {mode === "MASS" && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Aksi Cepat Terpilih
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleBatchApplyAction("NAIK")}
                    className="flex-1 px-2 py-1.5 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    Semua Naik
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBatchApplyAction("LULUS")}
                    className="flex-1 px-2 py-1.5 bg-white border border-purple-300 hover:bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    Semua Lulus
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBatchApplyAction("TETAP")}
                    className="flex-1 px-2 py-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    Semua Tetap
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick info banner */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/80 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>
                Siswa tingkat akhir (<strong className="font-semibold text-slate-800">KELAS 6, KELAS 9, KELAS 12, RA B</strong>) otomatis disarankan status <strong className="font-semibold text-purple-700">Lulus (Alumni)</strong>.
              </span>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                checked={addAuditNote}
                onChange={(e) => setAddAuditNote(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span>Catat mutasi di Riwayat Siswa</span>
            </label>
          </div>
        </div>

        {/* Content Area: Table of students to promote */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedRows.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium">Tidak ada siswa aktif yang cocok dengan filter yang dipilih.</p>
              <button
                onClick={() => {
                  setFilterLevel("ALL");
                  setFilterClass("ALL");
                  setSearchQuery("");
                }}
                className="px-3 py-1 text-xs bg-purple-50 text-purple-700 font-semibold rounded-md hover:bg-purple-100 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={allDisplayedSelected}
                        onChange={handleToggleSelectAll}
                        className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        title="Pilih Semua"
                      />
                    </th>
                    <th className="p-3">Peserta Didik</th>
                    <th className="p-3">Kelas & Tahun Saat Ini</th>
                    <th className="p-3 w-40">Status Kenaikan</th>
                    <th className="p-3">Kelas / Rombel Tujuan</th>
                    <th className="p-3 w-28">TP Baru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {displayedRows.map((row) => {
                    const s = row.student;
                    const normLvl = normalizeLevel(s.educationLevel);

                    return (
                      <tr 
                        key={s.id}
                        className={`transition-colors ${
                          row.selected ? "bg-purple-50/30 hover:bg-purple-50/50" : "opacity-60 bg-slate-50/50 hover:opacity-90"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => handleToggleSelect(s.id)}
                            className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </td>

                        {/* Student Name & NISN */}
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="font-mono">{s.nisn}</span>
                            <span>&bull;</span>
                            <span className={`px-1.5 py-0.2 rounded font-semibold ${
                              normLvl === "RA" ? "bg-amber-100 text-amber-800" :
                              normLvl === "SDIT" ? "bg-emerald-100 text-emerald-800" :
                              normLvl === "SMP" ? "bg-blue-100 text-blue-800" :
                              "bg-purple-100 text-purple-800"
                            }`}>
                              {normLvl}
                            </span>
                            {row.isFinalGrade && (
                              <span className="bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold">
                                Tingkat Akhir
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Current Class & Academic Year */}
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{s.classGrade}</div>
                          <div className="text-[10px] text-slate-500 font-mono">TP: {s.academicYear || "-"}</div>
                        </td>

                        {/* Action Selection */}
                        <td className="p-3">
                          <select
                            disabled={!row.selected}
                            value={row.action}
                            onChange={(e) => handleUpdateRow(s.id, "action", e.target.value)}
                            className={`w-full px-2 py-1 rounded-md text-xs font-semibold border focus:ring-2 focus:ring-purple-500 focus:outline-hidden ${
                              row.action === "NAIK" ? "bg-blue-50 text-blue-800 border-blue-300" :
                              row.action === "LULUS" ? "bg-purple-50 text-purple-800 border-purple-300" :
                              "bg-amber-50 text-amber-800 border-amber-300"
                            }`}
                          >
                            <option value="NAIK">Naik Kelas (+1)</option>
                            <option value="LULUS">Lulus (Alumni)</option>
                            <option value="TETAP">Tinggal / Tetap</option>
                          </select>
                        </td>

                        {/* Target Class Input */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {row.action === "LULUS" ? (
                              <input
                                type="text"
                                disabled
                                value={row.targetClass || "Lulus (Alumni)"}
                                className="w-full px-2 py-1 rounded-md border border-purple-200 bg-purple-50 text-xs font-bold text-purple-700 disabled:opacity-90"
                              />
                            ) : (
                              <select
                                disabled={!row.selected}
                                value={row.targetClass}
                                onChange={(e) => handleUpdateRow(s.id, "targetClass", e.target.value)}
                                className="w-full px-2 py-1 rounded-md border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                {(ALLOWED_CLASSES_BY_LEVEL[row.targetLevel] || ALLOWED_CLASSES_BY_LEVEL.SMA).map(cls => (
                                  <option key={cls} value={cls}>
                                    {cls}
                                  </option>
                                ))}
                              </select>
                            )}
                            {row.action === "NAIK" && (
                              <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            )}
                          </div>
                        </td>

                        {/* Target Academic Year */}
                        <td className="p-3">
                          <input
                            type="text"
                            disabled={!row.selected}
                            value={row.targetAcademicYear}
                            onChange={(e) => handleUpdateRow(s.id, "targetAcademicYear", e.target.value)}
                            placeholder="2026/2027"
                            className="w-full px-2 py-1 rounded-md border border-slate-300 bg-white text-xs font-mono font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden disabled:bg-slate-100"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer with summary badges and execute button */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="font-semibold text-slate-700">
              Total Terpilih: <strong className="font-mono text-purple-700 text-sm">{countSelected}</strong> Siswa
            </span>
            <div className="h-4 w-px bg-slate-300" />
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold text-[11px]">
              {countNaik} Naik Kelas
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-semibold text-[11px]">
              {countLulus} Dinyatakan Lulus
            </span>
            {countTetap > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold text-[11px]">
                {countTetap} Tetap di Kelas
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={countSelected === 0 || isSubmitting}
              onClick={handleExecutePromotion}
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting ? "Memproses..." : `Terapkan Kenaikan Kelas (${countSelected} Siswa)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
