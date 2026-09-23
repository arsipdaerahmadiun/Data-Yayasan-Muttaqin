const fs = require('fs');

function fix(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    // Revert what I did: `{!readOnly && <button` -> `<button`
    // and `</button>}` -> `</button>`
    content = content.replace(/\{\!readOnly && <button/g, '<button');
    content = content.replace(/<\/button>\}/g, '</button>');
    fs.writeFileSync(filePath, content);
}

fix('src/components/EmployeesView.tsx');
fix('src/components/StudentsView.tsx');
fix('src/components/AlumniView.tsx');
fix('src/components/assets/AssetCatalogList.tsx');
fix('src/components/AdminPerformanceView.tsx');
fix('src/components/SettingsView.tsx');

