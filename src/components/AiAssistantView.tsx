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
    <div className="space-y-5">
      {/* Unified Top Header Card */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Asisten Analis Cerdas & Narasi Laporan
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  AI Intelligence • Gemini
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Didukung model AI Gemini untuk menghasilkan ringkasan eksekutif, naskah laporan kinerja resmi admin, dan rekomendasi audit aset yayasan.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-xs transition-all cursor-pointer self-start md:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Format Resmi</span>
          </button>
        </div>
      </div>

      {/* 3 Quick Prompt Preset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={() => runAnalysis("admin_performance_narrative")}
          disabled={isLoading}
          className="p-5 rounded-2xl bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-200 hover:border-blue-500/50 text-left shadow-2xs hover:shadow-xs transition-all group space-y-3 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Narasi Laporan Kinerja Admin
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Generate naskah resmi pertanggungjawaban admin dengan rincian KPI, jam kerja, dan capaian terdata.
            </p>
          </div>
        </button>

        <button
          onClick={() => runAnalysis("executive_summary")}
          disabled={isLoading}
          className="p-5 rounded-2xl bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-200 hover:border-blue-500/50 text-left shadow-2xs hover:shadow-xs transition-all group space-y-3 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Ringkasan Eksekutif Yayasan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Analisis komprehensif kesehatan tata kelola 4 modul database yayasan untuk materi rapat dewan pembina.
            </p>
          </div>
        </button>

        <button
          onClick={() => runAnalysis("asset_recommendations")}
          disabled={isLoading}
          className="p-5 rounded-2xl bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-200 hover:border-blue-500/50 text-left shadow-2xs hover:shadow-xs transition-all group space-y-3 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Audit & Rekomendasi Aset
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Deteksi aset yang butuh perbaikan, proyeksi penyusutan, dan estimasi sinking fund pemeliharaan.
            </p>
          </div>
        </button>
      </div>

      {/* Custom Prompt Interactive Box */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs space-y-3">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-500" />
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
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-[#121417] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <button
            onClick={() => customPrompt.trim() && runAnalysis("custom", customPrompt)}
            disabled={isLoading || !customPrompt.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Analisis</span>
          </button>
        </div>
      </div>

      {/* AI Analysis Result Output Box */}
      {isLoading && (
        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl p-10 border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Sedang Mengolah Data Terpadu Yayasan...</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              AI sedang menganalisis {data.assets.length} aset, {data.employees.length} staf, dan {data.students.length} peserta didik secara terintegrasi.
            </p>
          </div>
        </div>
      )}

      {!isLoading && analysisResult && (
        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 md:p-5 bg-slate-50 dark:bg-[#121417] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Hasil Analisis AI Yayasan
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold font-mono border border-blue-200/60 dark:border-blue-800/60">
                Gemini 2.5 Flash
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#22262b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? "Tersalin!" : "Salin Teks"}</span>
              </button>
            </div>
          </div>

          <div className="p-6 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-line">
            {analysisResult}
          </div>
        </div>
      )}

      {!isLoading && !analysisResult && (
        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl p-10 border border-slate-200 shadow-xs text-center space-y-2">
          <Sparkles className="w-10 h-10 text-blue-500 opacity-40 mx-auto" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Pilih salah satu tombol preset di atas</h4>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Sistem akan secara instan menyusun laporan kinerja admin, audit inventaris aset, dan evaluasi peserta didik dengan formulasi baku.
          </p>
        </div>
      )}
    </div>
  );
};
