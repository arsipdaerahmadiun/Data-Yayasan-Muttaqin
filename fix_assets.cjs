const fs = require('fs');
let content = fs.readFileSync('src/components/AssetsView.tsx', 'utf8');

// I'll just restore the component from the previously working version using git... wait, git is not available.
// I'll just string replace the bad parts.

content = content.replace(/searchTerm={searchTerm}\n  readOnly: string;/g, 'searchTerm: string;');
content = content.replace(/searchTerm={searchTerm}\n  readOnly\n}\) => {/g, 'searchTerm,\n  readOnly\n}) => {');
content = content.replace(/searchTerm={searchTerm}\n  readOnly={readOnly}\n  readOnly}/g, 'searchTerm={searchTerm}\n            readOnly={readOnly}');
fs.writeFileSync('src/components/AssetsView.tsx', content);
