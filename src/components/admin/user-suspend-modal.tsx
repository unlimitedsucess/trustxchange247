"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { Loader2, ShieldAlert } from "lucide-react"

interface UserSuspendModalProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isSuspending: boolean; // true if suspending, false if activating
}

export function UserSuspendModal({ userId, userName, open, onOpenChange, onSuccess, isSuspending }: UserSuspendModalProps) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("Violation of platform terms and conditions.")
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: isSuspending ? reason : "",
          status: isSuspending ? "suspended" : "active"
        })
      })

      const data = await res.json()

      if (data.success) {
        toast({ title: "Success", description: data.message })
        onSuccess()
        onOpenChange(false)
      } else {
        toast({ title: "Error", description: data.message || "Action failed", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className={isSuspending ? "text-destructive" : "text-primary"} />
            {isSuspending ? "Suspend User Account" : "Activate User Account"}
          </DialogTitle>
          <DialogDescription>
            {isSuspending 
              ? `You are about to restrict ${userName}'s access to all financial features.` 
              : `This will restore full platform access for ${userName}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {isSuspending && (
            <div className="space-y-2">
              <Label htmlFor="reason">Suspension Reason (Sent via Email)</Label>
              <Textarea
                id="reason"
                placeholder="Briefly describe why this account is being restricted..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
              />
              <p className="text-[11px] text-muted-foreground bg-muted p-2 rounded">
                 <b>Policy:</b> This reason will be displayed on the user's dashboard and included in their official suspension notice.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              variant={isSuspending ? "destructive" : "default"}
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isSuspending ? "Authorize Suspension" : "Restore Access")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
