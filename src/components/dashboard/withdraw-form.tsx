"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { useHttp } from "@/hooks/use-http"
import { Loader2, ShieldCheck } from "lucide-react"

interface WithdrawFormProps {
  onSuccess?: () => void;
  availableBalance?: number;
}

export function WithdrawForm({ onSuccess, availableBalance = 0 }: WithdrawFormProps) {
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

    const withdrawAmount = Number.parseFloat(amount)
    if (!amount || withdrawAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      })
      return
    }

    if (availableBalance > 0 && withdrawAmount > availableBalance) {
      toast({
        title: "Insufficient balance",
        description: `Max available for withdrawal: $${availableBalance.toLocaleString()}`,
        variant: "destructive",
      })
      return
    }

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
        if (onSuccess) onSuccess();
      }
    });
  }

  return (
    <Card className="p-6 border-border bg-card shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <ShieldCheck size={100} className="text-primary" />
      </div>

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Request Withdrawal
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-medium">
             <Label htmlFor="amount">Withdrawal Amount</Label>
             <span className="text-muted-foreground">Available: <b className="text-primary">${availableBalance.toLocaleString()}</b></span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 h-11 text-lg font-bold"
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
            className="h-10"
            required
          />
          <p className="text-[10px] text-muted-foreground italic">Funds will be sent to this address upon approval.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionPin">
            {hasPin ? "Authentication PIN" : "Create Transaction PIN"}
          </Label>
          <Input
            id="transactionPin"
            type="password"
            maxLength={6}
            placeholder={hasPin ? "Enter your 4-6 digit PIN" : "Create a new 4-6 digit PIN"}
            value={transactionPin}
            onChange={(e) => setTransactionPin(e.target.value)}
            disabled={loading}
            className="h-10 tracking-[1em] text-center"
            required
          />
          {!hasPin && (
            <p className="text-[10px] bg-primary/5 p-2 rounded border border-primary/20 text-primary">
              <b>Important:</b> This is your first withdrawal. The PIN you set now will be required for all future payouts.
            </p>
          )}
        </div>

        <Button type="submit" className="w-full h-12 font-bold text-base shadow-lg shadow-primary/20" disabled={loading}>
          {loading ? (
             <>
               <Loader2 className="mr-2 h-5 w-5 animate-spin" />
               Processing Securely...
             </>
          ) : (
            "Authorize Withdrawal"
          )}
        </Button>
      </form>
    </Card>
  )
}
