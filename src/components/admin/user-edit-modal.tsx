"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

interface UserEditModalProps {
  user: {
    id: string | number
    name: string
    email: string
    country: string
    deposit: string
    withdrawal: string
    status: "Active" | "Suspended"
    transactionPin?: string
    totalBonus: number
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserEditModal({ user, open, onOpenChange }: UserEditModalProps) {
  const [formData, setFormData] = useState(
    user ? { ...user, password: "" } : { id: "", name: "", email: "", country: "", deposit: "", withdrawal: "", status: "Active", password: "", transactionPin: "", totalBonus: 0 },
  )
  const [dailyReturn, setDailyReturn] = useState({ amount: "", day: "" })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const token = useSelector((state: RootState) => state.token.token)

  useEffect(() => {
    if (user) {
      setFormData({ ...user, password: "" })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDailyReturnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDailyReturn((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as "Active" | "Suspended" }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.country) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // 1. Update User Details (including Bonus)
      const payload: any = {
        fullName: formData.name,
        email: formData.email,
        country: formData.country,
        status: formData.status,
        transactionPin: formData.transactionPin || "",
        totalBonus: Number(formData.totalBonus) || 0
      }
      if (formData.password && formData.password.trim() !== "") {
        payload.password = formData.password
      }

      const res = await fetch(`/api/admin/users/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to update user")
      }

      // 2. Add Daily Return if provided
      if (dailyReturn.amount && dailyReturn.day) {
        const drRes = await fetch("/api/admin/daily-returns", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            userId: formData.id,
            amount: Number(dailyReturn.amount),
            day: dailyReturn.day
          })
        })
        if (!drRes.ok) {
            toast({ title: "Warning", description: "User updated but daily return failed", variant: "destructive" })
        }
      }

      toast({ title: "Success", description: `User ${formData.name} updated successfully` })
      onOpenChange(false)
      window.location.reload()
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Operation failed", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User & Add Returns</DialogTitle>
          <DialogDescription>Update information, bonuses, and daily returns</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Full name" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="transactionPin">Transaction PIN</Label>
                <Input id="transactionPin" name="transactionPin" value={formData.transactionPin || ""} onChange={handleChange} placeholder="PIN" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="totalBonus" className="text-primary font-bold">Total Bonus ($)</Label>
                <Input id="totalBonus" name="totalBonus" type="number" value={formData.totalBonus} onChange={handleChange} className="border-primary" />
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label className="text-accent font-bold">Add New Daily Return</Label>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="dr_amount" className="text-xs">Amount ($)</Label>
                    <Input id="dr_amount" name="amount" type="number" value={dailyReturn.amount} onChange={handleDailyReturnChange} placeholder="0.00" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="dr_day" className="text-xs">Day Label</Label>
                    <Input id="dr_day" name="day" type="text" value={dailyReturn.day} onChange={handleDailyReturnChange} placeholder="e.g. Day 1" />
                </div>
            </div>
          </div>

          <div className="space-y-2 border-t pt-2">
            <Label htmlFor="password">Set New Password (Optional)</Label>
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? "Saving..." : "Save User Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
