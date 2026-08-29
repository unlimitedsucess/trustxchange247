"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { LanguageProvider } from "@/lib/language-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "sonner"


import { DraggableTranslator } from "@/components/layout/draggable-translator"

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Setup Google Translate Initialization Function
    window.googleTranslateElementInit = () => {
      try {
        if ((window as any).google?.translate?.TranslateElement) {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: "en",
              autoDisplay: false,
            },
            "google_translate_element"
          )
        }
      } catch (err) {
        console.error("Google Translate initialization error:", err)
      }
    }

    const existingScript = document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')
    if (!existingScript) {
      const script = document.createElement("script")
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      script.async = true
      document.body.appendChild(script)
    } else if ((window as any).google?.translate) {
      window.googleTranslateElementInit()
    }
  }, [])

  // routes where header & footer should be hidden
  const hideLayout =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard")

  return (
    <LanguageProvider>
      {/* Hidden Offscreen Anchor for Google Translate */}
      <div
        id="google_translate_element"
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -100,
        }}
        aria-hidden="true"
      />

      {/* Floating Draggable Translator available on all pages */}
      <DraggableTranslator />

      {!hideLayout && <Header />}
      <main>{children}</main>
      {!hideLayout && <Footer />}
      <Toaster position="top-right" />
    </LanguageProvider>
  )
}
