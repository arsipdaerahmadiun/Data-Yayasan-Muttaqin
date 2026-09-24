import { DatabaseStore, AssetItem, EmployeeItem, StudentItem, DonationRecord, FoundationProfile, AssetTransferRecord } from "../types";
import { sanitizeTransfers, sanitizeBorrowedDocs } from "../services/api";

// Default local storage keys for Google Sheets
export const SHEETS_URL_KEY = "google_sheets_webapp_url";
export const SHEETS_DOC_URL_KEY = "google_sheets_doc_url";
export const SHEETS_AUTO_SYNC_KEY = "google_sheets_auto_sync";

// In-memory cache for fast access across devices
let inMemoryConfig: { webAppUrl: string; sheetDocUrl: string; autoSync: boolean } | null = null;

export function getStoredSheetsConfig() {
  if (inMemoryConfig && inMemoryConfig.webAppUrl) {
    return {
      webAppUrl: inMemoryConfig.webAppUrl.trim(),
      sheetDocUrl: (inMemoryConfig.sheetDocUrl || "").trim()
    };
  }

  const metaEnv = (import.meta as any).env || {};
  const envUrl = (metaEnv.VITE_GOOGLE_SHEETS_URL as string) || "";
  const envDocUrl = (metaEnv.VITE_GOOGLE_SHEETS_DOC_URL as string) || "";

  const savedUrl = localStorage.getItem(SHEETS_URL_KEY) || envUrl || "";
  const savedDocUrl = localStorage.getItem(SHEETS_DOC_URL_KEY) || envDocUrl || "";

  return {
    webAppUrl: savedUrl.trim(),
    sheetDocUrl: savedDocUrl.trim()
  };
}

export function isSheetsConfigured(): boolean {
  const { webAppUrl } = getStoredSheetsConfig();
  return Boolean(webAppUrl && webAppUrl.startsWith("http"));
}

export function isSheetsAutoSyncEnabled(): boolean {
  if (inMemoryConfig && inMemoryConfig.autoSync !== undefined) {
    return inMemoryConfig.autoSync;
  }
  try {
    const saved = localStorage.getItem(SHEETS_AUTO_SYNC_KEY);
    if (saved === null) return true; // Default is true (automatic sync)
    return saved !== "false";
  } catch {
    return true;
  }
}

export function setSheetsAutoSyncEnabled(enabled: boolean): void {
  if (!inMemoryConfig) {
    inMemoryConfig = { ...getStoredSheetsConfig(), autoSync: enabled };
  } else {
    inMemoryConfig.autoSync = enabled;
  }

  try {
    localStorage.setItem(SHEETS_AUTO_SYNC_KEY, String(enabled));
  } catch (err) {
    console.warn("Failed to set google_sheets_auto_sync in localStorage:", err);
  }

  // Persist to server so other devices get this setting
  try {
    fetch("/api/sheets/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoSync: enabled })
    }).catch(() => {});
  } catch {}
}

export function saveSheetsConfig(webAppUrl: string, sheetDocUrl?: string, autoSync?: boolean): void {
  const cleanUrl = (webAppUrl || "").trim();
  const cleanDocUrl = (sheetDocUrl !== undefined ? sheetDocUrl : (getStoredSheetsConfig().sheetDocUrl || "")).trim();
  const cleanAutoSync = autoSync !== undefined ? autoSync : isSheetsAutoSyncEnabled();

  inMemoryConfig = {
    webAppUrl: cleanUrl,
    sheetDocUrl: cleanDocUrl,
    autoSync: cleanAutoSync
  };

  try {
    localStorage.setItem(SHEETS_URL_KEY, cleanUrl);
    localStorage.setItem(SHEETS_DOC_URL_KEY, cleanDocUrl);
    localStorage.setItem(SHEETS_AUTO_SYNC_KEY, String(cleanAutoSync));
  } catch (e) {
    console.warn("Failed to save sheets config to localStorage:", e);
  }

  // Sync to server so any other device gets this spreadsheet automatically!
  try {
    fetch("/api/sheets/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        webAppUrl: cleanUrl,
        sheetDocUrl: cleanDocUrl,
        autoSync: cleanAutoSync
      })
    }).catch((err) => {
      console.warn("Could not save sheets config to server:", err);
    });
  } catch {}
}

/**
 * Fetches the central 1-Spreadsheet configuration from server.
 * This guarantees any device opening the app automatically uses the same spreadsheet without manual input.
 */
export async function fetchRemoteSheetsConfig(): Promise<{ webAppUrl: string; sheetDocUrl: string; autoSync: boolean } | null> {
  try {
    const res = await fetch("/api/sheets/config");
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.config) {
      const { webAppUrl, sheetDocUrl, autoSync } = json.config;
      if (webAppUrl && typeof webAppUrl === "string" && webAppUrl.startsWith("http")) {
        inMemoryConfig = {
          webAppUrl: webAppUrl.trim(),
          sheetDocUrl: (sheetDocUrl || "").trim(),
          autoSync: autoSync !== undefined ? autoSync : true
        };
        try {
          localStorage.setItem(SHEETS_URL_KEY, inMemoryConfig.webAppUrl);
          localStorage.setItem(SHEETS_DOC_URL_KEY, inMemoryConfig.sheetDocUrl);
          localStorage.setItem(SHEETS_AUTO_SYNC_KEY, String(inMemoryConfig.autoSync));
        } catch {}
        return inMemoryConfig;
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote sheets config:", err);
  }
  return null;
}

export function validateSheetsUrl(url: string): { valid: boolean; warning?: string; error?: string } {
  const trimmed = (url || "").trim();
  if (!trimmed) {
    return { valid: false, error: "URL belum diisi." };
  }

  if (trimmed.includes("docs.google.com/spreadsheets")) {
    return {
      valid: false,
      error: "⚠️ URL yang Anda masukkan adalah tautan file Spreadsheet (docs.google.com), BUKAN Web App URL. Web App URL harus berasal dari menu Extensions > Apps Script > Deploy > Web App dan berakhiran /exec."
    };
  }

  if (trimmed.includes("script.google.com/home/projects")) {
    return {
      valid: false,
      error: "⚠️ URL ini adalah halaman Editor Apps Script. Anda perlu menekan tombol biru 'Deploy' di kanan atas > 'New deployment' > pilih Web App untuk mendapatkan Web App URL."
    };
  }

  if (trimmed.endsWith("/dev")) {
    return {
      valid: false,
      warning: "⚠️ URL ini berakhiran /dev (Test Deployment). Google mewajibkan login untuk URL /dev. Harap buat New Deployment di Apps Script agar mendapatkan URL Production yang berakhiran /exec."
    };
  }

  if (!trimmed.startsWith("https://script.google.com/macros/s/")) {
    return {
      valid: false,
      warning: "⚠️ Format URL tidak biasa. Web App URL resmi Google Apps Script umumnya diawali: https://script.google.com/macros/s/... dan diakhiri /exec"
    };
  }

  if (!trimmed.endsWith("/exec")) {
    return {
      valid: true,
      warning: "💡 Catatan: Pastikan URL berakhiran '/exec' agar dapat menerima akses eksternal tanpa autentikasi browser."
    };
  }

  return { valid: true };
}

/**
 * Universal Post Requester (Uses server proxy if direct fetch encounters CORS/Network issues)
 */
async function sendSheetsRequest(payload: any, customUrl?: string): Promise<any> {
  const { webAppUrl, sheetDocUrl } = getStoredSheetsConfig();
  const targetUrl = (customUrl || webAppUrl).trim();

  if (!targetUrl) {
    throw new Error("URL Google Apps Script Web App belum diisi.");
  }

  const enrichedPayload = {
    ...payload,
    sheetUrl: payload.sheetUrl || (sheetDocUrl && sheetDocUrl.trim()) || undefined
  };

  // 1. Try sending directly first with text/plain to prevent CORS preflight OPTIONS request
  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(enrichedPayload)
    });

    if (response.ok) {
      const text = await response.text();
      try {
        const parsed = JSON.parse(text);
        if (parsed) return parsed;
      } catch {
        // If it's HTML, direct fetch received Google Login or error page
        if (text.includes("<!DOCTYPE") || text.includes("<html") || text.includes("accounts.google.com")) {
          throw new Error("Google meminta login. Opsi 'Who has access' saat Deploy di Apps Script harus disetel ke 'Anyone'.");
        }
      }
    }
  } catch (directErr) {
    console.warn("Direct fetch to Google Apps Script failed, trying server proxy fallback:", directErr);
  }

  // 2. Server Proxy Fallback (/api/sheets/proxy)
  try {
    const proxyRes = await fetch("/api/sheets/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: targetUrl,
        payload: enrichedPayload
      })
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      return data;
    }
  } catch (proxyErr) {
    console.warn("Proxy fetch failed:", proxyErr);
  }

  throw new Error("Gagal terhubung ke Google Apps Script. Pastikan URL Web App benar dan di-deploy dengan opsi 'Anyone'.");
}

/**
 * Universal Get Requester for pulling data
 */
async function pullSheetsRequest(customUrl?: string): Promise<any> {
  const { webAppUrl } = getStoredSheetsConfig();
  const targetUrl = (customUrl || webAppUrl).trim();

  if (!targetUrl) {
    throw new Error("URL Google Apps Script Web App belum diisi.");
  }

  // 1. Direct GET fetch
  try {
    const fetchUrl = targetUrl + (targetUrl.includes("?") ? "&" : "?") + "action=pull&t=" + Date.now();
    const response = await fetch(fetchUrl);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (directErr) {
    console.warn("Direct GET from Google Apps Script failed, trying server proxy fallback:", directErr);
  }

  // 2. Proxy fallback
  try {
    const proxyRes = await fetch("/api/sheets/pull", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: targetUrl })
    });
    if (proxyRes.ok) {
      return await proxyRes.json();
    }
  } catch (proxyErr) {
    console.warn("Proxy pull failed:", proxyErr);
  }

  throw new Error("Gagal mengambil data dari Google Spreadsheet.");
}

/**
 * Diagnosa mendalam koneksi Google Spreadsheet
 */
export async function diagnoseSheetsConnection(customUrl?: string): Promise<{
  success: boolean;
  step?: string;
  reason?: string;
  solution?: string;
  message?: string;
  sheetTitle?: string;
  sheetDocUrl?: string;
}> {
  const { webAppUrl } = getStoredSheetsConfig();
  const targetUrl = (customUrl || webAppUrl).trim();

  if (!targetUrl) {
    return {
      success: false,
      step: "empty_url",
      reason: "URL Web App belum diisi.",
      solution: "Silakan salin Web App URL dari menu Deploy Google Apps Script dan tempelkan pada kolom URL."
    };
  }

  // Client validation
  const validation = validateSheetsUrl(targetUrl);
  if (!validation.valid && validation.error) {
    return {
      success: false,
      step: "url_format",
      reason: "Format URL Salah",
      solution: validation.error
    };
  }

  try {
    const res = await fetch("/api/sheets/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: targetUrl })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err: any) {
    console.warn("Diagnosis endpoint error:", err);
  }

  // Fallback to testSheetsConnection
  const testRes = await testSheetsConnection(targetUrl);
  return {
    success: testRes.success,
    reason: testRes.message,
    solution: testRes.success ? undefined : "Pastikan setelan 'Who has access' diatur ke 'Anyone' dan URL berakhiran /exec.",
    sheetTitle: testRes.sheetTitle,
    sheetDocUrl: testRes.sheetDocUrl
  };
}

/**
 * Uji koneksi ke Google Spreadsheet Web App
 */
export async function testSheetsConnection(customUrl?: string): Promise<{
  success: boolean;
  message: string;
  sheetTitle?: string;
  sheetDocUrl?: string;
}> {
  const { webAppUrl } = getStoredSheetsConfig();
  const targetUrl = (customUrl || webAppUrl).trim();

  if (!targetUrl) {
    return {
      success: false,
      message: "URL Google Apps Script Web App belum dikonfigurasi."
    };
  }

  const validation = validateSheetsUrl(targetUrl);
  if (!validation.valid && validation.error) {
    return {
      success: false,
      message: validation.error
    };
  }

  try {
    const res = await sendSheetsRequest({ action: "test" }, targetUrl);
    if (res && res.success) {
      return {
        success: true,
        message: res.message || "Berhasil terhubung ke Google Spreadsheet!",
        sheetTitle: res.sheetTitle || "Google Spreadsheet Yayasan",
        sheetDocUrl: res.sheetDocUrl || ""
      };
    }
    return {
      success: false,
      message: res?.message || "Respons tidak sesuai dari Google Spreadsheet."
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal menghubungi Google Apps Script."
    };
  }
}

/**
 * Unggah seluruh data lokal ke Google Spreadsheet
 */
export async function pushAllDataToSheets(
  data: DatabaseStore,
  customUrl?: string
): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, number>;
}> {
  const { webAppUrl } = getStoredSheetsConfig();
  const targetUrl = customUrl || webAppUrl;

  if (!targetUrl) {
    return {
      success: false,
      message: "URL Google Apps Script Web App belum diisi."
    };
  }

  try {
    const payload = {
      action: "pushAll",
      data: {
        profile: data.profile,
        assets: data.assets || [],
        employees: data.employees || [],
        students: data.students || [],
        donations: data.donations || [],
        assetTransfers: data.assetTransfers || [],
        borrowedDocs: data.borrowedDocs || [],
        meetings: data.meetings || []
      }
    };

    const res = await sendSheetsRequest(payload, targetUrl);

    if (res && res.success) {
      const summary = {
        assets: data.assets?.length || 0,
        employees: data.employees?.length || 0,
        students: data.students?.length || 0,
        donations: data.donations?.length || 0,
        transfers: data.assetTransfers?.length || 0,
        borrowedDocs: data.borrowedDocs?.length || 0,
        meetings: data.meetings?.length || 0
      };

      return {
        success: true,
        message: `Sinkronisasi sukses! Data tersimpan di Google Spreadsheet: ${summary.assets} Aset, ${summary.employees} Pegawai, ${summary.students} Siswa.`,
        details: summary
      };
    }

    return {
      success: false,
      message: res?.message || "Gagal memperbarui Google Spreadsheet."
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Sinkronisasi ke Google Spreadsheet terganggu: ${err.message || err}`
    };
  }
}

/**
 * Tarik seluruh data dari Google Spreadsheet
 */
export async function pullAllDataFromSheets(
  customUrl?: string
): Promise<{
  success: boolean;
  data?: Partial<DatabaseStore>;
  message: string;
}> {
  try {
    const res = await pullSheetsRequest(customUrl);

    if (res && res.success && res.data) {
      const incoming = res.data;
      const parsedStore: Partial<DatabaseStore> = {
        profile: incoming.profile || undefined,
        assets: Array.isArray(incoming.assets) ? incoming.assets : undefined,
        employees: Array.isArray(incoming.employees) ? incoming.employees : undefined,
        students: Array.isArray(incoming.students) ? incoming.students : undefined,
        donations: Array.isArray(incoming.donations) ? incoming.donations : undefined,
        assetTransfers: Array.isArray(incoming.assetTransfers) ? sanitizeTransfers(incoming.assetTransfers) : undefined,
        borrowedDocs: Array.isArray(incoming.borrowedDocs) ? sanitizeBorrowedDocs(incoming.borrowedDocs) : undefined,
        meetings: Array.isArray(incoming.meetings) ? incoming.meetings : undefined
      };

      return {
        success: true,
        data: parsedStore,
        message: `Data berhasil ditarik dari Google Spreadsheet! (${parsedStore.assets?.length || 0} Aset, ${parsedStore.employees?.length || 0} Pegawai, ${parsedStore.students?.length || 0} Siswa)`
      };
    }

    return {
      success: false,
      message: res?.message || "Format data dari Google Spreadsheet tidak dikenali."
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menarik data dari Google Spreadsheet: ${err.message || err}`
    };
  }
}

/**
 * Upsert satu item langsung ke Google Spreadsheet (Realtime sync)
 */
export async function upsertItemToSheets(
  sheetType: "assets" | "employees" | "students" | "donations" | "profile" | "assetTransfers" | "borrowedDocs" | "meetings",
  item: any
): Promise<boolean> {
  if (!isSheetsConfigured() || !isSheetsAutoSyncEnabled()) return false;
  try {
    const res = await sendSheetsRequest({
      action: "upsertItem",
      sheetType,
      item
    });
    return Boolean(res && res.success);
  } catch (err) {
    console.warn("upsertItemToSheets error:", err);
    return false;
  }
}

/**
 * Hapus satu item dari Google Spreadsheet berdasarkan ID
 */
export async function deleteItemFromSheets(
  sheetType: "assets" | "employees" | "students" | "donations" | "assetTransfers" | "borrowedDocs" | "meetings",
  id: string
): Promise<boolean> {
  if (!isSheetsConfigured()) return false;
  try {
    const res = await sendSheetsRequest({
      action: "deleteItem",
      sheetType,
      id
    });
    return Boolean(res && res.success);
  } catch (err) {
    console.warn("deleteItemFromSheets error:", err);
    return false;
  }
}

/**
 * Kode Google Apps Script (Code.gs) yang siap disalin dan dijalankan di Google Sheets
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: DATABASE BACKEND YAYASAN TERPADU
 * ============================================================================
 * Skrip ini mengubah Google Spreadsheet Anda menjadi REST API Database
 * yang aman, otomatis membuat sheet/kolom, dan mendukung sinkronisasi real-time.
 * 
 * CARA MEMASANG (HANYA 2 MENIT):
 * 1. Buka Google Spreadsheet Anda (atau buat baru di sheets.new).
 * 2. Klik menu "Extensions" (Ekstensi) > "Apps Script".
 * 3. Hapus SEMUA kode default di editor, lalu Tempel (Paste) SEMUA KODE INI.
 * 4. Klik ikon Simpan (Disket / Ctrl+S).
 * 5. (PENTING) Klik tombol 'Run' / 'Jalankan' untuk menguji & membuat lembar kerja.
 * 6. Klik tombol biru "Deploy" (Terapkan) > "New deployment" (Penerapan baru).
 * 7. Klik icon gerigi di samping 'Select type' > pilih "Web app".
 * 8. Atur:
 *    - Description: "Database API Yayasan"
 *    - Execute as: "Me" (Email Google Anda)
 *    - Who has access: "Anyone" (Siapa saja, agar aplikasi web bisa mengakses)
 * 9. Klik "Deploy", beri izin (Authorize Access), lalu SALIN Web App URL.
 * 10. Tempelkan URL tersebut ke aplikasi di menu Pengaturan > Google Spreadsheet!
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. FUNGSI PENGUJIAN & INISIALISASI (Aman dijalankan via tombol 'Run'/Jalankan)
// ----------------------------------------------------------------------------

function testKoneksi() {
  try {
    var ss = getSpreadsheet();
    Logger.log("====================================================");
    Logger.log("✓ PENGUJIAN DATABASE YAYASAN BERHASIL!");
    Logger.log("Nama File Spreadsheet : " + ss.getName());
    Logger.log("URL Spreadsheet       : " + ss.getUrl());
    Logger.log("----------------------------------------------------");
    
    // Inisialisasi 8 lembar kerja inti
    var sheets = ["Profil", "Aset", "Pegawai", "Siswa", "Donasi", "BalikNama", "PinjamBerkas", "Musyawarah"];
    for (var i = 0; i < sheets.length; i++) {
      var sh = ss.getSheetByName(sheets[i]);
      if (!sh) {
        ss.insertSheet(sheets[i]);
        Logger.log("+ Lembar baru dibuat: " + sheets[i]);
      } else {
        Logger.log("✓ Lembar telah siap: " + sheets[i]);
      }
    }
    
    Logger.log("====================================================");
    Logger.log("Status: SEMUA FUNGSI SIAP DIGUNAKAN!");
    Logger.log("Langkah berikutnya: Klik Deploy > New deployment > Web app (Who has access: Anyone).");
    return "BERHASIL: Terhubung ke " + ss.getName();
  } catch (err) {
    Logger.log("Error pada testKoneksi: " + err.toString());
    throw err;
  }
}

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("Database Yayasan")
      .addItem("Uji Koneksi & Format Tabel", "testKoneksi")
      .addToUi();
  } catch (e) {
    // Non-fatal jika dijalankan di luar konteks UI
  }
}

// ----------------------------------------------------------------------------
// 2. HELPER KONEKSI SPREADSHEET (Mendukung Container-Bound & Standalone Script)
// ----------------------------------------------------------------------------

function getSpreadsheet(optIdOrUrl) {
  if (optIdOrUrl) {
    try {
      if (optIdOrUrl.indexOf("http") === 0) {
        return SpreadsheetApp.openByUrl(optIdOrUrl);
      } else {
        return SpreadsheetApp.openById(optIdOrUrl);
      }
    } catch (e) {}
  }
  
  try {
    var activeSs = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSs) return activeSs;
  } catch (e) {}
  
  // Fallback: Cek Script Properties
  try {
    var savedId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    if (savedId) {
      var foundSs = SpreadsheetApp.openById(savedId);
      if (foundSs) return foundSs;
    }
  } catch (e) {}

  throw new Error("Spreadsheet tidak ditemukan! Harap pastikan Anda membuka Apps Script melalui menu 'Ekstensi' (Extensions) > 'Apps Script' di dalam file Google Spreadsheet Anda.");
}

// ----------------------------------------------------------------------------
// 3. HANDLER WEB APP API (doGet & doPost)
// ----------------------------------------------------------------------------

function doGet(e) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    var sheetTarget = params.sheetId || params.sheetUrl;
    var ss = getSpreadsheet(sheetTarget);
    
    if (params.action === "pull") {
      var data = readAllDatabaseData(ss);
      return jsonResponse({
        success: true,
        message: "Data berhasil ditarik dari Spreadsheet",
        sheetTitle: ss.getName(),
        sheetDocUrl: ss.getUrl(),
        data: data
      });
    }
    
    return jsonResponse({
      success: true,
      message: "Google Spreadsheet Database Yayasan Aktif & Siap!",
      sheetTitle: ss.getName(),
      sheetDocUrl: ss.getUrl()
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      message: "Error pada doGet Apps Script: " + err.toString()
    });
  }
}

function doPost(e) {
  try {
    var postData = "";
    if (e && e.postData && e.postData.contents) {
      postData = e.postData.contents;
    }
    
    var body = postData ? JSON.parse(postData) : {};
    var sheetTarget = body.sheetId || body.sheetUrl || (e && e.parameter ? (e.parameter.sheetId || e.parameter.sheetUrl) : null);
    var ss = getSpreadsheet(sheetTarget);
    var action = body.action || "test";
    
    // 1. UJI KONEKSI
    if (action === "test") {
      return jsonResponse({
        success: true,
        message: "Berhasil terhubung ke Google Spreadsheet: " + ss.getName(),
        sheetTitle: ss.getName(),
        sheetDocUrl: ss.getUrl()
      });
    }
    
    // 2. SINKRONISASI TOTAL (Push All Data)
    if (action === "pushAll") {
      var d = body.data || {};
      
      if (d.profile) saveProfileSheet(ss, d.profile);
      if (d.assets) saveAssetsSheet(ss, d.assets);
      if (d.employees) saveEmployeesSheet(ss, d.employees);
      if (d.students) saveStudentsSheet(ss, d.students);
      if (d.donations) saveDonationsSheet(ss, d.donations);
      if (d.assetTransfers) saveTransfersSheet(ss, d.assetTransfers);
      if (d.borrowedDocs) saveBorrowedDocsSheet(ss, d.borrowedDocs);
      if (d.meetings) saveMeetingsSheet(ss, d.meetings);
      
      return jsonResponse({
        success: true,
        message: "Seluruh data berhasil disimpan ke lembar Google Spreadsheet!",
        sheetTitle: ss.getName(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // 3. UPSERT SATU ITEM (Realtime sync)
    if (action === "upsertItem") {
      var sheetType = body.sheetType;
      var item = body.item;
      if (!sheetType || !item) {
        return jsonResponse({ success: false, message: "Parameter sheetType atau item tidak valid" });
      }
      upsertSingleRecord(ss, sheetType, item);
      return jsonResponse({ success: true, message: "Item berhasil diperbarui" });
    }
    
    // 4. HAPUS SATU ITEM BERDASARKAN ID
    if (action === "deleteItem") {
      var delType = body.sheetType;
      var delId = body.id;
      if (!delType || !delId) {
        return jsonResponse({ success: false, message: "Parameter sheetType atau id tidak valid" });
      }
      deleteSingleRecord(ss, delType, delId);
      return jsonResponse({ success: true, message: "Item " + delId + " berhasil dihapus" });
    }
    
    return jsonResponse({ success: false, message: "Action '" + action + "' tidak dikenali" });
  } catch (err) {
    return jsonResponse({
      success: false,
      message: "Terjadi error pada Apps Script: " + err.toString()
    });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------------------------------
// 4. OPERASI KEAMANAN LEMBAR KERJA (Mencegah Range Out of Bounds & Undefined)
// ----------------------------------------------------------------------------

function safeSetValues(sheet, startRow, startCol, matrix) {
  if (!matrix || matrix.length === 0) return;
  var numRows = matrix.length;
  var numCols = matrix[0].length;
  
  // Pastikan kapasitas baris cukup
  var neededRows = startRow + numRows - 1;
  var currentMaxRows = sheet.getMaxRows();
  if (currentMaxRows < neededRows) {
    sheet.insertRowsAfter(currentMaxRows, neededRows - currentMaxRows);
  }
  
  // Pastikan kapasitas kolom cukup
  var neededCols = startCol + numCols - 1;
  var currentMaxCols = sheet.getMaxColumns();
  if (currentMaxCols < neededCols) {
    sheet.insertColumnsAfter(currentMaxCols, neededCols - currentMaxCols);
  }
  
  // Bersihkan nilai undefined / null agar tidak memicu error tipe di Apps Script
  var cleanMatrix = matrix.map(function(row) {
    return row.map(function(cell) {
      if (cell === undefined || cell === null) return "";
      return cell;
    });
  });
  
  sheet.getRange(startRow, startCol, numRows, numCols).setValues(cleanMatrix);
}

function safeClearData(sheet, fromRow) {
  var lastRow = sheet.getLastRow();
  var maxCols = sheet.getMaxColumns();
  if (lastRow >= fromRow && maxCols > 0) {
    var rowsToClear = lastRow - fromRow + 1;
    sheet.getRange(fromRow, 1, rowsToClear, maxCols).clearContent();
  }
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  if (headers && headers.length > 0) {
    // Pastikan kapasitas kolom minimal sama dengan jumlah header
    var currentMaxCols = sheet.getMaxColumns();
    if (currentMaxCols < headers.length) {
      sheet.insertColumnsAfter(currentMaxCols, headers.length - currentMaxCols);
    }
    
    // Tulis & format header baris 1
    safeSetValues(sheet, 1, 1, [headers]);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#059669"); // Emerald
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ----------------------------------------------------------------------------
// 5. HANDLER PENYIMPANAN LEMBAR SPREADSHEET (SESUAI DENGAN INPUT DATA APLIKASI)
// ----------------------------------------------------------------------------

function saveProfileSheet(ss, p) {
  var headers = [
    "ID", "Nama Yayasan", "No SK Kemenkumham", "No Registrasi", "Alamat", 
    "Telepon", "Email", "Pimpinan / Ketua", "Admin Sistem", "URL Logo", 
    "Tahun Berdiri", "Visi Yayasan", "Misi Yayasan", "Terakhir Disinkronkan"
  ];
  var sheet = getOrCreateSheet(ss, "Profil", headers);
  
  safeSetValues(sheet, 2, 1, [[
    p.id || "fnd-01",
    p.name || "",
    p.legalNumber || "",
    p.registrationNo || "",
    p.address || "",
    p.phone || "",
    p.email || "",
    p.leaderName || "",
    p.adminName || "",
    p.logoUrl || "",
    p.establishedYear || 2015,
    p.vision || "",
    p.mission || "",
    new Date().toLocaleString("id-ID")
  ]]);
}

function saveAssetsSheet(ss, assets) {
  var headers = [
    "ID", "Kode Aset", "Nama Aset", "Kategori", 
    "Kecamatan", "Desa / Kelurahan", "Penggunaan / Fungsi", "Tempat Simpan Berkas Asli",
    "Jenis Dokumen / Sertifikat", "Nomor Dokumen / Sertifikat", "Atas Nama Sertifikat / BPKB", "Pemilik Asal / Pewakif",
    "Status Balik Nama", "Luas Tanah (m2)", "Luas Bangunan (m2)", 
    "Jenis Kendaraan", "Merk / Tipe Kendaraan", "Nomor Polisi / Plat", "Tahun Pembuatan", 
    "Hari Pajak", "Bulan Pajak", "Nomor PBG", "Nomor SLF", 
    "Kondisi Fisik", "Status Operasional", "Penanggung Jawab / Kelompok", "Lokasi Penempatan", "Sumber Dana", 
    "Biaya Perolehan (Rp)", "Nilai Saat Ini (Rp)", "Jumlah", "Satuan", 
    "Tanggal Perolehan", "Tanggal Audit Terakhir", "Scan PDF Sertifikat", "Scan BPKB / STNK", "Catatan / Keterangan"
  ];
  var sheet = getOrCreateSheet(ss, "Aset", headers);
  safeClearData(sheet, 2);
  
  if (!assets || assets.length === 0) return;
  
  var rows = assets.map(function(a) {
    return [
      a.id,
      a.code || "",
      a.name || "",
      a.category || "Tanah",
      a.district || "",
      a.village || "",
      a.usagePurpose || "",
      a.archiveStorageLocation || "",
      a.legalDocType || "",
      a.legalDocNumber || "",
      a.registeredOwner || a.originalOwner || "",
      a.originalOwner || "",
      a.transferStatus || "",
      a.landArea ? Number(a.landArea) : "",
      a.buildingArea ? Number(a.buildingArea) : "",
      a.vehicleType || "",
      a.vehicleBrand || "",
      a.licensePlate || "",
      a.vehicleYear ? String(a.vehicleYear) : "",
      a.taxDay ? String(a.taxDay) : "",
      a.taxMonth || "",
      a.pbgNumber || "",
      a.slfNumber || "",
      a.condition || "Baik",
      a.status || "Aktif",
      a.custodian || "",
      a.location || "",
      a.sourceOfFund || "",
      Number(a.acquisitionCost) || 0,
      Number(a.currentValue) || 0,
      Number(a.quantity) || 1,
      a.unit || "Unit",
      a.acquisitionDate || "",
      a.lastAuditDate || "",
      a.pdfCertificateScan || "",
      a.bpkbScan || "",
      a.notes || ""
    ];
  });
  
  safeSetValues(sheet, 2, 1, rows);
}

function saveEmployeesSheet(ss, employees) {
  var headers = [
    "ID", "NIP / Kode Pegawai", "Nama Pegawai / Guru", "Peran / Kategori", "Jabatan Lengkap", "Unit Kerja", 
    "Status Kepegawaian", "Pendidikan Terakhir", "Tanggal Bergabung", "Gaji Pokok (Rp)", "Skor Kinerja", 
    "Kehadiran (%)", "No Telepon / WA", "Email", "Status Aktif"
  ];
  var sheet = getOrCreateSheet(ss, "Pegawai", headers);
  safeClearData(sheet, 2);
  
  if (!employees || employees.length === 0) return;
  
  var rows = employees.map(function(e) {
    return [
      e.id,
      e.nip || "",
      e.name || "",
      e.role || "",
      e.positionTitle || e.role || "",
      e.unit || "Kantor Yayasan",
      e.employmentStatus || "Tetap (PNS/GTY)",
      e.education || "S1",
      e.joinDate || "",
      Number(e.monthlySalary) || 0,
      e.performanceScore !== undefined && e.performanceScore !== "" ? Number(e.performanceScore) : "",
      e.attendanceRate !== undefined && e.attendanceRate !== "" ? Number(e.attendanceRate) : "",
      e.phone || "",
      e.email || "",
      e.isActive ? "Aktif" : "Nonaktif"
    ];
  });
  
  safeSetValues(sheet, 2, 1, rows);
}

function saveStudentsSheet(ss, students) {
  var headers = [
    "ID", "NISN", "NIS", "Nama Santri / Siswa", "Jenis Kelamin (L/P)", "Jenjang Pendidikan", 
    "Tingkat / Kelas", "Tahun Ajaran", "Status", "Kategori Peserta Didik", 
    "Nama Orang Tua / Wali", "No HP Wali / Ortu", "Alamat / Asrama", 
    "Status SPP", "Nilai Rata-rata", "Jumlah Prestasi", 
    "Tahun Kelulusan", "Studi Lanjut / Aktivitas Alumni", "No HP Alumni", "Email Alumni", "Catatan Tambahan"
  ];
  var sheet = getOrCreateSheet(ss, "Siswa", headers);
  safeClearData(sheet, 2);
  
  if (!students || students.length === 0) return;
  
  var rows = students.map(function(s) {
    return [
      s.id,
      s.nisn || "",
      s.nis || "",
      s.name || "",
      s.gender || "L",
      s.educationLevel || "SMA",
      s.classGrade || "KELAS 10",
      s.academicYear || "2025/2026",
      s.status || "Aktif",
      s.category || "Reguler",
      s.parentName || "",
      s.parentPhone || "",
      s.address || "",
      s.tuitionStatus || "Lunas",
      Number(s.averageGrade) || 85,
      Number(s.achievementsCount) || 0,
      s.graduationYear || "",
      s.currentActivity || "",
      s.alumniPhone || "",
      s.alumniEmail || "",
      s.notes || ""
    ];
  });
  
  safeSetValues(sheet, 2, 1, rows);
}

function saveDonationsSheet(ss, donations) {
  var headers = [
    "ID", "Tanggal", "Nama Donatur / Pewakif", "No Kontak Donatur", 
    "Kategori Donasi", "Nominal (Rp)", "Deskripsi Barang / Bantuan", "Jumlah / Kuantitas", 
    "Petugas Penerima", "Catatan / Doa Donatur"
  ];
  var sheet = getOrCreateSheet(ss, "Donasi", headers);
  safeClearData(sheet, 2);
  
  if (!donations || donations.length === 0) return;
  
  var rows = donations.map(function(d) {
    return [
      d.id,
      d.date || "",
      d.donatorName || "",
      d.donatorContact || "",
      d.category || "Uang Tunai",
      Number(d.amount) || 0,
      d.itemDescription || "",
      d.quantity || "",
      d.receiverName || "",
      d.notes || ""
    ];
  });
  
  safeSetValues(sheet, 2, 1, rows);
}

function saveTransfersSheet(ss, transfers) {
  var headers = [
    "ID", "ID Aset Terkait", "Kode Aset", "Nama Aset", "Kategori", 
    "Pemilik Asal (Pewakif)", "Atas Nama Baru (Yayasan)", 
    "Jenis Dokumen / Akta", "Nomor Dokumen", "Kantor Notaris / BPN", 
    "Tgl Pengajuan", "Target Selesai", "Tgl Selesai / Terbit", 
    "Status Progres", "Progres (%)", "Estimasi Biaya (Rp)", 
    "Staf Penanggung Jawab", "Catatan Utama", "Rincian Log & Biaya (JSON)"
  ];
  var sheet = getOrCreateSheet(ss, "BalikNama", headers);
  safeClearData(sheet, 2);
  
  if (!transfers || transfers.length === 0) return;
  
  var rows = transfers.map(function(t) {
    return [
      t.id,
      t.assetId || "",
      t.assetCode || "",
      t.assetName || "",
      t.category || "Tanah",
      t.fromOwner || "",
      t.toOwner || "",
      t.docType || "",
      t.docNumber || "",
      t.notaryOffice || "",
      t.submissionDate || "",
      t.targetDate || "",
      t.completionDate || "",
      t.status || "Verifikasi Dokumen",
      Number(t.progressPercent) || 0,
      Number(t.estimatedCost) || 0,
      t.handlerName || "",
      t.notes || "",
      Array.isArray(t.logs) ? JSON.stringify(t.logs) : (t.logs ? String(t.logs) : "")
    ];
  });
  
  safeSetValues(sheet, 2, 1, rows);
}

function saveBorrowedDocsSheet(ss, borrowed) {
  var headers = [
    "ID", "ID Aset", "Kode Aset", "Nama Aset", "Judul Berkas / Dokumen Asli", "Nomor Dokumen",
    "Nama Peminjam", "Jabatan / Lembaga Peminjam", "No HP Peminjam", 
    "Tanggal Pinjam", "Batas Waktu (Due Date)", "Tanggal Dikembalikan", 
    "Keperluan / Alasan Pinjam", "Status Peminjaman", 
    "Disetujui Oleh", "Petugas Penyerah Fisik", "Bukti Serah Terima (Foto/BAST)", "Catatan / Lokasi Simpan"
  ];
  var sheet = getOrCreateSheet(ss, "PinjamBerkas", headers);
  safeClearData(sheet, 2);
  
  if (!borrowed || borrowed.length === 0) return;
  
  var rows = borrowed.map(function(b) {
    return [
      b.id,
      b.assetId || "",
      b.assetCode || "",
      b.assetName || "",
      b.docTitle || "",
      b.docNumber || "",
      b.borrowerName || "",
      b.borrowerRole || "",
      b.borrowerPhone || "",
      b.borrowDate || "",
      b.dueDate || b.expectedReturnDate || "",
      b.returnDate || b.actualReturnDate || "",
      b.purpose || "",
      b.status || "Dipinjam",
      b.approvedBy || "",
      b.handoverOfficer || "",
      b.photoProof || "",
      b.notes || ""
    ];
  });
  
  safeSetValues(sheet, 2, 1, rows);
}

function saveMeetingsSheet(ss, meetings) {
  var headers = [
    "ID", "Tanggal Musyawarah", "Judul Rapat / Musyawarah", "Kategori Rapat", "Pemimpin Rapat / Pengarah", 
    "Peserta / Daftar Hadir", "Pembahasan / Poin Notulensi", "Tindak Lanjut / Keputusan", "Status Tindak Lanjut", "Status Rapat"
  ];
  var sheet = getOrCreateSheet(ss, "Musyawarah", headers);
  safeClearData(sheet, 2);
  
  if (!meetings || meetings.length === 0) return;
  
  var rows = meetings.map(function(m) {
    return [
      m.id,
      m.date || "",
      m.title || "",
      m.category || "Rapat Pengurus",
      m.leader || "",
      m.participants || "",
      Array.isArray(m.description) ? m.description.join(String.fromCharCode(10)) : (m.description || ""),
      Array.isArray(m.followUp) ? m.followUp.join(String.fromCharCode(10)) : (m.followUp || ""),
      Array.isArray(m.followUpStatuses) ? m.followUpStatuses.join(String.fromCharCode(10)) : (m.followUpStatuses || ""),
      m.status || "Belum Dimulai"
    ];
  });
  
  safeSetValues(sheet, 2, 1, rows);
}

// ----------------------------------------------------------------------------
// 6. HANDLER MEMBACA SEMUA DATA SPREADSHEET (Action: pull)
// ----------------------------------------------------------------------------

function readAllDatabaseData(ss) {
  var res = {
    profile: null,
    assets: [],
    employees: [],
    students: [],
    donations: [],
    assetTransfers: [],
    borrowedDocs: [],
    meetings: []
  };
  
  // Profil
  var pSheet = ss.getSheetByName("Profil");
  if (pSheet && pSheet.getLastRow() >= 2 && pSheet.getLastColumn() >= 1) {
    var pRow = pSheet.getRange(2, 1, 1, pSheet.getLastColumn()).getValues()[0];
    res.profile = {
      id: pRow[0] || "fnd-01",
      name: pRow[1] || "",
      legalNumber: pRow[2] || "",
      registrationNo: pRow[3] || "",
      address: pRow[4] || "",
      phone: pRow[5] || "",
      email: pRow[6] || "",
      leaderName: pRow[7] || "",
      adminName: pRow[8] || "",
      logoUrl: pRow[9] || "",
      establishedYear: Number(pRow[10]) || 2015,
      vision: pRow[11] || "",
      mission: pRow[12] || ""
    };
  }
  
  // Aset
  var aSheet = ss.getSheetByName("Aset");
  if (aSheet && aSheet.getLastRow() >= 2 && aSheet.getLastColumn() >= 1) {
    var aRows = aSheet.getRange(2, 1, aSheet.getLastRow() - 1, aSheet.getLastColumn()).getValues();
    res.assets = aRows.map(function(r) {
      return {
        id: String(r[0]),
        code: r[1] || "",
        name: r[2] || "",
        category: r[3] || "Tanah",
        district: r[4] || "",
        village: r[5] || "",
        usagePurpose: r[6] || "",
        archiveStorageLocation: r[7] || "",
        legalDocType: r[8] || "",
        legalDocNumber: r[9] || "",
        registeredOwner: r[10] || "",
        originalOwner: r[11] || "",
        transferStatus: r[12] || "",
        landArea: r[13] ? Number(r[13]) : undefined,
        buildingArea: r[14] ? Number(r[14]) : undefined,
        vehicleType: r[15] || undefined,
        vehicleBrand: r[16] || undefined,
        licensePlate: r[17] || undefined,
        vehicleYear: r[18] ? Number(r[18]) : undefined,
        taxDay: r[19] ? Number(r[19]) : undefined,
        taxMonth: r[20] || undefined,
        pbgNumber: r[21] || undefined,
        slfNumber: r[22] || undefined,
        condition: r[23] || "Baik",
        status: r[24] || "Aktif",
        custodian: r[25] || "",
        location: r[26] || "",
        sourceOfFund: r[27] || "",
        acquisitionCost: Number(r[28]) || 0,
        currentValue: Number(r[29]) || 0,
        quantity: Number(r[30]) || 1,
        unit: r[31] || "Unit",
        acquisitionDate: r[32] || "",
        lastAuditDate: r[33] || "",
        pdfCertificateScan: r[34] || undefined,
        bpkbScan: r[35] || undefined,
        notes: r[36] || ""
      };
    });
  }
  
  // Pegawai
  var eSheet = ss.getSheetByName("Pegawai");
  if (eSheet && eSheet.getLastRow() >= 2 && eSheet.getLastColumn() >= 1) {
    var eRows = eSheet.getRange(2, 1, eSheet.getLastRow() - 1, eSheet.getLastColumn()).getValues();
    res.employees = eRows.map(function(r) {
      return {
        id: String(r[0]),
        nip: r[1] || "",
        name: r[2] || "",
        role: r[3] || "Guru",
        positionTitle: r[4] || r[3] || "Guru",
        unit: r[5] || "Kantor Yayasan",
        employmentStatus: r[6] || "Tetap (PNS/GTY)",
        education: r[7] || "S1",
        joinDate: r[8] || "",
        monthlySalary: Number(r[9]) || 0,
        performanceScore: r[10] !== "" ? Number(r[10]) : undefined,
        attendanceRate: r[11] !== "" ? Number(r[11]) : undefined,
        phone: r[12] || "",
        email: r[13] || "",
        isActive: r[14] === "Aktif"
      };
    });
  }
  
  // Siswa
  var sSheet = ss.getSheetByName("Siswa");
  if (sSheet && sSheet.getLastRow() >= 2 && sSheet.getLastColumn() >= 1) {
    var sRows = sSheet.getRange(2, 1, sSheet.getLastRow() - 1, sSheet.getLastColumn()).getValues();
    res.students = sRows.map(function(r) {
      return {
        id: String(r[0]),
        nisn: r[1] || "",
        nis: r[2] || "",
        name: r[3] || "",
        gender: r[4] || "L",
        educationLevel: r[5] || "SMA",
        classGrade: r[6] || "KELAS 10",
        academicYear: r[7] || "2025/2026",
        status: r[8] || "Aktif",
        category: r[9] || "Reguler",
        parentName: r[10] || "",
        parentPhone: r[11] || "",
        address: r[12] || "",
        tuitionStatus: r[13] || "Lunas",
        averageGrade: Number(r[14]) || 85,
        achievementsCount: Number(r[15]) || 0,
        graduationYear: r[16] || undefined,
        currentActivity: r[17] || undefined,
        alumniPhone: r[18] || undefined,
        alumniEmail: r[19] || undefined,
        notes: r[20] || ""
      };
    });
  }
  
  // Donasi
  var dSheet = ss.getSheetByName("Donasi");
  if (dSheet && dSheet.getLastRow() >= 2 && dSheet.getLastColumn() >= 1) {
    var dRows = dSheet.getRange(2, 1, dSheet.getLastRow() - 1, dSheet.getLastColumn()).getValues();
    res.donations = dRows.map(function(r) {
      return {
        id: String(r[0]),
        date: r[1] || "",
        donatorName: r[2] || "",
        donatorContact: r[3] || "",
        category: r[4] || "Uang Tunai",
        amount: Number(r[5]) || 0,
        itemDescription: r[6] || undefined,
        quantity: r[7] || undefined,
        receiverName: r[8] || "",
        notes: r[9] || ""
      };
    });
  }
  
  // Balik Nama
  var tSheet = ss.getSheetByName("BalikNama");
  if (tSheet && tSheet.getLastRow() >= 2 && tSheet.getLastColumn() >= 1) {
    var tRows = tSheet.getRange(2, 1, tSheet.getLastRow() - 1, tSheet.getLastColumn()).getValues();
    res.assetTransfers = tRows.map(function(r) {
      var parsedLogs = [];
      if (r[18]) {
        try {
          parsedLogs = JSON.parse(r[18]);
        } catch(e) {}
      }
      return {
        id: String(r[0]),
        assetId: r[1] || "",
        assetCode: r[2] || "",
        assetName: r[3] || "",
        category: r[4] || "Tanah",
        fromOwner: r[5] || "",
        toOwner: r[6] || "",
        docType: r[7] || "",
        docNumber: r[8] || "",
        notaryOffice: r[9] || "",
        submissionDate: r[10] || "",
        targetDate: r[11] || "",
        completionDate: r[12] || "",
        status: r[13] || "Verifikasi Dokumen",
        progressPercent: Number(r[14]) || 0,
        estimatedCost: Number(r[15]) || 0,
        handlerName: r[16] || "",
        notes: r[17] || "",
        logs: parsedLogs
      };
    });
  }
  
  // Pinjam Berkas
  var bSheet = ss.getSheetByName("PinjamBerkas");
  if (bSheet && bSheet.getLastRow() >= 2 && bSheet.getLastColumn() >= 1) {
    var bRows = bSheet.getRange(2, 1, bSheet.getLastRow() - 1, bSheet.getLastColumn()).getValues();
    res.borrowedDocs = bRows.map(function(r) {
      return {
        id: String(r[0]),
        assetId: r[1] || "",
        assetCode: r[2] || "",
        assetName: r[3] || "",
        docTitle: r[4] || "",
        docNumber: r[5] || "",
        borrowerName: r[6] || "",
        borrowerRole: r[7] || "",
        borrowerPhone: r[8] || "",
        borrowDate: r[9] || "",
        dueDate: r[10] || "",
        expectedReturnDate: r[10] || "",
        returnDate: r[11] || undefined,
        actualReturnDate: r[11] || undefined,
        purpose: r[12] || "",
        status: r[13] || "Dipinjam",
        approvedBy: r[14] || "",
        handoverOfficer: r[15] || "",
        photoProof: r[16] || undefined,
        notes: r[17] || ""
      };
    });
  }
  
  // Musyawarah
  var mSheet = ss.getSheetByName("Musyawarah");
  if (mSheet && mSheet.getLastRow() >= 2 && mSheet.getLastColumn() >= 1) {
    var mRows = mSheet.getRange(2, 1, mSheet.getLastRow() - 1, mSheet.getLastColumn()).getValues();
    res.meetings = mRows.map(function(r) {
      return {
        id: String(r[0]),
        date: r[1] || "",
        title: r[2] || "",
        category: r[3] || "Rapat Pengurus",
        leader: r[4] || "",
        participants: r[5] || "",
        description: r[6] ? String(r[6]).split(String.fromCharCode(10)) : [],
        followUp: r[7] ? String(r[7]).split(String.fromCharCode(10)) : [],
        followUpStatuses: r[8] ? String(r[8]).split(String.fromCharCode(10)) : [],
        status: r[9] || "Belum Dimulai"
      };
    });
  }
  
  return res;
}

// ----------------------------------------------------------------------------
// 7. REALTIME SINGLE RECORD OPERASI (Upsert & Delete)
// ----------------------------------------------------------------------------

function getSheetNameByType(type) {
  switch(type) {
    case "profile": return "Profil";
    case "assets": return "Aset";
    case "employees": return "Pegawai";
    case "students": return "Siswa";
    case "donations": return "Donasi";
    case "assetTransfers": return "BalikNama";
    case "borrowedDocs": return "PinjamBerkas";
    case "meetings": return "Musyawarah";
    default: return type;
  }
}

function upsertSingleRecord(ss, sheetType, item) {
  var sheetName = getSheetNameByType(sheetType);
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    if (sheetType === "profile") {
      saveProfileSheet(ss, item);
      return;
    }
    return;
  }
  
  if (sheetType === "profile") {
    saveProfileSheet(ss, item);
    return;
  }
  
  var lastRow = sheet.getLastRow();
  var rowIndex = -1;
  
  if (lastRow >= 2 && sheet.getLastColumn() >= 1) {
    var idCol = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < idCol.length; i++) {
      if (String(idCol[i][0]) === String(item.id)) {
        rowIndex = i + 2;
        break;
      }
    }
  }
  
  var targetRow = rowIndex > 0 ? rowIndex : Math.max(lastRow + 1, 2);
  var rowData = [];
  
  if (sheetType === "assets") {
    rowData = [
      item.id,
      item.code || "",
      item.name || "",
      item.category || "Tanah",
      item.district || "",
      item.village || "",
      item.usagePurpose || "",
      item.archiveStorageLocation || "",
      item.legalDocType || "",
      item.legalDocNumber || "",
      item.registeredOwner || item.originalOwner || "",
      item.originalOwner || "",
      item.transferStatus || "",
      item.landArea ? Number(item.landArea) : "",
      item.buildingArea ? Number(item.buildingArea) : "",
      item.vehicleType || "",
      item.vehicleBrand || "",
      item.licensePlate || "",
      item.vehicleYear ? String(item.vehicleYear) : "",
      item.taxDay ? String(item.taxDay) : "",
      item.taxMonth || "",
      item.pbgNumber || "",
      item.slfNumber || "",
      item.condition || "Baik",
      item.status || "Aktif",
      item.custodian || "",
      item.location || "",
      item.sourceOfFund || "",
      Number(item.acquisitionCost) || 0,
      Number(item.currentValue) || 0,
      Number(item.quantity) || 1,
      item.unit || "Unit",
      item.acquisitionDate || "",
      item.lastAuditDate || "",
      item.pdfCertificateScan || "",
      item.bpkbScan || "",
      item.notes || ""
    ];
  } else if (sheetType === "employees") {
    rowData = [
      item.id,
      item.nip || "",
      item.name || "",
      item.role || "",
      item.positionTitle || item.role || "",
      item.unit || "Kantor Yayasan",
      item.employmentStatus || "Tetap (PNS/GTY)",
      item.education || "S1",
      item.joinDate || "",
      Number(item.monthlySalary) || 0,
      item.performanceScore !== undefined && item.performanceScore !== "" ? Number(item.performanceScore) : "",
      item.attendanceRate !== undefined && item.attendanceRate !== "" ? Number(item.attendanceRate) : "",
      item.phone || "",
      item.email || "",
      item.isActive ? "Aktif" : "Nonaktif"
    ];
  } else if (sheetType === "students") {
    rowData = [
      item.id,
      item.nisn || "",
      item.nis || "",
      item.name || "",
      item.gender || "L",
      item.educationLevel || "SMA",
      item.classGrade || "KELAS 10",
      item.academicYear || "2025/2026",
      item.status || "Aktif",
      item.category || "Reguler",
      item.parentName || "",
      item.parentPhone || "",
      item.address || "",
      item.tuitionStatus || "Lunas",
      Number(item.averageGrade) || 85,
      Number(item.achievementsCount) || 0,
      item.graduationYear || "",
      item.currentActivity || "",
      item.alumniPhone || "",
      item.alumniEmail || "",
      item.notes || ""
    ];
  } else if (sheetType === "donations") {
    rowData = [
      item.id,
      item.date || "",
      item.donatorName || "",
      item.donatorContact || "",
      item.category || "Uang Tunai",
      Number(item.amount) || 0,
      item.itemDescription || "",
      item.quantity || "",
      item.receiverName || "",
      item.notes || ""
    ];
  } else if (sheetType === "assetTransfers") {
    rowData = [
      item.id,
      item.assetId || "",
      item.assetCode || "",
      item.assetName || "",
      item.category || "Tanah",
      item.fromOwner || "",
      item.toOwner || "",
      item.docType || "",
      item.docNumber || "",
      item.notaryOffice || "",
      item.submissionDate || "",
      item.targetDate || "",
      item.completionDate || "",
      item.status || "Verifikasi Dokumen",
      Number(item.progressPercent) || 0,
      Number(item.estimatedCost) || 0,
      item.handlerName || "",
      item.notes || "",
      Array.isArray(item.logs) ? JSON.stringify(item.logs) : (item.logs ? String(item.logs) : "")
    ];
  } else if (sheetType === "borrowedDocs") {
    rowData = [
      item.id,
      item.assetId || "",
      item.assetCode || "",
      item.assetName || "",
      item.docTitle || "",
      item.docNumber || "",
      item.borrowerName || "",
      item.borrowerRole || "",
      item.borrowerPhone || "",
      item.borrowDate || "",
      item.dueDate || item.expectedReturnDate || "",
      item.returnDate || item.actualReturnDate || "",
      item.purpose || "",
      item.status || "Dipinjam",
      item.approvedBy || "",
      item.handoverOfficer || "",
      item.photoProof || "",
      item.notes || ""
    ];
  } else if (sheetType === "meetings") {
    rowData = [
      item.id,
      item.date || "",
      item.title || "",
      item.category || "Rapat Pengurus",
      item.leader || "",
      item.participants || "",
      Array.isArray(item.description) ? item.description.join(String.fromCharCode(10)) : (item.description || ""),
      Array.isArray(item.followUp) ? item.followUp.join(String.fromCharCode(10)) : (item.followUp || ""),
      Array.isArray(item.followUpStatuses) ? item.followUpStatuses.join(String.fromCharCode(10)) : (item.followUpStatuses || ""),
      item.status || "Belum Dimulai"
    ];
  }
  
  if (rowData.length > 0) {
    safeSetValues(sheet, targetRow, 1, [rowData]);
  }
}

function deleteSingleRecord(ss, sheetType, id) {
  var sheetName = getSheetNameByType(sheetType);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2 || sheet.getLastColumn() < 1) return;
  
  var idCol = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < idCol.length; i++) {
    if (String(idCol[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
}
`;
