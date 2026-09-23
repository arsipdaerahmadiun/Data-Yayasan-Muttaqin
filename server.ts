import express from "express";
import path from "path";
import fs from "fs";

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Server-side data directory for durable persistence
const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "foundation_db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial mock dataset if database file doesn't exist
const INITIAL_DATABASE = {
  profile: {
    id: "fnd-01",
    name: "Yayasan Bina Insan Mandiri Terpadu",
    legalNumber: "AHU-0014289.AH.01.04.Tahun 2019",
    registrationNo: "REG-YAS-2019-0941",
    address: "Jl. Pendidikan Mandiri No. 45, Kompleks Islamic Center, Jakarta Timur",
    phone: "(021) 8490-2134 / 0812-8899-7721",
    email: "sekretariat@binainsanmandiri.org",
    leaderName: "Drs. H. Ahmad Fauzan, M.Pd.",
    adminName: "Fahmi Maulana Dwi, S.Kom.",
    logoUrl: "",
    establishedYear: 2015,
    vision: "Mewujudkan lembaga pendidikan dan sosial Islam yang unggul, berkarakter, mandiri, dan berdaya saing global.",
    mission: "Menyelenggarakan tata kelola yayasan yang transparan, akuntabel, modern serta mengoptimalkan sumber daya aset dan SDM secara terintegrasi."
  },
  assets: [
    {
      id: "ast-001",
      code: "AST-TNH-01",
      name: "Tanah Wakaf & Kampus Terpadu 1",
      category: "Tanah",
      acquisitionDate: "2016-04-15",
      acquisitionCost: 1500000000,
      currentValue: 2450000000,
      quantity: 1250,
      unit: "M2",
      condition: "Baik",
      location: "Kampus Utama - Blok Timur",
      custodian: "H. Ridwan Santoso (Div. Sarpras)",
      notes: "Sertifikat Hak Milik Wakaf No. 441. Legalitas lengkap dan terdaftar BPN.",
      lastAuditDate: "2026-08-15",
      status: "Aktif"
    },
    {
      id: "ast-002",
      code: "AST-GDG-01",
      name: "Gedung Pembelajaran 3 Lantai (Gedung Utama)",
      category: "Bangunan",
      acquisitionDate: "2018-08-20",
      acquisitionCost: 2800000000,
      currentValue: 3600000000,
      quantity: 18,
      unit: "Ruang Kelas",
      condition: "Baik",
      location: "Kampus Utama Blok A & B",
      custodian: "Ustadz Budi Utomo (Sarpras)",
      notes: "Kapasitas 18 ruang kelas, 1 lab komputer, 1 ruang multimedia. PBG lengkap.",
      lastAuditDate: "2026-08-20",
      status: "Aktif"
    },
    {
      id: "ast-003",
      code: "AST-KND-01",
      name: "Mobil Minibus HiAce Operasional Yayasan",
      category: "Kendaraan",
      acquisitionDate: "2022-01-10",
      acquisitionCost: 520000000,
      currentValue: 380000000,
      quantity: 1,
      unit: "Unit",
      condition: "Baik",
      location: "Garasi Yayasan",
      custodian: "Pak Joko Suwandi (Driver Operasional)",
      notes: "Plat B 1928 TYA. BPKB & STNK resmi a.n. Yayasan.",
      lastAuditDate: "2026-08-10",
      status: "Aktif"
    },
    {
      id: "ast-004",
      code: "AST-KND-02",
      name: "Mobil Ambulans Layanan Ummat & Medis Siaga",
      category: "Kendaraan",
      acquisitionDate: "2023-05-18",
      acquisitionCost: 320000000,
      currentValue: 280000000,
      quantity: 1,
      unit: "Unit",
      condition: "Baik",
      location: "Posko Layanan Ummat & Kesehatan",
      custodian: "Unit Ambulans & Layanan Ummat",
      notes: "Plat B 9112 YSN. Dilengkapi peralatan medis darurat.",
      lastAuditDate: "2026-08-20",
      status: "Aktif"
    },
    {
      id: "ast-005",
      code: "AST-GDG-02",
      name: "Gedung Asrama Santri & Tenaga Pendidik (2 Lantai)",
      category: "Bangunan",
      acquisitionDate: "2020-03-12",
      acquisitionCost: 1400000000,
      currentValue: 1850000000,
      quantity: 1,
      unit: "Gedung",
      condition: "Baik",
      location: "Kompleks Asrama Blok C",
      custodian: "Kepala Asrama / Pondok Pesantren",
      notes: "Kapasitas 120 santri mukim dengan ruang belajar bersama.",
      lastAuditDate: "2026-08-25",
      status: "Aktif"
    },
    {
      id: "ast-006",
      code: "AST-TNH-02",
      name: "Tanah Wakaf Perluasan Asrama Santri",
      category: "Tanah",
      acquisitionDate: "2025-11-20",
      acquisitionCost: 850000000,
      currentValue: 950000000,
      quantity: 600,
      unit: "M2",
      condition: "Baik",
      location: "Kompleks Pesantren Blok Barat",
      custodian: "Ust. Kholilur Rahman, Lc.",
      notes: "Proses konversi sertifikat wakaf di BPN.",
      lastAuditDate: "2026-08-15",
      status: "Aktif"
    }
  ],
  employees: [
    {
      id: "emp-001",
      nip: "YAS-2018-001",
      name: "Fahmi Maulana Dwi, S.Kom.",
      role: "Tenaga Administrasi",
      employmentStatus: "Tetap (PNS/GTY)",
      unit: "Kantor Yayasan",
      phone: "0812-8899-7721",
      email: "fahmimaulanadwi10@gmail.com",
      education: "S1",
      joinDate: "2019-03-01",
      monthlySalary: 7500000,
      performanceScore: 98,
      attendanceRate: 99.4,
      isActive: true,
      positionTitle: "Kepala Urusan Administrasi & Database Terpadu"
    },
    {
      id: "emp-002",
      nip: "YAS-2016-004",
      name: "Ust. Muhammad Rofi'i, M.Pd.I",
      role: "Kepala Unit / Sekolah",
      employmentStatus: "Tetap (PNS/GTY)",
      unit: "Unit SMA / SMK",
      phone: "0813-4455-6677",
      email: "rofii.mpdi@binainsanmandiri.org",
      education: "S2",
      joinDate: "2016-07-15",
      monthlySalary: 9200000,
      performanceScore: 95,
      attendanceRate: 98.2,
      isActive: true,
      positionTitle: "Kepala Sekolah SMA Plus Insan Mandiri"
    },
    {
      id: "emp-003",
      nip: "YAS-2019-012",
      name: "Siti Nurhaliza, S.Pd.",
      role: "Guru / Pendidik",
      employmentStatus: "Tetap (PNS/GTY)",
      unit: "Unit SMP / MTs",
      phone: "0856-1122-3344",
      email: "siti.nurhaliza@binainsanmandiri.org",
      education: "S1",
      joinDate: "2019-08-01",
      monthlySalary: 5800000,
      performanceScore: 94,
      attendanceRate: 97.8,
      isActive: true,
      positionTitle: "Guru Bahasa Inggris & Wali Kelas 8A"
    },
    {
      id: "emp-004",
      nip: "YAS-2021-025",
      name: "Ahmad Zaki Arifin, S.E.",
      role: "Staf Keuangan",
      employmentStatus: "Tetap (PNS/GTY)",
      unit: "Kantor Yayasan",
      phone: "0878-9900-1122",
      email: "zaki.keuangan@binainsanmandiri.org",
      education: "S1",
      joinDate: "2021-02-10",
      monthlySalary: 6200000,
      performanceScore: 92,
      attendanceRate: 98.6,
      isActive: true,
      positionTitle: "Bendahara & Rekonsiliasi SPP/Infaq"
    },
    {
      id: "emp-005",
      nip: "YAS-2022-038",
      name: "Dewi Lestari, S.Pd.SD",
      role: "Guru / Pendidik",
      employmentStatus: "Kontrak (GTT/PTT)",
      unit: "Unit SD / MI",
      phone: "0819-2233-4455",
      email: "dewi.lestari@binainsanmandiri.org",
      education: "S1",
      joinDate: "2022-07-01",
      monthlySalary: 4500000,
      performanceScore: 90,
      attendanceRate: 96.5,
      isActive: true,
      positionTitle: "Guru Kelas 4 MI Bina Insan"
    },
    {
      id: "emp-006",
      nip: "YAS-2023-049",
      name: "Ust. Kholilur Rahman, Lc.",
      role: "Guru / Pendidik",
      employmentStatus: "Tetap (PNS/GTY)",
      unit: "Unit Pondok Pesantren",
      phone: "0821-6677-8899",
      email: "kholil.lc@binainsanmandiri.org",
      education: "S1",
      joinDate: "2023-01-15",
      monthlySalary: 6000000,
      performanceScore: 96,
      attendanceRate: 99.0,
      isActive: true,
      positionTitle: "Musyrif Tahfidz & Pengajar Kitab Kuning"
    },
    {
      id: "emp-007",
      nip: "YAS-2024-055",
      name: "Supriadi",
      role: "Tenaga Kebersihan & Keamanan",
      employmentStatus: "Kontrak (GTT/PTT)",
      unit: "Kantor Yayasan",
      phone: "0852-3344-5566",
      email: "supriadi.security@binainsanmandiri.org",
      education: "SMA/SMK",
      joinDate: "2024-01-02",
      monthlySalary: 3800000,
      performanceScore: 88,
      attendanceRate: 100.0,
      isActive: true,
      positionTitle: "Koordinator Keamanan & Ketertiban Kampus"
    }
  ],
  students: [
    {
      id: "std-001",
      nisn: "0089123401",
      nis: "242501001",
      name: "Muhammad Rayhan Al-Ghifari",
      gender: "L",
      educationLevel: "SMA / SMK",
      classGrade: "Kelas 11 IPA 1",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Beasiswa Prestasi",
      parentName: "Drs. Hendra Gunawan",
      parentPhone: "0812-3344-5511",
      tuitionStatus: "Gratis (Beasiswa)",
      averageGrade: 94.5,
      achievementsCount: 4,
      address: "Jl. Melati No. 12, Jakarta Timur",
      notes: "Juara 1 Olimpiade Sains Tingkat Provinsi 2025"
    },
    {
      id: "std-002",
      nisn: "0098765432",
      nis: "242501002",
      name: "Aisyah Zahra Azzahra",
      gender: "P",
      educationLevel: "SMA / SMK",
      classGrade: "Kelas 11 IPA 1",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Reguler",
      parentName: "Ir. Bambang Trihatmojo",
      parentPhone: "0813-7788-9900",
      tuitionStatus: "Lunas",
      averageGrade: 91.8,
      achievementsCount: 2,
      address: "Kompleks Griya Asri Blok C4",
      notes: "Ketua OSIS SMA Periode 2025/2026"
    },
    {
      id: "std-003",
      nisn: "0102938475",
      nis: "242502015",
      name: "Faris Abdul Hakim",
      gender: "L",
      educationLevel: "SMP / MTs",
      classGrade: "Kelas 8B",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Asrama / Santri Mukim",
      parentName: "H. Sukirno",
      parentPhone: "0857-4433-2211",
      tuitionStatus: "Lunas",
      averageGrade: 88.4,
      achievementsCount: 3,
      address: "Kamar Asrama Umar Bin Khattab No. 04",
      notes: "Hafalan 12 Juz Al-Qur'an mutqin"
    },
    {
      id: "std-004",
      nisn: "0113847562",
      nis: "242502018",
      name: "Nabila Putri Shaliha",
      gender: "P",
      educationLevel: "SMP / MTs",
      classGrade: "Kelas 7A",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Beasiswa Yatim/Dhuafa",
      parentName: "Ibu Maryati (Wali)",
      parentPhone: "0858-9900-1122",
      tuitionStatus: "Gratis (Beasiswa)",
      averageGrade: 89.2,
      achievementsCount: 1,
      address: "Jl. Kramat Jati No. 88",
      notes: "Binaan Program Peduli Anak Yatim Yayasan"
    },
    {
      id: "std-005",
      nisn: "0124958673",
      nis: "242503042",
      name: "Bilal Arkana Pratama",
      gender: "L",
      educationLevel: "SD / MI",
      classGrade: "Kelas 4 MI",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Reguler",
      parentName: "Eko Prasetyo, S.T.",
      parentPhone: "0811-2233-4455",
      tuitionStatus: "Lunas",
      averageGrade: 93.0,
      achievementsCount: 2,
      address: "Jl. Raya Condet No. 15B",
      notes: "Juara 2 Lomba Pildacil Antar MI se-DKI"
    },
    {
      id: "std-006",
      nisn: "0135069784",
      nis: "242503045",
      name: "Khansa Maryam Humaira",
      gender: "P",
      educationLevel: "SD / MI",
      classGrade: "Kelas 2 MI",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Reguler",
      parentName: "dr. Firman Syahputra",
      parentPhone: "0812-9988-7766",
      tuitionStatus: "Lunas",
      averageGrade: 95.2,
      achievementsCount: 1,
      address: "Jl. Cipinang Muara III No. 4",
      notes: "Sangat aktif dalam kegiatan tahfidz cilik"
    },
    {
      id: "std-007",
      nisn: "0146170895",
      nis: "242504008",
      name: "Fathir Daniswara",
      gender: "L",
      educationLevel: "RA / TK",
      classGrade: "TK-B Bintang",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Reguler",
      parentName: "Agus Setiawan",
      parentPhone: "0877-6655-4433",
      tuitionStatus: "Lunas",
      averageGrade: 90.0,
      achievementsCount: 0,
      address: "Jl. Raya Bogor KM 22",
      notes: "Perkembangan motorik dan sosial sangat baik"
    },
    {
      id: "std-008",
      nisn: "0078234912",
      nis: "232401088",
      name: "Ilham Ramadhan",
      gender: "L",
      educationLevel: "Pondok / Santri",
      classGrade: "Tingkat 'Aliyah - Tahfidz Khusus",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Asrama / Santri Mukim",
      parentName: "Ust. Suparman",
      parentPhone: "0813-8877-6655",
      tuitionStatus: "Lunas",
      averageGrade: 92.5,
      achievementsCount: 5,
      address: "Asrama Santri Putra Gedung C",
      notes: "Khatam 30 Juz Al-Qur'an bersanad"
    }
  ],
  adminReport: {
    id: "rep-2026-08",
    period: "Agustus 2026",
    reportDate: "2026-08-30",
    adminName: "Fahmi Maulana Dwi, S.Kom.",
    roleTitle: "Admin Utama & Administrator Database Yayasan",
    tasksCompleted: 46,
    tasksTotal: 48,
    kpiScores: {
      dataAccuracy: 98,
      syncPunctuality: 99,
      assetManagement: 95,
      serviceResponse: 97,
      reportFulfillment: 96
    },
    overallRating: 97.0,
    dailyLogs: [
      {
        id: "log-101",
        date: "2026-08-30",
        activity: "Verifikasi rekonsiliasi data inventaris Aset IT Lab Komputer dan sinkronisasi berkala database server",
        category: "Sinkronisasi Sistem",
        durationHours: 3.5,
        status: "Selesai",
        evidenceNote: "30 unit PC Lab terdata dengan QR Code dan nilai buku terbarui."
      },
      {
        id: "log-102",
        date: "2026-08-29",
        activity: "Pembaruan database registrasi ulang peserta didik tahun ajaran 2025/2026 dan validasi penerima beasiswa dhuafa",
        category: "Administrasi Siswa",
        durationHours: 4.0,
        status: "Selesai",
        evidenceNote: "Data 84 peserta didik baru tervalidasi dan terbit kartu siswa digital."
      },
      {
        id: "log-103",
        date: "2026-08-28",
        activity: "Pemutakhiran berkas kepegawaian (SK GTY dan sertifikasi pendidik) bersama divisi SDM Yayasan",
        category: "Pelayanan Pegawai",
        durationHours: 3.0,
        status: "Selesai",
        evidenceNote: "7 berkas sertifikasi baru diarsipkan dalam sistem cloud yayasan."
      },
      {
        id: "log-104",
        date: "2026-08-27",
        activity: "Inspeksi fisik dan pembaruan status aset panel surya serta proyektor aula dalam perbaikan",
        category: "Rekonsiliasi Aset",
        durationHours: 2.5,
        status: "Selesai",
        evidenceNote: "Tiket perbaikan EPSON terbit dan status tercatat di dasbor."
      },
      {
        id: "log-105",
        date: "2026-08-26",
        activity: "Penyusunan laporan rekapitulasi kinerja bulanan dan persiapan rapat koordinasi pimpinan yayasan",
        category: "Rapat & Koordinasi",
        durationHours: 3.5,
        status: "Selesai",
        evidenceNote: "Draft laporan eksekutif tercetak dan siap disahkan Ketua Yayasan."
      }
    ],
    milestones: [
      {
        id: "mst-01",
        title: "Digitalisasi 100% Data Aset Yayasan Terintegrasi Barcode/QR",
        targetDate: "2026-08-31",
        status: "Tercapai",
        progress: 100
      },
      {
        id: "mst-02",
        title: "Sinkronisasi Real-Time Multi-Unit Pendidikan (RA, MI, MTs, SMA, Pondok)",
        targetDate: "2026-08-30",
        status: "Tercapai",
        progress: 100
      },
      {
        id: "mst-03",
        title: "Penerbitan Rekapitulasi Presensi & Kinerja Pegawai Semester Ganjil",
        targetDate: "2026-09-15",
        status: "Berjalan",
        progress: 85
      },
      {
        id: "mst-04",
        title: "Pembaruan Profil Verifikasi Legalitas & Simlitabkes Kemenkumham",
        targetDate: "2026-09-30",
        status: "Berjalan",
        progress: 70
      }
    ],
    keyAchievements: [
      "Mengintegrasikan 4 modul basis data (Aset, Pegawai, Peserta Didik, Laporan Kinerja) ke dalam satu platform terpusat.",
      "Mengurangi waktu pemrosesan sinkronisasi data dari 2 hari manual menjadi real-time otomatis.",
      "Tercapainya akurasi data inventaris aset yayasan hingga 98% dengan valuasi total Rp 6,97 Milyar.",
      "Tingkat kehadiran pegawai dan kedisiplinan administrasi tercatat 98.4% sepanjang periode berjalan.",
      "Pengelolaan 850+ peserta didik lintas 5 unit pendidikan dengan pemantauan beasiswa tepat sasaran."
    ],
    challengesAndSolutions: "Tantangan utama berupa fluktuasi koneksi internet pada beberapa unit lokal telah diselesaikan dengan implementasi penyimpanan lokal cerdas (local offline-first state) dengan antrian sinkronisasi otomatis ketika koneksi pulih.",
    recommendations: "1. Mengagendakan perawatan berkala (maintenance preventive) untuk aset elektronik lab komputer setiap 3 bulan.\n2. Melanjutkan program beasiswa tahfidz dengan kuota penambahan 15 santri baru.\n3. Implementasi tanda tangan digital resmi (e-sign QR) untuk pengesahan surat dan laporan yayasan."
  },
  syncHistory: [
    {
      id: "sync-1",
      timestamp: "2026-08-30T06:15:00.000Z",
      status: "success",
      changesCount: 4,
      type: "Full Sync",
      message: "Sinkronisasi otomatis basis data seluruh modul berhasil tanpa konflik."
    },
    {
      id: "sync-2",
      timestamp: "2026-08-30T05:30:00.000Z",
      status: "success",
      changesCount: 2,
      type: "Aset",
      message: "Pembaruan valuasi aset tanah & pemeliharaan proyektor disinkronkan."
    },
    {
      id: "sync-3",
      timestamp: "2026-08-30T04:00:00.000Z",
      status: "success",
      changesCount: 5,
      type: "Peserta Didik",
      message: "Pembaruan data kelulusan & beasiswa santri terverifikasi."
    }
  ],
  auditLogs: [
    {
      id: "aud-001",
      timestamp: "2026-08-30T06:15:22.000Z",
      userName: "Fahmi Maulana Dwi, S.Kom.",
      action: "SYNC",
      entityType: "Sistem",
      details: "Auto-sync sukses: 4 entitas termutakhirkan ke database server."
    },
    {
      id: "aud-002",
      timestamp: "2026-08-30T05:45:10.000Z",
      userName: "Fahmi Maulana Dwi, S.Kom.",
      action: "UPDATE",
      entityType: "Aset",
      details: "Memperbarui status Aset AST-ELK-03 menjadi 'Dalam Perbaikan'."
    },
    {
      id: "aud-003",
      timestamp: "2026-08-30T05:10:00.000Z",
      userName: "Fahmi Maulana Dwi, S.Kom.",
      action: "CREATE",
      entityType: "Kinerja Admin",
      details: "Menambahkan log aktivitas harian administrasi database yayasan."
    }
  ]
};

// Helper to read database
function getDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
  }
  // Initialize file with default dataset
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 2), "utf-8");
  return INITIAL_DATABASE;
}

// Helper to write database
function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving database file:", err);
    return false;
  }
}

// Ensure database file is created
getDatabase();

// API Endpoints
// 1. Get entire database
app.get("/api/db", (req, res) => {
  const db = getDatabase();
  res.json({
    success: true,
    data: db,
    serverTime: new Date().toISOString()
  });
});

// 2. Sync database payload from client
app.post("/api/db/sync", (req, res) => {
  try {
    const incomingData = req.body;
    if (!incomingData || typeof incomingData !== "object") {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    const currentDb = getDatabase();
    
    // Merge updates cleanly
    const updatedDb = {
      ...currentDb,
      ...incomingData,
      // Keep profile and entities
      profile: incomingData.profile || currentDb.profile,
      assets: incomingData.assets !== undefined ? incomingData.assets : currentDb.assets,
      assetTransfers: incomingData.assetTransfers !== undefined ? incomingData.assetTransfers : (currentDb.assetTransfers || []),
      borrowedDocs: incomingData.borrowedDocs !== undefined ? incomingData.borrowedDocs : (currentDb.borrowedDocs || []),
      donations: incomingData.donations !== undefined ? incomingData.donations : (currentDb.donations || []),
      meetings: incomingData.meetings !== undefined ? incomingData.meetings : (currentDb.meetings || []),
      employees: incomingData.employees || currentDb.employees,
      students: incomingData.students || currentDb.students,
      adminReport: incomingData.adminReport || currentDb.adminReport,
      syncHistory: incomingData.syncHistory || [
        {
          id: `sync-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: "success",
          changesCount: 1,
          type: "Full Sync",
          message: "Sinkronisasi manual berhasil disimpan ke server."
        },
        ...(currentDb.syncHistory || []).slice(0, 30)
      ],
      auditLogs: incomingData.auditLogs || currentDb.auditLogs
    };

    saveDatabase(updatedDb);

    return res.json({
      success: true,
      message: "Database yayasan berhasil disinkronisasi ke server.",
      syncedAt: new Date().toISOString(),
      data: updatedDb
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return res.status(500).json({ success: false, message: error.message || "Gagal sinkronisasi" });
  }
});

// 2b. Google Spreadsheet Proxy Endpoints (CORS-free integration with smart diagnostics)
app.post("/api/sheets/proxy", async (req, res) => {
  try {
    const { url, payload } = req.body;
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return res.status(400).json({ 
        success: false, 
        errorType: "INVALID_URL",
        message: "URL Google Apps Script tidak valid atau kosong." 
      });
    }

    const trimmedUrl = url.trim();

    // Early validation for wrong URL types
    if (trimmedUrl.includes("docs.google.com/spreadsheets")) {
      return res.json({
        success: false,
        errorType: "SPREADSHEET_DOC_URL",
        message: "URL yang dimasukkan adalah tautan file Spreadsheet (docs.google.com), BUKAN Web App URL. Anda perlu membuka Extensions > Apps Script > Deploy > New deployment > Web app untuk mendapatkan URL yang berakhiran /exec."
      });
    }

    if (trimmedUrl.includes("script.google.com/home/projects")) {
      return res.json({
        success: false,
        errorType: "EDITOR_URL",
        message: "URL yang dimasukkan adalah halaman editor Apps Script. Klik tombol biru 'Deploy' di kanan atas > 'New deployment' > Web app untuk mendapatkan Web App URL."
      });
    }

    if (trimmedUrl.endsWith("/dev")) {
      return res.json({
        success: false,
        errorType: "DEV_URL",
        message: "URL berakhiran /dev (Test Deployment) mewajibkan login Google. Harap buat New Deployment bertipe Web App dengan opsi 'Who has access: Anyone' untuk mendapatkan URL Production yang berakhiran /exec."
      });
    }

    const response = await fetch(trimmedUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload || {})
    });

    const text = await response.text();

    // Check if Google returned an HTML page instead of JSON (common when "Who has access" is not Anyone)
    if (text.includes("<!DOCTYPE") || text.includes("<html") || text.includes("accounts.google.com") || text.includes("ServiceLogin")) {
      return res.json({
        success: false,
        errorType: "AUTH_REQUIRED",
        message: "Google Apps Script meminta otentikasi login Google (Opsi 'Who has access' belum disetel ke 'Anyone'). Saat melakukan Deploy di Apps Script, pastikan 'Who has access' (Siapa yang memiliki akses) disetel ke 'Anyone' (Siapa saja), bukan 'Only myself' (Hanya saya).",
        rawResponseSnippet: text.slice(0, 300)
      });
    }

    if (text.includes("Script function not found")) {
      return res.json({
        success: false,
        errorType: "FUNCTION_NOT_FOUND",
        message: "Fungsi doPost atau doGet tidak ditemukan dalam Google Apps Script. Pastikan Anda telah menyalin seluruh kode skrip dari aplikasi ini, menyimpannya (Ctrl+S), lalu melakukan Deploy ulang.",
        rawResponseSnippet: text.slice(0, 300)
      });
    }

    try {
      const json = JSON.parse(text);
      return res.json(json);
    } catch {
      return res.json({ 
        success: response.ok, 
        message: text,
        rawResponseSnippet: text.slice(0, 300) 
      });
    }
  } catch (err: any) {
    console.error("Google Sheets proxy error:", err);
    return res.status(500).json({
      success: false,
      errorType: "SERVER_PROXY_ERROR",
      message: err.message || "Gagal menghubungi Google Apps Script melalui proxy server."
    });
  }
});

app.post("/api/sheets/pull", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return res.status(400).json({ 
        success: false, 
        errorType: "INVALID_URL",
        message: "URL Google Apps Script tidak valid." 
      });
    }

    const trimmedUrl = url.trim();

    if (trimmedUrl.includes("docs.google.com/spreadsheets")) {
      return res.json({
        success: false,
        errorType: "SPREADSHEET_DOC_URL",
        message: "URL yang dimasukkan adalah tautan file Spreadsheet, bukan Web App URL."
      });
    }

    const fetchUrl = trimmedUrl + (trimmedUrl.includes("?") ? "&" : "?") + "action=pull&t=" + Date.now();
    const response = await fetch(fetchUrl);
    const text = await response.text();

    if (text.includes("<!DOCTYPE") || text.includes("<html") || text.includes("accounts.google.com")) {
      return res.json({
        success: false,
        errorType: "AUTH_REQUIRED",
        message: "Google Apps Script meminta otentikasi login Google. Pastikan setelan 'Who has access' pada Web App adalah 'Anyone' (Siapa saja)."
      });
    }

    try {
      const json = JSON.parse(text);
      return res.json(json);
    } catch {
      return res.json({
        success: false,
        errorType: "INVALID_JSON",
        message: "Respons dari Google Apps Script bukan JSON yang valid.",
        rawResponseSnippet: text.slice(0, 300)
      });
    }
  } catch (err: any) {
    console.error("Google Sheets pull error:", err);
    return res.status(500).json({
      success: false,
      errorType: "SERVER_PROXY_ERROR",
      message: err.message || "Gagal menarik data dari Google Apps Script melalui proxy server."
    });
  }
});

// Endpoint Diagnosa Lengkap Google Sheets
app.post("/api/sheets/diagnose", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.json({
        success: false,
        step: "url_check",
        reason: "URL Kosong",
        solution: "Silakan masukkan URL Google Apps Script Web App yang berakhiran /exec."
      });
    }

    const trimmed = url.trim();

    if (trimmed.includes("docs.google.com/spreadsheets")) {
      return res.json({
        success: false,
        step: "url_validation",
        reason: "Tautan adalah File Google Spreadsheet, bukan Web App URL",
        solution: "Buka file Spreadsheet tersebut > pilih menu 'Extensions' (Ekstensi) > 'Apps Script' > tempel kode skrip > klik 'Deploy' > 'New deployment' > Web App > salin Web App URL yang berakhiran /exec."
      });
    }

    if (trimmed.includes("script.google.com/home/projects")) {
      return res.json({
        success: false,
        step: "url_validation",
        reason: "Tautan adalah Halaman Editor Apps Script",
        solution: "Klik tombol biru 'Deploy' di pojok kanan atas Apps Script > 'New deployment' > atur 'Who has access: Anyone' > Deploy > salin Web App URL."
      });
    }

    if (trimmed.endsWith("/dev")) {
      return res.json({
        success: false,
        step: "url_validation",
        reason: "URL Uji Coba Pengembang (/dev)",
        solution: "URL yang berakhiran /dev mewajibkan sesi login akun Google dan tidak dapat diakses oleh aplikasi luar. Gunakan URL Production yang berakhiran /exec dari menu Deploy > New deployment."
      });
    }

    if (!trimmed.includes("script.google.com/macros/s/")) {
      return res.json({
        success: false,
        step: "url_validation",
        reason: "Format URL Tidak Dikenali",
        solution: "URL Web App Apps Script resmi selalu memiliki format: https://script.google.com/macros/s/.../exec"
      });
    }

    // Attempt GET test
    let getStatus = 0;
    let getText = "";
    try {
      const getRes = await fetch(trimmed + (trimmed.includes("?") ? "&" : "?") + "action=test&t=" + Date.now());
      getStatus = getRes.status;
      getText = await getRes.text();
    } catch (e: any) {
      return res.json({
        success: false,
        step: "network_test",
        reason: "Gagal Menjangkau Server Google (" + (e.message || "Network Error") + ")",
        solution: "Periksa koneksi internet Anda atau pastikan URL Google Apps Script tidak salah ketik."
      });
    }

    if (getText.includes("accounts.google.com") || getText.includes("ServiceLogin") || getText.includes("<html") || getText.includes("<!DOCTYPE")) {
      return res.json({
        success: false,
        step: "permission_check",
        reason: "Setelan Akses Masih 'Only myself' (Membutuhkan Login Google)",
        solution: "Buka Apps Script > klik 'Deploy' > 'Manage deployments' > klik icon pensil (Edit) > ubah 'Who has access' dari 'Only myself' menjadi 'Anyone' (Siapa saja) > klik 'Deploy' (atau buat New Deployment baru)."
      });
    }

    if (getText.includes("Script function not found")) {
      return res.json({
        success: false,
        step: "code_check",
        reason: "Fungsi doGet / doPost Tidak Ada",
        solution: "Pastikan Anda telah menyalin SELURUH kode Google Apps Script dari menu aplikasi ini (klik tombol 'Salin Skrip Apps Script'), hapus kode lama di Apps Script, lalu paste dan klik Simpan (Ctrl+S), kemudian Deploy ulang."
      });
    }

    try {
      const json = JSON.parse(getText);
      if (json.success) {
        return res.json({
          success: true,
          step: "completed",
          message: "Koneksi Google Spreadsheet Sempurna!",
          sheetTitle: json.sheetTitle || "Google Spreadsheet Yayasan",
          sheetDocUrl: json.sheetDocUrl || ""
        });
      } else {
        return res.json({
          success: false,
          step: "response_error",
          reason: json.message || "Google Apps Script mengembalikan status gagal.",
          solution: "Buka Google Spreadsheet Anda untuk memastikan lembar kerja tidak terkunci atau dibatasi."
        });
      }
    } catch {
      return res.json({
        success: false,
        step: "parsing_error",
        reason: "Respons dari Google bukan format JSON: " + getText.slice(0, 150),
        solution: "Pastikan kode Apps Script yang dipasang adalah kode resmi dari aplikasi ini."
      });
    }
  } catch (err: any) {
    return res.json({
      success: false,
      step: "unexpected_error",
      reason: err.message || "Terjadi kesalahan pada proxy",
      solution: "Coba kembali dalam beberapa saat."
    });
  }
});

// 3. AI Smart Analytics & Report Generation using Gemini SDK
app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { type, prompt, currentData } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return structured high quality fallback response if API key is not configured
      return res.json({
        success: true,
        isFallback: true,
        analysis: generateFallbackAnalysis(type, currentData)
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let systemInstruction = `Anda adalah Asisten Analis Manajemen Yayasan Cerdas & Konsultan Eksekutif Pendidikan Islam / Yayasan Sosial. Berikan analisis mendalam, terstruktur, profesional, objektif, dan bernilai strategis tinggi dalam Bahasa Indonesia formal dengan format Markdown yang rapi. Gunakan poin-poin bernomor, tabel ringkas jika relevan, dan rekomendasi aksi konkret.`;
    
    let userPrompt = "";
    if (type === "executive_summary") {
      userPrompt = `Buat Ringkasan Eksekutif Komprehensif untuk Pimpinan & Pengurus Yayasan berdasarkan data berikut:
Profil Yayasan: ${JSON.stringify(currentData?.profile || {})}
Data Aset (${currentData?.assets?.length || 0} unit terdata, valuasi: Rp ${currentData?.assets?.reduce((a: number, c: any) => a + (Number(c.currentValue) || 0), 0).toLocaleString('id-ID')}): ${JSON.stringify(currentData?.assets || [])}
Data SDM/Pegawai (${currentData?.employees?.length || 0} orang): ${JSON.stringify(currentData?.employees || [])}
Data Peserta Didik (${currentData?.students?.length || 0} siswa): ${JSON.stringify(currentData?.students || [])}
Kinerja Admin (${currentData?.adminReport?.adminName}, skor ${currentData?.adminReport?.overallRating}%): ${JSON.stringify(currentData?.adminReport || {})}

Berikan struktur:
1. Ringkasan Kesehatan Tata Kelola Yayasan
2. Analisis Efisiensi Pemanfaatan Aset & Rasio Depresiasi
3. Evaluasi Kapasitas SDM & Rasio Guru-Murid
4. Rekomendasi Strategis Rapat Pleno Yayasan`;
    } else if (type === "admin_performance_narrative") {
      userPrompt = `Buatkan Narasi Laporan Kinerja Resmi Bulanan untuk Admin Yayasan (${currentData?.adminReport?.adminName || 'Admin Yayasan'}) untuk periode ${currentData?.adminReport?.period || 'Bulan Ini'}.
Data KPI Admin: ${JSON.stringify(currentData?.adminReport?.kpiScores || {})}
Skor Keseluruhan: ${currentData?.adminReport?.overallRating || 97}%
Log Aktivitas: ${JSON.stringify(currentData?.adminReport?.dailyLogs || [])}
Milestone: ${JSON.stringify(currentData?.adminReport?.milestones || [])}

Sajikan dalam bentuk naskah formal laporan pertanggungjawaban admin dengan struktur:
- Kata Pengantar & Latar Belakang
- Rincian Capaian Kinerja & Efisiensi Operasional
- Realisasi Program Kerja & Pengelolaan Database Terpadu
- Kendala Operasional dan Solusi Mitigasi yang Telah Dilakukan
- Pernyataan Penutup & Usulan Rencana Kerja Periode Berikutnya`;
    } else if (type === "asset_recommendations") {
      userPrompt = `Lakukan audit prediktif dan rekomendasi pemeliharaan (Predictive Maintenance & Asset Optimization) untuk aset yayasan berikut:
${JSON.stringify(currentData?.assets || [])}
Fokus pada mitigasi risiko aset rusak, jadwal servis berkala, estimasi kebutuhan anggaran pemeliharaan tahunan, dan optimalisasi aset produktif.`;
    } else {
      userPrompt = prompt || `Berikan analisis singkat terkait data yayasan berikut: ${JSON.stringify(currentData || {})}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }
      ]
    });

    const textOutput = response.text || "Tidak ada hasil analisis yang dihasilkan.";
    return res.json({
      success: true,
      analysis: textOutput
    });
  } catch (err: any) {
    console.error("AI Analysis error:", err);
    // Provide fallback so UI never breaks
    return res.json({
      success: true,
      isFallback: true,
      analysis: generateFallbackAnalysis(req.body.type, req.body.currentData)
    });
  }
});

function generateFallbackAnalysis(type: string, data: any): string {
  const totalValuation = data?.assets?.reduce((acc: number, item: any) => acc + (Number(item.currentValue) || 0), 0) || 6970000000;
  const totalEmployees = data?.employees?.length || 7;
  const totalStudents = data?.students?.length || 8;
  const adminName = data?.adminReport?.adminName || "Fahmi Maulana Dwi, S.Kom.";
  const overallScore = data?.adminReport?.overallRating || 97.0;

  if (type === "admin_performance_narrative") {
    return `### LAPORAN KINERJA BULANAN ADMINISTRATOR YAYASAN
**Periode:** ${data?.adminReport?.period || 'Agustus 2026'}
**Nama Admin:** ${adminName}
**Unit Kerja:** Sekretariat & Pengelola Database Terpadu Yayasan

---

#### 1. Ringkasan Eksekutif Capaian Kinerja
Sepanjang periode pelaporan, Administrator Yayasan telah menuntaskan **${data?.adminReport?.tasksCompleted || 46} dari ${data?.adminReport?.tasksTotal || 48} penugasan strategis** dengan tingkat ketercapaian Indeks Kinerja Utama (IKU/KPI) rata-rata sebesar **${overallScore}%**. Seluruh entitas basis data (Inventaris Aset, Kepegawaian, Peserta Didik, dan Logbook Kinerja) telah terintegrasi secara digital dengan protokol sinkronisasi berkala.

#### 2. Rincian Capaian Indikator Kinerja Utama (IKU)
- **Akurasi & Validitas Data:** ${data?.adminReport?.kpiScores?.dataAccuracy || 98}% (Seluruh berkas legalitas dan data pokok terverifikasi).
- **Ketepatan Waktu Sinkronisasi:** ${data?.adminReport?.kpiScores?.syncPunctuality || 99}% (Auto-sync dan backup data berjalan real-time).
- **Manajemen & Audit Aset:** ${data?.adminReport?.kpiScores?.assetManagement || 95}% (Valuasi total Rp ${totalValuation.toLocaleString('id-ID')} terpantau kondisinya).
- **Responsivitas Layanan SDM & Santri:** ${data?.adminReport?.kpiScores?.serviceResponse || 97}% (Layanan administrasi terselesaikan < 24 jam).
- **Pemenuhan Laporan Pimpinan:** ${data?.adminReport?.kpiScores?.reportFulfillment || 96}% (Laporan dasbor tersedia transparan).

#### 3. Realisasi Program Unggulan
1. **Digitalisasi Aset:** Penataan ${data?.assets?.length || 7} kelompok aset utama dengan penomoran kodefikasi standar dan monitoring pemeliharaan.
2. **Rekonsiliasi Beasiswa:** Pemantauan data peserta didik penerima beasiswa dhuafa dan prestasi agar tepat sasaran.
3. **Penyempurnaan Sistem Basis Data:** Pengaktifan fitur offline-first dengan auto-sync otomatis multi-platform.

#### 4. Rekomendasi untuk Dewan Pengurus
- Mengalokasikan dana cadangan pemeliharaan rutin untuk aset teknologi dan sarana gedung sebesar 5% dari estimasi valuasi per tahun.
- Melanjutkan peningkatan kompetensi digital staf administrasi tiap unit sekolah di bawah naungan yayasan.`;
  }

  if (type === "asset_recommendations") {
    return `### REKOMENDASI AUDIT & PEMELIHARAAN ASET YAYASAN
**Total Valuasi Terdata:** Rp ${totalValuation.toLocaleString('id-ID')}
**Jumlah Item Terdaftar:** ${data?.assets?.length || 7} Aset Pokok

---

#### 1. Prioritas Pemeliharaan Mendesak (Urgent)
- **Aset Elektronik & Sarpras Lab:** Proyektor Laser dan 30 Unit Komputer Lab memerlukan kalibrasi dan penggantian filter termal berkala untuk mempertahankan umur pakai ekonomis.
- **Kendaraan Operasional HiAce:** Memastikan jadwal servis berkala 10.000 KM dan pembaruan polis asuransi armada yayasan.

#### 2. Optimalisasi Aset Produktif (High Value)
- **Sistem Panel Tenaga Surya (Solar PV 10 kWp):** Telah menghemat biaya listrik operasional ~45%. Disarankan pembersihan permukaan panel fotovoltaik setiap bulan untuk efisiensi penyerapan energi maksimal.
- **Gedung Pembelajaran & Tanah Wakaf:** Pengecekan struktural rutin sebelum musim penghujan dan sertifikasi IMB/SLF bangunan kampus.

#### 3. Proyeksi Anggaran Pemeliharaan (Preventive Budgeting)
Disarankan menyisihkan Rp 18.500.000,- / semester sebagai *sinking fund* pemeliharaan preventif agar meminimalkan risiko kerusakan berat tak terduga.`;
  }

  return `### RINGKASAN EKSEKUTIF KESEHATAN TATA KELOLA YAYASAN
**Nama Yayasan:** ${data?.profile?.name || 'Yayasan Bina Insan Mandiri Terpadu'}
**Tanggal Analisis:** ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}

---

#### 1. Gambaran Umum Ekosistem Yayasan
- **Valuasi Aset Total:** Rp ${totalValuation.toLocaleString('id-ID')} (Tanah, Bangunan, Kendaraan, IT, Sarpras).
- **Jumlah SDM & Pendidik:** ${totalEmployees} Tenaga Kerja Aktif dengan tingkat kedisiplinan 98.4%.
- **Total Peserta Didik Binaan:** ${totalStudents} Santri/Siswa aktif lintas jenjang pendidikan.
- **Kinerja Administrasi Yayasan:** Skor ${overallScore}% (Kategori: Sangat Baik / Sangat Efisien).

#### 2. Evaluasi Efisiensi & Transparansi
Sistem basis data terintegrasi telah berhasil menghilangkan redundansi data antar unit. Sinkronisasi otomatis memungkinkan Ketua Yayasan dan Dewan Pembina memantau kondisi terkini tanpa jeda pelaporan manual.

#### 3. Rekomendasi Aksi Rapat Pleno
1. **Penguatan Tata Kelola Wakaf & Aset:** Perpanjangan legalitas dan digitalisasi sertifikat tanah.
2. **Kesejahteraan Guru & Pegawai:** Peninjauan skema tunjangan kinerja berkala berbasis KPI terdata.
3. **Ekspansi Beasiswa Siswa Berprestasi & Yatim:** Membuka program orang tua asuh digital berbasis data riil peserta didik.`;
}

// Start Server with Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vitePkg = "vite";
    const { createServer: createViteServer } = await import(vitePkg);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Foundation Management System running at http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
