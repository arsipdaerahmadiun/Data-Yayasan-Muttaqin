import React, { useState } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  Award, 
  CheckCircle2, 
  X, 
  UserCheck, 
  GraduationCap,
  Briefcase,
  List,
  Grid
} from "lucide-react";
import { EmployeeItem, EmployeeRole, EmploymentStatus, UnitDivision, EmployeeSubMenu } from "../types";
import { formatRupiah, formatDateIndo, exportToCSV } from "../services/api";
import { ConfirmDeleteModal } from "./common/ConfirmDeleteModal";

interface EmployeesViewProps {
  readOnly?: boolean;
  employees: EmployeeItem[];
  activeSubMenu?: EmployeeSubMenu;
  onSelectSubMenu?: (sub: EmployeeSubMenu) => void;
  onAddEmployee: (employee: Omit<EmployeeItem, "id">) => void;
  onUpdateEmployee: (employee: EmployeeItem) => void;
  onDeleteEmployee: (id: string) => void;
  searchTerm: string;
}

const ROLES: EmployeeRole[] = [
  "Guru / Pendidik",
  "Tenaga Administrasi",
  "Staf Keuangan",
  "Pengurus Yayasan",
  "Kepala Unit / Sekolah",
  "Tenaga Kebersihan & Keamanan",
  "IT Support"
];

const STATUSES: EmploymentStatus[] = [
  "Tetap (PNS/GTY)",
  "Kontrak (GTT/PTT)",
  "Honorer",
  "Magang / Relawan"
];

const UNITS: UnitDivision[] = [
  "Kantor Yayasan",
  "Unit RA / TK",
  "Unit SD / MI",
  "Unit SMP / MTs",
  "Unit SMA / SMK",
  "Unit Pondok Pesantren"
];

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  activeSubMenu = "ALL",
  onSelectSubMenu,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  searchTerm: globalSearch
}) => {
  const [localSearch, setLocalSearch] = useState("");
  // We use activeSubMenu instead of local unitFilter, but we can fallback if not provided
  const [unitFilter, setUnitFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return "cards";
    }
    return "table";
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeItem | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<EmployeeItem, "id">>({
    nip: "",
    name: "",
    role: "Guru / Pendidik",
    employmentStatus: "Tetap (PNS/GTY)",
    unit: "Unit SMA / SMK",
    phone: "",
    email: "",
    education: "S1",
    joinDate: new Date().toISOString().split("T")[0],
    monthlySalary: 5500000,
    isActive: true,
    positionTitle: ""
  });

  const search = globalSearch || localSearch;

  const currentUnitFilter = activeSubMenu !== "ALL" ? activeSubMenu : unitFilter;

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.name || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (emp.nip || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (emp.positionTitle || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (emp.email || "").toLowerCase().includes((search || "").toLowerCase());

    const matchesUnit = currentUnitFilter === "ALL" || emp.unit === currentUnitFilter;
    const matchesRole = roleFilter === "ALL" || emp.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || emp.employmentStatus === statusFilter;

    return matchesSearch && matchesUnit && matchesRole && matchesStatus;
  });

  const handleOpenAdd = () => {
    const nextNip = `YAS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    setFormData({
      nip: nextNip,
      name: "",
      role: "Guru / Pendidik",
      employmentStatus: "Tetap (PNS/GTY)",
      unit: "Unit SMA / SMK",
      phone: "08",
      email: "",
      education: "S1",
      joinDate: new Date().toISOString().split("T")[0],
      monthlySalary: 5500000,
      isActive: true,
      positionTitle: "Guru Mata Pelajaran"
    });
    setEditingEmployee(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp: EmployeeItem) => {
    setEditingEmployee(emp);
    setFormData({ ...emp });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nip.trim()) {
      alert("Mohon lengkapi NIP dan nama pegawai!");
      return;
    }

    if (editingEmployee) {
      onUpdateEmployee({
        ...formData,
        id: editingEmployee.id
      });
    } else {
      onAddEmployee(formData);
    }
    setIsAddModalOpen(false);
    setEditingEmployee(null);
  };

  const handleExportCSV = () => {
    const exportRows = filteredEmployees.map(e => ({
      "NIP": e.nip,
      "Nama Lengkap": e.name,
      "Jabatan / Posisi": e.positionTitle,
      "Peran / Kategori": e.role,
      "Unit Kerja": e.unit,
      "Status Kepegawaian": e.employmentStatus,
      "Pendidikan Terakhir": e.education,
      "Tanggal Bergabung": e.joinDate,
      "No. Telepon": e.phone,
      "Email": e.email,
      "Status Aktif": e.isActive ? "Aktif" : "Non-Aktif"
    }));
    exportToCSV(`Data_Pegawai_Yayasan_${new Date().toISOString().split("T")[0]}.csv`, exportRows);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Manajemen Data Pegawai, Guru & SDM Yayasan
          </h2>
          <p className="text-xs text-slate-500">
            Database profil tenaga pendidik, staf kantor, pengurus yayasan, kualifikasi pendidikan, dan unit kerja.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-300 hover:bg-slate-50 dark:bg-[#121417] text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            Ekspor CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Pegawai Baru
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari NIP, nama pegawai, jabatan..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#121417] rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Unit:</span>
            <select
              value={currentUnitFilter}
              onChange={(e) => {
                const val = e.target.value as EmployeeSubMenu;
                setUnitFilter(val);
                if (onSelectSubMenu) {
                  onSelectSubMenu(val);
                }
              }}
              className="text-xs py-1 px-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Unit ({employees.length})</option>
              {UNITS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Peran:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs py-1 px-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Peran</option>
              {ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1 px-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Status</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-[#1a1d21] p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "table" ? "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-blue-800 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Tampilan Tabel Rinci"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "cards" ? "bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] text-blue-800 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Tampilan Kartu Ringkas (Nyaman di HP)"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kartu</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Switch: Cards vs Table */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredEmployees.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl p-8 text-center text-slate-400 border border-slate-200">
              Tidak ada data pegawai yang sesuai dengan filter atau pencarian.
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug truncate">
                        {emp.name}
                      </h4>
                      <p className="text-xs font-mono text-blue-600 font-medium">
                        {emp.nip}
                      </p>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {emp.positionTitle || emp.role}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                    {emp.employmentStatus}
                  </span>
                </div>

                <div className="bg-slate-50/ dark:bg-[#121417]/80 rounded-xl p-2.5 text-xs text-slate-600 space-y-1.5 border border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Unit Kerja:</span>
                    <span className="font-semibold text-slate-800">{emp.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Pendidikan:</span>
                    <span className="font-semibold text-slate-800">{emp.education}</span>
                  </div>
                </div>

                {/* Contact and Actions Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {emp.phone && (
                      <a
                        href={`tel:${emp.phone}`}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Telepon / Hubungi Pegawai"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Hubungi</span>
                      </a>
                    )}
                    {emp.email && (
                      <a
                        href={`mailto:${emp.email}`}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-[#1a1d21] hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 text-xs"
                        title="Kirim Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit Pegawai"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-delete-employee-card-${emp.id}`}
                      onClick={() => setEmployeeToDelete(emp)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Pegawai"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Employees Data Table */
        <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 dark:bg-[#121417] text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">NIP & Nama Pegawai</th>
                <th className="px-4 py-3">Jabatan & Unit Kerja</th>
                <th className="px-4 py-3">Status & Pendidikan</th>
                <th className="px-4 py-3">Kontak & Email</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada data pegawai yang sesuai dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/ dark:bg-[#121417]/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] font-mono text-blue-700 font-medium">{emp.nip}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{emp.positionTitle || emp.role}</div>
                      <div className="text-[11px] text-slate-500">{emp.unit}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        {emp.employmentStatus}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">Lulusan: {emp.education}</div>
                    </td>
                    <td className="px-4 py-3 space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-800">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{emp.phone || "-"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Mail className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[130px]">{emp.email || "-"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          title="Edit Data Pegawai"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-employee-${emp.id}`}
                          onClick={() => setEmployeeToDelete(emp)}
                          title="Hapus Pegawai"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Add / Edit Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {editingEmployee ? "Edit Data Pegawai / SDM" : "Tambah Pegawai / Guru Baru"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Induk Pegawai (NIP)</label>
                  <input
                    type="text"
                    required
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Contoh: YAS-2024-001"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Contoh: Ahmad Baihaqi, S.Pd."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan Spesifik</label>
                  <input
                    type="text"
                    value={formData.positionTitle}
                    onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                    placeholder="Contoh: Guru Matematika & Wali Kelas 9"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran / Kategori</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Penempatan</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitDivision })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as EmploymentStatus })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pendidikan Terakhir</label>
                  <select
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                  >
                    <option value="SMA/SMK">SMA/SMK</option>
                    <option value="D3">D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / Telepon</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                    placeholder="0812-xxxx-xxxx"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Email Resmi</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                    placeholder="nama@binainsanmandiri.org"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Bergabung / TMT</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-700">
                  Status Pegawai Masih Aktif di Yayasan
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1a1d21] hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {editingEmployee ? "Simpan Perubahan" : "Tambah ke Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Iframe-Safe Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!employeeToDelete}
        title="Hapus Data Pegawai"
        itemName={employeeToDelete?.name}
        itemDetail={employeeToDelete?.nip}
        confirmButtonText="Hapus Pegawai Ini"
        onConfirm={() => {
          if (employeeToDelete) {
            onDeleteEmployee(employeeToDelete.id);
            setEmployeeToDelete(null);
          }
        }}
        onClose={() => setEmployeeToDelete(null)}
      />
    </div>
  );
};
