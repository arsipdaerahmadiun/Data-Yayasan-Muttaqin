const fs = require('fs');

function fix(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Protect properties from undefined before .toLowerCase()
    content = content.replace(/([a-zA-Z0-9_]+)\.name\.toLowerCase\(\)/g, '($1.name || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.nisn\.toLowerCase\(\)/g, '($1.nisn || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.nis\.toLowerCase\(\)/g, '($1.nis || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.parentName\.toLowerCase\(\)/g, '($1.parentName || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.classGrade\.toLowerCase\(\)/g, '($1.classGrade || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.nip\.toLowerCase\(\)/g, '($1.nip || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.positionTitle\.toLowerCase\(\)/g, '($1.positionTitle || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.email\.toLowerCase\(\)/g, '($1.email || "").toLowerCase()');
    
    content = content.replace(/([a-zA-Z0-9_]+)\.assetName\.toLowerCase\(\)/g, '($1.assetName || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.fromOwner\.toLowerCase\(\)/g, '($1.fromOwner || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.toOwner\.toLowerCase\(\)/g, '($1.toOwner || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.notaryOffice\.toLowerCase\(\)/g, '($1.notaryOffice || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.handlerName\.toLowerCase\(\)/g, '($1.handlerName || "").toLowerCase()');
    
    content = content.replace(/([a-zA-Z0-9_]+)\.title\.toLowerCase\(\)/g, '($1.title || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.code\.toLowerCase\(\)/g, '($1.code || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.owner\.toLowerCase\(\)/g, '($1.owner || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.storageLocation\.toLowerCase\(\)/g, '($1.storageLocation || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.location\.toLowerCase\(\)/g, '($1.location || "").toLowerCase()');
    content = content.replace(/([a-zA-Z0-9_]+)\.custodian\.toLowerCase\(\)/g, '($1.custodian || "").toLowerCase()');

    fs.writeFileSync(filePath, content);
}

fix('src/components/ClassPromotionModal.tsx');
fix('src/components/assets/AssetTransferTitleView.tsx');
fix('src/components/assets/AssetBorrowDocsView.tsx');
fix('src/components/assets/AssetCatalogList.tsx');
fix('src/components/EmployeesView.tsx');
fix('src/components/AlumniView.tsx');
fix('src/components/StudentsView.tsx');
