import React, { useState } from "react";
import { 
  CheckCircle2, 
  RotateCcw, 
  Check, 
  MapPin, 
  Car, 
  Building2,
  FileText
} from "lucide-react";
import { 
  AssetItem, 
  AssetCategory, 
  AssetCondition, 
  AssetLegalDocType 
} from "../../types";

interface AssetInputFormProps {
  onAddAsset: (asset: Omit<AssetItem, "id">) => void;
  onSuccessNavigate?: () => void;
}

type ActiveTabType = "tanah" | "kendaraan" | "bangunan";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const PENANGGUNG_JAWAB_OPTIONS = [
  "-- Pilih Daerah / Kelompok --",
  "SB Daerah",
  "SB Pondok Mini",
  "Desa Taman",
  "Desa Mentawai",
  "Desa Caruban",
  "Desa Gilis",
  "Desa Manisrejo",
  "Kelompok Taman",
  "Kelompok Josenan",
  "Kelompok Sawojajar",
  "Kelompok Dolopo",
  "Kelompok kertosari",
  "Kelompok sambirejo",
  "Kelompok meteseh",
  "Kelompok segulung",
  "Kelompok Blimbing",
  "Kelompok mentawai",
  "Kelompok kebonagung",
  "Kelompok ngampel",
  "Kelompok syarekah",
  "Kelompok winongo",
  "Kelompok jiwan",
  "Kelompok karanganyar",
  "Kelompok Manding",
  "Kelompok Maroon",
  "Kelompok wonoasri",
  "Kelompok kuwu",
  "Kelompok sekar petak",
  "Kelompok kedung rejo",
  "Kelompok pajaran",
  "Kelompok sumber bendo",
  "Kelompok gablokan",
  "Kelompok winong",
  "kelompok Mbadur",
  "Kelompok sukorejo",
  "Kelompok gilis barat",
  "Kelompok gilis timur",
  "Kelompok Mranggen",
  "Kelompok Manisrejo",
  "Kelompok Kartoharjo",
  "Kelompok Munggur",
  "Kelompok Ngrowo",
  "Kelompok Randu Alas"
];

export const AssetInputForm: React.FC<AssetInputFormProps> = ({ onAddAsset, onSuccessNavigate }) => {
  const [activeTab, setActiveTab] = useState<ActiveTabType>("tanah");
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form State - Tanah
  const [tanahState, setTanahState] = useState({
    jenisSertifikat: "SHM (Sertifikat Hak Milik)",
    nomorSertifikat: "",
    atasNamaSertifikat: "",
    kecamatan: "",
    desaKelurahan: "",
    penggunaan: "",
    luasTanah: "",
    tempatSimpanBerkasAsli: "",
    pdfCertificateScan: ""
  });

  // Form State - Kendaraan
  const [kendaraanState, setKendaraanState] = useState({
    jenisKendaraan: "MOTOR",
    nomorPolisi: "",
    merkTipe: "",
    atasNamaStnkBpkb: "",
    tahunPembuatan: "2026",
    kondisiKendaraan: "BAIK (Layak Jalan)",
    hariPajak: "1",
    bulanPajak: "Januari",
    penanggungJawab: "-- Pilih Daerah / Kelompok --",
    bpkbScan: ""
  });

  // Form State - Bangunan
  const [bangunanState, setBangunanState] = useState({
    namaGedung: "",
    kecamatan: "",
    desaKelurahan: "",
    luasBangunan: "",
    fungsiPenggunaan: "",
    nomorPbg: "",
    nomorSlf: "",
    kondisiBangunan: "BAIK (Kondisi Kokoh)"
  });

  // Reset current active form
  const handleReset = () => {
    if (activeTab === "tanah") {
      setTanahState({
        jenisSertifikat: "SHM (Sertifikat Hak Milik)",
        nomorSertifikat: "",
        atasNamaSertifikat: "",
        kecamatan: "",
        desaKelurahan: "",
        penggunaan: "",
        luasTanah: "",
        tempatSimpanBerkasAsli: "",
        pdfCertificateScan: ""
      });
    } else if (activeTab === "kendaraan") {
      setKendaraanState({
        jenisKendaraan: "MOTOR",
        nomorPolisi: "",
        merkTipe: "",
        atasNamaStnkBpkb: "",
        tahunPembuatan: "2026",
        kondisiKendaraan: "BAIK (Layak Jalan)",
        hariPajak: "1",
        bulanPajak: "Januari",
        penanggungJawab: "-- Pilih Daerah / Kelompok --",
        bpkbScan: ""
      });
    } else {
      setBangunanState({
        namaGedung: "",
        kecamatan: "",
        desaKelurahan: "",
        luasBangunan: "",
        fungsiPenggunaan: "",
        nomorPbg: "",
        nomorSlf: "",
        kondisiBangunan: "BAIK (Kondisi Kokoh)"
      });
    }
  };

  // Handle submit based on active tab
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date().toISOString().split("T")[0];

    if (activeTab === "tanah") {
      if (!tanahState.nomorSertifikat.trim() || !tanahState.atasNamaSertifikat.trim()) {
        alert("Mohon lengkapi Nomor Sertifikat dan Atas Nama Sertifikat.");
        return;
      }

      const landAreaNum = parseFloat(tanahState.luasTanah) || 0;
      const fullLocation = [tanahState.desaKelurahan, tanahState.kecamatan].filter(Boolean).join(", ") || "Lokasi Yayasan";
      const assetCode = `AST-TNH-${Math.floor(100 + Math.random() * 900)}`;
      const baseTitle = tanahState.penggunaan ? `Tanah (${tanahState.penggunaan})` : `Tanah ${tanahState.jenisSertifikat.split(" ")[0]}`;
      const assetName = `${baseTitle} - a.n. ${tanahState.atasNamaSertifikat.trim()}`;

      const newAsset: Omit<AssetItem, "id"> = {
        code: assetCode,
        name: assetName || `Tanah ${tanahState.jenisSertifikat}`,
        category: "Tanah" as AssetCategory,
        acquisitionDate: timestamp,
        acquisitionCost: landAreaNum > 0 ? landAreaNum * 1200000 : 500000000,
        currentValue: landAreaNum > 0 ? landAreaNum * 1500000 : 600000000,
        quantity: landAreaNum > 0 ? landAreaNum : 1,
        unit: "M2",
        condition: "Baik" as AssetCondition,
        location: fullLocation,
        custodian: tanahState.atasNamaSertifikat || "Pengurus Yayasan",
        notes: tanahState.penggunaan ? `Penggunaan: ${tanahState.penggunaan}. Simpan: ${tanahState.tempatSimpanBerkasAsli || "Brankas Pusat"}` : "",
        lastAuditDate: timestamp,
        status: "Aktif",
        legalDocType: (tanahState.jenisSertifikat.includes("SHM") ? "Sertifikat Hak Milik (SHM)" : tanahState.jenisSertifikat.includes("AIW") ? "Akta Ikrar Wakaf (AIW)" : "Sertifikat Hak Guna Bangunan (HGB)") as AssetLegalDocType,
        legalDocNumber: tanahState.nomorSertifikat,
        originalOwner: tanahState.atasNamaSertifikat,
        registeredOwner: tanahState.atasNamaSertifikat,
        transferStatus: "Belum Balik Nama (a.n. Pemilik Lama/Pewakif)",
        landArea: landAreaNum,
        district: tanahState.kecamatan,
        village: tanahState.desaKelurahan,
        usagePurpose: tanahState.penggunaan,
        archiveStorageLocation: tanahState.tempatSimpanBerkasAsli,
        pdfCertificateScan: tanahState.pdfCertificateScan || "Sertifikat_Terverifikasi.pdf",
        sourceOfFund: "Wakaf"
      };

      onAddAsset(newAsset);
    } else if (activeTab === "kendaraan") {
      if (!kendaraanState.nomorPolisi.trim() || !kendaraanState.merkTipe.trim()) {
        alert("Mohon lengkapi Nomor Polisi dan Merk / Tipe Kendaraan.");
        return;
      }

      let parsedCondition: AssetCondition = "Baik";
      if (kendaraanState.kondisiKendaraan.includes("RUSAK RINGAN")) parsedCondition = "Rusak Ringan";
      else if (kendaraanState.kondisiKendaraan.includes("RUSAK BERAT")) parsedCondition = "Rusak Berat";

      const assetCode = `AST-KND-${Math.floor(100 + Math.random() * 900)}`;
      const custodianName = kendaraanState.penanggungJawab !== "-- Pilih Daerah / Kelompok --" 
        ? kendaraanState.penanggungJawab 
        : "Divisi Transportasi";

      const newAsset: Omit<AssetItem, "id"> = {
        code: assetCode,
        name: `${kendaraanState.jenisKendaraan} - ${kendaraanState.merkTipe} (${kendaraanState.nomorPolisi.toUpperCase()})`,
        category: "Kendaraan" as AssetCategory,
        acquisitionDate: timestamp,
        acquisitionCost: kendaraanState.jenisKendaraan === "MOTOR" ? 25000000 : 250000000,
        currentValue: kendaraanState.jenisKendaraan === "MOTOR" ? 22000000 : 220000000,
        quantity: 1,
        unit: "Unit",
        condition: parsedCondition,
        location: custodianName,
        custodian: custodianName,
        notes: `Tahun Pembuatan: ${kendaraanState.tahunPembuatan}. Jatuh Tempo Pajak: ${kendaraanState.hariPajak} ${kendaraanState.bulanPajak}.`,
        lastAuditDate: timestamp,
        status: "Aktif",
        legalDocType: "BPKB & STNK",
        legalDocNumber: kendaraanState.nomorPolisi.toUpperCase(),
        licensePlate: kendaraanState.nomorPolisi.toUpperCase(),
        registeredOwner: kendaraanState.atasNamaStnkBpkb || "Yayasan",
        originalOwner: kendaraanState.atasNamaStnkBpkb,
        transferStatus: "Selesai Balik Nama (a.n. Yayasan)",
        vehicleType: kendaraanState.jenisKendaraan,
        vehicleBrand: kendaraanState.merkTipe,
        vehicleYear: kendaraanState.tahunPembuatan,
        taxDay: kendaraanState.hariPajak,
        taxMonth: kendaraanState.bulanPajak,
        bpkbScan: kendaraanState.bpkbScan || "BPKB_STNK_Valid.pdf",
        sourceOfFund: "Kas Yayasan"
      };

      onAddAsset(newAsset);
    } else {
      // Bangunan
      if (!bangunanState.namaGedung.trim() || !bangunanState.luasBangunan.trim()) {
        alert("Mohon lengkapi Nama Gedung / Bangunan dan Luas Bangunan.");
        return;
      }

      let parsedCondition: AssetCondition = "Baik";
      if (bangunanState.kondisiBangunan.includes("RENOVASI")) parsedCondition = "Rusak Ringan";
      else if (bangunanState.kondisiBangunan.includes("RUSAK")) parsedCondition = "Rusak Berat";

      const bldgAreaNum = parseFloat(bangunanState.luasBangunan) || 0;
      const fullLocation = [bangunanState.desaKelurahan, bangunanState.kecamatan].filter(Boolean).join(", ") || "Kampus Pusat";
      const assetCode = `AST-GDG-${Math.floor(100 + Math.random() * 900)}`;

      const newAsset: Omit<AssetItem, "id"> = {
        code: assetCode,
        name: bangunanState.namaGedung,
        category: "Bangunan" as AssetCategory,
        acquisitionDate: timestamp,
        acquisitionCost: bldgAreaNum > 0 ? bldgAreaNum * 3500000 : 800000000,
        currentValue: bldgAreaNum > 0 ? bldgAreaNum * 3800000 : 850000000,
        quantity: 1,
        unit: "Gedung",
        condition: parsedCondition,
        location: fullLocation,
        custodian: "Bagian Sarana & Prasarana",
        notes: `Fungsi: ${bangunanState.fungsiPenggunaan || "-"}. PBG: ${bangunanState.nomorPbg || "-"}, SLF: ${bangunanState.nomorSlf || "-"}`,
        lastAuditDate: timestamp,
        status: "Aktif",
        legalDocType: "Sertifikat Hak Guna Bangunan (HGB)",
        legalDocNumber: bangunanState.nomorPbg || bangunanState.nomorSlf || "PBG Terdaftar",
        buildingArea: bldgAreaNum,
        district: bangunanState.kecamatan,
        village: bangunanState.desaKelurahan,
        usagePurpose: bangunanState.fungsiPenggunaan,
        pbgNumber: bangunanState.nomorPbg,
        slfNumber: bangunanState.nomorSlf,
        transferStatus: "Selesai Balik Nama (a.n. Yayasan)",
        sourceOfFund: "Kas Yayasan"
      };

      onAddAsset(newAsset);
    }

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      handleReset();
      if (onSuccessNavigate) {
        onSuccessNavigate();
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Category Segmented Control Tabs */}
      <div className="bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("tanah")}
          className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold flex items-start justify-center gap-2 transition-all ${
            activeTab === "tanah"
              ? "bg-white text-slate-900 shadow-2xs border border-slate-200/60 font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <MapPin className={`w-3.5 h-3.5 ${activeTab === "tanah" ? "text-blue-700" : "text-slate-400"}`} />
          <span>Tanah</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("kendaraan")}
          className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold flex items-start justify-center gap-2 transition-all ${
            activeTab === "kendaraan"
              ? "bg-white text-slate-900 shadow-2xs border border-slate-200/60 font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Car className={`w-3.5 h-3.5 ${activeTab === "kendaraan" ? "text-blue-700" : "text-slate-400"}`} />
          <span>Kendaraan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bangunan")}
          className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold flex items-start justify-center gap-2 transition-all ${
            activeTab === "bangunan"
              ? "bg-white text-slate-900 shadow-2xs border border-slate-200/60 font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Building2 className={`w-3.5 h-3.5 ${activeTab === "bangunan" ? "text-blue-700" : "text-slate-400"}`} />
          <span>Bangunan</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {submittedSuccess && (
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 flex items-center gap-2.5 text-xs animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-medium">Data aset berhasil disimpan ke dalam buku induk inventaris.</span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ======================= TAB 1: TANAH ======================= */}
          {activeTab === "tanah" && (
            <div className="space-y-4">
              {/* Jenis Sertifikat */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Jenis Sertifikat <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={tanahState.jenisSertifikat}
                    onChange={(e) => setTanahState({ ...tanahState, jenisSertifikat: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all cursor-pointer appearance-none pr-8"
                  >
                    <option value="SHM (Sertifikat Hak Milik)">SHM (Sertifikat Hak Milik)</option>
                    <option value="HGB (Sertifikat Hak Guna Bangunan)">HGB (Sertifikat Hak Guna Bangunan)</option>
                    <option value="AIW (Akta Ikrar Wakaf)">AIW (Akta Ikrar Wakaf)</option>
                    <option value="Surat Girik / Letter C">Surat Girik / Letter C</option>
                    <option value="Petok D">Petok D</option>
                    <option value="Sertifikat Hak Pakai">Sertifikat Hak Pakai</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Nomor Sertifikat */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nomor Sertifikat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tanahState.nomorSertifikat}
                  onChange={(e) => setTanahState({ ...tanahState, nomorSertifikat: e.target.value })}
                  placeholder="Contoh: No. 10.05.01.03.1.00234"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>

              {/* Atas Nama Sertifikat */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Atas Nama Sertifikat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tanahState.atasNamaSertifikat}
                  onChange={(e) => setTanahState({ ...tanahState, atasNamaSertifikat: e.target.value })}
                  placeholder="Nama pemilik sah yang tercantum"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>

              {/* Kecamatan & Desa/Kelurahan Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Kecamatan
                  </label>
                  <input
                    type="text"
                    value={tanahState.kecamatan}
                    onChange={(e) => setTanahState({ ...tanahState, kecamatan: e.target.value })}
                    placeholder="Pilih atau ketik kecamatan..."
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Desa / Kelurahan
                  </label>
                  <input
                    type="text"
                    value={tanahState.desaKelurahan}
                    onChange={(e) => setTanahState({ ...tanahState, desaKelurahan: e.target.value })}
                    placeholder="Pilih atau ketik desa..."
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Penggunaan */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Penggunaan
                </label>
                <input
                  type="text"
                  value={tanahState.penggunaan}
                  onChange={(e) => setTanahState({ ...tanahState, penggunaan: e.target.value })}
                  placeholder="Contoh: Kantor, Sawah, Fasilitas Kesehatan"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>

              {/* Luas Tanah (m²) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Luas Tanah (m²)
                </label>
                <input
                  type="text"
                  value={tanahState.luasTanah}
                  onChange={(e) => setTanahState({ ...tanahState, luasTanah: e.target.value })}
                  placeholder="Contoh: 150 (kosongkan jika tidak tahu)"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>

              {/* Tempat Simpan Berkas Asli */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tempat Simpan Berkas Asli
                </label>
                <input
                  type="text"
                  value={tanahState.tempatSimpanBerkasAsli}
                  onChange={(e) => setTanahState({ ...tanahState, tempatSimpanBerkasAsli: e.target.value })}
                  placeholder="Contoh: Brankas Kantor Pusat (Madiun)"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>

              {/* Upload Scan Sertifikat PDF */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Upload Scan Sertifikat (Format PDF)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setTanahState({ ...tanahState, pdfCertificateScan: file.name });
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                {tanahState.pdfCertificateScan && (
                  <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                    File terpilih: {tanahState.pdfCertificateScan}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ======================= TAB 2: KENDARAAN ======================= */}
          {activeTab === "kendaraan" && (
            <div className="space-y-4">
              {/* Jenis Kendaraan */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Jenis Kendaraan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={kendaraanState.jenisKendaraan}
                    onChange={(e) => setKendaraanState({ ...kendaraanState, jenisKendaraan: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all cursor-pointer appearance-none pr-8"
                  >
                    <option value="MOTOR">MOTOR</option>
                    <option value="MOBIL">MOBIL</option>
                    <option value="AMBULANCE">AMBULANCE</option>
                    <option value="BUS OPERASIONAL">BUS OPERASIONAL</option>
                    <option value="TRUK / PICKUP">TRUK / PICKUP</option>
                    <option value="SEPEDA LISTRIK / LAINNYA">SEPEDA LISTRIK / LAINNYA</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Nomor Polisi (Nopol) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nomor Polisi (Nopol) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kendaraanState.nomorPolisi}
                  onChange={(e) => setKendaraanState({ ...kendaraanState, nomorPolisi: e.target.value })}
                  placeholder="CONTOH: AE 1234 BZ"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none uppercase transition-all"
                />
              </div>

              {/* Merk / Tipe */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Merk / Tipe <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kendaraanState.merkTipe}
                  onChange={(e) => setKendaraanState({ ...kendaraanState, merkTipe: e.target.value })}
                  placeholder="Contoh: Honda Vario 150, Toyota Avanza"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>

              {/* Atas Nama STNK/BPKB */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Atas Nama STNK/BPKB <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kendaraanState.atasNamaStnkBpkb}
                  onChange={(e) => setKendaraanState({ ...kendaraanState, atasNamaStnkBpkb: e.target.value })}
                  placeholder="Nama pemilik STNK asli"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>

              {/* Tahun Pembuatan */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tahun Pembuatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kendaraanState.tahunPembuatan}
                  onChange={(e) => setKendaraanState({ ...kendaraanState, tahunPembuatan: e.target.value })}
                  placeholder="2026"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>

              {/* Kondisi Kendaraan */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kondisi Kendaraan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={kendaraanState.kondisiKendaraan}
                    onChange={(e) => setKendaraanState({ ...kendaraanState, kondisiKendaraan: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all cursor-pointer appearance-none pr-8"
                  >
                    <option value="BAIK (Layak Jalan)">Baik (Layak Jalan)</option>
                    <option value="RUSAK RINGAN (Butuh Servis)">Rusak Ringan (Butuh Servis)</option>
                    <option value="RUSAK BERAT (Mangkrak)">Rusak Berat (Mangkrak)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Tanggal & Bulan Pajak */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tanggal & Bulan Pajak <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">HARI / TANGGAL</span>
                    <div className="relative">
                      <select
                        value={kendaraanState.hariPajak}
                        onChange={(e) => setKendaraanState({ ...kendaraanState, hariPajak: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all cursor-pointer appearance-none pr-8"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d.toString()}>{d}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">NAMA BULAN</span>
                    <div className="relative">
                      <select
                        value={kendaraanState.bulanPajak}
                        onChange={(e) => setKendaraanState({ ...kendaraanState, bulanPajak: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all cursor-pointer appearance-none pr-8"
                      >
                        {MONTH_NAMES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Penanggung Jawab */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Penanggung Jawab <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={kendaraanState.penanggungJawab}
                    onChange={(e) => setKendaraanState({ ...kendaraanState, penanggungJawab: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all cursor-pointer appearance-none pr-8"
                  >
                    {PENANGGUNG_JAWAB_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Upload Scan BPKB / STNK */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Upload Scan BPKB & STNK (PDF / Gambar)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setKendaraanState({ ...kendaraanState, bpkbScan: file.name });
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                {kendaraanState.bpkbScan && (
                  <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                    File terpilih: {kendaraanState.bpkbScan}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ======================= TAB 3: BANGUNAN ======================= */}
          {activeTab === "bangunan" && (
            <div className="space-y-4">
              {/* Nama Gedung / Bangunan */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Gedung / Bangunan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bangunanState.namaGedung}
                  onChange={(e) => setBangunanState({ ...bangunanState, namaGedung: e.target.value })}
                  placeholder="Contoh: Gedung Serba Guna Madiun Baru"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>

              {/* Kecamatan & Desa/Kelurahan Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Kecamatan
                  </label>
                  <input
                    type="text"
                    value={bangunanState.kecamatan}
                    onChange={(e) => setBangunanState({ ...bangunanState, kecamatan: e.target.value })}
                    placeholder="Pilih atau ketik kecamatan..."
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Desa / Kelurahan
                  </label>
                  <input
                    type="text"
                    value={bangunanState.desaKelurahan}
                    onChange={(e) => setBangunanState({ ...bangunanState, desaKelurahan: e.target.value })}
                    placeholder="Pilih atau ketik desa..."
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Luas Bangunan (M²) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Luas Bangunan (M²) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bangunanState.luasBangunan}
                  onChange={(e) => setBangunanState({ ...bangunanState, luasBangunan: e.target.value })}
                  placeholder="Luas dalam Meter Persegi (angka)"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>

              {/* Fungsi / Penggunaan Gedung */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Fungsi / Penggunaan Gedung <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bangunanState.fungsiPenggunaan}
                  onChange={(e) => setBangunanState({ ...bangunanState, fungsiPenggunaan: e.target.value })}
                  placeholder="Contoh: Gedung Pertemuan, Gudang Logistik"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>

              {/* Nomor PBG & Nomor SLF Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nomor PBG (IMB Lama)
                  </label>
                  <input
                    type="text"
                    value={bangunanState.nomorPbg}
                    onChange={(e) => setBangunanState({ ...bangunanState, nomorPbg: e.target.value })}
                    placeholder="Contoh: PBG-357701-..."
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nomor SLF (Laik Fungsi)
                  </label>
                  <input
                    type="text"
                    value={bangunanState.nomorSlf}
                    onChange={(e) => setBangunanState({ ...bangunanState, nomorSlf: e.target.value })}
                    placeholder="Contoh: SLF-357701-..."
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Kondisi Bangunan */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kondisi Bangunan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={bangunanState.kondisiBangunan}
                    onChange={(e) => setBangunanState({ ...bangunanState, kondisiBangunan: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all cursor-pointer appearance-none pr-8"
                  >
                    <option value="BAIK (Kondisi Kokoh)">Baik (Kondisi Kokoh)</option>
                    <option value="PERLU RENOVASI RINGAN">Perlu Renovasi Ringan</option>
                    <option value="RUSAK / REHABILITASI TOTAL">Rusak / Rehabilitasi Total</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Unified Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-xs flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Form
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              Simpan Data Aset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
