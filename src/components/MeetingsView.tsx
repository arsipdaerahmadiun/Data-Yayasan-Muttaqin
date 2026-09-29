import React, { useState, useMemo } from "react";
import { BookOpen, Plus, Search, Edit3, Trash2, Calendar, User, Users, MessageSquare, CheckCircle, Clock, X } from "lucide-react";
import { MeetingRecord, MeetingCategory } from "../types";
import { ConfirmDeleteModal } from "./common/ConfirmDeleteModal";

interface MeetingsViewProps {
  meetings: MeetingRecord[];
  onAddMeeting: (meeting: Omit<MeetingRecord, "id">) => void;
  onUpdateMeeting: (meeting: MeetingRecord) => void;
  onDeleteMeeting: (id: string) => void;
  searchTerm: string;
  readOnly?: boolean;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({
  meetings,
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
  searchTerm,
  readOnly
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingRecord | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<MeetingRecord | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  
  const [formData, setFormData] = useState<Omit<MeetingRecord, "id">>({
    date: new Date().toISOString().split('T')[0],
    title: "",
    category: "Rapat Pengurus",
    leader: "",
    participants: "",
    description: [""],
    followUp: [""],
    followUpStatuses: ["Belum Dimulai"],
    status: "Belum Dimulai"
  });

  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const q = (searchTerm || localSearch || "").toLowerCase().trim();
      const descArr = Array.isArray(m.description) ? m.description : (m.description ? [m.description] : []);
      const followArr = Array.isArray(m.followUp) ? m.followUp : (m.followUp ? [m.followUp] : []);
      if (!q) return true;

      return (
        (m.title || "").toLowerCase().includes(q) ||
        (m.leader || "").toLowerCase().includes(q) ||
        (m.category || "").toLowerCase().includes(q) ||
        (m.participants || "").toLowerCase().includes(q) ||
        (m.status || "").toLowerCase().includes(q) ||
        descArr.join(" ").toLowerCase().includes(q) ||
        followArr.join(" ").toLowerCase().includes(q)
      );
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meetings, searchTerm, localSearch]);

  const handleOpenAdd = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: "",
      category: "Rapat Pengurus",
      leader: "",
      participants: "",
      description: [""],
      followUp: [""],
      status: "Belum Dimulai"
    });
    setEditingMeeting(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (meeting: MeetingRecord) => {
    setEditingMeeting(meeting);
    setFormData({ ...meeting });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMeeting) {
      onUpdateMeeting({ ...formData, id: editingMeeting.id } as MeetingRecord);
    } else {
      onAddMeeting(formData);
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
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Hasil Pengarahan & Musyawarah
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20">
                  {meetings.length} Notulensi Terdata
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1 max-w-3xl">
                Pencatatan resmi notulensi, keputusan strategis, dan tindak lanjut dari pertemuan pengurus, pembina, serta musyawarah yayasan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {!readOnly && (
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Notulensi</span>
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
            placeholder="Cari agenda musyawarah, pimpinan rapat, topik pembahasan, atau tindak lanjut..."
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

      {/* Grid of Meetings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMeetings.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200 border-dashed">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20 text-slate-400" />
            <p>Belum ada data musyawarah/rapat yang sesuai dengan pencarian.</p>
          </div>
        ) : (
          filteredMeetings.map(meeting => (
            <div key={meeting.id} className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                  {meeting.category}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                  meeting.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' :
                  meeting.status === 'Dalam Proses' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {meeting.status}
                </span>
              </div>
              
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 leading-tight">{meeting.title}</h3>
              
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-[#121417] px-2.5 py-1 rounded-lg inline-flex border border-slate-100 dark:border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>{new Date(meeting.date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>

              <div className="space-y-4 flex-1">
                {/* Meta info: Leader & Participants */}
                <div className="flex flex-col gap-2.5 bg-slate-50 dark:bg-[#121417] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-0.5">Pemimpin</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold leading-none">{meeting.leader}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-0.5">Peserta</span>
                      <span className="text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">{meeting.participants}</span>
                    </div>
                  </div>
                </div>

                {/* Results & Follow-ups */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Hasil & Tindak Lanjut</span>
                  </div>
                  <div className="space-y-3">
                    {(Array.isArray(meeting.description) ? meeting.description : (meeting.description ? [meeting.description] : [])).map((desc, i) => {
                      const fuList = Array.isArray(meeting.followUp) ? meeting.followUp : (meeting.followUp ? [meeting.followUp] : []);
                      const fu = fuList[i] || "";
                      return (
                        <div key={i} className="relative pl-4">
                          <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          {fu && <div className="absolute left-[2px] top-3 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800"></div>}
                          
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{desc}</p>
                          
                          {fu && (() => {
                            const statuses = meeting.followUpStatuses || [];
                            const fuStatus = statuses[i] || meeting.status || 'Belum Dimulai';
                            const isSelesai = fuStatus === 'Selesai';
                            const isProses = fuStatus === 'Dalam Proses';
                            return (
                              <div className={`mt-2 pl-3 border-l-2 ${isSelesai ? 'border-emerald-200 dark:border-emerald-800' : isProses ? 'border-amber-200 dark:border-amber-800' : 'border-blue-100 dark:border-blue-900'} relative`}>
                                <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-900 ${isSelesai ? 'bg-emerald-400' : isProses ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
                                <div className={`p-2.5 rounded-xl border ${isSelesai ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40' : isProses ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40' : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40'}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold uppercase tracking-wider text-[9px] text-slate-500 dark:text-slate-400">Tindak Lanjut:</span>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isSelesai ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : isProses ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{fuStatus}</span>
                                  </div>
                                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{fu}</p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {!readOnly && (
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(meeting)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMeetingToDelete(meeting)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Musyawarah"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>{editingMeeting ? "Ubah Notulensi Musyawarah" : "Tambah Notulensi Musyawarah"}</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Rapat</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as MeetingCategory})} className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                    <option value="Rapat Pembina">Rapat Pembina</option>
                    <option value="Rapat Pengurus">Rapat Pengurus</option>
                    <option value="Musyawarah Yayasan">Musyawarah Yayasan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Agenda / Judul Rapat</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Contoh: Pembahasan Program Tahunan" className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pemimpin / Pemateri</label>
                  <input type="text" required value={formData.leader} onChange={e => setFormData({...formData, leader: e.target.value})} placeholder="Nama pemimpin rapat" className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Peserta Hadir</label>
                  <input type="text" required value={formData.participants} onChange={e => setFormData({...formData, participants: e.target.value})} placeholder="Contoh: Seluruh asatidz, pengurus yayasan, dll" className="w-full px-3 py-2 bg-white dark:bg-[#121417] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>

              <div className="col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Hasil & Tindak Lanjut Rapat</span>
                  <button type="button" onClick={() => setFormData(prev => ({...prev, description: [...prev.description, ""], followUp: [...prev.followUp, ""], followUpStatuses: [...(prev.followUpStatuses || []), "Belum Dimulai"]}))} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-xs font-bold flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> Tambah Poin
                  </button>
                </div>
                {formData.description.map((desc, index) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-50 dark:bg-[#121417] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Hasil / Keputusan {index + 1}</label>
                        <textarea required value={desc} onChange={e => {
                          const newDesc = [...formData.description];
                          newDesc[index] = e.target.value;
                          setFormData({...formData, description: newDesc});
                        }} placeholder="Tuliskan hasil poin keputusan musyawarah..." className="w-full px-3 py-2 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[60px] resize-y"></textarea>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tindak Lanjut (Opsional)</label>
                          {formData.followUp[index] && (
                            <select value={(formData.followUpStatuses && formData.followUpStatuses[index]) || "Belum Dimulai"} onChange={e => {
                              const newStatuses = [...(formData.followUpStatuses || [])];
                              while(newStatuses.length <= index) newStatuses.push("Belum Dimulai");
                              newStatuses[index] = e.target.value as any;
                              setFormData({...formData, followUpStatuses: newStatuses});
                            }} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 border-none rounded py-0.5 px-1.5 text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer">
                              <option value="Belum Dimulai">Belum Dimulai</option>
                              <option value="Dalam Proses">Dalam Proses</option>
                              <option value="Selesai">Selesai</option>
                            </select>
                          )}
                        </div>
                        <textarea value={formData.followUp[index] || ""} onChange={e => {
                          const newFu = [...formData.followUp];
                          while(newFu.length <= index) newFu.push("");
                          newFu[index] = e.target.value;
                          setFormData({...formData, followUp: newFu});
                        }} placeholder="Tuliskan tugas atau target pasca rapat..." className="w-full px-3 py-2 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[60px] resize-y"></textarea>
                      </div>
                    </div>
                    {formData.description.length > 1 && (
                      <button type="button" onClick={() => {
                        const newDesc = formData.description.filter((_, i) => i !== index);
                        const newFu = formData.followUp.filter((_, i) => i !== index);
                        const newFuStatus = (formData.followUpStatuses || []).filter((_, i) => i !== index);
                        setFormData({...formData, description: newDesc, followUp: newFu, followUpStatuses: newFuStatus});
                      }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-6 shrink-0" title="Hapus Poin">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-blue-500/20 transition-colors cursor-pointer">Simpan Notulensi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Iframe-Safe Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!meetingToDelete}
        title="Hapus Notulensi Musyawarah"
        itemName={meetingToDelete?.title}
        itemDetail={`Kategori: ${meetingToDelete?.category || "-"} | Tanggal: ${meetingToDelete?.date || "-"}`}
        confirmButtonText="Hapus Musyawarah Ini"
        onConfirm={() => {
          if (meetingToDelete) {
            onDeleteMeeting(meetingToDelete.id);
            setMeetingToDelete(null);
          }
        }}
        onClose={() => setMeetingToDelete(null)}
      />
    </div>
  );
};
