const fs = require('fs');
let content = fs.readFileSync('src/components/MeetingsView.tsx', 'utf8');

// 1. Replace the display block
const displayStartStr = '<div>\n                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Isi / Hasil</span>';
const displayEndStr = '</div>\n                )}';
const displayStart = content.indexOf(displayStartStr);
if (displayStart !== -1) {
  const displayEnd = content.indexOf(displayEndStr, displayStart) + displayEndStr.length;
  const newDisplay = `<div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Isi / Hasil & Tindak Lanjut</span>
                  <div className="space-y-2.5">
                    {(Array.isArray(meeting.description) ? meeting.description : (meeting.description ? [meeting.description] : [])).map((desc, i) => {
                      const fuList = Array.isArray(meeting.followUp) ? meeting.followUp : (meeting.followUp ? [meeting.followUp] : []);
                      const fu = fuList[i] || "";
                      return (
                        <div key={i} className="bg-slate-50 rounded-lg border border-slate-100 p-2.5 flex flex-col gap-2">
                          <div className="flex gap-2 items-start">
                            <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-700 leading-relaxed">{desc}</p>
                          </div>
                          {fu && (
                            <div className="flex gap-2 items-start ml-6 pl-3 border-l-2 border-amber-200">
                              <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-2.5 py-1.5 flex-1 leading-relaxed"><span className="font-semibold uppercase tracking-wider text-[9px] block text-amber-600/70 mb-0.5">Tindak Lanjut:</span>{fu}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>`;
  content = content.substring(0, displayStart) + newDisplay + content.substring(displayEnd);
}

// 2. Replace the form blocks
const formDescStartStr = '<div className="col-span-2 space-y-2">\n                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">\n                  <span>Hasil / Notulensi Rapat</span>';
const formFollowEndStr = '</label>\n                {formData.followUp.map((fu, index) => (\n                  <div key={index} className="flex items-start gap-2">\n                    <textarea value={fu} onChange={e => {\n                      const newFu = [...formData.followUp];\n                      newFu[index] = e.target.value;\n                      setFormData({...formData, followUp: newFu});\n                    }} placeholder="Opsional: Tuliskan tugas atau target pasca rapat..." className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[60px] resize-y"></textarea>\n                    {formData.followUp.length > 1 && (\n                      <button type="button" onClick={() => {\n                        const newFu = formData.followUp.filter((_, i) => i !== index);\n                        setFormData({...formData, followUp: newFu});\n                      }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-1">\n                        <X className="w-4 h-4" />\n                      </button>\n                    )}\n                  </div>\n                ))}\n              </div>';

const formDescStart = content.indexOf(formDescStartStr);
if (formDescStart !== -1) {
  const formFollowEnd = content.indexOf(formFollowEndStr, formDescStart) + formFollowEndStr.length;
  
  const newForm = `<div className="col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="block text-xs font-semibold text-slate-600">Hasil & Tindak Lanjut Rapat</span>
                  <button type="button" onClick={() => setFormData(prev => ({...prev, description: [...prev.description, ""], followUp: [...prev.followUp, ""]}))} className="text-indigo-600 hover:text-indigo-700 text-[10px] uppercase font-bold flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded">
                    <Plus className="w-3 h-3" /> Tambah Poin
                  </button>
                </div>
                {formData.description.map((desc, index) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Hasil / Keputusan {index + 1}</label>
                        <textarea required value={desc} onChange={e => {
                          const newDesc = [...formData.description];
                          newDesc[index] = e.target.value;
                          setFormData({...formData, description: newDesc});
                        }} placeholder="Tuliskan hasil poin keputusan musyawarah..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[60px] resize-y"></textarea>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Tindak Lanjut (Opsional)</label>
                        <textarea value={formData.followUp[index] || ""} onChange={e => {
                          const newFu = [...formData.followUp];
                          while(newFu.length <= index) newFu.push("");
                          newFu[index] = e.target.value;
                          setFormData({...formData, followUp: newFu});
                        }} placeholder="Tuliskan tugas atau target pasca rapat..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[60px] resize-y"></textarea>
                      </div>
                    </div>
                    {formData.description.length > 1 && (
                      <button type="button" onClick={() => {
                        const newDesc = formData.description.filter((_, i) => i !== index);
                        const newFu = formData.followUp.filter((_, i) => i !== index);
                        setFormData({...formData, description: newDesc, followUp: newFu});
                      }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-6 shrink-0" title="Hapus Poin">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>`;
  
  content = content.substring(0, formDescStart) + newForm + content.substring(formFollowEnd);
}

fs.writeFileSync('src/components/MeetingsView.tsx', content);
