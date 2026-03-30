"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"

const defaultGrowthData = [
  { date: "Jan 1", value: 125000, total: 125000 },
  { date: "Jan 5", value: 127150, total: 127150 },
  { date: "Jan 10", value: 129640, total: 129640 },
  { date: "Jan 15", value: 132420, total: 132420 },
  { date: "Jan 20", value: 135680, total: 135680 },
  { date: "Jan 25", value: 139120, total: 139120 },
  { date: "Feb 1", value: 143750, total: 143750 },
]

export function InvestmentGrowthChart({ data = defaultGrowthData }: { data?: any[] }) {
  const chartData = data.length > 0 ? data : defaultGrowthData;

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-bold mb-6">Investment Growth</h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-accent)"
              strokeWidth={3}
              dot={false}
              fillOpacity={1}
              fill="url(#colorGrowth)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
