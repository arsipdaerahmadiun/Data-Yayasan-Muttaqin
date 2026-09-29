import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AssetItem } from "../../types";

interface TransferStatusChartProps {
  assets: AssetItem[];
}

export const TransferStatusChart: React.FC<TransferStatusChartProps> = ({ assets }) => {
  const data = useMemo(() => {
    // Kategori: SHM yayasan, SHGB yayasan, AIW yayasan, SHM belum Yayasan
    const counts = {
      "SHM Yayasan": 0,
      "SHGB Yayasan": 0,
      "AIW Yayasan": 0,
      "SHM blm Yayasan": 0,
    };

    assets.forEach(asset => {
      const isYayasan = asset.registeredOwner?.toLowerCase().includes("yayasan");
      const isSHM = asset.legalDocType?.includes("SHM");
      const isSHGB = asset.legalDocType?.includes("HGB");
      const isAIW = asset.legalDocType?.includes("AIW");

      if (isSHM && isYayasan) counts["SHM Yayasan"]++;
      else if (isSHGB && isYayasan) counts["SHGB Yayasan"]++;
      else if (isAIW && isYayasan) counts["AIW Yayasan"]++;
      else if (isSHM && !isYayasan) counts["SHM blm Yayasan"]++;
      // Aset lainnya tidak dimasukkan ke dalam sub-kategori spesifik, 
      // namun akan dihitung dalam 'Total' di bawah.
    });

    const total = assets.length; // Total berdasarkan jumlah aset asli
    
    return [
      ...Object.entries(counts).map(([name, value]) => ({ name, value })),
      { name: "Total", value: total }
    ];
  }, [assets]);

  const COLORS = ["#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6", "#1e3a8a"];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e120" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: "#475569", fontSize: 10 }} 
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fill: "#475569", fontSize: 10 }} />
        <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", fontSize: "12px" }} />
        <Bar dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
