const fs = require('fs');

function patchFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (let [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Patched ${filePath}`);
    }
}

// AdminPerformanceView
patchFile('src/components/AdminPerformanceView.tsx', [
    ['<button\n              onClick={() => setIsEditModalOpen(true)}', '{!readOnly && <button\n              onClick={() => setIsEditModalOpen(true)}'],
    ['<span>Ubah Laporan</span>\n            </button>', '<span>Ubah Laporan</span>\n            </button>}']
]);

// SettingsView
patchFile('src/components/SettingsView.tsx', [
    ['<button\n              onClick={() => setIsEditMode(true)}', '{!readOnly && <button\n              onClick={() => setIsEditMode(true)}'],
    ['<span>Edit Profil</span>\n            </button>', '<span>Edit Profil</span>\n            </button>}'],
    ['<button\n                  onClick={handleForceSync}', '{!readOnly && <button\n                  onClick={handleForceSync}'],
    ['<span>Sinkronisasi Paksa</span>\n                </button>', '<span>Sinkronisasi Paksa</span>\n                </button>}'],
    ['<button\n                  onClick={() => setIsRestoreModalOpen(true)}', '{!readOnly && <button\n                  onClick={() => setIsRestoreModalOpen(true)}'],
    ['<span>Pulihkan Data</span>\n                </button>', '<span>Pulihkan Data</span>\n                </button>}']
]);
