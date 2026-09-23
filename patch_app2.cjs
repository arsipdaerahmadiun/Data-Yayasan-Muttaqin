const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const meetingHandlers = `
  // --- Handlers for Meetings ---
  const handleAddMeeting = (newMeeting: Omit<MeetingRecord, "id">) => {
    if (authRole === "visitor") return;
    const meeting: MeetingRecord = {
      ...newMeeting,
      id: "mtg-" + Date.now().toString() + Math.random().toString(36).substr(2, 5)
    };
    
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        meetings: [meeting, ...(prev.meetings || [])]
      }),
      {
        action: "ADD",
        entityType: "Sistem",
        details: \`Menambahkan data musyawarah/rapat: \${meeting.title}\`
      }
    );
    showToast("Data musyawarah berhasil ditambahkan.");
  };

  const handleUpdateMeeting = (updatedMeeting: MeetingRecord) => {
    if (authRole === "visitor") return;
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        meetings: (prev.meetings || []).map(m => m.id === updatedMeeting.id ? updatedMeeting : m)
      }),
      {
        action: "UPDATE",
        entityType: "Sistem",
        details: \`Mengubah data musyawarah/rapat: \${updatedMeeting.title}\`
      }
    );
    showToast("Data musyawarah berhasil diperbarui.");
  };

  const handleDeleteMeeting = (id: string) => {
    if (authRole === "visitor") return;
    const toDelete = (data.meetings || []).find(m => m.id === id);
    if (!toDelete) return;
    
    updateDataWithAudit(
      (prev) => ({
        ...prev,
        meetings: (prev.meetings || []).filter(m => m.id !== id)
      }),
      {
        action: "DELETE",
        entityType: "Sistem",
        details: \`Menghapus data musyawarah/rapat: \${toDelete.title}\`
      }
    );
    showToast("Data musyawarah berhasil dihapus.");
  };
`;

content = content.replace('  // --- Handlers for Donations ---', meetingHandlers + '\n  // --- Handlers for Donations ---');

const meetingRender = `
          {activeTab === "meetings" && (
            <MeetingsView
              meetings={data.meetings || []}
              onAddMeeting={handleAddMeeting}
              onUpdateMeeting={handleUpdateMeeting}
              onDeleteMeeting={handleDeleteMeeting}
              searchTerm={searchTerm}
              readOnly={authRole === "visitor"}
            />
          )}
`;

content = content.replace('{activeTab === "admin-performance" && (', meetingRender + '\n          {activeTab === "admin-performance" && (');

fs.writeFileSync('src/App.tsx', content);
