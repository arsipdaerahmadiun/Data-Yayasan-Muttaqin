const fs = require('fs');

function fix(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace search.toLowerCase() with (search || "").toLowerCase()
    content = content.replace(/search\.toLowerCase\(\)/g, '(search || "").toLowerCase()');
    
    // Also replace other potential failures just in case like emp.name.toLowerCase()
    // It's easier to just use `(search || "").toLowerCase()` where `search` is the variable.
    
    fs.writeFileSync(filePath, content);
}

fix('src/components/assets/AssetTransferTitleView.tsx');
fix('src/components/assets/AssetCatalogList.tsx');
fix('src/components/EmployeesView.tsx');
fix('src/components/AlumniView.tsx');
fix('src/components/StudentsView.tsx');

fix('src/components/assets/AssetBorrowDocsView.tsx');

let content = fs.readFileSync('src/components/assets/AssetBorrowDocsView.tsx', 'utf8');
content = content.replace(/searchQuery\.toLowerCase\(\)/g, '(searchQuery || "").toLowerCase()');
fs.writeFileSync('src/components/assets/AssetBorrowDocsView.tsx', content);

