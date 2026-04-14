"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Trash2, Loader2, Info, PauseCircle, PlayCircle } from "lucide-react"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export function DepositsTable() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmingAction, setConfirmingAction] = useState<"approve" | "reject" | "delete" | "pause" | "play" | null>(null)
  const [loading, setLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const { toast } = useToast()
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const res = await fetch("/api/admin/deposits", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          const mapped = data.data.map((d: any) => ({
            id: d._id,
            userName: d.user?.fullName || "Unknown",
            amount: d.amount,
            plan: d.plan || "N/A",
            paymentMethod: d.paymentMethod || "Crypto",
            date: new Date(d.createdAt).toLocaleDateString(),
            status: d.status === "active" ? "Approved" : d.status === "rejected" ? "Rejected" : d.status === "completed" ? "Completed" : d.status === "paused" ? "Paused" : "Pending"
          }))
          setDeposits(mapped)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchDeposits()
  }, [token])

  const handleApprove = async (id: string) => {
    setIsActionLoading(true)
    try {
      const res = await fetch(`/api/admin/deposits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "active" })
      })
      if (res.ok) {
        setDeposits(deposits.map((d) => (d.id === id ? { ...d, status: "Approved" } : d)))
        toast({ title: "Success", description: "Deposit approved. Plan ROI has been activated." })
        setEditingId(null)
        setConfirmingAction(null)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to approve deposit", variant: "destructive" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleReject = async (id: string) => {
    setIsActionLoading(true)
    try {
      const res = await fetch(`/api/admin/deposits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "rejected" })
      })
      if (res.ok) {
        setDeposits(deposits.map((d) => (d.id === id ? { ...d, status: "Rejected" } : d)))
        toast({ title: "Success", description: "Deposit rejected successfully", variant: "destructive" })
        setEditingId(null)
        setConfirmingAction(null)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to reject deposit", variant: "destructive" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleTogglePause = async (id: string, action: "pause" | "play") => {
    setIsActionLoading(true)
    const newStatus = action === "pause" ? "paused" : "active";
    try {
      const res = await fetch(`/api/admin/deposits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setDeposits(deposits.map((d) => (d.id === id ? { ...d, status: newStatus === "paused" ? "Paused" : "Approved" } : d)))
        toast({ title: "Success", description: `Deposit ${newStatus === "paused" ? "paused" : "resumed"} successfully.` })
        setEditingId(null)
        setConfirmingAction(null)
      }
    } catch (err) {
      toast({ title: "Error", description: `Failed to ${action} deposit`, variant: "destructive" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsActionLoading(true)
    try {
      const res = await fetch(`/api/admin/deposits/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setDeposits(deposits.filter((d) => d.id !== id))
        toast({ title: "Success", description: "Deposit deleted permanently" })
        setEditingId(null)
        setConfirmingAction(null)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete deposit", variant: "destructive" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-success text-success-foreground"
      case "Rejected": return "bg-destructive text-destructive-foreground"
      case "Paused": return "bg-secondary text-secondary-foreground"
      default: return "bg-warning text-warning-foreground"
    }
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Deposit Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">User Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Plan</th>
                  <th className="text-right py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Method</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                  <th className="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-border">
                      <td colSpan={7} className="py-4 px-4"><Skeleton className="h-10 w-full" /></td>
                    </tr>
                  ))
                ) : deposits.length > 0 ? (
                  deposits.map((deposit) => (
                    <tr key={deposit.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{deposit.userName}</td>
                      <td className="py-3 px-4 italic">{deposit.plan}</td>
                      <td className="text-right py-3 px-4 font-bold text-primary">${deposit.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">{deposit.paymentMethod}</td>
                      <td className="py-3 px-4">{deposit.date}</td>
                      <td className="text-center py-3 px-4">
                        <Badge className={getStatusColor(deposit.status)}>{deposit.status}</Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {deposit.status === "Pending" ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingId(deposit.id)
                                  setConfirmingAction("approve")
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <CheckCircle className="h-4 w-4 text-success" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingId(deposit.id)
                                  setConfirmingAction("reject")
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          ) : deposit.status === "Approved" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(deposit.id)
                                setConfirmingAction("pause")
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <PauseCircle className="h-4 w-4 text-warning" />
                            </Button>
                          ) : deposit.status === "Paused" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(deposit.id)
                                setConfirmingAction("play")
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <PlayCircle className="h-4 w-4 text-success" />
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-tighter opacity-50">Locked</span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(deposit.id)
                              setConfirmingAction("delete")
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">No deposits found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Approve Modal */}
      <Dialog open={editingId !== null && confirmingAction === "approve"} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Approve Investment?</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
               <span>Are you sure you want to approve this deposit?</span>
               <div className="bg-primary/5 p-3 rounded border border-primary/20 flex gap-3 items-start">
                  <Info className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-xs text-primary leading-tight font-medium">
                     The system will automatically apply the Daily ROI associated with the user's selected investment plan. 
                     The capital will be moved to the active trading ledger.
                  </span>
               </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)} disabled={isActionLoading}>Cancel</Button>
            <Button onClick={() => handleApprove(editingId!)} disabled={isActionLoading} className="min-w-[150px] font-bold">
                {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject/Delete/Pause/Play Confirmation */}
      <AlertDialog open={editingId !== null && (confirmingAction === "reject" || confirmingAction === "delete" || confirmingAction === "pause" || confirmingAction === "play")} onOpenChange={(open) => !open && setEditingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmingAction === "reject" ? "Reject Deposit?" : confirmingAction === "delete" ? "Delete Deposit?" : confirmingAction === "pause" ? "Pause Deposit ROI?" : "Resume Deposit ROI?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmingAction === "reject"
                ? "This deposit request will be rejected and the user will no longer see it as pending."
                : confirmingAction === "delete"
                ? "This deposit will be permanently deleted from the database. This action cannot be undone."
                : confirmingAction === "pause"
                ? "This investment will be paused and the user will no longer receive daily ROI until resumed."
                : "This investment will be resumed and the user will start receiving daily ROI again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel asChild>
                <Button variant="outline" disabled={isActionLoading}>Cancel</Button>
            </AlertDialogCancel>
            <Button 
                variant={confirmingAction === "delete" || confirmingAction === "reject" ? "destructive" : "default"}
                disabled={isActionLoading}
                className="min-w-[100px] font-bold"
                onClick={() => {
                    if (editingId && confirmingAction === "reject") handleReject(editingId)
                    if (editingId && confirmingAction === "delete") handleDelete(editingId)
                    if (editingId && confirmingAction === "pause") handleTogglePause(editingId, "pause")
                    if (editingId && confirmingAction === "play") handleTogglePause(editingId, "play")
                }}
            >
                {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmingAction === "reject" ? "Reject" : confirmingAction === "delete" ? "Delete" : confirmingAction === "pause" ? "Pause" : "Resume"}
            </Button>
          </DialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
