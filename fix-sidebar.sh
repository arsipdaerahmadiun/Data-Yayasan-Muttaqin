#!/bin/bash
sed -i 's/>Yayasan Al-Muttaqin</>{data.profile.name}</g' src/components/Sidebar.tsx
sed -i 's/>M</>{data.profile.name ? data.profile.name.charAt(0).toUpperCase() : "Y"}</g' src/components/Sidebar.tsx
