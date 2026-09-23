#!/bin/bash
sed -i 's/            M/            {data?.profile?.name ? (data.profile.name.toLowerCase().startsWith("yayasan ") ? data.profile.name.substring(8).charAt(0).toUpperCase() : data.profile.name.charAt(0).toUpperCase()) : "Y"}/g' src/components/Sidebar.tsx
