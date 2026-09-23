const fs = require('fs');
let content = fs.readFileSync('src/components/MeetingsView.tsx', 'utf8');

const descStart = content.indexOf('<div className="col-span-2">\n                <label className="block text-xs font-semibold text-slate-600 mb-1">Hasil / Notulensi Rapat</label>');
if (descStart !== -1) {
  const descEnd = content.indexOf('</div>', descStart) + 6;
  
  const formDescriptionReplacement = `
              <div className="col-span-2 space-y-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                  <span>Hasil / Notulensi Rapat</span>
                  <button type="button" onClick={() => setFormData(prev => ({...prev, description: [...prev.description, ""]}))} className="text-indigo-600 hover:text-indigo-700 text-[10px] uppercase font-bold flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded">
                    <Plus className="w-3 h-3" /> Tambah Poin
                  </button>
                </label>
                {formData.description.map((desc, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <textarea required value={desc} onChange={e => {
                      const newDesc = [...formData.description];
                      newDesc[index] = e.target.value;
                      setFormData({...formData, description: newDesc});
                    }} placeholder="Tuliskan hasil poin keputusan musyawarah..." className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[60px] resize-y"></textarea>
                    {formData.description.length > 1 && (
                      <button type="button" onClick={() => {
                        const newDesc = formData.description.filter((_, i) => i !== index);
                        setFormData({...formData, description: newDesc});
                      }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-1">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>`;
  content = content.substring(0, descStart) + formDescriptionReplacement.trim() + content.substring(descEnd);
}

const followStart = content.indexOf('<div className="col-span-2">\n                <label className="block text-xs font-semibold text-slate-600 mb-1">Rencana Tindak Lanjut (Follow-up)</label>');
if (followStart !== -1) {
  const followEnd = content.indexOf('</div>', followStart) + 6;
  
  const formFollowUpReplacement = `
              <div className="col-span-2 space-y-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                  <span>Rencana Tindak Lanjut (Follow-up)</span>
                  <button type="button" onClick={() => setFormData(prev => ({...prev, followUp: [...prev.followUp, ""]}))} className="text-indigo-600 hover:text-indigo-700 text-[10px] uppercase font-bold flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded">
                    <Plus className="w-3 h-3" /> Tambah Poin
                  </button>
                </label>
                {formData.followUp.map((fu, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <textarea value={fu} onChange={e => {
                      const newFu = [...formData.followUp];
                      newFu[index] = e.target.value;
                      setFormData({...formData, followUp: newFu});
                    }} placeholder="Opsional: Tuliskan tugas atau target pasca rapat..." className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[60px] resize-y"></textarea>
                    {formData.followUp.length > 1 && (
                      <button type="button" onClick={() => {
                        const newFu = formData.followUp.filter((_, i) => i !== index);
                        setFormData({...formData, followUp: newFu});
                      }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-1">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>`;
  content = content.substring(0, followStart) + formFollowUpReplacement.trim() + content.substring(followEnd);
}

fs.writeFileSync('src/components/MeetingsView.tsx', content);
