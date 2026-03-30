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

export function InvestmentsTable() {
  const [investments, setInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState("")
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
            userName: inv.user?.fullName || "Unknown",
            investmentPlan: inv.plan || "N/A",
            amountInvested: inv.amount || 0,
            startDate: inv.startDate ? new Date(inv.startDate).toLocaleDateString() : "Pending",
            endDate: inv.endDate ? new Date(inv.endDate).toLocaleDateString() : "Pending",
            roi: inv.roi || 0,
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

  const handleEdit = (id: string) => {
    const investment = investments.find((inv) => inv.id === id)
    if (investment) {
      setEditingId(id)
      setEditStatus(investment.status.toLowerCase())
    }
  }

  const handleSaveEdit = async () => {
    if (editingId) {
      try {
        const res = await fetch(`/api/admin/deposits/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: editStatus })
        })
        if (res.ok) {
          
          setInvestments(investments.map((inv) => (inv.id === editingId ? { ...inv, status: editStatus === "active" ? "Active" : "Completed" } : inv)))
          
          toast({
            title: "Success",
            description: "Investment strictly updated successfully",
          })
        }
      } catch (err) {
        toast({ title: "Error", description: "Operation failed", variant: "destructive" })
      }
      setEditingId(null)
      setEditStatus("")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success text-success-foreground"
      case "Completed":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-warning text-warning-foreground"
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
                  <th className="text-left py-3 px-4 font-semibold">End Date</th>
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
                      <td className="py-4 px-4"><Skeleton className="h-5 w-32" /></td>
                      <td className="py-4 px-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-20 ml-auto" /></td>
                      <td className="py-4 px-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-4 px-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-12 ml-auto" /></td>
                      <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-24 ml-auto" /></td>
                      <td className="py-4 px-4 text-center"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></td>
                      <td className="py-4 px-4 text-center"><Skeleton className="h-8 w-8 rounded-md mx-auto" /></td>
                    </tr>
                  ))
                ) : investments.length > 0 ? (
                  investments.map((investment) => (
                    <tr key={investment.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{investment.userName}</td>
                      <td className="py-3 px-4">{investment.investmentPlan}</td>
                      <td className="text-right py-3 px-4">${investment.amountInvested.toLocaleString()}</td>
                      <td className="py-3 px-4">{investment.startDate}</td>
                      <td className="py-3 px-4">{investment.endDate}</td>
                      <td className="text-right py-3 px-4">{investment.roi}%</td>
                      <td className="text-right py-3 px-4">${investment.currentValue.toLocaleString()}</td>
                      <td className="text-center py-3 px-4">
                        <Badge className={getStatusColor(investment.status)}>{investment.status}</Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(investment.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      No active user investments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Investment</DialogTitle>
            <DialogDescription>Update investment status</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
