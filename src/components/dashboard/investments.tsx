"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, DollarSign, Target, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DepositData {
  _id: string;
  plan: string;
  amount: number;
  currentBalance: number;
  status: string;
  startDate?: string;
  endDate?: string;
  roi: number;
  createdAt: string;
}

export function InvestmentsDashboard({ data = [] }: { data: DepositData[] }) {
  const totalInvested = data.reduce((sum, inv) => sum + (inv.amount || 0), 0)
  const totalValue = data.reduce((sum, inv) => sum + (inv.currentBalance || inv.amount || 0), 0)
  const totalProfit = totalValue - totalInvested
  const activeCount = data.filter((inv) => inv.status === "active").length
  
  // Minimal placeholder for the mock chart to avoid crashing since we don't have historical points yet
  const investmentGrowthData = [
    { month: "Jan", invested: totalInvested > 0 ? totalInvested * 0.5 : 0, currentValue: totalValue > 0 ? totalValue * 0.5 : 0 },
    { month: "Feb", invested: totalInvested > 0 ? totalInvested * 0.8 : 0, currentValue: totalValue > 0 ? totalValue * 0.8 : 0 },
    { month: "Mar", invested: totalInvested, currentValue: totalValue },
  ]

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all investments</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{((totalProfit / totalInvested) * 100).toFixed(2)}% growth</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All holdings combined</p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Growth Chart */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Investment Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={investmentGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="currentValue"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: "var(--color-primary)", r: 4 }}
                name="Current Value"
              />
              <Line
                type="monotone"
                dataKey="invested"
                stroke="var(--color-muted-foreground)"
                strokeWidth={2}
                dot={{ fill: "var(--color-muted-foreground)", r: 4 }}
                name="Invested Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Investments Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Your Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Investment Plan</th>
                  <th className="text-right py-3 px-4 font-semibold whitespace-nowrap">Invested Amount</th>
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Start Date</th>
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">End Date</th>
                  <th className="text-right py-3 px-4 font-semibold whitespace-nowrap">ROI %</th>
                  <th className="text-right py-3 px-4 font-semibold whitespace-nowrap">Current Value</th>
                  <th className="text-center py-3 px-4 font-semibold whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No investments found. Go to Investment Plans to start one!
                    </td>
                  </tr>
                ) : (
                  data.map((investment) => (
                    <tr key={investment._id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium whitespace-nowrap">{investment.plan}</td>
                      <td className="text-right py-3 px-4 whitespace-nowrap">${(investment.amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{investment.startDate ? new Date(investment.startDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{investment.endDate ? new Date(investment.endDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="text-right py-3 px-4 whitespace-nowrap">{investment.roi || 0}%</td>
                      <td className="text-right py-3 px-4 font-semibold text-success whitespace-nowrap">${(investment.currentBalance || investment.amount || 0).toLocaleString()}</td>
                      <td className="text-center py-3 px-4 whitespace-nowrap">
                        <Badge variant={investment.status === "active" ? "default" : investment.status === "pending" ? "secondary" : "outline"} className="capitalize">
                          {investment.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
