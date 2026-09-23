const fs = require('fs');

let content = fs.readFileSync('src/services/api.ts', 'utf8');

content = content.replace(
  'followUp: Array.isArray(m.followUp) ? m.followUp : (m.followUp ? [m.followUp] : [])',
  `followUp: Array.isArray(m.followUp) ? m.followUp : (m.followUp ? [m.followUp] : []),
          followUpStatuses: Array.isArray(m.followUpStatuses) ? m.followUpStatuses : (Array.isArray(m.followUp) ? m.followUp.map(() => m.status || 'Belum Dimulai') : (m.followUp ? [m.status || 'Belum Dimulai'] : []))`
);

fs.writeFileSync('src/services/api.ts', content);
