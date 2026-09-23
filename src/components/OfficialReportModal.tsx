import React, { useEffect } from "react";
import { X, Printer, Building2, LogOut, ArrowLeft, CheckCircle2, ShieldCheck, Download, FileText } from "lucide-react";
import { DatabaseStore } from "../types";
import { formatDateIndo } from "../services/api";

interface OfficialReportModalProps {
  data: DatabaseStore;
  onClose: () => void;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({ data, onClose }) => {
  const { profile, assets, employees, students, adminReport } = data;

  const totalAssetUnits = assets.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);
  const totalEmployees = employees.length;
  const totalStudents = students.length;
  const scholarshipCount = students.filter(s => s.category.includes("Beasiswa")).length;

  const raCount = students.filter(s => String(s.educationLevel).includes("RA") || String(s.educationLevel).includes("TK")).length;
  const sditCount = students.filter(s => String(s.educationLevel).includes("SD") || String(s.educationLevel).includes("MI") || String(s.educationLevel).includes("SDIT")).length;
  const smpCount = students.filter(s => String(s.educationLevel).includes("SMP") || String(s.educationLevel).includes("MTs")).length;
  const smaCount = students.filter(s => String(s.educationLevel).includes("SMA") || String(s.educationLevel).includes("SMK") || String(s.educationLevel).includes("Pondok")).length;

  const handlePrint = () => {
    window.print();
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
      {/* Floating Close Button at top-right for quick exit from any scroll position */}
      <button
        onClick={onClose}
        title="Tutup Dokumen (ESC)"
        className="fixed top-4 right-4 z-50 p-2.5 bg-slate-900/90 hover:bg-rose-600 text-white rounded-full shadow-2xl border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold print:hidden hover:scale-105"
      >
        <X className="w-5 h-5" />
        <span className="hidden sm:inline pr-1">Tutup (ESC)</span>
      </button>

      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 my-4 sm:my-8 overflow-hidden print:border-none print:shadow-none print:m-0 print:max-w-none">
        
        {/* Sticky Action Header - Always visible while scrolling, hidden during print */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-slate-200 flex items-center justify-between shadow-xs print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Dokumen Laporan Kinerja & Akuntabilitas Terpadu
              </h3>
              <p className="text-[11px] text-slate-500">
                Siap cetak atau unduh format PDF resmi yayasan
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar / Tutup</span>
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 md:p-10 space-y-6 text-slate-900 font-serif">
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

          {/* Document Title */}
          <div className="text-center space-y-1 font-sans">
            <h2 className="text-base md:text-lg font-bold uppercase underline tracking-wider">
              LAPORAN KINERJA EKSEKUTIF & AKUNTABILITAS TATA KELOLA YAYASAN
            </h2>
            <p className="text-xs text-slate-600">
              Periode Pelaporan: <strong>{adminReport.period}</strong> | Nomor Dokumen: <strong>LAP/YAS/{new Date().getFullYear()}/{Math.floor(1000 + Math.random() * 9000)}</strong>
            </p>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
              I. Ringkasan Eksekutif Sistem Basis Data Terpadu
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              Berdasarkan pemantauan sistem basis data terpadu dan proses sinkronisasi real-time pada tanggal {formatDateIndo(new Date().toISOString())}, tata kelola sumber daya {profile.name} mencatat performa operasional yang sangat baik dan terkelola secara akuntabel dengan ringkasan sebagai berikut:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase">Total Inventaris Aset</span>
                <span className="text-xs font-bold font-mono text-slate-900">{assets.length} Item Terdata</span>
                <span className="text-[9px] text-slate-500 block">{totalAssetUnits} Unit Fisik</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase">SDM & Pendidik</span>
                <span className="text-xs font-bold font-mono text-slate-900">{totalEmployees} Pegawai</span>
                <span className="text-[9px] text-emerald-700 block font-medium">Status Aktif & Terdata</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase">Peserta Didik (RA/SDIT/SMP/SMA)</span>
                <span className="text-xs font-bold font-mono text-slate-900">{totalStudents} Siswa</span>
                <span className="text-[9px] text-slate-600 block mt-0.5 font-medium">
                  RA: {raCount} • SDIT: {sditCount} • SMP: {smpCount} • SMA: {smaCount}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase">Skor Kinerja Admin</span>
                <span className="text-xs font-bold font-mono text-amber-700">{adminReport.overallRating}% (A+)</span>
                <span className="text-[9px] text-slate-500 block">{adminReport.tasksCompleted} Tugas Selesai</span>
              </div>
            </div>
          </div>

          {/* Section 2: Asset Inventory Summary Table */}
          <div className="space-y-2 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
              II. Rekapitulasi Inventaris Aset & Sarana Prasarana Pokok
            </h3>
            <table className="w-full text-left text-[11px] border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                <tr>
                  <th className="p-1.5 border-r border-slate-300">Kode</th>
                  <th className="p-1.5 border-r border-slate-300">Nama Aset</th>
                  <th className="p-1.5 border-r border-slate-300">Kategori</th>
                  <th className="p-1.5 border-r border-slate-300">Kuantitas</th>
                  <th className="p-1.5 border-r border-slate-300">Status Balik Nama</th>
                  <th className="p-1.5">Kondisi & PIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assets.slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td className="p-1.5 border-r border-slate-300 font-mono">{a.code}</td>
                    <td className="p-1.5 border-r border-slate-300 font-semibold">{a.name}</td>
                    <td className="p-1.5 border-r border-slate-300">{a.category}</td>
                    <td className="p-1.5 border-r border-slate-300 font-mono">{a.quantity} {a.unit}</td>
                    <td className="p-1.5 border-r border-slate-300 text-[10px]">{a.transferStatus || "Tercatat"}</td>
                    <td className="p-1.5">{a.condition} ({a.custodian.split("(")[0]})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Admin Key Performance Indicators */}
          <div className="space-y-2 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
              III. Evaluasi Indikator Kinerja Utama (IKU) Administrator Yayasan
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
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs font-sans">
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

            <div>
              <p className="text-slate-600">Jakarta, {formatDateIndo(new Date().toISOString())}</p>
              <p className="font-bold text-slate-900 mt-0.5">Administrator Database Yayasan</p>
              <div className="h-20 flex items-start justify-center">
                <span className="text-[10px] text-slate-400 italic border border-dashed border-slate-300 px-3 py-1 rounded">
                  [ Tanda Tangan Digital ]
                </span>
              </div>
              <p className="font-bold text-slate-900 underline">{adminReport.adminName}</p>
              <p className="text-[10px] text-slate-500">NIP: YAS-2018-001</p>
            </div>
          </div>
        </div>

        {/* Bottom Dedicated Exit & Action Footer - Always visible at bottom of document, hidden during print */}
        <div className="bg-slate-50 p-4 md:p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Dokumen resmi terverifikasi sistem basis data terpadu</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-start justify-center gap-2 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-start justify-center gap-2 shadow-sm transition-colors"
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

