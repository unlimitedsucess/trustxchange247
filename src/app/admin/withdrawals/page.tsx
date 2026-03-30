"use client"

import { AdminSidebar } from "@/components/admin/sidebar"
import { WithdrawalsPanel } from "@/components/admin/withdrawals"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminWithdrawalsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:relative w-64 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 z-50 md:z-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-30">
            <span className="font-semibold">Withdrawals</span>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 sm:p-8 bg-background">
            {/* Breadcrumb */}
            <div className="mb-8 text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">Admin</span> / Withdrawals
            </div>

            <WithdrawalsPanel />
          </div>
        </main>
      </div>
    </div>
  )
}
