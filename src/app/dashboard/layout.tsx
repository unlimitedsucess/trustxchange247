"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { Loader2 } from "lucide-react"
import { RootState } from "@/store"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: RootState) => state.token.token)
  const pathname = usePathname()
  const router = useRouter()
  const [accessState, setAccessState] = useState<"checking" | "allowed" | "error">("checking")
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!token) {
      router.replace("/login")
      return
    }

    let cancelled = false
    const checkAccess = async () => {
      setAccessState("checking")
      try {
        const response = await fetch("/api/user/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        })
        if (response.status === 401) {
          router.replace("/login")
          return
        }
        const result = await response.json()
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not verify account access")
        }
        if (cancelled) return

        if (result.data.user?.mustResetPassword && pathname !== "/dashboard/security") {
          setAccessState("checking")
          router.replace("/dashboard/security?reset=required")
          return
        }
        setAccessState("allowed")
      } catch (error) {
        if (!cancelled) {
          console.error("Could not verify dashboard access:", error)
          setAccessState("error")
        }
      }
    }

    const handlePasswordUpdated = () => { void checkAccess() }
    window.addEventListener("password-updated", handlePasswordUpdated)
    void checkAccess()
    return () => {
      cancelled = true
      window.removeEventListener("password-updated", handlePasswordUpdated)
    }
  }, [token, pathname, retryCount, router])

  if (accessState !== "allowed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        {accessState === "error" ? (
          <div className="text-center">
            <p className="font-semibold">We couldn’t verify your account.</p>
            <button className="mt-3 text-sm text-primary underline" onClick={() => setRetryCount((count) => count + 1)}>
              Try again
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Checking account security…
          </div>
        )}
      </div>
    )
  }

  return children
}
