"use client"

import { Card } from "@/components/ui/card"
import { Users, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

export function AdminOverview() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const token = useSelector((state: RootState) => state.token.token)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (err) {
        console.error("Failed to fetch admin stats", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [token])

  const overviewCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      change: "Active user accounts",
      icon: Users,
      color: "primary",
    },
    {
      label: "Total Deposits",
      value: `$${(stats?.totalDepositsAmount || 0).toLocaleString()}`,
      change: "Lifetime approved deposits",
      icon: DollarSign,
      color: "accent",
    },
    {
      label: "Total Withdrawals",
      value: `$${(stats?.totalWithdrawalsAmount || 0).toLocaleString()}`,
      change: "Lifetime processed withdrawals",
      icon: ArrowUpRight,
      color: "destructive",
    },
    {
      label: "Active Investments",
      value: stats?.activeInvestmentsCount || 0,
      change: "Currently running plans",
      icon: TrendingUp,
      color: "primary",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {overviewCards.map((card, index) => {
        const Icon = card.icon

        return (
          <Card key={index} className="p-6 flex flex-col gap-4 border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-muted-foreground font-medium">{card.label}</h3>
              <div
                className={`p-2 rounded-lg ${
                  card.color === "primary"
                    ? "bg-primary/10 text-primary"
                    : card.color === "accent"
                      ? "bg-accent/10 text-accent"
                      : "bg-destructive/10 text-destructive"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div>
              {loading ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <p className="text-2xl font-bold mb-1 text-foreground">{card.value}</p>
              )}
              {loading ? (
                <Skeleton className="h-3 w-32" />
              ) : (
                <p
                  className={`text-xs font-medium ${
                    card.color === "primary"
                      ? "text-primary"
                      : card.color === "accent"
                        ? "text-accent"
                        : "text-destructive"
                  }`}
                >
                  {card.change}
                </p>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
