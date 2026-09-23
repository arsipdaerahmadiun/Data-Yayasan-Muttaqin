import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DatabaseStore, AssetItem, EmployeeItem, StudentItem, DonationRecord, FoundationProfile, AssetTransferRecord } from "../types";

// Default credentials - empty to keep Supabase completely disconnected
export const DEFAULT_SUPABASE_URL = "";
export const DEFAULT_SUPABASE_ANON_KEY = "";

export function normalizeSupabaseUrl(url: string): string {
  if (!url) return "";
  let cleaned = url.trim();
  // Strip trailing /rest/v1 or /rest/v1/
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, "");
  // Strip trailing slash
  cleaned = cleaned.replace(/\/+$/, "");
  return cleaned;
}

export function disconnectSupabase(): void {
  try {
    localStorage.removeItem("supabase_url");
    localStorage.removeItem("supabase_anon_key");
    localStorage.removeItem("supabase_auto_sync");
    localStorage.setItem("supabase_disconnected", "true");
    supabaseInstance = null;
  } catch (err) {
    console.warn("Failed to disconnect Supabase:", err);
  }
}

// Auto-run disconnect on load to ensure old sessions are cleanly disconnected
if (typeof window !== "undefined") {
  try {
    if (localStorage.getItem("supabase_disconnected") !== "true") {
      disconnectSupabase();
    }
  } catch {}
}

export function getStoredSupabaseConfig() {
  if (typeof window !== "undefined" && localStorage.getItem("supabase_disconnected") === "true") {
    return { url: "", anonKey: "" };
  }

  const metaEnv = (import.meta as any).env || {};
  const envUrl = (metaEnv.VITE_SUPABASE_URL as string) || "";
  const envKey = (metaEnv.VITE_SUPABASE_ANON_KEY as string) || "";

  const savedUrl = (typeof window !== "undefined" ? localStorage.getItem("supabase_url") : "") || envUrl || DEFAULT_SUPABASE_URL;
  const savedKey = (typeof window !== "undefined" ? localStorage.getItem("supabase_anon_key") : "") || envKey || DEFAULT_SUPABASE_ANON_KEY;

  return {
    url: normalizeSupabaseUrl(savedUrl),
    anonKey: savedKey.trim()
  };
}

export function isSupabaseConfigured(): boolean {
  if (typeof window !== "undefined" && localStorage.getItem("supabase_disconnected") === "true") {
    return false;
  }
  const { url, anonKey } = getStoredSupabaseConfig();
  return Boolean(url && anonKey);
}

export function isSupabaseAutoSyncEnabled(): boolean {
  if (!isSupabaseConfigured()) return false;
  try {
    const saved = localStorage.getItem("supabase_auto_sync");
    if (saved === null) return false;
    return saved === "true";
  } catch {
    return false;
  }
}

export function setSupabaseAutoSyncEnabled(enabled: boolean): void {
  try {
    localStorage.setItem("supabase_auto_sync", String(enabled));
  } catch (err) {
    console.warn("Failed to set supabase_auto_sync:", err);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) return null;

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    }
    return supabaseInstance;
  } catch (err) {
    console.error("Gagal inisialisasi Supabase client:", err);
    return null;
  }
}

export function resetSupabaseClient(newUrl: string, newKey: string) {
  const cleanUrl = normalizeSupabaseUrl(newUrl);
  if (typeof window !== "undefined") {
    localStorage.setItem("supabase_url", cleanUrl);
    localStorage.setItem("supabase_anon_key", newKey.trim());
    localStorage.removeItem("supabase_disconnected");
  }
  supabaseInstance = null;
  return getSupabaseClient();
}

/**
 * Row mappers for consistent synchronization
 */
export function mapProfileToRow(p: FoundationProfile) {
  return {
    id: p.id || "fnd-01",
    name: p.name || "",
    legal_number: p.legalNumber || null,
    registration_no: p.registrationNo || null,
    address: p.address || null,
    phone: p.phone || null,
    email: p.email || null,
    leader_name: p.leaderName || null,
    admin_name: p.adminName || null,
    logo_url: p.logoUrl || null,
    established_year: p.establishedYear ? Number(p.establishedYear) : 2015,
    vision: p.vision || null,
    mission: p.mission || null,
    updated_at: new Date().toISOString()
  };
}

export function mapAssetToRow(a: AssetItem) {
  return {
    id: a.id,
    code: a.code || "",
    name: a.name || "",
    category: a.category || "Lainnya",
    acquisition_date: a.acquisitionDate || null,
    acquisition_cost: Number(a.acquisitionCost) || 0,
    current_value: Number(a.currentValue) || 0,
    quantity: Number(a.quantity) || 1,
    unit: a.unit || "Unit",
    condition: a.condition || "Baik",
    location: a.location || "",
    custodian: a.custodian || "",
    notes: a.notes || null,
    last_audit_date: a.lastAuditDate || a.acquisitionDate || new Date().toISOString().split("T")[0],
    status: a.status || "Aktif",
    legal_doc_type: a.legalDocType || null,
    legal_doc_number: a.legalDocNumber || null,
    original_owner: a.originalOwner || null,
    registered_owner: a.registeredOwner || null,
    transfer_status: a.transferStatus || null,
    land_area: a.landArea ? Number(a.landArea) : null,
    building_area: a.buildingArea ? Number(a.buildingArea) : null,
    license_plate: a.licensePlate || null,
    chassis_number: a.chassisNumber || null,
    source_of_fund: a.sourceOfFund || null,
    district: a.district || null,
    village: a.village || null,
    usage_purpose: a.usagePurpose || null,
    archive_storage_location: a.archiveStorageLocation || null,
    vehicle_type: a.vehicleType || null,
    vehicle_brand: a.vehicleBrand || null,
    vehicle_year: a.vehicleYear ? Number(a.vehicleYear) : null,
    tax_day: a.taxDay || null,
    tax_month: a.taxMonth || null,
    pbg_number: a.pbgNumber || null,
    slf_number: a.slfNumber || null,
    pdf_certificate_scan: a.pdfCertificateScan || null,
    bpkb_scan: a.bpkbScan || null
  };
}

export function mapEmployeeToRow(e: EmployeeItem) {
  return {
    id: e.id,
    nip: e.nip || "",
    name: e.name || "",
    role: e.role || "",
    position_title: e.positionTitle || e.role || null,
    unit: e.unit || "Kantor Yayasan",
    employment_status: e.employmentStatus || "Tetap (PNS/GTY)",
    join_date: e.joinDate || null,
    education: e.education || null,
    monthly_salary: Number(e.monthlySalary) || 0,
    performance_score: e.performanceScore !== undefined && e.performanceScore !== null ? Number(e.performanceScore) : null,
    attendance_rate: e.attendanceRate !== undefined && e.attendanceRate !== null ? Number(e.attendanceRate) : null,
    phone: e.phone || null,
    email: e.email || null,
    is_active: e.isActive ?? true
  };
}

export function mapStudentToRow(s: StudentItem) {
  return {
    id: s.id,
    nis: s.nis || "",
    nisn: s.nisn || "",
    name: s.name || "",
    gender: s.gender === "P" ? "P" : "L",
    education_level: s.educationLevel || "SDIT",
    class_grade: s.classGrade || "Kelas 1",
    academic_year: s.academicYear || "2025/2026",
    status: s.status || "Aktif",
    category: s.category || "Reguler",
    parent_name: s.parentName || null,
    parent_phone: s.parentPhone || null,
    address: s.address || null,
    tuition_status: s.tuitionStatus || "Lunas",
    average_grade: s.averageGrade ? Number(s.averageGrade) : 85,
    achievements_count: s.achievementsCount ? Number(s.achievementsCount) : 0,
    notes: s.notes || null,
    graduation_year: s.graduationYear || null,
    current_activity: s.currentActivity || null,
    alumni_phone: s.alumniPhone || null,
    alumni_email: s.alumniEmail || null
  };
}

export function mapDonationToRow(d: DonationRecord) {
  return {
    id: d.id,
    donator_name: d.donatorName || "",
    category: d.category || "Umum",
    amount: Number(d.amount) || 0,
    date: d.date || new Date().toISOString().split("T")[0],
    receiver_name: d.receiverName || "",
    notes: d.notes || null
  };
}

export function mapTransferToRow(t: AssetTransferRecord) {
  return {
    id: t.id,
    asset_id: t.assetId || null,
    asset_code: t.assetCode || null,
    asset_name: t.assetName || "",
    category: t.category || "Lainnya",
    from_owner: t.fromOwner || null,
    to_owner: t.toOwner || "",
    doc_type: t.docType || "Lainnya",
    doc_number: t.docNumber || null,
    notary_office: t.notaryOffice || null,
    submission_date: t.submissionDate || new Date().toISOString().split("T")[0],
    target_date: t.targetDate || new Date().toISOString().split("T")[0],
    completion_date: t.completionDate || null,
    status: t.status || "Diajukan",
    progress_percent: Number(t.progressPercent) || 0,
    estimated_cost: Number(t.estimatedCost) || 0,
    handler_name: t.handlerName || "",
    notes: t.notes || null,
    logs: Array.isArray(t.logs) ? t.logs : []
  };
}

/**
 * Resilient Upsert helper with auto-retries for network glitches
 */
export async function resilientUpsert(
  client: SupabaseClient,
  table: string,
  rows: any[],
  onConflict: string = "id",
  maxRetries: number = 3
): Promise<{ success: boolean; error?: any }> {
  let lastError: any = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { error } = await client.from(table).upsert(rows, { onConflict });
      if (!error) {
        return { success: true };
      }
      lastError = error;
      const errorMsg = String(error.message || "");
      const isTransient = 
        errorMsg.includes("Failed to fetch") || 
        errorMsg.includes("NetworkError") ||
        errorMsg.includes("timeout") ||
        errorMsg.includes("abort") ||
        error.code === "PGRST000";

      if (isTransient && attempt < maxRetries) {
        // Wait and retry
        await new Promise(r => setTimeout(r, 600 * attempt));
        continue;
      }
      break;
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 600 * attempt));
        continue;
      }
      break;
    }
  }
  return { success: false, error: lastError };
}

/**
 * Instant Single-Entity Upserts for Real-Time Synchronization
 */
export async function upsertAssetToSupabase(asset: AssetItem): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseAutoSyncEnabled()) return false;
  try {
    const row = mapAssetToRow(asset);
    const { error } = await client.from("assets").upsert(row, { onConflict: "id" });
    if (error) {
      console.warn("Supabase upsert asset warning:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("upsertAssetToSupabase error:", err);
    return false;
  }
}

export async function upsertEmployeeToSupabase(employee: EmployeeItem): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseAutoSyncEnabled()) return false;
  try {
    const row = mapEmployeeToRow(employee);
    const { error } = await client.from("employees").upsert(row, { onConflict: "id" });
    if (error) {
      console.warn("Supabase upsert employee warning:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("upsertEmployeeToSupabase error:", err);
    return false;
  }
}

export async function upsertStudentToSupabase(student: StudentItem): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseAutoSyncEnabled()) return false;
  try {
    const row = mapStudentToRow(student);
    const { error } = await client.from("students").upsert(row, { onConflict: "id" });
    if (error) {
      console.warn("Supabase upsert student warning:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("upsertStudentToSupabase error:", err);
    return false;
  }
}

export async function upsertDonationToSupabase(donation: DonationRecord): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseAutoSyncEnabled()) return false;
  try {
    const row = mapDonationToRow(donation);
    const { error } = await client.from("donations").upsert(row, { onConflict: "id" });
    if (error) {
      console.warn("Supabase upsert donation warning:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("upsertDonationToSupabase error:", err);
    return false;
  }
}

export async function upsertProfileToSupabase(profile: FoundationProfile): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseAutoSyncEnabled()) return false;
  try {
    const row = mapProfileToRow(profile);
    const { error } = await client.from("foundation_profile").upsert(row, { onConflict: "id" });
    if (error) {
      console.warn("Supabase upsert profile warning:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("upsertProfileToSupabase error:", err);
    return false;
  }
}

export async function upsertTransferToSupabase(transfer: AssetTransferRecord): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseAutoSyncEnabled()) return false;
  try {
    const row = mapTransferToRow(transfer);
    const { error } = await client.from("asset_transfers").upsert(row, { onConflict: "id" });
    if (error) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Uji koneksi ke Supabase
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; tablesExist?: boolean }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: "URL atau API Key Supabase belum dikonfigurasi." };
  }

  try {
    // Check if we can reach Supabase auth endpoint
    const { error: authError } = await client.auth.getSession();
    if (authError) {
      return { success: false, message: `Koneksi ditolak: ${authError.message}` };
    }

    // Check if 'assets' table exists
    const { error: tableError } = await client.from("assets").select("id").limit(1);

    if (tableError) {
      if (tableError.code === "42P01" || tableError.message.includes("does not exist") || tableError.message.includes("not find the relation")) {
        return {
          success: true,
          tablesExist: false,
          message: "Terhubung ke Supabase! Namun tabel database belum dibuat. Silakan salin & jalankan skrip SQL di SQL Editor Supabase."
        };
      }
      if (tableError.message.includes("permission denied")) {
        return {
          success: false,
          tablesExist: true,
          message: "Tabel ada, tetapi 'permission denied'. Jalankan skrip 'GRANT ALL' di SQL Editor Supabase agar API Key anon diizinkan mengisi data."
        };
      }
      return {
        success: true,
        tablesExist: false,
        message: `Terhubung ke Supabase (Info tabel: ${tableError.message})`
      };
    }

    return {
      success: true,
      tablesExist: true,
      message: "Berhasil terhubung ke Supabase dan tabel database siap digunakan!"
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menghubungi server Supabase: ${err.message || err}`
    };
  }
}

/**
 * Unggah seluruh data lokal ke Supabase (Upload / Sync Up)
 */
export async function pushAllDataToSupabase(data: DatabaseStore): Promise<{ 
  success: boolean; 
  message: string; 
  details?: Record<string, number>;
  partialErrors?: string[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: "Koneksi Supabase belum terkonfigurasi." };
  }

  try {
    const summary: Record<string, number> = {};
    const errors: string[] = [];

    // 1. Profile Yayasan
    if (data.profile) {
      const pRow = mapProfileToRow(data.profile);
      const res = await resilientUpsert(client, "foundation_profile", [pRow]);
      if (!res.success) {
        errors.push(`Profil: ${res.error?.message || "Gagal menyimpan"}`);
      } else {
        summary.profile = 1;
      }
    }

    // 2. Aset (kirim per batch 25 agar tidak memicu timeout jaringan)
    if (data.assets && data.assets.length > 0) {
      const assetRows = data.assets.map(mapAssetToRow);
      let assetOk = 0;
      for (let i = 0; i < assetRows.length; i += 25) {
        const chunk = assetRows.slice(i, i + 25);
        const res = await resilientUpsert(client, "assets", chunk);
        if (!res.success) {
          errors.push(`Aset: ${res.error?.message || "Gagal menyimpan"}`);
        } else {
          assetOk += chunk.length;
        }
      }
      summary.assets = assetOk;
    }

    // 3. Pegawai (kirim per batch 25)
    if (data.employees && data.employees.length > 0) {
      const empRows = data.employees.map(mapEmployeeToRow);
      let empOk = 0;
      for (let i = 0; i < empRows.length; i += 25) {
        const chunk = empRows.slice(i, i + 25);
        const res = await resilientUpsert(client, "employees", chunk);
        if (!res.success) {
          errors.push(`Pegawai: ${res.error?.message || "Gagal menyimpan"}`);
        } else {
          empOk += chunk.length;
        }
      }
      summary.employees = empOk;
    }

    // 4. Siswa (kirim per batch 25)
    if (data.students && data.students.length > 0) {
      const studentRows = data.students.map(mapStudentToRow);
      let stdOk = 0;
      for (let i = 0; i < studentRows.length; i += 25) {
        const chunk = studentRows.slice(i, i + 25);
        const res = await resilientUpsert(client, "students", chunk);
        if (!res.success) {
          errors.push(`Siswa: ${res.error?.message || "Gagal menyimpan"}`);
        } else {
          stdOk += chunk.length;
        }
      }
      summary.students = stdOk;
    }

    // 5. Donasi (kirim per batch 25)
    if (data.donations && data.donations.length > 0) {
      const donationRows = data.donations.map(mapDonationToRow);
      let donOk = 0;
      for (let i = 0; i < donationRows.length; i += 25) {
        const chunk = donationRows.slice(i, i + 25);
        const res = await resilientUpsert(client, "donations", chunk);
        if (!res.success) {
          errors.push(`Donasi: ${res.error?.message || "Gagal menyimpan"}`);
        } else {
          donOk += chunk.length;
        }
      }
      summary.donations = donOk;
    }

    // 6. Mutasi & Balik Nama
    if (data.assetTransfers && data.assetTransfers.length > 0) {
      try {
        const transferRows = data.assetTransfers.map(mapTransferToRow);
        const res = await resilientUpsert(client, "asset_transfers", transferRows);
        if (res.success) {
          summary.transfers = transferRows.length;
        }
      } catch {
        // optional table
      }
    }

    if (errors.length === 0) {
      return {
        success: true,
        message: `Sinkronisasi sukses! Data tersimpan di Supabase Cloud: ${summary.assets || 0} Aset, ${summary.employees || 0} Pegawai, ${summary.students || 0} Siswa, ${summary.donations || 0} Donasi.`,
        details: summary
      };
    } else if (Object.keys(summary).length > 0) {
      return {
        success: true,
        message: `Sebagian data berhasil disinkronkan (${summary.assets || 0} Aset, ${summary.employees || 0} Pegawai, ${summary.students || 0} Siswa). Beberapa data tertunda: ${errors[0]}`,
        details: summary,
        partialErrors: errors
      };
    } else {
      return {
        success: false,
        message: `Sinkronisasi tertunda: ${errors[0] || "Kendala jaringan internet ke Supabase"}. Silakan periksa koneksi lalu coba lagi.`,
        partialErrors: errors
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Koneksi Supabase terganggu: ${err.message || err}. Silakan coba lagi.`
    };
  }
}

/**
 * Tarik seluruh data dari Supabase (Download / Sync Down)
 */
export async function pullAllDataFromSupabase(): Promise<{ success: boolean; data?: Partial<DatabaseStore>; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: "Supabase client belum siap." };
  }

  try {
    const result: Partial<DatabaseStore> = {};

    // 1. Profile
    const { data: pData } = await client.from("foundation_profile").select("*").limit(1);
    if (pData && pData.length > 0) {
      const p = pData[0];
      result.profile = {
        id: p.id,
        name: p.name || "",
        legalNumber: p.legal_number || "",
        registrationNo: p.registration_no || "",
        address: p.address || "",
        phone: p.phone || "",
        email: p.email || "",
        leaderName: p.leader_name || "",
        adminName: p.admin_name || "",
        logoUrl: p.logo_url || "",
        establishedYear: p.established_year || 2015,
        vision: p.vision || "",
        mission: p.mission || ""
      };
    }

    // 2. Aset
    const { data: aData, error: aErr } = await client.from("assets").select("*").order("name", { ascending: true });
    if (!aErr && aData) {
      result.assets = aData.map((a: any): AssetItem => ({
        id: a.id,
        code: a.code,
        name: a.name,
        category: a.category,
        acquisitionDate: a.acquisition_date,
        acquisitionCost: Number(a.acquisition_cost || 0),
        currentValue: Number(a.current_value || 0),
        quantity: Number(a.quantity || 1),
        unit: a.unit,
        condition: a.condition,
        location: a.location,
        custodian: a.custodian,
        notes: a.notes || "",
        lastAuditDate: a.last_audit_date || a.acquisition_date || new Date().toISOString().split("T")[0],
        status: a.status,
        legalDocType: a.legal_doc_type || undefined,
        legalDocNumber: a.legal_doc_number || undefined,
        originalOwner: a.original_owner || undefined,
        registeredOwner: a.registered_owner || undefined,
        transferStatus: a.transfer_status || undefined,
        landArea: a.land_area ? Number(a.land_area) : undefined,
        buildingArea: a.building_area ? Number(a.building_area) : undefined,
        licensePlate: a.license_plate || undefined,
        chassisNumber: a.chassis_number || undefined,
        sourceOfFund: a.source_of_fund || undefined,
        district: a.district || undefined,
        village: a.village || undefined,
        usagePurpose: a.usage_purpose || undefined,
        archiveStorageLocation: a.archive_storage_location || undefined,
        vehicleType: a.vehicle_type || undefined,
        vehicleBrand: a.vehicle_brand || undefined,
        vehicleYear: a.vehicle_year ? Number(a.vehicle_year) : undefined,
        taxDay: a.tax_day || undefined,
        taxMonth: a.tax_month || undefined,
        pbgNumber: a.pbg_number || undefined,
        slfNumber: a.slf_number || undefined,
        pdfCertificateScan: a.pdf_certificate_scan || undefined,
        bpkbScan: a.bpkb_scan || undefined
      }));
    }

    // 3. Pegawai
    const { data: eData, error: eErr } = await client.from("employees").select("*").order("name", { ascending: true });
    if (!eErr && eData) {
      result.employees = eData.map((e: any): EmployeeItem => ({
        id: e.id,
        nip: e.nip,
        name: e.name,
        role: e.role,
        positionTitle: e.position_title || e.role,
        unit: e.unit,
        employmentStatus: e.employment_status || "Tetap (PNS/GTY)",
        joinDate: e.join_date || "2020-01-01",
        education: e.education || "S1",
        monthlySalary: Number(e.monthly_salary || 0),
        performanceScore: e.performance_score !== null && e.performance_score !== undefined ? Number(e.performance_score) : undefined,
        attendanceRate: e.attendance_rate !== null && e.attendance_rate !== undefined ? Number(e.attendance_rate) : undefined,
        phone: e.phone || "",
        email: e.email || "",
        isActive: e.is_active ?? true
      }));
    }

    // 4. Siswa
    const { data: sData, error: sErr } = await client.from("students").select("*").order("name", { ascending: true });
    if (!sErr && sData) {
      result.students = sData.map((s: any): StudentItem => ({
        id: s.id,
        nis: s.nis,
        nisn: s.nisn,
        name: s.name,
        gender: s.gender === "P" ? "P" : "L",
        educationLevel: s.education_level || "SDIT",
        classGrade: s.class_grade || "Kelas 1",
        academicYear: s.academic_year || "2025/2026",
        status: s.status || "Aktif",
        category: s.category || "Reguler",
        parentName: s.parent_name || "",
        parentPhone: s.parent_phone || "",
        address: s.address || "",
        tuitionStatus: s.tuition_status || "Lunas",
        averageGrade: Number(s.average_grade || 85),
        achievementsCount: Number(s.achievements_count || 0),
        notes: s.notes || "",
        graduationYear: s.graduation_year || undefined,
        currentActivity: s.current_activity || undefined,
        alumniPhone: s.alumni_phone || undefined,
        alumniEmail: s.alumni_email || undefined
      }));
    }

    // 5. Donasi
    const { data: dData, error: dErr } = await client.from("donations").select("*").order("date", { ascending: false });
    if (!dErr && dData) {
      result.donations = dData.map((d: any): DonationRecord => ({
        id: d.id,
        donatorName: d.donator_name,
        category: d.category,
        amount: Number(d.amount || 0),
        date: d.date || new Date().toISOString().split("T")[0],
        receiverName: d.receiver_name || "",
        notes: d.notes || ""
      }));
    }

    // 6. Mutasi & Balik Nama
    try {
      const { data: tData, error: tErr } = await client.from("asset_transfers").select("*").order("submission_date", { ascending: false });
      if (!tErr && tData) {
        result.assetTransfers = tData.map((t: any): AssetTransferRecord => ({
          id: t.id,
          assetId: t.asset_id || undefined,
          assetCode: t.asset_code || undefined,
          assetName: t.asset_name,
          category: t.category,
          fromOwner: t.from_owner || undefined,
          toOwner: t.to_owner,
          docType: t.doc_type,
          docNumber: t.doc_number || undefined,
          notaryOffice: t.notary_office || undefined,
          submissionDate: t.submission_date,
          targetDate: t.target_date,
          completionDate: t.completion_date || undefined,
          status: t.status,
          progressPercent: Number(t.progress_percent || 0),
          estimatedCost: Number(t.estimated_cost || 0),
          handlerName: t.handler_name,
          notes: t.notes || "",
          logs: Array.isArray(t.logs) ? t.logs : []
        }));
      }
    } catch {
      // ignore
    }

    return {
      success: true,
      data: result,
      message: `Data berhasil ditarik dari Supabase! (${result.assets?.length || 0} Aset, ${result.employees?.length || 0} Pegawai, ${result.students?.length || 0} Siswa)`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menarik data dari Supabase: ${err.message || err}`
    };
  }
}

/**
 * Hapus 1 baris record dari Supabase secara langsung berdasarkan ID
 */
export async function deleteItemFromSupabase(tableName: string, id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from(tableName).delete().eq("id", id);
    if (error) {
      console.warn(`Gagal menghapus ${id} dari ${tableName} di Supabase:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("deleteItemFromSupabase error:", err);
    return false;
  }
}

/**
 * Skrip SQL lengkap untuk membuat tabel & RLS di SQL Editor Supabase
 */
export const SUPABASE_SCHEMA_SQL = `-- ==========================================================
-- SKRIP IZIN & TABEL SUPABASE (JALANKAN DI SQL EDITOR)
-- 1. Buka icon SQL Editor (>_) di menu kiri Supabase Anda
-- 2. Tempel (Paste) skrip ini lalu klik RUN (hijau)
-- ==========================================================

-- 1. BERIKAN HAK AKSES PENUH KE ROLE ANON & AUTHENTICATED (Atasi 'permission denied')
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- 2. Tabel Profil Lembaga Yayasan
CREATE TABLE IF NOT EXISTS public.foundation_profile (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  legal_number TEXT,
  registration_no TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  leader_name TEXT,
  admin_name TEXT,
  logo_url TEXT,
  established_year INTEGER,
  vision TEXT,
  mission TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Aset & Inventaris
CREATE TABLE IF NOT EXISTS public.assets (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  acquisition_date TEXT,
  acquisition_cost NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  quantity NUMERIC DEFAULT 1,
  unit TEXT,
  condition TEXT,
  location TEXT,
  custodian TEXT,
  notes TEXT,
  last_audit_date TEXT,
  status TEXT,
  legal_doc_type TEXT,
  legal_doc_number TEXT,
  original_owner TEXT,
  registered_owner TEXT,
  transfer_status TEXT,
  land_area NUMERIC,
  building_area NUMERIC,
  source_of_fund TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Pegawai, Guru & Tenaga Kependidikan
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  nip TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  position_title TEXT,
  unit TEXT NOT NULL,
  employment_status TEXT,
  join_date TEXT,
  education TEXT,
  monthly_salary NUMERIC DEFAULT 0,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Peserta Didik / Santri
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  nis TEXT NOT NULL,
  nisn TEXT,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  education_level TEXT NOT NULL,
  class_grade TEXT NOT NULL,
  academic_year TEXT,
  status TEXT DEFAULT 'Aktif',
  category TEXT DEFAULT 'Reguler',
  parent_name TEXT,
  parent_phone TEXT,
  address TEXT,
  tuition_status TEXT DEFAULT 'Lunas',
  average_grade NUMERIC DEFAULT 85,
  achievements_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Donasi & Infaq
CREATE TABLE IF NOT EXISTS public.donations (
  id TEXT PRIMARY KEY,
  donator_name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  date TEXT,
  receiver_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NONAKTIFKAN RLS AGAR API KEY DAPAT MENYIMPAN & MEMBACA DATA SECARA LANGSUNG
ALTER TABLE IF EXISTS public.foundation_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.foundation_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.asset_borrows DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.asset_transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.asset_transfer_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;
`;
