export type AssetCategory = 
  | 'Tanah' 
  | 'Kendaraan' 
  | 'Bangunan';

export type AssetCondition = 'Baik' | 'Rusak Ringan' | 'Rusak Berat' | 'Dalam Perbaikan';

export type AssetStatus = 'Aktif' | 'Dipinjam' | 'Dihapusbukukan' | 'Perlu Pemeliharaan';

export type AssetLegalDocType = 
  | 'Sertifikat Hak Milik (SHM)' 
  | 'Sertifikat Hak Guna Bangunan (HGB)' 
  | 'Akta Ikrar Wakaf (AIW)' 
  | 'Surat Girik / Letter C' 
  | 'BPKB & STNK' 
  | 'Faktur / Nota Resmi' 
  | 'Surat Perjanjian Sewa'
  | 'Lainnya';

export type AssetTransferStatus = 
  | 'Selesai Balik Nama (a.n. Yayasan)' 
  | 'Dalam Proses BPN / Notaris' 
  | 'Verifikasi Dokumen & Pengukuran' 
  | 'Belum Balik Nama (a.n. Pemilik Lama/Pewakif)' 
  | 'Tidak Perlu Balik Nama';

export interface AssetItem {
  id: string;
  code: string;
  name: string;
  category: AssetCategory;
  acquisitionDate: string;
  acquisitionCost: number;
  currentValue: number;
  quantity: number;
  unit: string;
  condition: AssetCondition;
  location: string;
  custodian: string;
  notes: string;
  lastAuditDate: string;
  status: AssetStatus;
  
  // Detailed fields
  legalDocType?: AssetLegalDocType;
  legalDocNumber?: string;
  originalOwner?: string; // Nama pemilik asal / pewakif
  registeredOwner?: string; // Atas nama saat ini
  transferStatus?: AssetTransferStatus;
  landArea?: number; // Luas tanah dalam m2
  buildingArea?: number; // Luas bangunan dalam m2
  licensePlate?: string; // No Polisi jika kendaraan
  chassisNumber?: string; // No Rangka / Mesin jika kendaraan / peralatan
  sourceOfFund?: 'Wakaf' | 'Hibah' | 'Kas Yayasan' | 'Bantuan Pemerintah / CSR' | 'Infaq / Shadaqah';
  
  // Specific Form Fields
  district?: string; // Kecamatan
  village?: string; // Desa / Kelurahan
  usagePurpose?: string; // Penggunaan / Fungsi
  archiveStorageLocation?: string; // Tempat Simpan Berkas Asli
  vehicleType?: string; // MOTOR, MOBIL, etc.
  vehicleBrand?: string; // Merk / Tipe
  vehicleYear?: number | string; // Tahun Pembuatan
  taxDay?: number | string; // Hari / Tanggal Pajak (1-31)
  taxMonth?: string; // Nama Bulan Pajak
  pbgNumber?: string; // Nomor PBG (IMB Lama)
  slfNumber?: string; // Nomor SLF (Laik Fungsi)
  pdfCertificateScan?: string; // Nama file / data scan PDF Sertifikat Tanah
  bpkbScan?: string; // Nama file / data scan BPKB Kendaraan
}

export interface AssetTransferLogItem {
  id: string;
  date: string;
  description: string;
  cost: number;
}

export interface AssetTransferRecord {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  category: AssetCategory;
  fromOwner: string; // Pemilik Asal / Pewakif (misal: Suparminto)
  toOwner: string; // Atas Nama Baru (misal: YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN)
  docType: AssetLegalDocType;
  docNumber: string;
  notaryOffice: string; // Kantor Notaris / PPAT / BPN / KUA
  submissionDate: string; // Tanggal Mulai / Pengajuan
  targetDate: string;
  completionDate?: string;
  status: 'Verifikasi Dokumen' | 'Pengukuran & Pengecekan' | 'Proses BPN / Notaris' | 'Selesai / Terbit Sertifikat' | 'Tertunda';
  progressPercent: number; // 0-100
  estimatedCost: number; // Total Biaya / Estimasi Biaya
  handlerName: string; // Staf / Admin yang mengawal
  notes: string; // Catatan Info Utama
  logs?: AssetTransferLogItem[]; // Rincian Log Progres & Biaya tiap proses
}

export interface AssetBorrowRecord {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  docTitle: string; // misal: Sertifikat Asli SHM No. 441, BPKB Asli Mobil HiAce
  docNumber: string;
  borrowerName: string;
  borrowerRole: string; // misal: Notaris Hj. Ratna, Kepala Sekolah SMA, Pengurus Keuangan
  borrowerPhone: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  purpose: string; // Keperluan peminjaman
  status: 'Dipinjam' | 'Dikembalikan' | 'Terlambat';
  approvedBy: string;
  handoverOfficer?: string; // Petugas penyerah fisik berkas
  photoProof?: string; // Foto bukti serah terima / tanda terima dokumen
  notes?: string;
}

export type AssetSubMenu = 'input' | 'view-search' | 'transfer-title' | 'borrow-docs' | 'export';

export type EmployeeRole = 
  | 'Guru / Pendidik' 
  | 'Tenaga Administrasi' 
  | 'Staf Keuangan' 
  | 'Pengurus Yayasan' 
  | 'Kepala Unit / Sekolah' 
  | 'Tenaga Kebersihan & Keamanan' 
  | 'IT Support';

export type EmploymentStatus = 'Tetap (PNS/GTY)' | 'Kontrak (GTT/PTT)' | 'Honorer' | 'Magang / Relawan';

export type UnitDivision = 
  | 'Kantor Yayasan' 
  | 'Unit RA / TK' 
  | 'Unit SD / MI' 
  | 'Unit SMP / MTs' 
  | 'Unit SMA / SMK' 
  | 'Unit Pondok Pesantren';

export interface EmployeeItem {
  id: string;
  nip: string;
  name: string;
  role: EmployeeRole;
  employmentStatus: EmploymentStatus;
  unit: UnitDivision;
  phone: string;
  email: string;
  education: 'SMA/SMK' | 'D3' | 'S1' | 'S2' | 'S3';
  joinDate: string;
  monthlySalary: number;
  performanceScore?: number; // 1-100 (opsional)
  attendanceRate?: number; // e.g. 98.5% (opsional)
  isActive: boolean;
  positionTitle: string;
}

export type EducationLevel = 'RA' | 'SDIT' | 'SMP' | 'SMA';

export type StudentSubMenu = 'ALL' | 'RA' | 'SDIT' | 'SMP' | 'SMA';

export type EmployeeSubMenu = 'ALL' | 'Kantor Yayasan' | 'Unit RA / TK' | 'Unit SD / MI' | 'Unit SMP / MTs' | 'Unit SMA / SMK' | 'Unit Pondok Pesantren';

export type StudentCategory = 'Reguler' | 'Beasiswa Yatim/Dhuafa' | 'Beasiswa Prestasi' | 'Asrama / Santri Mukim';

export type TuitionStatus = 'Lunas' | 'Menunggak' | 'Gratis (Beasiswa)';

export interface StudentItem {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  educationLevel: EducationLevel;
  classGrade: string;
  academicYear: string;
  status: 'Aktif' | 'Lulus' | 'Pindah / Mutasi' | 'Cuti / Nonaktif';
  category: StudentCategory;
  parentName: string;
  parentPhone: string;
  tuitionStatus: TuitionStatus;
  averageGrade: number;
  achievementsCount: number;
  address?: string;
  notes?: string;
  graduationYear?: string; // Tahun Kelulusan, contoh: "2024/2025" atau "2025"
  currentActivity?: string; // Studi lanjut / kampus / sekolah lanjutan / pekerjaan saat ini
  alumniPhone?: string; // Kontak pribadi alumni
  alumniEmail?: string; // Email alumni
}

export interface AdminDailyLog {
  id: string;
  date: string;
  activity: string;
  category: 'Penginputan Data' | 'Rekonsiliasi Aset' | 'Pelayanan Pegawai' | 'Administrasi Siswa' | 'Sinkronisasi Sistem' | 'Rapat & Koordinasi';
  durationHours: number;
  status: 'Selesai' | 'Dalam Proses' | 'Pending';
  evidenceNote?: string;
}

export interface AdminMilestone {
  id: string;
  title: string;
  targetDate: string;
  status: 'Tercapai' | 'Berjalan' | 'Tertunda';
  progress: number; // 0-100
}

export interface AdminPerformanceReport {
  id: string;
  period: string;
  reportDate: string;
  adminName: string;
  roleTitle: string;
  tasksCompleted: number;
  tasksTotal: number;
  kpiScores: {
    dataAccuracy: number;
    syncPunctuality: number;
    assetManagement: number;
    serviceResponse: number;
    reportFulfillment: number;
  };
  overallRating: number;
  dailyLogs: AdminDailyLog[];
  milestones: AdminMilestone[];
  keyAchievements: string[];
  challengesAndSolutions: string;
  recommendations: string;
}

export interface FoundationProfile {
  id: string;
  name: string;
  legalNumber: string;
  registrationNo: string;
  address: string;
  phone: string;
  email: string;
  leaderName: string;
  adminName: string;
  logoUrl: string;
  establishedYear: number;
  vision: string;
  mission: string;
}

export interface SyncHistoryItem {
  id: string;
  timestamp: string;
  status: 'success' | 'failed' | 'in_progress';
  changesCount: number;
  type: 'Aset' | 'Pegawai' | 'Peserta Didik' | 'Laporan Kinerja' | 'Konfigurasi' | 'Full Sync';
  message: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC' | 'EXPORT' | 'AI_REPORT';
  entityType: 'Aset' | 'Pegawai' | 'Peserta Didik' | 'Kinerja Admin' | 'Sistem';
  details: string;
}


export type DonationCategory = 'Uang Tunai' | 'Barang' | 'Sembako' | 'Material Bangunan' | 'Lainnya';

export interface DonationRecord {
  id: string;
  date: string;
  donatorName: string;
  donatorContact?: string;
  category: DonationCategory;
  amount?: number;
  itemDescription?: string;
  quantity?: string;
  receiverName: string;
  notes?: string;
}


export type MeetingCategory = 'Rapat Pembina' | 'Rapat Pengurus' | 'Musyawarah Yayasan' | 'Lainnya';

export interface MeetingRecord {
  id: string;
  date: string;
  title: string;
  category: MeetingCategory;
  leader: string;
  participants: string;
  description: string[];
  followUp: string[];
  followUpStatuses?: ('Selesai' | 'Dalam Proses' | 'Belum Dimulai')[];
  status: 'Selesai' | 'Dalam Proses' | 'Belum Dimulai';
}

export interface SheetsConfig {
  webAppUrl: string;
  sheetDocUrl?: string;
  autoSync?: boolean;
  lastSyncedAt?: string;
}

export interface DatabaseStore {
  donations: DonationRecord[];
  profile: FoundationProfile;
  assets: AssetItem[];
  assetTransfers: AssetTransferRecord[];
  borrowedDocs: AssetBorrowRecord[];
  employees: EmployeeItem[];
  students: StudentItem[];
  adminReport: AdminPerformanceReport;
  syncHistory: SyncHistoryItem[];
  auditLogs: AuditLogItem[];
  meetings: MeetingRecord[];
  sheetsConfig?: SheetsConfig;
}

export type ActiveTab = 'dashboard' | 'assets' | 'employees' | 'students' | 'alumni' | 'donations' | 'meetings' | 'admin-performance' | 'ai-assistant' | 'settings';
