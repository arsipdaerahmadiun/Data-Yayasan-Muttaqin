#!/bin/bash
for file in src/components/*View.tsx; do
  sed -i 's/bg-white/bg-white dark:bg-[#1a1d21] dark:border-[#2b3036]/g' "$file"
  sed -i 's/bg-slate-50\//bg-slate-50\/ dark:bg-[#121417]\//g' "$file"
  sed -i 's/bg-slate-50 /bg-slate-50 dark:bg-[#121417] /g' "$file"
  sed -i 's/bg-slate-100/bg-slate-100 dark:bg-[#1a1d21]/g' "$file"
done
