const fs = require('fs');

let content = fs.readFileSync('src/services/api.ts', 'utf8');

content = content.replace(
  'meetings: parsed.meetings || []',
  `meetings: (parsed.meetings || []).map((m: any) => ({
          ...m,
          description: Array.isArray(m.description) ? m.description : (m.description ? [m.description] : []),
          followUp: Array.isArray(m.followUp) ? m.followUp : (m.followUp ? [m.followUp] : [])
        }))`
);

fs.writeFileSync('src/services/api.ts', content);
