const fs = require('fs');

let content = fs.readFileSync('src/types.ts', 'utf8');

const meetingType = `
export type MeetingCategory = 'Rapat Pembina' | 'Rapat Pengurus' | 'Musyawarah Yayasan' | 'Lainnya';

export interface MeetingRecord {
  id: string;
  date: string;
  title: string;
  category: MeetingCategory;
  leader: string;
  participants: string;
  description: string;
  followUp: string;
  status: 'Selesai' | 'Dalam Proses' | 'Belum Dimulai';
}
`;

content = content.replace('export interface DatabaseStore {', meetingType + '\nexport interface DatabaseStore {');
content = content.replace('  auditLogs: AuditLogItem[];', '  auditLogs: AuditLogItem[];\n  meetings: MeetingRecord[];');
content = content.replace("export type ActiveTab = 'dashboard' | 'assets' | 'employees' | 'students' | 'alumni' | 'donations' | 'admin-performance' | 'ai-assistant' | 'settings';", "export type ActiveTab = 'dashboard' | 'assets' | 'employees' | 'students' | 'alumni' | 'donations' | 'meetings' | 'admin-performance' | 'ai-assistant' | 'settings';");

fs.writeFileSync('src/types.ts', content);
