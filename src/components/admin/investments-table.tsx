"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Edit2, Loader2, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

export function InvestmentsTable() {
  const [investments, setInvestments] = useState<any[]>([])
  const [bonusWalletUsers, setBonusWalletUsers] = useState<{ id: string; name: string; email: string; bonusBalance: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editRoi, setEditRoi] = useState<number>(0)
  const [editBonus, setEditBonus] = useState<number>(0)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [stagedReturns, setStagedReturns] = useState<any[]>([])
  const [activeInvestmentAmount, setActiveInvestmentAmount] = useState<number>(0)
  const [returnInput, setReturnInput] = useState({ 
    value: "", 
    day: "", 
    date: new Date().toISOString().split("T")[0], 
    type: "interest" as "interest" | "bonus" 
  })
  const [targetUserId, setTargetUserId] = useState<string | null>(null)
  const [bonusReturn, setBonusReturn] = useState({
    userId: "",
    amount: "",
    day: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [isSavingBonusReturn, setIsSavingBonusReturn] = useState(false)
  const { toast } = useToast()
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const res = await fetch("/api/admin/investments", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          const mapped = data.data.map((inv: any) => ({
            id: inv._id,
            userId: inv.user?._id,
            userName: inv.user?.fullName || "Unknown",
            investmentPlan: inv.plan || "N/A",
            amountInvested: inv.amount || 0,
            startDate: inv.startDate ? new Date(inv.startDate).toLocaleDateString() : "Pending",
            roi: inv.roi || 0,
            bonus: inv.bonus || 0,
            currentValue: inv.currentBalance || inv.amount,
            status: inv.status === "active" ? "Active" : inv.status === "completed" ? "Completed" : "Pending"
          }))
          setInvestments(mapped)
        }
      } catch (err) {
        console.error("Failed to fetch investments", err)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchInvestments()
  }, [token])

  useEffect(() => {
    const fetchBonusWalletUsers = async () => {
      try {
        const response = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load bonus wallet users")
        }
        setBonusWalletUsers(data.data
          .filter((user: any) => Number(user.bonusBalance) > 0)
          .map((user: any) => ({
            id: user._id,
            name: user.fullName || user.email,
            email: user.email,
            bonusBalance: Number(user.bonusBalance),
          })))
      } catch (error) {
        console.error("Failed to fetch bonus wallet users", error)
        toast({
          title: "Could not load bonus wallet users",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        })
      }
    }

    if (token) fetchBonusWalletUsers()
  }, [token, toast])

  const handleBonusReturnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const amount = Number(bonusReturn.amount)
    if (!bonusReturn.userId || !Number.isFinite(amount) || amount <= 0 || !bonusReturn.day.trim()) {
      toast({ title: "Check return details", description: "Choose a user and enter a positive amount and label.", variant: "destructive" })
      return
    }

    setIsSavingBonusReturn(true)
    try {
      const response = await fetch("/api/admin/daily-returns", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: bonusReturn.userId,
          returns: [{
            amount,
            day: bonusReturn.day.trim(),
            date: bonusReturn.date,
            type: "bonus",
            source: "bonus-wallet",
          }],
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not record bonus wallet return")
      }

      toast({ title: "Bonus return recorded", description: "The return was added to the user's earnings and history." })
      setBonusReturn((current) => ({ ...current, amount: "", day: "" }))
    } catch (error) {
      toast({
        title: "Could not record return",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSavingBonusReturn(false)
    }
  }

  const getCalculatedAmount = () => {
    const val = Number(returnInput.value) || 0;
    // Both interest and bonus are now percentage-based
    return (val / 100) * activeInvestmentAmount;
  }

  const handleEdit = (id: string) => {
    const investment = investments.find((inv) => inv.id === id)
    if (investment) {
      setEditingId(id)
      setTargetUserId(investment.userId)
      setActiveInvestmentAmount(investment.amountInvested)
      setEditStatus(investment.status.toLowerCase())
      setEditRoi(investment.roi)
      setEditBonus(investment.bonus || 0)
      setStagedReturns([])
      setReturnInput({ value: "", day: "", date: new Date().toISOString().split("T")[0], type: "interest" })
    }
  }

  const addStagedReturn = () => {
    if (!returnInput.value || !returnInput.day) {
        toast({ title: "Validation", description: "Please enter percentage and label", variant: "destructive" });
        return;
    }
    const finalAmount = getCalculatedAmount();
    setStagedReturns([...stagedReturns, { 
        ...returnInput, 
        amount: finalAmount, 
        investmentId: editingId,
        displayLabel: `${returnInput.value}% of $${activeInvestmentAmount.toLocaleString()}`
    }]);
    setReturnInput({ ...returnInput, value: "", day: "" });
  }

  const handleSaveEdit = async () => {
    if (editingId) {
      setIsSaving(true)
      try {
        const res = await fetch(`/api/admin/deposits/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: editStatus, roi: editRoi, bonus: editBonus })
        })
        
        if (!res.ok) throw new Error("Update failed")

        if (stagedReturns.length > 0 && targetUserId) {
            const drRes = await fetch("/api/admin/daily-returns", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ userId: targetUserId, returns: stagedReturns })
            })
            if (!drRes.ok) throw new Error("History log failed")
        }
          
        setInvestments(investments.map((inv) => (inv.id === editingId ? { ...inv, status: editStatus === "active" ? "Active" : editStatus === "completed" ? "Completed" : "Pending", roi: editRoi, bonus: editBonus } : inv)))
        toast({ title: "Successfully Applied", description: `${stagedReturns.length} earning logs pushed to active ledger.` })
      } catch (err) {
        toast({ title: "Error", description: "Operation failed", variant: "destructive" })
      } finally {
        setIsSaving(false);
        setEditingId(null)
        setEditStatus("")
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this investment? This will also remove all associated performance logs.")) return
    
    setIsDeleting(id)
    try {
      const res = await fetch(`/api/admin/deposits/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setInvestments(investments.filter(inv => inv.id !== id))
        toast({ title: "Deleted", description: "Investment removed successfully." })
      } else {
        throw new Error("Delete failed")
      }
    } catch (err) {
      toast({ title: "Error", description: "Could not delete investment.", variant: "destructive" })
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-success text-success-foreground"
      case "Completed": return "bg-muted text-muted-foreground"
      default: return "bg-warning text-warning-foreground"
    }
  }

  return (
    <>
      <Card className="mb-6 border-border bg-card">
        <CardHeader>
          <CardTitle>Manual Bonus Wallet Returns</CardTitle>
          <p className="text-sm text-muted-foreground">
            Record each user’s bonus-wallet return manually. One return can be recorded per user per date.
          </p>
        </CardHeader>
        <CardContent>
          {bonusWalletUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users currently have a funded bonus wallet.</p>
          ) : (
            <form onSubmit={handleBonusReturnSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="bonus-return-user">User</Label>
                <Select value={bonusReturn.userId} onValueChange={(userId) => setBonusReturn((current) => ({ ...current, userId }))} disabled={isSavingBonusReturn}>
                  <SelectTrigger id="bonus-return-user"><SelectValue placeholder="Select a bonus wallet user" /></SelectTrigger>
                  <SelectContent>
                    {bonusWalletUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} — ${user.bonusBalance.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonus-return-amount">Return amount ($)</Label>
                <Input
                  id="bonus-return-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={bonusReturn.amount}
                  onChange={(event) => setBonusReturn((current) => ({ ...current, amount: event.target.value }))}
                  required
                  disabled={isSavingBonusReturn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonus-return-label">Return label</Label>
                <Input
                  id="bonus-return-label"
                  value={bonusReturn.day}
                  onChange={(event) => setBonusReturn((current) => ({ ...current, day: event.target.value }))}
                  placeholder="e.g. October 4 return"
                  required
                  disabled={isSavingBonusReturn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonus-return-date">Return date</Label>
                <Input
                  id="bonus-return-date"
                  type="date"
                  value={bonusReturn.date}
                  onChange={(event) => setBonusReturn((current) => ({ ...current, date: event.target.value }))}
                  required
                  disabled={isSavingBonusReturn}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-5">
                <Button type="submit" disabled={isSavingBonusReturn}>
                  {isSavingBonusReturn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Record Daily Return
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>User Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">User Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Investment Plan</th>
                  <th className="text-right py-3 px-4 font-semibold">Amount Invested</th>
                  <th className="text-left py-3 px-4 font-semibold">Start Date</th>
                  <th className="text-right py-3 px-4 font-semibold">ROI %</th>
                  <th className="text-right py-3 px-4 font-semibold">Current Value</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                  <th className="text-center py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td colSpan={8} className="py-2 px-4"><Skeleton className="h-10 w-full" /></td>
                    </tr>
                  ))
                ) : investments.length > 0 ? (
                  investments.map((investment) => (
                    <tr key={investment.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{investment.userName}</td>
                      <td className="py-3 px-4">{investment.investmentPlan}</td>
                      <td className="text-right py-3 px-4">${investment.amountInvested.toLocaleString()}</td>
                      <td className="py-3 px-4">{investment.startDate}</td>
                      <td className="text-right py-3 px-4">{investment.roi}%</td>
                      <td className="text-right py-3 px-4">${investment.currentValue.toLocaleString()}</td>
                      <td className="text-center py-3 px-4">
                        <Badge className={getStatusColor(investment.status)}>{investment.status}</Badge>
                      </td>
                      <td className="text-center py-3 px-4 flex justify-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(investment.id)} className="h-8 w-8 p-0" disabled={isDeleting === investment.id}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDelete(investment.id)} 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isDeleting === investment.id}
                        >
                          {isDeleting === investment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">No active user investments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Management & Performance Ledger</DialogTitle>
            <DialogDescription>Stage dynamic earnings for <b>${activeInvestmentAmount.toLocaleString()}</b> capital.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4 border p-4 rounded-xl bg-muted/10">
                <div className="space-y-2">
                    <Label htmlFor="status">Trade Status</Label>
                    <Select value={editStatus} onValueChange={setEditStatus} disabled={isSaving}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="roi">Current Daily ROI (%)</Label>
                    <Input id="roi" type="number" value={editRoi} onChange={(e) => setEditRoi(Number(e.target.value))} disabled={isSaving} />
                </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <Label className="text-secondary font-bold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> 
                Add Earning / Bonus History
              </Label>
              
              <div className="space-y-3 p-4 bg-muted/20 border border-dashed rounded-xl">
                  {stagedReturns.length > 0 && (
                      <div className="space-y-2 mb-4">
                          {stagedReturns.map((r, i) => (
                              <div key={i} className="flex items-center justify-between bg-background p-2 rounded border text-xs">
                                  <span><Badge variant="outline" className={r.type === 'bonus' ? 'text-primary' : ''}>{r.type === 'bonus' ? 'Bonus' : 'ROI'}</Badge> <b>${r.amount.toFixed(2)}</b> ({r.displayLabel})</span>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setStagedReturns(stagedReturns.filter((_, idx) => idx !== i))} disabled={isSaving}>×</Button>
                              </div>
                          ))}
                      </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                          <Label className="text-[10px]">Log Type</Label>
                          <Select value={returnInput.type} onValueChange={(v: any) => setReturnInput({...returnInput, type: v, value: ""})} disabled={isSaving}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="interest">ROI (Percentage %)</SelectItem>
                                  <SelectItem value="bonus">Fixed Bonus ($)</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-1">
                          <Label className="text-[10px]">{returnInput.type === "interest" ? "ROI %" : "Bonus $"}</Label>
                          <Input 
                            type="number" 
                            value={returnInput.value} 
                            onChange={(e) => setReturnInput({...returnInput, value: e.target.value})} 
                            placeholder={returnInput.type === "interest" ? "e.g. 5" : "e.g. 100"}
                            className="h-8 text-xs" 
                            disabled={isSaving}
                          />
                      </div>
                      <div className="space-y-1 col-span-2 bg-background/50 p-2 rounded text-[10px] flex justify-between items-center border">
                          <span className="text-muted-foreground uppercase font-bold text-[9px]">Calculated Credit:</span>
                          <span className="font-bold text-primary">
                            ${getCalculatedAmount().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                      </div>
                      <div className="space-y-1">
                          <Label className="text-[10px]">Label (e.g. Day 1 ROI)</Label>
                          <Input value={returnInput.day} onChange={(e) => setReturnInput({...returnInput, day: e.target.value})} className="h-8 text-xs" disabled={isSaving} />
                      </div>
                      <div className="space-y-1">
                          <Label className="text-[10px]">Wallet Entry Date</Label>
                          <Input type="date" value={returnInput.date} onChange={(e) => setReturnInput({...returnInput, date: e.target.value})} className="h-8 text-xs" disabled={isSaving} />
                      </div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full mt-2 h-8" onClick={addStagedReturn} disabled={isSaving}>+ Stage Earning Log</Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-primary text-primary-foreground font-bold px-8 min-w-[150px]" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Push All To History"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
