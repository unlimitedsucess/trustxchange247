"use client"

import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Globe, Check } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

type LanguageCode =
  | "en"
  | "es"
  | "tr"
  | "pt"
  | "ar"
  | "fr"
  | "de"
  | "it"
  | "ru"
  | "zh"
  | "hi"
  | "ja"
  | "ko"
  | "pl"
  | "uk"
  | "nl"
  | "sv"
  | "da"
  | "no"
  | "fi"
  | "cs"
  | "hu"
  | "ro"
  | "el"
  | "th"
  | "vi"
  | "id"
  | "ms"
  | "tl"
  | "bn"
  | "ur"
  | "pa"
  | "ta"
  | "te"
  | "mr"
  | "gu"
  | "kn"
  | "ml"
  | "he"
  | "fa"
  | "tr"
  | "af"
  | "sq"
  | "hy"
  | "az"
  | "be"
  | "bs"
  | "bg"

const languages: { code: LanguageCode; name: string }[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "tr", name: "Türkçe" },
  { code: "pt", name: "Português (Brasil)" },
  { code: "ar", name: "العربية" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "ru", name: "Русский" },
  { code: "zh", name: "中文" },
  { code: "hi", name: "हिन्दी" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "pl", name: "Polski" },
  { code: "uk", name: "Українська" },
  { code: "nl", name: "Nederlands" },
  { code: "sv", name: "Svenska" },
  { code: "da", name: "Dansk" },
  { code: "no", name: "Norsk" },
  { code: "fi", name: "Suomi" },
  { code: "cs", name: "Čeština" },
  { code: "hu", name: "Magyar" },
  { code: "ro", name: "Română" },
  { code: "el", name: "Ελληνικά" },
  { code: "th", name: "ไทย" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "ms", name: "Bahasa Melayu" },
  { code: "tl", name: "Tagalog" },
  { code: "bn", name: "বাংলা" },
  { code: "ur", name: "اردو" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "mr", name: "मराठी" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ml", name: "മലയാളം" },
  { code: "he", name: "עברית" },
  { code: "fa", name: "فارسی" },
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Shqip" },
  { code: "hy", name: "Հայերեն" },
  { code: "az", name: "Azərbaycanca" },
  { code: "be", name: "Беларуская" },
  { code: "bs", name: "Bosanski" },
  { code: "bg", name: "Български" },
]

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="relative group">
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Globe className="h-4 w-4" />
      </Button>

      <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg hidden group-hover:block z-50">
        <ScrollArea className="h-80">
          <div className="p-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-full px-4 py-2 text-left text-sm rounded hover:bg-muted transition-colors flex items-center justify-between ${
                  language === lang.code ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                }`}
              >
                <span>{lang.name}</span>
                {language === lang.code && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
