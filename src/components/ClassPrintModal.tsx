import React from "react";
import { X, Printer, Download, GraduationCap, Building2, Calendar, CheckSquare } from "lucide-react";
import { StudentItem, EducationLevel } from "../types";
import { LEVEL_DETAILS, normalizeLevel } from "./StudentsView";

interface ClassPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  classNameTitle: string;
  level: EducationLevel;
  students: StudentItem[];
  foundationName?: string;
  legalNumber?: string;
}

export const ClassPrintModal: React.FC<ClassPrintModalProps> = ({
  isOpen,
  onClose,
  classNameTitle,
  level,
  students,
  foundationName = "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN",
  legalNumber = "AHU-0012345.AH.01.04.Tahun 2021"
}) => {
  if (!isOpen) return null;

  const detail = LEVEL_DETAILS[level] || LEVEL_DETAILS["SMA"];
  const boysCount = students.filter(s => s.gender === "L").length;
  const girlsCount = students.filter(s => s.gender === "P").length;
  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:m-0 print:w-full print:rounded-none">
        {/* Modal Top Bar - Hidden on print */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-start justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Format Cetak Rekap & Presensi Rombel
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {classNameTitle} • {detail.fullName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-6 sm:p-8 overflow-y-auto print:overflow-visible print:p-4 text-slate-900 font-sans space-y-6">
          {/* Foundation Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-3 text-center relative">
            <div className="flex items-start justify-center gap-2 text-slate-900 font-extrabold text-base uppercase tracking-wide">
              <Building2 className="w-5 h-5 text-purple-700 inline-block" />
              <span>{foundationName}</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">
              UNIT PENDIDIKAN TERPADU: {detail.fullName.toUpperCase()}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              SK Kemenkumham RI: {legalNumber} • Akreditasi A Terpadu
            </p>
          </div>

          {/* Document Title & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-transparent print:border-none print:p-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 print:hidden">
                LEGER & PRESENSI KELAS
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                DAFTAR HADIR & REKAPITULASI ROMBONGAN BELAJAR
              </h2>
              <p className="text-xs text-slate-600">
                Kelas: <strong className="text-slate-900 font-bold">{classNameTitle}</strong> • Jenjang: {detail.label}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5">
              <div>Tahun Ajaran: <span className="font-semibold text-slate-900">2025/2026</span></div>
              <div>Jumlah Siswa: <span className="font-semibold text-slate-900">{students.length} Siswa</span> (L: {boysCount}, P: {girlsCount})</div>
              <div className="text-[11px] text-slate-500">Dicetak: {todayFormatted}</div>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto border border-slate-300 rounded-lg print:border-slate-400">
            <table className="w-full text-left text-[11px] text-slate-800 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 print:bg-slate-100">
                  <th className="py-2 px-2.5 text-center border-r border-slate-300 w-8">No</th>
                  <th className="py-2 px-3 border-r border-slate-300">NISN / NIS</th>
                  <th className="py-2 px-3 border-r border-slate-300">Nama Lengkap Siswa</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300 w-10">L/P</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Kategori</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">SPP</th>
                  {/* Attendance or Grade Check Columns */}
                  <th className="py-2 px-1 text-center border-r border-slate-300 w-6">1</th>
                  <th className="py-2 px-1 text-center border-r border-slate-300 w-6">2</th>
                  <th className="py-2 px-1 text-center border-r border-slate-300 w-6">3</th>
                  <th className="py-2 px-1 text-center border-r border-slate-300 w-6">4</th>
                  <th className="py-2 px-1 text-center border-r border-slate-300 w-6">5</th>
                  <th className="py-2 px-1 text-center border-r border-slate-300 w-6">6</th>
                  <th className="py-2 px-1 text-center border-r border-slate-300 w-6">7</th>
                  <th className="py-2 px-1 text-center border-r border-slate-300 w-6">8</th>
                  <th className="py-2 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="py-6 text-center text-slate-400">
                      Belum ada siswa yang terdaftar pada rombel ini.
                    </td>
                  </tr>
                ) : (
                  students.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                      <td className="py-2 px-2 text-center font-medium text-slate-500 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-700 border-r border-slate-200">
                        {s.nisn}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200">
                        {s.name}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-slate-600 border-r border-slate-200">
                        {s.gender}
                      </td>
                      <td className="py-2 px-2.5 text-[10px] text-slate-600 border-r border-slate-200 truncate max-w-[100px]">
                        {s.category.replace("Beasiswa ", "Beas. ")}
                      </td>
                      <td className="py-2 px-2.5 text-[10px] font-semibold text-slate-700 border-r border-slate-200">
                        {s.tuitionStatus}
                      </td>
                      {/* Check columns */}
                      <td className="py-2 border-r border-slate-200 text-center"></td>
                      <td className="py-2 border-r border-slate-200 text-center"></td>
                      <td className="py-2 border-r border-slate-200 text-center"></td>
                      <td className="py-2 border-r border-slate-200 text-center"></td>
                      <td className="py-2 border-r border-slate-200 text-center"></td>
                      <td className="py-2 border-r border-slate-200 text-center"></td>
                      <td className="py-2 border-r border-slate-200 text-center"></td>
                      <td className="py-2 border-r border-slate-200 text-center"></td>
                      <td className="py-2 px-3 text-[10px] text-slate-500">
                        {s.notes ? s.notes.slice(0, 30) : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Document Signatures Footer */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-slate-800">
            <div className="text-center space-y-12">
              <p>Mengetahui,<br /><span className="font-semibold">Kepala Unit {detail.fullName}</span></p>
              <div>
                <p className="font-bold underline text-slate-900">Ust. Muhammad Rofi'i, M.Pd.I</p>
                <p className="text-[10px] text-slate-500 font-mono">NIP. YAS-2016-004</p>
              </div>
            </div>

            <div className="text-center space-y-12">
              <p>Madiun, {todayFormatted}<br /><span className="font-semibold">Wali Kelas / Pengampu Rombel</span></p>
              <div>
                <p className="font-bold underline text-slate-900">Siti Nurhaliza, S.Pd.</p>
                <p className="text-[10px] text-slate-500 font-mono">NIP. YAS-2019-012</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
