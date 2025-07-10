// src/components/analytics/UniqueUsersChart.tsx - Line chart component for displaying unique users that visited short URL

import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function UniqueUsersChart({ data }: { data: { date: string, unique_users: number }[] }) {
  return (
    <ChartContainer config={{ unique_users: { color: '#10b981', label: 'Unique Users' } }}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="unique_users" stroke="#10b981" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  );
} 