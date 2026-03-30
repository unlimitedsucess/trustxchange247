"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import { useBTCChart } from "@/hooks/useBTCChart"

export function TradingChart() {
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "1Y">("1M")
  const { data, price, change, loading } = useBTCChart(timeframe)

  const isPositive = change >= 0

  return (
    <section className="w-full py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trading Chart</h2>
              <p className="text-muted-foreground">Real-time market analysis and price trends</p>
            </div>
            <div className="flex gap-2">
              {["1D", "1W", "1M", "1Y"].map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(tf as any)}
                  className="font-semibold"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
            <div className="mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold">BTC / USD</h3>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold notranslate">
                    ${price.toLocaleString()}
                  </span>
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                      isPositive
                        ? "text-accent bg-accent/10"
                        : "text-red-500 bg-red-500/10"
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {isPositive ? "+" : ""}
                      {change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {loading ? "Updating..." : "Live market data"}
              </p>
            </div>

            {/* Line Chart */}
            <div className="h-80 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="BTC"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Volume Chart */}
            <div className="h-40">
              <h4 className="font-semibold text-sm mb-3">Trading Volume</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Bar dataKey="volume" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
