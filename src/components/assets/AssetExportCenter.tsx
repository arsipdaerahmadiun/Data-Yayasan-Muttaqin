import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Landmark, 
  Building2, 
  RefreshCw, 
  Folder, 
  CheckCircle2, 
  Layers, 
  FileText,
  Filter
} from "lucide-react";
import { AssetItem, AssetTransferRecord, AssetBorrowRecord } from "../../types";
import { exportToCSV, formatRupiah, formatDateIndo } from "../../services/api";

interface AssetExportCenterProps {
  assets: AssetItem[];
  transfers: AssetTransferRecord[];
  borrowRecords: AssetBorrowRecord[];
}

export const AssetExportCenter: React.FC<AssetExportCenterProps> = ({
  assets,
  transfers = [],
  borrowRecords = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3500);
  };

  // 1. Full Master Asset Export
  const handleExportFullAssets = () => {
    const dataToExport = selectedCategory === "ALL" 
      ? assets 
      : assets.filter(a => a.category === selectedCategory);

    const rows = dataToExport.map((a, idx) => ({
      "No": idx + 1,
      "Kode Aset": a.code,
      "Nama Aset": a.name,
      "Kategori": a.category,
      "Kecamatan": a.district || "-",
      "Desa / Kelurahan": a.village || "-",
      "Fungsi / Penggunaan": a.usagePurpose || "-",
      "Tempat Simpan Berkas Asli": a.archiveStorageLocation || "-",
      "Jenis Dokumen Hak": a.legalDocType || "-",
      "Nomor Sertifikat/Dokumen": a.legalDocNumber || "-",
      "Atas Nama Sertifikat / BPKB": a.registeredOwner || a.originalOwner || "-",
      "Pemilik Asal (Pewakif)": a.originalOwner || "-",
      "Status Balik Nama": a.transferStatus || "-",
      "Luas Tanah (m2)": a.landArea || "-",
      "Luas Bangunan (m2)": a.buildingArea || "-",
      "Jenis Kendaraan": a.vehicleType || "-",
      "Merk / Tipe Kendaraan": a.vehicleBrand || "-",
      "Nomor Polisi / Plat": a.licensePlate || "-",
      "Tahun Pembuatan": a.vehicleYear || "-",
      "Pajak": a.taxDay && a.taxMonth ? `${a.taxDay} ${a.taxMonth}` : "-",
      "Nomor PBG": a.pbgNumber || "-",
      "Nomor SLF": a.slfNumber || "-",
      "Kondisi Fisik": a.condition,
      "Status Operasional": a.status,
      "Penanggung Jawab (PIC)": a.custodian,
      "Lokasi Penempatan": a.location,
      "Sumber Perolehan": a.sourceOfFund || "-",
      "Biaya Perolehan (Rp)": a.acquisitionCost || 0,
      "Nilai Saat Ini (Rp)": a.currentValue || 0,
      "Kuantitas": a.quantity,
      "Satuan": a.unit,
      "Tanggal Perolehan": a.acquisitionDate,
      "Tanggal Audit Terakhir": a.lastAuditDate || "-",
      "Catatan": a.notes || "-"
    }));

    exportToCSV(`Buku_Induk_Inventaris_Aset_Yayasan_${new Date().toISOString().split("T")[0]}.csv`, rows);
    showNotification(`Berhasil mengekspor ${rows.length} data inventaris aset ke CSV/Excel!`);
  };

  // 2. Land and Building specialized report (KIB A & B)
  const handleExportLandAndBuilding = () => {
    const landsAndBuildings = assets.filter(a => a.category === "Tanah" || a.category === "Bangunan");
    const rows = landsAndBuildings.map((a, idx) => ({
      "No": idx + 1,
      "Kode Aset": a.code,
      "Nama Properti / Tanah / Gedung": a.name,
      "Kategori": a.category,
      "Kecamatan": a.district || "-",
      "Desa / Kelurahan": a.village || "-",
      "Fungsi / Penggunaan": a.usagePurpose || "-",
      "Tempat Simpan Sertifikat Asli": a.archiveStorageLocation || "-",
      "Luas Tanah (M2)": a.landArea || "-",
      "Luas Bangunan (M2)": a.buildingArea || "-",
      "Jenis Sertifikat / Bukti Hak": a.legalDocType || "-",
      "Nomor Sertifikat / AIW": a.legalDocNumber || "-",
      "Pewakif / Pemilik Awal": a.originalOwner || "-",
      "Atas Nama Sekarang": a.registeredOwner || "-",
      "Status Balik Nama": a.transferStatus || "-",
      "Nomor PBG": a.pbgNumber || "-",
      "Nomor SLF": a.slfNumber || "-",
      "Lokasi Fisik": a.location,
      "PIC Pengelola": a.custodian,
      "Nilai Buku Saat Ini (Rp)": a.currentValue || 0,
      "Catatan": a.notes || "-"
    }));

    exportToCSV(`Laporan_Tanah_Gedung_Yayasan_${new Date().toISOString().split("T")[0]}.csv`, rows);
    showNotification(`Berhasil mengekspor ${rows.length} data tanah & bangunan yayasan!`);
  };

  // 3. Balik Nama Process Export
  const handleExportTransfers = () => {
    const rows = transfers.map((t, idx) => ({
      "No": idx + 1,
      "Kode Aset": t.assetCode,
      "Nama Aset": t.assetName,
      "Kategori": t.category,
      "Jenis Akta / Dokumen": t.docType,
      "Nomor Dokumen": t.docNumber,
      "Pemilik Asal (Pewakif)": t.fromOwner,
      "Nama Baru (Yayasan)": t.toOwner,
      "Notaris / Instansi": t.notaryOffice,
      "Tanggal Permohonan": t.submissionDate,
      "Target Selesai": t.targetDate,
      "Tanggal Selesai": t.completionDate || "Dalam Proses",
      "Status Tahapan": t.status,
      "Progres (%)": `${t.progressPercent}%`,
      "Estimasi Biaya (Rp)": t.estimatedCost,
      "Penanggung Jawab (PIC)": t.handlerName,
      "Catatan": t.notes
    }));

    exportToCSV(`Laporan_Progres_Balik_Nama_Aset_${new Date().toISOString().split("T")[0]}.csv`, rows);
    showNotification(`Berhasil mengekspor ${rows.length} data mutasi balik nama ke CSV/Excel!`);
  };

  // 4. Borrowed Documents Export
  const handleExportBorrowHistory = () => {
    const rows = borrowRecords.map((b, idx) => ({
      "No": idx + 1,
      "Kode Aset": b.assetCode,
      "Judul Dokumen Asli": b.docTitle,
      "Nomor Dokumen": b.docNumber,
      "Nama Peminjam": b.borrowerName,
      "Jabatan/Instansi": b.borrowerRole,
      "Kontak HP": b.borrowerPhone,
      "Tanggal Pinjam": b.borrowDate,
      "Tenggat Waktu": b.dueDate,
      "Tanggal Dikembalikan": b.returnDate || "Masih Dipinjam",
      "Status": b.status,
      "Keperluan": b.purpose,
      "Pemberi Izin": b.approvedBy,
      "Catatan": b.notes || "-"
    }));

    exportToCSV(`Buku_Sirkulasi_Pinjam_Berkas_${new Date().toISOString().split("T")[0]}.csv`, rows);
    showNotification(`Berhasil mengekspor ${rows.length} data sirkulasi berkas fisik!`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
          Pusat Ekspor Laporan & Cetak Rekapitulasi Aset
        </h2>
        <p className="text-xs text-slate-500">
          Unduh data inventaris resmi yayasan dalam format spreadsheet CSV/Excel atau cetak Kartu Inventaris Ruangan (KIR).
        </p>
      </div>

      {exportNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Grid of 4 Export Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Module 1: Master Inventory Export */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <Landmark className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {assets.length} Total Data
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-3">Buku Induk Inventaris Seluruh Aset</h3>
            <p className="text-xs text-slate-500 mt-1">
              Rekapitulasi resmi seluruh inventaris tanah, kendaraan operasional, dan bangunan yayasan.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600">Filter Kategori:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-medium"
              >
                <option value="ALL">Semua Kategori ({assets.length})</option>
                <option value="Tanah">Tanah</option>
                <option value="Kendaraan">Kendaraan</option>
                <option value="Bangunan">Bangunan</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleExportFullAssets}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-start justify-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Unduh Format CSV / Excel (.csv)
          </button>
        </div>

        {/* Module 2: Land & Buildings (KIB A & B) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {assets.filter(a => a.category === "Tanah" || a.category === "Bangunan").length} Properti
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-3">Rekapitulasi Tanah Wakaf & Bangunan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Rincian khusus tanah, luas M², sertifikat SHM/AIW, data pewakif, dan status balik nama yayasan.
            </p>
          </div>

          <button
            onClick={handleExportLandAndBuilding}
            className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold flex items-start justify-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Unduh Rekap Tanah & Gedung (.csv)
          </button>
        </div>

        {/* Module 3: Balik Nama Legalitas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                <RefreshCw className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {transfers.length} Riwayat Mutasi
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-3">Laporan Balik Nama & Sertifikasi</h3>
            <p className="text-xs text-slate-500 mt-1">
              Monitoring riwayat pengurusan sertifikat di BPN / Notaris, persentase progres, dan rincian biaya.
            </p>
          </div>

          <button
            onClick={handleExportTransfers}
            className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold flex items-start justify-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Unduh Laporan Balik Nama (.csv)
          </button>
        </div>

        {/* Module 4: Borrowed Docs Sirkulasi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                <Folder className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                {borrowRecords.length} Catatan Sirkulasi
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-3">Buku Peminjaman Berkas Fisik</h3>
            <p className="text-xs text-slate-500 mt-1">
              Catatan peminjaman sertifikat asli, identitas peminjam, tenggat pengembalian, dan riwayat BAST.
            </p>
          </div>

          <button
            onClick={handleExportBorrowHistory}
            className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold flex items-start justify-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Unduh Buku Peminjaman (.csv)
          </button>
        </div>
      </div>

      {/* Module 5: Print Room Inventory Card (KIR) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cetak Kartu Inventaris Ruangan (KIR) & Label Fisik</h3>
              <p className="text-xs text-slate-500">Format cetak resmi untuk ditempel pada pintu ruangan atau barang fisik inventaris.</p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak KIR Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
