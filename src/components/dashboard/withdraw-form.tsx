"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function WithdrawForm() {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const withdrawAmount = Number.parseFloat(amount)
    if (!amount || withdrawAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      })
      return
    }

    if (withdrawAmount > 5225.5) {
      toast({
        title: "Insufficient balance",
        description: "Withdrawal amount exceeds your available balance",
        variant: "destructive",
      })
      return
    }

    // Simulate submission
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setAmount("")
      toast({
        title: "Success",
        description: `Withdrawal request of $${withdrawAmount.toFixed(2)} submitted successfully`,
      })
    }, 1000)
  }

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-bold mb-6">Request Withdrawal</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="amount">Withdrawal Amount</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground">Available balance: $5,225.50</p>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : "Submit Withdrawal Request"}
        </Button>
      </form>
    </Card>
  )
}
