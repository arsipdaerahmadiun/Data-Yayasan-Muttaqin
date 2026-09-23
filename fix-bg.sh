#!/bin/bash
sed -i 's/bg-slate-50\/50/bg-slate-50\/50 dark:bg-[#121417]/g' src/components/StudentsView.tsx
sed -i 's/bg-slate-50\/30/bg-slate-50\/30 dark:bg-[#121417]/g' src/components/StudentsView.tsx
sed -i 's/bg-slate-50\/90/bg-slate-50\/90 dark:bg-[#1a1d21]/g' src/components/StudentsView.tsx
sed -i 's/bg-white/bg-white dark:bg-[#1a1d21] dark:border-[#2b3036]/g' src/components/StudentsView.tsx
