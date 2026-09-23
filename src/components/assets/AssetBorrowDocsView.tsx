import React, { useState, useMemo, useRef } from "react";
import { 
  Folder, 
  Search, 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  X, 
  Printer, 
  RotateCcw, 
  ShieldAlert, 
  Trash2, 
  PlusCircle, 
  Camera, 
  Upload, 
  Building2, 
  Car, 
  Check, 
  Scroll, 
  Eye, 
  ChevronUp, 
  ChevronDown, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { AssetBorrowRecord, AssetItem } from "../../types";
import { formatDateIndo } from "../../services/api";
import { ConfirmDeleteModal } from "../common/ConfirmDeleteModal";

interface AssetBorrowDocsViewProps {
  readOnly?: boolean;
  borrowRecords: AssetBorrowRecord[];
  assets: AssetItem[];
  onAddBorrow: (record: Omit<AssetBorrowRecord, "id">) => void;
  onUpdateBorrow: (record: AssetBorrowRecord) => void;
  onDeleteBorrow: (id: string) => void;
}

interface AvailableDocumentItem {
  id: string;
  code: string;
  category: "Tanah" | "Kendaraan" | "Bangunan";
  title: string;
  owner: string;
  storageLocation: string;
  rawAsset?: AssetItem;
}

// Sample fallback documents to guarantee exact match with target UI
const BASE_SAMPLE_DOCS: AvailableDocumentItem[] = [
  {
    id: "doc-ast-444",
    code: "AST-1781447328585-444",
    category: "Tanah",
    title: "Sertifikat Tanah: SHM No. 12.20.09.04.1.04263 (KELURAHAN JIWAN, Kec. Jiwan)",
    owner: "SUNARYO",
    storageLocation: "PONDOK"
  },
  {
    id: "doc-ast-256",
    code: "AST-1780235953919-256",
    category: "Tanah",
    title: "Sertifikat Tanah: SHGB No. 12.03.03.03.3.00328 (Kelurahan Josenan, Kec. Taman)",
    owner: "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN",
    storageLocation: "Brankas"
  },
  {
    id: "doc-ast-482",
    code: "AST-1780235462771-482",
    category: "Tanah",
    title: "Sertifikat Tanah: SHM No. 12.03.01.14.1.01066 (Kelurahan Ior, Kec. Manguharjo, Kec. Madiun)",
    owner: "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN",
    storageLocation: "Pondok"
  },
  {
    id: "doc-ast-101",
    code: "AST-1780234912102-101",
    category: "Tanah",
    title: "Sertifikat Tanah: SHM No. 12.03.03.03.1.02190 (Kelurahan Demangan, Kec. Taman)",
    owner: "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN",
    storageLocation: "Brankas Arsip Utama"
  },
  {
    id: "doc-ast-102",
    code: "AST-1780234855194-102",
    category: "Tanah",
    title: "Akta Ikrar Wakaf: AIW No. W.3/004/AIW/2018 (Kelurahan Josenan, Kec. Taman)",
    owner: "H. ABDULLAH SYUKUR (PEWAKIF)",
    storageLocation: "Pondok"
  },
  {
    id: "doc-ast-103",
    code: "AST-1780234729103-103",
    category: "Tanah",
    title: "Sertifikat Tanah: SHM No. 12.20.09.04.1.05122 (Desa Sukolilo, Kec. Jiwan)",
    owner: "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN",
    storageLocation: "Brankas"
  },
  {
    id: "doc-ast-104",
    code: "AST-1780234618290-104",
    category: "Tanah",
    title: "Sertifikat Tanah: SHM No. 12.03.02.01.1.03411 (Kelurahan Mojorejo, Kec. Taman)",
    owner: "DRS. H. AHMAD BUKHORI (KETUA YAYASAN)",
    storageLocation: "Pondok"
  },
  {
    id: "doc-ast-knd-01",
    code: "AST-KND-178092100-01",
    category: "Kendaraan",
    title: "BPKB & STNK Asli: Toyota HiAce Commuter (Plat AE 1928 YSN)",
    owner: "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN",
    storageLocation: "Brankas Dokumen Kendaraan"
  }
];

export const AssetBorrowDocsView: React.FC<AssetBorrowDocsViewProps> = ({
  borrowRecords = [],
  assets = [],
  onAddBorrow,
  onUpdateBorrow,
  onDeleteBorrow,
  readOnly
}) => {
  // Top navigation tabs: "active" | "new-borrow" | "history"
  const [activeTopTab, setActiveTopTab] = useState<"active" | "new-borrow" | "history">("new-borrow");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Step A Category Filter: "Tanah" | "Kendaraan" | "Bangunan"
  const [selectedCategory, setSelectedCategory] = useState<"Tanah" | "Kendaraan" | "Bangunan">("Tanah");
  
  // Selected Document for Step B Form
  const [selectedDocId, setSelectedDocId] = useState<string>("doc-ast-444");
  
  // Step B Form Fields
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerRole, setBorrowerRole] = useState("");
  const [borrowerPhone, setBorrowerPhone] = useState("");
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [handoverOfficer, setHandoverOfficer] = useState("");
  const [purpose, setPurpose] = useState("");
  const [photoProof, setPhotoProof] = useState<string>("");
  const [photoProofName, setPhotoProofName] = useState<string>("");

  // Modals
  const [selectedForBAST, setSelectedForBAST] = useState<AssetBorrowRecord | null>(null);
  const [returnModalRecord, setReturnModalRecord] = useState<AssetBorrowRecord | null>(null);
  const [returnNotes, setReturnNotes] = useState("Berkas diterima kembali dalam keadaan fisik lengkap, bersih, dan tersegel.");
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);
  const [borrowToDelete, setBorrowToDelete] = useState<AssetBorrowRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Derive consolidated list of available documents strictly from real assets
  const allAvailableDocuments = useMemo<AvailableDocumentItem[]>(() => {
    const list: AvailableDocumentItem[] = [];
    const usedCodes = new Set<string>();

    // Process real assets from props exclusively
    assets.forEach((asset) => {
      const code = asset.code || `AST-${asset.id}`;
      if (usedCodes.has(code)) return;
      usedCodes.add(code);
      
      let cat: "Tanah" | "Kendaraan" | "Bangunan" = "Tanah";
      if (asset.category === "Kendaraan") cat = "Kendaraan";
      else if (asset.category === "Bangunan") cat = "Bangunan";

      let docTitle = `Dokumen Legalitas: ${asset.name}`;
      if (cat === "Tanah") {
        const docType = asset.legalDocType || "SHM";
        const docNum = asset.legalDocNumber || asset.code || "12.20.09";
        const loc = asset.village ? `${asset.village}${asset.district ? `, Kec. ${asset.district}` : ""}` : asset.location || "Madiun";
        docTitle = `Sertifikat Tanah: ${docType} No. ${docNum} (${loc})`;
      } else if (cat === "Kendaraan") {
        docTitle = `BPKB & STNK Asli: ${asset.name} (${asset.licensePlate || code})`;
      } else if (cat === "Bangunan") {
        docTitle = `Dokumen Bangunan: ${asset.name} (${asset.legalDocNumber || "PBG/SLF"})`;
      }

      list.push({
        id: `asset-doc-${asset.id}`,
        code,
        category: cat,
        title: docTitle,
        owner: asset.registeredOwner || asset.originalOwner || (asset as any).ownerName || "-",
        storageLocation: asset.archiveStorageLocation || asset.location || "PONDOK",
        rawAsset: asset
      });
    });

    return list;
  }, [assets]);

  // Counts by category
  const tanahCount = allAvailableDocuments.filter(d => d.category === "Tanah").length;
  const kendaraanCount = allAvailableDocuments.filter(d => d.category === "Kendaraan").length;
  const bangunanCount = allAvailableDocuments.filter(d => d.category === "Bangunan").length;

  // Filtered documents for Step A based on category & search
  const filteredCategoryDocs = useMemo(() => {
    return allAvailableDocuments.filter(d => {
      const matchCat = d.category === selectedCategory;
      const matchSearch = searchQuery.trim() === "" ||
        (d.title || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
        (d.code || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
        (d.owner || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
        (d.storageLocation || "").toLowerCase().includes((searchQuery || "").toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allAvailableDocuments, selectedCategory, searchQuery]);

  // Currently selected document object
  const selectedDoc = useMemo(() => {
    return allAvailableDocuments.find(d => d.id === selectedDocId) || allAvailableDocuments[0] || null;
  }, [allAvailableDocuments, selectedDocId]);

  // Borrow status counts
  const activeBorrowedList = useMemo(() => {
    return borrowRecords.filter(r => r.status === "Dipinjam");
  }, [borrowRecords]);

  const returnedList = useMemo(() => {
    return borrowRecords.filter(r => r.status === "Dikembalikan");
  }, [borrowRecords]);

  // Handle Photo Upload
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoProofName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoProof(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick simulate photo
  const handleSimulatePhoto = () => {
    // Generate a clean sample SVG data URI representing a receipt with seal
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 250;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, 400, 250);
      ctx.strokeStyle = "#cbd5e1";
      ctx.strokeRect(10, 10, 380, 230);
      
      // Header
      ctx.fillStyle = "#1e40af";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("TANDA TERIMA SERAH FISIK BERKAS", 25, 40);
      
      ctx.fillStyle = "#475569";
      ctx.font = "11px sans-serif";
      ctx.fillText("Yayasan Pondok Pesantren Muttaqin Josenan Madiun", 25, 60);
      ctx.fillText(`Dokumen: ${selectedDoc?.code || "AST-DOC"}`, 25, 85);
      ctx.fillText(`Penerima: ${borrowerName || "Peminjam Resmi"}`, 25, 105);
      ctx.fillText(`Tanggal: ${formatDateIndo(borrowDate)}`, 25, 125);
      
      // Stamp
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2;
      ctx.strokeRect(260, 140, 110, 50);
      ctx.fillStyle = "#2563eb";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("TERVERIFIKASI", 275, 162);
      ctx.fillText("ARSIP ASLI", 285, 178);
      
      const sampleUri = canvas.toDataURL("image/png");
      setPhotoProof(sampleUri);
      setPhotoProofName("Foto_Bukti_Serah_Terima_Fisik.png");
    }
  };

  // Submit Form Step B
  const handleSubmitBorrowForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoc) {
      alert("Silakan pilih berkas dokumen yang tersedia pada Langkah A terlebih dahulu!");
      return;
    }

    if (!borrowerName.trim()) {
      alert("Nama lengkap peminjam wajib diisi!");
      return;
    }

    if (!borrowerRole.trim()) {
      alert("Jabatan / Lembaga / Bagian peminjam wajib diisi!");
      return;
    }

    if (!borrowerPhone.trim()) {
      alert("Nomor kontak / HP aktif wajib diisi!");
      return;
    }

    if (!handoverOfficer.trim()) {
      alert("Petugas penyerah fisik berkas wajib diisi!");
      return;
    }

    if (!purpose.trim()) {
      alert("Alasan & tujuan peminjaman wajib diisi!");
      return;
    }

    const calculatedDueDate = dueDate.trim() || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const newRecord: Omit<AssetBorrowRecord, "id"> = {
      assetId: selectedDoc.rawAsset?.id || selectedDoc.id,
      assetCode: selectedDoc.code,
      assetName: selectedDoc.title,
      docTitle: selectedDoc.title,
      docNumber: selectedDoc.code,
      borrowerName: borrowerName.trim(),
      borrowerRole: borrowerRole.trim(),
      borrowerPhone: borrowerPhone.trim(),
      borrowDate: borrowDate,
      dueDate: calculatedDueDate,
      purpose: purpose.trim(),
      approvedBy: handoverOfficer.trim(),
      handoverOfficer: handoverOfficer.trim(),
      photoProof: photoProof || undefined,
      status: "Dipinjam",
      notes: `Lokasi Simpan: ${selectedDoc.storageLocation} • Pemilik: ${selectedDoc.owner}`
    };

    onAddBorrow(newRecord);

    // Prompt to preview/print official BAST
    const mockFullRecord: AssetBorrowRecord = {
      ...newRecord,
      id: `bor-${Date.now()}`
    };
    setSelectedForBAST(mockFullRecord);

    // Reset Form
    setBorrowerName("");
    setBorrowerRole("");
    setBorrowerPhone("");
    setDueDate("");
    setHandoverOfficer("");
    setPurpose("");
    setPhotoProof("");
    setPhotoProofName("");

    // Switch to active view to show success
    setActiveTopTab("active");
  };

  // Mark Returned
  const handleConfirmReturn = () => {
    if (!returnModalRecord) return;
    onUpdateBorrow({
      ...returnModalRecord,
      status: "Dikembalikan",
      returnDate: new Date().toISOString().split("T")[0],
      notes: returnModalRecord.notes 
        ? `${returnModalRecord.notes} | Kondisi Kembali: ${returnNotes}` 
        : `Kondisi Kembali: ${returnNotes}`
    });
    setReturnModalRecord(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-2.5 sm:p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Segmented Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* BERKAS AKTIF */}
          <button
            onClick={() => setActiveTopTab("active")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTopTab === "active"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100/90 text-slate-700 hover:bg-slate-200 border border-slate-200/80"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>BERKAS AKTIF ({activeBorrowedList.length})</span>
          </button>

          {/* PINJAM BERKAS BARU */}
          <button
            onClick={() => setActiveTopTab("new-borrow")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTopTab === "new-borrow"
                ? "bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/20"
                : "bg-slate-100/90 text-slate-700 hover:bg-slate-200 border border-slate-200/80"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>PINJAM BERKAS BARU</span>
          </button>

          {/* RIWAYAT KEMBALI */}
          <button
            onClick={() => setActiveTopTab("history")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTopTab === "history"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100/90 text-slate-700 hover:bg-slate-200 border border-slate-200/80"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RIWAYAT KEMBALI ({returnedList.length})</span>
          </button>
        </div>

        {/* Right Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berkas tersedia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50/70 hover:bg-white rounded-xl border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main View Mode: Form Registration vs Active vs History */}
      {activeTopTab === "new-borrow" ? (
        <div className="space-y-4">
          {/* Sub-header Badge & Title */}
          <div className="flex items-center gap-2.5 pt-1">
            <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-[11px] font-black tracking-wider uppercase shadow-2xs">
              FORMULIR
            </span>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase">
              PENDAFTARAN & PENGELUARAN BERKAS BARU
            </h3>
          </div>

          {/* Two-Column Registration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: LANGKAH A (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3.5">
              {/* Header Langkah A */}
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-xs sm:text-[13px] tracking-wider uppercase text-slate-900">
                  LANGKAH A: PILIH BERKAS YANG TERSEDIA
                </h4>
              </div>

              {/* Category Filter Tabs (Pills) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("Tanah")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === "Tanah"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80"
                  }`}
                >
                  TANAH ({tanahCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("Kendaraan")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === "Kendaraan"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80"
                  }`}
                >
                  KENDARAAN ({kendaraanCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("Bangunan")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === "Bangunan"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80"
                  }`}
                >
                  BANGUNAN ({bangunanCount})
                </button>
              </div>

              {/* Category Header Label with Scroll indicators */}
              <div className="flex items-center justify-between pt-1 text-slate-700">
                <div className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                  <Scroll className="w-3.5 h-3.5 text-amber-600" />
                  <span>BERKAS {selectedCategory.toUpperCase()} ({filteredCategoryDocs.length})</span>
                </div>
                <div className="flex items-center gap-0.5 text-slate-400">
                  <ChevronUp className="w-3.5 h-3.5" />
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Scrollable Document Cards List */}
              <div className="max-h-[550px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                {filteredCategoryDocs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Folder className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">Tidak ada dokumen {selectedCategory} yang ditemukan.</p>
                  </div>
                ) : (
                  filteredCategoryDocs.map((doc) => {
                    const isSelected = selectedDoc?.id === doc.id;
                    const isCurrentlyBorrowed = activeBorrowedList.some(r => r.assetCode === doc.code);

                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`p-3.5 rounded-xl transition-all cursor-pointer relative ${
                          isSelected
                            ? "border-2 border-blue-600 bg-white ring-2 ring-blue-600/10 shadow-xs"
                            : "border border-slate-200 bg-white hover:border-blue-400 hover:shadow-2xs"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Warm Amber Document Scroll Icon */}
                          <div className="mt-0.5 p-1 rounded-md bg-amber-50 text-amber-700 shrink-0">
                            <Scroll className="w-4 h-4 text-amber-600" />
                          </div>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            {/* ID */}
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-bold font-mono text-slate-400 tracking-tight">
                                ID: {doc.code}
                              </span>
                              {isCurrentlyBorrowed && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                  Sedang Dipinjam
                                </span>
                              )}
                            </div>

                            {/* Document Title */}
                            <h5 className="text-xs font-bold text-slate-900 leading-snug">
                              {doc.title}
                            </h5>

                            {/* Owner Pill Badge */}
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-900 text-[11px] font-bold leading-tight">
                                <User className="w-3 h-3 text-blue-700 shrink-0" />
                                <span>A.N: {doc.owner}</span>
                              </span>
                            </div>

                            {/* Storage Location */}
                            <div className="text-[11px] text-slate-500 font-medium">
                              Lokasi Simpan: <span className="text-slate-700 font-semibold">{doc.storageLocation}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: LANGKAH B (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
              {/* Header Langkah B */}
              <div className="flex items-start justify-between gap-2 pb-1 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-xs sm:text-[13px] tracking-wider uppercase text-slate-900">
                      LANGKAH B: FORMULIR PEMINJAMAN RESMI
                    </h4>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5 tracking-tight">
                    ASET TERPILIH: <span className="font-mono text-blue-600">{selectedDoc ? selectedDoc.code : "-"}</span>
                  </div>
                </div>

                {/* Ganti Berkas Link */}
                <button
                  type="button"
                  onClick={() => {
                    const other = filteredCategoryDocs.find(d => d.id !== selectedDoc?.id);
                    if (other) setSelectedDocId(other.id);
                  }}
                  className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors pt-0.5"
                  title="Pilih berkas dokumen lain dari daftar"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ganti Berkas</span>
                </button>
              </div>

              {/* Blue Alert Banner for Selected Document */}
              {selectedDoc ? (
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-2.5">
                  <div className="p-1 rounded-full bg-blue-600 text-white shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-extrabold text-blue-900 tracking-wide uppercase text-[11px]">
                      BERKAS TERBUKA SIAP DIALOKASIKAN:
                    </p>
                    <p className="font-bold text-slate-800 leading-snug">
                      {selectedDoc.title}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  Silakan pilih salah satu berkas fisik pada panel Langkah A terlebih dahulu.
                </div>
              )}

              {/* Peminjaman Form */}
              <form onSubmit={handleSubmitBorrowForm} className="space-y-3.5 text-xs">
                {/* Row 1: Nama Peminjam & Jabatan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      NAMA LENGKAP PEMINJAM <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={borrowerName}
                      onChange={(e) => setBorrowerName(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      JABATAN / LEMBAGA / BAGIAN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pengurus Wakaf Madiun"
                      value={borrowerRole}
                      onChange={(e) => setBorrowerRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Row 2: No Kontak & Tanggal Pinjam */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      NO. KONTAK / HP AKTIF <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 0812-xxxx-xxxx"
                      value={borrowerPhone}
                      onChange={(e) => setBorrowerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      TANGGAL PENGELUARAN / PINJAM <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={borrowDate}
                        onChange={(e) => setBorrowDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Batas Rencana Pengembalian & Petugas Penyerah Fisik */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      BATAS RENCANA PENGEMBALIAN
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        placeholder="mm/dd/yyyy"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      PETUGAS PENYERAH FISIK BERKAS <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Anda / Pengurus"
                      value={handoverOfficer}
                      onChange={(e) => setHandoverOfficer(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Row 4: Alasan & Tujuan Utama */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    ALASAN & TUJUAN UTAMA PEMINJAMAN <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tuliskan detail penggunaan berkas (misal: pengurusan pecah sertifikat, balik nama, atau verifikasi di notaris)..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors resize-y"
                  />
                </div>

                {/* Row 5: Ambil Foto Bukti Peminjaman (Serah Terima Dokumen) */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    AMBIL FOTO BUKTI PEMINJAMAN (SERAH TERIMA DOKUMEN)
                  </label>
                  
                  {photoProof ? (
                    <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={photoProof}
                          alt="Bukti Serah Terima"
                          className="w-12 h-12 object-cover rounded-lg border border-blue-300 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">
                            {photoProofName || "Bukti_Serah_Terima.png"}
                          </p>
                          <p className="text-[11px] text-blue-700 font-medium">Foto siap dilampirkan ke BAST</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setViewPhotoUrl(photoProof)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer"
                        >
                          Lihat
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoProof("");
                            setPhotoProofName("");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-semibold hover:bg-rose-100 cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/20 transition-all text-center space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handlePhotoFileChange}
                        className="hidden"
                      />
                      <div className="flex items-start justify-center gap-2 text-slate-500">
                        <Camera className="w-5 h-5 text-slate-400" />
                        <span className="text-xs font-semibold">Lampirkan foto penyerahan fisik atau serah terima</span>
                      </div>

                      <div className="flex items-start justify-center gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                          <span>Pilih Foto dari Perangkat</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSimulatePhoto}
                          className="px-3 py-1.5 rounded-lg bg-blue-100/80 hover:bg-blue-200/80 text-blue-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          title="Simulasikan pembuatan bukti tanda terima serah berkas otomatis"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>Buat Tanda Terima Cepat</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-start justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan & Terbitkan BAST Peminjaman</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : activeTopTab === "active" ? (
        /* ACTIVE BORROWED DOCUMENTS VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Daftar Berkas Fisik Sedang Dipinjam ({activeBorrowedList.length})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Monitoring berkas fisik yayasan yang berada di luar brankas arsip resmi.
              </p>
            </div>

            <button
              onClick={() => setActiveTopTab("new-borrow")}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-blue-700 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Pinjam Berkas Baru</span>
            </button>
          </div>

          {activeBorrowedList.length === 0 ? (
            <div className="py-14 text-center text-slate-400">
              <Folder className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">Saat ini tidak ada berkas fisik yang sedang dipinjam.</p>
              <p className="text-[11px] text-slate-400 mt-1">Seluruh sertifikat dan dokumen berada aman di brankas arsip.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-blue-900/5 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Judul & Dokumen</th>
                    <th className="px-3.5 py-2.5">Nama Peminjam</th>
                    <th className="px-3.5 py-2.5">Tgl Pinjam & Tenggat</th>
                    <th className="px-3.5 py-2.5">Tujuan / Keperluan</th>
                    <th className="px-3.5 py-2.5">Petugas Penyerah</th>
                    <th className="px-3.5 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeBorrowedList.map((rec) => {
                    const isOverdue = new Date(rec.dueDate).getTime() < Date.now();

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3.5 py-3 font-semibold text-slate-900 max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <Scroll className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="truncate">{rec.docTitle}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID: {rec.assetCode}
                          </div>
                        </td>

                        <td className="px-3.5 py-3">
                          <div className="font-bold text-slate-900">{rec.borrowerName}</div>
                          <div className="text-[10px] text-slate-500">{rec.borrowerRole} • {rec.borrowerPhone}</div>
                        </td>

                        <td className="px-3.5 py-3 font-mono text-[11px]">
                          <div>Pinjam: {formatDateIndo(rec.borrowDate)}</div>
                          <div className={`font-semibold flex items-center gap-1 ${isOverdue ? "text-rose-600 font-bold" : "text-slate-600"}`}>
                            <span>Tempo: {formatDateIndo(rec.dueDate)}</span>
                            {isOverdue && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-100 text-rose-700">
                                Terlambat
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-3.5 py-3 text-slate-700 max-w-[160px] truncate" title={rec.purpose}>
                          {rec.purpose}
                        </td>

                        <td className="px-3.5 py-3 text-slate-600">
                          <div className="font-medium">{rec.approvedBy || rec.handoverOfficer || "Admin"}</div>
                          {rec.photoProof && (
                            <button
                              onClick={() => setViewPhotoUrl(rec.photoProof || null)}
                              className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Lihat Bukti Foto</span>
                            </button>
                          )}
                        </td>

                        <td className="px-3.5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setReturnModalRecord(rec);
                                setReturnNotes("Berkas diterima kembali dalam keadaan lengkap, bersih, dan tersegel.");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              title="Tandai berkas telah dikembalikan"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Kembalikan</span>
                            </button>

                            <button
                              onClick={() => setSelectedForBAST(rec)}
                              title="Cetak Berita Acara Serah Terima (BAST)"
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setBorrowToDelete(rec)}
                              title="Hapus Catatan"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      ) : (
        /* HISTORY RETURNED VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span>Riwayat Pengembalian Berkas Fisik ({returnedList.length})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Arsip berkas fisik yang telah selesai dipinjam dan kembali disimpan di brankas.
              </p>
            </div>
          </div>

          {returnedList.length === 0 ? (
            <div className="py-14 text-center text-slate-400">
              <RotateCcw className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">Belum ada riwayat pengembalian berkas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Judul & Dokumen</th>
                    <th className="px-3.5 py-2.5">Nama Peminjam</th>
                    <th className="px-3.5 py-2.5">Tgl Pinjam & Kembali</th>
                    <th className="px-3.5 py-2.5">Keperluan & Catatan Pengembalian</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returnedList.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-3.5 py-3 font-semibold text-slate-900 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="truncate">{rec.docTitle}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: {rec.assetCode}
                        </div>
                      </td>

                      <td className="px-3.5 py-3">
                        <div className="font-bold text-slate-900">{rec.borrowerName}</div>
                        <div className="text-[10px] text-slate-500">{rec.borrowerRole}</div>
                      </td>

                      <td className="px-3.5 py-3 font-mono text-[11px]">
                        <div>Pinjam: {formatDateIndo(rec.borrowDate)}</div>
                        <div className="text-blue-600 font-bold">
                          Kembali: {rec.returnDate ? formatDateIndo(rec.returnDate) : "-"}
                        </div>
                      </td>

                      <td className="px-3.5 py-3 text-slate-700 max-w-xs">
                        <div className="truncate font-medium">{rec.purpose}</div>
                        {rec.notes && (
                          <div className="text-[10px] text-slate-400 italic truncate mt-0.5">
                            {rec.notes}
                          </div>
                        )}
                      </td>

                      <td className="px-3.5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Kembali</span>
                        </span>
                      </td>

                      <td className="px-3.5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedForBAST(rec)}
                            title="Cetak Salinan Lembar BAST"
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setBorrowToDelete(rec)}
                            title="Hapus Catatan"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL RETURN CONFIRMATION */}
      {returnModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span>Pengembalian Berkas Fisik</span>
              </h4>
              <button onClick={() => setReturnModalRecord(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">{returnModalRecord.docTitle}</p>
              <p className="text-slate-500">Peminjam: {returnModalRecord.borrowerName} ({returnModalRecord.borrowerRole})</p>
              <p className="text-slate-500 font-mono">Tgl Pinjam: {formatDateIndo(returnModalRecord.borrowDate)}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-slate-700">
                Catatan Pemeriksaan Kondisi Fisik Berkas
              </label>
              <textarea
                rows={3}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:border-blue-600 outline-none"
                placeholder="Misal: Berkas diterima lengkap, tidak robek, dan tersegel..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReturnModalRecord(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Konfirmasi Berkas Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VIEW PHOTO PROOF */}
      {viewPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Bukti Serah Terima Berkas Fisik</span>
              </h4>
              <button onClick={() => setViewPhotoUrl(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-96 overflow-auto rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-center">
              <img src={viewPhotoUrl} alt="Bukti Serah Terima" className="max-w-full h-auto object-contain" />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewPhotoUrl(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRINT BAST */}
      {selectedForBAST && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600" />
                <span>Berita Acara Serah Terima (BAST) Dokumen Fisik</span>
              </h3>
              <button onClick={() => setSelectedForBAST(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Letter Style Preview */}
            <div className="p-6 bg-slate-50/70 rounded-xl border border-slate-300 space-y-4 text-xs text-slate-800 font-serif">
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <h4 className="font-bold text-sm uppercase tracking-wide">YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN</h4>
                <p className="text-[10px] text-slate-600 font-sans">SEKRETARIAT ARSIP & SARANA PRASARANA PUSAT</p>
                <p className="text-[9px] text-slate-500 font-sans">Jl. Nogososro No. 26, Josenan, Kec. Taman, Kota Madiun, Jawa Timur</p>
              </div>

              <div className="text-center">
                <p className="font-bold underline uppercase tracking-wide">BERITA ACARA PINJAM PAKAI DOKUMEN ASLI</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Nomor: BAST/ARSIP/{new Date().getFullYear()}/{selectedForBAST.id.slice(-6).toUpperCase()}
                </p>
              </div>

              <p>
                Pada hari ini, <strong>{formatDateIndo(selectedForBAST.borrowDate)}</strong>, telah diserahkan berkas fisik dokumen asli milik Yayasan Pondok Pesantren Muttaqin Josenan Madiun kepada pihak peminjam dengan perincian:
              </p>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5 font-sans text-xs">
                <div><strong>Kode Aset:</strong> <span className="font-mono text-slate-700">{selectedForBAST.assetCode}</span></div>
                <div><strong>Nama Dokumen:</strong> <span className="text-slate-900 font-semibold">{selectedForBAST.docTitle}</span></div>
                <div><strong>Nama Peminjam:</strong> {selectedForBAST.borrowerName} ({selectedForBAST.borrowerRole})</div>
                <div><strong>Nomor Kontak:</strong> <span className="font-mono">{selectedForBAST.borrowerPhone}</span></div>
                <div><strong>Tujuan Penggunaan:</strong> {selectedForBAST.purpose}</div>
                <div><strong>Batas Waktu Pengembalian:</strong> <span className="font-bold text-rose-700">{formatDateIndo(selectedForBAST.dueDate)}</span></div>
                {selectedForBAST.approvedBy && (
                  <div><strong>Petugas Penyerah:</strong> {selectedForBAST.approvedBy}</div>
                )}
              </div>

              {selectedForBAST.photoProof && (
                <div className="font-sans text-[11px] pt-1">
                  <span className="font-semibold text-slate-600 block mb-1">Bukti Foto Serah Terima Fisik Terlampir:</span>
                  <img src={selectedForBAST.photoProof} alt="Bukti" className="h-20 rounded border border-slate-300 object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-6 text-center font-sans text-xs">
                <div>
                  <p className="text-slate-500 text-[11px]">Yang Menyerahkan (Petugas Arsip):</p>
                  <div className="h-14"></div>
                  <p className="font-bold underline">{selectedForBAST.approvedBy || "Petugas Arsiparis"}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[11px]">Pihak Peminjam:</p>
                  <div className="h-14"></div>
                  <p className="font-bold underline">{selectedForBAST.borrowerName}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar BAST</span>
              </button>
              <button
                onClick={() => setSelectedForBAST(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Iframe-Safe Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!borrowToDelete}
        title="Hapus Catatan Sirkulasi Berkas"
        itemName={borrowToDelete?.docTitle}
        itemDetail={`Peminjam: ${borrowToDelete?.borrowerName || "-"}`}
        confirmButtonText="Hapus Catatan Ini"
        onConfirm={() => {
          if (borrowToDelete) {
            onDeleteBorrow(borrowToDelete.id);
            setBorrowToDelete(null);
          }
        }}
        onClose={() => setBorrowToDelete(null)}
      />
    </div>
  );
};
