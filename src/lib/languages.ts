export interface LanguageItem {
  code: string          // Google Translate language code (e.g. "en", "es", "zh-CN", "pt", "ar")
  name: string          // English name (e.g. "Spanish")
  nativeName: string    // Native name (e.g. "Español")
  countryCode: string   // 2-letter ISO country code for flag image (e.g. "us", "es", "mx")
  flagEmoji: string     // Emoji fallback (e.g. "🇪🇸")
  displayCode: string   // Uppercase badge (e.g. "EN", "ES")
}

export const LANGUAGES: LanguageItem[] = [
  { code: "en", name: "English", nativeName: "English", countryCode: "us", flagEmoji: "🇺🇸", displayCode: "EN" },
  { code: "es", name: "Spanish", nativeName: "Español", countryCode: "es", flagEmoji: "🇪🇸", displayCode: "ES" },
  { code: "fr", name: "French", nativeName: "Français", countryCode: "fr", flagEmoji: "🇫🇷", displayCode: "FR" },
  { code: "de", name: "German", nativeName: "Deutsch", countryCode: "de", flagEmoji: "🇩🇪", displayCode: "DE" },
  { code: "it", name: "Italian", nativeName: "Italiano", countryCode: "it", flagEmoji: "🇮🇹", displayCode: "IT" },
  { code: "pt", name: "Portuguese", nativeName: "Português", countryCode: "pt", flagEmoji: "🇵🇹", displayCode: "PT" },
  { code: "ru", name: "Russian", nativeName: "Русский", countryCode: "ru", flagEmoji: "🇷🇺", displayCode: "RU" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文", countryCode: "cn", flagEmoji: "🇨🇳", displayCode: "ZH" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文", countryCode: "tw", flagEmoji: "🇹🇼", displayCode: "ZH" },
  { code: "ja", name: "Japanese", nativeName: "日本語", countryCode: "jp", flagEmoji: "🇯🇵", displayCode: "JA" },
  { code: "ko", name: "Korean", nativeName: "한국어", countryCode: "kr", flagEmoji: "🇰🇷", displayCode: "KO" },
  { code: "ar", name: "Arabic", nativeName: "العربية", countryCode: "sa", flagEmoji: "🇸🇦", displayCode: "AR" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", countryCode: "tr", flagEmoji: "🇹🇷", displayCode: "TR" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", countryCode: "in", flagEmoji: "🇮🇳", displayCode: "HI" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", countryCode: "bd", flagEmoji: "🇧🇩", displayCode: "BN" },
  { code: "ur", name: "Urdu", nativeName: "اردو", countryCode: "pk", flagEmoji: "🇵🇰", displayCode: "UR" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", countryCode: "nl", flagEmoji: "🇳🇱", displayCode: "NL" },
  { code: "pl", name: "Polish", nativeName: "Polski", countryCode: "pl", flagEmoji: "🇵🇱", displayCode: "PL" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", countryCode: "ua", flagEmoji: "🇺🇦", displayCode: "UK" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", countryCode: "se", flagEmoji: "🇸🇪", displayCode: "SV" },
  { code: "da", name: "Danish", nativeName: "Dansk", countryCode: "dk", flagEmoji: "🇩🇰", displayCode: "DA" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", countryCode: "no", flagEmoji: "🇳🇴", displayCode: "NO" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", countryCode: "fi", flagEmoji: "🇫🇮", displayCode: "FI" },
  { code: "cs", name: "Czech", nativeName: "Čeština", countryCode: "cz", flagEmoji: "🇨🇿", displayCode: "CS" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", countryCode: "hu", flagEmoji: "🇭🇺", displayCode: "HU" },
  { code: "ro", name: "Romanian", nativeName: "Română", countryCode: "ro", flagEmoji: "🇷🇴", displayCode: "RO" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", countryCode: "gr", flagEmoji: "🇬🇷", displayCode: "EL" },
  { code: "th", name: "Thai", nativeName: "ไทย", countryCode: "th", flagEmoji: "🇹🇭", displayCode: "TH" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", countryCode: "vn", flagEmoji: "🇻🇳", displayCode: "VI" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", countryCode: "id", flagEmoji: "🇮🇩", displayCode: "ID" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", countryCode: "my", flagEmoji: "🇲🇾", displayCode: "MS" },
  { code: "tl", name: "Filipino", nativeName: "Filipino", countryCode: "ph", flagEmoji: "🇵🇭", displayCode: "TL" },
  { code: "iw", name: "Hebrew", nativeName: "עברית", countryCode: "il", flagEmoji: "🇮🇱", displayCode: "HE" },
  { code: "fa", name: "Persian", nativeName: "فارسی", countryCode: "ir", flagEmoji: "🇮🇷", displayCode: "FA" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", countryCode: "za", flagEmoji: "🇿🇦", displayCode: "AF" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", countryCode: "ke", flagEmoji: "🇰🇪", displayCode: "SW" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", countryCode: "in", flagEmoji: "🇮🇳", displayCode: "TA" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", countryCode: "in", flagEmoji: "🇮🇳", displayCode: "TE" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", countryCode: "in", flagEmoji: "🇮🇳", displayCode: "MR" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", countryCode: "in", flagEmoji: "🇮🇳", displayCode: "GU" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", countryCode: "in", flagEmoji: "🇮🇳", displayCode: "KN" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", countryCode: "in", flagEmoji: "🇮🇳", displayCode: "ML" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", countryCode: "in", flagEmoji: "🇮🇳", displayCode: "PA" },
  { code: "bg", name: "Bulgarian", nativeName: "Български", countryCode: "bg", flagEmoji: "🇧🇬", displayCode: "BG" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", countryCode: "hr", flagEmoji: "🇭🇷", displayCode: "HR" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina", countryCode: "sk", flagEmoji: "🇸🇰", displayCode: "SK" },
  { code: "sr", name: "Serbian", nativeName: "Српски", countryCode: "rs", flagEmoji: "🇷🇸", displayCode: "SR" },
  { code: "sq", name: "Albanian", nativeName: "Shqip", countryCode: "al", flagEmoji: "🇦🇱", displayCode: "SQ" },
  { code: "hy", name: "Armenian", nativeName: "Հայերեն", countryCode: "am", flagEmoji: "🇦🇲", displayCode: "HY" },
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycanca", countryCode: "az", flagEmoji: "🇦🇿", displayCode: "AZ" },
  { code: "ka", name: "Georgian", nativeName: "ქართული", countryCode: "ge", flagEmoji: "🇬🇪", displayCode: "KA" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақ тілі", countryCode: "kz", flagEmoji: "🇰🇿", displayCode: "KK" },
  { code: "uz", name: "Uzbek", nativeName: "Oʻzbekcha", countryCode: "uz", flagEmoji: "🇺🇿", displayCode: "UZ" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", countryCode: "et", flagEmoji: "🇪🇹", displayCode: "AM" },
  { code: "yo", name: "Yoruba", nativeName: "Èdè Yorùbá", countryCode: "ng", flagEmoji: "🇳🇬", displayCode: "YO" },
  { code: "ig", name: "Igbo", nativeName: "Asụsụ Igbo", countryCode: "ng", flagEmoji: "🇳🇬", displayCode: "IG" },
  { code: "ha", name: "Hausa", nativeName: "Harshen Hausa", countryCode: "ng", flagEmoji: "🇳🇬", displayCode: "HA" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu", countryCode: "za", flagEmoji: "🇿🇦", displayCode: "ZU" },
]

export function getLanguageByCode(code: string): LanguageItem {
  if (!code) return LANGUAGES[0]
  const cleanCode = code.toLowerCase().trim()
  const found = LANGUAGES.find((l) => l.code.toLowerCase() === cleanCode || l.displayCode.toLowerCase() === cleanCode)
  return found || LANGUAGES[0]
}

export function getFlagUrl(countryCode: string): string {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
}

/**
 * Applies Google Translate translation for the whole webpage.
 */
export function applyGoogleTranslation(targetLang: string) {
  if (typeof window === "undefined") return

  try {
    const isEnglish = targetLang === "en"
    const date = new Date()
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000)
    const expires = "; expires=" + date.toUTCString()

    // Clear old cookies first
    const clearCookie = (cookieName: string) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      const hostParts = window.location.hostname.split(".")
      if (hostParts.length > 1) {
        const rootDomain = "." + hostParts.slice(-2).join(".")
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain}`
      }
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
    }

    clearCookie("googtrans")

    if (isEnglish) {
      document.cookie = `googtrans=/auto/en; path=/;${expires}`
      document.cookie = `googtrans=/en/en; path=/;${expires}`
    } else {
      document.cookie = `googtrans=/auto/${targetLang}; path=/;${expires}`
      document.cookie = `googtrans=/en/${targetLang}; path=/;${expires}`
      
      const hostParts = window.location.hostname.split(".")
      if (hostParts.length > 1) {
        const rootDomain = "." + hostParts.slice(-2).join(".")
        document.cookie = `googtrans=/auto/${targetLang}; path=/; domain=${rootDomain};${expires}`
        document.cookie = `googtrans=/en/${targetLang}; path=/; domain=${rootDomain};${expires}`
      }
    }

    localStorage.setItem("language", targetLang)

    // Attempt to directly change Google Translate select dropdown if mounted
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null
    if (select) {
      select.value = isEnglish ? "" : targetLang
      select.dispatchEvent(new Event("change", { bubbles: true }))
    } else {
      // If select not ready or on hard reset, reload to let the google translate engine initialize with the cookie
      window.location.reload()
    }
  } catch (error) {
    console.error("Failed to apply translation:", error)
  }
}
