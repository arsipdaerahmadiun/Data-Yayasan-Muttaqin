#!/bin/bash
sed -n '1,/PERFECTED DARK MODE GLOBAL OVERRIDES/p' src/index.css > temp.css

cat << 'INNER_EOF' >> temp.css
   ========================================= */

.dark {
  color-scheme: dark;
}

/* Base Surfaces - Sleek Midnight/Navy Vibe (Like Github Dark / Screenshot) */
.dark .bg-white {
  @apply bg-[#12151c] border-[#222834] text-slate-200;
}
.dark .bg-slate-50, .dark .bg-slate-50\/50 {
  @apply bg-[#0b0f15] border-[#222834] text-slate-300;
}
.dark .bg-slate-100 {
  @apply bg-[#0b0f15] text-slate-200;
}
.dark .bg-slate-200 {
  @apply bg-[#1e232d] text-slate-200;
}
.dark .bg-slate-300 {
  @apply bg-[#2a303c];
}

/* Blend Nav and Sidebar into background */
.dark aside.bg-white, .dark header.bg-white, .dark nav.bg-white, .dark .sticky.bg-white {
  @apply bg-[#0b0f15] border-[#222834];
}

/* Text Colors */
.dark .text-slate-900, .dark .text-slate-800 {
  @apply text-[#e6edf3];
}
.dark .text-slate-700, .dark .text-slate-600 {
  @apply text-[#9ca3af];
}
.dark .text-slate-500, .dark .text-slate-400 {
  @apply text-[#6b7280];
}

/* Borders & Dividers */
.dark .border-slate-200, .dark .border-slate-100 {
  @apply border-[#222834];
}
.dark .divide-slate-100 > :not([hidden]) ~ :not([hidden]),
.dark .divide-slate-200 > :not([hidden]) ~ :not([hidden]) {
  @apply border-[#222834];
}

/* Interactive States */
.dark .hover\:bg-slate-50:hover {
  @apply bg-[#181c25];
}
.dark .hover\:bg-slate-100:hover {
  @apply bg-[#181c25];
}

/* Form Inputs */
.dark input, .dark select, .dark textarea {
  @apply bg-[#0b0f15] border-[#222834] text-[#e6edf3] placeholder:text-[#6b7280] focus:bg-[#12151c] focus:border-blue-500;
}

/* Shadows to Borders (Prevents glowing white boxes on dark mode) */
.dark .shadow-sm, .dark .shadow, .dark .shadow-md, .dark .shadow-lg, .dark .shadow-xl {
  box-shadow: none;
  @apply border border-[#222834];
}

/* Modals & Backdrops */
.dark .bg-black\/50, .dark .bg-black\/40 {
  @apply bg-[#000000]/80;
}

/* Active Menu Highlights / Thematic Colors */
.dark .bg-blue-50, .dark .bg-blue-100 { 
  @apply bg-[#172033] border border-[#263b63] text-blue-400; 
}
.dark .text-blue-900, .dark .text-blue-800, .dark .text-blue-700, .dark .text-blue-600 { 
  @apply text-blue-400; 
}
.dark .bg-blue-500 { @apply bg-[#2563eb]; }
.dark .hover\:bg-blue-600:hover { @apply bg-[#1d4ed8]; }

.dark .bg-emerald-50, .dark .bg-emerald-100 { @apply bg-[#12231c] border border-[#1b3d2b] text-emerald-400; }
.dark .text-emerald-900, .dark .text-emerald-800, .dark .text-emerald-700, .dark .text-emerald-600 { @apply text-emerald-400; }
.dark .bg-emerald-500 { @apply bg-[#10b981]; }
.dark .hover\:bg-emerald-600:hover { @apply bg-[#059669]; }

.dark .bg-amber-50, .dark .bg-amber-100, .dark .bg-yellow-50 { @apply bg-[#2b2210] border border-[#4d3a14] text-amber-400; }
.dark .text-amber-900, .dark .text-amber-800, .dark .text-amber-700, .dark .text-amber-600 { @apply text-amber-400; }

.dark .bg-red-50, .dark .bg-red-100 { @apply bg-[#30161a] border border-[#5c2128] text-red-400; }
.dark .text-red-900, .dark .text-red-800, .dark .text-red-700, .dark .text-red-600 { @apply text-red-400; }

/* Recharts Tooltips Fixes for Dark Mode */
.dark .recharts-default-tooltip {
  @apply bg-[#12151c] border-[#222834] text-[#e6edf3] !important;
  border-radius: 0.5rem;
}
.dark .recharts-tooltip-item {
  @apply text-[#9ca3af] !important;
}

INNER_EOF

mv temp.css src/index.css
