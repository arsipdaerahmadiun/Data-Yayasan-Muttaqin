const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\/\/ --- Handlers for Donations ---[\s\S]*?(?=  const handleUpdateAdminReport)/;

const newHandlers = `// --- Handlers for Donations ---
  const handleAddDonation = (newDonation: Omit<DonationRecord, "id">) => {
    if (authRole === "visitor") return;
    const donation: DonationRecord = {
      ...newDonation,
      id: "don-" + Date.now().toString() + Math.random().toString(36).substr(2, 5)
    };
    
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        donations: [...(prev.donations || []), donation]
      }),
      {
        action: "ADD",
        entityType: "Sistem",
        details: \`Menambahkan data donasi dari \${donation.donatorName}\`
      }
    );
    showToast(\`Donasi dari \${donation.donatorName} berhasil ditambahkan.\`);
  };

  const handleUpdateDonation = (updatedDonation: DonationRecord) => {
    if (authRole === "visitor") return;
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        donations: (prev.donations || []).map(d => d.id === updatedDonation.id ? updatedDonation : d)
      }),
      {
        action: "UPDATE",
        entityType: "Sistem",
        details: \`Mengubah data donasi dari \${updatedDonation.donatorName}\`
      }
    );
    showToast("Data donasi berhasil diperbarui.");
  };

  const handleDeleteDonation = (id: string) => {
    if (authRole === "visitor") return;
    const toDelete = (data.donations || []).find(d => d.id === id);
    if (!toDelete) return;
    
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        donations: (prev.donations || []).filter(d => d.id !== id)
      }),
      {
        action: "DELETE",
        entityType: "Sistem",
        details: \`Menghapus data donasi dari \${toDelete.donatorName}\`
      }
    );
    showToast("Data donasi berhasil dihapus.");
  };

`;

content = content.replace(regex, newHandlers);
fs.writeFileSync('src/App.tsx', content);
