"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardOverview } from "@/components/dashboard/overview"
import { InvestmentTable } from "@/components/dashboard/investment-table"
import { WithdrawalTable } from "@/components/dashboard/withdrawal-table"
import { InvestmentGrowthChart } from "@/components/dashboard/growth-chart"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Menu, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [stats, setStats] = useState<{
    totalInvested: number;
    totalProfit: number;
    totalBonus: number;
    activeInvestments: number;
    withdrawableBalance: number;
    totalWithdrawn: number;
    recentInvestments: any[];
    recentWithdrawals: any[];
    dailyReturns: any[];
    user?: { name: string; email: string };
  }>({
    totalInvested: 0,
    totalProfit: 0,
    totalBonus: 0,
    activeInvestments: 0,
    withdrawableBalance: 0,
    totalWithdrawn: 0,
    recentInvestments: [],
    recentWithdrawals: [],
    dailyReturns: []
  })

  const token = useSelector((state: RootState) => state.token.token)
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/user/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    fetchStats();
  }, [token, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative w-64 h-full bg-sidebar z-50 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <DashboardSidebar onClose={() => setSidebarOpen(false)} user={stats.user} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight">TrustXchange</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:p-8 space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Investment Overview</h1>
            <p className="text-muted-foreground text-sm">Welcome back, {stats.user?.name || "Investor"}. Here is your portfolio status.</p>
          </div>

          <DashboardOverview 
            totalInvested={stats.totalInvested}
            totalProfit={stats.totalProfit}
            totalBonus={stats.totalBonus}
            activeInvestments={stats.activeInvestments}
            withdrawableBalance={stats.withdrawableBalance}
            totalWithdrawn={stats.totalWithdrawn}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <InvestmentGrowthChart />
            </div>
            
            {/* Daily Returns History */}
            <Card className="flex flex-col border-border bg-card shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b bg-muted/20">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Earning History
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="py-3 px-4 text-[11px] font-bold uppercase text-muted-foreground">Log</th>
                                <th className="py-3 px-4 text-[11px] font-bold uppercase text-muted-foreground">Type</th>
                                <th className="py-3 px-4 text-[11px] font-bold uppercase text-muted-foreground text-right">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                             {stats.dailyReturns.length > 0 ? (
                                 stats.dailyReturns.slice(0, 15).map((dr: any) => (
                                     <tr key={dr.id} className="hover:bg-muted/30 transition-colors">
                                         <td className="py-3 px-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{dr.day}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">{dr.date}</span>
                                            </div>
                                         </td>
                                         <td className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest leading-none">
                                            <span className={dr.type === "bonus" ? "text-accent" : "text-primary"}>
                                                {dr.type === "bonus" ? "Bonus" : "Growth"}
                                            </span>
                                         </td>
                                         <td className={`py-3 px-4 text-sm text-right font-bold tabular-nums ${dr.type === 'bonus' ? 'text-accent' : 'text-primary'}`}>
                                            {dr.type === 'bonus' ? '+' : ''}{dr.amount}
                                         </td>
                                     </tr>
                                 ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="py-12 text-center text-muted-foreground italic text-sm">No activity records.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {stats.dailyReturns.length > 15 && (
                    <div className="p-3 text-center border-t bg-muted/10">
                        <span className="text-[10px] text-muted-foreground font-semibold">View all history in transactions</span>
                    </div>
                )}
            </Card>
          </div>

          <div className="space-y-8">
            <InvestmentTable data={stats.recentInvestments} />
            <WithdrawalTable data={stats.recentWithdrawals} />
          </div>
        </div>
      </main>
    </div>
  )
}
