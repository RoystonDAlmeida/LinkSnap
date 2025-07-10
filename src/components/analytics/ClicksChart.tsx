// src/components/analytics/ClicksChart.tsx - Chart component for rendering clicks data by date
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function ClicksChart({ data }: { data: { date: string, clicks: number }[] }) {
  
  return (
    <ChartContainer config={{ clicks: { color: '#6366f1', label: 'Clicks' } }}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  );
} 