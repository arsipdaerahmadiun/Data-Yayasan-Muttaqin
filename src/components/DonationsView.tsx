import React, { useState, useMemo } from "react";
import { HeartHandshake, Plus, Search, Edit3, Trash2, Calendar, User, Package, Banknote, ListFilter, X } from "lucide-react";
import { DonationRecord, DonationCategory } from "../types";
import { formatRupiah } from "../services/api";
import { ConfirmDeleteModal } from "./common/ConfirmDeleteModal";

interface DonationsViewProps {
  donations: DonationRecord[];
  onAddDonation: (donation: Omit<DonationRecord, "id">) => void;
  onUpdateDonation: (donation: DonationRecord) => void;
  onDeleteDonation: (id: string) => void;
  searchTerm: string;
  readOnly?: boolean;
}

export const DonationsView: React.FC<DonationsViewProps> = ({
  donations,
  onAddDonation,
  onUpdateDonation,
  onDeleteDonation,
  searchTerm,
  readOnly
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<DonationRecord | null>(null);
  const [donationToDelete, setDonationToDelete] = useState<DonationRecord | null>(null);
  
  const [localSearch, setLocalSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const [formData, setFormData] = useState<Omit<DonationRecord, "id">>({
    date: new Date().toISOString().split('T')[0],
    donatorName: "",
    donatorContact: "",
    category: "Uang Tunai",
    amount: 0,
    itemDescription: "",
    quantity: "",
    receiverName: "",
    notes: ""
  });

  const filteredDonations = useMemo(() => {
    return donations.filter(d => {
      const q = (searchTerm || localSearch || "").toLowerCase().trim();
      if (!q) return true;

      return (
        (d.donatorName || "").toLowerCase().includes(q) ||
        (d.category || "").toLowerCase().includes(q) ||
        (d.receiverName || "").toLowerCase().includes(q) ||
        (d.itemDescription || "").toLowerCase().includes(q) ||
        (d.notes || "").toLowerCase().includes(q)
      );
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [donations, searchTerm, localSearch]);

  const totalAmount = donations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalItems = donations.filter(d => d.category !== "Uang Tunai").length;

  const handleOpenAdd = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      donatorName: "",
      donatorContact: "",
      category: "Uang Tunai",
      amount: 0,
      itemDescription: "",
      quantity: "",
      receiverName: "",
      notes: ""
    });
    setEditingDonation(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (donation: DonationRecord) => {
    setEditingDonation(donation);
    setFormData({ ...donation });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDonation) {
      onUpdateDonation({ ...formData, id: editingDonation.id } as DonationRecord);
    } else {
      onAddDonation(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 p-8 rounded-3xl bg-gradient-to-br from-blue-700 to-blue-600 text-white">
      {/* Unified Top Header Card */}
      <div className="bg-white/10 border border-white/20 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30 shadow-lg">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Data Donasi & Shodaqoh
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20">
                  {donations.length} Transaksi Terdata
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1 max-w-3xl">
                Pencatatan resmi penerimaan bantuan donasi, infaq, dan shodaqoh yang masuk ke rekening atau operasional Pondok/Yayasan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs flex flex-col backdrop-blur-sm">
              <span className="text-[10px] text-blue-100 font-medium">Total Uang Tunai</span>
              <span className="font-bold text-white text-sm font-mono">{formatRupiah(totalAmount)}</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs flex flex-col backdrop-blur-sm">
              <span className="text-[10px] text-blue-100 font-medium">Total Barang Masuk</span>
              <span className="font-bold text-white text-sm font-mono">{totalItems} Penerimaan</span>
            </div>
            {!readOnly && (
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Donasi</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/20 flex flex-col md:flex-row gap-3 items-center justify-between backdrop-blur-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-white/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama donatur, jenis barang, penerima, atau keterangan..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-xs md:text-sm bg-white/10 rounded-xl border border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 outline-none transition-all"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#121417] border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4 font-semibold w-32">Tanggal</th>
                <th className="p-4 font-semibold">Nama Donatur</th>
                <th className="p-4 font-semibold">Kategori & Rincian</th>
                <th className="p-4 font-semibold">Penerima (Staf)</th>
                <th className="p-4 font-semibold w-24 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    <HeartHandshake className="w-12 h-12 mx-auto mb-3 opacity-20 text-slate-400" />
                    <p>Belum ada data donasi yang sesuai dengan pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredDonations.map(donation => (
                  <tr key={donation.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{new Date(donation.date).toLocaleDateString("id-ID")}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{donation.donatorName}</div>
                      {donation.donatorContact && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{donation.donatorContact}</div>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 w-fit">
                          {donation.category === "Uang Tunai" ? <Banknote className="w-3 h-3 mr-1" /> : <Package className="w-3 h-3 mr-1" />}
                          {donation.category}
                        </span>
                        {donation.category === "Uang Tunai" ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">{formatRupiah(donation.amount || 0)}</span>
                        ) : (
                          <div className="text-xs text-slate-700 dark:text-slate-300">
                            {donation.itemDescription} <span className="text-slate-500 dark:text-slate-400 font-medium">({donation.quantity})</span>
                          </div>
                        )}
                        {donation.notes && <span className="text-xs text-slate-400 italic">"{donation.notes}"</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{donation.receiverName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!readOnly && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(donation)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Edit Data"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-delete-donation-${donation.id}`}
                              onClick={() => setDonationToDelete(donation)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>{editingDonation ? "Ubah Data Donasi" : "Tambah Data Donasi"}</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Penerimaan</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Penerima (Staf/Pengurus)</label>
                  <input type="text" required value={formData.receiverName} onChange={e => setFormData({...formData, receiverName: e.target.value})} placeholder="Contoh: Ustadz Ahmad" className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Donatur / Instansi</label>
                  <input type="text" required value={formData.donatorName} onChange={e => setFormData({...formData, donatorName: e.target.value})} placeholder="Hamba Allah / PT. X" className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kontak Donatur (Opsional)</label>
                  <input type="text" value={formData.donatorContact || ""} onChange={e => setFormData({...formData, donatorContact: e.target.value})} placeholder="No. HP / Alamat" className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Donasi</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as DonationCategory})} className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                  <option value="Uang Tunai">Uang Tunai</option>
                  <option value="Sembako">Sembako</option>
                  <option value="Material Bangunan">Material Bangunan</option>
                  <option value="Barang">Barang (Peralatan, ATK, dll)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {formData.category === "Uang Tunai" ? (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nominal Bantuan (Rp)</label>
                  <input type="number" required value={formData.amount || ""} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} placeholder="Contoh: 1000000" className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Barang / Deskripsi</label>
                    <input type="text" required value={formData.itemDescription || ""} onChange={e => setFormData({...formData, itemDescription: e.target.value})} placeholder="Contoh: Beras Ramos" className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kuantitas & Satuan</label>
                    <input type="text" required value={formData.quantity || ""} onChange={e => setFormData({...formData, quantity: e.target.value})} placeholder="Contoh: 50 Kg / 10 Sak" className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                </div>
              )}

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea value={formData.notes || ""} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Tujuan khusus (cth: untuk pembangunan asrama)" className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-20 resize-none"></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-blue-500/20 transition-colors cursor-pointer">Simpan Donasi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Iframe-Safe Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!donationToDelete}
        title="Hapus Data Donasi"
        itemName={donationToDelete?.donatorName}
        itemDetail={donationToDelete?.category === "Uang Tunai" ? formatRupiah(donationToDelete?.amount || 0) : donationToDelete?.itemDescription}
        confirmButtonText="Hapus Donasi Ini"
        onConfirm={() => {
          if (donationToDelete) {
            onDeleteDonation(donationToDelete.id);
            setDonationToDelete(null);
          }
        }}
        onClose={() => setDonationToDelete(null)}
      />
    </div>
  );
};
