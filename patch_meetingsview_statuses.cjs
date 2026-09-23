const fs = require('fs');
let content = fs.readFileSync('src/components/MeetingsView.tsx', 'utf8');

// 1. Initial State for Add
content = content.replace(
  'followUp: [""],',
  'followUp: [""],\n      followUpStatuses: ["Belum Dimulai"],'
);

// 2. Initial State for Edit
content = content.replace(
  'const handleOpenEdit = (meeting: MeetingRecord) => {\n    setFormData({\n      ...meeting,\n      description: Array.isArray(meeting.description) ? meeting.description : (meeting.description ? [meeting.description] : [""]),\n      followUp: Array.isArray(meeting.followUp) ? meeting.followUp : (meeting.followUp ? [meeting.followUp] : [""])\n    });',
  `const handleOpenEdit = (meeting: MeetingRecord) => {
    const followUpArr = Array.isArray(meeting.followUp) ? meeting.followUp : (meeting.followUp ? [meeting.followUp] : [""]);
    setFormData({
      ...meeting,
      description: Array.isArray(meeting.description) ? meeting.description : (meeting.description ? [meeting.description] : [""]),
      followUp: followUpArr,
      followUpStatuses: meeting.followUpStatuses ? meeting.followUpStatuses : followUpArr.map(() => meeting.status || "Belum Dimulai")
    });`
);

// 3. Remove global status dropdown from form
const statusDropdownRegex = /<div className="col-span-2 md:col-span-1">\s*<label className="block text-xs font-semibold text-slate-600 mb-1">Status Tindak Lanjut<\/label>\s*<select value=\{formData\.status\} onChange=\{e => setFormData\(\{\.\.\.formData, status: e\.target\.value as any\}\)\} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500\/20 focus:border-indigo-500">\s*<option value="Belum Dimulai">Belum Dimulai<\/option>\s*<option value="Dalam Proses">Dalam Proses<\/option>\s*<option value="Selesai">Selesai<\/option>\s*<\/select>\s*<\/div>/g;

content = content.replace(statusDropdownRegex, '');
// Since we removed the status dropdown, the Pemimpin Rapat input will now span the full row if we don't fix the grid.
// Wait, the grid was `grid grid-cols-2 gap-4`. We can make `Pemimpin / Pemateri` span full or add `Peserta` there.
// Let's look at the surrounding code for the form:
// <div className="grid grid-cols-2 gap-4">
//   <div className="col-span-2 md:col-span-1"> (Pemimpin)
//   <div className="col-span-2 md:col-span-1"> (Status)
// </div>
// <div className="col-span-2"> (Peserta)

// 4. Update the "Tambah Poin" button in the form
content = content.replace(
  'setFormData(prev => ({...prev, description: [...prev.description, ""], followUp: [...prev.followUp, ""]}))',
  'setFormData(prev => ({...prev, description: [...prev.description, ""], followUp: [...prev.followUp, ""], followUpStatuses: [...(prev.followUpStatuses || []), "Belum Dimulai"]}))'
);

// 5. Update the "Hapus Poin" button
content = content.replace(
  'const newFu = formData.followUp.filter((_, i) => i !== index);\n                        setFormData({...formData, description: newDesc, followUp: newFu});',
  `const newFu = formData.followUp.filter((_, i) => i !== index);
                        const newFuStatus = (formData.followUpStatuses || []).filter((_, i) => i !== index);
                        setFormData({...formData, description: newDesc, followUp: newFu, followUpStatuses: newFuStatus});`
);

// 6. Update the "Tindak Lanjut (Opsional)" field in form to include the status dropdown
const tindakLanjutFormRegex = /<div>\s*<label className="block text-\[10px\] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Tindak Lanjut \(Opsional\)<\/label>\s*<textarea value=\{formData\.followUp\[index\] \|\| ""\} onChange=\{e => \{\s*const newFu = \[\.\.\.formData\.followUp\];\s*while\(newFu\.length <= index\) newFu\.push\(""\);\s*newFu\[index\] = e\.target\.value;\s*setFormData\(\{\.\.\.formData, followUp: newFu\}\);\s*\}\} placeholder="Tuliskan tugas atau target pasca rapat\.\.\." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500\/20 focus:border-indigo-500 min-h-\[60px\] resize-y"><\/textarea>\s*<\/div>/g;

const tindakLanjutFormReplacement = `<div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tindak Lanjut (Opsional)</label>
                          {formData.followUp[index] && (
                            <select value={(formData.followUpStatuses && formData.followUpStatuses[index]) || "Belum Dimulai"} onChange={e => {
                              const newStatuses = [...(formData.followUpStatuses || [])];
                              while(newStatuses.length <= index) newStatuses.push("Belum Dimulai");
                              newStatuses[index] = e.target.value as any;
                              setFormData({...formData, followUpStatuses: newStatuses});
                            }} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 border-none rounded py-0.5 px-1.5 text-slate-600 focus:ring-0 cursor-pointer">
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
                        }} placeholder="Tuliskan tugas atau target pasca rapat..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[60px] resize-y"></textarea>
                      </div>`;
content = content.replace(tindakLanjutFormRegex, tindakLanjutFormReplacement);

// 7. Update display list (UI) to show status per point instead of just tindak lanjut text
const displayListRegex = /\{fu && \(\s*<div className="mt-1\.5 pl-3 border-l-2 border-indigo-100 relative">\s*<div className="absolute -left-\[5px\] top-1\.5 w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-white"><\/div>\s*<p className="text-xs text-indigo-900\/70 leading-relaxed bg-indigo-50\/50 p-2 rounded-r-lg border border-indigo-50">\{fu\}<\/p>\s*<\/div>\s*\)\}/g;
const displayListReplacement = `{fu && (() => {
                            const statuses = meeting.followUpStatuses || [];
                            const fuStatus = statuses[i] || meeting.status || 'Belum Dimulai';
                            const isSelesai = fuStatus === 'Selesai';
                            const isProses = fuStatus === 'Dalam Proses';
                            return (
                              <div className={\`mt-2 pl-3 border-l-2 \${isSelesai ? 'border-emerald-200' : isProses ? 'border-amber-200' : 'border-indigo-100'} relative\`}>
                                <div className={\`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-2 ring-white \${isSelesai ? 'bg-emerald-400' : isProses ? 'bg-amber-400' : 'bg-indigo-400'}\`}></div>
                                <div className={\`p-2 rounded-r-lg border \${isSelesai ? 'bg-emerald-50/50 border-emerald-50' : isProses ? 'bg-amber-50/50 border-amber-50' : 'bg-indigo-50/50 border-indigo-50'}\`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold uppercase tracking-wider text-[9px] text-slate-500">Tindak Lanjut:</span>
                                    <span className={\`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded \${isSelesai ? 'bg-emerald-100 text-emerald-700' : isProses ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}\`}>{fuStatus}</span>
                                  </div>
                                  <p className={\`text-xs leading-relaxed \${isSelesai ? 'text-emerald-900/70' : isProses ? 'text-amber-900/70' : 'text-indigo-900/70'}\`}>{fu}</p>
                                </div>
                              </div>
                            );
                          })()}`;
content = content.replace(displayListRegex, displayListReplacement);

// 8. Update global status calculation in handleSubmit (or just remove the global status display and calculate it dynamically)
// Wait, we still need meeting.status to not be undefined for legacy components. Let's calculate it in handleSubmit before save.
// In `handleSubmit`:
const submitRegex = /const handleSubmit = async \(e: React\.FormEvent\) => \{\s*e\.preventDefault\(\);\s*setIsLoading\(true\);/g;
const submitReplacement = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Auto calculate global status
    let globalStatus: 'Selesai' | 'Dalam Proses' | 'Belum Dimulai' = 'Selesai';
    const activeFollowUps = formData.followUp.filter(f => f.trim() !== '');
    if (activeFollowUps.length > 0) {
      const statuses = formData.followUpStatuses || [];
      const hasBelum = activeFollowUps.some((_, i) => statuses[i] === 'Belum Dimulai');
      const hasProses = activeFollowUps.some((_, i) => statuses[i] === 'Dalam Proses');
      const allSelesai = activeFollowUps.every((_, i) => statuses[i] === 'Selesai');
      
      if (allSelesai) globalStatus = 'Selesai';
      else if (hasProses || (!hasBelum && !allSelesai)) globalStatus = 'Dalam Proses';
      else globalStatus = 'Belum Dimulai';
    }
    formData.status = globalStatus;
`;
content = content.replace(submitRegex, submitReplacement);

fs.writeFileSync('src/components/MeetingsView.tsx', content);
