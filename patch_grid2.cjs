const fs = require('fs');
let content = fs.readFileSync('src/components/MeetingsView.tsx', 'utf8');

const regex = /<div className="grid grid-cols-2 gap-4">\s*<div className="col-span-2 md:col-span-1">\s*<label className="block text-xs font-semibold text-slate-600 mb-1">Pemimpin \/ Pemateri<\/label>\s*<input type="text" required value=\{formData\.leader\}[^>]+>\s*<\/div>\s*<\/div>\s*<div className="col-span-2">\s*<label className="block text-xs font-semibold text-slate-600 mb-1">Peserta<\/label>/;

const searchStr = '<div className="grid grid-cols-2 gap-4">\n                <div className="col-span-2 md:col-span-1">\n                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pemimpin / Pemateri</label>';
const index = content.indexOf(searchStr);

if (index !== -1) {
  const endSearchStr = 'className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />\n              </div>';
  const endIndex = content.indexOf(endSearchStr, index) + endSearchStr.length;
  const newGrid = `<div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pemimpin / Pemateri</label>
                  <input type="text" required value={formData.leader} onChange={e => setFormData({...formData, leader: e.target.value})} placeholder="Nama pemimpin rapat" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Peserta</label>
                  <input type="text" required value={formData.participants} onChange={e => setFormData({...formData, participants: e.target.value})} placeholder="Contoh: Seluruh asatidz, pengurus yayasan, dll" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
              </div>`;
              
  const fullPesertaEndStr = 'className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />\n              </div>';
  const pesertaStartStr = '<div className="col-span-2">\n                <label className="block text-xs font-semibold text-slate-600 mb-1">Peserta</label>';
  
  const pesertaStart = content.indexOf(pesertaStartStr, endIndex);
  if (pesertaStart !== -1) {
    const pesertaEnd = content.indexOf(fullPesertaEndStr, pesertaStart) + fullPesertaEndStr.length;
    content = content.substring(0, index) + newGrid + content.substring(pesertaEnd);
  }
}

fs.writeFileSync('src/components/MeetingsView.tsx', content);
