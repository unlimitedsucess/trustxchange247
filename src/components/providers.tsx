"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { LanguageProvider } from "@/lib/language-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "sonner"


export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const existingScript = document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')
    if (existingScript) return

    const script = document.createElement("script")
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true
    document.body.appendChild(script)

    window.googleTranslateElementInit = () => {
      ;(window as any).google?.translate?.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "ar,de,en,es,fr,hi,it,ja,ko,pt,ru,tr,zh-CN",
        },
        "google_translate_element",
      )
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
      delete (window as any).googleTranslateElementInit
    }
  }, [])

  // routes where header & footer should be hidden
  const hideLayout =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard")

  return (
    <LanguageProvider>
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
      {!hideLayout && <Header />}
      <main>{children}</main>
      {!hideLayout && <Footer />}
      <Toaster position="top-right" />
    </LanguageProvider>
  )
}
