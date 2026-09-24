import { DatabaseStore, AssetItem, AssetTransferRecord, SyncHistoryItem, AuditLogItem, StudentItem, EducationLevel } from "../types";

const LOCAL_STORAGE_KEY = "yayasan_database_store_v1";

// Initial mock fallback if localStorage and server are fresh
export const DEFAULT_DATABASE: DatabaseStore = {
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
      notes: "Sertifikat Hak Milik Wakaf No. 441. Legalitas lengkap dan terdaftar di Kantor Pertanahan BPN.",
      lastAuditDate: "2026-08-15",
      status: "Aktif",
      legalDocType: "Akta Ikrar Wakaf (AIW)",
      legalDocNumber: "W.3/004/AIW/2016 & SHM 441",
      originalOwner: "H. Abdullah Syukur (Alm.)",
      registeredOwner: "Yayasan Bina Insan Mandiri Terpadu",
      transferStatus: "Selesai Balik Nama (a.n. Yayasan)",
      landArea: 1250,
      sourceOfFund: "Wakaf"
    },
    {
      id: "ast-002",
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
      notes: "Proses konversi sertifikat wakaf dan pemecahan bidang di BPN melalui Notaris Hj. Ratna, S.H.",
      lastAuditDate: "2026-08-15",
      status: "Aktif",
      legalDocType: "Akta Ikrar Wakaf (AIW)",
      legalDocNumber: "AIW-KUA/2025/11-09",
      originalOwner: "Hj. Siti Mariyam",
      registeredOwner: "Proses Balik Nama BPN",
      transferStatus: "Dalam Proses BPN / Notaris",
      landArea: 600,
      sourceOfFund: "Wakaf"
    },
    {
      id: "ast-003",
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
      notes: "Kapasitas 18 ruang kelas, 1 lab komputer, 1 ruang multimedia. PBG/SLF lengkap a.n. Yayasan.",
      lastAuditDate: "2026-08-20",
      status: "Aktif",
      legalDocType: "Sertifikat Hak Guna Bangunan (HGB)",
      legalDocNumber: "PBG No. 640/2018/DTR",
      buildingArea: 980,
      registeredOwner: "Yayasan Bina Insan Mandiri Terpadu",
      transferStatus: "Selesai Balik Nama (a.n. Yayasan)",
      sourceOfFund: "Kas Yayasan"
    },
    {
      id: "ast-004",
      code: "AST-KND-01",
      name: "Mobil Minibus HiAce Operasional Yayasan",
      category: "Kendaraan",
      acquisitionDate: "2022-01-10",
      acquisitionCost: 520000000,
      currentValue: 380000000,
      quantity: 1,
      unit: "Unit",
      condition: "Baik",
      location: "Garasi Utama Yayasan",
      custodian: "Pak Joko Suwandi (Driver Operasional)",
      notes: "Plat B 1928 TYA. BPKB dan STNK resmi atas nama Yayasan.",
      lastAuditDate: "2026-08-10",
      status: "Aktif",
      legalDocType: "BPKB & STNK",
      legalDocNumber: "BPKB No. N-09182319",
      licensePlate: "B 1928 TYA",
      chassisNumber: "MHF21LH80K-001928",
      vehicleType: "MOBIL",
      vehicleBrand: "Toyota HiAce Commuter",
      vehicleYear: 2022,
      registeredOwner: "Yayasan Bina Insan Mandiri Terpadu",
      transferStatus: "Selesai Balik Nama (a.n. Yayasan)",
      sourceOfFund: "Kas Yayasan"
    },
    {
      id: "ast-005",
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
      notes: "Plat B 9112 YSN. Dilengkapi tandu medis, tabung oksigen, dan sirine darurat.",
      lastAuditDate: "2026-08-20",
      status: "Aktif",
      legalDocType: "BPKB & STNK",
      legalDocNumber: "BPKB No. K-88129031",
      licensePlate: "B 9112 YSN",
      vehicleType: "AMBULANCE",
      vehicleBrand: "Suzuki APV Arena Ambulance",
      vehicleYear: 2023,
      registeredOwner: "Yayasan Bina Insan Mandiri Terpadu",
      transferStatus: "Selesai Balik Nama (a.n. Yayasan)",
      sourceOfFund: "Kas Yayasan"
    },
    {
      id: "ast-006",
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
      notes: "Kapasitas 120 santri mukim dengan 16 kamar mandi dan ruang belajar bersama.",
      lastAuditDate: "2026-08-25",
      status: "Aktif",
      legalDocType: "Sertifikat Hak Guna Bangunan (HGB)",
      legalDocNumber: "PBG-357701-2020-098",
      buildingArea: 650,
      registeredOwner: "Yayasan Bina Insan Mandiri Terpadu",
      transferStatus: "Selesai Balik Nama (a.n. Yayasan)",
      sourceOfFund: "Wakaf"
    },
    {
      id: "ast-007",
      code: "AST-TNH-03",
      name: "Tanah Wakaf Produktif Pertanian Organik",
      category: "Tanah",
      acquisitionDate: "2021-09-05",
      acquisitionCost: 450000000,
      currentValue: 620000000,
      quantity: 2400,
      unit: "M2",
      condition: "Baik",
      location: "Desa Sukamaju, Madiun",
      custodian: "Pengurus Unit Wakaf Produktif",
      notes: "Dikelola untuk unit agribisnis ketahanan pangan santri dan pembibitan sayur organik.",
      lastAuditDate: "2026-08-01",
      status: "Aktif",
      legalDocType: "Akta Ikrar Wakaf (AIW)",
      legalDocNumber: "W.3/011/AIW/2021",
      originalOwner: "Suparminto",
      registeredOwner: "Suparminto (Proses Balik Nama)",
      transferStatus: "Dalam Proses BPN / Notaris",
      landArea: 2400,
      sourceOfFund: "Wakaf"
    }
  ],
  assetTransfers: [
    {
      id: "trf-001",
      assetId: "ast-007",
      assetCode: "AST-TNH-03",
      assetName: "Tanah Wakaf Produktif Pertanian Organik (2.400 M2)",
      category: "Tanah",
      fromOwner: "Suparminto",
      toOwner: "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN",
      docType: "Akta Ikrar Wakaf (AIW)",
      docNumber: "AIW-08/2026/012",
      notaryOffice: "Notaris Galis, S.H., M.Kn. & Kantor Pertanahan BPN Madiun",
      submissionDate: "2026-06-08",
      targetDate: "2026-10-30",
      status: "Proses BPN / Notaris",
      progressPercent: 75,
      estimatedCost: 4251100,
      handlerName: "Fahmi Maulana Dwi, S.Kom.",
      notes: "Pembaruan BPHTB Oleh Notaris Galis",
      logs: [
        {
          id: "log-1",
          date: "2026-06-14",
          description: "Pemberkasan Akta hibah",
          cost: 1500000
        },
        {
          id: "log-2",
          date: "2026-06-14",
          description: "PPh",
          cost: 2751100
        }
      ]
    },
    {
      id: "trf-002",
      assetId: "ast-002",
      assetCode: "AST-TNH-02",
      assetName: "Tanah Wakaf Perluasan Asrama Santri (600 M2)",
      category: "Tanah",
      fromOwner: "Hj. Siti Mariyam (Pewakif)",
      toOwner: "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN",
      docType: "Akta Ikrar Wakaf (AIW)",
      docNumber: "AIW-KUA/2025/11-09",
      notaryOffice: "Kantor Notaris & PPAT Hj. Ratna, S.H. & BPN",
      submissionDate: "2026-01-15",
      targetDate: "2026-10-30",
      status: "Pengukuran & Pengecekan",
      progressPercent: 50,
      estimatedCost: 3500000,
      handlerName: "H. Ridwan Santoso",
      notes: "Pengukuran ulang BPN telah selesai. Berkas sedang dalam validasi buku tanah.",
      logs: [
        {
          id: "log-201",
          date: "2026-01-20",
          description: "Pendaftaran & Biaya Cek Sertifikat BPN",
          cost: 750000
        },
        {
          id: "log-202",
          date: "2026-02-15",
          description: "Petugas Ukur Fisik BPN & Saksi Batas",
          cost: 2750000
        }
      ]
    },
    {
      id: "trf-003",
      assetId: "ast-004",
      assetCode: "AST-KND-01",
      assetName: "Mobil Minibus Operasional HiAce Commuter",
      category: "Kendaraan",
      fromOwner: "PT Toyota Astra Motor / Bpk Hendra",
      toOwner: "YAYASAN PONDOK PESANTREN MUTTAQIN JOSENAN MADIUN",
      docType: "BPKB & STNK",
      docNumber: "BPKB No. N-09182319",
      notaryOffice: "SAMSAT Madiun & Biro Jasa Resmi",
      submissionDate: "2022-02-05",
      targetDate: "2022-03-20",
      completionDate: "2022-03-18",
      status: "Selesai / Terbit Sertifikat",
      progressPercent: 100,
      estimatedCost: 3500000,
      handlerName: "Pak Joko Suwandi & Admin Keuangan",
      notes: "Mutasi dan balik nama STNK/BPKB telah tuntas a.n. Yayasan.",
      logs: [
        {
          id: "log-301",
          date: "2022-02-10",
          description: "Cek Fisik Bantuan & Rubentina SAMSAT",
          cost: 500000
        },
        {
          id: "log-302",
          date: "2022-03-15",
          description: "Penerbitan BPKB & STNK Baru a.n. Yayasan",
          cost: 3000000
        }
      ]
    }
  ],
  borrowedDocs: [
    {
      id: "bor-001",
      assetId: "ast-002",
      assetCode: "AST-TNH-02",
      assetName: "Tanah Wakaf Perluasan Asrama Santri",
      docTitle: "Akta Ikrar Wakaf (AIW) Asli & Surat Girik Asal",
      docNumber: "AIW-KUA/2025/11-09",
      borrowerName: "Hj. Ratna, S.H., M.Kn.",
      borrowerRole: "Notaris & PPAT Mitra Yayasan",
      borrowerPhone: "0812-3344-5566",
      borrowDate: "2026-08-10",
      dueDate: "2026-09-15",
      purpose: "Validasi kelengkapan berkas fisik untuk proses pendaftaran sertifikat di Kantor Pertanahan BPN",
      status: "Dipinjam",
      approvedBy: "Drs. H. Ahmad Fauzan, M.Pd. (Ketua Yayasan)",
      notes: "Dilengkapi Berita Acara Serah Terima (BAST) peminjaman dokumen nomor BAST/08/2026/04."
    },
    {
      id: "bor-002",
      assetId: "ast-004",
      assetCode: "AST-KND-01",
      assetName: "Mobil Minibus Operasional HiAce Commuter",
      docTitle: "BPKB Asli & Faktur Pembelian",
      docNumber: "BPKB No. N-09182319",
      borrowerName: "Pak Joko Suwandi",
      borrowerRole: "Staf Sarpras & Driver Operasional",
      borrowerPhone: "0877-6655-4433",
      borrowDate: "2026-08-25",
      dueDate: "2026-09-05",
      purpose: "Pengurusan perpanjangan STNK dan cek fisik kendaraan di Kantor Samsat",
      status: "Dipinjam",
      approvedBy: "Fahmi Maulana Dwi, S.Kom. (Admin Database)",
      notes: "Disertai tanda terima resmi peminjaman BPKB."
    },
    {
      id: "bor-003",
      assetId: "ast-003",
      assetCode: "AST-GDG-01",
      assetName: "Gedung Pembelajaran 3 Lantai",
      docTitle: "Salinan IMB / PBG & Gambar As-Built Drawing",
      docNumber: "IMB/PBG No. 640/2018/DTR",
      borrowerName: "Ir. Hendro Prasetyo",
      borrowerRole: "Konsultan Arsitek Renovasi Lab",
      borrowerPhone: "0818-7788-9900",
      borrowDate: "2026-07-15",
      dueDate: "2026-08-01",
      returnDate: "2026-07-28",
      purpose: "Studi kelayakan penambahan partisi akustik ruang multimedia lantai 2",
      status: "Dikembalikan",
      approvedBy: "Ustadz Budi Utomo (Sarpras)",
      notes: "Dokumen telah dikembalikan dalam kondisi lengkap dan baik."
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
      educationLevel: "SMA",
      classGrade: "KELAS 11",
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
      educationLevel: "SMA",
      classGrade: "KELAS 11",
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
      educationLevel: "SMP",
      classGrade: "KELAS 8",
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
      educationLevel: "SMP",
      classGrade: "KELAS 7",
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
      educationLevel: "SDIT",
      classGrade: "KELAS 4",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Reguler",
      parentName: "Eko Prasetyo, S.T.",
      parentPhone: "0811-2233-4455",
      tuitionStatus: "Lunas",
      averageGrade: 93.0,
      achievementsCount: 2,
      address: "Jl. Raya Condet No. 15B",
      notes: "Juara 2 Lomba Pildacil Antar SD se-DKI"
    },
    {
      id: "std-006",
      nisn: "0135069784",
      nis: "242503045",
      name: "Khansa Maryam Humaira",
      gender: "P",
      educationLevel: "SDIT",
      classGrade: "KELAS 2",
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
      educationLevel: "RA",
      classGrade: "RA B",
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
      educationLevel: "SMA",
      classGrade: "KELAS 12",
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
    },
    {
      id: "std-009",
      nisn: "0067123984",
      nis: "222301015",
      name: "Fakhri Alamsyah, S.Tr.Kom",
      gender: "L",
      educationLevel: "SMA",
      classGrade: "Alumni SMA (Angkatan 2024)",
      academicYear: "2023/2024",
      status: "Lulus",
      category: "Beasiswa Prestasi",
      parentName: "H. Suryono Alamsyah",
      parentPhone: "0812-4455-7788",
      tuitionStatus: "Lunas",
      averageGrade: 95.8,
      achievementsCount: 6,
      address: "Jl. Tebet Barat Dalam No. 18, Jakarta Selatan",
      notes: "Diterima di Institut Teknologi Bandung (ITB) Jurusan Teknik Informatika melalui jalur SNBP",
      graduationYear: "2023/2024",
      currentActivity: "Mahasiswa Institut Teknologi Bandung (ITB)",
      alumniPhone: "0812-4455-7788",
      alumniEmail: "fakhri.alamsyah@alumni.binainsanmandiri.org"
    },
    {
      id: "std-010",
      nisn: "0078239014",
      nis: "232402008",
      name: "Salma Nadira Azzahra",
      gender: "P",
      educationLevel: "SMP",
      classGrade: "Alumni SMP (Angkatan 2025)",
      academicYear: "2024/2025",
      status: "Lulus",
      category: "Reguler",
      parentName: "Dra. Hj. Nurul Hidayah",
      parentPhone: "0813-9900-1122",
      tuitionStatus: "Lunas",
      averageGrade: 93.4,
      achievementsCount: 4,
      address: "Jl. Cempaka Putih Timur No. 42",
      notes: "Melanjutkan pendidikan ke SMA Plus Insan Mandiri",
      graduationYear: "2024/2025",
      currentActivity: "Siswa SMA Plus Insan Mandiri (Tingkat Lanjut)",
      alumniPhone: "0813-9900-1122",
      alumniEmail: "salma.nadira@gmail.com"
    },
    {
      id: "std-011",
      nisn: "0088231045",
      nis: "252601018",
      name: "Daffa Ibnu Malik",
      gender: "L",
      educationLevel: "SMA",
      classGrade: "KELAS 10",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Reguler",
      parentName: "Drs. Hendrawan",
      parentPhone: "0812-1133-5577",
      tuitionStatus: "Lunas",
      averageGrade: 89.6,
      achievementsCount: 1,
      address: "Jl. Pemuda No. 8, Madiun",
      notes: "Siswa baru kelas 10, minat olimpiade biologi"
    },
    {
      id: "std-012",
      nisn: "0088231099",
      nis: "252601021",
      name: "Najwa Syakira",
      gender: "P",
      educationLevel: "SMA",
      classGrade: "KELAS 10",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Beasiswa Prestasi",
      parentName: "M. Yusuf Bachdim",
      parentPhone: "0813-4422-9900",
      tuitionStatus: "Gratis (Beasiswa)",
      averageGrade: 93.4,
      achievementsCount: 3,
      address: "Komplek Perumahan Indah Blok D",
      notes: "Hafidzah 5 Juz, Juara Debat Bahasa Inggris"
    },
    {
      id: "std-013",
      nisn: "0103445566",
      nis: "242502030",
      name: "Rizky Firmansyah",
      gender: "L",
      educationLevel: "SMP",
      classGrade: "KELAS 7",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Reguler",
      parentName: "Kurniawan Dwi, S.Pd.",
      parentPhone: "0877-3344-9988",
      tuitionStatus: "Lunas",
      averageGrade: 88.0,
      achievementsCount: 1,
      address: "Jl. Taman Sari Indah No. 12",
      notes: "Anggota tim futsal dan tahfidz juz 30"
    },
    {
      id: "std-014",
      nisn: "0099887766",
      nis: "232402010",
      name: "Zulfa Hanifah",
      gender: "P",
      educationLevel: "SMP",
      classGrade: "KELAS 9",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Beasiswa Yatim/Dhuafa",
      parentName: "Ibu Rahmawati (Wali)",
      parentPhone: "0856-7788-1122",
      tuitionStatus: "Gratis (Beasiswa)",
      averageGrade: 91.5,
      achievementsCount: 2,
      address: "Jl. Salak Barat No. 5",
      notes: "Persiapan ujian akhir madrasah & tahfidz 6 juz"
    },
    {
      id: "std-015",
      nisn: "0134556677",
      nis: "252603001",
      name: "Althaf Fayyadh",
      gender: "L",
      educationLevel: "SDIT",
      classGrade: "KELAS 1",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Reguler",
      parentName: "Dr. Aditya Nugraha",
      parentPhone: "0811-9988-2233",
      tuitionStatus: "Lunas",
      averageGrade: 94.0,
      achievementsCount: 1,
      address: "Jl. Merdeka No. 44, Madiun",
      notes: "Sangat mandiri dan rajin tadarus"
    },
    {
      id: "std-016",
      nisn: "0156778899",
      nis: "252604002",
      name: "Alya Zahira Putri",
      gender: "P",
      educationLevel: "RA",
      classGrade: "RA A",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Reguler",
      parentName: "Bambang Sudibyo",
      parentPhone: "0812-7766-3322",
      tuitionStatus: "Lunas",
      averageGrade: 92.0,
      achievementsCount: 1,
      address: "Jl. Kenanga No. 3",
      notes: "Hafalan doa harian dan surat pendek sangat fasih"
    },
    {
      id: "std-017",
      nisn: "0134882211",
      nis: "242503050",
      name: "Zidane Al-Faruq",
      gender: "L",
      educationLevel: "SDIT",
      classGrade: "KELAS 3",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Reguler",
      parentName: "Ahmad Fauzi",
      parentPhone: "0813-2233-6677",
      tuitionStatus: "Lunas",
      averageGrade: 91.0,
      achievementsCount: 2,
      address: "Jl. Pahlawan No. 27, Madiun",
      notes: "Aktif kegiatan pramuka dan tahfidz juz 29"
    },
    {
      id: "std-018",
      nisn: "0123991122",
      nis: "232403019",
      name: "Salwa Khairunnisa",
      gender: "P",
      educationLevel: "SDIT",
      classGrade: "KELAS 5",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Beasiswa Prestasi",
      parentName: "Drs. H. Sulaiman",
      parentPhone: "0857-8899-0011",
      tuitionStatus: "Gratis (Beasiswa)",
      averageGrade: 96.0,
      achievementsCount: 4,
      address: "Jl. Mastrip No. 19, Madiun",
      notes: "Juara 1 Lomba Sains Terpadu Tingkat Kota"
    },
    {
      id: "std-019",
      nisn: "0112773344",
      nis: "222303008",
      name: "Fadhil Rahmatullah",
      gender: "L",
      educationLevel: "SDIT",
      classGrade: "KELAS 6",
      academicYear: "2025/2026",
      status: "Aktif",
      category: "Reguler",
      parentName: "H. Joko Widodo, S.E.",
      parentPhone: "0812-4455-8899",
      tuitionStatus: "Lunas",
      averageGrade: 92.8,
      achievementsCount: 3,
      address: "Jl. Diponegoro No. 80, Madiun",
      notes: "Persiapan Ujian Sekolah & target hafal Juz 28-30"
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
      timestamp: new Date().toISOString(),
      status: "success",
      changesCount: 4,
      type: "Full Sync",
      message: "Sinkronisasi otomatis basis data seluruh modul berhasil tanpa konflik."
    }
  ],
  auditLogs: [
    {
      id: "aud-001",
      timestamp: new Date().toISOString(),
      userName: "Fahmi Maulana Dwi, S.Kom.",
      action: "SYNC",
      entityType: "Sistem",
      details: "Sistem basis data terhubung dan tersinkronisasi otomatis."
    }
  ],
  donations: [],
  meetings: []
};

// Helper to sanitize and normalize asset records strictly to 'Tanah', 'Kendaraan', 'Bangunan'
export function sanitizeAssets(assets: any[]): AssetItem[] {
  if (!Array.isArray(assets)) return DEFAULT_DATABASE.assets;
  return assets
    .map(asset => {
      let cat = asset.category;
      if (cat === "Kendaraan Operasional") cat = "Kendaraan";
      if (cat === "Bangunan & Gedung") cat = "Bangunan";
      return { 
        ...asset, 
        category: cat,
        legalDocNumber: asset.legalDocNumber != null ? String(asset.legalDocNumber).trim() : (asset.legalDocNumber || "")
      };
    })
    .filter(asset => asset.category === "Tanah" || asset.category === "Kendaraan" || asset.category === "Bangunan");
}

export function sanitizeTransfers(transfers: any[]): AssetTransferRecord[] {
  if (!Array.isArray(transfers)) return [];
  return transfers.map(t => {
    if (!t || typeof t !== "object") return t;
    return {
      ...t,
      id: String(t.id || ""),
      assetId: String(t.assetId || ""),
      assetCode: String(t.assetCode || ""),
      assetName: String(t.assetName || ""),
      category: t.category || "Tanah",
      fromOwner: t.fromOwner != null ? String(t.fromOwner).trim() : "",
      toOwner: t.toOwner != null ? String(t.toOwner).trim() : "",
      docType: t.docType != null ? String(t.docType).trim() : "",
      docNumber: t.docNumber != null ? String(t.docNumber).trim() : "",
      notaryOffice: t.notaryOffice != null ? String(t.notaryOffice).trim() : "",
      submissionDate: t.submissionDate != null ? String(t.submissionDate).trim() : "",
      targetDate: t.targetDate != null ? String(t.targetDate).trim() : "",
      completionDate: t.completionDate != null ? String(t.completionDate).trim() : undefined,
      status: t.status || "Verifikasi Dokumen",
      progressPercent: Number(t.progressPercent) || 0,
      estimatedCost: Number(t.estimatedCost) || 0,
      handlerName: t.handlerName != null ? String(t.handlerName).trim() : "",
      notes: t.notes != null ? String(t.notes).trim() : "",
      logs: Array.isArray(t.logs) ? t.logs : []
    };
  });
}

export function sanitizeBorrowedDocs(docs: any[]): any[] {
  if (!Array.isArray(docs)) return [];
  return docs.map(b => {
    if (!b || typeof b !== "object") return b;
    return {
      ...b,
      id: String(b.id || ""),
      assetId: String(b.assetId || ""),
      assetCode: String(b.assetCode || ""),
      assetName: String(b.assetName || ""),
      docTitle: b.docTitle != null ? String(b.docTitle).trim() : "",
      docNumber: b.docNumber != null ? String(b.docNumber).trim() : "",
      borrowerName: b.borrowerName != null ? String(b.borrowerName).trim() : "",
      borrowerRole: b.borrowerRole != null ? String(b.borrowerRole).trim() : "",
      borrowerPhone: b.borrowerPhone != null ? String(b.borrowerPhone).trim() : "",
      borrowDate: b.borrowDate != null ? String(b.borrowDate).trim() : "",
      dueDate: b.dueDate != null ? String(b.dueDate).trim() : "",
      returnDate: b.returnDate != null ? String(b.returnDate).trim() : undefined,
      actualReturnDate: b.actualReturnDate != null ? String(b.actualReturnDate).trim() : undefined,
      expectedReturnDate: b.expectedReturnDate != null ? String(b.expectedReturnDate).trim() : undefined,
      purpose: b.purpose != null ? String(b.purpose).trim() : "",
      status: b.status || "Dipinjam",
      approvedBy: b.approvedBy != null ? String(b.approvedBy).trim() : "",
      handoverOfficer: b.handoverOfficer != null ? String(b.handoverOfficer).trim() : "",
      notes: b.notes != null ? String(b.notes).trim() : ""
    };
  });
}

// Strictly allowed standard classes by level
export const ALLOWED_CLASSES_BY_LEVEL: Record<EducationLevel, string[]> = {
  RA: ["RA A", "RA B"],
  SDIT: ["KELAS 1", "KELAS 2", "KELAS 3", "KELAS 4", "KELAS 5", "KELAS 6"],
  SMP: ["KELAS 7", "KELAS 8", "KELAS 9"],
  SMA: ["KELAS 10", "KELAS 11", "KELAS 12"]
};

export const ALL_ALLOWED_CLASSES: string[] = [
  ...ALLOWED_CLASSES_BY_LEVEL.RA,
  ...ALLOWED_CLASSES_BY_LEVEL.SDIT,
  ...ALLOWED_CLASSES_BY_LEVEL.SMP,
  ...ALLOWED_CLASSES_BY_LEVEL.SMA
];

// Helper to normalize classes strictly into user-defined structure
export function normalizeStandardClass(rawClass?: string, level: EducationLevel = "SMA"): string {
  const allowed = ALLOWED_CLASSES_BY_LEVEL[level] || ALLOWED_CLASSES_BY_LEVEL.SMA;

  if (!rawClass) {
    return allowed[0];
  }

  const trimmed = rawClass.trim();

  // If already exactly matching an allowed class for this level
  const matched = allowed.find(c => c.toLowerCase() === trimmed.toLowerCase());
  if (matched) return matched;

  // Don't touch alumni / graduated status
  if (/alumni|lulus/i.test(trimmed)) return trimmed;

  // RA variations
  if (level === "RA" || /RA|TK|Kelompok/i.test(trimmed)) {
    if (/B\b|Kelompok\s*B|TK[- ]?B/i.test(trimmed)) return "RA B";
    return "RA A";
  }

  // SDIT variations (KELAS 1 - 6)
  if (level === "SDIT" || /SD|MI/i.test(trimmed)) {
    const match = trimmed.match(/\b([1-6])\b/);
    if (match) return `KELAS ${match[1]}`;
    return "KELAS 1";
  }

  // SMP variations (KELAS 7 - 9)
  if (level === "SMP" || /SMP|MTs/i.test(trimmed)) {
    const match79 = trimmed.match(/\b([7-9])\b/);
    if (match79) return `KELAS ${match79[1]}`;
    const match13 = trimmed.match(/\b([1-3])\b/);
    if (match13) {
      const g = parseInt(match13[1], 10) + 6;
      return `KELAS ${g}`;
    }
    return "KELAS 7";
  }

  // SMA variations (KELAS 10 - 12)
  if (level === "SMA" || /SMA|SMK|Aliyah|MA/i.test(trimmed)) {
    const match1012 = trimmed.match(/\b(1[0-2])\b/);
    if (match1012) return `KELAS ${match1012[1]}`;
    if (/\bX\b/i.test(trimmed)) return "KELAS 10";
    if (/\bXI\b/i.test(trimmed)) return "KELAS 11";
    if (/\bXII\b/i.test(trimmed)) return "KELAS 12";
    const match13 = trimmed.match(/\b([1-3])\b/);
    if (match13) {
      const g = parseInt(match13[1], 10) + 9;
      return `KELAS ${g}`;
    }
    return "KELAS 10";
  }

  // Final check: if it matches any standard class in another level, adjust if feasible or fallback
  const anyMatched = ALL_ALLOWED_CLASSES.find(c => c.toLowerCase() === trimmed.toLowerCase());
  if (anyMatched && allowed.includes(anyMatched)) {
    return anyMatched;
  }

  // Default fallback to first class of the level
  return allowed[0];
}

// Helper to sanitize student records strictly into 'RA' | 'SDIT' | 'SMP' | 'SMA' and standard classes
export function sanitizeStudents(students: any[]): StudentItem[] {
  if (!Array.isArray(students)) return DEFAULT_DATABASE.students;
  return students.map(s => {
    let lvl: EducationLevel = "SMA";
    const raw = String(s.educationLevel || "");
    if (raw.includes("RA") || raw.includes("TK")) lvl = "RA";
    else if (raw.includes("SD") || raw.includes("MI") || raw.includes("SDIT")) lvl = "SDIT";
    else if (raw.includes("SMP") || raw.includes("MTs")) lvl = "SMP";
    else if (raw.includes("SMA") || raw.includes("SMK") || raw.includes("Aliyah") || raw.includes("Pondok") || raw.includes("Santri")) lvl = "SMA";
    else if (raw === "RA" || raw === "SDIT" || raw === "SMP" || raw === "SMA") lvl = raw;
    
    const normalizedClass = s.status === "Lulus" || String(s.classGrade || "").toLowerCase().includes("alumni")
      ? s.classGrade
      : normalizeStandardClass(s.classGrade, lvl);

    return {
      ...s,
      educationLevel: lvl,
      classGrade: normalizedClass
    };
  });
}

// Helper to safely format asset name with new target owner upon finished balik nama
export function formatAssetNameWithNewOwner(originalName: string, targetOwner: string): string {
  if (!originalName || !originalName.trim()) {
    return targetOwner ? `Aset - a.n. ${targetOwner.trim()}` : "";
  }
  if (!targetOwner || !targetOwner.trim()) return originalName;

  const target = targetOwner.trim();
  const trimmedName = originalName.trim();

  // 1. If it has "(a.n. ...)" or "(a.n ...)" or "(a/n ...)" or "(atas nama ...)"
  const parenRegex = /\((?:a\.?n\.?|a\/n|atas\s+nama)\s+[^)]+\)/i;
  if (parenRegex.test(trimmedName)) {
    return trimmedName.replace(parenRegex, `(a.n. ${target})`);
  }

  // 2. If it has "- a.n. ...", "- a.n ...", "- a/n ...", "- atas nama ..."
  const dashRegex = /-\s*(?:a\.?n\.?|a\/n|atas\s+nama)\s+.*$/i;
  if (dashRegex.test(trimmedName)) {
    return trimmedName.replace(dashRegex, `- a.n. ${target}`);
  }

  // 3. If it has "a.n. ...", "a.n ...", "a/n ...", "atas nama ..."
  const generalAnRegex = /\b(?:a\.?n\.?|a\/n|atas\s+nama)\s+.*$/i;
  if (generalAnRegex.test(trimmedName)) {
    return trimmedName.replace(generalAnRegex, `a.n. ${target}`);
  }

  // 4. Default: append " - a.n. [target]"
  return `${trimmedName} - a.n. ${target}`;
}

// Helper to reliably match an asset item with a transfer record
// CRITICAL: Must use strict matching (ID or exact Code) to prevent false positive matching
// on generic asset name keywords (like "Tanah", "Gedung", "Mobil").
export function matchAssetWithTransfer(asset: AssetItem, transfer: AssetTransferRecord): boolean {
  if (!asset || !transfer) return false;
  
  // 1. Primary: Exact match by unique asset ID
  const tAssetId = String(transfer.assetId || "").trim().toLowerCase();
  const aId = String(asset.id || "").trim().toLowerCase();
  if (tAssetId && aId && tAssetId === aId) {
    return true;
  }
  
  // 2. Secondary: Exact match by unique asset Code (e.g. AST-TNH-03, AST-KND-01)
  const tCode = String(transfer.assetCode || "").trim().toLowerCase();
  const aCode = String(asset.code || "").trim().toLowerCase();
  if (tCode && aCode && tCode === aCode) {
    return true;
  }

  // 3. Tertiary: Exact full name match ONLY if neither assetId nor assetCode is specified on the transfer
  const tName = String(transfer.assetName || "").trim().toLowerCase();
  const aName = String(asset.name || "").trim().toLowerCase();
  if (!tAssetId && !tCode && tName && aName) {
    if (tName === aName) {
      return true;
    }
  }

  return false;
}

// Helper to reconcile all assets with transfers (ensures any finished transfer synchronizes the asset name, target owner, and new document number in the database)
export function reconcileTransfersWithAssets(
  assets: AssetItem[], 
  transfers: AssetTransferRecord[]
): { assets: AssetItem[]; transfers: AssetTransferRecord[] } {
  if (!Array.isArray(transfers) || transfers.length === 0) {
    return { assets: assets || [], transfers: transfers || [] };
  }

  const cleanTransfers = sanitizeTransfers(transfers);
  let updatedAssets = [...(assets || [])];
  let updatedTransfers = cleanTransfers.map(t => {
    if (t.status === "Selesai / Terbit Sertifikat" && t.toOwner) {
      const newName = formatAssetNameWithNewOwner(t.assetName, t.toOwner);
      return { ...t, assetName: newName };
    }
    return t;
  });

  updatedTransfers.forEach(transfer => {
    if (transfer.status === "Selesai / Terbit Sertifikat" && transfer.toOwner) {
      const targetOwner = String(transfer.toOwner || "").trim();
      const docNumStr = transfer.docNumber != null ? String(transfer.docNumber).trim() : "";

      updatedAssets = updatedAssets.map(a => {
        if (!matchAssetWithTransfer(a, transfer)) return a;
        
        const newName = formatAssetNameWithNewOwner(a.name, targetOwner);
        return {
          ...a,
          name: newName,
          registeredOwner: targetOwner,
          custodian: a.custodian && a.custodian.toLowerCase().includes("yayasan") ? a.custodian : targetOwner,
          originalOwner: transfer.fromOwner || a.originalOwner,
          transferStatus: "Selesai Balik Nama (a.n. Yayasan)",
          legalDocType: transfer.docType || a.legalDocType,
          legalDocNumber: docNumStr || a.legalDocNumber
        };
      });
    }
  });

  return { assets: updatedAssets, transfers: updatedTransfers };
}

// Local storage helpers
export function loadLocalDatabase(): DatabaseStore {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const cleanedAssets = sanitizeAssets(parsed.assets || DEFAULT_DATABASE.assets);
      const cleanedStudents = sanitizeStudents(parsed.students || DEFAULT_DATABASE.students);
      const rawTransfers = sanitizeTransfers(Array.isArray(parsed.assetTransfers) ? parsed.assetTransfers : DEFAULT_DATABASE.assetTransfers);
      
      const reconciled = reconcileTransfersWithAssets(
        cleanedAssets.length > 0 ? cleanedAssets : DEFAULT_DATABASE.assets,
        rawTransfers
      );

      return {
        ...DEFAULT_DATABASE,
        ...parsed,
        assets: reconciled.assets,
        assetTransfers: reconciled.transfers,
        borrowedDocs: sanitizeBorrowedDocs(Array.isArray(parsed.borrowedDocs) ? parsed.borrowedDocs : DEFAULT_DATABASE.borrowedDocs),
        employees: parsed.employees || DEFAULT_DATABASE.employees,
        students: cleanedStudents.length > 0 ? cleanedStudents : DEFAULT_DATABASE.students,
        adminReport: parsed.adminReport || DEFAULT_DATABASE.adminReport,
        syncHistory: parsed.syncHistory || DEFAULT_DATABASE.syncHistory,
        auditLogs: parsed.auditLogs || DEFAULT_DATABASE.auditLogs,
        donations: parsed.donations || [],
        meetings: (parsed.meetings || []).map((m: any) => ({
          ...m,
          description: Array.isArray(m.description) ? m.description : (m.description ? [m.description] : []),
          followUp: Array.isArray(m.followUp) ? m.followUp : (m.followUp ? [m.followUp] : []),
          followUpStatuses: Array.isArray(m.followUpStatuses) ? m.followUpStatuses : (Array.isArray(m.followUp) ? m.followUp.map(() => m.status || 'Belum Dimulai') : (m.followUp ? [m.status || 'Belum Dimulai'] : []))
        }))
      };
    }
  } catch (e) {
    console.error("Failed to load local storage database:", e);
  }
  return DEFAULT_DATABASE;
}

export function saveLocalDatabase(data: DatabaseStore) {
  try {
    const rawTransfers = sanitizeTransfers(data.assetTransfers || []);
    const reconciled = reconcileTransfersWithAssets(data.assets, rawTransfers);
    const cleanedData: DatabaseStore = {
      ...data,
      assets: sanitizeAssets(reconciled.assets),
      assetTransfers: reconciled.transfers,
      borrowedDocs: sanitizeBorrowedDocs(data.borrowedDocs || []),
      students: sanitizeStudents(data.students)
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanedData));
  } catch (e) {
    console.error("Failed to save to local storage:", e);
  }
}

// Server API helpers
export async function fetchServerDatabase(): Promise<DatabaseStore | null> {
  try {
    const response = await fetch("/api/db", {
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();
    if (json.success && json.data) {
      const rawTransfers = Array.isArray(json.data.assetTransfers)
        ? json.data.assetTransfers
        : DEFAULT_DATABASE.assetTransfers;
      const rawAssets = json.data.assets || DEFAULT_DATABASE.assets;
      const reconciled = reconcileTransfersWithAssets(rawAssets, rawTransfers);

      const cleanedData: DatabaseStore = {
        ...json.data,
        assets: sanitizeAssets(reconciled.assets),
        assetTransfers: reconciled.transfers,
        borrowedDocs: Array.isArray(json.data.borrowedDocs)
          ? json.data.borrowedDocs
          : DEFAULT_DATABASE.borrowedDocs,
        sheetsConfig: json.data.sheetsConfig
      };
      saveLocalDatabase(cleanedData);
      return cleanedData;
    }
  } catch (error) {
    console.warn("Could not fetch server database (using local):", error);
  }
  return null;
}

export async function syncDatabaseToServer(data: DatabaseStore): Promise<{
  success: boolean;
  syncedAt?: string;
  message?: string;
}> {
  try {
    const response = await fetch("/api/db/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();
    return json;
  } catch (error: any) {
    console.warn("Sync to server failed (saved locally):", error);
    return {
      success: false,
      message: error.message || "Gagal menghubungi server sync. Data tersimpan di memori lokal."
    };
  }
}

export async function requestAiAnalysis(params: {
  type: "executive_summary" | "admin_performance_narrative" | "asset_recommendations" | "custom";
  prompt?: string;
  currentData: DatabaseStore;
}): Promise<{ success: boolean; analysis: string; isFallback?: boolean }> {
  try {
    const response = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    return {
      success: false,
      analysis: "Tidak dapat menghubungi layanan analisis AI saat ini. Silakan periksa koneksi atau coba lagi nanti."
    };
  }
}

// Currency and Date Formatters
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatDateTimeIndo(dateTimeStr: string): string {
  if (!dateTimeStr) return "-";
  try {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(date);
  } catch {
    return dateTimeStr;
  }
}

// CSV Export Helper
export function exportToCSV(filename: string, rows: object[]) {
  if (!rows || !rows.length) return;
  const separator = ",";
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    "\n" +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = (row as any)[k] === null || (row as any)[k] === undefined ? "" : (row as any)[k];
            cell = typeof cell === "object" ? JSON.stringify(cell) : String(cell);
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
