"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, TrendingUp, LogOut, BarChart, X, CreditCard, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DarkModeToggle } from "../layout/dark-mode-toggle"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import { tokenActions } from "@/store/token/token-slice"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface DashboardSidebarProps {
  onClose?: () => void
  user?: { name: string; email: string }
}

export function DashboardSidebar({ onClose, user: propUser }: DashboardSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Investments", href: "/dashboard/investments", icon: TrendingUp },
    { label: "Investment Plans", href: "/dashboard/investment-plan", icon: BarChart },
    { label: "Withrawal", href: "/dashboard/withdrawal", icon: CreditCard},
  ]

  const isActive = (href: string) => pathname === href
  const dispatch = useDispatch()
  const router = useRouter()

  const token = useSelector((state: RootState) => state.token.token)
  const [localUser, setLocalUser] = useState<{name: string, email: string} | null>(null)

  useEffect(() => {
    if (propUser) {
      setLocalUser(propUser)
    } else if (token) {
      try {
        // Decode the JWT standard Payload (Base64Url -> Base64 -> String -> Object)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        if (payload.fullName) {
          setLocalUser({ name: payload.fullName, email: payload.email });
        }
      } catch (e) {
        console.error("Token decoding failed", e)
      }
    }
  }, [token, propUser])

  const handleLogout = () => {
    dispatch(tokenActions.deleteToken())
    router.push("/login")
  }

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

      <div className="border-t border-sidebar-border pt-6">
        <div className="mb-4">
          <p className="text-xs text-sidebar-foreground/70 uppercase tracking-wide mb-1">Account</p>
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex flex-col items-center justify-center text-primary font-bold">
               {localUser?.name ? localUser.name.substring(0,2).toUpperCase() : "??"}
             </div>
             <div className="flex flex-col overflow-hidden">
               <p className="font-semibold text-sm truncate">{localUser?.name || "Loading..."}</p>
               <p className="text-xs text-sidebar-foreground/70 truncate">{localUser?.email || "..."}</p>
             </div>
          </div>
        </div>

        <Button variant="outline" className="w-full gap-2 bg-transparent" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
