import React, { useState } from "react";
import { 
  FileCheck2, 
  Award, 
  Plus, 
  Clock, 
  Target, 
  Sparkles, 
  Printer, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Save, 
  ShieldCheck, 
  X,
  TrendingUp,
  FileText
} from "lucide-react";
import { AdminPerformanceReport, AdminDailyLog, AdminMilestone } from "../types";

interface AdminPerformanceViewProps {
  readOnly?: boolean;
  report: AdminPerformanceReport;
  onUpdateReport: (updated: AdminPerformanceReport) => void;
  onOpenReportModal: () => void;
  onOpenAiAssistant: () => void;
}

export const AdminPerformanceView: React.FC<AdminPerformanceViewProps> = ({
  report,
  onUpdateReport,
  onOpenReportModal,
  onOpenAiAssistant
}) => {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<AdminDailyLog | null>(null);

  // New Log Form State
  const [logFormData, setLogFormData] = useState<Omit<AdminDailyLog, "id">>({
    date: new Date().toISOString().split("T")[0],
    activity: "",
    category: "Penginputan Data",
    durationHours: 2.0,
    status: "Selesai",
    evidenceNote: ""
  });

  // KPI Editor State
  const [kpis, setKpis] = useState(report.kpiScores);
  const [isEditingKpi, setIsEditingKpi] = useState(false);

  const handleOpenAddLog = () => {
    setLogFormData({
      date: new Date().toISOString().split("T")[0],
      activity: "",
      category: "Penginputan Data",
      durationHours: 2.0,
      status: "Selesai",
      evidenceNote: ""
    });
    setEditingLog(null);
    setIsLogModalOpen(true);
  };

  const handleOpenEditLog = (log: AdminDailyLog) => {
    setEditingLog(log);
    setLogFormData({ ...log });
    setIsLogModalOpen(true);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logFormData.activity.trim()) {
      alert("Mohon isi deskripsi aktivitas!");
      return;
    }

    let updatedLogs: AdminDailyLog[];
    if (editingLog) {
      updatedLogs = report.dailyLogs.map(l => l.id === editingLog.id ? { ...logFormData, id: editingLog.id } : l);
    } else {
      const newLogItem: AdminDailyLog = {
        ...logFormData,
        id: `log-${Date.now()}`
      };
      updatedLogs = [newLogItem, ...report.dailyLogs];
    }

    onUpdateReport({
      ...report,
      dailyLogs: updatedLogs,
      tasksCompleted: report.tasksCompleted + (editingLog ? 0 : 1),
      tasksTotal: report.tasksTotal + (editingLog ? 0 : 1)
    });

    setIsLogModalOpen(false);
    setEditingLog(null);
  };

  const handleDeleteLog = (id: string) => {
    if (confirm("Hapus catatan log aktivitas ini?")) {
      const updatedLogs = report.dailyLogs.filter(l => l.id !== id);
      onUpdateReport({
        ...report,
        dailyLogs: updatedLogs
      });
    }
  };

  const handleSaveKpis = () => {
    const sum = kpis.dataAccuracy + kpis.syncPunctuality + kpis.assetManagement + kpis.serviceResponse + kpis.reportFulfillment;
    const calculatedOverall = Number((sum / 5).toFixed(1));
    
    onUpdateReport({
      ...report,
      kpiScores: kpis,
      overallRating: calculatedOverall
    });
    setIsEditingKpi(false);
  };

  const totalLogHours = report.dailyLogs.reduce((acc, curr) => acc + (Number(curr.durationHours) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-600" />
            Laporan Kinerja & Akuntabilitas Administrator Yayasan
          </h2>
          <p className="text-xs text-slate-500">
            Pemantauan Indeks Kinerja Utama (KPI/IKU), logbook aktivitas harian, pencapaian milestone, dan laporan pertanggungjawaban admin.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenAiAssistant}
            className="px-3.5 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            Buat Narasi AI
          </button>
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen Resmi
          </button>
        </div>
      </div>

      {/* Admin Profile & Executive Score Card */}
      <div className="bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              Periode Penilaian: {report.period}
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {report.adminName}
            </h3>
            <p className="text-xs text-slate-600">
              {report.roleTitle} • Sekretariat & Database Terpadu Yayasan
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-700 pt-1">
              <span>Tugas Selesai: <strong>{report.tasksCompleted} / {report.tasksTotal}</strong></span>
              <span>•</span>
              <span>Total Jam Kerja Terdata: <strong>{totalLogHours.toFixed(1)} Jam</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] p-4 rounded-xl border border-amber-200 shadow-2xs self-start lg:self-center">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">SKOR KINERJA AKUMULATIF</span>
              <div className="text-3xl font-extrabold text-amber-600 font-mono">
                {report.overallRating}%
              </div>
              <span className="text-[11px] font-semibold text-emerald-700">Kategori: Sangat Unggul</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-start justify-center font-bold text-lg shadow-sm">
              A+
            </div>
          </div>
        </div>
      </div>

      {/* KPI Scores Section */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-600" />
              Indikator Kinerja Utama (IKU / KPI) Administrator
            </h3>
            <p className="text-xs text-slate-500">Evaluasi standar kinerja manajerial dan pemeliharaan basis data yayasan</p>
          </div>
          {isEditingKpi ? (
            <button
              onClick={handleSaveKpis}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan KPI
            </button>
          ) : (
            <button
              onClick={() => setIsEditingKpi(true)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-[#1a1d21] hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Sesuaikan Skor
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">1. Akurasi Data</span>
            {isEditingKpi ? (
              <input
                type="number"
                min="0"
                max="100"
                value={kpis.dataAccuracy}
                onChange={(e) => setKpis({ ...kpis, dataAccuracy: Number(e.target.value) || 0 })}
                className="w-full text-sm font-mono font-bold p-1 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-300 rounded"
              />
            ) : (
              <p className="text-xl font-bold font-mono text-slate-900">{report.kpiScores.dataAccuracy}%</p>
            )}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${report.kpiScores.dataAccuracy}%` }} />
            </div>
            <span className="text-[10px] text-slate-500 block">Validitas berkas & legalitas</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">2. Ketepatan Sinkron</span>
            {isEditingKpi ? (
              <input
                type="number"
                min="0"
                max="100"
                value={kpis.syncPunctuality}
                onChange={(e) => setKpis({ ...kpis, syncPunctuality: Number(e.target.value) || 0 })}
                className="w-full text-sm font-mono font-bold p-1 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-300 rounded"
              />
            ) : (
              <p className="text-xl font-bold font-mono text-slate-900">{report.kpiScores.syncPunctuality}%</p>
            )}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${report.kpiScores.syncPunctuality}%` }} />
            </div>
            <span className="text-[10px] text-slate-500 block">Real-time update server</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">3. Audit & Manajemen Aset</span>
            {isEditingKpi ? (
              <input
                type="number"
                min="0"
                max="100"
                value={kpis.assetManagement}
                onChange={(e) => setKpis({ ...kpis, assetManagement: Number(e.target.value) || 0 })}
                className="w-full text-sm font-mono font-bold p-1 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-300 rounded"
              />
            ) : (
              <p className="text-xl font-bold font-mono text-slate-900">{report.kpiScores.assetManagement}%</p>
            )}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${report.kpiScores.assetManagement}%` }} />
            </div>
            <span className="text-[10px] text-slate-500 block">Monitoring fisik & berkas legal</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">4. Respons Layanan SDM</span>
            {isEditingKpi ? (
              <input
                type="number"
                min="0"
                max="100"
                value={kpis.serviceResponse}
                onChange={(e) => setKpis({ ...kpis, serviceResponse: Number(e.target.value) || 0 })}
                className="w-full text-sm font-mono font-bold p-1 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-300 rounded"
              />
            ) : (
              <p className="text-xl font-bold font-mono text-slate-900">{report.kpiScores.serviceResponse}%</p>
            )}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${report.kpiScores.serviceResponse}%` }} />
            </div>
            <span className="text-[10px] text-slate-500 block">Kecepatan administrasi & surat</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">5. Laporan Pimpinan</span>
            {isEditingKpi ? (
              <input
                type="number"
                min="0"
                max="100"
                value={kpis.reportFulfillment}
                onChange={(e) => setKpis({ ...kpis, reportFulfillment: Number(e.target.value) || 0 })}
                className="w-full text-sm font-mono font-bold p-1 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-300 rounded"
              />
            ) : (
              <p className="text-xl font-bold font-mono text-slate-900">{report.kpiScores.reportFulfillment}%</p>
            )}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${report.kpiScores.reportFulfillment}%` }} />
            </div>
            <span className="text-[10px] text-slate-500 block">Kesesuaian jadwal rapat yayasan</span>
          </div>
        </div>
      </div>

      {/* Daily Logs Table */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Logbook Aktivitas Kerja Harian Administrator
            </h3>
            <p className="text-xs text-slate-500">Rekam jejak pengerjaan tugas, durasi, dan output bukti administrasi yayasan</p>
          </div>
          <button
            onClick={handleOpenAddLog}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-center shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            + Catat Log Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 dark:bg-[#121417] text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Kategori Tugas</th>
                <th className="px-4 py-3">Deskripsi Aktivitas & Output</th>
                <th className="px-4 py-3">Durasi</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.dailyLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Belum ada catatan log aktivitas harian.
                  </td>
                </tr>
              ) : (
                report.dailyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/ dark:bg-[#121417]/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {log.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{log.activity}</p>
                      {log.evidenceNote && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">Bukti/Output: {log.evidenceNote}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                      {log.durationHours} Jam
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditLog(log)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Milestones & Strategic Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            Milestone & Target Digitalisasi Yayasan
          </h3>
          <div className="space-y-3">
            {report.milestones.map((mst) => (
              <div key={mst.id} className="p-3 rounded-lg bg-slate-50 dark:bg-[#121417] border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{mst.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    mst.status === "Tercapai" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {mst.status} ({mst.progress}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{ width: `${mst.progress}%` }} />
                </div>
                <p className="text-[10px] text-slate-500">Target Penyelesaian: {mst.targetDate}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            Capaian Utama & Rekomendasi Tindak Lanjut
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {report.keyAchievements.map((ach, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{ach}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 border-t border-slate-100 text-xs">
            <span className="font-semibold text-slate-800">Catatan Mitigasi Kendala:</span>
            <p className="text-slate-600 mt-1 italic">{report.challengesAndSolutions}</p>
          </div>
        </div>
      </div>

      {/* Add / Edit Daily Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                {editingLog ? "Edit Catatan Aktivitas Admin" : "Tambah Catatan Aktivitas Harian"}
              </h3>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    required
                    value={logFormData.date}
                    onChange={(e) => setLogFormData({ ...logFormData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Tugas</label>
                  <select
                    value={logFormData.category}
                    onChange={(e) => setLogFormData({ ...logFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-amber-500"
                  >
                    <option value="Penginputan Data">Penginputan Data</option>
                    <option value="Rekonsiliasi Aset">Rekonsiliasi Aset</option>
                    <option value="Pelayanan Pegawai">Pelayanan Pegawai</option>
                    <option value="Administrasi Siswa">Administrasi Siswa</option>
                    <option value="Sinkronisasi Sistem">Sinkronisasi Sistem</option>
                    <option value="Rapat & Koordinasi">Rapat & Koordinasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Uraian Aktivitas Pekerjaan</label>
                <textarea
                  rows={3}
                  required
                  value={logFormData.activity}
                  onChange={(e) => setLogFormData({ ...logFormData, activity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-amber-500"
                  placeholder="Contoh: Melakukan verifikasi dan rekonsiliasi data SPP dan beasiswa peserta didik..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Durasi Pengerjaan (Jam)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    required
                    value={logFormData.durationHours}
                    onChange={(e) => setLogFormData({ ...logFormData, durationHours: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Pengerjaan</label>
                  <select
                    value={logFormData.status}
                    onChange={(e) => setLogFormData({ ...logFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-amber-500"
                  >
                    <option value="Selesai">Selesai</option>
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Bukti / Output Administrasi</label>
                <input
                  type="text"
                  value={logFormData.evidenceNote || ""}
                  onChange={(e) => setLogFormData({ ...logFormData, evidenceNote: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-amber-500"
                  placeholder="Contoh: Berkas tervalidasi dan QR Code terbit."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1a1d21] hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  {editingLog ? "Simpan Perubahan" : "Simpan ke Logbook"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
