const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const handlers = `
  // --- Handlers for Donations ---
  const handleAddDonation = (newDonation: Omit<DonationRecord, "id">) => {
    if (authRole === "visitor") return;
    const donation: DonationRecord = {
      ...newDonation,
      id: "don-" + Date.now().toString() + Math.random().toString(36).substr(2, 5)
    };
    
    setData(prev => {
      const updated = {
        ...prev,
        donations: [...(prev.donations || []), donation]
      };
      
      const auditLog = createAuditLog(authUsername, "ADD", "Donasi", \`Menambahkan data donasi dari \${donation.donatorName}\`);
      updated.auditLogs = [auditLog, ...updated.auditLogs].slice(0, 50);
      
      return updated;
    });
    
    showToast(\`Donasi dari \${donation.donatorName} berhasil ditambahkan.\`);
  };

  const handleUpdateDonation = (updatedDonation: DonationRecord) => {
    if (authRole === "visitor") return;
    setData(prev => {
      const updated = {
        ...prev,
        donations: (prev.donations || []).map(d => d.id === updatedDonation.id ? updatedDonation : d)
      };
      const auditLog = createAuditLog(authUsername, "UPDATE", "Donasi", \`Mengubah data donasi dari \${updatedDonation.donatorName}\`);
      updated.auditLogs = [auditLog, ...updated.auditLogs].slice(0, 50);
      return updated;
    });
    showToast("Data donasi berhasil diperbarui.");
  };

  const handleDeleteDonation = (id: string) => {
    if (authRole === "visitor") return;
    const toDelete = (data.donations || []).find(d => d.id === id);
    setData(prev => {
      const updated = {
        ...prev,
        donations: (prev.donations || []).filter(d => d.id !== id)
      };
      if (toDelete) {
        const auditLog = createAuditLog(authUsername, "DELETE", "Donasi", \`Menghapus data donasi dari \${toDelete.donatorName}\`);
        updated.auditLogs = [auditLog, ...updated.auditLogs].slice(0, 50);
      }
      return updated;
    });
    showToast("Data donasi berhasil dihapus.");
  };

`;

content = content.replace('  const handleUpdateAdminReport', handlers + '  const handleUpdateAdminReport');
fs.writeFileSync('src/App.tsx', content);
