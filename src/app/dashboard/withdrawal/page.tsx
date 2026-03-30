"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardOverview } from "@/components/dashboard/overview"
import { InvestmentTable } from "@/components/dashboard/investment-table"
import { WithdrawalTable } from "@/components/dashboard/withdrawal-table"

import { WithdrawForm } from "@/components/dashboard/withdraw-form"
import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const token = useSelector((state:RootState)=> state.token)
  const router = useRouter()


  useEffect(() => {
    if (!token) {
      
      router.push("/login");
    }
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
        <DashboardSidebar onClose={() => setSidebarOpen(false)} />
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

          <DashboardOverview />
          <WithdrawForm />
          <WithdrawalTable />
        </div>
      </main>
    </div>
  )
}
