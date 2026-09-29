import React, { useState } from "react";
import { 
  Landmark,
  ChevronDown,
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
import { TransferStatusChart } from "./assets/TransferStatusChart";
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
  onDeleteBorrow: (record: AssetBorrowRecord) => void;
  
  searchTerm: string;
}

const SUB_MENU_ITEMS: { id: AssetSubMenu; label: string; icon: React.ReactNode }[] = [
  { id: "view-search", label: "Buku Induk (Katalog)", icon: <List className="w-4 h-4" /> },
  { id: "input", label: "Input Aset Baru", icon: <PlusCircle className="w-4 h-4" /> },
  { id: "transfer-title", label: "Balik Nama & Mutasi", icon: <RefreshCw className="w-4 h-4" /> },
  { id: "borrow-docs", label: "Peminjaman Dokumen", icon: <FileText className="w-4 h-4" /> },
  { id: "export", label: "Pusat Cetak & Ekspor", icon: <FileSpreadsheet className="w-4 h-4" /> },
];

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeTab = activeSubMenu;
  const totalItemsCount = assets.length;
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 p-8 rounded-3xl bg-gradient-to-br from-blue-700 to-blue-600 text-white">
      {/* Main Section Title Header */}
      <div className="bg-white/10 border border-white/20 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 justify-start">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30 shadow-lg">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Data Aset & Inventaris Yayasan
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20">
                  {totalItemsCount} Aset Terdata
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1 max-w-3xl">
                Sistem informasi pengelolaan tanah wakaf, gedung, kendaraan, dokumen legalitas, dan sirkulasi peminjaman berkas yayasan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-View Content */}
      <div className="transition-all duration-300">
        {activeTab === "input" && !readOnly && (
          <AssetInputForm
            onAddAsset={onAddAsset}
            onSuccessNavigate={() => onSelectSubMenu?.("view-search")}
          />
        )}

        {activeTab === "view-search" && (
          <div className="space-y-6">
            <div className="bg-white/90 p-4 rounded-2xl border border-white/20 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 mb-4 px-2">Analisis Sertifikasi Aset</h2>
              <div className="h-48">
                <TransferStatusChart assets={assets} />
              </div>
            </div>
            <AssetCatalogList
              assets={assets}
              onUpdateAsset={onUpdateAsset}
              onDeleteAsset={onDeleteAsset}
              onNavigateToTransfer={() => onSelectSubMenu?.("transfer-title")}
              onNavigateToBorrow={() => onSelectSubMenu?.("borrow-docs")}
              
              searchTerm={searchTerm}
              readOnly={readOnly}
            />
          </div>
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
