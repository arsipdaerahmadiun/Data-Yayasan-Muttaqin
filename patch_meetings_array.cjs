const fs = require('fs');
let content = fs.readFileSync('src/components/MeetingsView.tsx', 'utf8');

// Patch search filter
content = content.replace(
  /const filteredMeetings = useMemo\(\(\) => \{\s*return meetings\.filter\(m => \{\s*const q = \(searchTerm \|\| ""\)\.toLowerCase\(\)\.trim\(\);\s*return \(\s*\(m\.title \|\| ""\)\.toLowerCase\(\)\.includes\(q\) \|\|\s*\(m\.leader \|\| ""\)\.toLowerCase\(\)\.includes\(q\) \|\|\s*\(m\.description \|\| \[\]\)\.join\(" "\)\.toLowerCase\(\)\.includes\(q\) \|\|\s*\(m\.followUp \|\| \[\]\)\.join\(" "\)\.toLowerCase\(\)\.includes\(q\)\s*\);\s*\}\)\.sort\(\(a, b\) => new Date\(b\.date\)\.getTime\(\) - new Date\(a\.date\)\.getTime\(\)\);\s*\}, \[meetings, searchTerm\]\);/,
  `const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const q = (searchTerm || "").toLowerCase().trim();
      const descArr = Array.isArray(m.description) ? m.description : (m.description ? [m.description] : []);
      const followArr = Array.isArray(m.followUp) ? m.followUp : (m.followUp ? [m.followUp] : []);
      return (
        (m.title || "").toLowerCase().includes(q) ||
        (m.leader || "").toLowerCase().includes(q) ||
        descArr.join(" ").toLowerCase().includes(q) ||
        followArr.join(" ").toLowerCase().includes(q)
      );
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meetings, searchTerm]);`
);

// Patch display map for description
content = content.replace(
  /\{\(meeting\.description \|\| \[\]\)\.map\(\(desc, i\) => \(/g,
  `{(Array.isArray(meeting.description) ? meeting.description : (meeting.description ? [meeting.description] : [])).map((desc, i) => (`
);

// Patch display map for followUp
content = content.replace(
  /\{\(meeting\.followUp \|\| \[\]\)\.map\(\(fu, i\) => \(/g,
  `{(Array.isArray(meeting.followUp) ? meeting.followUp : (meeting.followUp ? [meeting.followUp] : [])).map((fu, i) => (`
);

// Patch condition for followUp
content = content.replace(
  /\{meeting\.followUp && meeting\.followUp\.length > 0 && meeting\.followUp\[0\] !== "" && \(/g,
  `{meeting.followUp && (Array.isArray(meeting.followUp) ? meeting.followUp.length > 0 && meeting.followUp[0] !== "" : meeting.followUp !== "") && (`
);


fs.writeFileSync('src/components/MeetingsView.tsx', content);
