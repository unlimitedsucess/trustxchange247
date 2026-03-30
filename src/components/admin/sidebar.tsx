"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, TrendingUp, LogOut, X, Wallet, CreditCard, ShieldCheck, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DarkModeToggle } from "@/components/layout/dark-mode-toggle"

interface AdminSidebarProps {
  onClose?: () => void
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Investments", href: "/admin/investments", icon: TrendingUp },
    { label: "Plans", href: "/admin/plans", icon: Layers },
    { label: "Deposits", href: "/admin/deposits", icon: CreditCard },
    { label: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
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
          <span className="font-bold text-lg hidden sm:inline tracking-tight">Admin <span className="text-primary font-normal text-sm">TrustXchange247</span></span>
        </div>
        <button onClick={onClose} className="md:hidden text-sidebar-foreground hover:text-sidebar-primary">
          <X className="h-5 w-5" />
        </button>
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

      {/* User Info & Theme Toggle */}
      <div className="border-t border-sidebar-border pt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs text-sidebar-foreground/70 uppercase tracking-wide mb-1">Admin</p>
            <p className="font-semibold text-sm truncate">Admin User</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">admin@TrustXchange247.com</p>
          </div>
          <DarkModeToggle />
        </div>

        <Button variant="outline" className="w-full gap-2 bg-transparent mt-2" size="sm">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
