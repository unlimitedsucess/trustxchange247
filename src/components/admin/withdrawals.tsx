"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { CheckCircle, XCircle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function WithdrawalsPanel() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [confirmingAction, setConfirmingAction] = useState<"approve" | "reject" | "delete" | null>(null)
  const { toast } = useToast()

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const res = await fetch("/api/admin/withdrawals", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          const mapped = data.data.map((w: any) => ({
            id: w._id,
            userName: w.user?.fullName || "Unknown",
            amount: w.amount,
            walletAddress: w.walletAddress || "---",
            date: new Date(w.createdAt).toLocaleDateString(),
            status: w.status === "approved" ? "Approved" : w.status === "rejected" ? "Rejected" : "Pending"
          }))
          setWithdrawals(mapped)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchWithdrawals()
  }, [token])

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "approved" })
      })
      if (res.ok) {
        setWithdrawals(withdrawals.map((w) => (w.id === id ? { ...w, status: "Approved" } : w)))
        toast({ title: "Success", description: "Withdrawal approved successfully" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to approve withdrawal", variant: "destructive" })
    }
    setConfirmingId(null)
    setConfirmingAction(null)
  }

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "rejected" })
      })
      if (res.ok) {
        setWithdrawals(withdrawals.map((w) => (w.id === id ? { ...w, status: "Rejected" } : w)))
        toast({ title: "Success", description: "Withdrawal rejected successfully", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to reject withdrawal", variant: "destructive" })
    }
    setConfirmingId(null)
    setConfirmingAction(null)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setWithdrawals(withdrawals.filter((w) => w.id !== id))
        toast({ title: "Success", description: "Withdrawal deleted permanently" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete withdrawal", variant: "destructive" })
    }
    setConfirmingId(null)
    setConfirmingAction(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-success text-success-foreground"
      case "Rejected":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-warning text-warning-foreground"
    }
  }

  return (
    <>
      <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Withdrawal Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">User Name</th>
                <th className="text-right py-3 px-4 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 font-semibold">Wallet Address</th>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
                <th className="text-center py-3 px-4 font-semibold">Status</th>
                <th className="text-center py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">Loading withdrawals...</td>
                </tr>
              ) : withdrawals.length > 0 ? (
                withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{withdrawal.userName}</td>
                    <td className="text-right py-3 px-4">${withdrawal.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs font-mono break-all">{withdrawal.walletAddress}</td>
                    <td className="py-3 px-4">{withdrawal.date}</td>
                    <td className="text-center py-3 px-4">
                      <Badge className={getStatusColor(withdrawal.status)}>{withdrawal.status}</Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {withdrawal.status === "Pending" ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setConfirmingId(withdrawal.id)
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
                                setConfirmingId(withdrawal.id)
                                setConfirmingAction("reject")
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-xs">No action</span>
                        )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setConfirmingId(withdrawal.id)
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
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">No withdrawals found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmingId !== null} onOpenChange={(open) => !open && setConfirmingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmingAction === "approve"
                ? "Approve Withdrawal?"
                : confirmingAction === "reject"
                ? "Reject Withdrawal?"
                : "Delete Withdrawal?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmingAction === "approve"
                ? "This withdrawal request will be approved, notifying the user that funds have been sent to their wallet."
                : confirmingAction === "reject"
                ? "This withdrawal request will be rejected and the user will be notified."
                : "This withdrawal will be permanently deleted from the database. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (confirmingId && confirmingAction === "approve") {
                handleApprove(confirmingId)
              } else if (confirmingId && confirmingAction === "reject") {
                handleReject(confirmingId)
              } else if (confirmingId && confirmingAction === "delete") {
                handleDelete(confirmingId)
              }
            }}
            className={
              confirmingAction === "reject" || confirmingAction === "delete"
                ? "bg-destructive hover:bg-destructive/90"
                : ""
            }
          >
            {confirmingAction === "approve"
              ? "Approve"
              : confirmingAction === "reject"
              ? "Reject"
              : "Delete"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
