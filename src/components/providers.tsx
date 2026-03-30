"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { LanguageProvider } from "@/lib/language-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "sonner"


export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // routes where header & footer should be hidden
  const hideLayout =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard")

  return (
    <LanguageProvider>
      {!hideLayout && <Header />}
      <main>{children}</main>
      {!hideLayout && <Footer />}
      <Toaster position="top-right" />
    </LanguageProvider>
  )
}
