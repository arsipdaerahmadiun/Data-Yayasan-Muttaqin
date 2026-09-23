const fs = require('fs');
let content = fs.readFileSync('src/components/assets/AssetCatalogList.tsx', 'utf8');

const targetStr = 'onChange={(e) => setEditingAsset({ ...editingAsset, transferStatus: e.target.value as AssetTransferStatus })}';

const replacementStr = `onChange={(e) => {
                      const newStatus = e.target.value as AssetTransferStatus;
                      let updates: any = { transferStatus: newStatus };
                      
                      if (newStatus === "Selesai Balik Nama (a.n. Yayasan)") {
                        updates.registeredOwner = "Yayasan";
                        if (editingAsset.custodian && editingAsset.custodian.toLowerCase() !== "yayasan") {
                          updates.custodian = "Yayasan";
                        }
                        if (editingAsset.name && editingAsset.name.toLowerCase().includes("a.n")) {
                          updates.name = editingAsset.name.replace(/a\\.n\\s+[a-zA-Z0-9_ ]+/i, "a.n Yayasan");
                        }
                      }
                      
                      setEditingAsset({ ...editingAsset, ...updates });
                    }}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/assets/AssetCatalogList.tsx', content);
