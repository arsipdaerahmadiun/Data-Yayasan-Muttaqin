import React, { useState, useMemo } from "react";
import { HeartHandshake, Plus, Search, Edit3, Trash2, Calendar, User, Package, Banknote, ListFilter } from "lucide-react";
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
      const q = (searchTerm || "").toLowerCase().trim();
      return (
        (d.donatorName || "").toLowerCase().includes(q) ||
        (d.category || "").toLowerCase().includes(q) ||
        (d.receiverName || "").toLowerCase().includes(q) ||
        (d.itemDescription || "").toLowerCase().includes(q) ||
        (d.notes || "").toLowerCase().includes(q)
      );
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [donations, searchTerm]);

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
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Data Donasi & Shodaqoh</h1>
            <p className="text-xs text-slate-500">Pencatatan penerimaan bantuan yang masuk ke Pondok/Yayasan</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#121417] border border-slate-200 text-xs flex flex-col">
            <span className="text-[10px] text-slate-500">Total Uang Tunai</span>
            <span className="font-bold text-emerald-700">{formatRupiah(totalAmount)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#121417] border border-slate-200 text-xs flex flex-col">
            <span className="text-[10px] text-slate-500">Total Barang Masuk</span>
            <span className="font-bold text-blue-700">{totalItems} Penerimaan</span>
          </div>
          {!readOnly && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Donasi</span>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#121417] border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <th className="p-4 font-semibold w-32">Tanggal</th>
                <th className="p-4 font-semibold">Nama Donatur</th>
                <th className="p-4 font-semibold">Kategori & Rincian</th>
                <th className="p-4 font-semibold">Penerima (Staf)</th>
                <th className="p-4 font-semibold w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <HeartHandshake className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Belum ada data donasi yang sesuai dengan pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredDonations.map(donation => (
                  <tr key={donation.id} className="hover:bg-slate-50/ dark:bg-[#121417]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(donation.date).toLocaleDateString("id-ID")}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{donation.donatorName}</div>
                      {donation.donatorContact && <div className="text-xs text-slate-500">{donation.donatorContact}</div>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-[#1a1d21] text-slate-600 w-fit">
                          {donation.category === "Uang Tunai" ? <Banknote className="w-3 h-3 mr-1" /> : <Package className="w-3 h-3 mr-1" />}
                          {donation.category}
                        </span>
                        {donation.category === "Uang Tunai" ? (
                          <span className="font-bold text-emerald-600">{formatRupiah(donation.amount || 0)}</span>
                        ) : (
                          <div className="text-sm text-slate-700">
                            {donation.itemDescription} <span className="text-slate-500 font-medium">({donation.quantity})</span>
                          </div>
                        )}
                        {donation.notes && <span className="text-xs text-slate-400 italic">"{donation.notes}"</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-600 text-xs">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{donation.receiverName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {!readOnly && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(donation)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit Data"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-delete-donation-${donation.id}`}
                              onClick={() => setDonationToDelete(donation)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-500" />
              {editingDonation ? "Ubah Data Donasi" : "Tambah Data Donasi"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Penerimaan</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Penerima (Staf/Pengurus)</label>
                  <input type="text" required value={formData.receiverName} onChange={e => setFormData({...formData, receiverName: e.target.value})} placeholder="Contoh: Ustadz Ahmad" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Donatur / Instansi</label>
                  <input type="text" required value={formData.donatorName} onChange={e => setFormData({...formData, donatorName: e.target.value})} placeholder="Hamba Allah / PT. X" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kontak Donatur (Opsional)</label>
                  <input type="text" value={formData.donatorContact || ""} onChange={e => setFormData({...formData, donatorContact: e.target.value})} placeholder="No. HP / Alamat" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori Donasi</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as DonationCategory})} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500">
                  <option value="Uang Tunai">Uang Tunai</option>
                  <option value="Sembako">Sembako</option>
                  <option value="Material Bangunan">Material Bangunan</option>
                  <option value="Barang">Barang (Peralatan, ATK, dll)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {formData.category === "Uang Tunai" ? (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nominal Bantuan (Rp)</label>
                  <input type="number" required value={formData.amount || ""} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} placeholder="Contoh: 1000000" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Barang / Deskripsi</label>
                    <input type="text" required value={formData.itemDescription || ""} onChange={e => setFormData({...formData, itemDescription: e.target.value})} placeholder="Contoh: Beras Ramos" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Kuantitas & Satuan</label>
                    <input type="text" required value={formData.quantity || ""} onChange={e => setFormData({...formData, quantity: e.target.value})} placeholder="Contoh: 50 Kg / 10 Sak" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" />
                  </div>
                </div>
              )}

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea value={formData.notes || ""} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Tujuan khusus (cth: untuk pembangunan masjid)" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 h-20 resize-none"></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:bg-[#1a1d21] rounded-lg text-sm font-semibold transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">Simpan Donasi</button>
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
