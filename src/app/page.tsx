"use client"

import { HeroSection } from "@/components/home/hero-section"
import { TradingChart } from "@/components/home/trading-chart"
import { CryptoMarketTable } from "@/components/home/crypto-market-table"
import { InvestmentPlans } from "@/components/home/investment-plans"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full">
        <HeroSection />
        <TradingChart />
        <CryptoMarketTable />
        <InvestmentPlans />
      </main>
    </div>
  )
}
