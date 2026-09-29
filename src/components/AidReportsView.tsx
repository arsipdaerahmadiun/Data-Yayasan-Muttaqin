import React, { useState, useMemo, useRef } from "react";
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  Building2, 
  Users2, 
  Coins, 
  Eye, 
  Printer, 
  Download, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  X, 
  Filter, 
  FileText,
  Maximize2,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Check
} from "lucide-react";
import { AidReport, AidReportType, FoundationProfile } from "../types";
import { formatRupiah } from "../services/api";
import { ConfirmDeleteModal } from "./common/ConfirmDeleteModal";
import { 
  DESA_OPTIONS, 
  KELOMPOK_BY_DESA,
  DAERAH_OPTIONS, 
  MONTH_OPTIONS 
} from "../config/aidReportConstants";

interface AidReportsViewProps {
  aidReports: AidReport[];
  onAddAidReport: (report: Omit<AidReport, "id" | "createdAt">) => void;
  onUpdateAidReport: (report: AidReport) => void;
  onDeleteAidReport: (id: string) => void;
  searchTerm?: string;
  readOnly?: boolean;
  foundationProfile?: FoundationProfile;
}

// Helper to resize uploaded images to keep localStorage lightweight and crisp
function resizeImageFile(file: File, maxWidth = 1000, maxHeight = 750, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const AidReportsView: React.FC<AidReportsViewProps> = ({
  aidReports = [],
  onAddAidReport,
  onUpdateAidReport,
  onDeleteAidReport,
  searchTerm = "",
  readOnly = false,
  foundationProfile
}) => {
  // Modal & Form State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [editingReport, setEditingReport] = useState<AidReport | null>(null);
  const [reportToDelete, setReportToDelete] = useState<AidReport | null>(null);

  // Detail Modal / Print view
  const [viewingReport, setViewingReport] = useState<AidReport | null>(null);
  const [isRecapPrintModalOpen, setIsRecapPrintModalOpen] = useState(false);
  const [printLayoutMode, setPrintLayoutMode] = useState<"table" | "detailed">("table");

  // Lightbox Photo Preview
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string } | null>(null);

  // Main Page Filters State
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [desaFilter, setDesaFilter] = useState<string>("ALL");
  const [kelompokFilter, setKelompokFilter] = useState<string>("ALL");
  const [monthFilter, setMonthFilter] = useState<string>("ALL");
  const [yearFilter, setYearFilter] = useState<string>("ALL");
  const [localSearch, setLocalSearch] = useState<string>(searchTerm);

  // Print Modal Specific Filters State (synchronized with main filter on open)
  const [printTypeFilter, setPrintTypeFilter] = useState<string>("ALL");
  const [printDesaFilter, setPrintDesaFilter] = useState<string>("ALL");
  const [printKelompokFilter, setPrintKelompokFilter] = useState<string>("ALL");
  const [printMonthFilter, setPrintMonthFilter] = useState<string>("ALL");
  const [printYearFilter, setPrintYearFilter] = useState<string>("ALL");

  // Form Fields State
  const [formData, setFormData] = useState<{
    // Step 1
    aidType: AidReportType;
    targetName: string;
    targetSelection: string; // value from dropdown or "__MANUAL__"
    customTargetName: string;
    receivedMonth: string;
    receivedYear: number;
    // Step 2
    aidName: string;
    centralAidAmount: number;
    realizationUsage: string;
    budgetPlanAmount: number;
    congregationCharityAmount: number;
    photoBefore: string;
    photoAfter: string;
    notes?: string;
  }>({
    aidType: "DESA",
    targetName: DESA_OPTIONS[0],
    targetSelection: DESA_OPTIONS[0],
    customTargetName: "",
    receivedMonth: MONTH_OPTIONS[new Date().getMonth()] || "Januari",
    receivedYear: new Date().getFullYear(),
    aidName: "",
    centralAidAmount: 0,
    realizationUsage: "",
    budgetPlanAmount: 0,
    congregationCharityAmount: 0,
    photoBefore: "",
    photoAfter: "",
    notes: ""
  });

  const photoBeforeInputRef = useRef<HTMLInputElement>(null);
  const photoAfterInputRef = useRef<HTMLInputElement>(null);

  // Years available in data for filter
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const set = new Set<number>([currentYear, currentYear - 1, currentYear + 1]);
    aidReports.forEach(r => {
      if (r.receivedYear) set.add(Number(r.receivedYear));
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [aidReports]);

  // Normalize string helper for comparison
  const normalize = (str?: string) => (str || "").toLowerCase().replace(/\s+/g, " ").trim();

  // Filtered Aid Reports for Main Page
  const filteredReports = useMemo(() => {
    return aidReports.filter(report => {
      // Type filter
      if (typeFilter !== "ALL" && report.aidType !== typeFilter) return false;

      // Desa filter
      if (desaFilter !== "ALL") {
        const normFilter = normalize(desaFilter);
        const normTarget = normalize(report.targetName);
        if (!normTarget.includes(normFilter) && !normFilter.includes(normTarget)) {
          return false;
        }
      }

      // Kelompok filter
      if (kelompokFilter !== "ALL") {
        const normFilter = normalize(kelompokFilter);
        const normTarget = normalize(report.targetName);
        if (!normTarget.includes(normFilter) && !normFilter.includes(normTarget)) {
          return false;
        }
      }

      // Month filter
      if (monthFilter !== "ALL" && report.receivedMonth !== monthFilter) return false;

      // Year filter
      if (yearFilter !== "ALL" && String(report.receivedYear) !== String(yearFilter)) return false;

      // Search term
      const query = normalize(localSearch);
      if (query) {
        const matchName = normalize(report.aidName).includes(query);
        const matchTarget = normalize(report.targetName).includes(query);
        const matchUsage = normalize(report.realizationUsage).includes(query);
        const matchType = normalize(report.aidType).includes(query);
        if (!matchName && !matchTarget && !matchUsage && !matchType) return false;
      }

      return true;
    }).sort((a, b) => {
      if (b.receivedYear !== a.receivedYear) {
        return (b.receivedYear || 0) - (a.receivedYear || 0);
      }
      return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
    });
  }, [aidReports, typeFilter, desaFilter, kelompokFilter, monthFilter, yearFilter, localSearch]);

  // Aggregate Financial Statistics for Main Page
  const stats = useMemo(() => {
    let totalPusat = 0;
    let totalShodaqoh = 0;
    let totalRAB = 0;

    filteredReports.forEach(r => {
      totalPusat += Number(r.centralAidAmount) || 0;
      totalShodaqoh += Number(r.congregationCharityAmount) || 0;
      totalRAB += Number(r.budgetPlanAmount) || 0;
    });

    const totalDanaMasuk = totalPusat + totalShodaqoh;
    const selisihRAB = totalDanaMasuk - totalRAB;

    return {
      count: filteredReports.length,
      totalPusat,
      totalShodaqoh,
      totalDanaMasuk,
      totalRAB,
      selisihRAB
    };
  }, [filteredReports]);

  // Filtered Reports for Print Modal
  const printFilteredReports = useMemo(() => {
    return aidReports.filter(report => {
      // Type filter
      if (printTypeFilter !== "ALL" && report.aidType !== printTypeFilter) return false;

      // Desa filter
      if (printDesaFilter !== "ALL") {
        const normFilter = normalize(printDesaFilter);
        const normTarget = normalize(report.targetName);
        if (!normTarget.includes(normFilter) && !normFilter.includes(normTarget)) {
          return false;
        }
      }

      // Kelompok filter
      if (printKelompokFilter !== "ALL") {
        const normFilter = normalize(printKelompokFilter);
        const normTarget = normalize(report.targetName);
        if (!normTarget.includes(normFilter) && !normFilter.includes(normTarget)) {
          return false;
        }
      }

      // Month filter
      if (printMonthFilter !== "ALL" && report.receivedMonth !== printMonthFilter) return false;

      // Year filter
      if (printYearFilter !== "ALL" && String(report.receivedYear) !== String(printYearFilter)) return false;

      return true;
    }).sort((a, b) => {
      if (b.receivedYear !== a.receivedYear) {
        return (b.receivedYear || 0) - (a.receivedYear || 0);
      }
      return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
    });
  }, [aidReports, printTypeFilter, printDesaFilter, printKelompokFilter, printMonthFilter, printYearFilter]);

  // Aggregate stats for Print Modal
  const printStats = useMemo(() => {
    let totalPusat = 0;
    let totalShodaqoh = 0;
    let totalRAB = 0;

    printFilteredReports.forEach(r => {
      totalPusat += Number(r.centralAidAmount) || 0;
      totalShodaqoh += Number(r.congregationCharityAmount) || 0;
      totalRAB += Number(r.budgetPlanAmount) || 0;
    });

    const totalDanaMasuk = totalPusat + totalShodaqoh;
    const selisihRAB = totalDanaMasuk - totalRAB;

    return {
      count: printFilteredReports.length,
      totalPusat,
      totalShodaqoh,
      totalDanaMasuk,
      totalRAB,
      selisihRAB
    };
  }, [printFilteredReports]);

  // Open Print Modal & Sync Filters
  const handleOpenPrintModal = () => {
    setPrintTypeFilter(typeFilter);
    setPrintDesaFilter(desaFilter);
    setPrintKelompokFilter(kelompokFilter);
    setPrintMonthFilter(monthFilter);
    setPrintYearFilter(yearFilter);
    setIsRecapPrintModalOpen(true);
  };

  // Handlers for Add/Edit
  const handleOpenAdd = () => {
    setEditingReport(null);
    setCurrentStep(1);
    const initialDesa = DESA_OPTIONS[0];
    setFormData({
      aidType: "DESA",
      targetName: initialDesa,
      targetSelection: initialDesa,
      customTargetName: "",
      receivedMonth: MONTH_OPTIONS[new Date().getMonth()] || "Januari",
      receivedYear: new Date().getFullYear(),
      aidName: "",
      centralAidAmount: 0,
      realizationUsage: "",
      budgetPlanAmount: 0,
      congregationCharityAmount: 0,
      photoBefore: "",
      photoAfter: "",
      notes: ""
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (report: AidReport) => {
    setEditingReport(report);
    setCurrentStep(1);

    // Detect if target is in preset dropdowns
    const currentType = report.aidType || "DESA";
    let selection = "__MANUAL__";
    let custom = report.targetName || "";

    if (currentType === "DESA") {
      const found = DESA_OPTIONS.find(d => normalize(d) === normalize(report.targetName));
      if (found) {
        selection = found;
        custom = "";
      }
    } else if (currentType === "KELOMPOK") {
      // Cari desa untuk kelompok ini
      let foundDesa = "";
      Object.entries(KELOMPOK_BY_DESA).forEach(([desa, kelompokList]) => {
        if (kelompokList.some(k => normalize(k) === normalize(report.targetName))) {
          foundDesa = desa;
        }
      });
      
      const foundKelompok = foundDesa ? report.targetName : "";
      if (foundDesa && foundKelompok) {
        selection = foundKelompok;
        custom = `${foundDesa} - ${foundKelompok}`;
      }
    } else if (currentType === "DAERAH") {
      const found = DAERAH_OPTIONS.find(d => normalize(d) === normalize(report.targetName));
      if (found) {
        selection = found;
        custom = "";
      }
    }

    setFormData({
      aidType: currentType,
      targetName: report.targetName || "",
      targetSelection: selection,
      customTargetName: custom,
      receivedMonth: report.receivedMonth || "Januari",
      receivedYear: Number(report.receivedYear) || new Date().getFullYear(),
      aidName: report.aidName || "",
      centralAidAmount: Number(report.centralAidAmount) || 0,
      realizationUsage: report.realizationUsage || "",
      budgetPlanAmount: Number(report.budgetPlanAmount) || 0,
      congregationCharityAmount: Number(report.congregationCharityAmount) || 0,
      photoBefore: report.photoBefore || "",
      photoAfter: report.photoAfter || "",
      notes: report.notes || ""
    });
    setIsFormModalOpen(true);
  };

  const handleAidTypeChange = (newType: AidReportType) => {
    let defaultTarget = "";
    if (newType === "DESA") {
      defaultTarget = DESA_OPTIONS[0];
    } else if (newType === "KELOMPOK") {
      const firstDesa = DESA_OPTIONS[0];
      defaultTarget = KELOMPOK_BY_DESA[firstDesa][0];
    } else {
      defaultTarget = DAERAH_OPTIONS[0];
    }

    setFormData(prev => ({
      ...prev,
      aidType: newType,
      targetSelection: defaultTarget,
      targetName: defaultTarget,
      customTargetName: newType === "KELOMPOK" ? `${DESA_OPTIONS[0]} - ${defaultTarget}` : ""
    }));
  };

  const handleTargetSelectionChange = (selectionValue: string) => {
    if (selectionValue === "__MANUAL__") {
      setFormData(prev => ({
        ...prev,
        targetSelection: "__MANUAL__",
        targetName: prev.customTargetName || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        targetSelection: selectionValue,
        targetName: selectionValue,
        customTargetName: ""
      }));
    }
  };

  const handleCustomTargetNameChange = (text: string) => {
    setFormData(prev => ({
      ...prev,
      customTargetName: text,
      targetName: text
    }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTarget = formData.targetSelection === "__MANUAL__" 
      ? formData.customTargetName.trim() 
      : formData.targetSelection.trim();

    if (!finalTarget) {
      alert("Mohon isi nama Desa, Kelompok, atau Daerah terlebih dahulu.");
      return;
    }

    setFormData(prev => ({ ...prev, targetName: finalTarget }));
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.aidName.trim()) {
      alert("Mohon isi Nama Bantuan yang dilaporkan.");
      return;
    }

    const submissionData = {
      aidType: formData.aidType,
      targetName: formData.targetName.trim(),
      receivedMonth: formData.receivedMonth,
      receivedYear: Number(formData.receivedYear) || new Date().getFullYear(),
      aidName: formData.aidName.trim(),
      centralAidAmount: Number(formData.centralAidAmount) || 0,
      realizationUsage: formData.realizationUsage.trim(),
      budgetPlanAmount: Number(formData.budgetPlanAmount) || 0,
      congregationCharityAmount: Number(formData.congregationCharityAmount) || 0,
      photoBefore: formData.photoBefore || "",
      photoAfter: formData.photoAfter || "",
      notes: formData.notes || ""
    };

    if (editingReport) {
      onUpdateAidReport({
        ...editingReport,
        ...submissionData,
        updatedAt: new Date().toISOString()
      });
    } else {
      onAddAidReport(submissionData);
    }

    setIsFormModalOpen(false);
  };

  // Image upload handlers
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "photoBefore" | "photoAfter") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await resizeImageFile(file);
      setFormData(prev => ({
        ...prev,
        [field]: compressedDataUrl
      }));
    } catch (err) {
      console.error("Gagal memproses gambar:", err);
      alert("Gagal membaca file gambar. Silakan coba file gambar lain.");
    }
  };

  const handleRemovePhoto = (field: "photoBefore" | "photoAfter") => {
    setFormData(prev => ({
      ...prev,
      [field]: ""
    }));
  };

  // Export to CSV helper
  const handleDownloadCSV = (reportsToExport = filteredReports, prefix = "Rekapan_Laporan_Bantuan") => {
    if (reportsToExport.length === 0) {
      alert("Tidak ada data laporan bantuan untuk diunduh.");
      return;
    }

    const headers = [
      "No",
      "Jenis Bantuan",
      "Nama Desa / Kelompok / Wilayah",
      "Bulan Diterima",
      "Tahun",
      "Nama Bantuan",
      "Total Bantuan Dari Pusat (Rp)",
      "Shodaqoh Jamaah (Rp)",
      "Total Dana Diterima (Rp)",
      "Rencana Anggaran Biaya / RAB (Rp)",
      "Selisih Realisasi (Rp)",
      "Realisasi Kegunaan",
      "Foto Sebelum Tersedia",
      "Foto Sesudah Tersedia"
    ];

    const rows = reportsToExport.map((report, idx) => {
      const pusat = Number(report.centralAidAmount) || 0;
      const shodaqoh = Number(report.congregationCharityAmount) || 0;
      const total = pusat + shodaqoh;
      const rab = Number(report.budgetPlanAmount) || 0;
      const selisih = total - rab;

      const cleanText = (str: string) => `"${(str || "").replace(/"/g, '""').replace(/\n/g, " ")}"`;

      return [
        idx + 1,
        report.aidType,
        cleanText(report.targetName),
        report.receivedMonth,
        report.receivedYear,
        cleanText(report.aidName),
        pusat,
        shodaqoh,
        total,
        rab,
        selisih,
        cleanText(report.realizationUsage),
        report.photoBefore ? "Ya" : "Tidak",
        report.photoAfter ? "Ya" : "Tidak"
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${prefix}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getBadgeStyle = (type: AidReportType) => {
    switch (type) {
      case "DAERAH":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900";
      case "DESA":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
      case "KELOMPOK":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 p-8 rounded-3xl bg-gradient-to-br from-blue-700 to-blue-600 text-white">
      {/* Unified Top Header Card */}
      <div className="bg-white/10 border border-white/20 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30 shadow-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  Laporan Bantuan
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20">
                  Daerah • Desa • Kelompok
                </span>
              </div>
              <p className="text-xs md:text-sm text-blue-100 mt-1">
                Pencatatan resmi penerimaan bantuan dari pusat, realisasi kegunaan, RAB, shodaqoh jamaah, dan dokumentasi foto sebelum-sesudah.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleDownloadCSV(filteredReports)}
              title="Download rekapan format CSV / Excel"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 shadow-lg transition-all cursor-pointer backdrop-blur-sm"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={handleOpenPrintModal}
              title="Cetak lembar laporan resmi dengan filter Nama Kelompok & Nama Desa"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-blue-700 bg-white hover:bg-blue-50 shadow-lg transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan</span>
            </button>

            {!readOnly && (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-blue-700 bg-white hover:bg-blue-50 shadow-lg transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Input Laporan Bantuan</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 mt-5 border-t border-white/20">
          {[
            { label: 'Total Laporan', value: stats.count, icon: FileText, color: 'text-white' },
            { label: 'Total Bantuan Pusat', value: formatRupiah(stats.totalPusat), icon: Coins, color: 'text-emerald-200' },
            { label: 'Total Shodaqoh', value: formatRupiah(stats.totalShodaqoh), icon: Coins, color: 'text-purple-200' },
            { label: 'Total RAB', value: formatRupiah(stats.totalRAB), icon: Coins, color: 'text-blue-100' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-100">
                <span className="text-xs font-semibold">{item.label}</span>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="mt-2 text-lg font-bold text-white truncate">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Cari kata kunci nama bantuan, desa, kelompok, atau realisasi penggunaan..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs md:text-sm text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 outline-none transition-all"
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
      </div>

      {/* Main Recap Table */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#121417] border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5 w-28">Periode</th>
                <th className="p-3.5 w-48">Jenis & Sasaran</th>
                <th className="p-3.5">Nama Bantuan & Realisasi</th>
                <th className="p-3.5 text-right w-36">Bantuan Pusat</th>
                <th className="p-3.5 text-right w-32">Shodaqoh Jamaah</th>
                <th className="p-3.5 text-right w-36">RAB (Biaya)</th>
                <th className="p-3.5 w-28 text-center">Dokumentasi</th>
                <th className="p-3.5 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-400 dark:text-slate-500">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-500" />
                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                      Belum ada data laporan bantuan yang sesuai filter
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Silakan sesuaikan pilihan dropdown filter atau klik tombol "Input Laporan Bantuan" untuk menambah data baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report, idx) => {
                  const pusat = Number(report.centralAidAmount) || 0;
                  const shodaqoh = Number(report.congregationCharityAmount) || 0;
                  const total = pusat + shodaqoh;
                  const rab = Number(report.budgetPlanAmount) || 0;

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 text-center font-medium text-slate-400">
                        {idx + 1}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{report.receivedMonth} {report.receivedYear}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeStyle(report.aidType)}`}>
                            {report.aidType}
                          </span>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            {report.aidType === "DAERAH" && <MapPin className="w-3 h-3 text-blue-500 shrink-0" />}
                            {report.aidType === "DESA" && <Building2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                            {report.aidType === "KELOMPOK" && <Users2 className="w-3 h-3 text-purple-500 shrink-0" />}
                            <span className="truncate max-w-[170px]">{report.targetName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-[13px]">
                          {report.aidName}
                        </div>
                        {report.realizationUsage && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {report.realizationUsage}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(pusat)}
                      </td>

                      <td className="p-3.5 text-right font-semibold text-purple-600 dark:text-purple-400">
                        {formatRupiah(shodaqoh)}
                      </td>

                      <td className="p-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                        <div>{formatRupiah(rab)}</div>
                        <div className="text-[10px] text-slate-400">
                          Masuk: {formatRupiah(total)}
                        </div>
                      </td>

                      {/* Photo Thumbnail Previews */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {report.photoBefore ? (
                            <button
                              type="button"
                              onClick={() => setLightboxPhoto({ url: report.photoBefore!, title: `Foto Sebelum - ${report.aidName}` })}
                              className="relative group w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer hover:ring-2 hover:ring-blue-500"
                              title="Lihat Foto Sebelum"
                            >
                              <img src={report.photoBefore} alt="Sebelum" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Maximize2 className="w-3 h-3" />
                              </div>
                            </button>
                          ) : (
                            <span className="w-8 h-8 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-300">
                              -
                            </span>
                          )}

                          {report.photoAfter ? (
                            <button
                              type="button"
                              onClick={() => setLightboxPhoto({ url: report.photoAfter!, title: `Foto Sesudah - ${report.aidName}` })}
                              className="relative group w-8 h-8 rounded-lg overflow-hidden border border-emerald-300 dark:border-emerald-700 cursor-pointer hover:ring-2 hover:ring-emerald-500"
                              title="Lihat Foto Sesudah"
                            >
                              <img src={report.photoAfter} alt="Sesudah" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Maximize2 className="w-3 h-3" />
                              </div>
                            </button>
                          ) : (
                            <span className="w-8 h-8 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-300">
                              -
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingReport(report)}
                            title="Lihat Rincian / Cetak Berita Acara"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {!readOnly && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(report)}
                                title="Edit Laporan"
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setReportToDelete(report)}
                                title="Hapus Laporan"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
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

      {/* ========================================================================= */}
      {/* 2-STEP INPUT / EDIT MODAL WIZARD                                          */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingReport ? "Ubah Laporan Bantuan" : "Input Laporan Bantuan Baru"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Langkah {currentStep} dari 2: {currentStep === 1 ? "Jenis Bantuan & Sasaran Wilayah" : "Rincian Bantuan, Anggaran & Foto"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 pt-4 pb-2 bg-slate-50/30 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-1" />
                
                {/* Step 1 Indicator */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                    currentStep === 1
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                  <span>1. Jenis & Wilayah</span>
                </button>

                {/* Step 2 Indicator */}
                <button
                  type="button"
                  onClick={() => {
                    if (formData.targetName.trim()) setCurrentStep(2);
                  }}
                  disabled={!formData.targetName.trim()}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    currentStep === 2
                      ? "bg-blue-600 text-white shadow-xs cursor-pointer"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                  <span>2. Rincian & Foto</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* ============================================================== */}
              {/* STEP 1: PILIH JENIS BANTUAN, NAMA DESA/KELOMPOK, BULAN, TAHUN */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <form id="step-1-form" onSubmit={handleNextStep} className="space-y-4">
                  <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-0.5">Klasifikasi Wilayah & Periode Penerimaan:</p>
                    <p className="opacity-90">
                      Pilih jenis bantuan (Daerah, Desa, Kelompok). Nama desa dan kelompok telah dilengkapi dropdown otomatis sesuai data yayasan.
                    </p>
                  </div>

                  {/* 1. PILIH JENIS BANTUAN : DROPDOWN : DAERAH-DESA-KELOMPOK */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      1. PILIH JENIS BANTUAN <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["DAERAH", "DESA", "KELOMPOK"] as AidReportType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleAidTypeChange(type)}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                            formData.aidType === type
                              ? "bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-600 dark:text-blue-300 shadow-2xs"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {type === "DAERAH" && <MapPin className="w-4 h-4 text-blue-500" />}
                          {type === "DESA" && <Building2 className="w-4 h-4 text-emerald-500" />}
                          {type === "KELOMPOK" && <Users2 className="w-4 h-4 text-purple-500" />}
                          <span>{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. MENGISI NAMA DESA ATAU KELOMPOK (DROPDOWN + OPTION MANUAL) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      2. MENGISI NAMA {formData.aidType === "DAERAH" ? "DAERAH" : formData.aidType === "DESA" ? "DESA" : "KELOMPOK"} <span className="text-rose-500">*</span>
                    </label>

                    {formData.aidType === "DESA" && (
                      <div className="space-y-2">
                        <select
                          value={formData.targetSelection}
                          onChange={(e) => handleTargetSelectionChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                          {DESA_OPTIONS.map((desa) => (
                            <option key={desa} value={desa}>{desa}</option>
                          ))}
                          <option value="__MANUAL__">-- Masukkan Nama Desa Lainnya (Manual) --</option>
                        </select>
                        {formData.targetSelection === "__MANUAL__" && (
                          <input
                            type="text"
                            required
                            value={formData.customTargetName}
                            onChange={(e) => handleCustomTargetNameChange(e.target.value)}
                            placeholder="Ketikkan nama desa/kelurahan..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        )}
                      </div>
                    )}

                    {formData.aidType === "KELOMPOK" && (
                      <div className="space-y-2">
                        {/* Pilih Desa Terlebih Dahulu */}
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-2">Pilih Desa Asal Kelompok</label>
                        <select
                          value={formData.customTargetName.split(" - ")[0] || DESA_OPTIONS[0]}
                          onChange={(e) => {
                            const selectedDesa = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              targetSelection: KELOMPOK_BY_DESA[selectedDesa][0],
                              targetName: KELOMPOK_BY_DESA[selectedDesa][0],
                              customTargetName: `${selectedDesa} - ${KELOMPOK_BY_DESA[selectedDesa][0]}`
                            }));
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                          {DESA_OPTIONS.map((desa) => (
                            <option key={desa} value={desa}>{desa}</option>
                          ))}
                        </select>

                        {/* Pilih Kelompok Berdasarkan Desa */}
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-2">Pilih Kelompok</label>
                        <select
                          value={formData.targetSelection}
                          onChange={(e) => handleTargetSelectionChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                          {(KELOMPOK_BY_DESA[formData.customTargetName.split(" - ")[0] || DESA_OPTIONS[0]] || []).map((kelompok) => (
                            <option key={kelompok} value={kelompok}>{kelompok}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formData.aidType === "DAERAH" && (
                      <div className="space-y-2">
                        <select
                          value={formData.targetSelection}
                          onChange={(e) => handleTargetSelectionChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                          {DAERAH_OPTIONS.map((daerah) => (
                            <option key={daerah} value={daerah}>{daerah}</option>
                          ))}
                          <option value="__MANUAL__">-- Masukkan Nama Daerah Lainnya (Manual) --</option>
                        </select>
                        {formData.targetSelection === "__MANUAL__" && (
                          <input
                            type="text"
                            required
                            value={formData.customTargetName}
                            onChange={(e) => handleCustomTargetNameChange(e.target.value)}
                            placeholder="Contoh: Daerah Jawa Timur II / Madiun Raya"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. BANTUAN DITERIMA BULAN & 4. TAHUN PENERIMAAN BANTUAN */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        3. BANTUAN DITERIMA BULAN <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.receivedMonth}
                        onChange={(e) => setFormData({ ...formData, receivedMonth: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        {MONTH_OPTIONS.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        4. TAHUN PENERIMAAN BANTUAN <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={2000}
                        max={2099}
                        value={formData.receivedYear}
                        onChange={(e) => setFormData({ ...formData, receivedYear: Number(e.target.value) || new Date().getFullYear() })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </form>
              )}

              {/* ============================================================== */}
              {/* STEP 2: MASUK HALAMAN BERIKUTNYA ISI (1-6)                     */}
              {/* ============================================================== */}
              {currentStep === 2 && (
                <form id="step-2-form" onSubmit={handleFinalSubmit} className="space-y-4">
                  {/* Summary badge of Step 1 */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBadgeStyle(formData.aidType)}`}>
                        {formData.aidType}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formData.targetName}
                      </span>
                      <span className="text-slate-400">
                        • {formData.receivedMonth} {formData.receivedYear}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-semibold cursor-pointer"
                    >
                      Ubah Wilayah
                    </button>
                  </div>

                  {/* 1. Nama bantuan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      1. Nama Bantuan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.aidName}
                      onChange={(e) => setFormData({ ...formData, aidName: e.target.value })}
                      placeholder="Contoh: Bantuan Renovasi Asrama Santri & Sarana Air Bersih"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Financial Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 2. Total bantuan dari pusat */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          2. Total Bantuan Dari Pusat (Rp)
                        </label>
                        <span className="text-[11px] font-bold text-emerald-600">
                          {formatRupiah(formData.centralAidAmount)}
                        </span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={formData.centralAidAmount || ""}
                        onChange={(e) => setFormData({ ...formData, centralAidAmount: Number(e.target.value) || 0 })}
                        placeholder="Contoh: 50000000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>

                    {/* 4. Rencana Anggaran Biaya (RAB) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          4. Rencana Anggaran Biaya (RAB) (Rp)
                        </label>
                        <span className="text-[11px] font-bold text-blue-600">
                          {formatRupiah(formData.budgetPlanAmount)}
                        </span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={formData.budgetPlanAmount || ""}
                        onChange={(e) => setFormData({ ...formData, budgetPlanAmount: Number(e.target.value) || 0 })}
                        placeholder="Contoh: 60000000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>

                    {/* 5. Shodaqoh jamaah */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          5. Shodaqoh Jamaah / Swadaya (Rp)
                        </label>
                        <span className="text-[11px] font-bold text-purple-600">
                          {formatRupiah(formData.congregationCharityAmount)}
                        </span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={formData.congregationCharityAmount || ""}
                        onChange={(e) => setFormData({ ...formData, congregationCharityAmount: Number(e.target.value) || 0 })}
                        placeholder="Contoh: 10000000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Total Dana Masuk (Pusat + Shodaqoh):</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatRupiah(Number(formData.centralAidAmount || 0) + Number(formData.congregationCharityAmount || 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Realisasi kegunaan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      3. Realisasi Kegunaan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.realizationUsage}
                      onChange={(e) => setFormData({ ...formData, realizationUsage: e.target.value })}
                      placeholder="Jelaskan secara mendetail realisasi penggunaan dana di lapangan (misal: pemasangan paving, perbaikan atap, pengadaan sarpras, dll)..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* 6. Upload foto sebelum dan sesudah */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      6. Upload Foto Sebelum dan Sesudah
                    </label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Foto Sebelum (Before) */}
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Foto Sebelum (Before)
                          </span>
                          {formData.photoBefore && (
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto("photoBefore")}
                              className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                            >
                              Hapus Foto
                            </button>
                          )}
                        </div>

                        {formData.photoBefore ? (
                          <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 h-36 bg-slate-100 group">
                            <img src={formData.photoBefore} alt="Sebelum" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setLightboxPhoto({ url: formData.photoBefore, title: "Foto Sebelum" })}
                                className="p-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Maximize2 className="w-3 h-3" />
                                <span>Perbesar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => photoBeforeInputRef.current?.click()}
                                className="p-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <span>Ganti</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => photoBeforeInputRef.current?.click()}
                            className="h-36 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 flex flex-col items-center justify-center gap-1.5 text-slate-400 cursor-pointer transition-colors bg-white/50 dark:bg-slate-900/50"
                          >
                            <Upload className="w-5 h-5 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Pilih Foto Sebelum</span>
                            <span className="text-[10px] text-slate-400">JPG, PNG, atau WebP</span>
                          </div>
                        )}
                        <input
                          ref={photoBeforeInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, "photoBefore")}
                        />
                      </div>

                      {/* Foto Sesudah (After) */}
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Foto Sesudah (After)
                          </span>
                          {formData.photoAfter && (
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto("photoAfter")}
                              className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                            >
                              Hapus Foto
                            </button>
                          )}
                        </div>

                        {formData.photoAfter ? (
                          <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 h-36 bg-slate-100 group">
                            <img src={formData.photoAfter} alt="Sesudah" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setLightboxPhoto({ url: formData.photoAfter, title: "Foto Sesudah" })}
                                className="p-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Maximize2 className="w-3 h-3" />
                                <span>Perbesar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => photoAfterInputRef.current?.click()}
                                className="p-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <span>Ganti</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => photoAfterInputRef.current?.click()}
                            className="h-36 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 flex flex-col items-center justify-center gap-1.5 text-slate-400 cursor-pointer transition-colors bg-white/50 dark:bg-slate-900/50"
                          >
                            <Upload className="w-5 h-5 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Pilih Foto Sesudah</span>
                            <span className="text-[10px] text-slate-400">JPG, PNG, atau WebP</span>
                          </div>
                        )}
                        <input
                          ref={photoAfterInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, "photoAfter")}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
              {currentStep === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    form="step-1-form"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs shadow-blue-500/20"
                  >
                    <span>Lanjut ke Halaman 2: Rincian Bantuan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Halaman 1</span>
                  </button>
                  <button
                    type="submit"
                    form="step-2-form"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingReport ? "Simpan Perubahan Laporan" : "Simpan Laporan Bantuan"}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPREHENSIVE CETAK LAPORAN MODAL (WITH DROPDOWNS NAMA KELOMPOK & DESA)   */}
      {/* ========================================================================= */}
      {isRecapPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 my-2 sm:my-4 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:m-0 print:w-full print:rounded-none">
            
            {/* Top Control Bar - Interactive Controls (HIDDEN ON PRINT) */}
            <div className="bg-slate-900 text-white p-4 shrink-0 space-y-3.5 print:hidden border-b border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Format Cetak Laporan Bantuan Resmi
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Pilih nama kelompok atau nama desa melalui dropdown di bawah untuk menyesuaikan lembar cetak
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPrintLayoutMode(printLayoutMode === "table" ? "detailed" : "table")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mode: {printLayoutMode === "table" ? "Rekapitulasi Tabel" : "Berita Acara Rinci & Foto"}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadCSV(printFilteredReports, `Laporan_Bantuan_${printDesaFilter}_${printKelompokFilter}`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Dokumen (PDF)</span>
                  </button>

                  <button
                    onClick={() => setIsRecapPrintModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Specific Print Filter Controls Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-800 text-xs">
                {/* Tingkat */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Jenis / Tingkat Bantuan:
                  </span>
                  <select
                    value={printTypeFilter}
                    onChange={(e) => {
                      setPrintTypeFilter(e.target.value);
                      if (e.target.value === "DESA") setPrintKelompokFilter("ALL");
                      if (e.target.value === "KELOMPOK") setPrintDesaFilter("ALL");
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ALL">Semua Tingkat</option>
                    <option value="DAERAH">Tingkat DAERAH</option>
                    <option value="DESA">Tingkat DESA</option>
                    <option value="KELOMPOK">Tingkat KELOMPOK</option>
                  </select>
                </div>

                {/* Dropdown Nama Desa */}
                <div>
                  <span className="block text-[11px] font-semibold text-emerald-400 mb-1">
                    Nama Desa Dropdown:
                  </span>
                  <select
                    value={printDesaFilter}
                    onChange={(e) => setPrintDesaFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-emerald-500/50 text-xs text-white focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ALL">-- Semua Desa (5 Desa) --</option>
                    {DESA_OPTIONS.map((desa) => (
                      <option key={desa} value={desa}>{desa}</option>
                    ))}
                  </select>
                </div>

                {/* Dropdown Nama Kelompok */}
                <div>
                  <span className="block text-[11px] font-semibold text-purple-400 mb-1">
                    Nama Kelompok Dropdown:
                  </span>
                  <select
                    value={printKelompokFilter}
                    onChange={(e) => setPrintKelompokFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-purple-500/50 text-xs text-white focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="ALL">-- Semua Kelompok (36 Kelompok) --</option>
                    {Object.values(KELOMPOK_BY_DESA).flat().map((kelompok) => (
                      <option key={kelompok} value={kelompok}>{kelompok}</option>
                    ))}
                  </select>
                </div>

                {/* Bulan */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Bulan Penerimaan:
                  </span>
                  <select
                    value={printMonthFilter}
                    onChange={(e) => setPrintMonthFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ALL">Semua Bulan</option>
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Tahun */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Tahun Penerimaan:
                  </span>
                  <select
                    value={printYearFilter}
                    onChange={(e) => setPrintYearFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ALL">Semua Tahun</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Document Printable Area */}
            <div className="p-6 sm:p-8 overflow-y-auto print:overflow-visible print:p-4 text-slate-900 font-sans space-y-6 print-section">
              
              {/* Kop Surat Yayasan */}
              <div className="border-b-2 border-slate-900 pb-3 text-center relative">
                <div className="flex items-center justify-center gap-2 text-slate-900 font-extrabold text-base uppercase tracking-wide">
                  <Building2 className="w-5 h-5 text-emerald-700 inline-block" />
                  <span>{foundationProfile?.name || "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN"}</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  LEMBAGA AMIL, SOSIAL KEMANUSIAAN & PEMBERDAYAAN UMMAT
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  SK Kemenkumham RI: {foundationProfile?.legalNumber || "AHU-0012345.AH.01.04.Tahun 2021"} • Alamat: {foundationProfile?.address || "Jl. Ringin Telu No. 12, Kel. Josenan, Kec. Taman, Kota Madiun"} • Telp: {foundationProfile?.phone || "(0351) 467890"}
                </p>
                <div className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                  LAPORAN PERTANGGUNGJAWABAN REALISASI BANTUAN
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {printKelompokFilter !== "ALL" && (
                    <span className="font-bold text-purple-700">Sasaran: {printKelompokFilter} • </span>
                  )}
                  {printDesaFilter !== "ALL" && (
                    <span className="font-bold text-emerald-700">Wilayah: {printDesaFilter} • </span>
                  )}
                  {printTypeFilter !== "ALL" && (
                    <span>Tingkat: {printTypeFilter} • </span>
                  )}
                  <span>Periode: {printMonthFilter === "ALL" ? "Semua Bulan" : printMonthFilter} {printYearFilter === "ALL" ? "Semua Tahun" : printYearFilter}</span>
                </div>
              </div>

              {/* Financial Executive Summary Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs print:border-slate-400">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Total Bantuan Pusat:</span>
                  <span className="font-bold text-emerald-700 text-sm">{formatRupiah(printStats.totalPusat)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Shodaqoh Jamaah:</span>
                  <span className="font-bold text-purple-700 text-sm">{formatRupiah(printStats.totalShodaqoh)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Total Rencana Anggaran (RAB):</span>
                  <span className="font-bold text-slate-800 text-sm">{formatRupiah(printStats.totalRAB)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Total Dana Diterima:</span>
                  <span className="font-bold text-blue-700 text-sm">{formatRupiah(printStats.totalDanaMasuk)}</span>
                </div>
              </div>

              {/* Print Mode 1: Table Recap */}
              {printLayoutMode === "table" && (
                <div className="space-y-4">
                  <table className="w-full text-left text-[11px] border border-slate-300">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2 text-center w-8 border-r border-slate-300">No</th>
                        <th className="p-2 w-24 border-r border-slate-300">Periode</th>
                        <th className="p-2 w-32 border-r border-slate-300">Tingkat & Sasaran</th>
                        <th className="p-2 border-r border-slate-300">Nama Bantuan & Realisasi</th>
                        <th className="p-2 text-right w-24 border-r border-slate-300">Bantuan Pusat</th>
                        <th className="p-2 text-right w-24 border-r border-slate-300">Shodaqoh</th>
                        <th className="p-2 text-right w-24 border-r border-slate-300">RAB</th>
                        <th className="p-2 text-center w-20">Dokumentasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {printFilteredReports.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                            Tidak ada data laporan bantuan untuk kriteria filter ini.
                          </td>
                        </tr>
                      ) : (
                        printFilteredReports.map((r, i) => (
                          <tr key={r.id} className="align-top">
                            <td className="p-2 text-center border-r border-slate-200">{i + 1}</td>
                            <td className="p-2 border-r border-slate-200 whitespace-nowrap">
                              {r.receivedMonth} {r.receivedYear}
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <span className="font-bold block text-slate-900">{r.targetName}</span>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{r.aidType}</span>
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <span className="font-semibold block text-slate-900">{r.aidName}</span>
                              <p className="text-[10px] text-slate-600 line-clamp-2 mt-0.5">{r.realizationUsage}</p>
                            </td>
                            <td className="p-2 text-right font-medium text-emerald-700 border-r border-slate-200">
                              {formatRupiah(r.centralAidAmount)}
                            </td>
                            <td className="p-2 text-right font-medium text-purple-700 border-r border-slate-200">
                              {formatRupiah(r.congregationCharityAmount)}
                            </td>
                            <td className="p-2 text-right font-medium border-r border-slate-200">
                              {formatRupiah(r.budgetPlanAmount)}
                            </td>
                            <td className="p-2 text-center text-[10px]">
                              {r.photoBefore && r.photoAfter ? (
                                <span className="font-semibold text-emerald-700">Foto Lengkap</span>
                              ) : r.photoBefore || r.photoAfter ? (
                                <span className="text-amber-700">1 Foto</span>
                              ) : (
                                <span className="text-slate-400">Belum Ada</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                      <tr className="font-bold bg-slate-100 border-t-2 border-slate-300">
                        <td colSpan={4} className="p-2 text-right border-r border-slate-300">TOTAL AKUMULASI:</td>
                        <td className="p-2 text-right text-emerald-700 border-r border-slate-300">{formatRupiah(printStats.totalPusat)}</td>
                        <td className="p-2 text-right text-purple-700 border-r border-slate-300">{formatRupiah(printStats.totalShodaqoh)}</td>
                        <td className="p-2 text-right border-r border-slate-300">{formatRupiah(printStats.totalRAB)}</td>
                        <td className="p-2 text-center text-[10px] font-semibold">{printStats.count} Item</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Print Mode 2: Detailed Cards with Photos Before & After */}
              {printLayoutMode === "detailed" && (
                <div className="space-y-6">
                  {printFilteredReports.map((report, idx) => {
                    const pusat = Number(report.centralAidAmount) || 0;
                    const shodaqoh = Number(report.congregationCharityAmount) || 0;
                    const total = pusat + shodaqoh;
                    const rab = Number(report.budgetPlanAmount) || 0;

                    return (
                      <div key={report.id} className="border border-slate-300 rounded-xl p-4 space-y-3 bg-white print:border-slate-400 break-inside-avoid">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Laporan #{idx + 1} • {report.aidType}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{report.aidName}</h4>
                            <p className="text-xs text-slate-600 font-medium">
                              Sasaran: <span className="font-bold text-slate-900">{report.targetName}</span> • Periode: {report.receivedMonth} {report.receivedYear}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block">Total Dana Masuk</span>
                            <span className="text-sm font-bold text-blue-700">{formatRupiah(total)}</span>
                          </div>
                        </div>

                        {/* Financial Table */}
                        <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Bantuan Pusat</span>
                            <span className="font-bold text-emerald-700">{formatRupiah(pusat)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Shodaqoh Jamaah</span>
                            <span className="font-bold text-purple-700">{formatRupiah(shodaqoh)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">RAB (Rencana)</span>
                            <span className="font-bold text-slate-800">{formatRupiah(rab)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Selisih Realisasi</span>
                            <span className={`font-bold ${total - rab >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                              {formatRupiah(total - rab)}
                            </span>
                          </div>
                        </div>

                        {/* Realization Usage */}
                        <div>
                          <span className="text-[11px] font-bold text-slate-700 block mb-0.5">
                            Realisasi Kegunaan di Lapangan:
                          </span>
                          <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap">
                            {report.realizationUsage}
                          </p>
                        </div>

                        {/* Documentation Photos */}
                        <div>
                          <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                            Dokumentasi Fisik Sebelum & Sesudah:
                          </span>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="border border-slate-200 rounded-lg p-2 text-center bg-slate-50">
                              <span className="text-[10px] font-bold text-rose-700 block mb-1">
                                Kondisi Sebelum (Before)
                              </span>
                              {report.photoBefore ? (
                                <img src={report.photoBefore} alt="Sebelum" className="w-full h-36 object-cover rounded-md" />
                              ) : (
                                <div className="h-36 rounded-md bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                                  Foto belum diunggah
                                </div>
                              )}
                            </div>

                            <div className="border border-slate-200 rounded-lg p-2 text-center bg-slate-50">
                              <span className="text-[10px] font-bold text-emerald-700 block mb-1">
                                Kondisi Sesudah (After)
                              </span>
                              {report.photoAfter ? (
                                <img src={report.photoAfter} alt="Sesudah" className="w-full h-36 object-cover rounded-md" />
                              ) : (
                                <div className="h-36 rounded-md bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                                  Foto belum diunggah
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Lembar Tanda Tangan & Pengesahan */}
              <div className="pt-6 grid grid-cols-3 text-center text-xs border-t border-slate-200 print:pt-4">
                <div>
                  <p className="text-slate-500">Penanggung Jawab Sasaran</p>
                  <div className="h-16" />
                  <p className="font-bold underline">
                    {printKelompokFilter !== "ALL" ? printKelompokFilter : printDesaFilter !== "ALL" ? printDesaFilter : "Ketua Wilayah / Sasaran"}
                  </p>
                  <p className="text-[10px] text-slate-400">Penerima Bantuan</p>
                </div>
                <div>
                  <p className="text-slate-500">Administrator Yayasan</p>
                  <div className="h-16" />
                  <p className="font-bold underline">
                    {foundationProfile?.adminName || "Fahmi Maulana Dwi, S.Kom."}
                  </p>
                  <p className="text-[10px] text-slate-400">Pelapor & Rekonsiliasi</p>
                </div>
                <div>
                  <p className="text-slate-500">Mengetahui, Ketua Yayasan</p>
                  <div className="h-16" />
                  <p className="font-bold underline">
                    {foundationProfile?.leaderName || "Drs. H. Ahmad Fauzan, M.Pd."}
                  </p>
                  <p className="text-[10px] text-slate-400">Pimpinan Yayasan</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAIL / BERITA ACARA PER ITEM MODAL                                      */}
      {/* ========================================================================= */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:max-h-none print:w-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50 print:hidden">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBadgeStyle(viewingReport.aidType)}`}>
                  {viewingReport.aidType}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Lembar Laporan Realisasi Bantuan
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-blue-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Lembar Ini</span>
                </button>
                <button
                  onClick={() => setViewingReport(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200 print-section">
              {/* Kop Yayasan */}
              <div className="border-b-2 border-slate-800 pb-3 text-center">
                <h2 className="text-base font-bold tracking-tight uppercase">
                  {foundationProfile?.name || "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN"}
                </h2>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {foundationProfile?.address || "Jl. Ringin Telu No. 12, Kel. Josenan, Kec. Taman, Kota Madiun"}
                </p>
                <p className="text-[10px] text-slate-500">
                  SK Kemenkumham: {foundationProfile?.legalNumber || "AHU-0012345.AH.01.04.Tahun 2021"} • Telp: {foundationProfile?.phone || "(0351) 467890"}
                </p>
                <div className="mt-2 text-xs font-bold underline uppercase tracking-wide">
                  LAPORAN PERTANGGUNGJAWABAN REALISASI BANTUAN
                </div>
              </div>

              {/* Data Umum */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-900/30">
                <div>
                  <span className="text-slate-400 block text-[10px]">Jenis Bantuan:</span>
                  <span className="font-bold">{viewingReport.aidType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Sasaran:</span>
                  <span className="font-bold">{viewingReport.targetName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Periode Penerimaan:</span>
                  <span className="font-semibold">{viewingReport.receivedMonth} {viewingReport.receivedYear}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Bantuan:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{viewingReport.aidName}</span>
                </div>
              </div>

              {/* Tabel Anggaran & Pembiayaan */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">Komponen Pembiayaan</th>
                      <th className="p-2.5 text-right">Nominal (Rupiah)</th>
                      <th className="p-2.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr>
                      <td className="p-2.5 font-medium">Bantuan dari Pusat</td>
                      <td className="p-2.5 text-right font-bold text-emerald-600">{formatRupiah(viewingReport.centralAidAmount)}</td>
                      <td className="p-2.5 text-slate-500 text-[11px]">Dana transfer pusat yayasan</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Shodaqoh Jamaah (Swadaya)</td>
                      <td className="p-2.5 text-right font-semibold text-purple-600">{formatRupiah(viewingReport.congregationCharityAmount)}</td>
                      <td className="p-2.5 text-slate-500 text-[11px]">Partisipasi swadaya jamaah / warga</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-900 font-bold">
                      <td className="p-2.5">Total Dana Diterima (Pusat + Shodaqoh)</td>
                      <td className="p-2.5 text-right font-bold text-blue-600">
                        {formatRupiah(Number(viewingReport.centralAidAmount || 0) + Number(viewingReport.congregationCharityAmount || 0))}
                      </td>
                      <td className="p-2.5 text-slate-500 text-[11px]">Total penerimaan riil</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Rencana Anggaran Biaya (RAB)</td>
                      <td className="p-2.5 text-right font-semibold">{formatRupiah(viewingReport.budgetPlanAmount)}</td>
                      <td className="p-2.5 text-slate-500 text-[11px]">Target rencana anggaran awal</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Realisasi Kegunaan */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Rincian Realisasi Kegunaan di Lapangan:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 leading-relaxed whitespace-pre-wrap">
                  {viewingReport.realizationUsage}
                </p>
              </div>

              {/* Dokumentasi Foto Sebelum & Sesudah */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Dokumentasi Fisik Realisasi (Sebelum & Sesudah):
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-2 text-center bg-slate-50/50">
                    <span className="text-[11px] font-bold text-rose-600 block mb-1.5">
                      Kondisi Sebelum (Before)
                    </span>
                    {viewingReport.photoBefore ? (
                      <img src={viewingReport.photoBefore} alt="Sebelum" className="w-full h-44 object-cover rounded-lg" />
                    ) : (
                      <div className="h-44 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                        Tidak ada foto sebelum
                      </div>
                    )}
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-2 text-center bg-slate-50/50">
                    <span className="text-[11px] font-bold text-emerald-600 block mb-1.5">
                      Kondisi Sesudah (After)
                    </span>
                    {viewingReport.photoAfter ? (
                      <img src={viewingReport.photoAfter} alt="Sesudah" className="w-full h-44 object-cover rounded-lg" />
                    ) : (
                      <div className="h-44 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                        Tidak ada foto sesudah
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lembar Pengesahan */}
              <div className="pt-6 grid grid-cols-2 text-center text-xs">
                <div>
                  <p className="text-slate-500">Penanggung Jawab Wilayah / Sasaran</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{viewingReport.targetName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Administrator Yayasan</p>
                  <div className="h-16" />
                  <p className="font-bold underline">
                    {foundationProfile?.adminName || "Fahmi Maulana Dwi, S.Kom."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX PHOTO MODAL                                                      */}
      {/* ========================================================================= */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxPhoto(null)}
        >
          <div 
            className="max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative border border-slate-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-black/50 text-white flex items-center justify-between text-xs font-semibold">
              <span>{lightboxPhoto.title}</span>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center overflow-auto max-h-[80vh]">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          title="Hapus Laporan Bantuan"
          itemName={reportToDelete.aidName}
          itemDetail={`${reportToDelete.aidType} - ${reportToDelete.targetName} (${reportToDelete.receivedMonth} ${reportToDelete.receivedYear})`}
          message="Apakah Anda yakin ingin menghapus data laporan bantuan ini? Data yang dihapus tidak dapat dipulihkan."
          confirmButtonText="Ya, Hapus Laporan"
          onConfirm={() => {
            onDeleteAidReport(reportToDelete.id);
            setReportToDelete(null);
          }}
          onClose={() => setReportToDelete(null)}
        />
      )}
    </div>
  );
};
