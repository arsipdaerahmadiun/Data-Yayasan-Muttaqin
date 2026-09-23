import React, { useState } from "react";
import { 
  Landmark,
  List,
  PlusCircle,
  RefreshCw,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import { 
  AssetItem, 
  AssetTransferRecord, 
  AssetBorrowRecord, 
  AssetSubMenu 
} from "../types";
import { AssetInputForm } from "./assets/AssetInputForm";
import { AssetCatalogList } from "./assets/AssetCatalogList";
import { AssetTransferTitleView } from "./assets/AssetTransferTitleView";
import { AssetBorrowDocsView } from "./assets/AssetBorrowDocsView";
import { AssetExportCenter } from "./assets/AssetExportCenter";
import { formatRupiah } from "../services/api";

interface AssetsViewProps {
  readOnly?: boolean;
  assets: AssetItem[];
  transfers?: AssetTransferRecord[];
  borrowRecords?: AssetBorrowRecord[];
  activeSubMenu?: AssetSubMenu;
  onSelectSubMenu?: (menu: AssetSubMenu) => void;
  onAddAsset: (asset: Omit<AssetItem, "id">) => void;
  onUpdateAsset: (asset: AssetItem) => void;
  onDeleteAsset: (id: string) => void;
  onAddTransfer: (transfer: Omit<AssetTransferRecord, "id">) => void;
  onUpdateTransfer: (transfer: AssetTransferRecord) => void;
  onDeleteTransfer: (id: string) => void;
  onAddBorrow: (record: Omit<AssetBorrowRecord, "id">) => void;
  onUpdateBorrow: (record: AssetBorrowRecord) => void;
  onDeleteBorrow: (id: string) => void;
  
            searchTerm: string;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets = [],
  transfers = [],
  borrowRecords = [],
  activeSubMenu = "view-search",
  onSelectSubMenu,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onAddTransfer,
  onUpdateTransfer,
  onDeleteTransfer,
  onAddBorrow,
  onUpdateBorrow,
  onDeleteBorrow,
  
            searchTerm,
  readOnly
}) => {
  const [currentSubTab, setCurrentSubTab] = useState<AssetSubMenu>(activeSubMenu);

  // Sync if parent passes activeSubMenu
  const activeTab = onSelectSubMenu ? activeSubMenu : currentSubTab;
  const setTab = (tab: AssetSubMenu) => {
    setCurrentSubTab(tab);
    if (onSelectSubMenu) {
      onSelectSubMenu(tab);
    }
  };

  const totalItemsCount = assets.length;

  return (
    <div className="space-y-4">
      {/* Top Main Section Title Header (hidden on borrow-docs to match dedicated circulation UI) */}
      {activeTab !== "borrow-docs" && (
        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-800">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Data Aset & Inventaris Yayasan
                  </h1>
                  <p className="text-xs text-slate-500">
                    Sistem Informasi Pengelolaan Tanah Wakaf, Gedung, Kendaraan, Dokumen Legalitas & Sirkulasi Berkas
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Badge in Header */}
            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#121417] border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-500 block">Total Item Terdaftar:</span>
                <span className="font-bold text-slate-900 font-mono">{totalItemsCount} Item</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Sub-Menu Navigation Tabs (Memudahkan Akses Cepat di HP & Laptop) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
        <button
          onClick={() => setTab("view-search")}
          className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "view-search"
              ? "bg-blue-600 text-white shadow-xs font-bold"
              : "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-700 hover:bg-slate-50 dark:bg-[#121417] border border-slate-200 shadow-2xs"
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Buku Induk (Katalog)</span>
        </button>

        {!readOnly && (
          <button
            onClick={() => setTab("input")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "input"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-700 hover:bg-slate-50 dark:bg-[#121417] border border-slate-200 shadow-2xs"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Input Aset Baru</span>
          </button>
        )}

        <button
          onClick={() => setTab("transfer-title")}
          className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "transfer-title"
              ? "bg-emerald-700 text-white shadow-xs font-bold"
              : "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-700 hover:bg-slate-50 dark:bg-[#121417] border border-slate-200 shadow-2xs"
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Balik Nama & Mutasi</span>
        </button>

        <button
          onClick={() => setTab("borrow-docs")}
          className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "borrow-docs"
              ? "bg-amber-600 text-white shadow-xs font-bold"
              : "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-700 hover:bg-slate-50 dark:bg-[#121417] border border-slate-200 shadow-2xs"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Peminjaman Dokumen</span>
        </button>

        <button
          onClick={() => setTab("export")}
          className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "export"
              ? "bg-slate-800 text-white shadow-xs font-bold"
              : "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-slate-700 hover:bg-slate-50 dark:bg-[#121417] border border-slate-200 shadow-2xs"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Pusat Cetak & Ekspor</span>
        </button>
      </div>

      {/* Sub-View Content */}
      <div className="transition-all duration-300">
        {activeTab === "input" && !readOnly && (
          <AssetInputForm
            onAddAsset={onAddAsset}
            onSuccessNavigate={() => setTab("view-search")}
          />
        )}

        {activeTab === "view-search" && (
          <AssetCatalogList
            assets={assets}
            onUpdateAsset={onUpdateAsset}
            onDeleteAsset={onDeleteAsset}
            onNavigateToTransfer={() => setTab("transfer-title")}
            onNavigateToBorrow={() => setTab("borrow-docs")}
            
            searchTerm={searchTerm}
            readOnly={readOnly}
          />
        )}

        {activeTab === "transfer-title" && (
          <AssetTransferTitleView
            transfers={transfers}
            assets={assets}
            onAddTransfer={onAddTransfer}
            onUpdateTransfer={onUpdateTransfer}
            onDeleteTransfer={onDeleteTransfer}
            readOnly={readOnly}
          />
        )}

        {activeTab === "borrow-docs" && (
          <AssetBorrowDocsView
            borrowRecords={borrowRecords}
            assets={assets}
            onAddBorrow={onAddBorrow}
            onUpdateBorrow={onUpdateBorrow}
            onDeleteBorrow={onDeleteBorrow}
            readOnly={readOnly}
          />
        )}

        {activeTab === "export" && (
          <AssetExportCenter
            assets={assets}
            transfers={transfers}
            borrowRecords={borrowRecords}
          />
        )}
      </div>
    </div>
  );
};
