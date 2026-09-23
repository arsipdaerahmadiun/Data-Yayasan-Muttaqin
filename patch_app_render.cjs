const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
const donationRender = `
          {activeTab === "donations" && (
            <DonationsView
              donations={data.donations || []}
              onAddDonation={handleAddDonation}
              onUpdateDonation={handleUpdateDonation}
              onDeleteDonation={handleDeleteDonation}
              searchTerm={searchTerm}
              readOnly={authRole === "visitor"}
            />
          )}
`;
content = content.replace('{activeTab === "admin-performance" && (', donationRender + '          {activeTab === "admin-performance" && (');
fs.writeFileSync('src/App.tsx', content);
