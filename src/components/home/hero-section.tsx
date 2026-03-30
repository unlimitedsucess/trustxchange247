"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, TrendingUp } from "lucide-react"
import { useCryptoPrices } from "@/hooks/useCryptoPrices"
import { motion } from "framer-motion"

export function HeroSection() {
  const { prices, loading, error } = useCryptoPrices()

  const cryptoList = prices
    ? [
        { name: "Bitcoin", price: prices.bitcoin.usd, change: prices.bitcoin.usd_24h_change },
        { name: "Ethereum", price: prices.ethereum.usd, change: prices.ethereum.usd_24h_change },
        { name: "Solana", price: prices.solana.usd, change: prices.solana.usd_24h_change },
      ]
    : []

  return (
    <section className="w-full bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 sm:py-28 overflow-hidden relative perspective-1000">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-2 w-fit">
              <div className="h-1 w-8 bg-accent rounded-full"></div>
              <span className="text-sm font-semibold text-accent">Welcome to TrustXchange247</span>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance"
            >
              Invest in Your Future with Confidence
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              Join thousands of investors who are growing their wealth through our secure, transparent, and professional
              investment platform.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button size="lg" className="gap-2 font-semibold transition-transform hover:scale-105 hover:shadow-lg hover:shadow-primary/25" asChild>
                <Link href="/register">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="transition-transform hover:scale-105" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex gap-8 pt-8 border-t border-border/50"
            >
              <div>
                <p className="text-2xl font-bold">$2.5B+</p>
                <p className="text-sm text-muted-foreground">Assets Under Management</p>
              </div>
              <div>
                <p className="text-2xl font-bold">50K+</p>
                <p className="text-sm text-muted-foreground">Active Investors</p>
              </div>
              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-sm text-muted-foreground">Platform Support</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotateY: -30, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5, transition: { duration: 0.4 } }}
            className="relative will-change-transform"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 blur-3xl rounded-full"></div>
            <div className="relative bg-card/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform translate-z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Market Overview</h3>
                <div className="flex items-center gap-1 text-accent animate-pulse">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Live</span>
                </div>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading market data...</p>
                ) : error ? (
                  <p className="text-sm text-red-500">Error: {error}</p>
                ) : (
                  cryptoList.map((crypto, idx) => {
                    const isPositive = crypto.change >= 0
                    return (
                      <motion.div
                        key={crypto.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + idx * 0.2 }}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-primary/20"
                      >
                        <span className="font-medium">{crypto.name}</span>
                        <div className="text-right">
                          <p className="text-sm font-bold notranslate">
                            ${crypto.price?.toLocaleString() ?? "-"}
                          </p>
                          <p className={`text-xs font-semibold ${isPositive ? "text-accent" : "text-red-500"}`}>
                            {isPositive ? "+" : ""}
                            {crypto.change?.toFixed(2) ?? "-"}%
                          </p>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
