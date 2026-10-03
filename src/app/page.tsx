"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import anniversaryImage from "@/assets/annivasery.jpeg"
import { HeroSection } from "@/components/home/hero-section"
import { TradingChart } from "@/components/home/trading-chart"
import { CryptoMarketTable } from "@/components/home/crypto-market-table"
import { InvestmentPlans } from "@/components/home/investment-plans"

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full">
        
        <HeroSection />
        <TradingChart />
        <CryptoMarketTable />
        <section aria-labelledby="anniversary-heading" className="px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex max-w-7xl flex-col items-center gap-8 overflow-hidden    p-6 shadow-xl  sm:p-8 md:flex-row md:gap-12 md:p-10  "
          >
            <motion.div
              className="shrink-0  shadow-lg shadow-amber-950/15 ring-4 ring-amber-500/10 dark:border-amber-500/30 "
              animate={shouldReduceMotion ? undefined : { y: [0, -7, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src={anniversaryImage}
                alt="15 Years Anniversary Celebration"
                className="h-[22rem] w-[14.67rem]  object-contain sm:h-[27rem] sm:w-[18rem] md:h-[30rem] md:w-[20rem]"
                priority
              />
            </motion.div>
            <motion.div
              className="max-w-2xl text-center md:text-left"
              initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: shouldReduceMotion ? 0 : 0.25, ease: "easeOut" }}
            >
              <p className="mb-4 inline-flex items-center gap-2   px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                A milestone worth celebrating
              </p>
              <h2 id="anniversary-heading" className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                Celebrating 15 years with you
              </h2>
              <div aria-hidden="true" className="mx-auto my-5 h-1 w-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 md:mx-0" />
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                Every milestone tells a story. Thank you for being part of ours.
              </p>
            </motion.div>
          </motion.div>
        </section>
        <InvestmentPlans />
      </main>
    </div>
  )
}
