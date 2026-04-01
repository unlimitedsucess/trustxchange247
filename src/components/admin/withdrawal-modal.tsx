"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

interface WithdrawalModalProps {
  userId: string | null
  userName: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WithdrawalModal({ userId, userName, open, onOpenChange }: WithdrawalModalProps) {
  const [amount, setAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [date, setDate] = useState("")
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("approved")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const token = useSelector((state: RootState) => state.token.token)

  const handleSubmit = async () => {
    const withdrawAmount = Number.parseFloat(amount)
    if (!amount || withdrawAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        userId,
        amount: withdrawAmount,
        walletAddress,
        createdAt: date ? new Date(date).toISOString() : new Date().toISOString(),
        status
      }

      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast({ title: "Success", description: "Withdrawal generated accurately." })
        onOpenChange(false)
        window.location.reload()
      } else {
        toast({ title: "Error", description: "Failed to execute withdrawal insertion.", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Server error occurred.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Withdrawal</DialogTitle>
          <DialogDescription>Add a withdrawal for {userName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="withdrawal-amount">Withdrawal Amount ($)</Label>
            <Input
              id="withdrawal-amount"
              type="number"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-address">Wallet Address (Optional)</Label>
            <Input
              id="wallet-address"
              type="text"
              placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Transaction Date</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawal-status">Status</Label>
            <Select
              value={status}
              onValueChange={(value: any) => setStatus(value)}
            >
              <SelectTrigger id="withdrawal-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Processing..." : "Create Withdrawal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
