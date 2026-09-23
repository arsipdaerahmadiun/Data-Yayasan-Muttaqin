#!/bin/bash
sed -i 's/bg-slate-50 /bg-slate-50 dark:bg-[#121417] /g' src/components/StudentsView.tsx
sed -i 's/bg-slate-100/bg-slate-100 dark:bg-[#1a1d21]/g' src/components/StudentsView.tsx
sed -i 's/text-slate-400/text-slate-400 dark:text-slate-400/g' src/components/StudentsView.tsx
sed -i 's/text-slate-500/text-slate-500 dark:text-slate-300/g' src/components/StudentsView.tsx
