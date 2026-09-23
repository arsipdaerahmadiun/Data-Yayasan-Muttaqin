const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

content = content.replace('Award,', 'Award,\n  HeartHandshake,');

const donationMenu = `
        {/* Donasi & Bantuan */}
        <button
          onClick={() => onSelectTab("donations")}
          className={\`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-colors cursor-pointer \${
            activeTab === "donations"
              ? "bg-rose-50 text-rose-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }\`}
        >
          <div className={\`p-1.5 rounded-lg \${activeTab === "donations" ? "bg-rose-100" : "bg-slate-200"}\`}>
            <HeartHandshake className={\`w-4 h-4 \${activeTab === "donations" ? "text-rose-600" : "text-slate-500"}\`} />
          </div>
          <span>Bantuan & Donasi</span>
        </button>
`;

// Insert it before settings or ai-assistant. Let's find ai-assistant
content = content.replace('{/* Asisten AI & Analisis */}', donationMenu + '\n        {/* Asisten AI & Analisis */}');

fs.writeFileSync('src/components/Sidebar.tsx', content);
