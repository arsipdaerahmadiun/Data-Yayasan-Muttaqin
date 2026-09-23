const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const donationMenu = `
        {/* Donasi & Bantuan */}
        <button
          onClick={() => onSelectTab("donations")}
          className={\`w-full px-4 py-3 rounded-xl flex items-center gap-4 transition-colors cursor-pointer \${
            activeTab === "donations"
              ? "bg-rose-50/80 text-rose-600 font-medium"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }\`}
        >
          <HeartHandshake className="w-5 h-5 shrink-0 text-rose-500" />
          <span className="text-[15px]">Bantuan & Donasi</span>
        </button>
`;

// Insert it before the Admin Performance block
content = content.replace('{/* Admin Performance, AI Assistant */}', donationMenu + '\n        {/* Admin Performance, AI Assistant */}');

fs.writeFileSync('src/components/Sidebar.tsx', content);
