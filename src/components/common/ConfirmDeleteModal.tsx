import React from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  itemDetail?: string;
  message?: string;
  confirmButtonText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = "Konfirmasi Hapus Data",
  itemName,
  itemDetail,
  message,
  confirmButtonText = "Ya, Hapus Data",
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {message ? (
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{message}</p>
          ) : (
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin menghapus{" "}
              {itemName && (
                <span className="font-semibold text-slate-900">"{itemName}"</span>
              )}
              {itemDetail && (
                <span className="text-slate-500 font-mono text-xs ml-1">({itemDetail})</span>
              )}
              ? Tindakan ini akan menghapus data secara permanen dan tidak dapat dibatalkan.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
