const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetFunc = `  const handleUpdateTransfer = (updatedTransfer: AssetTransferRecord) => {
    updateDataWithAudit(
      (prev) => {
        const nextTransfers = (prev.assetTransfers || []).map((t) =>
          t.id === updatedTransfer.id ? updatedTransfer : t
        );
        const nextAssets = syncAssetWithTransfer(prev.assets, updatedTransfer);
        return {
          ...prev,
          assetTransfers: nextTransfers,
          assets: nextAssets
        };`;

const replacementFunc = `  const handleUpdateTransfer = (updatedTransfer: AssetTransferRecord) => {
    updateDataWithAudit(
      (prev) => {
        let finalTransfer = { ...updatedTransfer };
        if (finalTransfer.status === "Selesai / Terbit Sertifikat" && finalTransfer.assetName) {
           let newName = finalTransfer.assetName;
           if (newName.toLowerCase().includes("a.n")) {
             newName = newName.replace(/a\\.n\\s+[a-zA-Z0-9_ ]+/i, "a.n " + (finalTransfer.toOwner || "Yayasan"));
           }
           finalTransfer.assetName = newName;
        }
        
        const nextTransfers = (prev.assetTransfers || []).map((t) =>
          t.id === finalTransfer.id ? finalTransfer : t
        );
        const nextAssets = syncAssetWithTransfer(prev.assets, finalTransfer);
        return {
          ...prev,
          assetTransfers: nextTransfers,
          assets: nextAssets
        };`;

content = content.replace(targetFunc, replacementFunc);
fs.writeFileSync('src/App.tsx', content);
