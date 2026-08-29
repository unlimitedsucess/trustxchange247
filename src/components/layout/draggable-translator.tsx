"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useLanguage } from "@/lib/language-context"
import { getFlagUrl, type LanguageItem } from "@/lib/languages"
import { ChevronDown, ChevronUp, Search, X, Check, Globe } from "lucide-react"

export function DraggableTranslator() {
  const { language, currentLanguage, languages, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isDraggingState, setIsDraggingState] = useState(false)
  const [flagImgError, setFlagImgError] = useState<Record<string, boolean>>({})

  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const dragInfoRef = useRef<{
    startX: number
    startY: number
    startPosX: number
    startPosY: number
    hasMoved: boolean
  }>({ startX: 0, startY: 0, startPosX: 0, startPosY: 0, hasMoved: false })

  // Initialize position on client mount
  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem("translator_widget_pos")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          // Validate position is within current window bounds
          const safeX = Math.min(Math.max(10, parsed.x), window.innerWidth - 130)
          const safeY = Math.min(Math.max(10, parsed.y), window.innerHeight - 60)
          setPosition({ x: safeX, y: safeY })
          return
        }
      } catch (e) {
        console.error("Error reading saved position", e)
      }
    }
    // Default initial position (top right, comfortably below headers)
    const initialX = Math.max(10, window.innerWidth - 145)
    const initialY = 85
    setPosition({ x: initialX, y: initialY })
  }, [])

  // Keep inside viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null
        const safeX = Math.min(Math.max(10, prev.x), window.innerWidth - 130)
        const safeY = Math.min(Math.max(10, prev.y), window.innerHeight - 60)
        return { x: safeX, y: safeY }
      })
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isOpen])

  // Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary mouse button or touch
    if (e.button !== 0 && e.pointerType === "mouse") return
    if (!position) return

    dragInfoRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      hasMoved: false,
    }

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - dragInfoRef.current.startX
      const dy = moveEvent.clientY - dragInfoRef.current.startY
      const dist = Math.hypot(dx, dy)

      if (dist > 6) {
        dragInfoRef.current.hasMoved = true
        setIsDraggingState(true)

        const newX = dragInfoRef.current.startPosX + dx
        const newY = dragInfoRef.current.startPosY + dy

        // Constrain within screen bounds
        const safeX = Math.min(Math.max(8, newX), window.innerWidth - 130)
        const safeY = Math.min(Math.max(8, newY), window.innerHeight - 60)

        setPosition({ x: safeX, y: safeY })
      }
    }

    const onPointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      setIsDraggingState(false)

      if (dragInfoRef.current.hasMoved) {
        // Save new position
        const dx = upEvent.clientX - dragInfoRef.current.startX
        const dy = upEvent.clientY - dragInfoRef.current.startY
        const finalX = Math.min(Math.max(8, dragInfoRef.current.startPosX + dx), window.innerWidth - 130)
        const finalY = Math.min(Math.max(8, dragInfoRef.current.startPosY + dy), window.innerHeight - 60)
        localStorage.setItem("translator_widget_pos", JSON.stringify({ x: finalX, y: finalY }))
      } else {
        // It was a click! Toggle expand
        setIsOpen((prev) => !prev)
      }
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
  }

  // Filtered languages based on search
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return languages
    const q = searchQuery.toLowerCase().trim()
    return languages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.displayCode.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    )
  }, [languages, searchQuery])

  const selectLanguage = (langCode: string) => {
    setLanguage(langCode)
    setIsOpen(false)
    setSearchQuery("")
  }

  if (!isMounted || !position) return null

  // Calculate dropdown positioning so it stays on-screen
  const openUpwards = position.y > window.innerHeight / 2
  const alignRight = position.x > window.innerWidth / 2

  return (
    <aside
      aria-label="Website Language Selector"
      ref={containerRef}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 99999,
        touchAction: "none",
      }}
      className="select-none font-sans"
    >
      {/* Draggable Pill Button */}
      <button
        type="button"
        onPointerDown={handlePointerDown}
        className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-lg border shadow-md bg-white dark:bg-card border-border/80 text-foreground transition-all duration-150 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-primary/50 focus:outline-none ${
          isDraggingState ? "scale-105 opacity-90 shadow-2xl ring-2 ring-primary/40" : ""
        } ${isOpen ? "ring-2 ring-primary border-primary bg-accent/10" : ""}`}
        title="Drag anywhere or click to translate website"
      >
        {/* Country Flag */}
        <div className="w-6 h-4.5 rounded-xs overflow-hidden flex items-center justify-center bg-muted shrink-0 shadow-2xs">
          {!flagImgError[currentLanguage.countryCode] ? (
            <img
              src={getFlagUrl(currentLanguage.countryCode)}
              alt={currentLanguage.name}
              className="w-full h-full object-cover"
              onError={() =>
                setFlagImgError((prev) => ({ ...prev, [currentLanguage.countryCode]: true }))
              }
              loading="lazy"
            />
          ) : (
            <span className="text-sm leading-none">{currentLanguage.flagEmoji}</span>
          )}
        </div>

        {/* Language Code Text (e.g. EN) */}
        <span className="font-bold text-sm tracking-wide text-foreground uppercase">
          {currentLanguage.displayCode}
        </span>

        {/* Up / Down Arrow */}
        <div className="text-muted-foreground group-hover:text-foreground transition-colors">
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* Expanded Modal / Dropdown Box */}
      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            [openUpwards ? "bottom" : "top"]: "calc(100% + 8px)",
            [alignRight ? "right" : "left"]: 0,
          }}
          className="w-72 sm:w-80 bg-white dark:bg-card border border-border rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>Select Language</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Language Options List */}
          <div className="max-h-60 sm:max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredLanguages.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No languages found matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredLanguages.map((item: LanguageItem) => {
                const isSelected =
                  language === item.code ||
                  language.toLowerCase() === item.code.toLowerCase() ||
                  (language === "en" && item.code === "en")

                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => selectLanguage(item.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors group ${
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Country Flag */}
                      <div className="w-5 h-3.5 rounded-2xs overflow-hidden flex items-center justify-center bg-muted shrink-0 shadow-2xs">
                        {!flagImgError[item.countryCode] ? (
                          <img
                            src={getFlagUrl(item.countryCode)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={() =>
                              setFlagImgError((prev) => ({ ...prev, [item.countryCode]: true }))
                            }
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-xs leading-none">{item.flagEmoji}</span>
                        )}
                      </div>

                      {/* Language Names */}
                      <div className="truncate">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {item.nativeName}
                        </span>
                        {item.nativeName !== item.name && (
                          <span className="ml-1.5 text-muted-foreground text-[11px]">
                            ({item.name})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="text-[10px] uppercase tracking-wider px-1 py-0.5 rounded bg-muted/60 text-muted-foreground">
                        {item.displayCode}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Quick English Reset Footer */}
          {language !== "en" && (
            <div className="mt-2 pt-2 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => selectLanguage("en")}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <span>Reset to English (Original)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
