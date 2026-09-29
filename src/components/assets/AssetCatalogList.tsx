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
    const q = (search || "").toLowerCase().trim();
    if (!q) return true;

    return (
      (asset.name || "").toLowerCase().includes(q) ||
      (asset.code || "").toLowerCase().includes(q) ||
      (asset.location || "").toLowerCase().includes(q) ||
      (asset.custodian || "").toLowerCase().includes(q) ||
      (asset.category || "").toLowerCase().includes(q) ||
      (asset.condition || "").toLowerCase().includes(q) ||
      (asset.transferStatus || "").toLowerCase().includes(q) ||
      (asset.legalDocNumber && asset.legalDocNumber.toLowerCase().includes(q)) ||
      (asset.originalOwner && asset.originalOwner.toLowerCase().includes(q))
    );
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
    <div className="space-y-6">
      {/* Top Bar - Dibuat Lebih Bersih */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aset..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md text-sm transition-all ${
                viewMode === "table" ? "bg-white text-blue-700 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 rounded-md text-sm transition-all ${
                viewMode === "cards" ? "bg-white text-blue-700 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Mode */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nama Aset</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Lokasi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{asset.name}</td>
                    <td className="px-6 py-4">{asset.category}</td>
                    <td className="px-6 py-4">{asset.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        asset.transferStatus?.includes("Selesai") 
                          ? "bg-emerald-500 text-white" 
                          : "bg-amber-400 text-white"
                      }`}>
                        {asset.transferStatus || "Status Belum Set"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setViewingAsset(asset)} className="p-2 text-slate-400 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setEditingAsset(asset)} className="p-2 text-slate-400 hover:text-amber-600"><Edit3 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card Mode - Dibuat Lebih Profesional */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400">Tidak ada aset ditemukan.</div>
          ) : (
            filteredAssets.map((asset) => (
              <div key={asset.id} className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {asset.category}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-400">{asset.code}</span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {asset.name}
                  </h4>
                  
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{asset.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{asset.custodian || "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    asset.transferStatus?.includes("Selesai") 
                      ? "bg-emerald-500 text-white" 
                      : "bg-amber-400 text-white"
                  }`}>
                    {asset.transferStatus || "Status Belum Set"}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => setViewingAsset(asset)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => setEditingAsset(asset)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={editingAsset.category}
                    onChange={(e) => setEditingAsset({ ...editingAsset, category: e.target.value as AssetCategory })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Operasional</label>
                  <select
                    value={editingAsset.status}
                    onChange={(e) => setEditingAsset({ ...editingAsset, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
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
                      className="w-20 px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900"
                    />
                    <input
                      type="text"
                      value={editingAsset.unit}
                      onChange={(e) => setEditingAsset({ ...editingAsset, unit: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    value={editingAsset.custodian}
                    onChange={(e) => setEditingAsset({ ...editingAsset, custodian: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kondisi</label>
                  <select
                    value={editingAsset.condition}
                    onChange={(e) => setEditingAsset({ ...editingAsset, condition: e.target.value as AssetCondition })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs text-slate-900"
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
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
