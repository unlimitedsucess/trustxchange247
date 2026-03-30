"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Trash2 } from "lucide-react"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
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

export function DepositsTable() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [confirmingAction, setConfirmingAction] = useState<"approve" | "reject" | "delete" | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  
  const token = useSelector((state: RootState) => state.token.token)

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
            paymentMethod: d.paymentMethod || "Crypto",
            date: new Date(d.createdAt).toLocaleDateString(),
            status: d.status === "active" ? "Approved" : d.status === "rejected" ? "Rejected" : d.status === "completed" ? "Completed" : "Pending"
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
    try {
      const res = await fetch(`/api/admin/deposits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "active" })
      })
      if (res.ok) {
        setDeposits(deposits.map((d) => (d.id === id ? { ...d, status: "Approved" } : d)))
        toast({ title: "Success", description: "Deposit approved successfully" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to approve deposit", variant: "destructive" })
    }
    setConfirmingId(null)
    setConfirmingAction(null)
  }

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/deposits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "rejected" })
      })
      if (res.ok) {
        setDeposits(deposits.map((d) => (d.id === id ? { ...d, status: "Rejected" } : d)))
        toast({ title: "Success", description: "Deposit rejected successfully", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to reject deposit", variant: "destructive" })
    }
    setConfirmingId(null)
    setConfirmingAction(null)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/deposits/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setDeposits(deposits.filter((d) => d.id !== id))
        toast({ title: "Success", description: "Deposit deleted permanently" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete deposit", variant: "destructive" })
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
          <CardTitle>Deposit Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">User Name</th>
                  <th className="text-right py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Payment Method</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                  <th className="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">Loading deposits...</td>
                  </tr>
                ) : deposits.length > 0 ? (
                  deposits.map((deposit) => (
                    <tr key={deposit.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{deposit.userName}</td>
                      <td className="text-right py-3 px-4">${deposit.amount.toLocaleString()}</td>
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
                                  setConfirmingId(deposit.id)
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
                                  setConfirmingId(deposit.id)
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
                              setConfirmingId(deposit.id)
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
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">No deposits found.</td>
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
                ? "Approve Deposit?"
                : confirmingAction === "reject"
                ? "Reject Deposit?"
                : "Delete Deposit?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmingAction === "approve"
                ? "This deposit request will be approved and funds will be added to the user account."
                : confirmingAction === "reject"
                ? "This deposit request will be rejected and the user will be notified."
                : "This deposit will be permanently deleted from the database. This action cannot be undone."}
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
