"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, DollarSign, Zap, Wallet, AlertTriangle, ShieldX, Clock, ShieldCheck, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"

interface DashboardOverviewProps {
  totalInvested?: number
  totalProfit?: number
  totalBonus?: number
  activeInvestments?: number
  withdrawableBalance?: number
  totalWithdrawn?: number
  totalApprovedDeposits?: number
  totalPendingDeposits?: number
  totalRejectedDeposits?: number
  showOnlyWithdrawal?: boolean
  status?: "active" | "suspended"
  suspensionReason?: string
}

export function DashboardOverview({
  totalInvested = 0,
  totalProfit = 0,
  totalBonus = 0,
  activeInvestments = 0,
  withdrawableBalance = 0,
  totalWithdrawn = 0,
  totalApprovedDeposits = 0,
  totalPendingDeposits = 0,
  totalRejectedDeposits = 0,
  showOnlyWithdrawal = false,
  status = "active",
  suspensionReason = ""
}: DashboardOverviewProps) {
  
  const allCards = [
    {
      label: "Total Invested",
      value: `$${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "Active Portfolio",
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
        change: "Rewards",
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
    {
        label: "Approved Deposit",
        value: `$${totalApprovedDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: "Verified Funds",
        icon: ShieldCheck,
        color: "primary",
        id: "approved_dep"
    },
    {
        label: "Pending Deposit",
        value: `$${totalPendingDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: "Awaiting Confirmation",
        icon: Clock,
        color: "primary",
        id: "pending_dep"
    },
    {
        label: "Rejected Deposit",
        value: `$${totalRejectedDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: "Declined Transactions",
        icon: ShieldAlert,
        color: "destructive",
        id: "rejected_dep"
    }
  ]

  const overviewCards = showOnlyWithdrawal 
    ? allCards.filter(c => c.id === "withdrawn" || c.id === "balance")
    : allCards;

  const isSuspended = status === "suspended";

  return (
    <div className="space-y-8">
      {isSuspended && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-2xl shadow-destructive/10"
        >
          <div className="bg-destructive/20 p-4 rounded-full">
            <ShieldX size={40} className="text-destructive animate-pulse" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-black text-destructive uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
              <AlertTriangle size={20} /> Account Suspended
            </h2>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Your account privileges have been restricted for safety and compliance reasons.
            </p>
            <div className="mt-4 bg-background/50 p-4 rounded-lg border border-destructive/10">
               <span className="text-[10px] uppercase font-bold text-destructive/60 block mb-1">Official Suspension Reason:</span>
               <p className="text-sm font-semibold italic text-foreground">"{suspensionReason || "Violation of platform terms."}"</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-muted-foreground text-center uppercase font-bold">Contact Support</p>
            <a href="mailto:support@trusxchange.com" className="bg-destructive text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-destructive/20 hover:bg-destructive/90 transition-all text-center">
               Open Appeal
            </a>
          </div>
        </motion.div>
      )}

      <motion.div 
        className={showOnlyWithdrawal 
            ? "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6"}
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
              whileHover={{ scale: 1.02, rotateY: 2, z: 20 }}
              style={{ perspective: 1000 }}
            >
              <Card className="p-6 flex flex-col gap-4 h-full shadow-lg border-primary/10 bg-background/50 backdrop-blur-md transition-shadow hover:shadow-primary/20 relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                    <Icon size={120} />
                </div>
                
                <div className="flex items-center justify-between">
                  <h3 className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{card.label}</h3>
                  <div
                    className={`p-2 rounded-lg ${
                      card.color === "primary" ? "bg-primary/10 text-primary" : (card.color === "destructive" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent")
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <p className="text-2xl font-black mb-1">{card.value}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-tight ${card.color === "primary" ? "text-primary" : (card.color === "destructive" ? "text-destructive" : "text-accent")}`}>
                    {card.change}
                  </p>
                </div>
                {isSuspended && (card.id === "balance" || card.id === "invested") && (
                   <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-destructive text-white text-[10px] font-black px-2 py-1 rounded">RESTRICTED</span>
                   </div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
