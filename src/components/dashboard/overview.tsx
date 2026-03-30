"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, DollarSign, Zap, Wallet } from "lucide-react"
import { motion } from "framer-motion"

interface DashboardOverviewProps {
  totalInvested: number
  totalProfit: number
  activeInvestments: number
  withdrawableBalance: number
}

export function DashboardOverview({
  totalInvested = 0,
  totalProfit = 0,
  activeInvestments = 0,
  withdrawableBalance = 0,
}: DashboardOverviewProps) {
  const overviewCards = [
    {
      label: "Total Invested",
      value: `$${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "Active & Pending",
      icon: DollarSign,
      color: "primary",
    },
    {
      label: "Total Profit",
      value: `$${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "Earned ROI",
      icon: TrendingUp,
      color: "accent",
    },
    {
      label: "Active Investments",
      value: activeInvestments.toString(),
      change: "Current plans",
      icon: Zap,
      color: "primary",
    },
    {
      label: "Withdrawable Balance",
      value: `$${withdrawableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "Available now",
      icon: Wallet,
      color: "accent",
    },
  ]

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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
