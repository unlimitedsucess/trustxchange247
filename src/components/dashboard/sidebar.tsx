"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, TrendingUp, LogOut, BarChart, X, CreditCard, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DarkModeToggle } from "../layout/dark-mode-toggle"


interface DashboardSidebarProps {
  onClose?: () => void
}

export function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Investments", href: "/dashboard/investments", icon: TrendingUp },
    { label: "Investment Plans", href: "/dashboard/investment-plan", icon: BarChart },
    { label: "Withrawal", href: "/dashboard/withdrawal", icon: CreditCard},
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="flex flex-col h-full p-6">
      {/* Logo and Close */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-sidebar-primary to-accent shadow-sm">
            <ShieldCheck className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden sm:inline tracking-tight">Trust<span className="text-primary">X</span>change247</span>
        </div>
        <button onClick={onClose} className="md:hidden text-sidebar-foreground hover:text-sidebar-primary">
          <X className="h-5 w-5" />
        </button>
         <DarkModeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
              onClick={onClose}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-sidebar-border pt-6">
        <div className="mb-4">
          <p className="text-xs text-sidebar-foreground/70 uppercase tracking-wide mb-1">Account</p>
          <p className="font-semibold text-sm truncate">John Doe</p>
          <p className="text-xs text-sidebar-foreground/70 truncate">john@example.com</p>
        </div>

        <Button variant="outline" className="w-full gap-2 bg-transparent" size="sm">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
