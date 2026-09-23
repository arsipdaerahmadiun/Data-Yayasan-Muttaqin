import React, { useState } from "react";
import { 
  RefreshCw, 
  Plus, 
  Search, 
  Clock, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Edit2, 
  Trash2,
  Calendar,
  User,
  Building2,
  PlusCircle,
  Pencil,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { 
  AssetTransferRecord, 
  AssetTransferLogItem, 
  AssetItem, 
  AssetCategory, 
  AssetLegalDocType 
} from "../../types";
import { 
  formatRupiah, 
  formatDateIndo, 
  formatAssetNameWithNewOwner, 
  matchAssetWithTransfer 
} from "../../services/api";
import { ConfirmDeleteModal } from "../common/ConfirmDeleteModal";

interface AssetTransferTitleViewProps {
  readOnly?: boolean;
  transfers: AssetTransferRecord[];
  assets: AssetItem[];
  onAddTransfer: (transfer: Omit<AssetTransferRecord, "id">) => void;
  onUpdateTransfer: (transfer: AssetTransferRecord) => void;
  onDeleteTransfer: (id: string) => void;
}

export const AssetTransferTitleView: React.FC<AssetTransferTitleViewProps> = ({
  transfers = [],
  assets = [],
  onAddTransfer,
  onUpdateTransfer,
  onDeleteTransfer,
  readOnly = false
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<AssetTransferRecord | null>(null);
  const [transferToDelete, setTransferToDelete] = useState<AssetTransferRecord | null>(null);

  // New Log Row Input State inside modal
  const [newLogDate, setNewLogDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newLogDesc, setNewLogDesc] = useState<string>("");
  const [newLogCost, setNewLogCost] = useState<number | string>("");

  // Form State
  const [formData, setFormData] = useState<Omit<AssetTransferRecord, "id">>({
    assetId: "",
    assetCode: "AST-01",
    assetName: "",
    category: "Tanah",
    fromOwner: "Suparminto",
    toOwner: "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN",
    docType: "Akta Ikrar Wakaf (AIW)",
    docNumber: "",
    notaryOffice: "Notaris Galis, S.H., M.Kn. & Kantor Pertanahan BPN",
    submissionDate: new Date().toISOString().split("T")[0],
    targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    completionDate: "",
    status: "Proses BPN / Notaris",
    progressPercent: 75,
    estimatedCost: 4251100,
    handlerName: "Fahmi Maulana Dwi, S.Kom.",
    notes: "Pembaruan BPHTB Oleh Notaris Galis",
    logs: [
      {
        id: "log-1",
        date: "2026-06-14",
        description: "Pemberkasan Akta hibah",
        cost: 1500000
      },
      {
        id: "log-2",
        date: "2026-06-14",
        description: "PPh",
        cost: 2751100
      }
    ]
  });

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      (t.assetName || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (t.fromOwner || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (t.toOwner || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (t.notaryOffice || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (t.handlerName || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes((search || "").toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalTransfers = transfers.length;
  const completedCount = transfers.filter(t => t.status === "Selesai / Terbit Sertifikat").length;
  const inProgressCount = transfers.filter(t => t.status === "Proses BPN / Notaris" || t.status === "Pengukuran & Pengecekan").length;
  const verificationCount = transfers.filter(t => t.status === "Verifikasi Dokumen").length;
  
  // Calculate total cost accurately taking either logs sum or estimatedCost
  const calculateItemTotalCost = (item: AssetTransferRecord): number => {
    if (!item) return 0;
    if (Array.isArray(item.logs) && item.logs.length > 0) {
      return item.logs.reduce((acc, log) => acc + (Number(log?.cost) || 0), 0);
    }
    return Number(item.estimatedCost) || 0;
  };

  const totalCostOverall = transfers.reduce((acc, curr) => acc + calculateItemTotalCost(curr), 0);

  const handleOpenAdd = () => {
    const defaultAsset = assets.find(a => a.category === "Tanah" || a.category === "Bangunan" || a.category === "Kendaraan") || assets[0];

    setFormData({
      assetId: defaultAsset?.id || "",
      assetCode: defaultAsset?.code || "AST-TNH-01",
      assetName: defaultAsset ? `${defaultAsset.name}` : "",
      category: defaultAsset?.category || "Tanah",
      fromOwner: defaultAsset?.originalOwner || defaultAsset?.registeredOwner || "",
      toOwner: "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN",
      docType: (defaultAsset?.legalDocType as AssetLegalDocType) || "Sertifikat Hak Milik (SHM)",
      docNumber: defaultAsset?.legalDocNumber || "",
      notaryOffice: "Kantor Pertanahan BPN / Notaris PPAT",
      submissionDate: new Date().toISOString().split("T")[0],
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      completionDate: "",
      status: "Verifikasi Dokumen",
      progressPercent: 20,
      estimatedCost: 0,
      handlerName: "Pengurus Bidang Sarpras",
      notes: "",
      logs: []
    });

    setNewLogDate(new Date().toISOString().split("T")[0]);
    setNewLogDesc("");
    setNewLogCost("");
    setEditingTransfer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (transfer: AssetTransferRecord) => {
    setEditingTransfer(transfer);
    const existingLogs = Array.isArray(transfer.logs) ? [...transfer.logs] : [];

    setFormData({
      ...transfer,
      logs: existingLogs
    });
    setNewLogDate(new Date().toISOString().split("T")[0]);
    setNewLogDesc("");
    setNewLogCost("");
    setIsModalOpen(true);
  };

  // Quick delete single log/berkas item directly from the card
  const handleQuickDeleteLog = (transferItem: AssetTransferRecord, logId: string) => {
    const updatedLogs = (transferItem.logs || []).filter(l => l.id !== logId);
    const newTotalCost = updatedLogs.reduce((acc, l) => acc + (Number(l?.cost) || 0), 0);
    const updatedTransfer: AssetTransferRecord = {
      ...transferItem,
      logs: updatedLogs,
      estimatedCost: newTotalCost
    };
    onUpdateTransfer(updatedTransfer);
  };

  const handleSelectAssetInForm = (assetId: string) => {
    const selected = assets.find(a => a.id === assetId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        assetId: selected.id,
        assetCode: selected.code,
        assetName: selected.name,
        category: selected.category,
        fromOwner: selected.originalOwner || prev.fromOwner,
        docType: (selected.legalDocType as AssetLegalDocType) || prev.docType,
        docNumber: selected.legalDocNumber || prev.docNumber
      }));
    }
  };

  // Add Log Item to Form State
  const handleAddLogItem = () => {
    if (!newLogDesc.trim()) {
      alert("Mohon masukkan keterangan progres / nama proses!");
      return;
    }
    const costNum = Number(newLogCost) || 0;
    const newLog: AssetTransferLogItem = {
      id: "log-" + Date.now(),
      date: newLogDate || new Date().toISOString().split("T")[0],
      description: newLogDesc.trim(),
      cost: costNum
    };

    const updatedLogs = [...(formData.logs || []), newLog];
    const newTotalCost = updatedLogs.reduce((acc, l) => acc + (Number(l.cost) || 0), 0);

    setFormData(prev => ({
      ...prev,
      logs: updatedLogs,
      estimatedCost: newTotalCost
    }));

    setNewLogDesc("");
    setNewLogCost("");
  };

  // Delete Log Item from Form State
  const handleDeleteLogItem = (logId: string) => {
    const updatedLogs = (formData.logs || []).filter(l => l.id !== logId);
    const newTotalCost = updatedLogs.reduce((acc, l) => acc + (Number(l.cost) || 0), 0);

    setFormData(prev => ({
      ...prev,
      logs: updatedLogs,
      estimatedCost: newTotalCost
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetName.trim()) {
      alert("Mohon pilih atau masukkan Nama Aset!");
      return;
    }

    const isFinished = formData.status === "Selesai / Terbit Sertifikat";
    const currentLogs = formData.logs || [];
    const computedTotalCost = currentLogs.length > 0 
      ? currentLogs.reduce((acc, l) => acc + (Number(l.cost) || 0), 0)
      : Number(formData.estimatedCost) || 0;

    let targetAssetName = formData.assetName;
    if (isFinished && formData.toOwner) {
      targetAssetName = formatAssetNameWithNewOwner(formData.assetName, formData.toOwner);
    }

    const payload = {
      ...formData,
      assetName: targetAssetName,
      completionDate: isFinished ? (formData.completionDate || new Date().toISOString().split("T")[0]) : formData.completionDate,
      progressPercent: isFinished ? 100 : formData.progressPercent,
      estimatedCost: computedTotalCost
    };

    if (editingTransfer) {
      onUpdateTransfer({
        ...payload,
        id: editingTransfer.id
      });
    } else {
      onAddTransfer(payload);
    }
    setIsModalOpen(false);
    setEditingTransfer(null);
  };

  const handleAdvanceStep = (item: AssetTransferRecord) => {
    if (item.status === "Proses BPN / Notaris") {
      // Buka modal untuk konfirmasi nomor sertifikat baru dan update nama target otomatis
      const targetName = item.toOwner ? formatAssetNameWithNewOwner(item.assetName, item.toOwner) : item.assetName;
      setFormData({
        ...item,
        assetName: targetName,
        status: "Selesai / Terbit Sertifikat",
        progressPercent: 100,
        completionDate: new Date().toISOString().split("T")[0]
      });
      setEditingTransfer(item);
      setIsModalOpen(true);
      return;
    }

    let nextStatus: AssetTransferRecord["status"] = item.status;
    let nextPercent = item.progressPercent;
    let completionDate = item.completionDate;

    if (item.status === "Verifikasi Dokumen") {
      nextStatus = "Pengukuran & Pengecekan";
      nextPercent = 50;
    } else if (item.status === "Pengukuran & Pengecekan") {
      nextStatus = "Proses BPN / Notaris";
      nextPercent = 75;
    }

    onUpdateTransfer({
      ...item,
      status: nextStatus,
      progressPercent: nextPercent,
      completionDate
    });
  };

  const currentFormTotalCost = (formData.logs || []).reduce((acc, l) => acc + (Number(l.cost) || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header & Metric Cards */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-700" />
            Manajemen Balik Nama & Pembiayaan Progres
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan mutasi kepemilikan aset, tahapan sertifikasi di Notaris/BPN, serta rekonsiliasi log progres & biaya tiap proses.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Ajukan Balik Nama Baru
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Total Pengajuan</span>
            <div className="p-1 sm:p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-base sm:text-xl font-bold text-slate-900 font-mono mt-1.5 sm:mt-2">{totalTransfers} Aset</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">Buku registrasi mutasi</span>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Selesai Yayasan</span>
            <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-base sm:text-xl font-bold text-emerald-700 font-mono mt-1.5 sm:mt-2">{completedCount} Berkas</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">Sertifikat resmi terbit</span>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Proses BPN/Notaris</span>
            <div className="p-1 sm:p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-base sm:text-xl font-bold text-amber-600 font-mono mt-1.5 sm:mt-2">{inProgressCount + verificationCount} Aset</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">{inProgressCount} proses BPN</span>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Total Biaya</span>
            <div className="p-1 sm:p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-sm sm:text-lg font-bold text-slate-900 font-mono mt-1.5 sm:mt-2 truncate">{formatRupiah(totalCostOverall)}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">Akumulasi log proses</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aset, pemilik lama, notaris, catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 text-xs font-medium"
          >
            <option value="ALL">Semua Tahapan Status ({transfers.length})</option>
            <option value="Verifikasi Dokumen">Verifikasi Dokumen</option>
            <option value="Pengukuran & Pengecekan">Pengukuran & Pengecekan</option>
            <option value="Proses BPN / Notaris">Proses BPN / Notaris</option>
            <option value="Selesai / Terbit Sertifikat">Selesai / Terbit Sertifikat</option>
            <option value="Tertunda">Tertunda</option>
          </select>
        </div>
      </div>

      {/* List of Balik Nama Cases with Proportional Craft Layout */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            <RefreshCw className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">Belum ada data pengajuan balik nama yang sesuai filter.</p>
            <p className="text-xs text-slate-400 mt-1">Klik tombol "+ Ajukan Balik Nama Baru" untuk mencatat proses mutasi baru.</p>
          </div>
        ) : (
          filteredTransfers.map((item) => {
            const isFinished = item.status === "Selesai / Terbit Sertifikat";
            const logsList = item.logs && item.logs.length > 0 ? item.logs : [];
            const itemTotalCost = calculateItemTotalCost(item);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header Transfer Banner: PEMILIK LAMA -> TARGET BARU (Matching user design) */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600 block">
                        Pemilik Lama
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {item.fromOwner || "Pewakif Awal"}
                      </span>
                    </div>

                    <div className="text-slate-400 hidden sm:block">
                      <ChevronRight className="w-4 h-4" />
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 block">
                        Target Baru
                      </span>
                      <span className="text-sm font-bold text-emerald-900">
                        {item.toOwner || "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN"}
                      </span>
                    </div>
                  </div>

                  {/* Actions right corner */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {!isFinished && (
                      <button
                        onClick={() => handleAdvanceStep(item)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 border border-emerald-200 transition-colors"
                        title="Tingkatkan tahapan status ke langkah berikutnya"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                        Lanjut Tahap
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-2xs"
                      title="Sunting progres administrasi & log biaya"
                    >
                      <Pencil className="w-3.5 h-3.5 text-amber-600" />
                      Sunting Progres & Biaya
                    </button>

                    <button
                      onClick={() => setTransferToDelete(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Pengajuan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub Header: Asset Name & Start Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.docType}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {isFinished && item.toOwner 
                        ? formatAssetNameWithNewOwner(item.assetName, item.toOwner)
                        : item.assetName} <span className="text-xs font-mono text-emerald-700">[{item.assetCode}]</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tanggal Mulai: <strong>{formatDateIndo(item.submissionDate)}</strong></span>
                  </div>
                </div>

                {/* Catatan Info Utama (Amber/Yellow Card matching user image) */}
                {item.notes && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Catatan Info Utama:</span>
                    </div>
                    <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs font-medium text-amber-950">
                      {item.notes}
                    </div>
                  </div>
                )}

                {/* LOG PROGRES & BIAYA SECTION (Matching user screenshot) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Log Progres & Biaya:
                    </span>
                    <span className="text-xs text-slate-500">
                      {logsList.length} entri proses
                    </span>
                  </div>

                  {logsList.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400 flex items-center justify-between">
                      <span>Belum ada rincian log biaya terpisah.</span>
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="text-emerald-700 font-bold hover:underline text-xs"
                      >
                        + Tambah Log Progres
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {logsList.map((log) => (
                        <div 
                          key={log.id}
                          className="p-2.5 bg-slate-50/90 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                        >
                          <div>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {log.date ? formatDateIndo(log.date) : formatDateIndo(item.submissionDate)}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {log.description}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 font-mono font-bold text-xs">
                              {formatRupiah(log.cost)}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleQuickDeleteLog(item, log.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus rincian berkas/biaya ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Total Biaya Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                        <span className="text-slate-600">Total Biaya:</span>
                        <span className="text-sm font-mono text-rose-600">
                          {formatRupiah(itemTotalCost)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stepper Progress Bar */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      Status Tahapan: <span className="text-emerald-800 font-bold">{item.status}</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-700">{item.progressPercent}%</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFinished ? "bg-emerald-600" : "bg-gradient-to-r from-emerald-500 to-teal-500"
                      }`}
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-4 text-[10px] text-center pt-0.5 font-medium text-slate-500">
                    <div className={item.progressPercent >= 25 ? "text-emerald-800 font-bold" : ""}>
                      1. Verifikasi
                    </div>
                    <div className={item.progressPercent >= 50 ? "text-emerald-800 font-bold" : ""}>
                      2. Cek & Ukur Fisik
                    </div>
                    <div className={item.progressPercent >= 75 ? "text-emerald-800 font-bold" : ""}>
                      3. BPN / Notaris
                    </div>
                    <div className={item.progressPercent >= 100 ? "text-emerald-800 font-bold" : ""}>
                      4. Sertifikat Terbit
                    </div>
                  </div>
                </div>

                {/* Additional Info Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>Instansi: <strong>{item.notaryOffice}</strong></span>
                    <span>•</span>
                    <span>PIC: <strong>{item.handlerName}</strong></span>
                  </div>
                  {item.completionDate && (
                    <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selesai: {formatDateIndo(item.completionDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SUNTING PROGRES ADMINISTRASI MODAL (Matching User Screenshot Layout) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Title Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Pencil className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                    Sunting Progres Administrasi & Biaya
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perbarui nama target balik nama, tanggal proses, catatan info utama, dan rincian log biaya proses.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-800">
              {/* Asset Reference Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Aset Yayasan Terdaftar <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.assetId || ""}
                  onChange={(e) => handleSelectAssetInForm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs focus:border-emerald-600 outline-none font-medium"
                >
                  <option value="">-- Pilih Aset Yayasan --</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>
                      [{a.code}] {a.name} ({a.category})
                    </option>
                  ))}
                  {formData.assetId && !assets.some(a => a.id === formData.assetId) && (
                    <option value={formData.assetId}>
                      [{formData.assetCode || "-"}] {formData.assetName || "Aset Sebelumnya"}
                    </option>
                  )}
                </select>
              </div>

              {/* Editable Nama Aset & Kode Aset */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Nama Aset / Objek Mutasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.assetName}
                    onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:border-emerald-600 outline-none"
                    placeholder="Contoh: Tanah Wakaf Asrama Santri"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Kode Aset
                  </label>
                  <input
                    type="text"
                    value={formData.assetCode || ""}
                    onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 bg-white focus:border-emerald-600 outline-none"
                    placeholder="AST-TNH-01"
                  />
                </div>
              </div>

              {/* Nama Pemilik Baru / Target Balik Nama (Matching User Image) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Pemilik Baru / Target Balik Nama <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.toOwner}
                  onChange={(e) => setFormData({ ...formData, toOwner: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  placeholder="YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN"
                />
              </div>

              {/* Tanggal Mulai Proses & Set Quick Button (Matching User Image) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Tanggal Mulai Proses
                  </label>
                  <input
                    type="date"
                    value={formData.submissionDate}
                    onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        toOwner: "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN",
                        notaryOffice: "Notaris Galis, S.H., M.Kn. & Kantor Pertanahan BPN Madiun",
                        handlerName: "Fahmi Maulana Dwi, S.Kom."
                      }));
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-start justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Set PP Muttaqin
                  </button>
                </div>
              </div>

              {/* Pemilik Lama & Jenis Dokumen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pemilik Lama (Pewakif / Asal)</label>
                  <input
                    type="text"
                    value={formData.fromOwner}
                    onChange={(e) => setFormData({ ...formData, fromOwner: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 outline-none"
                    placeholder="Contoh: Suparminto"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notaris / Kantor PPAT / BPN</label>
                  <input
                    type="text"
                    value={formData.notaryOffice}
                    onChange={(e) => setFormData({ ...formData, notaryOffice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 outline-none"
                    placeholder="Contoh: Notaris Galis, S.H. / BPN"
                  />
                </div>
              </div>

              {/* Status & PIC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahapan Status Balik Nama</label>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      const st = e.target.value as AssetTransferRecord["status"];
                      let pct = 25;
                      if (st === "Pengukuran & Pengecekan") pct = 50;
                      if (st === "Proses BPN / Notaris") pct = 75;
                      if (st === "Selesai / Terbit Sertifikat") pct = 100;
                      setFormData({ ...formData, status: st, progressPercent: pct });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs focus:border-emerald-600 outline-none font-medium"
                  >
                    <option value="Verifikasi Dokumen">1. Verifikasi Dokumen (25%)</option>
                    <option value="Pengukuran & Pengecekan">2. Pengukuran & Pengecekan (50%)</option>
                    <option value="Proses BPN / Notaris">3. Proses BPN / Notaris (75%)</option>
                    <option value="Selesai / Terbit Sertifikat">4. Selesai / Terbit Sertifikat (100%)</option>
                    <option value="Tertunda">Tertunda</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIC Pengurus Yayasan</label>
                  <input
                    type="text"
                    value={formData.handlerName}
                    onChange={(e) => setFormData({ ...formData, handlerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 outline-none"
                    placeholder="Contoh: Fahmi Maulana Dwi, S.Kom."
                  />
                </div>
              </div>

              {formData.status === "Selesai / Terbit Sertifikat" && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-emerald-800 mb-1">
                      Nomor Sertifikat / Dokumen Baru yang Diterbitkan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.docNumber || ""}
                      onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-900 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                      placeholder="Contoh: SHM No. 12.03.04.05.1.00441 / M.441"
                    />
                    <p className="text-[10px] text-emerald-600 mt-1">
                      Wajib diisi. Nomor baru ini akan otomatis menggantikan nomor dokumen lama di database Buku Induk Aset.
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900 font-medium">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Sinkronisasi Otomatis Database Buku Induk Aset:</span>
                    </div>
                    <div className="pl-6 space-y-1.5 text-[11px]">
                      <p>
                        <span className="text-slate-600">Nama Aset Baru di Database:</span>{" "}
                        <strong className="text-emerald-950 font-bold">
                          {formatAssetNameWithNewOwner(formData.assetName, formData.toOwner)}
                        </strong>
                      </p>
                      <p>
                        <span className="text-slate-600">Atas Nama Baru di Sertifikat:</span>{" "}
                        <strong className="text-emerald-950 font-bold">{formData.toOwner || "(Belum diisi)"}</strong>
                      </p>
                      <p>
                        <span className="text-slate-600">No. Sertifikat Baru di Database:</span>{" "}
                        <strong className="text-emerald-950 font-mono font-bold">{formData.docNumber || "(Menunggu input nomor)"}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Catatan Info Utama (Matching User Image) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Catatan Info Utama
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 outline-none font-medium text-slate-900"
                  placeholder="Contoh: Pembaruan BPHTB Oleh Notaris Galis"
                />
              </div>

              {/* Detail Log Progres & Biaya Tambahan (Matching User Image) */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 text-xs block">
                    Detail Log Progres & Biaya Tambahan
                  </label>
                  <span className="text-xs font-mono font-bold text-rose-600">
                    Total: {formatRupiah(currentFormTotalCost)}
                  </span>
                </div>

                {/* Existing Logs List */}
                <div className="space-y-2">
                  {(formData.logs || []).map((log) => (
                    <div 
                      key={log.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {formatDateIndo(log.date)}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {log.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">
                          {formatRupiah(log.cost)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteLogItem(log.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus baris log ini"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Log Row Widget */}
                <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-emerald-900 block">
                    + Tambah Log Proses / Tahapan Baru
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-3">
                      <input
                        type="date"
                        value={newLogDate}
                        onChange={(e) => setNewLogDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        placeholder="Keterangan proses (mis: PPh, Akta, BPHTB)..."
                        value={newLogDesc}
                        onChange={(e) => setNewLogDesc(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        placeholder="Biaya (Rp)..."
                        value={newLogCost}
                        onChange={(e) => setNewLogCost(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <button
                        type="button"
                        onClick={handleAddLogItem}
                        className="w-full py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-start justify-center shadow-2xs"
                        title="Tambahkan ke daftar log"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  {editingTransfer ? "Simpan Perubahan Administrasi" : "Simpan Pengajuan Baru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Iframe-Safe Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!transferToDelete}
        title="Hapus Pengajuan Balik Nama"
        itemName={transferToDelete?.assetName}
        itemDetail={`Kode: ${transferToDelete?.assetCode || "-"} | Status: ${transferToDelete?.status || "-"}`}
        confirmButtonText="Hapus Pengajuan Ini"
        onConfirm={() => {
          if (transferToDelete) {
            onDeleteTransfer(transferToDelete.id);
            setTransferToDelete(null);
          }
        }}
        onClose={() => setTransferToDelete(null)}
      />
    </div>
  );
};
