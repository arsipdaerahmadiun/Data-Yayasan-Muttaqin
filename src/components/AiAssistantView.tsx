import React, { useState } from "react";
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  FileText, 
  Landmark, 
  Award, 
  RefreshCw, 
  Bot, 
  Printer, 
  HelpCircle,
  Lightbulb
} from "lucide-react";
import { DatabaseStore } from "../types";
import { requestAiAnalysis } from "../services/api";

interface AiAssistantViewProps {
  data: DatabaseStore;
  onOpenReportModal: () => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ data, onOpenReportModal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [activeAnalysisType, setActiveAnalysisType] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const runAnalysis = async (
    type: "executive_summary" | "admin_performance_narrative" | "asset_recommendations" | "custom",
    customQuery?: string
  ) => {
    setIsLoading(true);
    setActiveAnalysisType(type);
    setAnalysisResult("");

    try {
      const res = await requestAiAnalysis({
        type,
        prompt: customQuery,
        currentData: data
      });

      if (res.success && res.analysis) {
        setAnalysisResult(res.analysis);
      } else {
        setAnalysisResult("Tidak dapat memproses analisis saat ini. Silakan coba kembali.");
      }
    } catch (e: any) {
      setAnalysisResult(`Error: ${e.message || "Gagal menghubungi layanan AI"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            Asisten Analis Cerdas & Narasi Laporan Yayasan (AI Assistant)
          </h2>
          <p className="text-xs text-slate-500">
            Didukung model AI Gemini untuk menghasilkan ringkasan eksekutif, naskah laporan kinerja resmi admin, dan rekomendasi audit aset yayasan.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 self-start md:self-center shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          Cetak Format Resmi
        </button>
      </div>

      {/* 3 Quick Prompt Preset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => runAnalysis("admin_performance_narrative")}
          disabled={isLoading}
          className="p-4 rounded-xl bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-200 hover:border-amber-400 text-left shadow-2xs hover:shadow-xs transition-all group space-y-2"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-start justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
              Narasi Laporan Kinerja Bulanan Admin
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Generate naskah resmi pertanggungjawaban admin dengan rincian KPI, jam kerja, dan capaian terdata.
            </p>
          </div>
        </button>

        <button
          onClick={() => runAnalysis("executive_summary")}
          disabled={isLoading}
          className="p-4 rounded-xl bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-200 hover:border-teal-400 text-left shadow-2xs hover:shadow-xs transition-all group space-y-2"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-start justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
              Ringkasan Eksekutif Dewan Pembina
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Analisis komprehensif kesehatan tata kelola 4 modul database yayasan untuk materi rapat pleno.
            </p>
          </div>
        </button>

        <button
          onClick={() => runAnalysis("asset_recommendations")}
          disabled={isLoading}
          className="p-4 rounded-xl bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-200 hover:border-blue-400 text-left shadow-2xs hover:shadow-xs transition-all group space-y-2"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-start justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
              Audit & Rekomendasi Pemeliharaan Aset
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Deteksi aset yang butuh perbaikan, proyeksi penyusutan, dan estimasi sinking fund pemeliharaan.
            </p>
          </div>
        </button>
      </div>

      {/* Custom Prompt Interactive Box */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Ajukan Pertanyaan atau Perintah Analisis Khusus tentang Data Yayasan:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customPrompt.trim()) {
                runAnalysis("custom", customPrompt);
              }
            }}
            placeholder="Contoh: Berikan simulasi rasio pendidik per santri di unit SMP dan SMA..."
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#121417] rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
          />
          <button
            onClick={() => customPrompt.trim() && runAnalysis("custom", customPrompt)}
            disabled={isLoading || !customPrompt.trim()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Analisis
          </button>
        </div>
      </div>

      {/* AI Analysis Result Output Box */}
      {isLoading && (
        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-8 border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3 text-center">
          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-start justify-center animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Sedang Mengolah Data Terpadu Yayasan...</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              AI sedang menganalisis {data.assets.length} aset, {data.employees.length} staf, dan {data.students.length} peserta didik secara terintegrasi.
            </p>
          </div>
        </div>
      )}

      {!isLoading && analysisResult && (
        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-[#121417] border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold text-slate-800">
                Hasil Analisis AI Yayasan
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-semibold font-mono">
                Gemini 2.5 Flash
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-300 rounded-md flex items-center gap-1 shadow-2xs hover:bg-slate-50 dark:bg-[#121417] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Tersalin!" : "Salin Teks"}
              </button>
            </div>
          </div>

          <div className="p-6 text-xs text-slate-800 leading-relaxed font-sans prose-sm max-w-none space-y-3 whitespace-pre-line">
            {analysisResult}
          </div>
        </div>
      )}

      {!isLoading && !analysisResult && (
        <div className="bg-slate-50 dark:bg-[#121417] rounded-xl p-8 border border-slate-200 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-700">Pilih salah satu tombol preset di atas</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Sistem akan secara instan menyusun laporan kinerja admin, audit inventaris aset, dan evaluasi peserta didik dengan formulasi baku.
          </p>
        </div>
      )}
    </div>
  );
};
