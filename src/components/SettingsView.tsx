import React, { useState } from "react";
import { 
  Settings, 
  Building2, 
  Save, 
  RefreshCw, 
  Database, 
  Download, 
  Upload, 
  CheckCircle2, 
  Landmark,
  Users,
  GraduationCap,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { FoundationProfile, DatabaseStore } from "../types";
import { DEFAULT_DATABASE, exportToCSV } from "../services/api";
import { GoogleSheetsSyncCard } from "./GoogleSheetsSyncCard";
import { ConfirmDeleteModal } from "./common/ConfirmDeleteModal";

interface SettingsViewProps {
  readOnly?: boolean;
  profile: FoundationProfile;
  onUpdateProfile: (profile: FoundationProfile) => void;
  fullData: DatabaseStore;
  onRestoreData: (data: DatabaseStore) => void;
  onForceSync: () => void;
  isSyncing: boolean;
}

type SettingsTabType = "sheets" | "profile" | "downloads" | "backup";

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  fullData,
  onRestoreData,
  onForceSync,
  isSyncing
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SettingsTabType>("sheets");
  const [formData, setFormData] = useState<FoundationProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState("");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Backup_Yayasan_Database_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.profile && parsed.assets && parsed.employees && parsed.students) {
            onRestoreData(parsed);
            setRestoreMessage("Database berhasil dipulihkan dari file backup JSON.");
            setTimeout(() => setRestoreMessage(""), 4000);
          } else {
            alert("Format file JSON tidak valid untuk database yayasan!");
          }
        } catch (err) {
          alert("Gagal membaca file JSON.");
        }
      };
    }
  };

  const handleResetToDemo = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmResetToDemo = () => {
    onRestoreData(DEFAULT_DATABASE);
    setFormData({ ...DEFAULT_DATABASE.profile });
    setRestoreMessage("Data telah di-reset ke dataset default.");
    setTimeout(() => setRestoreMessage(""), 4000);
  };

  const handleExportAssetsCSV = () => {
    const rows = fullData.assets.map(a => ({
      "Kode Aset": a.code,
      "Nama Aset / Berkas": a.name,
      "Kategori": a.category,
      "Kondisi": a.condition,
      "Status": a.status,
      "Kuantitas": a.quantity,
      "Nilai Saat Ini (Rp)": a.currentValue,
      "No. Dokumen Legal": a.legalDocNumber || "-",
      "Pemilik / Pengampu": a.registeredOwner || a.custodian || "-",
      "Lokasi Fisik / Brankas": a.archiveStorageLocation || a.location || "-",
      "Tanggal Perolehan": a.acquisitionDate
    }));
    exportToCSV(`Master_Data_Aset_Yayasan_${new Date().toISOString().split("T")[0]}.csv`, rows);
  };

  const handleExportEmployeesCSV = () => {
    const rows = fullData.employees.map(e => ({
      "NIP / ID": e.nip,
      "Nama Lengkap & Gelar": e.name,
      "Jabatan": e.positionTitle || e.role,
      "Unit Penugasan": e.unit,
      "Pendidikan Terakhir": e.education,
      "No. Telepon / WhatsApp": e.phone,
      "Status Kepegawaian": e.employmentStatus,
      "Tgl Bergabung": e.joinDate
    }));
    exportToCSV(`Master_Data_Pegawai_SDM_${new Date().toISOString().split("T")[0]}.csv`, rows);
  };

  const handleExportStudentsCSV = () => {
    const rows = fullData.students.map(s => ({
      "NISN": s.nisn,
      "NIS": s.nis,
      "Nama Lengkap": s.name,
      "Jenis Kelamin": s.gender === "L" ? "Laki-laki" : "Perempuan",
      "Jenjang": s.educationLevel,
      "Rombel / Kelas": s.classGrade,
      "Kategori Binaan": s.category,
      "Nama Wali": s.parentName,
      "No. Wali": s.parentPhone,
      "Status SPP": s.tuitionStatus,
      "Status Santri": s.status,
      "Alamat": s.address || "-"
    }));
    exportToCSV(`Master_Data_Peserta_Didik_${new Date().toISOString().split("T")[0]}.csv`, rows);
  };

  const handleExportAllCombined = () => {
    handleExportAssetsCSV();
    setTimeout(() => handleExportEmployeesCSV(), 400);
    setTimeout(() => handleExportStudentsCSV(), 800);
    setTimeout(() => handleExportJSON(), 1200);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          Pengaturan & Sinkronisasi Sistem
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola integrasi Google Spreadsheet Cloud Database, identitas resmi lembaga, ekspor data, serta pencadangan database.
        </p>
      </div>

      {/* Modern Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#1a1d21] rounded-xl border border-slate-200/80 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab("sheets")}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "sheets"
              ? "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-emerald-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Google Spreadsheet</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>

        <button
          onClick={() => setActiveSubTab("profile")}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "profile"
              ? "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Profil & Legalitas</span>
        </button>

        <button
          onClick={() => setActiveSubTab("downloads")}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "downloads"
              ? "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <Database className="w-4 h-4 text-indigo-600" />
          <span>Pusat Unduh Data</span>
        </button>

        <button
          onClick={() => setActiveSubTab("backup")}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "backup"
              ? "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <RefreshCw className="w-4 h-4 text-slate-600" />
          <span>Cadangan & Reset</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profil yayasan dan konfigurasi tanda tangan berhasil disimpan & disinkronkan.</span>
        </div>
      )}

      {restoreMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{restoreMessage}</span>
        </div>
      )}

      {/* Sub-Tab 1: Google Spreadsheet Cloud Database */}
      {activeSubTab === "sheets" && (
        <div className="space-y-4">
          <GoogleSheetsSyncCard fullData={fullData} onRestoreData={onRestoreData} />
        </div>
      )}

      {/* Sub-Tab 2: Profile & Legalitas */}
      {activeSubTab === "profile" && (
        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Identitas Resmi & Legalitas Yayasan</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Resmi Yayasan</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tahun Berdiri</label>
                <input
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: Number(e.target.value) || 2015 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">SK Kemenkumham RI</label>
                <input
                  type="text"
                  value={formData.legalNumber}
                  onChange={(e) => setFormData({ ...formData, legalNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Registrasi / Legalitas</label>
                <input
                  type="text"
                  value={formData.registrationNo}
                  onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Kantor Pusat Yayasan</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Telepon / Hotline</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Sekretariat</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Ketua Pengurus Yayasan</label>
                <input
                  type="text"
                  value={formData.leaderName}
                  onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
                  placeholder="Drs. H. Ahmad Fauzan, M.Pd."
                />
                <span className="text-[10px] text-slate-500">Penandatangan surat pengesahan resmi</span>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Administrator Yayasan (Admin)</label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
                  placeholder="Fahmi Maulana Dwi, S.Kom."
                />
                <span className="text-[10px] text-slate-500">Pengelola database & pembuat laporan</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Visi Yayasan</label>
              <textarea
                rows={2}
                value={formData.vision}
                onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Simpan Profil Yayasan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sub-Tab 3: Download Master Data */}
      {activeSubTab === "downloads" && (
        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Pusat Unduh Master Data Terpadu
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Format file CSV langsung kompatibel dengan Microsoft Excel dan Google Sheets.
              </p>
            </div>
            <button
              onClick={handleExportAllCombined}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              Download Semua Data Sekaligus
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Aset Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Landmark className="w-4 h-4 text-blue-600" />
                  <span>Data Aset & Berkas</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Total {fullData.assets.length} item inventaris, tanah, gedung, dan berkas brankas.
                </p>
              </div>
              <button
                onClick={handleExportAssetsCSV}
                className="w-full px-3 py-2 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] hover:bg-slate-100 dark:bg-[#1a1d21] text-slate-800 font-semibold rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 shadow-2xs transition-colors text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                Download Aset (.csv)
              </button>
            </div>

            {/* Pegawai Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Data Pegawai & SDM</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Total {fullData.employees.length} guru, pengasuh, dan tenaga kependidikan.
                </p>
              </div>
              <button
                onClick={handleExportEmployeesCSV}
                className="w-full px-3 py-2 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] hover:bg-slate-100 dark:bg-[#1a1d21] text-slate-800 font-semibold rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 shadow-2xs transition-colors text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                Download Pegawai (.csv)
              </button>
            </div>

            {/* Siswa Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <span>Data Peserta Didik</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Total {fullData.students.length} santri aktif & alumni (RA, SDIT, SMP, SMA).
                </p>
              </div>
              <button
                onClick={handleExportStudentsCSV}
                className="w-full px-3 py-2 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] hover:bg-slate-100 dark:bg-[#1a1d21] text-slate-800 font-semibold rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 shadow-2xs transition-colors text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-purple-600" />
                Download Siswa (.csv)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Backup & Restore */}
      {activeSubTab === "backup" && (
        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Database className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Pencadangan, Pemulihan & Reset Database</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Card Backup */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 space-y-2.5">
              <span className="font-bold text-slate-900 block">Cadangkan Data (Export JSON)</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Unduh salinan lengkap seluruh modul (Aset, Pegawai, Peserta Didik, Donasi) dalam format file JSON aman.
              </p>
              <button
                onClick={handleExportJSON}
                className="px-3.5 py-2 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-300 hover:bg-slate-100 dark:bg-[#1a1d21] text-slate-800 font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                Unduh Backup JSON
              </button>
            </div>

            {/* Card Restore */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 space-y-2.5">
              <span className="font-bold text-slate-900 block">Pulihkan Data (Import JSON)</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Unggah file JSON cadangan untuk memulihkan seluruh data yayasan.
              </p>
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-300 hover:bg-slate-100 dark:bg-[#1a1d21] text-slate-800 font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pilih File Backup JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Ingin mengembalikan ke dataset percontohan awal?</span>
            <button
              onClick={handleResetToDemo}
              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
            >
              Reset Data Demo
            </button>
          </div>
        </div>
      )}

      {/* Iframe-Safe Reset Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isResetConfirmOpen}
        title="Reset Seluruh Data Aplikasi"
        message="Apakah Anda yakin ingin me-reset seluruh database aplikasi ke dataset percontohan awal? Seluruh perubahan lokal akan ditimpa dengan data default."
        confirmButtonText="Ya, Reset ke Data Awal"
        onConfirm={handleConfirmResetToDemo}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
