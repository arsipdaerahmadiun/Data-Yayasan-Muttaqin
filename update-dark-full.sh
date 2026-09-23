#!/bin/bash
sed -n '1,/PERFECTED DARK MODE GLOBAL OVERRIDES/p' src/index.css > temp.css

cat << 'INNER_EOF' >> temp.css
   ========================================= */

.dark {
  color-scheme: dark;
}

/* Full Dark Mode - Deep Charcoal/Black */
.dark, .dark body {
  background-color: #0a0a0a !important;
}

/* Override App.tsx root background (removes the bluish slate-950) */
.dark.bg-slate-950, .dark .bg-slate-950 {
  background-color: #0a0a0a !important;
}

/* Base Surfaces: Cards, Navbar, Sidebar */
.dark .bg-white {
  background-color: #171717 !important;
  border-color: #262626 !important;
  color: #f5f5f5 !important;
}

/* Blend Nav and Sidebar into main background seamlessly like the image */
.dark aside.bg-white, .dark header.bg-white, .dark nav.bg-white, .dark .sticky.bg-white {
  background-color: #0a0a0a !important;
  border-color: #262626 !important;
}

.dark .bg-slate-50, .dark .bg-slate-50\/50, .dark .bg-slate-100 {
  background-color: #171717 !important;
  border-color: #262626 !important;
  color: #d4d4d4 !important;
}

.dark .bg-slate-200 {
  background-color: #262626 !important;
  color: #e5e5e5 !important;
}
.dark .bg-slate-300 {
  background-color: #404040 !important;
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
  border-color: #262626 !important;
}
.dark .divide-slate-100 > :not([hidden]) ~ :not([hidden]),
.dark .divide-slate-200 > :not([hidden]) ~ :not([hidden]) {
  border-color: #262626 !important;
}

/* Interactive States */
.dark .hover\:bg-slate-50:hover, .dark .hover\:bg-slate-100:hover {
  background-color: #262626 !important;
}

/* Form Inputs */
.dark input, .dark select, .dark textarea {
  background-color: #0a0a0a !important;
  border-color: #262626 !important;
  color: #fafafa !important;
}
.dark input::placeholder, .dark textarea::placeholder {
  color: #737373 !important;
}
.dark input:focus, .dark select:focus, .dark textarea:focus {
  background-color: #171717 !important;
  border-color: #3b82f6 !important;
}

/* Shadows to Borders */
.dark .shadow-sm, .dark .shadow, .dark .shadow-md, .dark .shadow-lg, .dark .shadow-xl {
  box-shadow: none !important;
  border: 1px solid #262626 !important;
}

/* Modals & Backdrops */
.dark .bg-black\/50, .dark .bg-black\/40 {
  background-color: rgba(0, 0, 0, 0.8) !important;
}

/* Active Menu Highlights / Thematic Colors 
   Made subtle for dark mode to match the screenshot */
.dark .bg-blue-50, .dark .bg-blue-100 { 
  background-color: #1f2937 !important; /* Subtle gray-800 for active menus */
  border-color: #374151 !important; 
  color: #60a5fa !important; 
}
.dark .text-blue-900, .dark .text-blue-800, .dark .text-blue-700, .dark .text-blue-600 { 
  color: #60a5fa !important; 
}
.dark .bg-blue-500 { background-color: #3b82f6 !important; }
.dark .hover\:bg-blue-600:hover { background-color: #2563eb !important; }

.dark .bg-emerald-50, .dark .bg-emerald-100 { background-color: #064e3b !important; border-color: #065f46 !important; color: #34d399 !important; }
.dark .text-emerald-900, .dark .text-emerald-800, .dark .text-emerald-700, .dark .text-emerald-600 { color: #34d399 !important; }
.dark .bg-emerald-500 { background-color: #10b981 !important; }
.dark .hover\:bg-emerald-600:hover { background-color: #059669 !important; }

.dark .bg-amber-50, .dark .bg-amber-100, .dark .bg-yellow-50 { background-color: #451a03 !important; border-color: #78350f !important; color: #fbbf24 !important; }
.dark .text-amber-900, .dark .text-amber-800, .dark .text-amber-700, .dark .text-amber-600 { color: #fbbf24 !important; }

.dark .bg-red-50, .dark .bg-red-100 { background-color: #4c0519 !important; border-color: #881337 !important; color: #fb7185 !important; }
.dark .text-red-900, .dark .text-red-800, .dark .text-red-700, .dark .text-red-600 { color: #fb7185 !important; }

/* Recharts Tooltips Fixes for Dark Mode */
.dark .recharts-default-tooltip {
  background-color: #171717 !important;
  border-color: #262626 !important;
  color: #f5f5f5 !important;
  border-radius: 0.5rem;
}
.dark .recharts-tooltip-item {
  color: #a3a3a3 !important;
}

INNER_EOF

# Remove all !important to prevent Tailwind Vite build errors
sed -i 's/ \!important//g' temp.css

mv temp.css src/index.css
