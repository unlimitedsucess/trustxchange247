"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { useHttp } from "@/hooks/use-http"

export function WithdrawForm() {
  const [amount, setAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [transactionPin, setTransactionPin] = useState("")
  const [hasPin, setHasPin] = useState<boolean | null>(null)
  
  const token = useSelector((state: RootState) => state.token.token)
  const { sendHttpRequest, loading } = useHttp()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPinStatus = async () => {
      try {
        const res = await fetch("/api/user/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success && data.data?.user) {
          setHasPin(data.data.user.hasTransactionPin)
        }
      } catch (err) {
        console.error("Failed to check PIN status", err)
      }
    }
    if (token) {
      fetchPinStatus()
    }
  }, [token])

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

    // Hook request execution array
    sendHttpRequest({
      requestConfig: {
        url: "/api/user/withdrawal",
        method: "POST",
        isAuth: true,
        token: token || undefined,
        body: {
          amount: withdrawAmount,
          walletAddress,
          transactionPin
        },
        successMessage: `Withdrawal request of $${withdrawAmount.toFixed(2)} submitted successfully`,
      },
      successRes: () => {
        setAmount("")
        setWalletAddress("")
        setTransactionPin("")
      }
    });
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
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="walletAddress">Destination Wallet Address</Label>
          <Input
            id="walletAddress"
            placeholder="Enter USDT (TRC20) address..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionPin">
            {hasPin ? "Enter Transaction PIN" : "Create Transaction PIN (4-6 digits)"}
          </Label>
          <Input
            id="transactionPin"
            type="password"
            maxLength={6}
            placeholder={hasPin ? "Enter your secure PIN" : "Create a new secure PIN"}
            value={transactionPin}
            onChange={(e) => setTransactionPin(e.target.value)}
            disabled={loading}
            required
          />
          {!hasPin && (
            <p className="text-xs text-muted-foreground group">
              <span className="font-semibold text-primary">Note:</span> This is your first withdrawal. The PIN you enter here will be permanently saved as your master Transaction PIN.
            </p>
          )}
        </div>

        <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
          {loading ? "Processing Transaction..." : "Submit Withdrawal Request"}
        </Button>
      </form>
    </Card>
  )
}
