"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardOverview } from "@/components/dashboard/overview"
import { WithdrawalTable } from "@/components/dashboard/withdrawal-table"
import { WithdrawForm } from "@/components/dashboard/withdraw-form"
import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { useRouter } from "next/navigation"

export default function WithdrawalPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<any>({
    totalInvested: 0,
    totalProfit: 0,
    totalBonus: 0,
    activeInvestments: 0,
    withdrawableBalance: 0,
    totalWithdrawn: 0,
    recentWithdrawals: []
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
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-full bg-sidebar z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <DashboardSidebar onClose={() => setSidebarOpen(false)} user={stats.user} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <span className="font-bold">TrustXchange</span>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
          {/* Breadcrumb Alternative */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Withdrawal Hub</h1>
            <p className="text-muted-foreground text-sm">Manage your payouts and view transaction history.</p>
          </div>

          <DashboardOverview 
             totalInvested={stats.totalInvested}
             totalProfit={stats.totalProfit}
             totalBonus={stats.totalBonus}
             activeInvestments={stats.activeInvestments}
             withdrawableBalance={stats.withdrawableBalance}
             totalWithdrawn={stats.totalWithdrawn}
          />
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
             <WithdrawForm onSuccess={() => window.location.reload()} availableBalance={stats.withdrawableBalance} />
             <div className="space-y-4">
                <h3 className="text-lg font-bold">Withdrawal History</h3>
                <WithdrawalTable data={stats.recentWithdrawals} />
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
