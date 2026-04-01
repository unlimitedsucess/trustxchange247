"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Edit2 } from "lucide-react"
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
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editRoi, setEditRoi] = useState<number>(0)
  const [editBonus, setEditBonus] = useState<number>(0)
  const [stagedReturns, setStagedReturns] = useState<any[]>([])
  const [activeInvestmentAmount, setActiveInvestmentAmount] = useState<number>(0)
  const [returnInput, setReturnInput] = useState({ 
    value: "", 
    day: "", 
    date: new Date().toISOString().split("T")[0], 
    type: "interest" as "interest" | "bonus" 
  })
  const [targetUserId, setTargetUserId] = useState<string | null>(null)
  const { toast } = useToast()
  
  const token = useSelector((state: RootState) => state.token.token)

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

  const getCalculatedAmount = () => {
    const val = Number(returnInput.value) || 0;
    if (returnInput.type === "interest") {
        return (val / 100) * activeInvestmentAmount;
    }
    return val;
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
        toast({ title: "Validation", description: "Please enter percentage/amount and label", variant: "destructive" });
        return;
    }
    const finalAmount = getCalculatedAmount();
    setStagedReturns([...stagedReturns, { 
        ...returnInput, 
        amount: finalAmount, 
        investmentId: editingId,
        displayLabel: returnInput.type === "interest" ? `${returnInput.value}% of $${activeInvestmentAmount}` : `$${returnInput.value}`
    }]);
    setReturnInput({ ...returnInput, value: "", day: "" });
  }

  const handleSaveEdit = async () => {
    if (editingId) {
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
      }
      setEditingId(null)
      setEditStatus("")
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
                      <td className="text-center py-3 px-4">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(investment.id)} className="h-8 w-8 p-0">
                          <Edit2 className="h-4 w-4" />
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
                    <Select value={editStatus} onValueChange={setEditStatus}>
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
                    <Input id="roi" type="number" value={editRoi} onChange={(e) => setEditRoi(Number(e.target.value))} />
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
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setStagedReturns(stagedReturns.filter((_, idx) => idx !== i))}>×</Button>
                              </div>
                          ))}
                      </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                          <Label className="text-[10px]">Log Type</Label>
                          <Select value={returnInput.type} onValueChange={(v: any) => setReturnInput({...returnInput, type: v, value: ""})}>
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
                          <Input value={returnInput.day} onChange={(e) => setReturnInput({...returnInput, day: e.target.value})} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                          <Label className="text-[10px]">Wallet Entry Date</Label>
                          <Input type="date" value={returnInput.date} onChange={(e) => setReturnInput({...returnInput, date: e.target.value})} className="h-8 text-xs" />
                      </div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full mt-2 h-8" onClick={addStagedReturn}>+ Stage Earning Log</Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-primary text-primary-foreground font-bold px-8">Push All To History</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
