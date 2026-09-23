const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  const handleAddTransfer = (newTransfer: Omit<AssetTransferRecord, "id">) => {
    const item: AssetTransferRecord = {
      ...newTransfer,
      id: \`trf-\${Date.now()}\`
    };`;

const replaceStr = `  const handleAddTransfer = (newTransfer: Omit<AssetTransferRecord, "id">) => {
    const item: AssetTransferRecord = {
      ...newTransfer,
      id: \`trf-\${Date.now()}\`
    };
    
    if (item.status === "Selesai / Terbit Sertifikat" && item.assetName) {
       let newName = item.assetName;
       if (newName.toLowerCase().includes("a.n")) {
         newName = newName.replace(/a\\.n\\s+[a-zA-Z0-9_ ]+/i, "a.n " + (item.toOwner || "Yayasan"));
       }
       item.assetName = newName;
    }`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/App.tsx', content);
