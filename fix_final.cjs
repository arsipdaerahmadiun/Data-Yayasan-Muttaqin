const fs = require('fs');

let content = fs.readFileSync('src/components/StudentsView.tsx', 'utf8');
content = content.replace(/<\/button>\)}/g, '</button>)}');
// Let me just regex replace the specific one:
content = content.replace(/<span>Tambah Siswa<\/span>\n                        <\/button>\)}/g, '<span>Tambah Siswa</span>\n                        </button>}');
content = content.replace(/\{\!readOnly && \(<button\n                        onClick=\{() => handleOpenAddForClass/g, '{!readOnly && <button\n                        onClick={() => handleOpenAddForClass');
fs.writeFileSync('src/components/StudentsView.tsx', content);

let assets = fs.readFileSync('src/components/AssetsView.tsx', 'utf8');
assets = assets.replace(/searchTerm=\{searchTerm\}\n  readOnly: string;/g, 'searchTerm: string;');
assets = assets.replace(/searchTerm=\{searchTerm\}\n  readOnly\n\}\) => \{/g, 'searchTerm,\n  readOnly\n}) => {');
assets = assets.replace(/readOnly=\{readOnly\}\n  readOnly\}/g, 'readOnly={readOnly}');
fs.writeFileSync('src/components/AssetsView.tsx', assets);
