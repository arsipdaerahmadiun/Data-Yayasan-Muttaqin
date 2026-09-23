const fs = require('fs');
let content = fs.readFileSync('src/components/MeetingsView.tsx', 'utf8');

// 1. Initial State
content = content.replace(/description: "",/g, 'description: [""],');
content = content.replace(/followUp: "",/g, 'followUp: [""],');

// 2. filteredMeetings search
content = content.replace(
  /\(m.description \|\| ""\).toLowerCase\(\).includes\(q\) \|\|/g,
  '(m.description || []).join(" ").toLowerCase().includes(q) ||'
);
content = content.replace(
  /\(m.followUp \|\| ""\).toLowerCase\(\).includes\(q\)/g,
  '(m.followUp || []).join(" ").toLowerCase().includes(q)'
);

// 3. Display
const displayDescriptionRegex = /<p className="text-sm text-slate-600 line-clamp-3 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1 whitespace-pre-wrap">\{meeting\.description\}<\/p>/g;
const displayDescriptionReplacement = `
                  <ul className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1 space-y-1.5 list-disc list-outside ml-4">
                    {(meeting.description || []).map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>`;
content = content.replace(displayDescriptionRegex, displayDescriptionReplacement);

const displayFollowUpRegex = /<p className="text-sm text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 mt-1">\{meeting\.followUp\}<\/p>/g;
const displayFollowUpReplacement = `
                    <ul className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100 mt-1 space-y-1.5 list-disc list-outside ml-4">
                      {(meeting.followUp || []).map((fu, i) => (
                        <li key={i}>{fu}</li>
                      ))}
                    </ul>`;
content = content.replace(displayFollowUpRegex, displayFollowUpReplacement);
content = content.replace(/\{meeting\.followUp && \(/g, '{meeting.followUp && meeting.followUp.length > 0 && meeting.followUp[0] !== "" && (');

// 4. Form modifications
const formDescriptionRegex = /<div className="col-span-2">\s*<label className="block text-xs font-semibold text-slate-600 mb-1">Hasil \/ Notulensi Rapat<\/label>\s*<textarea required value=\{formData\.description\}[^>]*><\/textarea>\s*<\/div>/g;
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
              </div>
`;
content = content.replace(formDescriptionRegex, formDescriptionReplacement);

const formFollowUpRegex = /<div className="col-span-2">\s*<label className="block text-xs font-semibold text-slate-600 mb-1">Rencana Tindak Lanjut \(Follow-up\)<\/label>\s*<textarea value=\{formData\.followUp\}[^>]*><\/textarea>\s*<\/div>/g;
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
              </div>
`;
content = content.replace(formFollowUpRegex, formFollowUpReplacement);

// Fix the imports (add X icon if missing)
if (!content.includes('X, ')) {
  content = content.replace('import { BookOpen, Plus, Search, Edit3, Trash2, Calendar, User, MessageSquare, CheckCircle, Clock } from "lucide-react";', 'import { BookOpen, Plus, Search, Edit3, Trash2, Calendar, User, MessageSquare, CheckCircle, Clock, X } from "lucide-react";');
}

fs.writeFileSync('src/components/MeetingsView.tsx', content);
