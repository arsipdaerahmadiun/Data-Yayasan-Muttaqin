#!/bin/bash
sed -n '1,/PERFECTED DARK MODE GLOBAL OVERRIDES/p' src/index.css > temp.css

cat << 'INNER_EOF' >> temp.css
   ========================================= */

.dark {
  color-scheme: dark;
}

/* Full Dark Mode - Deep Charcoal/Black */
.dark, .dark body, .dark main {
  background-color: #121417 !important;
}

/* Override App.tsx root background and main background */
.dark.bg-slate-950, .dark .bg-slate-950 {
  background-color: #121417 !important;
}

/* Base Surfaces: Cards, Navbar, Sidebar */
.dark .bg-white, .dark .bg-slate-50, .dark .bg-slate-100, .dark .bg-slate-200 {
  background-color: #1a1d21 !important;
  border-color: #2b3036 !important;
  color: #f5f5f5 !important;
}

/* Catch all Tailwind fractional backgrounds (e.g. bg-slate-50/50, bg-slate-100/70) */
.dark [class*="bg-slate-50/"],
.dark [class*="bg-slate-100/"],
.dark [class*="bg-slate-200/"],
.dark [class*="bg-white/"] {
  background-color: #1a1d21 !important;
  border-color: #2b3036 !important;
}

/* Blend Nav and Sidebar into main background seamlessly like the image */
.dark aside.bg-white, .dark header.bg-white, .dark nav.bg-white, .dark .sticky.bg-white {
  background-color: #121417 !important;
  border-color: #2b3036 !important;
}

/* Text Colors */
.dark .text-slate-900, .dark .text-slate-800 {
  color: #fafafa !important;
}
.dark .text-slate-700, .dark .text-slate-600 {
  color: #a3a3a3 !important;
}
.dark .text-slate-500, .dark .text-slate-400 {
  color: #737373 !important;
}

/* Borders & Dividers */
.dark .border-slate-200, .dark .border-slate-100 {
  border-color: #2b3036 !important;
}
.dark .divide-slate-100 > :not([hidden]) ~ :not([hidden]),
.dark .divide-slate-200 > :not([hidden]) ~ :not([hidden]) {
  border-color: #2b3036 !important;
}

/* Interactive States */
.dark [class*="hover:bg-slate-50"]:hover, 
.dark [class*="hover:bg-slate-100"]:hover,
.dark [class*="hover:bg-slate-200"]:hover {
  background-color: #2b3036 !important;
}

/* Form Inputs */
.dark input, .dark select, .dark textarea {
  background-color: #121417 !important;
  border-color: #2b3036 !important;
  color: #fafafa !important;
}
.dark input::placeholder, .dark textarea::placeholder {
  color: #737373 !important;
}
.dark input:focus, .dark select:focus, .dark textarea:focus {
  background-color: #1a1d21 !important;
  border-color: #3b82f6 !important;
}

/* Shadows to Borders */
.dark .shadow-sm, .dark .shadow, .dark .shadow-md, .dark .shadow-lg, .dark .shadow-xl, .dark .shadow-2xs, .dark .shadow-xs {
  box-shadow: none !important;
  border: 1px solid #2b3036 !important;
}

/* Modals & Backdrops */
.dark .bg-black\/50, .dark .bg-black\/40, .dark .bg-slate-900\/60, .dark .bg-slate-950\/70 {
  background-color: rgba(0, 0, 0, 0.8) !important;
}

/* Active Menu Highlights / Thematic Colors */
.dark .bg-blue-50, .dark .bg-blue-100 { 
  background-color: #1f2937 !important; 
  border-color: #374151 !important; 
  color: #60a5fa !important; 
}
.dark .text-blue-900, .dark .text-blue-800, .dark .text-blue-700, .dark .text-blue-600 { 
  color: #60a5fa !important; 
}
.dark .bg-blue-500, .dark .bg-blue-600 { background-color: #3b82f6 !important; color: white !important;}
.dark [class*="hover:bg-blue-600"]:hover { background-color: #2563eb !important; }

/* Thematic badge/button backgrounds */
.dark .bg-emerald-50, .dark .bg-emerald-100 { background-color: #064e3b !important; border-color: #065f46 !important; color: #34d399 !important; }
.dark .text-emerald-900, .dark .text-emerald-800, .dark .text-emerald-700, .dark .text-emerald-600 { color: #34d399 !important; }
.dark .bg-emerald-500, .dark .bg-emerald-600 { background-color: #10b981 !important; color: white !important;}
.dark [class*="hover:bg-emerald-600"]:hover { background-color: #059669 !important; }

.dark .bg-amber-50, .dark .bg-amber-100, .dark .bg-yellow-50 { background-color: #451a03 !important; border-color: #78350f !important; color: #fbbf24 !important; }
.dark .text-amber-900, .dark .text-amber-800, .dark .text-amber-700, .dark .text-amber-600 { color: #fbbf24 !important; }

.dark .bg-red-50, .dark .bg-red-100, .dark .bg-rose-50 { background-color: #4c0519 !important; border-color: #881337 !important; color: #fb7185 !important; }
.dark .text-red-900, .dark .text-red-800, .dark .text-red-700, .dark .text-red-600, .dark .text-rose-600 { color: #fb7185 !important; }
.dark .bg-rose-600 { background-color: #e11d48 !important; color: white !important; border: none !important; }

.dark .bg-purple-50, .dark .bg-indigo-50, .dark .bg-purple-100, .dark .bg-indigo-100 { background-color: #2e1065 !important; border-color: #4c1d95 !important; color: #c084fc !important; }
.dark .text-purple-900, .dark .text-purple-800, .dark .text-purple-700, .dark .text-indigo-900, .dark .text-indigo-700 { color: #c084fc !important; }
.dark .bg-purple-600, .dark .bg-indigo-600, .dark .bg-purple-700 { background-color: #9333ea !important; color: white !important; border: none !important; }

.dark .bg-teal-50 { background-color: #042f2e !important; border-color: #115e59 !important; color: #2dd4bf !important; }
.dark .text-teal-700 { color: #2dd4bf !important; }

/* Recharts Tooltips Fixes for Dark Mode */
.dark .recharts-default-tooltip {
  background-color: #1a1d21 !important;
  border-color: #2b3036 !important;
  color: #f5f5f5 !important;
  border-radius: 0.5rem !important;
}
.dark .recharts-tooltip-item {
  color: #a3a3a3 !important;
}

INNER_EOF

mv temp.css src/index.css
