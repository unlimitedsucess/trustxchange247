"use client"

import Link from "next/link"
import { Menu, ShieldCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DarkModeToggle } from "./dark-mode-toggle"
import { LanguageSelector } from "./language-selector"
import { useLanguage } from "@/lib/language-context"
import { useEffect, useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t: translate } = useLanguage()
  const t: (key: string) => string = translate || ((key: string) => key)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true
    document.body.appendChild(script)

    window.googleTranslateElementInit = () => {
      ;new (window as any).google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "ar,de,en,es,fr,hi,it,ja,ko,pt,ru,tr,zh-CN" },
        "google_translate_element",
      )
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-accent shadow-sm">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:inline tracking-tight">Trust<span className="text-primary">X</span>change247</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-foreground hover:text-primary transition">
              {t("header.home")}
            </Link>
            <Link href="/about" className="text-sm text-foreground hover:text-primary transition">
              {t("header.about")}
            </Link>
            <Link href="/contact" className="text-sm text-foreground hover:text-primary transition">
              {t("header.contact")}
            </Link>
            <Link href="/faq" className="text-sm text-foreground hover:text-primary transition">
              {t("header.faq")}
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Google Translate */}
            <div id="google_translate_element" className="hidden sm:block "></div>

            {/* Language Selector */}
            <div className="hidden sm:flex">
              <LanguageSelector />
            </div>

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Auth Links */}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("header.login")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">{t("header.register")}</Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-4 px-2">
            <nav className="flex flex-col gap-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary transition">
                {t("header.home")}
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary transition">
                {t("header.about")}
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary transition">
                {t("header.contact")}
              </Link>
              <Link href="/faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary transition">
                {t("header.faq")}
              </Link>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-border mt-2">
                <Button variant="outline" className="w-full justify-center" asChild>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>{t("header.login")}</Link>
                </Button>
                <Button className="w-full justify-center" asChild>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>{t("header.register")}</Link>
                </Button>
                
                {/* Mobile Language Selector */}
                <div className="w-full mt-2 flex justify-center border-t border-border pt-4">
                  <LanguageSelector />
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
