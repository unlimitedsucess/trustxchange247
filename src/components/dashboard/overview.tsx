"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, DollarSign, Zap, Wallet } from "lucide-react"
import { motion } from "framer-motion"

interface DashboardOverviewProps {
  totalInvested?: number
  totalProfit?: number
  totalBonus?: number
  activeInvestments?: number
  withdrawableBalance?: number
  totalWithdrawn?: number
  showOnlyWithdrawal?: boolean
}

export function DashboardOverview({
  totalInvested = 0,
  totalProfit = 0,
  totalBonus = 0,
  activeInvestments = 0,
  withdrawableBalance = 0,
  totalWithdrawn = 0,
  showOnlyWithdrawal = false
}: DashboardOverviewProps) {
  
  const allCards = [
    {
      label: "Total Invested",
      value: `$${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "Active & Pending",
      icon: DollarSign,
      color: "primary",
      id: "invested"
    },
    {
      label: "Total Profit",
      value: `$${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "Earned ROI",
      icon: TrendingUp,
      color: "accent",
      id: "profit"
    },
    {
        label: "Total Bonus",
        value: `$${totalBonus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: "Admin Rewards",
        icon: Zap,
        color: "primary",
        id: "bonus"
      },
    {
      label: "Active Investments",
      value: activeInvestments.toString(),
      change: "Current plans",
      icon: Zap,
      color: "primary",
      id: "active"
    },
    {
      label: "Total Withdrawn",
      value: `$${totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "Processed",
      icon: DollarSign,
      color: "primary",
      id: "withdrawn"
    },
    {
      label: "Withdrawable Balance",
      value: `$${withdrawableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "Available now",
      icon: Wallet,
      color: "accent",
      id: "balance"
    },
  ]

  const overviewCards = showOnlyWithdrawal 
    ? allCards.filter(c => c.id === "withdrawn" || c.id === "balance")
    : allCards;

  const gridClass = showOnlyWithdrawal 
    ? "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl"
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-6 mb-8";

  return (
    <motion.div 
      className={gridClass}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
    >
      {overviewCards.map((card, index) => {
        const Icon = card.icon

        return (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 50, rotateX: -15 },
              visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 100, damping: 12 } }
            }}
            whileHover={{ scale: 1.05, rotateY: 5, z: 20 }}
            style={{ perspective: 1000 }}
          >
            <Card className="p-6 flex flex-col gap-4 h-full shadow-lg border-primary/20 bg-background/50 backdrop-blur-md transition-shadow hover:shadow-primary/20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm text-muted-foreground font-medium">{card.label}</h3>
                <div
                  className={`p-2 rounded-lg ${
                    card.color === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div>
                <p className="text-2xl font-bold mb-1">{card.value}</p>
                <p className={`text-xs font-medium ${card.color === "primary" ? "text-primary" : "text-accent"}`}>
                  {card.change}
                </p>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
