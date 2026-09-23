import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  QrCode, 
  Eye, 
  Edit3, 
  Trash2, 
  MapPin, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Car, 
  Laptop, 
  Wrench, 
  Folder, 
  RefreshCw, 
  X,
  Printer,
  Download
} from "lucide-react";
import { AssetItem, AssetCategory, AssetCondition, AssetStatus, AssetTransferStatus } from "../../types";
import { formatRupiah, formatDateIndo, formatAssetNameWithNewOwner } from "../../services/api";
import { ConfirmDeleteModal } from "../common/ConfirmDeleteModal";

interface AssetCatalogListProps {
  readOnly?: boolean;
  assets: AssetItem[];
  onUpdateAsset: (asset: AssetItem) => void;
  onDeleteAsset: (id: string) => void;
  onNavigateToTransfer?: (asset: AssetItem) => void;
  onNavigateToBorrow?: (asset: AssetItem) => void;
  searchTerm?: string;
}

const CATEGORIES: AssetCategory[] = [
  "Tanah",
  "Kendaraan",
  "Bangunan"
];

export const AssetCatalogList: React.FC<AssetCatalogListProps> = ({
  assets,
  onUpdateAsset,
  onDeleteAsset,
  onNavigateToTransfer,
  onNavigateToBorrow,
  searchTerm: globalSearch = "",
  readOnly = false
}) => {
  const [localSearch, setLocalSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [conditionFilter, setConditionFilter] = useState<string>("ALL");
  const [transferFilter, setTransferFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return "cards";
    }
    return "table";
  });

  const [viewingAsset, setViewingAsset] = useState<AssetItem | null>(null);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<AssetItem | null>(null);

  const search = globalSearch || localSearch;

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      (asset.name || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (asset.code || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (asset.location || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (asset.custodian || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (asset.legalDocNumber && asset.legalDocNumber.toLowerCase().includes((search || "").toLowerCase())) ||
      (asset.originalOwner && asset.originalOwner.toLowerCase().includes((search || "").toLowerCase()));

    const matchesCategory = categoryFilter === "ALL" || asset.category === categoryFilter;
    const matchesCondition = conditionFilter === "ALL" || asset.condition === conditionFilter;
    const matchesTransfer = transferFilter === "ALL" || asset.transferStatus === transferFilter;

    return matchesSearch && matchesCategory && matchesCondition && matchesTransfer;
  });

  const totalItemsCount = filteredAssets.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case "Tanah":
        return <Building2 className="w-4 h-4 text-amber-600" />;
      case "Bangunan":
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case "Kendaraan":
        return <Car className="w-4 h-4 text-emerald-600" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    onUpdateAsset(editingAsset);
    setEditingAsset(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode, nama aset, nomor sertifikat, pewakif, lokasi..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
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

          {/* View toggle & counts */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="text-xs text-slate-600 font-medium">
              Menampilkan <span className="font-bold text-slate-900">{filteredAssets.length}</span> dari {assets.length} Aset
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === "table" ? "bg-white text-blue-800 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
                title="Tampilan Tabel Rinci"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Tabel</span>
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === "cards" ? "bg-white text-blue-800 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
                title="Tampilan Kartu Visual"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Kartu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs text-slate-700">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Filter:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-600 text-xs font-medium"
          >
            <option value="ALL">Semua Kategori ({assets.length})</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-600 text-xs font-medium"
          >
            <option value="ALL">Semua Kondisi</option>
            <option value="Baik">Kondisi Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Berat">Rusak Berat</option>
            <option value="Dalam Perbaikan">Dalam Perbaikan</option>
          </select>

          <select
            value={transferFilter}
            onChange={(e) => setTransferFilter(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-600 text-xs font-medium"
          >
            <option value="ALL">Semua Status Balik Nama</option>
            <option value="Selesai Balik Nama (a.n. Yayasan)">Sudah Balik Nama Yayasan</option>
            <option value="Dalam Proses BPN / Notaris">Dalam Proses BPN / Notaris</option>
            <option value="Belum Balik Nama (a.n. Pemilik Lama/Pewakif)">Belum Balik Nama</option>
          </select>

          {(categoryFilter !== "ALL" || conditionFilter !== "ALL" || transferFilter !== "ALL" || localSearch) && (
            <button
              onClick={() => {
                setCategoryFilter("ALL");
                setConditionFilter("ALL");
                setTransferFilter("ALL");
                setLocalSearch("");
              }}
              className="text-[11px] text-rose-600 hover:text-rose-700 underline font-medium ml-auto"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Mini Summary Banner */}
      <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-500">Total Item Terdaftar: </span>
            <span className="font-bold text-slate-900 font-mono">{filteredAssets.length} Item</span>
          </div>
          <div className="h-4 w-px bg-slate-300"></div>
          <div>
            <span className="text-slate-500">Kuantitas Terfilter: </span>
            <span className="font-bold text-slate-900 font-mono">{totalItemsCount} Unit</span>
          </div>
        </div>
        <div className="text-[11px] text-blue-800 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          Data Terintegrasi & Siap Diaudit
        </div>
      </div>

      {/* Table Mode */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-blue-900/5 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Kode & Nama Aset</th>
                  <th className="px-4 py-3">Kategori & Legalitas</th>
                  <th className="px-4 py-3">Kuantitas</th>
                  <th className="px-4 py-3">Status Balik Nama</th>
                  <th className="px-4 py-3">Lokasi & PIC</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      Tidak ada aset yang sesuai dengan pencarian atau kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {getCategoryIcon(asset.category)}
                          {asset.name}
                        </div>
                        <div className="text-[11px] font-mono text-blue-700 flex items-center gap-1 mt-0.5">
                          <QrCode className="w-3 h-3" />
                          {asset.code}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-1">
                          {asset.category}
                        </span>
                        {asset.legalDocNumber ? (
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[170px]" title={asset.legalDocNumber}>
                            Doc: {asset.legalDocNumber}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic">Tanpa nomor berkas</div>
                        )}
                        {asset.registeredOwner && (
                          <div className="text-[10px] font-semibold text-emerald-800 truncate max-w-[180px]" title={`Atas Nama Sertifikat: ${asset.registeredOwner}`}>
                            a.n. {asset.registeredOwner}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 font-mono font-semibold">
                        {asset.quantity} {asset.unit}
                        {asset.landArea ? <div className="text-[10px] text-slate-500 font-normal">({asset.landArea} M²)</div> : null}
                      </td>

                      <td className="px-4 py-3">
                        {asset.transferStatus ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            asset.transferStatus === "Selesai Balik Nama (a.n. Yayasan)" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                            asset.transferStatus === "Dalam Proses BPN / Notaris" ? "bg-amber-50 text-amber-800 border-amber-200" :
                            asset.transferStatus === "Belum Balik Nama (a.n. Pemilik Lama/Pewakif)" ? "bg-rose-50 text-rose-800 border-rose-200" :
                            "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {asset.transferStatus.includes("Selesai") && <CheckCircle2 className="w-2.5 h-2.5" />}
                            {asset.transferStatus.includes("Proses") && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                            {asset.transferStatus}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-slate-800 truncate max-w-[140px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{asset.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate max-w-[140px]">
                          <User className="w-2.5 h-2.5" />
                          <span>{asset.custodian}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingAsset(asset)}
                            title="Lihat Detail Kartu & QR"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingAsset(asset)}
                            title="Edit Data Aset"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-asset-${asset.id}`}
                            onClick={() => setAssetToDelete(asset)}
                            title="Hapus Aset"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card Grid Mode */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
              Tidak ada aset yang sesuai kriteria filter.
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <div key={asset.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {getCategoryIcon(asset.category)}
                      {asset.category}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-slate-500">{asset.code}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">{asset.name}</h4>
                  
                  {asset.legalDocNumber && (
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                      <FileText className="w-3 h-3 text-slate-400" />
                      {asset.legalDocNumber}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Kondisi Fisik:</span>
                    <span className="font-bold text-slate-900">{asset.condition}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Kuantitas:</span>
                    <span className="font-semibold text-slate-800">{asset.quantity} {asset.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Lokasi:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[130px]">{asset.location}</span>
                  </div>
                  {asset.transferStatus && (
                    <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Balik Nama:</span>
                      <span className="font-semibold text-blue-700 truncate max-w-[130px]">{asset.transferStatus}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setViewingAsset(asset)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Detail & QR
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingAsset(asset)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                      title="Edit Aset"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-delete-asset-card-${asset.id}`}
                      onClick={() => setAssetToDelete(asset)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Aset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Viewing Detail / QR Modal */}
      {viewingAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kartu Inventaris Digital & Legalitas</h3>
                  <p className="text-[11px] text-slate-500">ID: {viewingAsset.code}</p>
                </div>
              </div>
              <button onClick={() => setViewingAsset(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Asset card details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">NAMA INVENTARIS</span>
                  <h4 className="text-base font-bold text-slate-900">{viewingAsset.name}</h4>
                  <p className="text-xs text-blue-800 font-medium">{viewingAsset.category} • {viewingAsset.quantity} {viewingAsset.unit}</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
                  <QrCode className="w-12 h-12 text-slate-800 mx-auto" />
                  <span className="text-[9px] font-mono text-slate-500 mt-1 block">{viewingAsset.code}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500">Kondisi Fisik:</span>
                  <p className="font-bold text-slate-900">{viewingAsset.condition}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Status Operasional:</span>
                  <p className="font-semibold text-emerald-800">{viewingAsset.status}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Nomor Legalitas/Sertifikat:</span>
                  <p className="font-semibold text-slate-900 font-mono truncate">{viewingAsset.legalDocNumber || "-"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Status Balik Nama:</span>
                  <p className="font-semibold text-emerald-800">{viewingAsset.transferStatus || "-"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Pemilik Asal / Pewakif:</span>
                  <p className="font-medium text-slate-800">{viewingAsset.originalOwner || "-"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Atas Nama Tercantum:</span>
                  <p className="font-medium text-slate-800">{viewingAsset.registeredOwner || "-"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Lokasi Fisik:</span>
                  <p className="font-medium text-slate-800">{viewingAsset.location}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Penanggung Jawab (PIC):</span>
                  <p className="font-medium text-slate-800">{viewingAsset.custodian}</p>
                </div>
                {viewingAsset.district && (
                  <div>
                    <span className="text-[10px] text-slate-500">Kecamatan / Desa:</span>
                    <p className="font-medium text-slate-800">{[viewingAsset.district, viewingAsset.village].filter(Boolean).join(", ")}</p>
                  </div>
                )}
                {viewingAsset.vehicleType && (
                  <div>
                    <span className="text-[10px] text-slate-500">Tipe & Nopol Kendaraan:</span>
                    <p className="font-medium text-slate-800">{viewingAsset.vehicleType} {viewingAsset.vehicleBrand ? `(${viewingAsset.vehicleBrand})` : ""} - {viewingAsset.licensePlate || "-"}</p>
                  </div>
                )}
                {viewingAsset.taxDay && viewingAsset.taxMonth && (
                  <div>
                    <span className="text-[10px] text-slate-500">Jatuh Tempo Pajak:</span>
                    <p className="font-semibold text-amber-700">{viewingAsset.taxDay} {viewingAsset.taxMonth}</p>
                  </div>
                )}
                {viewingAsset.pbgNumber && (
                  <div>
                    <span className="text-[10px] text-slate-500">Nomor PBG (IMB):</span>
                    <p className="font-medium text-slate-800 font-mono">{viewingAsset.pbgNumber}</p>
                  </div>
                )}
              </div>

              {viewingAsset.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-500">Keterangan Tambahan:</span>
                  <p className="text-xs text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200 mt-1">
                    {viewingAsset.notes}
                  </p>
                </div>
              )}

              {/* Vault Storage & Barcode Data Info */}
              <div className="pt-3 border-t border-slate-200 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-700" />
                    Penyimpanan Berkas Asli di Brankas & Barcode Khusus
                  </span>
                  <span className="text-[10px] font-semibold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    Arsip Aman
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Lokasi Berkas Fisik: <strong className="font-semibold text-slate-900">{viewingAsset.archiveStorageLocation || "Brankas Kantor Pusat (Madiun)"}</strong>
                </p>

                {/* Download PDF / Scan Berkas Asli */}
                <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">BERKAS DIGITAL TERLAMPIR:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {viewingAsset.pdfCertificateScan ? (
                      <button
                        onClick={() => {
                          alert(`Mengunduh dokumen scan sertifikat: ${viewingAsset.pdfCertificateScan}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Download PDF Sertifikat ({viewingAsset.pdfCertificateScan})
                      </button>
                    ) : viewingAsset.bpkbScan ? (
                      <button
                        onClick={() => {
                          alert(`Mengunduh dokumen scan BPKB/STNK: ${viewingAsset.bpkbScan}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Download Scan BPKB ({viewingAsset.bpkbScan})
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Tidak ada file scan PDF/BPKB terlampir, menggunakan data digital induk.</span>
                    )}
                  </div>
                </div>

                {/* Barcode Khusus / QR Code Data Aset yang bisa discan siapa pun dengan HP / Scanner */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-blue-600" />
                      QR CODE RESMI BERKAS & ASET (SCAN DENGAN HP / KAMERA)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const canvas = document.getElementById(`qr-canvas-${viewingAsset.id}`) as HTMLCanvasElement;
                          if (canvas) {
                            const imageURI = canvas.toDataURL("image/png");
                            const link = document.createElement('a');
                            link.href = imageURI;
                            link.download = `QR-Code-Arsip-${viewingAsset.code}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          } else {
                            alert("QR Code sedang dimuat, silakan coba lagi beberapa saat.");
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Barcode (PNG)
                      </button>

                      <button
                        onClick={() => {
                          const printWindow = window.open('', '_blank');
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head><title>Cetak Label Barcode - ${viewingAsset.code}</title></head>
                                <body style="font-family: Arial; text-align: center; padding: 40px;">
                                  <h2>YAYASAN PONDOK PESANTREN - ARSIP BRANKAS</h2>
                                  <h3>${viewingAsset.name}</h3>
                                  <p><strong>Kode:</strong> ${viewingAsset.code} | <strong>No. Dok:</strong> ${viewingAsset.legalDocNumber || '-'}</p>
                                  <p><strong>Atas Nama:</strong> ${viewingAsset.registeredOwner || viewingAsset.custodian}</p>
                                  <p><strong>Lokasi Brankas:</strong> ${viewingAsset.archiveStorageLocation || 'Brankas Kantor Pusat'}</p>
                                  <div style="margin: 30px auto; padding: 20px; border: 2px dashed #333; display: inline-block;">
                                    <p style="font-size: 14px; margin-bottom: 10px;">SCAN QR UNTUK MELIHAT DATA & DOWNLOAD PDF</p>
                                    <div style="font-family: monospace; font-size: 12px; background: #eee; padding: 10px;">
                                      [DATA JSON QR CODE: ${viewingAsset.code} - ${viewingAsset.name}]
                                    </div>
                                  </div>
                                  <script>window.print();</script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Cetak Label
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {/* Real Scannable QR Code Canvas */}
                    <div className="bg-white p-2 rounded-lg border border-slate-300 shadow-2xs flex items-start justify-center shrink-0">
                        <QRCodeCanvas
                          id={`qr-canvas-${viewingAsset.id}`}
                          value={JSON.stringify({
                            code: viewingAsset.code,
                            name: viewingAsset.name,
                            category: viewingAsset.category,
                            legalNo: viewingAsset.legalDocNumber || "-",
                            owner: viewingAsset.registeredOwner || viewingAsset.custodian,
                            vault: viewingAsset.archiveStorageLocation || "Brankas Kantor Pusat"
                          })}
                          size={320}
                          level={"H"}
                          includeMargin={true}
                          style={{ width: '130px', height: '130px' }}
                        />
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 w-full">
                      <p className="font-semibold text-slate-900 border-b border-slate-200 pb-1">
                        Informasi Isi Barcode (Dapat Discan HP):
                      </p>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                        <div><span className="text-slate-500">Kode:</span> <span className="font-mono font-medium">{viewingAsset.code}</span></div>
                        <div><span className="text-slate-500">Kategori:</span> <span className="font-medium">{viewingAsset.category}</span></div>
                        <div className="col-span-2"><span className="text-slate-500">No. Dok:</span> <span className="font-mono font-medium">{viewingAsset.legalDocNumber || "-"}</span></div>
                        <div className="col-span-2"><span className="text-slate-500">Pemilik / Atas Nama:</span> <span className="font-medium">{viewingAsset.registeredOwner || viewingAsset.custodian}</span></div>
                        <div className="col-span-2"><span className="text-slate-500">Lokasi Brankas:</span> <span className="font-semibold text-amber-800">{viewingAsset.archiveStorageLocation || "Brankas Kantor Pusat (Madiun)"}</span></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-blue-50 p-2.5 rounded-lg border border-blue-200 leading-relaxed">
                    💡 <strong>Cara Penggunaan:</strong> Tempelkan QR Code di atas pada map/amplop berkas fisik di dalam brankas. Siapa pun (pengurus, auditor, atau pimpinan) dapat menscan QR code menggunakan kamera ponsel untuk langsung membuka detail lengkap aset, memverifikasi keaslian dokumen, serta mengunduh file scan PDF Sertifikat atau BPKB secara instan.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Cetak Kartu Inventaris
              </button>

              <button
                onClick={() => setViewingAsset(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-700" />
                Edit Data Aset: {editingAsset.name}
              </h3>
              <button onClick={() => setEditingAsset(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Aset</label>
                  <input
                    type="text"
                    required
                    value={editingAsset.code}
                    onChange={(e) => setEditingAsset({ ...editingAsset, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={editingAsset.category}
                    onChange={(e) => setEditingAsset({ ...editingAsset, category: e.target.value as AssetCategory })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Aset</label>
                <input
                  type="text"
                  required
                  value={editingAsset.name}
                  onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Operasional</label>
                  <select
                    value={editingAsset.status}
                    onChange={(e) => setEditingAsset({ ...editingAsset, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Perlu Pemeliharaan">Perlu Pemeliharaan</option>
                    <option value="Diarsipkan">Diarsipkan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kuantitas & Satuan</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editingAsset.quantity}
                      onChange={(e) => setEditingAsset({ ...editingAsset, quantity: Number(e.target.value) || 1 })}
                      className="w-20 px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                    <input
                      type="text"
                      value={editingAsset.unit}
                      onChange={(e) => setEditingAsset({ ...editingAsset, unit: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={editingAsset.location}
                    onChange={(e) => setEditingAsset({ ...editingAsset, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    value={editingAsset.custodian}
                    onChange={(e) => setEditingAsset({ ...editingAsset, custodian: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kondisi</label>
                  <select
                    value={editingAsset.condition}
                    onChange={(e) => setEditingAsset({ ...editingAsset, condition: e.target.value as AssetCondition })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                    <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Balik Nama</label>
                  <select
                    value={editingAsset.transferStatus || "Belum Balik Nama (a.n. Pemilik Lama/Pewakif)"}
                    onChange={(e) => {
                      const newStatus = e.target.value as AssetTransferStatus;
                      setEditingAsset({ ...editingAsset, transferStatus: newStatus });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="Selesai Balik Nama (a.n. Yayasan)">Selesai Balik Nama (a.n. Yayasan)</option>
                    <option value="Dalam Proses BPN / Notaris">Dalam Proses BPN / Notaris</option>
                    <option value="Verifikasi Dokumen & Pengukuran">Verifikasi Dokumen & Pengukuran</option>
                    <option value="Belum Balik Nama (a.n. Pemilik Lama/Pewakif)">Belum Balik Nama</option>
                    <option value="Tidak Perlu Balik Nama">Tidak Perlu Balik Nama</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Dokumen / Sertifikat</label>
                  <input
                    type="text"
                    value={editingAsset.legalDocNumber || ""}
                    onChange={(e) => setEditingAsset({ ...editingAsset, legalDocNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    placeholder="Contoh: SHM No. 441 / M.441"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Atas Nama di Sertifikat</label>
                  <input
                    type="text"
                    value={editingAsset.registeredOwner || ""}
                    onChange={(e) => setEditingAsset({ ...editingAsset, registeredOwner: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900"
                    placeholder="Nama Pemilik Tercantum"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={editingAsset.notes}
                  onChange={(e) => setEditingAsset({ ...editingAsset, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Iframe-Safe Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!assetToDelete}
        title="Hapus Data Aset Yayasan"
        itemName={assetToDelete?.name}
        itemDetail={assetToDelete?.code}
        confirmButtonText="Hapus Aset Ini"
        onConfirm={() => {
          if (assetToDelete) {
            onDeleteAsset(assetToDelete.id);
            setAssetToDelete(null);
          }
        }}
        onClose={() => setAssetToDelete(null)}
      />
    </div>
  );
};
