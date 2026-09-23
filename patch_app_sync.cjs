const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `      if (transfer.status === "Selesai / Terbit Sertifikat") {
        let updatedName = a.name;
        if (updatedName && updatedName.toLowerCase().includes("a.n")) {
          updatedName = updatedName.replace(/a\\.n\\s+[a-zA-Z0-9_ ]+/i, "a.n Yayasan");
        }
        
        return {
          ...a,
          name: updatedName,
          registeredOwner: transfer.toOwner || a.registeredOwner || "Yayasan",
          custodian: "Yayasan",
          originalOwner: transfer.fromOwner || a.originalOwner,
          transferStatus: "Selesai Balik Nama (a.n. Yayasan)",
          legalDocType: transfer.docType || a.legalDocType,
          legalDocNumber: transfer.docNumber || a.legalDocNumber
        };`;

const replacementStr = `      if (transfer.status === "Selesai / Terbit Sertifikat") {
        let updatedName = a.name;
        if (updatedName && updatedName.toLowerCase().includes("a.n")) {
          updatedName = updatedName.replace(/a\\.n\\s+[a-zA-Z0-9_ ]+/i, "a.n " + (transfer.toOwner || "Yayasan"));
        }
        
        return {
          ...a,
          name: updatedName,
          registeredOwner: transfer.toOwner || a.registeredOwner || "Yayasan",
          custodian: transfer.toOwner || "Yayasan",
          originalOwner: transfer.fromOwner || a.originalOwner,
          transferStatus: "Selesai Balik Nama (a.n. Yayasan)",
          legalDocType: transfer.docType || a.legalDocType,
          legalDocNumber: transfer.docNumber || a.legalDocNumber
        };`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched App.tsx");
} else {
  console.log("Could not find target string in App.tsx");
}
