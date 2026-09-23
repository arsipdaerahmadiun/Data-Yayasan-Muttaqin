const fs = require('fs');
let content = fs.readFileSync('src/components/MeetingsView.tsx', 'utf8');

const target1 = `<div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pemimpin / Pemateri</label>
                  <input type="text" required value={formData.leader} onChange={e => setFormData({...formData, leader: e.target.value})} placeholder="Nama pemimpin rapat" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                
              </div>`;
              
const target2 = `<div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Peserta</label>
                <input type="text" required value={formData.participants} onChange={e => setFormData({...formData, participants: e.target.value})} placeholder="Contoh: Seluruh asatidz, pengurus yayasan, dll" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>`;

content = content.replace(target1, `<div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pemimpin / Pemateri</label>
                  <input type="text" required value={formData.leader} onChange={e => setFormData({...formData, leader: e.target.value})} placeholder="Nama pemimpin rapat" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Peserta</label>
                  <input type="text" required value={formData.participants} onChange={e => setFormData({...formData, participants: e.target.value})} placeholder="Contoh: Seluruh asatidz, pengurus yayasan, dll" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
              </div>`);
content = content.replace(target2, '');

fs.writeFileSync('src/components/MeetingsView.tsx', content);
