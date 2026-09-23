const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const meetingMenu = `
        {/* Hasil Pengarahan & Musyawarah */}
        <button
          onClick={() => onSelectTab("meetings")}
          className={\`w-full px-4 py-3 rounded-xl flex items-center gap-4 transition-colors cursor-pointer \${
            activeTab === "meetings"
              ? "bg-indigo-50/80 text-indigo-600 font-medium"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }\`}
        >
          <BookOpen className="w-5 h-5 shrink-0 text-indigo-500" />
          <span className="text-[15px]">Hasil Musyawarah</span>
        </button>
`;

content = content.replace('{/* Admin Performance, AI Assistant */}', meetingMenu + '\n        {/* Admin Performance, AI Assistant */}');

fs.writeFileSync('src/components/Sidebar.tsx', content);
