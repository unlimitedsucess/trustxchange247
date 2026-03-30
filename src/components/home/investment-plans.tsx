"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export function InvestmentPlans() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await fetch(`/api/admin/plans?t=${new Date().getTime()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        })
        const data = await res.json()
        if (data.success) {
          setPlans(data.data.filter((p: any) => p.isActive !== false))
          console.log("Fetched plans:", data.data)
        }
      } catch (err) {
        console.error("Landing Page fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadPlans()
  }, [])

  const defaultFeatures = [
    "24/7 Premium Support",
    "Instant Withdrawals",
    "Principal Included"
  ]

  return (
    <section className="w-full py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Choose Your Investment Plan</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the plan that best fits your investment goals and financial strategy
            </p>
          </div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6 perspective-1000"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {loading ? (
              <div className="col-span-1 md:col-span-3 text-center text-muted-foreground py-12">Loading active plans...</div>
            ) : plans.length === 0 ? (
              <div className="col-span-1 md:col-span-3 text-center text-muted-foreground py-12">No plans available at the moment.</div>
            ) : plans.map((plan, index) => (
              <motion.div
                key={plan._id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { opacity: 0, y: 50, rotateX: 15 },
                  visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 80, damping: 15, delay: index * 0.15 } }
                }}
                whileHover={{ scale: 1.03, rotateY: index === 0 ? 5 : index === 2 ? -5 : 0, z: 20 }}
                style={{ transformStyle: "preserve-3d" }}
                className={`relative rounded-xl border transition-shadow duration-300 ${
                  index === 1 || plans.length === 1
                    ? "border-accent bg-gradient-to-br from-accent/5 to-primary/5 shadow-2xl hover:shadow-accent/20"
                    : "border-border bg-card hover:shadow-xl hover:shadow-primary/10"
                }`}
              >
                {(index === 1 || plans.length === 1) && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold transform translate-z-10">
                    Most Popular
                  </div>
                )}

                <div className="p-8 flex flex-col h-full gap-6 transform translate-z-10">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">Premium tailored financial plan.</p>
                  </div>

                  <div className="space-y-3 py-6 border-y border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Minimum Investment</span>
                      <span className="font-semibold">${Number(plan.minInvestment || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Maximum Investment</span>
                      <span className="font-semibold">${Number(plan.maxInvestment || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Daily ROI</span>
                      <span className="font-semibold text-accent">{plan.dailyRoi}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Monthly ROI</span>
                      <span className="font-semibold text-accent">{plan.monthlyRoi}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Duration</span>
                      <span className="font-semibold">{plan.durationDays} Days</span>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    {defaultFeatures.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-accent flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    size="lg"
                    className={index === 1 ? "w-full" : "w-full"}
                    variant={index === 1 ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/register">Invest Now</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
