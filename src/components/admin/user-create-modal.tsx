"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { CheckCircle2, Loader2 } from "lucide-react"

interface UserCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserCreateModal({ open, onOpenChange, onSuccess }: UserCreateModalProps) {
  const [loading, setLoading] = useState(false)
  const [createdUser, setCreatedUser] = useState<{
    fullName: string;
    email: string;
    bonusBalance: number;
    welcomeEmailSent: boolean;
  } | null>(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    country: "",
    bonusBalance: "0",
    createdAt: new Date().toISOString().split('T')[0] // Default to today
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        setCreatedUser({
          fullName: formData.fullName,
          email: formData.email,
          bonusBalance: Number(formData.bonusBalance),
          welcomeEmailSent: data.welcomeEmailSent !== false,
        })
        onSuccess()
        setFormData({ fullName: "", email: "", password: "", country: "", bonusBalance: "0", createdAt: new Date().toISOString().split('T')[0] })
      } else {
        toast({ title: "Error", description: data.message || "Failed to create user", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) setCreatedUser(null)
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        {createdUser ? (
          <>
            <DialogHeader className="items-center text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" aria-hidden="true" />
              <DialogTitle>User Created Successfully</DialogTitle>
              <DialogDescription>
                {createdUser.fullName}&apos;s account has been created.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
              <p><span className="font-medium">Email:</span> {createdUser.email}</p>
              <p>
                <span className="font-medium">Bonus wallet:</span>{" "}
                ${createdUser.bonusBalance.toFixed(2)}
              </p>
              <p className={createdUser.welcomeEmailSent ? "text-muted-foreground" : "font-medium text-destructive"}>
                {createdUser.welcomeEmailSent
                  ? "Welcome instructions were emailed to the user."
                  : "The account was created, but the welcome email could not be sent. Check the email service configuration."}
              </p>
            </div>
            <DialogFooter>
              <Button
                className="w-full"
                onClick={() => {
                  setCreatedUser(null)
                  onOpenChange(false)
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Temporary password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="e.g. United States"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonusBalance">Initial Bonus Wallet Balance ($)</Label>
                <Input
                  id="bonusBalance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.bonusBalance}
                  onChange={(e) => setFormData({ ...formData, bonusBalance: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createdAt">Registration Date (Backdate)</Label>
                <Input
                  id="createdAt"
                  type="date"
                  value={formData.createdAt}
                  onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                  required
                />
                <p className="text-[10px] text-muted-foreground">Allows you to simulate an account created in the past.</p>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Create Account"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
