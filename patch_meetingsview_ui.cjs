const fs = require('fs');
let content = fs.readFileSync('src/components/MeetingsView.tsx', 'utf8');

const displayBlockStart = content.indexOf('<h3 className="font-bold text-slate-900 mb-1">{meeting.title}</h3>');
const displayBlockEndStr = '{!readOnly && (';
const displayBlockEnd = content.indexOf(displayBlockEndStr, displayBlockStart);

if (displayBlockStart !== -1 && displayBlockEnd !== -1) {
  const newUI = `<h3 className="text-base font-bold text-slate-900 mb-1 leading-tight">{meeting.title}</h3>
              
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-4 bg-slate-50 px-2 py-1 rounded-md inline-flex border border-slate-100">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>{new Date(meeting.date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>

              <div className="space-y-4 flex-1">
                {/* Meta info: Leader & Participants */}
                <div className="flex flex-col gap-2.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
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
                          {fu && <div className="absolute left-[2px] top-3 bottom-0 w-[2px] bg-slate-100"></div>}
                          
                          <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{desc}</p>
                          
                          {fu && (
                            <div className="mt-1.5 pl-3 border-l-2 border-indigo-100 relative">
                              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-white"></div>
                              <p className="text-xs text-indigo-900/70 leading-relaxed bg-indigo-50/50 p-2 rounded-r-lg border border-indigo-50">{fu}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              `;
  content = content.substring(0, displayBlockStart) + newUI + content.substring(displayBlockEnd);
}

// Add Users icon to lucide-react import
if (!content.includes('Users, ')) {
  content = content.replace('User, MessageSquare', 'User, Users, MessageSquare');
}

fs.writeFileSync('src/components/MeetingsView.tsx', content);
