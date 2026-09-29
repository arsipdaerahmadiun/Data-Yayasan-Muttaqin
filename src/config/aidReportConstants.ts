export const DESA_OPTIONS = [
  "Desa Taman",
  "Desa Mentawai",
  "Desa Caruban",
  "Desa Gilis",
  "Desa Manisrejo"
] as const;

export const KELOMPOK_BY_DESA: Record<string, string[]> = {
  "Desa Taman": [
    "Kelompok Taman",
    "Kelompok Josenan",
    "Kelompok Sawojajar",
    "Kelompok Dolopo",
    "Kelompok kertosari",
    "Kelompok sambirejo",
    "Kelompok meteseh",
    "Kelompok segulung",
    "Kelompok Blimbing"
  ],
  "Desa Mentawai": [
    "Kelompok mentawai",
    "Kelompok kebonagung",
    "Kelompok ngampel",
    "Kelompok syarekah",
    "Kelompok winongo",
    "Kelompok jiwan"
  ],
  "Desa Manisrejo": [
    "Kelompok Manisrejo",
    "Kelompok Kartoharjo",
    "Kelompok Munggur",
    "Kelompok Ngrowo",
    "Kelompok Randu Alas"
  ],
  "Desa Gilis": [
    "Kelompok gilis barat",
    "Kelompok gilis timur",
    "Kelompok Mranggen"
  ],
  "Desa Caruban": [
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
    "Kelompok sukorejo"
  ]
};

export const KELOMPOK_OPTIONS = Object.values(KELOMPOK_BY_DESA).flat();

export const DAERAH_OPTIONS = [
  "Daerah Madiun",
  "Daerah Jawa Timur II",
  "Daerah Ponorogo - Magetan",
  "Daerah Caruban Raya"
] as const;

export const MONTH_OPTIONS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
] as const;
