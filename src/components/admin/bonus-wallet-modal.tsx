"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface BonusWalletModalProps {
  user: { id: string; name: string; email: string; bonusBalance: number }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BonusWalletModal({ user, open, onOpenChange, onSuccess }: BonusWalletModalProps) {
  const [type, setType] = useState<"credit" | "debit">("credit")
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setType("credit")
      setAmount("")
      setReason("")
    }
  }, [open, user.id])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const token = localStorage.getItem("adminToken")
    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast({ title: "Invalid amount", description: "Enter an amount greater than zero.", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/bonus-wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, amount: numericAmount, reason }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Bonus wallet update failed")
      }

      toast({
        title: "Bonus wallet updated",
        description: data.emailSent === false
          ? `Balance updated to $${data.data.bonusBalance.toFixed(2)}, but the user notification email failed.`
          : `Balance updated to $${data.data.bonusBalance.toFixed(2)} and the user was emailed.`,
        variant: data.emailSent === false ? "destructive" : "default",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Could not update bonus wallet",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Manage Bonus Wallet</DialogTitle>
          <DialogDescription>
            {user.name} ({user.email}) currently has ${user.bonusBalance.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="bonus-wallet-action">Action</Label>
            <Select value={type} onValueChange={(value: "credit" | "debit") => setType(value)} disabled={isSaving}>
              <SelectTrigger id="bonus-wallet-action"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Top up bonus wallet</SelectItem>
                <SelectItem value="debit">Deduct from bonus wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bonus-wallet-amount">Amount ($)</Label>
            <Input
              id="bonus-wallet-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bonus-wallet-reason">Note (optional)</Label>
            <Input
              id="bonus-wallet-reason"
              maxLength={300}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={isSaving}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === "credit" ? "Top Up Wallet" : "Deduct from Wallet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
