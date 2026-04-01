"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardOverview } from "@/components/dashboard/overview"
import { InvestmentTable } from "@/components/dashboard/investment-table"
import { WithdrawalTable } from "@/components/dashboard/withdrawal-table"
import { InvestmentGrowthChart } from "@/components/dashboard/growth-chart"
import { Card } from "@/components/ui/card"

import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
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
          headers: {
            Authorization: `Bearer ${token}`
          }
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
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-full bg-sidebar md:overflow-hidden text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 z-50 md:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <DashboardSidebar onClose={() => setSidebarOpen(false)} user={stats.user} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
       
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-30">
          <span className="font-semibold">Dashboard</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-background">
          {/* Breadcrumb */}
          <div className="mb-8 text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">Dashboard</span> / Overview
          </div>

          <DashboardOverview 
            totalInvested={stats.totalInvested}
            totalProfit={stats.totalProfit}
            totalBonus={stats.totalBonus}
            activeInvestments={stats.activeInvestments}
            withdrawableBalance={stats.withdrawableBalance}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
            <InvestmentGrowthChart />
            
            {/* Daily Returns Section */}
            <Card className="flex flex-col border-border bg-card shadow-sm p-6 overflow-hidden">
                <h2 className="text-xl font-bold mb-4">Daily Returns History</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="text-left py-3 px-4 text-sm font-semibold">Day</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold">Amount</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                             {stats.dailyReturns.length > 0 ? (
                                 stats.dailyReturns.slice(0, 20).map((dr: any) => (
                                     <tr key={dr.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                         <td className="py-3 px-4 text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{dr.day}</span>
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-tighter">{dr.type === 'bonus' ? 'Special Reward' : 'Daily ROI'}</span>
                                            </div>
                                         </td>
                                         <td className={`py-3 px-4 text-sm text-right font-bold ${dr.type === 'bonus' ? 'text-accent' : 'text-primary'}`}>
                                            {dr.type === 'bonus' ? '+' : ''}{dr.amount}
                                         </td>
                                         <td className="py-3 px-4 text-sm text-right text-muted-foreground font-mono">{dr.date}</td>
                                     </tr>
                                 ))

                            ) : (
                                <tr>
                                    <td colSpan={3} className="py-8 text-center text-muted-foreground italic">No daily returns recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
          </div>
          <InvestmentTable data={stats.recentInvestments} />
          <WithdrawalTable data={stats.recentWithdrawals} />
        </div>
      </main>
    </div>
  )
}
