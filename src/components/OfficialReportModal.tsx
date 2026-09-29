import React, { useEffect, useState, useMemo } from "react";
import { 
  X, 
  Printer, 
  Building2, 
  LogOut, 
  FileText, 
  Filter, 
  MapPin, 
  Users2, 
  RotateCcw,
  CheckCircle2,
  GraduationCap,
  Layers,
  Sparkles
} from "lucide-react";
import { DatabaseStore, AssetItem, StudentItem } from "../types";
import { formatDateIndo } from "../services/api";
import { DESA_OPTIONS, KELOMPOK_OPTIONS, KELOMPOK_BY_DESA } from "../config/aidReportConstants";

interface OfficialReportModalProps {
  data: DatabaseStore;
  onClose: () => void;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({ data, onClose }) => {
  const { profile, assets, employees, students, adminReport } = data;

  // Filter State for Location (Desa & Kelompok)
  const [selectedDesa, setSelectedDesa] = useState<string[]>([]);
  const [selectedKelompok, setSelectedKelompok] = useState<string[]>([]);
  const [displayMode, setDisplayMode] = useState<"ALL" | "ASSETS" | "STUDENTS">("ALL");

  const isFilterActive = selectedDesa.length > 0 || selectedKelompok.length > 0;

  // Compute available kelompok based on selected desa
  const availableKelompok = useMemo(() => {
    if (selectedDesa.length === 0) return KELOMPOK_OPTIONS;
    
    // Gabungkan semua kelompok dari desa-desa yang terpilih
    const allowed = new Set<string>();
    selectedDesa.forEach(desa => {
      KELOMPOK_BY_DESA[desa]?.forEach(k => allowed.add(k));
    });
    return Array.from(allowed);
  }, [selectedDesa]);

  // Clean up selectedKelompok if they are no longer valid for the selected desa
  useEffect(() => {
    if (selectedDesa.length > 0) {
      setSelectedKelompok(prev => prev.filter(k => availableKelompok.includes(k)));
    }
  }, [availableKelompok, selectedDesa]);

  // Normalize string for fuzzy comparison
  const normalize = (str?: string) => (str || "").toLowerCase().replace(/\s+/g, " ").trim();

  // Helper to extract keywords from "Desa Taman" -> "taman", "Kelompok Josenan" -> "josenan"
  const extractKeyword = (option: string) => {
    return normalize(option)
      .replace(/^desa\s+/i, "")
      .replace(/^kelompok\s+/i, "");
  };

  // Filter Assets by Location (Desa & Kelompok)
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Filter by Desa
      if (selectedDesa.length > 0) {
        const matchesDesa = selectedDesa.some(desa => {
          const keyword = extractKeyword(desa);
          const normDesa = normalize(desa);
          const loc = normalize(asset.location);
          const vil = normalize(asset.village);
          const dis = normalize(asset.district);
          const notes = normalize(asset.notes);
          const name = normalize(asset.name);
          
          return vil.includes(keyword) || 
            loc.includes(keyword) || 
            dis.includes(keyword) || 
            notes.includes(keyword) || 
            name.includes(keyword) ||
            loc.includes(normDesa) ||
            vil.includes(normDesa);
        });
        if (!matchesDesa) return false;
      }

      // Filter by Kelompok
      if (selectedKelompok.length > 0) {
        const matchesKelompok = selectedKelompok.some(kel => {
          const keyword = extractKeyword(kel);
          const normKel = normalize(kel);
          const loc = normalize(asset.location);
          const vil = normalize(asset.village);
          const cust = normalize(asset.custodian);
          const notes = normalize(asset.notes);
          const name = normalize(asset.name);
          
          return loc.includes(keyword) || 
            vil.includes(keyword) || 
            cust.includes(keyword) || 
            notes.includes(keyword) || 
            name.includes(keyword) ||
            loc.includes(normKel);
        });
        if (!matchesKelompok) return false;
      }

      return true;
    });
  }, [assets, selectedDesa, selectedKelompok]);

  // Filter Students by Location (Desa & Kelompok)
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Filter by Desa
      if (selectedDesa.length > 0) {
        const matchesDesa = selectedDesa.some(desa => {
          const keyword = extractKeyword(desa);
          const normDesa = normalize(desa);
          const addr = normalize(student.address);
          const notes = normalize(student.notes);
          const parent = normalize(student.parentName);
          
          return addr.includes(keyword) || 
            notes.includes(keyword) || 
            parent.includes(keyword) || 
            addr.includes(normDesa);
        });
        if (!matchesDesa) return false;
      }

      // Filter by Kelompok
      if (selectedKelompok.length > 0) {
        const matchesKelompok = selectedKelompok.some(kel => {
          const keyword = extractKeyword(kel);
          const normKel = normalize(kel);
          const addr = normalize(student.address);
          const notes = normalize(student.notes);
          const cls = normalize(student.classGrade);
          
          return addr.includes(keyword) || 
            notes.includes(keyword) || 
            cls.includes(keyword) ||
            addr.includes(normKel);
        });
        if (!matchesKelompok) return false;
      }

      return true;
    });
  }, [students, selectedDesa, selectedKelompok]);

  // Counts based on active filter
  const effectiveAssetCount = isFilterActive ? filteredAssets.length : assets.length;
  const effectiveTotalAssetUnits = (isFilterActive ? filteredAssets : assets).reduce(
    (acc, curr) => acc + (Number(curr.quantity) || 1), 
    0
  );
  const effectiveStudentCount = isFilterActive ? filteredStudents.length : students.length;
  
  const studentListForStats = isFilterActive ? filteredStudents : students;
  const raCount = studentListForStats.filter(s => String(s.educationLevel).includes("RA") || String(s.educationLevel).includes("TK")).length;
  const sditCount = studentListForStats.filter(s => String(s.educationLevel).includes("SD") || String(s.educationLevel).includes("MI") || String(s.educationLevel).includes("SDIT")).length;
  const smpCount = studentListForStats.filter(s => String(s.educationLevel).includes("SMP") || String(s.educationLevel).includes("MTs")).length;
  const smaCount = studentListForStats.filter(s => String(s.educationLevel).includes("SMA") || String(s.educationLevel).includes("SMK") || String(s.educationLevel).includes("Pondok")).length;
  const totalEmployees = employees.length;

  const handlePrint = () => {
    window.print();
  };

  const handleResetFilter = () => {
    setSelectedDesa([]);
    setSelectedKelompok([]);
    setDisplayMode("ALL");
  };

  // Toggle selection function for desa/kelompok
  const toggleSelection = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string, resetKelompok?: boolean) => {
    setter(prev => {
      const isSelected = prev.includes(item);
      const next = isSelected ? prev.filter(i => i !== item) : [...prev, item];
      return next;
    });
    if (resetKelompok) setSelectedKelompok([]);
  };

  // Keyboard shortcut listener for ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Floating Close Button for screen view */}
      <button
        onClick={onClose}
        title="Tutup Dokumen (ESC)"
        className="fixed top-4 right-4 z-50 p-2.5 bg-slate-900/90 hover:bg-rose-600 text-white rounded-full shadow-2xl border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold print:hidden hover:scale-105 cursor-pointer"
      >
        <X className="w-5 h-5" />
        <span className="hidden sm:inline pr-1">Tutup (ESC)</span>
      </button>

      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 my-4 sm:my-8 overflow-hidden print:border-none print:shadow-none print:m-0 print:max-w-none print:w-full">
        
        {/* Sticky Action Header & Filter Controls - Hidden during print */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
          {/* Main Action Bar */}
          <div className="px-6 py-3 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Dokumen Laporan Kinerja & Akuntabilitas Terpadu
                </h3>
                <p className="text-[11px] text-slate-500">
                  Filter data aset atau siswa berdasarkan kelompok & desa sebelum mencetak
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Cetak / Simpan PDF</span>
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Tutup</span>
              </button>
            </div>
          </div>

          {/* Interactive Filter Toolbar for Kelompok & Desa */}
          <div className="bg-slate-50/90 px-6 py-3 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>Filter Wilayah Laporan:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 max-w-2xl">
                {/* 1. Dropdown Desa */}
                <div className="relative group">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mb-1">
                    <Building2 className="w-3 h-3 text-emerald-600" />
                    <span>Nama Desa:</span>
                  </div>
                  <div className="relative">
                    <div className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 font-medium cursor-pointer flex items-center justify-between"
                         onClick={() => (document.getElementById('desa-dropdown') as HTMLDivElement)?.classList.toggle('hidden')}>
                      <span>{selectedDesa.length === 0 ? "-- Semua Desa --" : `${selectedDesa.length} Desa Terpilih`}</span>
                      <span className="text-[10px]">▼</span>
                    </div>
                    <div id="desa-dropdown" className="hidden absolute z-50 w-full bg-white border border-slate-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                      {DESA_OPTIONS.map((desa) => (
                        <div key={desa} className="px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 cursor-pointer" onClick={() => toggleSelection(setSelectedDesa, desa, true)}>
                          <input type="checkbox" checked={selectedDesa.includes(desa)} readOnly />
                          {desa}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Dropdown Kelompok */}
                <div className="relative group">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mb-1">
                    <Users2 className="w-3 h-3 text-purple-600" />
                    <span>Nama Kelompok:</span>
                  </div>
                  <div className="relative">
                    <div className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 font-medium cursor-pointer flex items-center justify-between"
                         onClick={() => (document.getElementById('kelompok-dropdown') as HTMLDivElement)?.classList.toggle('hidden')}>
                      <span>{selectedKelompok.length === 0 ? "-- Semua Kelompok --" : `${selectedKelompok.length} Kelompok Terpilih`}</span>
                      <span className="text-[10px]">▼</span>
                    </div>
                      <div id="kelompok-dropdown" className="hidden absolute z-50 w-full bg-white border border-slate-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                        {availableKelompok.length > 0 ? (
                          availableKelompok.map((kelompok) => (
                            <div key={kelompok} className="px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 cursor-pointer" onClick={() => toggleSelection(setSelectedKelompok, kelompok)}>
                              <input type="checkbox" checked={selectedKelompok.includes(kelompok)} readOnly />
                              {kelompok}
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-xs text-slate-400 italic">Tidak ada kelompok</div>
                        )}
                      </div>
                  </div>
                </div>

                {/* 3. Tampilan Fokus Bagian Data */}
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mb-1">
                    <Layers className="w-3 h-3 text-blue-600" />
                    <span>Fokus Bagian:</span>
                  </div>
                  <select
                    value={displayMode}
                    onChange={(e) => setDisplayMode(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="ALL">Semua Data (Aset & Siswa)</option>
                    <option value="ASSETS">Fokus Data Aset</option>
                    <option value="STUDENTS">Fokus Data Siswa</option>
                  </select>
                </div>
              </div>

              {/* Status pill & Reset button */}
              <div className="flex items-center gap-2">
                {isFilterActive ? (
                  <button
                    onClick={handleResetFilter}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Filter</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">
                    Menampilkan seluruh data yayasan
                  </span>
                )}
              </div>
            </div>

            {/* Quick Match Count Indicator */}
            {isFilterActive && (
              <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-700">Hasil filter wilayah:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {filteredAssets.length} Aset Terdata
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                    {filteredStudents.length} Siswa Terdata
                  </span>
                </div>
                <span className="text-slate-500 text-[10px]">
                  * Data pada lembar cetak di bawah otomatis disesuaikan secara real-time
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 md:p-10 space-y-6 text-slate-900 font-serif print-section">
          {/* Official Letterhead (KOP SURAT YAYASAN) */}
          <div className="text-center pb-4 border-b-2 border-slate-900 relative">
            <div className="flex items-start justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-start justify-center font-bold text-xl shrink-0 print:border print:border-black">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-slate-900 font-sans">
                  {profile.name}
                </h1>
                <p className="text-xs font-sans text-slate-700 font-semibold">
                  SK Kemenkumham RI: {profile.legalNumber} • Reg: {profile.registrationNo}
                </p>
              </div>
            </div>
            <p className="text-[11px] font-sans text-slate-600 mt-1 max-w-2xl mx-auto">
              {profile.address} | Telp: {profile.phone} | Email: {profile.email}
            </p>
          </div>

          {/* Document Title & Filter Header */}
          <div className="text-center space-y-1 font-sans">
            <h2 className="text-base md:text-lg font-bold uppercase underline tracking-wider">
              LAPORAN KINERJA EKSEKUTIF & AKUNTABILITAS TATA KELOLA YAYASAN
            </h2>
            <div className="text-xs text-slate-700 font-medium">
              Periode Pelaporan: <strong>{adminReport.period}</strong> | Nomor Dokumen: <strong>LAP/YAS/{new Date().getFullYear()}/{Math.floor(1000 + Math.random() * 9000)}</strong>
            </div>

            {/* Location Specific Banner on Document (visible in print too) */}
            {isFilterActive ? (
              <div className="mt-2 inline-block px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800">
                <span>LOKASI WILAYAH BINAAN: </span>
                {selectedDesa.length > 0 && (
                  <span className="text-emerald-700 font-extrabold">[{selectedDesa.join(", ")}] </span>
                )}
                {selectedKelompok.length > 0 && (
                  <span className="text-purple-700 font-extrabold">[{selectedKelompok.join(", ")}]</span>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic mt-1">
                Cakupan Laporan: Konsolidasi Terpadu Seluruh Unit & Wilayah Binaan Yayasan
              </p>
            )}
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2 font-sans">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                I. Ringkasan Eksekutif Sistem Basis Data Terpadu
              </h3>
              {isFilterActive && (
                <span className="text-[10px] text-emerald-700 font-semibold">
                  (Data Disesuaikan Berdasarkan Wilayah Terpilih)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              Berdasarkan pemantauan sistem basis data terpadu dan proses verifikasi sinkronisasi pada tanggal {formatDateIndo(new Date().toISOString())}
              {isFilterActive ? ` untuk wilayah spesifik ${selectedDesa.length > 0 ? selectedDesa.join(", ") : ""} ${selectedKelompok.length > 0 ? selectedKelompok.join(", ") : ""}` : ""}
              , tata kelola sumber daya {profile.name} mencatat rekapitulasi operasional sebagai berikut:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                  {isFilterActive ? "Aset di Wilayah Ini" : "Total Inventaris Aset"}
                </span>
                <span className="text-xs font-bold font-mono text-slate-900">
                  {effectiveAssetCount} Item Terdata
                </span>
                <span className="text-[9px] text-slate-500 block">{effectiveTotalAssetUnits} Unit Fisik</span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                  {isFilterActive ? "Siswa di Wilayah Ini" : "Peserta Didik (Siswa)"}
                </span>
                <span className="text-xs font-bold font-mono text-slate-900">
                  {effectiveStudentCount} Siswa
                </span>
                <span className="text-[9px] text-slate-600 block mt-0.5 font-medium">
                  RA: {raCount} • SDIT: {sditCount} • SMP: {smpCount} • SMA: {smaCount}
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">SDM & Tenaga Pendidik</span>
                <span className="text-xs font-bold font-mono text-slate-900">{totalEmployees} Pegawai</span>
                <span className="text-[9px] text-emerald-700 block font-medium">Status Aktif & Terdata</span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Skor Akuntabilitas</span>
                <span className="text-xs font-bold font-mono text-amber-700">{adminReport.overallRating}% (A+)</span>
                <span className="text-[9px] text-slate-500 block">{adminReport.tasksCompleted} Tugas Terselesaikan</span>
              </div>
            </div>
          </div>

          {/* Section 2: Asset Inventory Summary Table */}
          {(displayMode === "ALL" || displayMode === "ASSETS") && (
            <div className="space-y-2 font-sans break-inside-avoid">
              <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  II. Rekapitulasi Inventaris Aset & Sarana Prasarana
                  {selectedDesa.length > 0 || selectedKelompok.length > 0 ? (
                    <span className="text-emerald-700 font-bold ml-1">
                      ({selectedDesa.length > 0 ? selectedDesa.join(", ") : ""} {selectedKelompok.length > 0 ? selectedKelompok.join(", ") : ""})
                    </span>
                  ) : (
                    " Pokok Yayasan"
                  )}
                </h3>
                <span className="text-[10px] font-semibold text-slate-500">
                  Total: {filteredAssets.length} Aset
                </span>
              </div>

              {filteredAssets.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded">
                  Tidak ditemukan catatan aset fisik yang terdaftar pada lokasi {selectedDesa.length > 0 ? selectedDesa.join(", ") : ""} {selectedKelompok.length > 0 ? selectedKelompok.join(", ") : ""}.
                </div>
              ) : (
                <table className="w-full text-left text-[11px] border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                    <tr>
                      <th className="p-1.5 border-r border-slate-300 w-8 text-center">No</th>
                      <th className="p-1.5 border-r border-slate-300">Kode</th>
                      <th className="p-1.5 border-r border-slate-300">Nama Aset</th>
                      <th className="p-1.5 border-r border-slate-300">Kategori</th>
                      <th className="p-1.5 border-r border-slate-300">Lokasi / Wilayah</th>
                      <th className="p-1.5 border-r border-slate-300 text-center">Kuantitas</th>
                      <th className="p-1.5 border-r border-slate-300">Status Legalitas</th>
                      <th className="p-1.5">Kondisi & PIC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAssets.map((a, idx) => (
                      <tr key={a.id} className="align-top">
                        <td className="p-1.5 border-r border-slate-300 text-center">{idx + 1}</td>
                        <td className="p-1.5 border-r border-slate-300 font-mono text-[10px]">{a.code}</td>
                        <td className="p-1.5 border-r border-slate-300 font-semibold text-slate-900">{a.name}</td>
                        <td className="p-1.5 border-r border-slate-300">{a.category}</td>
                        <td className="p-1.5 border-r border-slate-300 text-[10px] text-slate-700">
                          {a.village ? `${a.village}, ` : ""}{a.location || "-"}
                        </td>
                        <td className="p-1.5 border-r border-slate-300 font-mono text-center">
                          {a.quantity} {a.unit}
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-[10px]">
                          {a.transferStatus || a.legalDocType || "Tercatat Resmi"}
                        </td>
                        <td className="p-1.5 text-[10px]">
                          {a.condition} ({a.custodian.split("(")[0]})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Section 3: Students / Peserta Didik Table based on Location */}
          {(displayMode === "ALL" || displayMode === "STUDENTS") && (
            <div className="space-y-2 font-sans break-inside-avoid">
              <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  III. Rekapitulasi Peserta Didik & Santri
                  {selectedDesa.length > 0 || selectedKelompok.length > 0 ? (
                    <span className="text-purple-700 font-bold ml-1">
                      (Domisili: {selectedDesa.length > 0 ? selectedDesa.join(", ") : ""} {selectedKelompok.length > 0 ? selectedKelompok.join(", ") : ""})
                    </span>
                  ) : (
                    " Berdasarkan Wilayah Domisili"
                  )}
                </h3>
                <span className="text-[10px] font-semibold text-slate-500">
                  Total: {filteredStudents.length} Siswa
                </span>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded">
                  Tidak ditemukan data peserta didik yang beralamat di wilayah {selectedDesa.length > 0 ? selectedDesa.join(", ") : ""} {selectedKelompok.length > 0 ? selectedKelompok.join(", ") : ""}.
                </div>
              ) : (
                <table className="w-full text-left text-[11px] border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                    <tr>
                      <th className="p-1.5 border-r border-slate-300 w-8 text-center">No</th>
                      <th className="p-1.5 border-r border-slate-300">NISN / NIS</th>
                      <th className="p-1.5 border-r border-slate-300">Nama Siswa</th>
                      <th className="p-1.5 border-r border-slate-300 text-center w-10">L/P</th>
                      <th className="p-1.5 border-r border-slate-300">Jenjang & Kelas</th>
                      <th className="p-1.5 border-r border-slate-300">Kategori / Beasiswa</th>
                      <th className="p-1.5 border-r border-slate-300">Alamat / Wilayah Binaan</th>
                      <th className="p-1.5 text-center">Status SPP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredStudents.map((s, idx) => (
                      <tr key={s.id} className="align-top">
                        <td className="p-1.5 border-r border-slate-300 text-center">{idx + 1}</td>
                        <td className="p-1.5 border-r border-slate-300 font-mono text-[10px]">{s.nisn || s.nis}</td>
                        <td className="p-1.5 border-r border-slate-300 font-semibold text-slate-900">{s.name}</td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-bold text-[10px]">
                          {s.gender}
                        </td>
                        <td className="p-1.5 border-r border-slate-300">
                          {s.educationLevel} - {s.classGrade}
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-[10px]">
                          <span className={s.category.includes("Beasiswa") ? "font-bold text-emerald-700" : ""}>
                            {s.category}
                          </span>
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-[10px] text-slate-700">
                          {s.address || "-"}
                        </td>
                        <td className="p-1.5 text-center text-[10px] font-semibold">
                          <span className={s.tuitionStatus === "Lunas" || s.tuitionStatus.includes("Beasiswa") ? "text-emerald-700" : "text-amber-700"}>
                            {s.tuitionStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Section 4: Admin Key Performance Indicators */}
          <div className="space-y-2 font-sans break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
              IV. Evaluasi Indikator Kinerja Utama (IKU) Administrator Yayasan
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
              <div className="p-2 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Akurasi Data:</span>
                <span className="font-bold text-slate-900 font-mono">{adminReport.kpiScores.dataAccuracy}%</span>
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Ketepatan Sinkron:</span>
                <span className="font-bold text-slate-900 font-mono">{adminReport.kpiScores.syncPunctuality}%</span>
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Audit Aset:</span>
                <span className="font-bold text-slate-900 font-mono">{adminReport.kpiScores.assetManagement}%</span>
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Layanan Pegawai:</span>
                <span className="font-bold text-slate-900 font-mono">{adminReport.kpiScores.serviceResponse}%</span>
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Laporan Pimpinan:</span>
                <span className="font-bold text-slate-900 font-mono">{adminReport.kpiScores.reportFulfillment}%</span>
              </div>
            </div>
            
            <div className="text-xs text-slate-700 space-y-1 pt-1">
              <span className="font-bold block text-slate-800">Capaian Strategis Periode Ini:</span>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {adminReport.keyAchievements.map((ach, i) => (
                  <li key={i}>{ach}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Official Signatures Section */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs font-sans break-inside-avoid">
            <div>
              <p className="text-slate-600">Penanggung Jawab Wilayah,</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {selectedKelompok.length > 0 ? selectedKelompok.join(", ") : selectedDesa.length > 0 ? selectedDesa.join(", ") : "Ketua Unit / Wilayah"}
              </p>
              <div className="h-20 flex items-start justify-center">
                <span className="text-[10px] text-slate-400 italic border border-dashed border-slate-300 px-3 py-1 rounded">
                  [ Tanda Tangan Wilayah ]
                </span>
              </div>
              <p className="font-bold text-slate-900 underline">
                {selectedKelompok.length > 0 ? selectedKelompok.join(", ") : selectedDesa.length > 0 ? selectedDesa.join(", ") : "Koordinator Wilayah"}
              </p>
              <p className="text-[10px] text-slate-500">Unit Wilayah Binaan</p>
            </div>

            <div>
              <p className="text-slate-600">Administrator Database Yayasan,</p>
              <p className="font-bold text-slate-900 mt-0.5">Petugas Verifikasi Data</p>
              <div className="h-20 flex items-start justify-center">
                <span className="text-[10px] text-slate-400 italic border border-dashed border-slate-300 px-3 py-1 rounded">
                  [ Tanda Tangan Digital ]
                </span>
              </div>
              <p className="font-bold text-slate-900 underline">{adminReport.adminName}</p>
              <p className="text-[10px] text-slate-500">NIP: YAS-2018-001</p>
            </div>

            <div>
              <p className="text-slate-600">Mengetahui & Mengesahkan,</p>
              <p className="font-bold text-slate-900 mt-0.5">Ketua Pengurus Yayasan</p>
              <div className="h-20 flex items-start justify-center">
                <span className="text-[10px] text-slate-400 italic border border-dashed border-slate-300 px-3 py-1 rounded">
                  [ Tanda Tangan & Cap Yayasan ]
                </span>
              </div>
              <p className="font-bold text-slate-900 underline">{profile.leaderName}</p>
              <p className="text-[10px] text-slate-500">NIPY: YAS-2015-001</p>
            </div>
          </div>
        </div>

        {/* Bottom Dedicated Exit & Action Footer - Hidden during print */}
        <div className="bg-slate-50 p-4 md:p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              {isFilterActive 
                ? `Filter aktif: ${selectedDesa.length > 0 ? selectedDesa.join(", ") : ""} ${selectedKelompok.length > 0 ? selectedKelompok.join(", ") : ""} (${filteredAssets.length} aset, ${filteredStudents.length} siswa)`
                : "Dokumen resmi terverifikasi sistem basis data terpadu yayasan"}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar / Tutup Dokumen</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
