// src/components/analytics/DevicePieChart.tsx - PieChart component to render device data
import { ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

// Initialise COLORS array to distinguish different type of devices
const COLORS = ["#6366f1", "#10b981", "#f59e42", "#f43f5e", "#3b82f6", "#a21caf"];

export default function DevicePieChart({ data }: { data: { device: string, count: number }[] }) {
  return (
    <ChartContainer config={{}}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="device" cx="50%" cy="50%" outerRadius={80} label>
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