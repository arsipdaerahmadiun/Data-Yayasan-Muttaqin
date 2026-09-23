const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace('import { AlumniView } from "./components/AlumniView";', 'import { AlumniView } from "./components/AlumniView";\nimport { DonationsView } from "./components/DonationsView";');
content = content.replace('SyncHistoryItem', 'SyncHistoryItem,\n  DonationRecord');
fs.writeFileSync('src/App.tsx', content);
