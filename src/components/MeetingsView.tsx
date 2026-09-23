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
      const q = (searchTerm || "").toLowerCase().trim();
      const descArr = Array.isArray(m.description) ? m.description : (m.description ? [m.description] : []);
      const followArr = Array.isArray(m.followUp) ? m.followUp : (m.followUp ? [m.followUp] : []);
      return (
        (m.title || "").toLowerCase().includes(q) ||
        (m.leader || "").toLowerCase().includes(q) ||
        descArr.join(" ").toLowerCase().includes(q) ||
        followArr.join(" ").toLowerCase().includes(q)
      );
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meetings, searchTerm]);

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
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hasil Pengarahan & Musyawarah</h1>
            <p className="text-xs text-slate-500">Pencatatan notulensi, keputusan, dan tindak lanjut dari pertemuan pondok</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!readOnly && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Notulensi</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Meetings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMeetings.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200 border-dashed">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Belum ada data musyawarah/rapat yang sesuai dengan pencarian.</p>
          </div>
        ) : (
          filteredMeetings.map(meeting => (
            <div key={meeting.id} className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                  {meeting.category}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                  meeting.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                  meeting.status === 'Dalam Proses' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 dark:bg-[#1a1d21] text-slate-600'
                }`}>
                  {meeting.status}
                </span>
              </div>
              
              <h3 className="text-base font-bold text-slate-900 mb-1 leading-tight">{meeting.title}</h3>
              
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-4 bg-slate-50 dark:bg-[#121417] px-2 py-1 rounded-md inline-flex border border-slate-100">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>{new Date(meeting.date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>

              <div className="space-y-4 flex-1">
                {/* Meta info: Leader & Participants */}
                <div className="flex flex-col gap-2.5 bg-slate-50/ dark:bg-[#121417]/50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-0.5">Pemimpin</span>
                      <span className="text-slate-800 font-medium leading-none">{meeting.leader}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-0.5">Peserta</span>
                      <span className="text-slate-600 leading-snug line-clamp-2">{meeting.participants}</span>
                    </div>
                  </div>
                </div>

                {/* Results & Follow-ups */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-700">Hasil & Tindak Lanjut</span>
                  </div>
                  <div className="space-y-3">
                    {(Array.isArray(meeting.description) ? meeting.description : (meeting.description ? [meeting.description] : [])).map((desc, i) => {
                      const fuList = Array.isArray(meeting.followUp) ? meeting.followUp : (meeting.followUp ? [meeting.followUp] : []);
                      const fu = fuList[i] || "";
                      return (
                        <div key={i} className="relative pl-4">
                          <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                          {fu && <div className="absolute left-[2px] top-3 bottom-0 w-[2px] bg-slate-100 dark:bg-[#1a1d21]"></div>}
                          
                          <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{desc}</p>
                          
                          {fu && (() => {
                            const statuses = meeting.followUpStatuses || [];
                            const fuStatus = statuses[i] || meeting.status || 'Belum Dimulai';
                            const isSelesai = fuStatus === 'Selesai';
                            const isProses = fuStatus === 'Dalam Proses';
                            return (
                              <div className={`mt-2 pl-3 border-l-2 ${isSelesai ? 'border-emerald-200' : isProses ? 'border-amber-200' : 'border-indigo-100'} relative`}>
                                <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-2 ring-white ${isSelesai ? 'bg-emerald-400' : isProses ? 'bg-amber-400' : 'bg-indigo-400'}`}></div>
                                <div className={`p-2 rounded-r-lg border ${isSelesai ? 'bg-emerald-50/50 border-emerald-50' : isProses ? 'bg-amber-50/50 border-amber-50' : 'bg-indigo-50/50 border-indigo-50'}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold uppercase tracking-wider text-[9px] text-slate-500">Tindak Lanjut:</span>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isSelesai ? 'bg-emerald-100 text-emerald-700' : isProses ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 dark:bg-[#1a1d21] text-slate-600'}`}>{fuStatus}</span>
                                  </div>
                                  <p className={`text-xs leading-relaxed ${isSelesai ? 'text-emerald-900/70' : isProses ? 'text-amber-900/70' : 'text-indigo-900/70'}`}>{fu}</p>
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
                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(meeting)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMeetingToDelete(meeting)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              {editingMeeting ? "Ubah Notulensi Musyawarah" : "Tambah Notulensi Musyawarah"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori Rapat</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as MeetingCategory})} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    <option value="Rapat Pembina">Rapat Pembina</option>
                    <option value="Rapat Pengurus">Rapat Pengurus</option>
                    <option value="Musyawarah Yayasan">Musyawarah Yayasan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Agenda / Judul Rapat</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Contoh: Pembahasan Program Tahunan" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pemimpin / Pemateri</label>
                  <input type="text" required value={formData.leader} onChange={e => setFormData({...formData, leader: e.target.value})} placeholder="Nama pemimpin rapat" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Peserta</label>
                  <input type="text" required value={formData.participants} onChange={e => setFormData({...formData, participants: e.target.value})} placeholder="Contoh: Seluruh asatidz, pengurus yayasan, dll" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
              </div>
              
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Peserta Hadir</label>
                <input type="text" required value={formData.participants} onChange={e => setFormData({...formData, participants: e.target.value})} placeholder="Contoh: Seluruh asatidz, pengurus yayasan, dll" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121417] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>

              <div className="col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="block text-xs font-semibold text-slate-600">Hasil & Tindak Lanjut Rapat</span>
                  <button type="button" onClick={() => setFormData(prev => ({...prev, description: [...prev.description, ""], followUp: [...prev.followUp, ""], followUpStatuses: [...(prev.followUpStatuses || []), "Belum Dimulai"]}))} className="text-indigo-600 hover:text-indigo-700 text-[10px] uppercase font-bold flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded">
                    <Plus className="w-3 h-3" /> Tambah Poin
                  </button>
                </div>
                {formData.description.map((desc, index) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-50/ dark:bg-[#121417]/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Hasil / Keputusan {index + 1}</label>
                        <textarea required value={desc} onChange={e => {
                          const newDesc = [...formData.description];
                          newDesc[index] = e.target.value;
                          setFormData({...formData, description: newDesc});
                        }} placeholder="Tuliskan hasil poin keputusan musyawarah..." className="w-full px-3 py-2 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[60px] resize-y"></textarea>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tindak Lanjut (Opsional)</label>
                          {formData.followUp[index] && (
                            <select value={(formData.followUpStatuses && formData.followUpStatuses[index]) || "Belum Dimulai"} onChange={e => {
                              const newStatuses = [...(formData.followUpStatuses || [])];
                              while(newStatuses.length <= index) newStatuses.push("Belum Dimulai");
                              newStatuses[index] = e.target.value as any;
                              setFormData({...formData, followUpStatuses: newStatuses});
                            }} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#1a1d21] border-none rounded py-0.5 px-1.5 text-slate-600 focus:ring-0 cursor-pointer">
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
                        }} placeholder="Tuliskan tugas atau target pasca rapat..." className="w-full px-3 py-2 bg-white dark:bg-[#1a1d21] dark:border-[#2b3036] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[60px] resize-y"></textarea>
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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:bg-[#1a1d21] rounded-lg text-sm font-semibold transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">Simpan Notulensi</button>
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
