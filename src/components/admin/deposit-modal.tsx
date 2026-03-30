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
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { useEffect } from "react"

interface DepositModalProps {
  userId: number | null
  userName: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositModal({ userId, userName, open, onOpenChange }: DepositModalProps) {
  const [amount, setAmount] = useState("")
  const [plan, setPlan] = useState("Basic Plan")
  const [date, setDate] = useState("")
  const [status, setStatus] = useState("active")
  const [plansList, setPlansList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const token = useSelector((state: RootState) => state.token.token)

  useEffect(() => {
    if (open) {
      // Fetch dynamic plans for the select block
      fetch("/api/admin/plans")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setPlansList(data.data)
        })
        .catch(console.error)
    }
  }, [open])

  const handleSubmit = async () => {
    const depositAmount = Number.parseFloat(amount)
    if (!amount || depositAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        userId,
        amount: depositAmount,
        plan,
        createdAt: date ? new Date(date).toISOString() : new Date().toISOString(),
        status
      }

      const res = await fetch("/api/admin/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast({ title: "Success", description: "Deposit generated actively." })
        onOpenChange(false)
        window.location.reload()
      } else {
        toast({ title: "Error", description: "Failed to create deposit.", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Server execution failed.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Deposit</DialogTitle>
          <DialogDescription>Add a deposit for {userName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Deposit Amount ($)</Label>
            <Input
              id="deposit-amount"
              type="number"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Investment Plan</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger id="plan">
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent>
                {plansList.length > 0 ? (
                  plansList.map(p => (
                    <SelectItem key={p._id} value={p.name}>{p.name}</SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="Basic Plan">Basic Plan</SelectItem>
                    <SelectItem value="Silver Plan">Silver Plan</SelectItem>
                    <SelectItem value="Gold Plan">Gold Plan</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
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
            <Label htmlFor="deposit-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="deposit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active (Approved)</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Processing..." : "Create Deposit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
