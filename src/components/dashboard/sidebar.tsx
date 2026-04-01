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
    { label: "Withdrawal", href: "/dashboard/withdrawal", icon: CreditCard},
    { label: "Security", href: "/dashboard/security", icon: ShieldCheck },
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

        {/* WhatsApp Link */}
        <a
          href="https://wa.me/17023197242"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sidebar-foreground hover:bg-[#25D366]/10 group"
          onClick={onClose}
        >
          <svg className="h-5 w-5 text-sidebar-foreground group-hover:text-[#25D366] transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.062-.303-.15-1.267-.464-2.411-1.485-.888-.795-1.484-1.778-1.66-2.07-.174-.296-.019-.459.13-.607.136-.134.3-.347.45-.521.152-.172.2-.296.302-.494.098-.192.046-.363-.028-.51-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172 0-.372-.008-.57-.008-.201 0-.523.076-.798.375-.274.296-1.049 1.025-1.049 2.497s1.074 2.89 1.223 3.09c.149.196 2.105 3.21 5.1 4.505.713.308 1.268.492 1.701.629.715.227 1.365.195 1.886.118.577-.085 1.767-.722 2.016-1.426.248-.702.248-1.306.173-1.426-.073-.122-.272-.196-.574-.352zm-5.434 7.284h-.002c-1.49-.001-2.95-.4-4.23-1.155l-.304-.18-3.147.826.84-3.071-.197-.314a10.224 10.224 0 01-1.572-5.464c.003-5.65 4.603-10.245 10.256-10.245 2.738.002 5.312 1.07 7.247 3.007 1.936 1.938 3.003 4.512 3 7.252-.005 5.648-4.608 10.244-10.261 10.244zm8.411-16.711C18.225 2.71 15.244 1.5 12.062 1.5 6.273 1.5 1.558 6.21 1.55 12c-.004 1.85.484 3.655 1.41 5.248L1.5 24l6.905-1.812a11.956 11.956 0 005.657 1.416h.005c5.787 0 10.503-4.71 10.51-10.5.003-2.805-1.088-5.441-3.07-7.424z"/>
          </svg>
          <span className="font-medium group-hover:text-[#25D366] transition-colors">WhatsApp Support</span>
        </a>
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
