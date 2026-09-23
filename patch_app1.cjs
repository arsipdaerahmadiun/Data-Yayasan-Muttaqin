const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace('import { DonationsView } from "./components/DonationsView";', 'import { DonationsView } from "./components/DonationsView";\nimport { MeetingsView } from "./components/MeetingsView";');
content = content.replace('DonationRecord', 'DonationRecord,\n  MeetingRecord');

fs.writeFileSync('src/App.tsx', content);
