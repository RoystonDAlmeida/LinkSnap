// src/components/analytics/OSPieChart.tsx - Pie chart component to display OS data

import { ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e42", "#f43f5e", "#3b82f6", "#a21caf"];

export default function OSPieChart({ data }: { data: { os: string, count: number }[] }) {
  return (
    <ChartContainer config={{}}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="os" cx="50%" cy="50%" outerRadius={80} label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ChartContainer>
  );
} 