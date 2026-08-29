"use client"

import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Globe, Check } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getFlagUrl } from "@/lib/languages"
import { useState } from "react"

export function LanguageSelector() {
  const { language, languages, setLanguage } = useLanguage()
  const [flagErrors, setFlagErrors] = useState<Record<string, boolean>>({})

  return (
    <div className="relative group">
      <Button variant="ghost" size="icon" className="h-9 w-9" title="Change Language">
        <Globe className="h-4 w-4" />
      </Button>

      <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-2 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Select Language
        </div>
        <ScrollArea className="h-80">
          <div className="p-2 space-y-1">
            {languages.map((lang) => {
              const isSelected =
                language === lang.code ||
                language.toLowerCase() === lang.code.toLowerCase() ||
                (language === "en" && lang.code === "en")

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full px-2.5 py-2 text-left text-xs rounded-lg transition-colors flex items-center justify-between group ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-3.5 rounded-2xs overflow-hidden flex items-center justify-center bg-muted shrink-0 shadow-2xs">
                      {!flagErrors[lang.countryCode] ? (
                        <img
                          src={getFlagUrl(lang.countryCode)}
                          alt={lang.name}
                          className="w-full h-full object-cover"
                          onError={() =>
                            setFlagErrors((prev) => ({ ...prev, [lang.countryCode]: true }))
                          }
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs">{lang.flagEmoji}</span>
                      )}
                    </div>
                    <span className="truncate">{lang.nativeName}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
