import React, { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import { 
  LogOut, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  KeyRound,
  PanelLeftOpen,
  PanelLeftClose,
  LayoutDashboard,
  Landmark,
  GraduationCap,
  Users,
  Menu
} from "lucide-react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { LoginModal } from "./components/LoginModal";
import { DashboardView } from "./components/DashboardView";
import { AssetsView } from "./components/AssetsView";
import { EmployeesView } from "./components/EmployeesView";
import { StudentsView } from "./components/StudentsView";
import { AlumniView } from "./components/AlumniView";
import { DonationsView } from "./components/DonationsView";
import { MeetingsView } from "./components/MeetingsView";
import { AdminPerformanceView } from "./components/AdminPerformanceView";
import { AiAssistantView } from "./components/AiAssistantView";
import { SettingsView } from "./components/SettingsView";
import { OfficialReportModal } from "./components/OfficialReportModal";
import { 
  DatabaseStore, 
  ActiveTab, 
  AssetItem, 
  AssetTransferRecord,
  AssetTransferStatus,
  AssetBorrowRecord,
  AssetSubMenu,
  StudentSubMenu,
  EmployeeSubMenu,
  EmployeeItem, 
  StudentItem, 
  AdminPerformanceReport, 
  FoundationProfile,
  AuditLogItem,
  SyncHistoryItem,
  DonationRecord,
  MeetingRecord
} from "./types";
import { 
  loadLocalDatabase, 
  saveLocalDatabase, 
  fetchServerDatabase, 
  syncDatabaseToServer, 
  DEFAULT_DATABASE,
  formatAssetNameWithNewOwner,
  matchAssetWithTransfer,
  reconcileTransfersWithAssets
} from "./services/api";
import {
  isSheetsConfigured,
  isSheetsAutoSyncEnabled,
  pushAllDataToSheets,
  pullAllDataFromSheets,
  upsertItemToSheets,
  deleteItemFromSheets,
  fetchRemoteSheetsConfig,
  saveSheetsConfig
} from "./lib/sheets";

export default function App() {
  const [data, setData] = useState<DatabaseStore>(() => loadLocalDatabase());
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [activeAssetSubMenu, setActiveAssetSubMenu] = useState<AssetSubMenu>("view-search");
  const [activeStudentSubMenu, setActiveStudentSubMenu] = useState<StudentSubMenu>("ALL");
  const [activeEmployeeSubMenu, setActiveEmployeeSubMenu] = useState<EmployeeSubMenu>("ALL");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSheetsSyncing, setIsSheetsSyncing] = useState(false);
  const [lastSheetsSyncTime, setLastSheetsSyncTime] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toISOString());
  const [pendingCount, setPendingCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication & Role state ("admin" | "visitor") - Defaults to "admin" so the interface displays immediately
  const [authRole, setAuthRole] = useState<"admin" | "visitor">(() => {
    try {
      const saved = localStorage.getItem("portal_terpadu_auth_role");
      if (saved === "admin" || saved === "visitor") return saved;
    } catch {}
    return "admin";
  });
  const [authUsername, setAuthUsername] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("portal_terpadu_auth_username");
      if (saved) return saved;
    } catch {}
    return "Fahmi Maulana Dwi, S.Kom.";
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("portal_terpadu_auth_role", authRole);
      localStorage.setItem("portal_terpadu_auth_username", authUsername);
    } catch {}
  }, [authRole, authUsername]);
  
  // State to toggle/collapse sidebar (pilihan menu)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return false; // Close mobile drawer by default for optimal view
    }
    try {
      const saved = localStorage.getItem("portal_terpadu_sidebar_open");
      if (saved !== null) return saved === "true";
    } catch {}
    return true;
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("portal_terpadu_sidebar_open", String(next));
      } catch {}
      return next;
    });
  }, []);

  // Dark / Light Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("portal_terpadu_dark_mode");
      if (saved !== null) return saved === "true";
    } catch {}
    return false;
  });

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("portal_terpadu_dark_mode", String(next));
      } catch {}
      return next;
    });
  }, []);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const debounceSyncTimeout = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Helper to record audit log
  const recordAudit = useCallback((action: AuditLogItem["action"], entityType: AuditLogItem["entityType"], details: string) => {
    const newAuditLog: AuditLogItem = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName: dataRef.current.profile.adminName || "Admin Yayasan",
      action,
      entityType,
      details
    };
    return newAuditLog;
  }, []);

  // Sync to Server and Google Sheets concurrently
  const performSync = useCallback(async (currentPayload?: DatabaseStore) => {
    const payload = currentPayload || dataRef.current;
    setIsSyncing(true);

    const hasSheets = isSheetsConfigured() && isSheetsAutoSyncEnabled();
    if (hasSheets) {
      setIsSheetsSyncing(true);
    }

    try {
      const results = await Promise.allSettled([
        syncDatabaseToServer(payload),
        hasSheets ? pushAllDataToSheets(payload) : Promise.resolve(null)
      ]);

      const serverRes = results[0].status === "fulfilled" ? results[0].value : null;
      const sheetsRes = results[1].status === "fulfilled" ? results[1].value : null;

      if (serverRes && serverRes.success) {
        setLastSyncTime(serverRes.syncedAt || new Date().toISOString());
        setPendingCount(0);
      }

      if (sheetsRes && sheetsRes.success) {
        setLastSheetsSyncTime(new Date().toISOString());
      }
    } catch (err) {
      console.warn("Sync error:", err);
    } finally {
      setIsSyncing(false);
      setIsSheetsSyncing(false);
    }
  }, []);

  // Initial Fetch from Server & Google Sheets (runs strictly once on mount)
  useEffect(() => {
    async function initFetch() {
      const serverData = await fetchServerDatabase();
      if (serverData) {
        setData(serverData);
        setLastSyncTime(new Date().toISOString());
        // If server already has the single spreadsheet configured, adopt it immediately
        if (serverData.sheetsConfig?.webAppUrl) {
          saveSheetsConfig(serverData.sheetsConfig.webAppUrl, serverData.sheetsConfig.sheetDocUrl, serverData.sheetsConfig.autoSync);
        }
      }

      // If not configured yet, attempt to fetch remote shared config from server
      if (!isSheetsConfigured()) {
        const remoteCfg = await fetchRemoteSheetsConfig();
        if (remoteCfg?.webAppUrl) {
          saveSheetsConfig(remoteCfg.webAppUrl, remoteCfg.sheetDocUrl, remoteCfg.autoSync);
        }
      }

      // Automatically sync latest cloud state from the single Google Spreadsheet on startup
      if (isSheetsConfigured() && isSheetsAutoSyncEnabled()) {
        try {
          setIsSheetsSyncing(true);
          const sheetsRes = await pullAllDataFromSheets();
          if (sheetsRes.success && sheetsRes.data) {
            setData((prev) => {
              const merged: DatabaseStore = {
                ...prev,
                profile: sheetsRes.data!.profile ? { ...prev.profile, ...sheetsRes.data!.profile } : prev.profile,
                assets: sheetsRes.data!.assets && sheetsRes.data!.assets.length > 0 ? sheetsRes.data!.assets : prev.assets,
                employees: sheetsRes.data!.employees && sheetsRes.data!.employees.length > 0 ? sheetsRes.data!.employees : prev.employees,
                students: sheetsRes.data!.students && sheetsRes.data!.students.length > 0 ? sheetsRes.data!.students : prev.students,
                donations: sheetsRes.data!.donations && sheetsRes.data!.donations.length > 0 ? sheetsRes.data!.donations : prev.donations,
                assetTransfers: sheetsRes.data!.assetTransfers && sheetsRes.data!.assetTransfers.length > 0 ? sheetsRes.data!.assetTransfers : (prev.assetTransfers || []),
                borrowedDocs: sheetsRes.data!.borrowedDocs && sheetsRes.data!.borrowedDocs.length > 0 ? sheetsRes.data!.borrowedDocs : (prev.borrowedDocs || []),
                meetings: sheetsRes.data!.meetings && sheetsRes.data!.meetings.length > 0 ? sheetsRes.data!.meetings : (prev.meetings || [])
              };
              saveLocalDatabase(merged);
              return merged;
            });
            setLastSheetsSyncTime(new Date().toISOString());
          }
        } catch (err) {
          console.warn("Google Sheets initial pull error:", err);
        } finally {
          setIsSheetsSyncing(false);
        }
      }
    }
    initFetch();

    // Online / Offline listener
    const handleOnline = () => {
      setIsOnline(true);
      showToast("Koneksi online kembali. Menyinkronkan database...");
      performSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast("Koneksi internet terputus. Beralih ke penyimpanan lokal.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic auto-sync interval every 45 seconds
    const interval = setInterval(() => {
      if (navigator.onLine) {
        performSync();
      }
    }, 45000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [performSync]);

  // Auto-persist locally on state changes & debounced server sync
  const updateDataWithAudit = useCallback((updater: (prev: DatabaseStore) => DatabaseStore, auditAction?: { action: AuditLogItem["action"]; entityType: AuditLogItem["entityType"]; details: string }) => {
    setData((prev) => {
      let auditLogItem: AuditLogItem | null = null;
      if (auditAction) {
        auditLogItem = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userName: prev.profile.adminName || "Admin Yayasan",
          action: auditAction.action,
          entityType: auditAction.entityType,
          details: auditAction.details
        };
      }

      const nextData = updater(prev);
      const finalData: DatabaseStore = {
        ...nextData,
        auditLogs: auditLogItem ? [auditLogItem, ...nextData.auditLogs.slice(0, 40)] : nextData.auditLogs
      };

      saveLocalDatabase(finalData);

      // Instant synchronization trigger upon inputting data
      setIsSyncing(true);
      if (isSheetsConfigured() && isSheetsAutoSyncEnabled()) {
        setIsSheetsSyncing(true);
      }

      // Fast 300ms debounce so all data inputs are synced to cloud automatically without lag
      if (debounceSyncTimeout.current) {
        clearTimeout(debounceSyncTimeout.current);
      }
      debounceSyncTimeout.current = setTimeout(() => {
        performSync(finalData);
      }, 300);

      return finalData;
    });

    setPendingCount((c) => c + 1);
  }, [performSync]);

  // CRUD for Assets
  const handleAddAsset = (newAsset: Omit<AssetItem, "id">) => {
    const item: AssetItem = {
      ...newAsset,
      id: `ast-${Date.now()}`
    };
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        assets: [item, ...prev.assets]
      }),
      {
        action: "CREATE",
        entityType: "Aset",
        details: `Menambahkan aset baru: ${item.name} (${item.code})`
      }
    );
    showToast(`Aset "${item.name}" berhasil ditambahkan & disinkronkan otomatis.`);
    upsertItemToSheets("assets", item).catch((err) => console.warn("Sheets asset upsert:", err));
  };

  const handleUpdateAsset = (updatedAsset: AssetItem) => {
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        assets: prev.assets.map((a) => (a.id === updatedAsset.id ? updatedAsset : a))
      }),
      {
        action: "UPDATE",
        entityType: "Aset",
        details: `Memperbarui data aset: ${updatedAsset.name} (${updatedAsset.code})`
      }
    );
    showToast(`Aset "${updatedAsset.name}" berhasil diperbarui & disinkronkan otomatis.`);
    upsertItemToSheets("assets", updatedAsset).catch((err) => console.warn("Sheets asset update:", err));
  };

  const handleDeleteAsset = (id: string) => {
    const target = data.assets.find((a) => a.id === id);
    updateDataWithAudit(
      (prev) => {
        const nextAssets = prev.assets.filter((a) => a.id !== id);
        // Also clean up any transfers and borrowed docs pointing to this deleted asset
        const nextTransfers = (prev.assetTransfers || []).filter((t) => {
          if (t.assetId && t.assetId === id) return false;
          if (target && target.code && t.assetCode === target.code) return false;
          return true;
        });
        const nextBorrowedDocs = (prev.borrowedDocs || []).filter((b) => {
          if (b.assetId && b.assetId === id) return false;
          if (target && target.code && b.assetCode === target.code) return false;
          return true;
        });

        return {
          ...prev,
          assets: nextAssets,
          assetTransfers: nextTransfers,
          borrowedDocs: nextBorrowedDocs
        };
      },
      {
        action: "DELETE",
        entityType: "Aset",
        details: `Menghapus data aset: ${target?.name || id}`
      }
    );
    showToast("Data aset berhasil dihapus & disinkronkan otomatis.");
    deleteItemFromSheets("assets", id).catch((err) => console.warn("Sheets asset delete:", err));
  };

  // Sync Asset Data with Balik Nama Status
  const syncAssetWithTransfer = (assets: AssetItem[], transfer: AssetTransferRecord): AssetItem[] => {
    return assets.map((a) => {
      const isTarget = matchAssetWithTransfer(a, transfer);

      if (!isTarget) return a;

      if (transfer.status === "Selesai / Terbit Sertifikat") {
        const targetOwner = transfer.toOwner?.trim() || a.registeredOwner || "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN";
        const updatedName = formatAssetNameWithNewOwner(a.name, targetOwner);
        
        return {
          ...a,
          name: updatedName,
          registeredOwner: targetOwner,
          custodian: a.custodian && a.custodian.toLowerCase().includes("yayasan") ? a.custodian : targetOwner,
          originalOwner: transfer.fromOwner || a.originalOwner,
          transferStatus: "Selesai Balik Nama (a.n. Yayasan)",
          legalDocType: transfer.docType || a.legalDocType,
          legalDocNumber: transfer.docNumber?.trim() ? transfer.docNumber.trim() : a.legalDocNumber
        };
      } else if (transfer.status === "Proses BPN / Notaris") {
        return {
          ...a,
          originalOwner: transfer.fromOwner || a.originalOwner,
          transferStatus: "Dalam Proses BPN / Notaris"
        };
      } else if (
        transfer.status === "Pengukuran & Pengecekan" ||
        transfer.status === "Verifikasi Dokumen"
      ) {
        return {
          ...a,
          originalOwner: transfer.fromOwner || a.originalOwner,
          transferStatus: "Verifikasi Dokumen & Pengukuran"
        };
      } else if (transfer.status === "Tertunda") {
        return {
          ...a,
          originalOwner: transfer.fromOwner || a.originalOwner,
          transferStatus: "Belum Balik Nama (a.n. Pemilik Lama/Pewakif)"
        };
      }
      return a;
    });
  };

  // CRUD for Asset Transfers (Balik Nama)
  const handleAddTransfer = (newTransfer: Omit<AssetTransferRecord, "id">) => {
    let item: AssetTransferRecord = {
      ...newTransfer,
      id: `trf-${Date.now()}`
    };
    
    if (item.status === "Selesai / Terbit Sertifikat" && item.toOwner) {
      item.assetName = formatAssetNameWithNewOwner(item.assetName, item.toOwner);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {
        // ignore confetti errors
      }
    }

    updateDataWithAudit(
      (prev) => {
        const nextTransfers = [item, ...(prev.assetTransfers || [])];
        const nextAssets = syncAssetWithTransfer(prev.assets, item);
        return {
          ...prev,
          assetTransfers: nextTransfers,
          assets: nextAssets
        };
      },
      {
        action: "CREATE",
        entityType: "Aset",
        details: `Pengajuan balik nama aset: ${item.assetName}`
      }
    );
    if (item.status === "Selesai / Terbit Sertifikat") {
      showToast(
        `Balik nama selesai! Nama sertifikat pada database buku induk aset otomatis diperbarui & disinkronkan otomatis.`
      );
    } else {
      showToast(`Pengajuan balik nama "${item.assetName}" berhasil dicatat & disinkronkan otomatis.`);
    }
    upsertItemToSheets("assetTransfers", item).catch((err) => console.warn("Sheets transfer upsert:", err));
  };

  const handleUpdateTransfer = (updatedTransfer: AssetTransferRecord) => {
    let finalTransfer = { ...updatedTransfer };
    if (finalTransfer.status === "Selesai / Terbit Sertifikat" && finalTransfer.toOwner) {
      finalTransfer.assetName = formatAssetNameWithNewOwner(finalTransfer.assetName, finalTransfer.toOwner);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        // ignore confetti errors
      }
    }

    updateDataWithAudit(
      (prev) => {
        const nextTransfers = (prev.assetTransfers || []).map((t) =>
          t.id === finalTransfer.id ? finalTransfer : t
        );
        const nextAssets = syncAssetWithTransfer(prev.assets, finalTransfer);
        return {
          ...prev,
          assetTransfers: nextTransfers,
          assets: nextAssets
        };
      },
      {
        action: "UPDATE",
        entityType: "Aset",
        details: `Update progres balik nama: ${finalTransfer.assetName} (${finalTransfer.status})`
      }
    );
    if (finalTransfer.status === "Selesai / Terbit Sertifikat") {
      showToast(
        `Balik nama selesai! Nama sertifikat pada database buku induk aset otomatis diperbarui & disinkronkan otomatis.`
      );
    } else {
      showToast(`Progres balik nama "${finalTransfer.assetName}" diperbarui & disinkronkan otomatis.`);
    }
    upsertItemToSheets("assetTransfers", finalTransfer).catch((err) => console.warn("Sheets transfer update:", err));
  };

  const handleDeleteTransfer = (id: string) => {
    const target = (data.assetTransfers || []).find((t) => t.id === id);
    updateDataWithAudit(
      (prev) => {
        const remainingTransfers = (prev.assetTransfers || []).filter((t) => t.id !== id);
        
        // Synchronize asset transferStatus:
        // When this transfer record is deleted, check if the associated asset has other transfers.
        // If not, revert the asset's transferStatus to "Belum Balik Nama (a.n. Pemilik Lama/Pewakif)".
        const updatedAssets = prev.assets.map((asset) => {
          if (!target || !matchAssetWithTransfer(asset, target)) {
            return asset;
          }

          // Check if there are other remaining transfers for this asset
          const otherTransfer = remainingTransfers.find((t) => matchAssetWithTransfer(asset, t));
          if (otherTransfer) {
            const synced = syncAssetWithTransfer([asset], otherTransfer);
            return synced[0] || asset;
          }

          // No remaining transfer: revert to Belum Balik Nama
          const wasYayasan = asset.registeredOwner && asset.registeredOwner.toUpperCase().includes("YAYASAN");
          const restoredOwner = asset.originalOwner || (wasYayasan ? (target.fromOwner || "Pewakif / Pemilik Lama") : asset.registeredOwner);
          
          return {
            ...asset,
            transferStatus: "Belum Balik Nama (a.n. Pemilik Lama/Pewakif)" as AssetTransferStatus,
            registeredOwner: target.status === "Selesai / Terbit Sertifikat" ? restoredOwner : asset.registeredOwner
          };
        });

        return {
          ...prev,
          assetTransfers: remainingTransfers,
          assets: updatedAssets
        };
      },
      {
        action: "DELETE",
        entityType: "Aset",
        details: `Menghapus catatan balik nama: ${target?.assetName || id}`
      }
    );
    showToast("Catatan pengajuan balik nama berhasil dihapus & disinkronkan otomatis.");
    deleteItemFromSheets("assetTransfers", id).catch((err) => console.warn("Sheets transfer delete:", err));
  };

  // CRUD for Borrowed Docs (Pinjam Berkas)
  const handleAddBorrow = (newBorrow: Omit<AssetBorrowRecord, "id">) => {
    const item: AssetBorrowRecord = {
      ...newBorrow,
      id: `bor-${Date.now()}`
    };
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        borrowedDocs: [item, ...(prev.borrowedDocs || [])]
      }),
      {
        action: "CREATE",
        entityType: "Aset",
        details: `Pencatatan pinjam berkas fisik: ${item.docTitle} oleh ${item.borrowerName}`
      }
    );
    showToast(`Peminjaman berkas "${item.docTitle}" berhasil dicatat & disinkronkan otomatis.`);
    upsertItemToSheets("borrowedDocs", item).catch((err) => console.warn("Sheets borrow upsert:", err));
  };

  const handleUpdateBorrow = (updatedBorrow: AssetBorrowRecord) => {
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        borrowedDocs: (prev.borrowedDocs || []).map((b) => (b.id === updatedBorrow.id ? updatedBorrow : b))
      }),
      {
        action: "UPDATE",
        entityType: "Aset",
        details: `Update status pinjam berkas: ${updatedBorrow.docTitle} (${updatedBorrow.status})`
      }
    );
    showToast(`Status berkas "${updatedBorrow.docTitle}" diperbarui & disinkronkan otomatis.`);
    upsertItemToSheets("borrowedDocs", updatedBorrow).catch((err) => console.warn("Sheets borrow update:", err));
  };

  const handleDeleteBorrow = (id: string) => {
    const target = (data.borrowedDocs || []).find((b) => b.id === id);
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        borrowedDocs: (prev.borrowedDocs || []).filter((b) => b.id !== id)
      }),
      {
        action: "DELETE",
        entityType: "Aset",
        details: `Menghapus catatan sirkulasi berkas: ${target?.docTitle || id}`
      }
    );
    showToast("Catatan peminjaman berkas berhasil dihapus & disinkronkan otomatis.");
    deleteItemFromSheets("borrowedDocs", id).catch((err) => console.warn("Sheets borrow delete:", err));
  };

  // CRUD for Employees
  const handleAddEmployee = (newEmp: Omit<EmployeeItem, "id">) => {
    const item: EmployeeItem = {
      ...newEmp,
      id: `emp-${Date.now()}`
    };
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        employees: [item, ...prev.employees]
      }),
      {
        action: "CREATE",
        entityType: "Pegawai",
        details: `Menambahkan data pegawai: ${item.name} (${item.nip})`
      }
    );
    showToast(`Pegawai "${item.name}" berhasil ditambahkan & disinkronkan otomatis.`);
    upsertItemToSheets("employees", item).catch((err) => console.warn("Sheets employee upsert:", err));
  };

  const handleUpdateEmployee = (updatedEmp: EmployeeItem) => {
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        employees: prev.employees.map((e) => (e.id === updatedEmp.id ? updatedEmp : e))
      }),
      {
        action: "UPDATE",
        entityType: "Pegawai",
        details: `Memperbarui data pegawai: ${updatedEmp.name} (${updatedEmp.nip})`
      }
    );
    showToast(`Data pegawai "${updatedEmp.name}" diperbarui & disinkronkan otomatis.`);
    upsertItemToSheets("employees", updatedEmp).catch((err) => console.warn("Sheets employee update:", err));
  };

  const handleDeleteEmployee = (id: string) => {
    const target = data.employees.find((e) => e.id === id);
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        employees: prev.employees.filter((e) => e.id !== id)
      }),
      {
        action: "DELETE",
        entityType: "Pegawai",
        details: `Menghapus data pegawai: ${target?.name || id}`
      }
    );
    showToast("Data pegawai berhasil dihapus & disinkronkan otomatis.");
    deleteItemFromSheets("employees", id).catch((err) => console.warn("Sheets employee delete:", err));
  };

  // CRUD for Students
  const handleAddStudent = (newStd: Omit<StudentItem, "id">) => {
    const item: StudentItem = {
      ...newStd,
      id: `std-${Date.now()}`
    };
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        students: [item, ...prev.students]
      }),
      {
        action: "CREATE",
        entityType: "Peserta Didik",
        details: `Mendaftarkan peserta didik baru: ${item.name} (${item.educationLevel})`
      }
    );
    showToast(`Peserta didik "${item.name}" berhasil didaftarkan & disinkronkan otomatis.`);
    upsertItemToSheets("students", item).catch((err) => console.warn("Sheets student upsert:", err));
  };

  const handleUpdateStudent = (updatedStd: StudentItem) => {
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        students: prev.students.map((s) => (s.id === updatedStd.id ? updatedStd : s))
      }),
      {
        action: "UPDATE",
        entityType: "Peserta Didik",
        details: `Memperbarui data siswa: ${updatedStd.name} (${updatedStd.nisn})`
      }
    );
    showToast(`Data siswa "${updatedStd.name}" diperbarui & disinkronkan otomatis.`);
    upsertItemToSheets("students", updatedStd).catch((err) => console.warn("Sheets student update:", err));
  };

  const handleBatchPromoteStudents = (promotedStudents: StudentItem[], summary: string) => {
    const updatedMap = new Map(promotedStudents.map((s) => [s.id, s]));
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        students: prev.students.map((s) => updatedMap.get(s.id) || s)
      }),
      {
        action: "UPDATE",
        entityType: "Peserta Didik",
        details: `Kenaikan Kelas Siswa: ${summary}`
      }
    );
    showToast(`${summary} (Disinkronkan otomatis)`);
  };

  const handleDeleteStudent = (id: string) => {
    const target = data.students.find((s) => s.id === id);
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        students: prev.students.filter((s) => s.id !== id)
      }),
      {
        action: "DELETE",
        entityType: "Peserta Didik",
        details: `Menghapus data siswa: ${target?.name || id}`
      }
    );
    showToast("Data peserta didik berhasil dihapus & disinkronkan otomatis.");
    deleteItemFromSheets("students", id).catch((err) => console.warn("Sheets student delete:", err));
  };

  // CRUD for Alumni
  const handleAddAlumni = (newAlumni: Omit<StudentItem, "id">) => {
    const item: StudentItem = {
      ...newAlumni,
      id: `alm-${Date.now()}`,
      status: "Lulus"
    };
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        students: [item, ...prev.students]
      }),
      {
        action: "CREATE",
        entityType: "Peserta Didik",
        details: `Menambahkan data alumni baru: ${item.name} (${item.educationLevel})`
      }
    );
    showToast(`Data alumni "${item.name}" berhasil dicatat & disinkronkan otomatis.`);
    upsertItemToSheets("students", item).catch((err) => console.warn("Sheets alumni upsert:", err));
  };

  const handleUpdateAlumni = (updatedAlumni: StudentItem) => {
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        students: prev.students.map((s) => (s.id === updatedAlumni.id ? updatedAlumni : s))
      }),
      {
        action: "UPDATE",
        entityType: "Peserta Didik",
        details: `Memperbarui data alumni: ${updatedAlumni.name} (${updatedAlumni.educationLevel})`
      }
    );
    showToast(`Data alumni "${updatedAlumni.name}" diperbarui & disinkronkan otomatis.`);
    upsertItemToSheets("students", updatedAlumni).catch((err) => console.warn("Sheets alumni update:", err));
  };

  const handleDeleteAlumni = (id: string) => {
    const target = data.students.find((s) => s.id === id);
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        students: prev.students.filter((s) => s.id !== id)
      }),
      {
        action: "DELETE",
        entityType: "Peserta Didik",
        details: `Menghapus data alumni: ${target?.name || id}`
      }
    );
    showToast("Data alumni berhasil dihapus & disinkronkan otomatis.");
    deleteItemFromSheets("students", id).catch((err) => console.warn("Sheets alumni delete:", err));
  };

  const handleReactivateAlumni = (id: string, targetClass: string) => {
    const target = data.students.find((s) => s.id === id);
    if (!target) return;
    const nowStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    const noteAppend = `[${nowStr}: Diaktifkan kembali dari status Alumni ke kelas ${targetClass}]`;
    const updatedStudent: StudentItem = {
      ...target,
      status: "Aktif",
      classGrade: targetClass,
      notes: [target.notes, noteAppend].filter(Boolean).join(" | ")
    };
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        students: prev.students.map((s) => (s.id === id ? updatedStudent : s))
      }),
      {
        action: "UPDATE",
        entityType: "Peserta Didik",
        details: `Mengaktifkan kembali alumni ${target.name} ke status Aktif (${targetClass})`
      }
    );
    showToast(`Alumni "${target.name}" berhasil diaktifkan kembali ke ${targetClass} & disinkronkan otomatis.`);
    upsertItemToSheets("students", updatedStudent).catch((err) => console.warn("Sheets student reactivate:", err));
  };

  // Admin Report Update


  // --- Handlers for Meetings ---
  const handleAddMeeting = (newMeeting: Omit<MeetingRecord, "id">) => {
    if (authRole === "visitor") return;
    const meeting: MeetingRecord = {
      ...newMeeting,
      id: "mtg-" + Date.now().toString() + Math.random().toString(36).substr(2, 5)
    };
    
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        meetings: [meeting, ...(prev.meetings || [])]
      }),
      {
        action: "CREATE",
        entityType: "Sistem",
        details: `Menambahkan data musyawarah/rapat: ${meeting.title}`
      }
    );
    showToast(`Data musyawarah "${meeting.title}" berhasil ditambahkan & disinkronkan otomatis.`);
    upsertItemToSheets("meetings", meeting).catch((err) => console.warn("Sheets meeting upsert:", err));
  };

  const handleUpdateMeeting = (updatedMeeting: MeetingRecord) => {
    if (authRole === "visitor") return;
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        meetings: (prev.meetings || []).map(m => m.id === updatedMeeting.id ? updatedMeeting : m)
      }),
      {
        action: "UPDATE",
        entityType: "Sistem",
        details: `Mengubah data musyawarah/rapat: ${updatedMeeting.title}`
      }
    );
    showToast(`Data musyawarah "${updatedMeeting.title}" diperbarui & disinkronkan otomatis.`);
    upsertItemToSheets("meetings", updatedMeeting).catch((err) => console.warn("Sheets meeting update:", err));
  };

  const handleDeleteMeeting = (id: string) => {
    if (authRole === "visitor") return;
    const toDelete = (data.meetings || []).find(m => m.id === id);
    if (!toDelete) return;
    
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        meetings: (prev.meetings || []).filter(m => m.id !== id)
      }),
      {
        action: "DELETE",
        entityType: "Sistem",
        details: `Menghapus data musyawarah/rapat: ${toDelete.title}`
      }
    );
    showToast("Data musyawarah berhasil dihapus & disinkronkan otomatis.");
    deleteItemFromSheets("meetings", id).catch((err) => console.warn("Sheets meeting delete:", err));
  };

  // --- Handlers for Donations ---
  const handleAddDonation = (newDonation: Omit<DonationRecord, "id">) => {
    if (authRole === "visitor") return;
    const donation: DonationRecord = {
      ...newDonation,
      id: "don-" + Date.now().toString() + Math.random().toString(36).substr(2, 5)
    };
    
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        donations: [...(prev.donations || []), donation]
      }),
      {
        action: "CREATE",
        entityType: "Sistem",
        details: `Menambahkan data donasi dari ${donation.donatorName}`
      }
    );
    showToast(`Donasi dari ${donation.donatorName} berhasil ditambahkan & disinkronkan otomatis.`);
    upsertItemToSheets("donations", donation).catch((err) => console.warn("Sheets donation upsert:", err));
  };

  const handleUpdateDonation = (updatedDonation: DonationRecord) => {
    if (authRole === "visitor") return;
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        donations: (prev.donations || []).map(d => d.id === updatedDonation.id ? updatedDonation : d)
      }),
      {
        action: "UPDATE",
        entityType: "Sistem",
        details: `Mengubah data donasi dari ${updatedDonation.donatorName}`
      }
    );
    showToast(`Data donasi dari "${updatedDonation.donatorName}" diperbarui & disinkronkan otomatis.`);
    upsertItemToSheets("donations", updatedDonation).catch((err) => console.warn("Sheets donation update:", err));
  };

  const handleDeleteDonation = (id: string) => {
    if (authRole === "visitor") return;
    const toDelete = (data.donations || []).find(d => d.id === id);
    if (!toDelete) return;
    
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        donations: (prev.donations || []).filter(d => d.id !== id)
      }),
      {
        action: "DELETE",
        entityType: "Sistem",
        details: `Menghapus data donasi dari ${toDelete.donatorName}`
      }
    );
    showToast("Data donasi berhasil dihapus & disinkronkan otomatis.");
    deleteItemFromSheets("donations", id).catch((err) => console.warn("Sheets donation delete:", err));
  };

  const handleUpdateAdminReport = (updatedReport: AdminPerformanceReport) => {
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        adminReport: updatedReport
      }),
      {
        action: "UPDATE",
        entityType: "Kinerja Admin",
        details: `Pembaruan log kinerja admin yayasan (Skor ${updatedReport.overallRating}%)`
      }
    );
    showToast("Laporan kinerja administrator berhasil diperbarui & disinkronkan otomatis.");
  };

  // Profile Update
  const handleUpdateProfile = (updatedProfile: FoundationProfile) => {
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        profile: updatedProfile
      }),
      {
        action: "UPDATE",
        entityType: "Sistem",
        details: `Memperbarui profil dan legalitas yayasan: ${updatedProfile.name}`
      }
    );
    showToast("Profil yayasan berhasil diperbarui & disinkronkan otomatis.");
    upsertItemToSheets("profile", updatedProfile).catch((err) => console.warn("Sheets profile upsert:", err));
  };

  // Restore whole database
  const handleRestoreData = (restored: DatabaseStore) => {
    setData(restored);
    saveLocalDatabase(restored);
    performSync(restored);
    showToast("Database berhasil dipulihkan & disinkronkan otomatis.");
  };

  // Quick Add from Dashboard
  const handleQuickAdd = (type: "asset" | "employee" | "student" | "log") => {
    if (type === "asset") setActiveTab("assets");
    else if (type === "employee") setActiveTab("employees");
    else if (type === "student") setActiveTab("students");
    else if (type === "log") setActiveTab("admin-performance");
  };

  const triggerForceSync = () => {
    performSync();
    showToast("Sinkronisasi manual ke database server berhasil.");
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.85 }
      });
    } catch {}
  };

  // If session is locked
  if (isSessionLocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-2xl text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-start justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Sesi Terkunci
            </h2>
            <p className="text-xs text-slate-400">
              Sistem Basis Data Terpadu {data.profile.name}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-left flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-start justify-center font-bold text-sm shrink-0">
              {data.profile.adminName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-100 truncate">{data.profile.adminName}</p>
              <p className="text-[11px] text-emerald-400 font-medium">Administrator Database Yayasan</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setIsSessionLocked(false);
                showToast("Selamat datang kembali! Sesi admin aktif.");
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-start justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Unlock className="w-4 h-4" />
              <span>Masuk Kembali ke Sistem</span>
            </button>
            <p className="text-[11px] text-slate-500">
              Semua data dan perubahan tersimpan secara aman di database.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans ${authRole === "visitor" ? "role-visitor" : "role-admin"}  selection:bg-emerald-500 selection:text-white ${isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-100/70 dark:bg-[#121417] text-slate-900"}`}>
      {/* Top Navigation Bar - Fixed Header */}
      <Navbar
        profile={data.profile}
        authUsername={authUsername}
        isSyncing={isSyncing}
        isSheetsSyncing={isSheetsSyncing}
        lastSheetsSyncTime={lastSheetsSyncTime}
        isOnline={isOnline}
        lastSyncTime={lastSyncTime}
        pendingCount={pendingCount}
        onForceSync={triggerForceSync}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAiAssistant={() => setActiveTab("ai-assistant")}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLogout={() => setIsLogoutModalOpen(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        data={data}
        onNavigateTab={setActiveTab}
      />

      {/* Main Body: Independent Scrolling for Sidebar (Pilihan Menu) and Content (Tampilan Menu) */}
      <div className="flex-1 flex overflow-hidden min-h-0 w-full relative">
        {/* Navigation Sidebar (Pilihan Menu - Independent Scroll & Collapsible) */}
        {/* Mobile backdrop when open on small screens */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div className={`fixed md:static inset-y-0 left-0 z-40 md:z-auto h-full shadow-2xl md:shadow-none transition-all duration-200 shrink-0 ${!isSidebarOpen ? "max-md:-translate-x-full" : ""}`}>
          <Sidebar 
            activeTab={activeTab} 
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }} 
            activeAssetSubMenu={activeAssetSubMenu}
            onSelectAssetSubMenu={(sub) => {
              setActiveAssetSubMenu(sub);
              setActiveTab("assets");
              if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }}
            activeStudentSubMenu={activeStudentSubMenu}
            onSelectStudentSubMenu={(sub) => {
              setActiveStudentSubMenu(sub);
              setActiveTab("students");
              if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }}
            activeEmployeeSubMenu={activeEmployeeSubMenu}
            onSelectEmployeeSubMenu={(sub) => {
              setActiveEmployeeSubMenu(sub);
              setActiveTab("employees");
              if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }}
            data={data} 
            onLogout={() => setIsLogoutModalOpen(true)}
            onToggleSidebar={toggleSidebar}
            isOpen={isSidebarOpen}
          />
        </div>

        {/* View Area (Tampilan Menu - Independent Scroll Container) */}
        <main className="flex-1 h-full overflow-y-auto min-h-0 p-3 sm:p-4 md:p-6 lg:p-8 pb-20 md:pb-8 relative bg-slate-100/70 dark:bg-[#121417] focus:outline-none">
          {activeTab === "dashboard" && (
            <DashboardView
              data={data}
              authUsername={authUsername}
              onNavigateTab={setActiveTab}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onOpenAiAssistant={() => setActiveTab("ai-assistant")}
              onQuickAdd={handleQuickAdd}
              onForceSync={triggerForceSync}
              isSyncing={isSyncing}
              readOnly={authRole === "visitor"}
              onLogout={() => setIsLogoutModalOpen(true)}
            />
          )}

          {activeTab === "assets" && (
            <AssetsView
              assets={data.assets}
              transfers={data.assetTransfers || []}
              borrowRecords={data.borrowedDocs || []}
              activeSubMenu={activeAssetSubMenu}
              onSelectSubMenu={setActiveAssetSubMenu}
              onAddAsset={handleAddAsset}
              onUpdateAsset={handleUpdateAsset}
              onDeleteAsset={handleDeleteAsset}
              onAddTransfer={handleAddTransfer}
              onUpdateTransfer={handleUpdateTransfer}
              onDeleteTransfer={handleDeleteTransfer}
              onAddBorrow={handleAddBorrow}
              onUpdateBorrow={handleUpdateBorrow}
              onDeleteBorrow={handleDeleteBorrow}
              searchTerm={searchTerm}
              readOnly={authRole === "visitor"}
            />
          )}

          {activeTab === "employees" && (
            <EmployeesView
              employees={data.employees}
              activeSubMenu={activeEmployeeSubMenu}
              onSelectSubMenu={setActiveEmployeeSubMenu}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              searchTerm={searchTerm}
              readOnly={authRole === "visitor"}
            />
          )}

          {activeTab === "students" && (
            <StudentsView
              students={data.students}
              activeSubMenu={activeStudentSubMenu}
              onSelectSubMenu={setActiveStudentSubMenu}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onBatchPromoteStudents={handleBatchPromoteStudents}
              onDeleteStudent={handleDeleteStudent}
              onNavigateToAlumni={() => setActiveTab("alumni")}
              searchTerm={searchTerm}
              readOnly={authRole === "visitor"}
            />
          )}

          {activeTab === "alumni" && (
            <AlumniView
              students={data.students}
              onAddAlumni={handleAddAlumni}
              onUpdateAlumni={handleUpdateAlumni}
              onDeleteAlumni={handleDeleteAlumni}
              onReactivateAlumni={handleReactivateAlumni}
              onNavigateToStudents={() => setActiveTab("students")}
              searchTerm={searchTerm}
              readOnly={authRole === "visitor"}
            />
          )}

          
          {activeTab === "donations" && (
            <DonationsView
              donations={data.donations || []}
              onAddDonation={handleAddDonation}
              onUpdateDonation={handleUpdateDonation}
              onDeleteDonation={handleDeleteDonation}
              searchTerm={searchTerm}
              readOnly={authRole === "visitor"}
            />
          )}
          
          {activeTab === "meetings" && (
            <MeetingsView
              meetings={data.meetings || []}
              onAddMeeting={handleAddMeeting}
              onUpdateMeeting={handleUpdateMeeting}
              onDeleteMeeting={handleDeleteMeeting}
              searchTerm={searchTerm}
              readOnly={authRole === "visitor"}
            />
          )}

          {activeTab === "admin-performance" && (
            <AdminPerformanceView
              report={data.adminReport}
              onUpdateReport={handleUpdateAdminReport}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onOpenAiAssistant={() => setActiveTab("ai-assistant")}
              readOnly={authRole === "visitor"}
            />
          )}

          {activeTab === "ai-assistant" && (
            <AiAssistantView
              data={data}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              profile={data.profile}
              onUpdateProfile={handleUpdateProfile}
              fullData={data}
              onRestoreData={handleRestoreData}
              onForceSync={triggerForceSync}
              isSyncing={isSyncing}
              readOnly={authRole === "visitor"}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (Khusus Layar HP / Smartphone) */}
        <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 md:hidden px-2 py-1 shadow-lg flex items-center justify-around safe-area-bottom">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Dasbor</span>
          </button>

          <button
            onClick={() => setActiveTab("assets")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "assets"
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Landmark className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Aset</span>
          </button>

          <button
            onClick={() => setActiveTab("students")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "students"
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <GraduationCap className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Siswa</span>
          </button>

          <button
            onClick={() => setActiveTab("employees")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "employees"
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Pegawai</span>
          </button>

          <button
            onClick={toggleSidebar}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              isSidebarOpen
                ? "text-blue-600 font-bold bg-blue-50/80"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Menu</span>
          </button>
        </nav>
      </div>

      {/* Official Printable Report Modal */}
      {isReportModalOpen && (
        <OfficialReportModal
          data={data}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Confirmation Modal for Exit / Logout */}
      {isLogoutModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center p-4 py-10 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLogoutModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-start justify-center mx-auto border border-rose-100">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Keluar dari Aplikasi?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sesi Anda akan diakhiri dan Anda akan diarahkan kembali ke halaman login.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-start justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ganti Akun / Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login & Role Switcher Modal (Non-blocking dialog) */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={(val) => {
            if (typeof val === "boolean") {
              setIsDarkMode(val);
              try {
                localStorage.setItem("portal_terpadu_dark_mode", String(val));
              } catch {}
            } else {
              toggleDarkMode();
            }
          }}
          onLoginSuccess={(role, username) => {
            setAuthRole(role);
            setAuthUsername(username);
            setIsLoginModalOpen(false);
            showToast(`Berhasil masuk sebagai ${role === "admin" ? "Administrator" : `Pengunjung (${username})`}`);
          }}
        />
      )}

      {/* Real-time Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-medium flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
