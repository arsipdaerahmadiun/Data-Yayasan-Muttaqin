const fs = require('fs');

let content = fs.readFileSync('src/services/api.ts', 'utf8');

// The default initialization at the beginning (let's find auditLogs in DEFAULT_DATABASE)
content = content.replace(/auditLogs: \[\s*\{\s*id: "aud-001"[^}]*\}\s*\]\s*\n\};/, 'auditLogs: [\n    {\n      id: "aud-001",\n      timestamp: new Date().toISOString(),\n      userName: "Fahmi Maulana Dwi, S.Kom.",\n      action: "SYNC",\n      entityType: "Sistem",\n      details: "Sistem basis data terhubung dan tersinkronisasi otomatis."\n    }\n  ],\n  donations: [],\n  meetings: []\n};');

// The loaded database from localStorage
content = content.replace('donations: parsed.donations || []', 'donations: parsed.donations || [],\n        meetings: parsed.meetings || []');

fs.writeFileSync('src/services/api.ts', content);
