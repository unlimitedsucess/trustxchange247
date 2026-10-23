"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Mail, 
  Copy, 
  Check, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  MapPin, 
  Send, 
  Sparkles,
  ExternalLink,
  Trophy,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import Link from "next/link"

export interface Investor {
  id: string
  rank: number
  name: string
  role: string
  location: string
  email: string
  portfolio: string
  portfolioRaw?: number
  roi: string
  specialty: string
  bio: string
  status: string
  initials: string
  avatarGradient: string
}

export function TopInvestors() {
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchTopInvestors = async () => {
      try {
        const res = await fetch(`/api/top-investors?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        })
        const result = await res.json()

        
        if (isMounted && result.success && Array.isArray(result.data)) {
          console.log("Fetched top investors:", result.data)
          setInvestors(result.data)
        }
      } catch (err) {
        console.error("Failed to fetch top investors:", err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTopInvestors()

    return () => {
      isMounted = false
    }
  }, [])

  const handleCopyEmail = (email: string, name: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    toast.success(`Copied ${name}'s email (${email}) to clipboard!`)
    setTimeout(() => {
      setCopiedEmail(null)
    }, 2500)
  }

  return (
    <section 
      id="top-investors" 
      aria-labelledby="top-investors-heading" 
      className="w-full py-16 sm:py-24 bg-gradient-to-b from-muted/30 via-background to-muted/20 relative overflow-hidden"
    >
      {/* Background ambient decorative glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Platform Elite Network
          </div>
          <h2 id="top-investors-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-balance">
            Meet Our Top Investors
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Real-time leaderboard of registered investors with the highest capital allocations on TrustXchange247. 
            Connect with top performers or climb the ranks with your own portfolio.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="rounded-2xl border border-border/70 bg-card p-6 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-28 rounded-full mb-4" />
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 mb-5">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-12 w-full mb-5" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
                <Skeleton className="h-9 w-full rounded-lg mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Investors Grid (when real registered investors exist) */}
        {!loading && investors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {investors.map((investor, index) => {
              const isTopRanked = investor.rank === 1
              const isCopied = copiedEmail === investor.email

              return (
                <motion.div
                  key={investor.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative group rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                    isTopRanked
                      ? "border-amber-500/40 bg-gradient-to-b from-card via-card to-amber-500/5 shadow-xl hover:shadow-2xl hover:shadow-amber-500/15 md:col-span-2 lg:col-span-1"
                      : "border-border/80 bg-card hover:border-primary/40 shadow-sm hover:shadow-xl hover:shadow-primary/10"
                  }`}
                >
                  {/* Top Rank Highlight Ribbon */}
                  {isTopRanked && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1.5 z-10">
                      <Award className="w-3.5 h-3.5" />
                      #1 Top Performer
                    </div>
                  )}

                  <div className="p-6 sm:p-7 flex-1">
                    {/* Header: Avatar, Name, Rank */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14 ring-2 ring-border shadow-md">
                          <AvatarFallback className={`bg-gradient-to-br ${investor.avatarGradient} text-white font-bold text-lg`}>
                            {investor.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white ring-2 ring-card" title="Verified Investor">
                          ✓
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                            {investor.name}
                          </h3>
                          <Badge variant="secondary" className="text-[10px] py-0 px-2 font-semibold">
                            #{investor.rank}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {investor.role}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate">{investor.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                        <ShieldCheck className="w-3 h-3" />
                        {investor.status}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        • {investor.specialty}
                      </span>
                    </div>

                    {/* Stats Box */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60 mb-5">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
                          Total Portfolio
                        </span>
                        <span className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                          {investor.portfolio}
                        </span>
                      </div>
                      {/* <div>
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
                          Lifetime ROI
                        </span>
                        <span className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {investor.roi}
                        </span>
                      </div> */}
                    </div>

                    {/* Investor Bio */}
                    <blockquote className="text-xs text-muted-foreground italic leading-relaxed mb-5 border-l-2 border-primary/30 pl-3">
                      &ldquo;{investor.bio}&rdquo;
                    </blockquote>

                    {/* Email Section */}
                    <div className="p-3 rounded-xl bg-card border border-border/80 flex flex-col gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        Direct Email Link:
                      </span>
                      <div className="flex items-center justify-between gap-2 bg-muted/50 rounded-lg px-2.5 py-1.5 border border-border/40">
                        <a
                          href={`mailto:${investor.email}?subject=Inquiry via TrustXchange247&body=Hi ${investor.name},%0D%0A%0D%0AI discovered your profile on TrustXchange247 and would love to link up with you regarding your investment strategies.`}
                          className="text-xs font-mono text-primary hover:underline truncate"
                          title={`Send email to ${investor.email}`}
                        >
                          {investor.email}
                        </a>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopyEmail(investor.email, investor.name)}
                          title="Copy email address"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="sr-only">Copy Email</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-6 py-4 bg-muted/20 border-t border-border/60 flex items-center gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="w-full gap-2 font-semibold shadow-sm hover:shadow transition-all"
                    >
                      <a
                        href={`mailto:${investor.email}?subject=Inquiry via TrustXchange247&body=Hi ${investor.name},%0D%0A%0D%0AI discovered your profile on TrustXchange247 and would love to link up with you regarding your investment strategies.`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Link Up via Email
                      </a>
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Empty State (when 0 registered users have active investments yet) */}
        {!loading && investors.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-xl"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 shadow-inner">
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
            
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10">
              Live Ranking Active
            </Badge>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">
              The #1 Top Investor Spot Is Open!
            </h3>
            
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Our leaderboard is dynamically linked to registered platform accounts. 
              The moment you deposit and invest in any plan, your profile will immediately climb the ranks 
              and be featured right here for thousands of daily visitors.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto font-semibold gap-2 shadow-md">
                <Link href="/register">
                  Register & Claim #1 Rank
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-medium">
                <a href="#investment-plans">
                  View Investment Plans
                </a>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Bottom Callout / Assurance banner */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-card border border-border/80 shadow-sm max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-sm text-foreground">Want your portfolio featured among top investors?</h4>
            <p className="text-xs text-muted-foreground">Start investing with any active plan and grow your rank on the platform.</p>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0 gap-1.5 font-semibold">
            <Link href="/register">
              Join Our Community
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
